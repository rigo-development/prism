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

## Local Development Setup

Prism allows you to test both local and production environments seamlessly.

### Mode 1: Local SQLite (Default)
Ideal for standard development without external dependencies.
1.  **Initialize**:
    ```bash
    npm run setup:local
    ```
2.  **Run**:
    ```bash
    npm run dev
    ```

### Mode 2: Vercel Postgres (Production Sync)
Use this to test your cloud database locally.
1.  **Configure Environment**:
    Add your Vercel/Neon connection string to `apps/backend/.env`:
    ```env
    PRISMA_DATABASE_URL="postgres://user:pass@host/db?sslmode=require"
    ```
2.  **Initialize**:
    ```bash
    npm run setup:postgres
    ```
3.  **Run**:
    ```bash
    npm run dev
    ```

### Switching Environments
If you already have the project set up and just want to toggle:
*   Switch to **SQLite**: `npm run db:local:sync`
*   Switch to **Postgres**: `npm run db:prod:sync`

## Vercel Deployment

This project is optimized for a zero-config deployment on Vercel:
1.  **Framework**: Select `NestJS` for the backend and `Vite` for the frontend.
2.  **Build Command**: The root `package.json` includes `vercel-build`, which Vercel will use to:
    *   Initialize the Postgres Prisma Client.
    *   Automatically push schema changes to your Vercel Postgres instance.
    *   Build the monorepo.
3.  **Environment Variables**:
    *   Ensure `PRISMA_DATABASE_URL` (or `POSTGRES_PRISMA_URL`) is set.
    *   Set `GEMINI_API_KEY` in settings.

## Health & Status Check
Visit `http://localhost:3000/api/v1/health` to see your system status.
*   Append `?ping=true` to verify the live database connection (passive by default).

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
