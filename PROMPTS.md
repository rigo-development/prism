# PROMPTS

## Initial
```
You are a senior full-stack engineer and technical lead.

You are building a production-style educational project for
"AI Dev Tools Zoomcamp".

Goals:
- demonstrate practical usage of AI as a developer tool
- produce clean, readable, testable code
- avoid over-engineering
- focus on clarity and end-to-end completeness

Tech stack (STRICT):
- Backend: NestJS + TypeScript
- Frontend: Vue 3 + TypeScript
- API: REST
- AI: external LLM API (OpenAI / Gemini / OpenRouter compatible)
- Tests: Jest (backend)
- CI: GitHub Actions

Rules:
- Prefer simple, explicit solutions
- Use standard NestJS patterns (controllers, services, DTOs)
- Explain decisions briefly when relevant

Git:
it should be monorepo with structure (for example)
prism/
├── apps/
│   ├── backend/        # NestJS
│   └── frontend/       # Vue 3
│
├── packages/
│   └── shared/         # DTO, enums, types
│
├── .github/
│   └── workflows/ci.yml
│
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── README.md

I have remote repo https://github.com/rigo-development/prism.git

Deployment:
maybe it will be vercel

So
Build an end-to-end educational project called "Prism".

Tech stack:
- Backend: NestJS + TypeScript
- Frontend: Vue 3 + TypeScript
- REST API
- External LLM integration

Deliver:
- MVP definition
- architecture
- backend implementation
- AI prompt design
- backend tests
- frontend UI
- CI pipeline
- README

Process step by step.
Pause after each step and explain decisions briefly.

Define an MVP for an "AI Code Review Assistant".

The application should:
- accept pasted code or a git diff
- allow selecting a review focus:
  - readability
  - potential bugs
  - performance
  - security (basic)
- return structured AI feedback similar to a GitHub pull request review

Deliver:
1. Core user flows
2. Features INCLUDED in MVP
3. Features EXCLUDED on purpose
4. Demo scenario (2–3 minutes)
5. Why this project is suitable for peer review

Keep it concise and practical.
Use modern UI design frameworks that popular with Vue 3
Design should be modern and attractive
```