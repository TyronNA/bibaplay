"""Chip giả trên Mac để nói chuyện với robot khi chưa có board: mic + loa của Mac + cửa sổ mặt robot.
Đi đúng giao thức firmware (OTA -> WebSocket hello -> listen auto -> Opus), nên server không phân biệt
được đây là Mac hay ESP32.

  .venv/bin/python mac_device.py                      # nói chuyện với server trên mini-pc
  --ota http://127.0.0.1:8000/xiaozhi/ota/            # server khác
  --wav hoi.wav --out reply.wav --no-face             # tự test: WAV thay mic, ghi file thay loa

Nửa song công: mic TẮT trong lúc robot nói. Mac không có khử vọng (AEC) như chip, mở mic lúc loa
đang phát thì Gemini nghe lại chính giọng nó và tự trả lời mình. Hệ quả: không ngắt lời được.
Lần đầu chạy, macOS hỏi quyền micro cho Terminal — phải cho phép, không thì mic chỉ thu im lặng.
"""
import argparse
import asyncio
import json
import os
import socket
import subprocess
import sys
import threading
import time
import wave

import aiohttp
import opuslib
import sounddevice as sd

SR, FRAME_MS = 16000, 60
N = SR * FRAME_MS // 1000
HEADERS = {"Device-Id": "ma:c0:de:vi:ce:01", "Client-Id": "mac-device-0001"}
FACE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "sandbox", "robot-face", "face")
FACE_PORT = 9999
# chờ thêm sau khi loa phát hết rồi mới mở mic: đuôi tiếng vang trong phòng không lọt vào mic
MIC_GUARD_S = 0.3


class Speaker:
    """Bộ đệm phát: callback của sounddevice chạy ở thread riêng, rút PCM ra từ đây."""

    def __init__(self, rate: int, out_path: str | None):
        self.rate, self.buf, self.lock = rate, bytearray(), threading.Lock()
        self.file = None
        if out_path:                        # tự test: ghi file thay vì phát ra loa
            self.file = wave.open(out_path, "wb")
            self.file.setnchannels(1); self.file.setsampwidth(2); self.file.setframerate(rate)
            self.stream = None
        else:
            self.stream = sd.RawOutputStream(samplerate=rate, channels=1, dtype="int16", callback=self.cb)
            self.stream.start()

    def cb(self, out, frames, t, status):
        n = frames * 2
        with self.lock:
            chunk, self.buf[:] = bytes(self.buf[:n]), self.buf[n:]
        out[:len(chunk)] = chunk
        out[len(chunk):] = bytes(n - len(chunk))

    def play(self, pcm: bytes):
        if self.file:
            self.file.writeframes(pcm)
        else:
            with self.lock:
                self.buf += pcm

    async def drain(self):
        while self.stream is not None:
            with self.lock:
                if not self.buf:
                    return
            await asyncio.sleep(0.05)

    def close(self):
        if self.stream is not None:
            self.stream.stop(); self.stream.close()
        if self.file:
            self.file.close()


class Face:
    def __init__(self, enabled: bool):
        self.proc = None
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        if enabled:
            if not os.path.exists(FACE):
                sys.exit(f"chưa build cửa sổ mặt robot: cd sandbox/robot-face && make -j8 face")
            self.proc = subprocess.Popen([FACE, "--udp", str(FACE_PORT)])

    def send(self, line: str):
        if self.proc:
            self.sock.sendto(line.encode(), ("127.0.0.1", FACE_PORT))

    def close(self):
        if self.proc:
            self.proc.terminate()


def mic_source(loop, q: asyncio.Queue, wav_path: str | None):
    """Mỗi 60 ms đẩy 1 frame PCM 16k vào q. Trả về hàm dừng."""
    if wav_path:
        with wave.open(wav_path) as w:
            assert w.getframerate() == SR and w.getnchannels() == 1 and w.getsampwidth() == 2, "cần WAV 16 kHz mono"
            pcm = w.readframes(w.getnframes())
        frames = [pcm[i:i + N * 2].ljust(N * 2, b"\0") for i in range(0, len(pcm), N * 2)]

        async def feed():
            for f in frames:                # sau file là im lặng mãi, như mic trong phòng yên
                await q.put(f)
                await asyncio.sleep(FRAME_MS / 1000)
            while True:
                await q.put(bytes(N * 2))
                await asyncio.sleep(FRAME_MS / 1000)
        task = asyncio.ensure_future(feed())
        return task.cancel

    def cb(indata, frames, t, status):
        loop.call_soon_threadsafe(q.put_nowait, bytes(indata))
    stream = sd.RawInputStream(samplerate=SR, channels=1, dtype="int16", blocksize=N, callback=cb)
    stream.start()
    return lambda: (stream.stop(), stream.close())


