# Anon OpenRouter Chat

A minimal web chat interface backed by [OpenRouter](https://openrouter.ai), built with React and deployable to GitHub Pages.

## Local development

**1. Install dependencies**

```
npm install
```

**2. Start the Cloudflare Worker locally** (in a separate terminal)

```
cd worker
npm install
npx wrangler dev
```

**3. Run the frontend**

```
VITE_WORKER_URL=http://localhost:8787 npm run dev
```

Open [http://localhost:5173/Anon-OpenRouter-Chat/](http://localhost:5173/Anon-OpenRouter-Chat/) in your browser.

## Usage

- Type a message and press **Enter** to send (Shift+Enter for a newline).
- Click **Attach** to attach one or more images.
- Click **New chat** to start a fresh conversation.
- Click **Settings** to change the model, temperature, max tokens, or system prompt. Settings are saved in your browser's local storage.
- Click **Export** to save the conversation as a JSON file, or **Import** to restore one.

## CI/CD

Deploys automatically to GitHub Pages on every push to `main`. The Cloudflare Worker acts as a thin proxy that holds the API key server-side so it is never exposed in the browser.

### Step 1 — Deploy the Cloudflare Worker

Do this once from your local machine. You will need a free [Cloudflare account](https://cloudflare.com).

```bash
cd worker
npm install
npx wrangler login                          # opens browser to authenticate
npx wrangler secret put OPENROUTER_API_KEY  # paste your OpenRouter API key when prompted
npx wrangler deploy                         # note the *.workers.dev URL it prints
cd ..
```

### Step 2 — Add secrets to GitHub

Go to your repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Name | Value |
|---|---|
| `VITE_WORKER_URL` | The `*.workers.dev` URL printed by `wrangler deploy` |

### Step 3 — Enable GitHub Pages

Go to your repository → **Settings** → **Pages** → set Source to **GitHub Actions**.

### Step 4 — Push to main

The workflow in `.github/workflows/deploy.yml` will build the React app with `VITE_WORKER_URL` baked in and deploy it to GitHub Pages automatically.
