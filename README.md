# AI Headshot Generator

![AI Headshot Generator](https://img.shields.io/badge/AI-Powered-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Build](https://img.shields.io/github/actions/workflow/status/nsalvacao/ai_headshot_generator/ci.yml?branch=main&style=for-the-badge)

**AI-assisted wardrobe and portrait generation, powered by Google Gemini 2.5 Flash Image and a strictly typed React 19 client.**

Visit the technical landing page at [nsalvacao.github.io/ai_headshot_generator](https://nsalvacao.github.io/ai_headshot_generator) for architecture and deployment notes.

---

## Table of Contents
1. [Overview](#overview)
2. [Capabilities](#capabilities)
3. [Tech Stack](#tech-stack)
4. [Getting Started](#getting-started)
5. [Configuration](#configuration)
6. [Usage Flow](#usage-flow)
7. [Development & Testing](#development--testing)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)
10. [Contributing](#contributing)
11. [License](#license)
12. [Contact](#contact)

---

## Overview
The AI Headshot Generator transforms a single base portrait into multiple professional variations. A curated wardrobe catalogue, fine-tune sliders (smile, hair, age, gaze) and prompt editing controls make it suitable for:
- **Professional identity refresh** – LinkedIn, speaker bios, conference collateral.
- **Talent enablement** – HR teams needing consistent avatars across systems.
- **Creative studios** – Agencies targeting specific aesthetics or internal inference endpoints.
- **Personal experimentation** – Social avatars, portfolio refreshes or casual looks.

---

## Capabilities

| Category | Highlights |
| --- | --- |
| Generation | Google Gemini 2.5 Flash Image gateway, optional custom HTTP inference endpoints. |
| Styling | 12+ curated presets plus editable prompts, aspect-ratio guardrails and subtle adjustment sliders. |
| UX | Live preview grid, deterministic downloads, responsive layout, Framer Motion animations. |
| Safety & Reliability | MIME validation, base64 checks, user-owned API keys, descriptive error surfacing. |
| Quality Gates | `npm run ci` executes type-checking, linting, Vitest suites and production build. |

---

## Tech Stack
- **Frontend**: React 19, TypeScript 5.8, Vite 6, Framer Motion, custom design system (`index.css`).
- **AI Services**: `services/geminiService.ts` (Gemini SDK), `services/customModelService.ts` (generic HTTP POST with JSON payloads).
- **Tooling**: ESLint, Prettier, Vitest + @testing-library, GitHub Actions (CI + Pages deploy).

---

## Getting Started

### Prerequisites
- Node.js **20.x** or **22.x** (LTS recommended)
- npm **9.x** or newer
- A Google Gemini API key (obtain via [Google AI Studio](https://aistudio.google.com/app/apikey))

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/nsalvacao/ai_headshot_generator.git
cd ai_headshot_generator

# 2. Install dependencies
npm install

# 3. Launch the dev server
npm run dev -- --host 0.0.0.0 --port 3000
```
Access the app at `http://localhost:3000`. Configure your model provider inside the in-app **Settings** modal (see next section).

---

## Configuration
Users can operate entirely through the Settings modal—no environment file is required. If you prefer to pre-populate values at build time, `.env.example` documents the optional variables.

### Gemini Provider
1. Open **Settings → Provider → Google Gemini**.
2. Paste your API key (stored in `localStorage`, never sent to our servers).
3. Save. All subsequent generations will call `gemini-2.5-flash-image` via the official SDK.

### Custom Provider (Ollama or internal APIs)
1. Select **Custom (Ollama, etc.)**.
2. Provide `API URL` (e.g., `http://localhost:11434/api/generate`).
3. Provide `Model Name` (e.g., `llava`).
4. Save. `customModelService` will POST `{ image, prompt, model }` payloads to your endpoint.

### Optional `.env` usage
```
GEMINI_API_KEY=your_key_here
# CUSTOM_MODEL_URL=http://your-endpoint
# CUSTOM_MODEL_NAME=your-model
```
Values exposed via Vite’s `define` helper can be read manually if you extend the services, but the shipped UI does not require them.

---

## Usage Flow
1. **Upload** a clear portrait (PNG, JPG, WebP, AVIF). Client validates size and MIME.
2. **Select or customise** a style. Wardrobe presets and fine-tune sliders build a reproducible prompt.
3. **Generate** via Gemini or your custom provider. Placeholders show progress states and retries.
4. **Review & download** results. Each image card offers deterministic filenames for downstream catalogues.
5. **Reset / iterate** quickly via “Start Over” or by tweaking prompts and adjustments.

Tips:
- Aim for ≥1024px images for best fidelity.
- Keep prompts concise but specific (lighting, wardrobe, environment).
- If a request is blocked for safety, rephrase to neutral language or switch presets.

---

## Development & Testing

### Key Scripts
```bash
npm run dev               # Vite dev server
npm run build             # Production bundle
npm run preview           # Serve the dist bundle locally
npm run lint              # ESLint (no warnings allowed)
npm run format            # Prettier write
npm run type-check        # TSC --noEmit
npm run test              # Vitest watch mode
npm run test:run          # Vitest run once
npm run test:ui           # Vitest UI
npm run test:coverage     # Coverage report
npm run ci                # type-check + lint + test:run + build
```

### Test Coverage Snapshot
| Suite | Focus |
| --- | --- |
| `services/customModelService.test.ts` | Validates payload shaping, error propagation, and base64 handling for custom endpoints. |
| `services/geminiService.test.ts` | Confirms data URL validation, API key enforcement, and inlineData parsing. |

---

## Deployment

### Continuous Delivery (GitHub Pages)
- **CI workflow**: `.github/workflows/ci.yml`
  - Runs on pushes/PRs targeting `main` or `develop` (Node 20 & 22 matrix).
  - Executes lint, type-check, tests, build.
  - On `main` pushes, a second job rebuilds with Node 22 and deploys `dist/` via GitHub Pages.
- **Public site**: `https://nsalvacao.github.io/ai_headshot_generator`
- **Static docs**: `docs/` hosts the technical landing page served by Pages; the React app bundle lives under `dist/` for other hosts as needed.

### Manual / Alternative Deploys
```
npm run build
# Deploy dist/ to the platform of your choice (Vercel, Netlify, S3+CloudFront, etc.)
```

---

## Troubleshooting

<details>
<summary><strong>“API Key is missing”</strong></summary>
Open Settings → Provider and confirm a key is stored. Keys stay in `localStorage`; clearing browser storage removes them.
</details>

<details>
<summary><strong>“Request was blocked. Reason: SAFETY”</strong></summary>
Gemini rejected the prompt/image. Rephrase to neutral wording or use a built-in preset to avoid sensitive terms.
</details>

<details>
<summary><strong>Generations are slow</strong></summary>
Ensure a stable network, resize the input image to ~1024x1024, and simplify prompts. Monitor [Google Cloud status](https://status.cloud.google.com/).
</details>

<details>
<summary><strong>Build fails due to TypeScript errors</strong></summary>
Run `npm run type-check` to inspect issues. If caches cause noise, `rm -rf node_modules package-lock.json dist && npm install`.
</details>

<details>
<summary><strong>Vitest cannot resolve modules</strong></summary>
Reinstall dev deps (`npm install`) and clear Vitest cache (`npx vitest --clearCache`).
</details>

---

## Contributing
1. Fork → `git clone https://github.com/YOUR_USERNAME/ai_headshot_generator.git`
2. Create a branch → `git checkout -b feature/awesome`
3. Implement changes (+ tests/docs)
4. `npm run ci` locally
5. Push and open a pull request

Guidelines: keep commits atomic, document new configuration, and include test coverage for service-layer updates.

---

## License
Released under the [MIT License](LICENSE). No warranty or liability implied. Commercial use, modification, distribution and private use are permitted.

---

## Contact
**Nuno Salvação** · AI Solutions Architect
- 📧 `nuno.salvacao@gmail.com`
- 💼 GitHub: [@nsalvacao](https://github.com/nsalvacao)
- 🌐 Project site: [nsalvacao.github.io/ai_headshot_generator](https://nsalvacao.github.io/ai_headshot_generator)

Made with ❤️ in Portugal.