async def main(a) -> int:
    face = Face(not a.no_face)
    loop = asyncio.get_running_loop()
    async with aiohttp.ClientSession() as http:
        async with http.post(a.ota, json={"board": {"type": "mac-device"}}, headers=HEADERS) as r:
            cfg = (await r.json())["websocket"]
        async with http.ws_connect(cfg["url"], headers={**HEADERS, "Authorization": f"Bearer {cfg['token']}",
                                                        "Protocol-Version": str(cfg["version"])}) as ws:
            await ws.send_str(json.dumps({"type": "hello", "version": 1, "transport": "websocket",
                                          "features": {"mcp": True},
                                          "audio_params": {"format": "opus", "sample_rate": SR,
                                                           "channels": 1, "frame_duration": FRAME_MS}}))
            hello = json.loads((await asyncio.wait_for(ws.receive(), 10)).data)
            sid, rate = hello["session_id"], hello["audio_params"]["sample_rate"]
            enc, dec = opuslib.Encoder(SR, 1, opuslib.APPLICATION_VOIP), opuslib.Decoder(rate, 1)
            spk = Speaker(rate, a.out)
            q: asyncio.Queue = asyncio.Queue()
            stop_mic = mic_source(loop, q, a.wav)
            state = {"listening": False, "turns": 0}

            async def listen():
                await ws.send_str(json.dumps({"session_id": sid, "type": "listen", "state": "start", "mode": "auto"}))
                state["listening"] = True
                face.send("title ARES · đang nghe")
                print("🎤 đang nghe… (Ctrl+C để thoát)")

            async def pump_mic():
                while True:
                    f = await q.get()
                    if state["listening"]:
                        await ws.send_bytes(enc.encode(f, N))

            await listen()
            mic_task = asyncio.create_task(pump_mic())
            try:
                async for m in ws:
                    if m.type == aiohttp.WSMsgType.BINARY:
                        spk.play(dec.decode(m.data, rate * FRAME_MS // 1000))
                        continue
                    if m.type != aiohttp.WSMsgType.TEXT:
                        break
                    msg = json.loads(m.data)
                    t = msg.get("type")
                    if t == "stt":
                        print(f"Bạn : {msg['text']}")
                    elif t == "llm" and msg.get("emotion"):
                        face.send(f"emo {msg['emotion']}")
                    elif t == "tts" and msg.get("state") == "start":
                        state["listening"] = False
                        face.send("title ARES · đang nói")
                    elif t == "tts" and msg.get("state") == "sentence_start":
                        print(f"ARES: {msg['text']}")
                    elif t == "tts" and msg.get("state") == "stop":
                        await spk.drain()
                        await asyncio.sleep(MIC_GUARD_S)
                        state["turns"] += 1
                        if a.wav and state["turns"] >= 1:   # tự test: 1 lượt là đủ
                            break
                        await listen()
                    elif t == "alert":
                        print(f"⚠️  {msg.get('status')}: {msg.get('message')}")
                        face.send(f"emo {msg.get('emotion', 'sad')}")
            finally:
                mic_task.cancel()
                stop_mic()
                spk.close()
                face.close()
    return 0


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--ota", default="http://127.0.0.1:8000/xiaozhi/ota/")
    p.add_argument("--wav", help="dùng file WAV 16 kHz mono thay mic (tự test)")
    p.add_argument("--out", help="ghi câu trả lời ra WAV thay vì phát loa")
    p.add_argument("--no-face", action="store_true", help="không mở cửa sổ mặt robot")
    try:
        sys.exit(asyncio.run(main(p.parse_args())))
    except KeyboardInterrupt:
        print("\nbye")
