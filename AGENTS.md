# AI System Development & MCP Usage

This project was built entirely using an **AI-agent workflow** powered by **Model Context Protocol (MCP)** tools. Every component—from architecture design to deployment configuration—was developed through human-AI collaboration.

## Development Workflow

### 1. Gap Analysis & Planning
The AI agent analyzed project requirements against grading criteria to identify missing components:
- ✅ Database integration (Prisma ORM)
- ✅ Containerization (Docker)
- ✅ Comprehensive testing (Unit + E2E)
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ API documentation (OpenAPI/Swagger)

### 2. Iterative Implementation with MCP

#### **Database Layer**
- **MCP Tools Used**: `view_file`, `write_to_file`, `run_command`
- **Process**:
  1. Analyzed existing backend structure with `view_file`
  2. Created dual Prisma schemas (`schema.prisma` for Postgres, `schema.sqlite.prisma` for SQLite)
  3. Generated migration files with `run_command` (`prisma migrate dev`)
  4. Implemented `PrismaService` with environment detection

#### **Containerization**
- **MCP Tools Used**: `write_to_file`, `view_file`, `run_command`
- **Process**:
  1. Created multi-stage `Dockerfile` for backend (build → production)
  2. Created Nginx-based `Dockerfile` for frontend
  3. Orchestrated services with `docker-compose.yml`
  4. Tested builds with `docker-compose up --build`

#### **Testing Infrastructure**
- **MCP Tools Used**: `write_to_file`, `replace_file_content`, `run_command`
- **Process**:
  1. Backend unit tests: `review.controller.spec.ts`, `review.service.spec.ts`, `llm.service.spec.ts`
  2. Backend E2E tests: `test/app.e2e-spec.ts` with mocked dependencies
  3. Frontend tests: `App.spec.ts`, `client.spec.ts`, `ReviewHistory.spec.ts`
  4. Verified coverage with `npm run test`

#### **CI/CD Pipeline**
- **MCP Tools Used**: `write_to_file`, `view_file`
- **Process**:
  1. Created `.github/workflows/ci.yml` with build-test-deploy stages
  2. Configured Vercel Deploy Hooks for automated deployment
  3. Set up environment-specific deployments (main → production, develop → preview)
  4. Documented deployment process in multiple guides

#### **API Documentation**
- **MCP Tools Used**: `replace_file_content`, `view_code_item`
- **Process**:
  1. Added Swagger decorators to all controllers (`@ApiOperation`, `@ApiResponse`, `@ApiHeader`)
  2. Configured Swagger UI in `main.ts` with CDN assets
  3. Created comprehensive endpoint documentation at `/api/v1/docs`

#### **MCP Server Implementation**
- **MCP Tools Used**: `write_to_file`, `replace_file_content`, `view_file`, `run_command`
- **Process**:
  1. Created `McpController` with 7 endpoints (discovery, tools, resources, prompts)
  2. Implemented `McpService` with tool execution logic
  3. Registered `McpModule` in `AppModule`
  4. Defined 3 tools: `analyze_code`, `get_available_models`, `get_review_history`
  5. Implemented resource URIs: `prism://models`, `prism://history/*`, `prism://review/*`
  6. Created prompt templates: `security_review`, `performance_review`, `readability_review`
  7. Verified build with `npm run build -w apps/backend`
  8. Documented integration in `MCP_INTEGRATION.md`

**Why MCP Server?**
- Enables AI agents (ChatGPT, Claude) to use Prism as a tool
- Implements industry-standard Model Context Protocol
- Demonstrates advanced AI integration beyond basic API consumption
- Makes Prism composable with other MCP tools
- Future-proofs the application for AI agent ecosystem

## MCP Tools Reference

### Core Tools Used Throughout Development

| MCP Tool | Purpose | Example Usage |
|----------|---------|---------------|
| `list_dir` | Explore project structure | Discovering monorepo layout, finding test files |
| `view_file` | Read file contents | Analyzing existing code before modifications |
| `view_file_outline` | Understand code structure | Reviewing class/function organization |
| `view_code_item` | Inspect specific functions | Examining controller methods, service logic |
| `write_to_file` | Create new files | Generating Dockerfiles, test files, configs |
| `replace_file_content` | Edit existing code | Adding features, fixing bugs, refactoring |
| `multi_replace_file_content` | Multiple edits in one file | Updating imports and logic simultaneously |
| `run_command` | Execute shell commands | Installing packages, running tests, building |
| `grep_search` | Search codebase | Finding usage patterns, locating dependencies |
| `find_by_name` | Locate files | Discovering test files, config files |

### Specific MCP Workflows

