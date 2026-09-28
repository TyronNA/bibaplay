"""Thiết bị giả: đi đúng luồng firmware (OTA -> WebSocket hello -> listen -> Opus) để test server
khi chưa có board. Nhận biết chế độ server qua sample_rate trong hello (16k = echo, 24k = Gemini).

  .venv/bin/python fake_device.py                    # kịch bản tự kiểm, thoát 0 = PASS
                                                     #   echo: nói 1.2 s, phải được phát lại
                                                     #   Gemini: chạy với mock_gemini.py (2 lượt, lượt 2 bị ngắt)
  .venv/bin/python fake_device.py --wav hoi.wav      # gửi giọng thật (WAV 16 kHz mono), lưu câu trả lời
                                                     #   ra reply.wav — dùng với Gemini thật
  --ota http://127.0.0.1:8000/xiaozhi/ota/           # server khác
"""
import argparse
import asyncio
import json
import math
import sys
import time
import wave

import aiohttp
import opuslib

SR, FRAME_MS = 16000, 60
N = SR * FRAME_MS // 1000
HEADERS = {"Device-Id": "aa:bb:cc:dd:ee:ff", "Client-Id": "fake-0001"}


def tone_frames(speech: int, silence: int) -> list[bytes]:
    """PCM giả: sóng 220 Hz biên độ ~8000 = "nói", sau đó im lặng."""
    out = []
    for i in range(speech + silence):
        amp = 8000 if i < speech else 0
        out.append(b"".join(int(amp * math.sin(2 * math.pi * 220 * (i * N + k) / SR)).to_bytes(2, "little", signed=True)
                            for k in range(N)))
    return out


def wav_frames(path: str) -> list[bytes]:
    with wave.open(path) as w:
        assert w.getframerate() == SR and w.getnchannels() == 1 and w.getsampwidth() == 2, \
            "cần WAV 16 kHz mono 16-bit (vd: ffmpeg -i in -ar 16000 -ac 1 out.wav)"
        pcm = w.readframes(w.getnframes())
    pcm += bytes(-len(pcm) % (N * 2)) + bytes(N * 2 * 15)   # đệm 0.9 s im lặng cho VAD biết hết câu
    return [pcm[i:i + N * 2] for i in range(0, len(pcm), N * 2)]


# Tool giả giống cách firmware ares-bread đăng ký (bài 17.2): Property của xiaozhi chỉ có bool/int/string + min/max/default.
TOOLS = [{"name": "self.robot.move", "description": "Cho robot chạy một đoạn ngắn rồi tự dừng.",
          "inputSchema": {"type": "object", "properties": {
              "huong": {"type": "string"},
              "toc_do": {"type": "integer", "minimum": 0, "maximum": 70, "default": 50},
              "thoi_gian_ms": {"type": "integer", "minimum": 100, "maximum": 3000, "default": 800}},
              "required": ["huong"]}}]


class Device:
    def __init__(self, ws, sid: str, out_rate: int):
        self.ws, self.sid = ws, sid
        self.calls = []                     # tools/call server đã gọi xuống chip
        self.enc = opuslib.Encoder(SR, 1, opuslib.APPLICATION_VOIP)
        self.dec = opuslib.Decoder(out_rate, 1)
        self.out_samples = out_rate * FRAME_MS // 1000

    async def say(self, frames: list[bytes], realtime: bool):
        await self.ws.send_str(json.dumps({"session_id": self.sid, "type": "listen", "state": "start", "mode": "auto"}))
        for f in frames:
            await self.ws.send_bytes(self.enc.encode(f, N))
            if realtime:                    # Gemini thật cần nhịp thật để VAD nhận ra khoảng lặng
                await asyncio.sleep(FRAME_MS / 1000)
        self.said_at = time.monotonic()

    async def turn(self, timeout: float) -> tuple[list[dict], bytes]:
        """Nhận tới khi tts stop. Trả (danh sách JSON, PCM đã giải mã)."""
        texts, pcm = [], bytearray()
        while True:
            m = await asyncio.wait_for(self.ws.receive(), timeout)
            if m.type == aiohttp.WSMsgType.BINARY:
                if not pcm:
                    print(f"  (tiếng đầu tiên sau {time.monotonic() - self.said_at:.2f} s kể từ lúc nói xong)")
                pcm += self.dec.decode(m.data, self.out_samples)
                continue
            if m.type != aiohttp.WSMsgType.TEXT:
                raise RuntimeError(f"server đóng kết nối: {m.type} {m.data}")
            msg = json.loads(m.data)
            if msg.get("type") == "mcp":        # server hỏi tool của chip như firmware thật trả lời
                await self.mcp(msg.get("payload") or {})
                continue
            texts.append(msg)
            print("  <-", {k: v for k, v in msg.items() if k != "session_id"})
            if msg.get("type") == "tts" and msg.get("state") == "stop":
                return texts, bytes(pcm)


    async def mcp(self, p: dict):
        method, rid = p.get("method"), p.get("id")
        print("  mcp <-", method, p.get("params"))
        if method == "initialize":
            res = {"protocolVersion": "2024-11-05", "capabilities": {"tools": {}},
                   "serverInfo": {"name": "fake", "version": "0"}}
        elif method == "tools/list":
            res = {"tools": TOOLS, "nextCursor": ""}
        elif method == "tools/call":
            self.calls.append(p.get("params") or {})
            res = {"content": [{"type": "text", "text": "true"}], "isError": False}
        else:
            await self.ws.send_str(json.dumps({"session_id": self.sid, "type": "mcp", "payload": {
                "jsonrpc": "2.0", "id": rid, "error": {"code": -32601, "message": f"Method not implemented: {method}"}}}))
            return
        await self.ws.send_str(json.dumps({"session_id": self.sid, "type": "mcp",
                                           "payload": {"jsonrpc": "2.0", "id": rid, "result": res}}))


