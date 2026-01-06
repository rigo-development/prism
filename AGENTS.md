# AI System Development & MCP Usage

This project was built using an advanced agentic AI workflow.

## Workflow

1.  **Gap Analysis**: The AI agent analyzed the project requirements against the provided grading criteria to identify missing components (Database, Docker, Tests).
2.  **Iterative Implementation**:
    *   **Database**: Implemented Prisma ORM with SQLite to store review history.
    *   **Containerization**: Created multi-stage Dockerfiles for frontend and backend, orchestrated via `docker-compose`.
    *   **Testing**: Added Backend E2E tests (Jest) and Frontend Unit tests (Vitest) to cover core logic.
3.  **Tool Usage (MCP)**:
    The development process leveraged Model Context Protocol (MCP) tools:
    *   `list_dir` / `view_file`: For exploring the monorepo structure.
    *   `run_command`: Executing shell commands for package installation and building.
    *   `replace_file_content`: Precise code editing.
    *   `write_to_file`: Generating configuration files (Docker, CI/CD).

## AI Integration Details

The application itself integrates AI via the `ReviewModule`:

*   **LLM Provider**: Google Gemini (`gemini-1.5-flash`).
*   **Structured Output**: The system prompt enforces strict JSON output for reliable parsing.
*   **Fallback Mechanism**: A mock implementation allows the system to function and be tested without an active API key.
