# Anon OpenRouter Chat

A minimal local web chat interface backed by [OpenRouter](https://openrouter.ai).

## Setup

**1. Install dependencies**

```
uv sync
```

**2. Configure environment**

```
cp .env.example .env
```

Edit `.env` and set your values:

```
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=anthropic/claude-sonnet-4-5
```

`OPENROUTER_MODEL` is optional and defaults to `anthropic/claude-sonnet-4-5`. Any model slug from [openrouter.ai/models](https://openrouter.ai/models) works.

**3. Run**

```
uv run anon_openrouter_chat
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser.

## Usage

- Type a message and press **Enter** to send (Shift+Enter for a newline).
- Click the paperclip icon to attach an image.
- Click **New chat** to start a fresh conversation.
