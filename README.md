# Prism: AI-Powered Code Review Assistant

Prism is a production-style educational project built to demonstrate the integration of AI tools into a modern web development workflow. It allows users to paste code, select a focus area (Security, Performance, Readability), and receive structured, improved feedback powered by an LLM.

## Tech Stack

*   **Monorepo**: NPM Workspaces
*   **Backend**: NestJS + TypeScript (Modular Architecture, DTOs, Validation)
*   **Frontend**: Vue 3 + TypeScript + Vite + TailwindCSS
*   **Shared**: Common DTOs and Types
*   **AI Integration**: Google Gemini API (with rate limiting)
*   **CI**: GitHub Actions

## Features (MVP)

*   **Smart Code Editor**: Syntax-ready input area.
*   **Focus Selection**: Tailored AI prompts based on review goals.
*   **Structured Feedback**: Clear, line-by-line analysis with severity levels.
*   **Modern UI**: Glassmorphism, smooth gradients, and responsive design.

## Architecture

```text
prism/
├── apps/
│   ├── backend/        # NestJS (Port 3000)
│   └── frontend/       # Vue 3 (Port 5173)
├── packages/
│   └── shared/         # Shared Types/DTOs
```

## Getting Started

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Build Shared Library**
    ```bash
    npm run build -w packages/shared
    ```

3.  **Configure Environment**
    Create `apps/backend/.env` (optional for simple usage, required for Real AI):
    ```env
    GEMINI_API_KEY=your_key_here
    ```
    *If no key is provided, the system falls back to a Mock Provider for demonstration.*

4.  **Rate Limiting**
    To protect the Gemini free tier, the API is rate-limited to 5 requests per minute per IP.

5.  **Run Development Servers**
    ```bash
    # Open two terminals:
    npm run dev -w apps/backend
    npm run dev -w apps/frontend
    ```

6.  **Access App**
    Open `http://localhost:5173` (or port shown in terminal).

## Testing

*   **Backend Unit Tests**: `npm run test -w apps/backend`
*   **CI/CD**: Automated via GitHub Actions on push.

## License

MIT