#### Example 1: Adding Database Support
```
1. list_dir(/Users/user/Documents/study/prism/apps/backend)
   → Discovered existing structure
2. write_to_file(apps/backend/prisma/schema.prisma)
   → Created Postgres schema
3. write_to_file(apps/backend/prisma/schema.sqlite.prisma)
   → Created SQLite schema for local dev
4. run_command("npm install @prisma/client prisma")
   → Installed dependencies
5. run_command("npx prisma generate")
   → Generated Prisma client
6. write_to_file(apps/backend/src/prisma/prisma.service.ts)
   → Created database service
7. replace_file_content(apps/backend/src/app.module.ts)
   → Registered PrismaModule
```

#### Example 2: Implementing Tests
```
1. view_file(apps/backend/src/modules/review/review.controller.ts)
   → Analyzed controller structure
2. write_to_file(apps/backend/src/modules/review/review.controller.spec.ts)
   → Created unit tests with mocks
3. write_to_file(apps/backend/test/app.e2e-spec.ts)
   → Created E2E tests
4. run_command("npm run test -w apps/backend")
   → Verified tests pass
5. view_file(apps/frontend/src/App.vue)
   → Analyzed Vue component
6. write_to_file(apps/frontend/src/App.spec.ts)
   → Created frontend tests with Vitest
```

#### Example 3: Setting Up CI/CD
```
1. write_to_file(.github/workflows/ci.yml)
   → Created GitHub Actions workflow
2. view_file(package.json)
   → Verified build scripts
3. write_to_file(apps/backend/vercel.json)
   → Configured Vercel backend deployment
4. write_to_file(apps/frontend/vercel.json)
   → Configured Vercel frontend deployment
5. write_to_file(DEPLOY_HOOKS_SETUP.md)
   → Documented deployment process
```

## AI Integration in the Application

Beyond using AI for development, the application itself integrates AI at **two levels**:

### 1. Runtime LLM Integration (Core Feature)
- **Provider**: Google Gemini API (`gemini-1.5-flash`)
- **Module**: `apps/backend/src/modules/llm/llm.service.ts`
- **Features**:
  - Structured JSON output with schema validation
  - Rate limiting (10 requests/minute)
  - Fallback mock implementation for testing
  - Environment-based configuration

**Prompt Engineering:**
- **System Prompt**: Enforces strict JSON output format
- **Focus Areas**: Security, Performance, Readability, Bugs
- **Output Structure**: Summary, score, detected language, issues array
- **Error Handling**: Graceful degradation with mock responses

**Testing AI Components:**
- **Unit Tests**: Mock LLM responses for deterministic testing
- **E2E Tests**: Verify full request/response cycle
- **Integration**: Ensure database persistence of AI-generated reviews

### 2. MCP Server (AI Agent Integration)
- **Module**: `apps/backend/src/modules/mcp/`
- **Protocol**: Model Context Protocol (MCP) 2024-11-05
- **Purpose**: Expose Prism's capabilities to AI agents

**MCP Capabilities:**

**Tools** (AI agents can invoke):
- `analyze_code` - Analyze code with focus area selection
- `get_available_models` - List supported AI models
- `get_review_history` - Retrieve session review history

**Resources** (AI agents can read):
- `prism://models` - Available AI models
- `prism://history/{sessionId}` - Review history for a session
- `prism://review/{reviewId}` - Individual review details

**Prompts** (Pre-configured templates):
- `security_review` - Security-focused analysis template
- `performance_review` - Performance optimization template
- `readability_review` - Code readability template

**Integration Examples:**
- **ChatGPT Custom GPT**: Can analyze code using Prism as a tool
- **Claude Desktop**: Native MCP integration via config file
- **Custom AI Apps**: Standard MCP SDK integration

**Architecture:**
```
AI Agent (ChatGPT/Claude)
    ↓ MCP Protocol (HTTP/JSON)
McpController (/api/v1/mcp/*)
    ↓
McpService (Tool execution)
    ↓
ReviewService (Business logic)
    ↓
LlmService (Google Gemini)
    ↓
Structured Analysis Result
```

**Documentation**: See [MCP_INTEGRATION.md](./MCP_INTEGRATION.md) for full usage guide.

## Benefits of MCP-Driven Development

1. **Consistency**: All code follows established patterns through AI guidance
2. **Documentation**: Every component is well-documented as it's created
3. **Testing**: Tests are written alongside implementation
4. **Best Practices**: AI enforces modern development standards
5. **Efficiency**: Rapid iteration with immediate feedback
6. **Traceability**: Clear history of decisions and implementations

## Lessons Learned

1. **MCP enables rapid prototyping** while maintaining code quality
2. **Iterative refinement** is more effective than big-bang implementations
3. **AI-assisted testing** ensures comprehensive coverage from the start
4. **Documentation-first** approach (via AI prompts) improves clarity
5. **Monorepo structure** benefits from AI's ability to understand cross-package dependencies

---

**See also**: [PROMPTS.md](./PROMPTS.md) for the initial prompts used to guide development.
