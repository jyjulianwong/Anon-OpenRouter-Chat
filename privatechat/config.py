import os
from dotenv import load_dotenv

load_dotenv()

# ── OpenRouter ────────────────────────────────────────────────────────────────
OPENROUTER_API_KEY: str = os.environ.get("OPENROUTER_API_KEY", "")
OPENROUTER_MODEL: str = os.environ.get("OPENROUTER_MODEL", "anthropic/claude-sonnet-4-5")

# ── Generation parameters ─────────────────────────────────────────────────────
# Randomness of outputs. Range: [0.0, 2.0].
LLM_TEMPERATURE: float = float(os.environ.get("LLM_TEMPERATURE", "1.0"))

# Maximum number of tokens to generate. Unset = model default.
LLM_MAX_TOKENS: int | None = int(v) if (v := os.environ.get("LLM_MAX_TOKENS")) else None

# Nucleus sampling threshold. Range: [0.0, 1.0]. 1.0 = off.
LLM_TOP_P: float = float(os.environ.get("LLM_TOP_P", "1.0"))

# Top-k sampling. Unset = off (not sent to the API).
LLM_TOP_K: int | None = int(v) if (v := os.environ.get("LLM_TOP_K")) else None

# Penalise tokens based on how often they appear so far. Range: [-2.0, 2.0].
LLM_FREQUENCY_PENALTY: float = float(os.environ.get("LLM_FREQUENCY_PENALTY", "0.0"))

# Penalise tokens that have appeared at all so far. Range: [-2.0, 2.0].
LLM_PRESENCE_PENALTY: float = float(os.environ.get("LLM_PRESENCE_PENALTY", "0.0"))

# Multiplicative penalty for repeated tokens. Range: [0.0, 2.0]. 1.0 = off.
LLM_REPETITION_PENALTY: float = float(os.environ.get("LLM_REPETITION_PENALTY", "1.0"))

# Minimum probability for token sampling (some providers). Unset = off.
LLM_MIN_P: float | None = float(v) if (v := os.environ.get("LLM_MIN_P")) else None

# Top-a sampling (some providers). Unset = off.
LLM_TOP_A: float | None = float(v) if (v := os.environ.get("LLM_TOP_A")) else None

# ── Safety ────────────────────────────────────────────────────────────────────
# When True, OpenRouter prepends a safety instruction to every prompt.
LLM_SAFE_PROMPT: bool = os.environ.get("LLM_SAFE_PROMPT", "false").lower() in ("1", "true")

# ── Universal extras ──────────────────────────────────────────────────────────
# Seed for deterministic outputs. Unset = off.
LLM_SEED: int | None = int(v) if (v := os.environ.get("LLM_SEED")) else None

# Response verbosity. One of: low, medium, high, xhigh, max. Unset = model default.
# For Claude specifically, this maps to output_config.effort.
LLM_VERBOSITY: str | None = os.environ.get("LLM_VERBOSITY") or None

# ── Reasoning / extended thinking ─────────────────────────────────────────────
# Opt-in: only sent when at least one of the two below is set.
# Use effort OR max_tokens, not both.
#
# Supported by:
#   Claude  — anthropic/claude-sonnet-4-5 and later thinking-capable variants
#   Gemini  — google/gemini-2.5-flash-thinking and similar :thinking variants
#   Qwen    — qwen/qwq-32b and similar thinking models
#
# Effort levels (model-dependent): low | medium | high | max
LLM_REASONING_EFFORT: str | None = os.environ.get("LLM_REASONING_EFFORT") or None

# Hard token budget for the reasoning block.
LLM_REASONING_MAX_TOKENS: int | None = int(v) if (v := os.environ.get("LLM_REASONING_MAX_TOKENS")) else None

# When True, the reasoning block is performed internally but NOT returned in the response.
LLM_REASONING_EXCLUDE: bool = os.environ.get("LLM_REASONING_EXCLUDE", "false").lower() in ("1", "true")

# ── Gemini safety settings ────────────────────────────────────────────────────
# Only applied when the model slug contains "google/" or "gemini".
# Gemini 2.5+ already defaults to OFF, but older models don't.
# When True, all harm categories are set to BLOCK_NONE (no filtering).
LLM_GEMINI_SAFETY_OFF: bool = os.environ.get("LLM_GEMINI_SAFETY_OFF", "true").lower() in ("1", "true")
