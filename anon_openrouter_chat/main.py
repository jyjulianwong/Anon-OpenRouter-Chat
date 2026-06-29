import json
from pathlib import Path
from typing import AsyncGenerator

import httpx
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles

from anon_openrouter_chat.config import (
    OPENROUTER_API_KEY,
    OPENROUTER_MODEL,
    LLM_TEMPERATURE,
    LLM_MAX_TOKENS,
    LLM_TOP_P,
    LLM_TOP_K,
    LLM_FREQUENCY_PENALTY,
    LLM_PRESENCE_PENALTY,
    LLM_REPETITION_PENALTY,
    LLM_MIN_P,
    LLM_TOP_A,
    LLM_SAFE_PROMPT,
    LLM_SEED,
    LLM_VERBOSITY,
    LLM_REASONING_EFFORT,
    LLM_REASONING_MAX_TOKENS,
    LLM_REASONING_EXCLUDE,
    LLM_GEMINI_SAFETY_OFF,
)

STATIC_DIR = Path(__file__).parent / "static"
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

app = FastAPI(title="Anon OpenRouter Chat")
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


@app.get("/")
async def index():
    return FileResponse(STATIC_DIR / "index.html")


@app.post("/api/chat")
async def chat(request: Request):
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY is not set — add it to your .env file")

    body = await request.json()
    messages = body.get("messages", [])
    if not messages:
        raise HTTPException(status_code=400, detail="No messages provided")

    return StreamingResponse(
        _stream(messages),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


def _build_payload(messages: list) -> dict:
    payload: dict = {
        "model": OPENROUTER_MODEL,
        "messages": messages,
        "stream": True,
        "temperature": LLM_TEMPERATURE,
        "top_p": LLM_TOP_P,
        "frequency_penalty": LLM_FREQUENCY_PENALTY,
        "presence_penalty": LLM_PRESENCE_PENALTY,
        "repetition_penalty": LLM_REPETITION_PENALTY,
        "safe_prompt": LLM_SAFE_PROMPT,
    }
    if LLM_MAX_TOKENS is not None:
        payload["max_tokens"] = LLM_MAX_TOKENS
    if LLM_TOP_K is not None:
        payload["top_k"] = LLM_TOP_K
    if LLM_MIN_P is not None:
        payload["min_p"] = LLM_MIN_P
    if LLM_TOP_A is not None:
        payload["top_a"] = LLM_TOP_A
    if LLM_SEED is not None:
        payload["seed"] = LLM_SEED
    if LLM_VERBOSITY:
        payload["verbosity"] = LLM_VERBOSITY

    # Reasoning / extended thinking — only sent when explicitly configured
    if LLM_REASONING_EFFORT or LLM_REASONING_MAX_TOKENS is not None:
        reasoning: dict = {"exclude": LLM_REASONING_EXCLUDE}
        if LLM_REASONING_EFFORT:
            reasoning["effort"] = LLM_REASONING_EFFORT
        else:
            reasoning["max_tokens"] = LLM_REASONING_MAX_TOKENS
        payload["reasoning"] = reasoning

    # Gemini safety settings — only applied for Google/Gemini models
    model = OPENROUTER_MODEL.lower()
    if LLM_GEMINI_SAFETY_OFF and ("google/" in model or "gemini" in model):
        payload["safety_settings"] = [
            {"category": "HARM_CATEGORY_HARASSMENT",        "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH",       "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_CIVIC_INTEGRITY",   "threshold": "BLOCK_NONE"},
        ]

    return payload


async def _stream(messages: list) -> AsyncGenerator[str, None]:
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream(
                "POST",
                OPENROUTER_URL,
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                },
                json=_build_payload(messages),
            ) as response:
                if response.status_code != 200:
                    body = await response.aread()
                    error = body.decode()
                    yield f"data: {json.dumps({'error': f'API error {response.status_code}: {error}'})}\n\n"
                    return

                async for line in response.aiter_lines():
                    if not line.startswith("data: "):
                        continue
                    payload = line[6:]
                    if payload == "[DONE]":
                        yield "data: [DONE]\n\n"
                        return
                    try:
                        chunk = json.loads(payload)
                        content = chunk["choices"][0]["delta"].get("content") or ""
                        if content:
                            yield f"data: {json.dumps({'content': content})}\n\n"
                    except (json.JSONDecodeError, KeyError, IndexError):
                        pass
    except Exception as exc:
        yield f"data: {json.dumps({'error': str(exc)})}\n\n"


def run():
    import uvicorn
    uvicorn.run("anon_openrouter_chat.main:app", host="127.0.0.1", port=8000, reload=False)
