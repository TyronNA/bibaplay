"""Server riêng cho firmware xiaozhi — thay xiaozhi.me.

Hai endpoint trên cùng một cổng:
  POST /xiaozhi/ota/  thiết bị gọi lúc khởi động (CONFIG_OTA_URL); trả về địa chỉ WebSocket
  GET  /xiaozhi/v1/   WebSocket nói chuyện, giao thức theo xiaozhi-esp32/docs/websocket.md

Có GEMINI_API_KEY: mỗi kết nối thiết bị = một phiên Gemini Live (nghe + nghĩ + nói trong một model).
Không có key: chế độ ECHO — thu câu bạn nói, hết câu thì phát lại (để test đường truyền).

  GEMINI_API_KEY=... .venv/bin/python app.py [--port 8000]
"""
import argparse
import asyncio
import base64
import json
import logging
import os
import re
import socket
import time
import uuid

import aiohttp
import opuslib
from aiohttp import WSMsgType, web

log = logging.getLogger("server")

IN_RATE = 16000         # thiết bị luôn gửi 16 kHz mono (GetHelloMessage)
FRAME_MS = 60           # OPUS_FRAME_DURATION_MS
IN_SAMPLES = IN_RATE * FRAME_MS // 1000
GEMINI_RATE = 24000     # Live API luôn trả PCM 24 kHz

# VAD kiểu năng lượng cho chế độ echo; Gemini tự có VAD
SPEECH_RMS = 500        # biên độ int16; tiếng ồn phòng thường < 200
END_SILENCE_MS = 700    # im lặng bấy lâu sau khi đã có tiếng nói = hết câu
MAX_UTTERANCE_MS = 15000

GEMINI_WS = ("wss://generativelanguage.googleapis.com/ws/"
             "google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.8-live")
GEMINI_VOICE = os.environ.get("GEMINI_VOICE", "Kore")
# Tính cách robot. Dặn nói ngắn vì loa nhỏ và người nghe phải chờ.
SYSTEM_PROMPT = os.environ.get("ARES_PROMPT", (
    "Bạn là ARES, một robot trợ lý nhỏ trên bàn làm việc. Luôn trả lời bằng tiếng Việt, "
    "ngắn gọn 1-3 câu, giọng thân thiện, hơi tinh nghịch. "
    "Mỗi lượt trả lời, gọi hàm set_emotion MỘT lần để đổi nét mặt cho hợp với câu trả lời."))
# phải khớp tên trong firmware/boards/ares-bread/robot_face.c
EMOTIONS = ["neutral", "happy", "sad", "angry", "surprised", "thinking", "sleepy", "winking", "confused"]