def kinds(texts):
    return [(t["type"], t.get("state")) for t in texts]


async def main(a) -> int:
    async with aiohttp.ClientSession() as http:
        async with http.post(a.ota, json={"board": {"type": "fake"}}, headers=HEADERS) as r:
            assert r.status == 200, f"OTA status {r.status}"
            cfg = (await r.json())["websocket"]
        print("OTA ->", cfg)
        # OTA trả IP LAN; test cục bộ thì nối qua đúng host đã gọi OTA
        url = cfg["url"].replace(cfg["url"].split("/")[2], a.ota.split("/")[2])
        async with http.ws_connect(url, headers={**HEADERS, "Authorization": f"Bearer {cfg['token']}",
                                                 "Protocol-Version": str(cfg["version"])}) as ws:
            await ws.send_str(json.dumps({"type": "hello", "version": 1, "transport": "websocket",
                                          "features": {"mcp": True},
                                          "audio_params": {"format": "opus", "sample_rate": SR,
                                                           "channels": 1, "frame_duration": FRAME_MS}}))
            hello = json.loads((await asyncio.wait_for(ws.receive(), 10)).data)  # firmware chờ đúng 10 s
            assert hello["type"] == "hello" and hello["transport"] == "websocket", hello
            rate = hello["audio_params"]["sample_rate"]
            print("hello <-", hello)
            dev = Device(ws, hello["session_id"], rate)

            if a.wav:
                await dev.say(wav_frames(a.wav), realtime=True)
                # chip thật gửi mic liên tục cả lúc im lặng; ngừng gửi thì VAD phía Gemini không
                # thấy khoảng lặng nên không biết người nói đã dứt câu
                silence = dev.enc.encode(bytes(N * 2), N)
                async def keep_silence():
                    while True:
                        await ws.send_bytes(silence)
                        await asyncio.sleep(FRAME_MS / 1000)
                filler = asyncio.create_task(keep_silence())
                try:
                    texts, pcm = await dev.turn(timeout=30)
                finally:
                    filler.cancel()
                with wave.open("reply.wav", "wb") as w:
                    w.setnchannels(1); w.setsampwidth(2); w.setframerate(rate); w.writeframes(pcm)
                print(f"câu trả lời: {len(pcm) / 2 / rate:.1f} s -> reply.wav")
                return 0

            if rate == 16000:               # echo
                await dev.say(tone_frames(20, 15), realtime=False)
                texts, pcm = await dev.turn(timeout=10)
                sec = len(pcm) / 2 / rate
                ok = kinds(texts)[:3] == [("stt", None), ("llm", None), ("tts", "start")] and \
                    kinds(texts)[-1] == ("tts", "stop") and 1.2 <= sec <= 2.1
                print(f"echo: nhận lại {sec:.2f} s audio (đã nói 1.2 s)")
            else:                           # Gemini (kịch bản mock_gemini.py)
                print("lượt 1:")
                await dev.say(tone_frames(20, 15), realtime=False)
                t1, pcm1 = await dev.turn(timeout=10)
                k1 = kinds(t1)
                subs = [t["text"] for t in t1 if t.get("state") == "sentence_start"]
                emo = [t.get("emotion") for t in t1 if t["type"] == "llm"]
                sec1 = len(pcm1) / 2 / rate
                ok1 = (("stt", None) in k1 and k1.index(("stt", None)) < k1.index(("tts", "start"))
                       and emo == ["happy"] and subs == ["Chào bạn!", "Mình là ARES."]
                       and k1[-1] == ("tts", "stop") and 1.2 <= sec1 <= 1.3)
                print(f"  audio {sec1:.2f} s (mock gửi 1.2 s), phụ đề {subs}, cảm xúc {emo} -> {'ok' if ok1 else 'SAI'}")
                ok_chip = [c.get("name") for c in dev.calls] == ["self.robot.move"] and dev.calls[0]["arguments"].get("huong") == "tien"
                print(f"  tool của chip được gọi: {dev.calls} -> {'ok' if ok_chip else 'SAI'}")
                ok1 = ok1 and ok_chip

                print("lượt 2 (bị ngắt lời):")
                await dev.say(tone_frames(20, 5), realtime=False)
                t2, pcm2 = await dev.turn(timeout=10)
                sec2 = len(pcm2) / 2 / rate
                # mock gửi 1.2 s rồi 0.4 s sau interrupted: phải dừng giữa chừng (~0.4-0.6 s), không phát hết
                ok2 = kinds(t2)[0] == ("tts", "start") and kinds(t2)[-1] == ("tts", "stop") and 0.2 <= sec2 <= 0.8
                print(f"  audio {sec2:.2f} s / 1.2 s trước khi dừng -> {'ok' if ok2 else 'SAI'}")
                ok = ok1 and ok2
    print("PASS" if ok else "FAIL")
    return 0 if ok else 1


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--ota", default="http://127.0.0.1:8000/xiaozhi/ota/")
    p.add_argument("--wav")
    sys.exit(asyncio.run(main(p.parse_args())))
