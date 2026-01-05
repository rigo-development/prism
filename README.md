# Prism: AI-Powered Code Review Assistant

Prism is a production-style educational project built to demonstrate the integration of AI tools into a modern web development workflow. It allows users to paste code, select a focus area (Security, Performance, Readability), and receive structured, improved feedback powered by an LLM.

## Tech Stack

*   **Monorepo**: NPM Workspaces
*   **Backend**: NestJS + TypeScript (Modular Architecture, DTOs, Validation)
*   **Database**: SQLite + Prisma ORM
*   **Frontend**: Vue 3 + TypeScript + Vite + TailwindCSS
*   **Shared**: Common DTOs and Types
*   **AI Integration**: Google Gemini API (with rate limiting)
*   **DevOps**: Docker, GitHub Actions CI
*   **AI Development**: See [AGENTS.md](./AGENTS.md)

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

5.  **Setup & Database Initialization**
    ```bash
    npm run setup
    ```
    *This installs dependencies, builds shared packages, and initializes the local SQLite database.*

6.  **Run Development Servers**
    ```bash
    npm run dev
    ```

7.  **Access App**
    *   Frontend: `http://localhost:5173`
    *   Backend API: `http://localhost:3000`
    *   Swagger Docs: `http://localhost:3000/api`

## Docker Support (Recommended)
Run the entire stack with one command:
```bash
docker-compose up --build
```
Access Frontend at `http://localhost:8080` and Backend at `http://localhost:3000`.

## Testing

*   **Backend Unit Tests**: `npm run test -w apps/backend`
*   **Backend E2E Tests**: `npm run test:e2e`
*   **Frontend Unit Tests**: `npm run test -w apps/frontend`

## AI System & Workflow

The development of this project followed a structured AI-agent workflow. For more technical details on how the database, containerization, and tests were implemented, see [AGENTS.md](./AGENTS.md).
*   **CI/CD**: Automated via GitHub Actions on push.

## License

MIT