def lan_ip() -> str:
    """IP LAN của máy này — thiết bị phải gọi được địa chỉ này, không phải 127.0.0.1."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))   # UDP connect không gửi gói, chỉ để OS chọn card mạng
        return s.getsockname()[0]
    finally:
        s.close()


def rms(pcm: bytes) -> float:
    n = len(pcm) // 2
    if not n:
        return 0.0
    total = 0
    for i in range(0, n * 2, 2):
        v = int.from_bytes(pcm[i:i + 2], "little", signed=True)
        total += v * v
    return (total / n) ** 0.5


async def ota(request: web.Request) -> web.Response:
    body = await request.text()
    info = {}
    try:
        info = json.loads(body) if body else {}
    except json.JSONDecodeError:
        pass
    log.info("OTA check device=%s client=%s board=%s",
             request.headers.get("Device-Id"), request.headers.get("Client-Id"),
             (info.get("board") or {}).get("type"))
    host = request.app["public_host"]
    # Không trả "activation" -> firmware bỏ qua bước nhập mã kích hoạt.
    # Không trả "mqtt" -> firmware chọn WebsocketProtocol (application.cc).
    # Không trả "firmware" -> không OTA; chưa có server phát firmware.
    return web.json_response({
        "websocket": {"url": f"ws://{host}/xiaozhi/v1/", "token": request.app["token"], "version": 1},
        "server_time": {"timestamp": int(time.time() * 1000), "timezone_offset": 7 * 60},
    })


class Session:
    """Một kết nối thiết bị. Lớp con quyết định trả lời thế nào."""
    out_rate = IN_RATE

    def __init__(self, ws: web.WebSocketResponse):
        self.ws = ws
        self.id = uuid.uuid4().hex[:12]
        self.decoder = opuslib.Decoder(IN_RATE, 1)
        self.listening = False

    async def send(self, **msg):
        msg.setdefault("session_id", self.id)
        if not self.ws.closed:
            await self.ws.send_str(json.dumps(msg, ensure_ascii=False))

    async def on_text(self, msg: dict):
        t = msg.get("type")
        if t == "hello":
            # sample_rate ở đây là tốc độ server GỬI xuống; chip giải mã theo số này
            await self.send(type="hello", transport="websocket",
                            audio_params={"format": "opus", "sample_rate": self.out_rate,
                                          "channels": 1, "frame_duration": FRAME_MS})
        elif t == "listen":
            state = msg.get("state")
            log.info("[%s] listen %s mode=%s", self.id, state, msg.get("mode"))
            if state == "start":
                self.listening = True
                await self.on_listen_start()
            elif state == "stop":           # chế độ manual: người dùng nhả nút = hết câu
                self.listening = False
                await self.on_listen_stop()
        elif t == "abort":
            log.info("[%s] abort %s", self.id, msg.get("reason"))
            await self.on_abort()
        else:
            log.info("[%s] <- %s", self.id, msg)

    async def on_listen_start(self): ...
    async def on_listen_stop(self): ...
    async def on_abort(self): ...
    async def on_audio(self, frame: bytes): ...
    async def close(self): ...


class EchoSession(Session):
    def __init__(self, ws):
        super().__init__(ws)
        self.reset()

    def reset(self):
        self.frames: list[bytes] = []
        self.heard_speech = False
        self.silence_ms = 0

    async def on_listen_start(self):
        self.reset()

    async def on_listen_stop(self):
        await self.end_of_utterance()

    async def on_audio(self, frame: bytes):
        if not self.listening:
            return
        self.frames.append(frame)
        loud = rms(self.decoder.decode(frame, IN_SAMPLES)) >= SPEECH_RMS
        if loud:
            self.heard_speech, self.silence_ms = True, 0
        elif self.heard_speech:
            self.silence_ms += FRAME_MS
        too_long = len(self.frames) * FRAME_MS >= MAX_UTTERANCE_MS
        if (self.heard_speech and self.silence_ms >= END_SILENCE_MS) or too_long:
            self.listening = False          # frame tới trong lúc nói bị bỏ, như thiết bị làm
            await self.end_of_utterance()

    async def end_of_utterance(self):
        frames, spoke = self.frames, self.heard_speech
        self.reset()
        if not spoke:
            log.info("[%s] không nghe thấy tiếng nói, bỏ qua", self.id)
            return
        tail = END_SILENCE_MS // FRAME_MS   # cắt đuôi im lặng để phát lại cho gọn
        frames = frames[:-tail] if len(frames) > tail else frames
        log.info("[%s] hết câu: %d frame = %.1f s", self.id, len(frames), len(frames) * FRAME_MS / 1000)
        await self.send(type="stt", text=f"(echo {len(frames) * FRAME_MS / 1000:.1f}s)")
        await self.send(type="llm", emotion="happy", text="😀")
        await self.send(type="tts", state="start")
        await self.send(type="tts", state="sentence_start", text="Phát lại câu vừa nói")
        # Gửi nhanh hơn thời gian thực một chút; gửi dồn một lần thì hàng đợi phát trên chip có giới hạn.
        for f in frames:
            await self.ws.send_bytes(f)
            await asyncio.sleep(FRAME_MS / 1000 * 0.9)
        await self.send(type="tts", state="stop")


class GeminiSession(Session):
    """Cầu nối thiết bị <-> Gemini Live. Một phiên Gemini sống suốt kết nối để nhớ ngữ cảnh."""
    out_rate = GEMINI_RATE
    OUT_SAMPLES = GEMINI_RATE * FRAME_MS // 1000

    def __init__(self, ws, http: aiohttp.ClientSession, key: str, url: str):
        super().__init__(ws)
        self.http, self.key, self.url = http, key, url
        self.encoder = opuslib.Encoder(GEMINI_RATE, 1, opuslib.APPLICATION_VOIP)
        self.gws = None                     # WebSocket tới Gemini
        self.reader = None
        self.opening = asyncio.Lock()
        self.pcm = bytearray()              # PCM 24k chưa đủ 1 frame Opus
        self.out: asyncio.Queue = asyncio.Queue()   # việc chờ gửi xuống chip, xem send_loop
        self.sender = asyncio.create_task(self.send_loop())
        self.speaking = False               # đã gửi tts start, chưa gửi tts stop
        self.turn_open = False              # Gemini đang trả lời lượt này
        self.heard = ""                     # transcript câu người nói
        self.said = ""                      # transcript câu robot nói, chưa đủ câu để hiện

    async def ensure_gemini(self):
        async with self.opening:
            if self.gws is not None and not self.gws.closed:
                return
            self.gws = await self.http.ws_connect(f"{self.url}?key={self.key}", heartbeat=20)
            await self.gws.send_str(json.dumps({"setup": {
                "model": f"models/{GEMINI_MODEL}",
                "generationConfig": {
                    "responseModalities": ["AUDIO"],
                    "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": GEMINI_VOICE}}},
                },
                "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
                "inputAudioTranscription": {},
                "outputAudioTranscription": {},
                "tools": [{"functionDeclarations": [{
                    "name": "set_emotion",
                    "description": "Đổi nét mặt robot trên màn hình.",
                    "parameters": {"type": "OBJECT", "properties": {
                        "emotion": {"type": "STRING", "enum": EMOTIONS}}, "required": ["emotion"]},
                }]}],
            }}))
            first = await asyncio.wait_for(self.gws.receive(), 15)
            msg = {}
            if first.type in (WSMsgType.TEXT, WSMsgType.BINARY):
                msg = json.loads(first.data)
            if "setupComplete" not in msg:
                why = first.data if first.type != WSMsgType.CLOSE else f"close {self.gws.close_code} {first.extra}"
                await self.gws.close()
                self.gws = None
                raise RuntimeError(f"Gemini setup thất bại: {str(why)[:300]}")
            log.info("[%s] Gemini Live sẵn sàng (%s, giọng %s)", self.id, GEMINI_MODEL, GEMINI_VOICE)
            self.reader = asyncio.create_task(self.read_loop(self.gws))

    async def on_listen_start(self):
        try:
            await self.ensure_gemini()
        except Exception as e:              # để chip báo lỗi thay vì treo ở "đang nghe"
            log.error("[%s] %s", self.id, e)
            await self.send(type="alert", status="Lỗi", message="Không nối được Gemini", emotion="sad")

    async def on_listen_stop(self):
        if self.gws is not None and not self.gws.closed:
            await self.gws.send_str(json.dumps({"realtimeInput": {"audioStreamEnd": True}}))

    async def on_abort(self):
        await self.cut_speech()

    async def on_audio(self, frame: bytes):
        if not self.listening or self.gws is None or self.gws.closed:
            return
        pcm = self.decoder.decode(frame, IN_SAMPLES)
        await self.gws.send_str(json.dumps({"realtimeInput": {"audio": {
            "data": base64.b64encode(pcm).decode(), "mimeType": f"audio/pcm;rate={IN_RATE}"}}}))

    # ---- Gemini -> thiết bị ----

    async def read_loop(self, gws):
        try:
            async for m in gws:
                if m.type in (WSMsgType.TEXT, WSMsgType.BINARY):
                    await self.on_gemini(json.loads(m.data))
        except asyncio.CancelledError:
            raise
        except Exception:
            log.exception("[%s] đọc Gemini lỗi", self.id)
        # phiên Gemini có giới hạn thời lượng; lần listen start sau sẽ mở phiên mới
        log.info("[%s] Gemini đóng kết nối (code=%s)", self.id, gws.close_code)
        self.turn_open = False
        await self.out.put(("stop", None))

    async def on_gemini(self, msg: dict):
        if log.isEnabledFor(logging.DEBUG):
            sc = msg.get("serverContent") or {}
            log.debug("[%s] gemini <- %s %s", self.id, list(msg), list(sc) if sc else "")
        if "toolCall" in msg:
            await self.on_tool_call(msg["toolCall"])
        if "goAway" in msg:
            log.info("[%s] Gemini sắp đóng phiên: %s", self.id, msg["goAway"])
        sc = msg.get("serverContent")
        if not sc:
            return
        if "inputTranscription" in sc:
            self.heard += sc["inputTranscription"].get("text", "")
        if sc.get("interrupted"):           # người nói chen ngang: bỏ phần chưa phát
            log.info("[%s] bị ngắt lời", self.id)
            await self.cut_speech()
            return
        for part in (sc.get("modelTurn") or {}).get("parts", []):
            data = (part.get("inlineData") or {}).get("data")
            if data:
                await self.on_model_audio(base64.b64decode(data))
        if "outputTranscription" in sc:
            self.said += sc["outputTranscription"].get("text", "")
            await self.flush_sentences(final=False)
        if sc.get("turnComplete"):
            await self.flush_sentences(final=True)
            self.flush_pcm(pad=True)
            self.turn_open = False
            await self.out.put(("stop", None))

    async def on_tool_call(self, call: dict):
        responses = []
        for fc in call.get("functionCalls", []):
            ok = False
            if fc.get("name") == "set_emotion":
                emo = (fc.get("args") or {}).get("emotion", "neutral")
                ok = emo in EMOTIONS
                log.info("[%s] set_emotion %s", self.id, emo)
                await self.send(type="llm", emotion=emo if ok else "neutral")
            responses.append({"id": fc.get("id"), "name": fc.get("name"),
                              "response": {"result": "ok" if ok else "unknown"}})
        if responses and self.gws is not None and not self.gws.closed:
            await self.gws.send_str(json.dumps({"toolResponse": {"functionResponses": responses}}))

    async def on_model_audio(self, pcm: bytes):
        if not self.turn_open:
            self.turn_open = True
            if self.heard.strip():
                await self.send(type="stt", text=self.heard.strip())
            self.heard = ""
            # tts start phải tới chip trước frame đầu: ở trạng thái listening chip bỏ mọi frame nhận
            await self.out.put(("start", None))
        self.pcm += pcm
        self.flush_pcm(pad=False)

    def flush_pcm(self, pad: bool):
        n = self.OUT_SAMPLES * 2
        if pad and len(self.pcm) % n:
            self.pcm += bytes(n - len(self.pcm) % n)
        while len(self.pcm) >= n:
            chunk, self.pcm = bytes(self.pcm[:n]), self.pcm[n:]
            self.out.put_nowait(("audio", self.encoder.encode(chunk, self.OUT_SAMPLES)))

    async def flush_sentences(self, final: bool):
        """Phụ đề: gửi từng câu hoàn chỉnh (hoặc phần còn lại khi hết lượt)."""
        while True:
            m = re.search(r"[.!?…](\s|$)", self.said) if not final else re.search(r"[.!?…]\s", self.said)
            if not m and not (final and self.said.strip()):
                return
            cut = m.end() if m else len(self.said)
            text, self.said = self.said[:cut].strip(), self.said[cut:]
            if text:
                await self.out.put(("sentence", text))

    async def cut_speech(self):
        """Bỏ mọi thứ chưa phát rồi kết thúc lượt nói trên chip."""
        self.pcm.clear()
        self.said = ""
        self.turn_open = False
        while not self.out.empty():
            self.out.get_nowait()
        await self.out.put(("stop", None))

    async def send_loop(self):
        """Task duy nhất ghi xuống chip: giữ đúng thứ tự start -> audio/phụ đề -> stop và nhịp
        ~thời gian thực (Gemini trả audio nhanh hơn thời gian thực; dồn một lần thì hàng đợi
        phát trên chip có giới hạn)."""
        try:
            while True:
                kind, val = await self.out.get()
                if self.ws.closed:
                    return
                if kind == "start" and not self.speaking:
                    self.speaking = True
                    await self.send(type="tts", state="start")
                elif kind == "sentence" and self.speaking:
                    await self.send(type="tts", state="sentence_start", text=val)
                elif kind == "audio" and self.speaking:
                    await self.ws.send_bytes(val)
                    await asyncio.sleep(FRAME_MS / 1000 * 0.9)
                elif kind == "stop" and self.speaking:
                    self.speaking = False
                    await self.send(type="tts", state="stop")
        except asyncio.CancelledError:
            pass
        except Exception:
            log.exception("[%s] gửi xuống chip lỗi", self.id)

    async def close(self):
        self.sender.cancel()
        if self.gws is not None:
            await self.gws.close()
        if self.reader is not None:
            self.reader.cancel()


async def websocket(request: web.Request) -> web.WebSocketResponse:
    app = request.app
    want = app["token"]
    auth = request.headers.get("Authorization", "")
    if want and auth != f"Bearer {want}":
        log.warning("sai token: %r", auth)
        raise web.HTTPUnauthorized()
    ws = web.WebSocketResponse(heartbeat=30)
    await ws.prepare(request)
    if app["gemini_key"]:
        s = GeminiSession(ws, app["http"], app["gemini_key"], app["gemini_url"])
    else:
        s = EchoSession(ws)
    log.info("[%s] connect device=%s protocol=%s mode=%s", s.id, request.headers.get("Device-Id"),
             request.headers.get("Protocol-Version"), type(s).__name__)
    try:
        async for m in ws:
            if m.type == WSMsgType.TEXT:
                try:
                    await s.on_text(json.loads(m.data))
                except json.JSONDecodeError:
                    log.warning("[%s] JSON hỏng: %r", s.id, m.data[:200])
            elif m.type == WSMsgType.BINARY:
                await s.on_audio(m.data)
    finally:
        await s.close()
        log.info("[%s] disconnect", s.id)
    return ws


def make_app(public_host: str, token: str, gemini_key: str = "", gemini_url: str = GEMINI_WS) -> web.Application:
    app = web.Application()
    app["public_host"], app["token"] = public_host, token
    app["gemini_key"], app["gemini_url"] = gemini_key, gemini_url

    async def http_ctx(app):
        app["http"] = aiohttp.ClientSession()
        yield
        await app["http"].close()
    app.cleanup_ctx.append(http_ctx)
    app.router.add_post("/xiaozhi/ota/", ota)
    app.router.add_get("/xiaozhi/ota/", ota)
    app.router.add_get("/xiaozhi/v1/", websocket)
    return app


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--port", type=int, default=8000)
    p.add_argument("--host", default=None, help="IP/host thiết bị dùng để gọi lại (mặc định: IP LAN)")
    p.add_argument("--token", default=os.environ.get("ARES_TOKEN", "dev-token"))
    a = p.parse_args()
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s", datefmt="%H:%M:%S")
    if os.environ.get("ARES_DEBUG"):         # chỉ logger của mình, không kéo theo debug của aiohttp
        log.setLevel(logging.DEBUG)
    public = f"{a.host or lan_ip()}:{a.port}"
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    url = os.environ.get("GEMINI_WS_URL", GEMINI_WS)   # trỏ sang mock_gemini.py khi test
    log.info("OTA URL cho firmware: http://%s/xiaozhi/ota/", public)
    log.info("chế độ: %s", f"Gemini Live ({GEMINI_MODEL})" if key else "ECHO (chưa có GEMINI_API_KEY)")
    web.run_app(make_app(public, a.token, key, url), host="0.0.0.0", port=a.port, print=None)
