# Agent Playground 🚀

A modern, fast, and unified AI Playground built with **Next.js**, **Tailwind CSS**, and the **Vercel AI SDK**. Experiment with different LLM providers (Anthropic, OpenAI, Google), craft prompt templates with dynamic variables, tune model hyper-parameters, and evaluate responses side-by-side in real-time.

---

## ✨ Features

- **Multi-Provider Support**: Seamlessly switch between Anthropic (Claude), OpenAI (GPT), and Google (Gemini).
- **BYOK (Bring Your Own Key)**: Safe client-side execution—API keys are stored exclusively in your browser's session storage and sent directly to provider endpoints.
- **Dynamic Prompt Templating**: Write prompts using `{{variable_name}}` placeholders with automatic input field detection and extraction.
- **Advanced Model Tuning**: Dedicated slider & configuration panel to fine-tune:
  - **Creativity**: Temperature & custom Stop Sequences.
  - **Length**: Max Output Tokens limit.
  - **Sampling**: Top-P (Nucleus Sampling) & Top-K.
  - **Penalties**: Presence Penalty & Frequency Penalty.
  - **Determinism**: Seed reproducibility.
- **Rich Output Rendering**: Markdown formatting with syntax highlighting, raw JSON/text inspector, token usage metrics, and latency measurement.
- **Keyboard Shortcuts**: Run prompts instantly using `Ctrl + Enter` / `Cmd + Enter`.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **AI Integration**: [Vercel AI SDK](https://sdk.vercel.ai/) (`ai`, `@ai-sdk/anthropic`, `@ai-sdk/openai`, `@ai-sdk/google`)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Lucide Icons](https://lucide.dev/)
- **Deployment**: Static asset export with [Cloudflare Workers / Pages](https://developers.cloudflare.com/workers/) via Wrangler.

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/BubbleIndexOne/Agent-Playground.git
cd Agent-Playground
```

### 2. Install Dependencies

Using `npm` or `pnpm`:

```bash
npm install
# or
pnpm install
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start testing.

---

## ⚙️ Configuration & Architecture

- **`src/lib/api.ts`**: Unified model calling layer using the Vercel AI SDK. Maps custom user settings dynamically to provider configurations.
- **`src/lib/constants.ts`**: Centralized default model configs (`DEFAULT_MODEL_CONFIGS`), storage keys, reasoning levels, and tool choices.
- **`src/lib/mockdata.json`**: Provider and model definitions available in the playground.
- **`apispec.json`**: Schema specification for model tuning variables and parameter constraints.

---

## 📦 Build & Deployment

### Build Static Assets

```bash
npm run build
```

### Deploy to Cloudflare Workers

```bash
npx wrangler deploy
```

---

## 🔒 Privacy & Security

Your API keys are stored only in `sessionStorage` in your browser. They are never sent to external servers or logged in any backend—requests are dispatched directly from your browser to the official provider APIs.
