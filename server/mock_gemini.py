"""Gemini Live giả để test app.py khi chưa có API key. Chỉ mô phỏng phần giao thức app.py dùng:
setup -> setupComplete, nhận realtimeInput audio, trả transcript / toolCall / audio 24 kHz.

Kịch bản theo lượt (mỗi lượt kích hoạt khi đã nhận ~1 s audio có tiếng):
  lượt 1: inputTranscription + toolCall set_emotion + 1.2 s audio + outputTranscription + turnComplete
  lượt 2: chỉ chạy nếu lượt 1 đã nhận toolResponse; gửi 1.2 s audio, 0.4 s sau thì interrupted
          (người nói chen ngang lúc robot đang nói)

  .venv/bin/python mock_gemini.py [--port 8001]
"""
import argparse
import asyncio
import base64
import json
import logging
import math

from aiohttp import WSMsgType, web

log = logging.getLogger("mock")
RATE = 24000


def tone(sec: float, hz: int) -> bytes:
    n = int(RATE * sec)
    return b"".join(int(6000 * math.sin(2 * math.pi * hz * i / RATE)).to_bytes(2, "little", signed=True)
                    for i in range(n))


async def handler(request):
    ws = web.WebSocketResponse()
    await ws.prepare(request)
    assert request.query.get("key"), "thiếu ?key="
    turn, loud_bytes, tool_ok = 0, 0, False

    async def send(obj):
        await ws.send_str(json.dumps(obj))

    async for m in ws:
        if m.type != WSMsgType.TEXT:
            continue
        msg = json.loads(m.data)
        if "setup" in msg:
            s = msg["setup"]
            assert s["model"].startswith("models/"), s["model"]
            assert s["generationConfig"]["responseModalities"] == ["AUDIO"]
            log.info("setup model=%s", s["model"])
            await send({"setupComplete": {}})
        elif "toolResponse" in msg:
            r = msg["toolResponse"]["functionResponses"][0]
            tool_ok = r["id"] == "call-1" and r["response"]["result"] == "ok"
            log.info("toolResponse %s -> ok=%s", r, tool_ok)
        elif "realtimeInput" in msg and "audio" in msg["realtimeInput"]:
            a = msg["realtimeInput"]["audio"]
            assert a["mimeType"] == "audio/pcm;rate=16000", a["mimeType"]
            pcm = base64.b64decode(a["data"])
            peak = max(abs(int.from_bytes(pcm[i:i + 2], "little", signed=True)) for i in range(0, len(pcm), 2))
            if peak > 2000:
                loud_bytes += len(pcm)
            if loud_bytes < 16000 * 2:      # chờ đủ ~1 s tiếng nói
                continue
            loud_bytes = 0
            turn += 1
            log.info("lượt %d", turn)
            if turn == 1:
                await send({"serverContent": {"inputTranscription": {"text": "xin chào"}}})
                await send({"toolCall": {"functionCalls": [
                    {"id": "call-1", "name": "set_emotion", "args": {"emotion": "happy"}}]}})
                audio = tone(1.2, 440)
                for i in range(0, len(audio), 9600):
                    await send({"serverContent": {"modelTurn": {"parts": [{"inlineData": {
                        "mimeType": "audio/pcm;rate=24000",
                        "data": base64.b64encode(audio[i:i + 9600]).decode()}}]}}})
                await send({"serverContent": {"outputTranscription": {"text": "Chào bạn! "}}})
                await send({"serverContent": {"outputTranscription": {"text": "Mình là ARES."}}})
                await send({"serverContent": {"generationComplete": True}})
                await send({"serverContent": {"turnComplete": True}})
            elif turn == 2:
                if not tool_ok:
                    await ws.close(code=1008, message=b"no toolResponse")
                    return ws
                await send({"serverContent": {"modelTurn": {"parts": [{"inlineData": {
                    "mimeType": "audio/pcm;rate=24000", "data": base64.b64encode(tone(1.2, 330)).decode()}}]}}})
                await asyncio.sleep(0.4)
                await send({"serverContent": {"interrupted": True}})
    return ws


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--port", type=int, default=8001)
    a = p.parse_args()
    logging.basicConfig(level=logging.INFO, format="%(asctime)s mock %(message)s", datefmt="%H:%M:%S")
    app = web.Application()
    app.router.add_get("/ws", handler)
    web.run_app(app, host="127.0.0.1", port=a.port, print=None)
