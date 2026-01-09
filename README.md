# Prism: AI-Powered Code Review Assistant

Prism is a production-style educational project built to demonstrate the integration of AI tools into a modern web development workflow. It allows users to paste code, select a focus area (Security, Performance, Readability), and receive structured, improved feedback powered by an LLM.

## 🚀 Live Demo

Experience Prism in action:

*   **Frontend Application**: [https://prism-two-snowy.vercel.app/](https://prism-two-snowy.vercel.app/)
*   **Backend API Documentation**: [https://prism-backend-drab.vercel.app/api/v1/docs](https://prism-backend-drab.vercel.app/api/v1/docs)
*   **API Health Check**: [https://prism-backend-drab.vercel.app/api/v1/health](https://prism-backend-drab.vercel.app/api/v1/health)

> **Note**: The application is deployed on Vercel with automatic CI/CD via GitHub Actions. Every push to `main` triggers production deployment, while `develop` branch deploys to preview environments.

## Tech Stack

*   **Monorepo**: NPM Workspaces
*   **Backend**: NestJS + TypeScript (Modular Architecture, DTOs, Validation)
*   **Database**: SQLite + Prisma ORM
*   **Frontend**: Vue 3 + TypeScript + Vite + TailwindCSS
*   **Shared**: Common DTOs and Types
*   **AI Integration**: Google Gemini API (with rate limiting)
*   **MCP Server**: Model Context Protocol for AI agent integration
*   **DevOps**: Docker, GitHub Actions CI
*   **AI Development**: See [AGENTS.md](./AGENTS.md)

## Features (MVP)

*   **Smart Code Editor**: Syntax-ready input area.
*   **Focus Selection**: Tailored AI prompts based on review goals.
*   **Structured Feedback**: Clear, line-by-line analysis with severity levels.
*   **Modern UI**: Glassmorphism, smooth gradients, and responsive design.
*   **MCP Integration**: AI agents (ChatGPT, Claude) can use Prism as a tool via Model Context Protocol. [Learn more](./MCP_INTEGRATION.md)

## Architecture

```text
prism/
├── apps/
│   ├── backend/                    # NestJS API (Port 3000)
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── review/        # Code review logic
│   │   │   │   ├── llm/           # Google Gemini integration
│   │   │   │   ├── health/        # Health check endpoints
│   │   │   │   └── mcp/           # Model Context Protocol server
│   │   │   ├── prisma/            # Database service
│   │   │   └── main.ts            # App bootstrap + Swagger
│   │   └── prisma/
│   │       ├── schema.prisma      # Production (Postgres)
│   │       └── schema.sqlite.prisma # Local dev (SQLite)
│   │
│   └── frontend/                   # Vue 3 SPA (Port 5173)
│       ├── src/
│       │   ├── components/        # Vue components
│       │   ├── api/               # Centralized API client
│       │   └── App.vue            # Main application
│       └── public/
│
├── packages/
│   └── shared/                     # Shared TypeScript types/DTOs
│
├── .github/
│   └── workflows/
│       └── ci.yml                  # CI/CD pipeline
│
└── docker-compose.yml              # Container orchestration
```

### API Capabilities

The backend exposes three types of APIs:

1. **REST API** (`/api/v1/*`)
   - `/review/analyze` - Code analysis endpoint
   - `/review/models` - Available AI models
   - `/review/history` - Review history management
   - `/health` - System health check

2. **OpenAPI/Swagger** (`/api/v1/docs`)
   - Interactive API documentation
   - Request/response schemas
   - Try-it-out functionality

3. **MCP Server** (`/api/v1/mcp/*`)
   - Model Context Protocol endpoints
   - Enables AI agents (ChatGPT, Claude) to use Prism as a tool
   - Tools: `analyze_code`, `get_available_models`, `get_review_history`
   - Resources: `prism://models`, `prism://history/*`, `prism://review/*`
   - Prompts: `security_review`, `performance_review`, `readability_review`
   - [Full MCP Documentation](./MCP_INTEGRATION.md)

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

## Using Prism with AI Agents (MCP)

Prism implements the **Model Context Protocol (MCP)**, allowing AI agents to use it as a tool for code analysis.

### Quick Start with ChatGPT

1. Create a Custom GPT in ChatGPT
2. Add an Action using Prism's OpenAPI schema: `https://prism-backend-drab.vercel.app/api/v1/docs`
3. Configure MCP endpoints
4. Ask ChatGPT to review code - it will automatically use Prism!

**Example:**
```
You: "Review this code for security issues:
      SELECT * FROM users WHERE id = " + userId

ChatGPT: [Uses Prism's analyze_code tool]
         I found a critical SQL injection vulnerability...
```

### Quick Start with Claude Desktop

Add to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "prism": {
      "url": "https://prism-backend-drab.vercel.app/api/v1/mcp"
    }
  }
}
```

Restart Claude Desktop - it can now analyze code using Prism automatically!

### Testing MCP Endpoints

```bash
# List available tools
curl -X POST https://prism-backend-drab.vercel.app/api/v1/mcp/tools/list

# Analyze code
curl -X POST https://prism-backend-drab.vercel.app/api/v1/mcp/tools/call \
  -H "Content-Type: application/json" \
  -d '{
    "name": "analyze_code",
    "arguments": {
      "code": "function test() { var x = 1; }",
      "focus": "readability"
    }
  }'
```

**Full MCP Documentation**: [MCP_INTEGRATION.md](./MCP_INTEGRATION.md)

## AI System & Workflow

This project demonstrates **two levels of AI integration**:

### 1. AI-Assisted Development (MCP Tools Used)

The entire project was built using AI agents with Model Context Protocol tools. Every component—from architecture to deployment—was developed through human-AI collaboration.

**Development Tools Used:**
- `view_file`, `view_file_outline` - Code exploration
- `write_to_file`, `replace_file_content` - Code generation and editing
- `run_command` - Package installation, testing, building
- `grep_search`, `find_by_name` - Codebase navigation

**Key Implementations:**
- Database layer with dual Prisma schemas (SQLite/Postgres)
- Docker containerization with multi-stage builds
- Comprehensive test suite (unit + E2E + integration)
- CI/CD pipeline with automated deployment
- OpenAPI/Swagger documentation
- MCP server implementation

**Full Development Workflow**: [AGENTS.md](./AGENTS.md)

### 2. AI Runtime Integration (Application Features)

The application itself integrates AI for code analysis:

**LLM Integration:**
- **Provider**: Google Gemini API (`gemini-1.5-flash`)
- **Features**: Structured JSON output, rate limiting, fallback mocks
- **Focus Areas**: Security, Performance, Readability, Bugs

**MCP Server:**
- Exposes Prism's capabilities to AI agents
- Tools: `analyze_code`, `get_available_models`, `get_review_history`
- Resources: Models, review history, individual reviews
- Prompts: Pre-configured review templates

**Architecture:**
```
AI Agent (ChatGPT/Claude)
    ↓ MCP Protocol
Prism MCP Server
    ↓ Internal API
Review Service
    ↓ LLM API
Google Gemini
    ↓ Analysis
Structured Feedback
```

### CI/CD

Automated via GitHub Actions:
- **On Push**: Runs tests (unit + E2E + frontend)
- **On Success**: Triggers Vercel deployment via Deploy Hooks
- **Environments**: `main` → production, `develop` → preview

## Project Documentation

- **[README.md](./README.md)** - This file, project overview
- **[AGENTS.md](./AGENTS.md)** - AI-assisted development workflow
- **[MCP_INTEGRATION.md](./MCP_INTEGRATION.md)** - MCP server usage guide
- **[PROMPTS.md](./PROMPTS.md)** - Initial development prompts

## License

MIT
