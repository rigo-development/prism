# Visual Guide: Deploy Hooks Architecture

## Your Current Setup

```
┌─────────────────────────────────────────────────────────────────┐
│                         GitHub Repository                        │
│                         (Monorepo: Prism)                        │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Frontend   │  │   Backend    │  │    Shared    │          │
│  │ apps/frontend│  │ apps/backend │  │packages/shared│         │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Push to main/develop
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      GitHub Actions CI/CD                        │
│                                                                  │
│  Job 1: build-and-test                                          │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ 1. Install dependencies                                │    │
│  │ 2. Build shared package                                │    │
│  │ 3. Generate Prisma client                              │    │
│  │ 4. Run backend unit tests (19 tests)                   │    │
│  │ 5. Run backend e2e tests (2 tests)                     │    │
│  │ 6. Run frontend tests (49 tests)                       │    │
│  │ 7. Build backend                                       │    │
│  │ 8. Build frontend                                      │    │
│  └────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              │ If tests pass ✅                  │
│                              ▼                                   │
│  Job 2: deploy (only on push to main/develop)                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Determine Environment:                                 │    │
│  │ • main branch → production hooks                       │    │
│  │ • develop branch → preview hooks                       │    │
│  │                                                        │    │
│  │ Trigger Deployments:                                   │    │
│  │ • curl -X POST $BACKEND_HOOK                           │    │
│  │ • curl -X POST $FRONTEND_HOOK                          │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP POST requests
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Vercel Platform                          │
│                                                                  │
│  ┌─────────────────────────┐  ┌─────────────────────────┐      │
│  │   Backend Project       │  │   Frontend Project      │      │
│  │                         │  │                         │      │
│  │ Receives deploy hook    │  │ Receives deploy hook    │      │
│  │         │               │  │         │               │      │
│  │         ▼               │  │         ▼               │      │
│  │ 1. Clone repo           │  │ 1. Clone repo           │      │
│  │ 2. Checkout branch      │  │ 2. Checkout branch      │      │
│  │ 3. Install deps         │  │ 3. Install deps         │      │
│  │ 4. Build backend        │  │ 4. Build frontend       │      │
│  │ 5. Deploy to CDN        │  │ 5. Deploy to CDN        │      │
│  │                         │  │                         │      │
│  │ Production URL:         │  │ Production URL:         │      │
│  │ api.yourapp.com         │  │ yourapp.com             │      │
│  │                         │  │                         │      │
│  │ Preview URL:            │  │ Preview URL:            │      │
│  │ api-dev.yourapp.com     │  │ dev.yourapp.com         │      │
│  └─────────────────────────┘  └─────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

## Deploy Hooks Flow

```
┌──────────────┐
│ Developer    │
│ pushes code  │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│ Which branch?                                            │
├──────────────┬───────────────┬──────────────┬───────────┤
│ main         │ develop       │ feature/*    │ PR        │
└──────┬───────┴───────┬───────┴──────┬───────┴─────┬─────┘
       │               │              │             │
       ▼               ▼              ▼             ▼
┌──────────────┐ ┌──────────────┐ ┌──────────┐ ┌──────────┐
│ Run Tests    │ │ Run Tests    │ │Run Tests │ │Run Tests │
└──────┬───────┘ └──────┬───────┘ └────┬─────┘ └────┬─────┘
       │               │              │             │
       ▼               ▼              ▼             ▼
┌──────────────┐ ┌──────────────┐ ┌──────────┐ ┌──────────┐
│ Tests Pass?  │ │ Tests Pass?  │ │Tests Pass│ │Tests Pass│
└──────┬───────┘ └──────┬───────┘ └────┬─────┘ └────┬─────┘
       │               │              │             │
       ▼               ▼              ▼             ▼
┌──────────────┐ ┌──────────────┐ ┌──────────┐ ┌──────────┐
│ Deploy PROD  │ │ Deploy PREV  │ │ No Deploy│ │ No Deploy│
│              │ │              │ │          │ │          │
│ Backend:     │ │ Backend:     │ │ ❌       │ │ ❌       │
│ PROD hook    │ │ DEV hook     │ │          │ │          │
│              │ │              │ │          │ │          │
│ Frontend:    │ │ Frontend:    │ │          │ │          │
│ PROD hook    │ │ DEV hook     │ │          │ │          │
└──────────────┘ └──────────────┘ └──────────┘ └──────────┘
```

## GitHub Secrets Configuration

```
GitHub Repository Settings
└── Secrets and variables
    └── Actions
        └── Repository secrets
            ├── VERCEL_BACKEND_DEPLOY_HOOK_PROD
            │   └── https://api.vercel.com/v1/integrations/deploy/prj_backend/xxx
            │
            ├── VERCEL_BACKEND_DEPLOY_HOOK_DEV
            │   └── https://api.vercel.com/v1/integrations/deploy/prj_backend/yyy
            │
            ├── VERCEL_FRONTEND_DEPLOY_HOOK_PROD
            │   └── https://api.vercel.com/v1/integrations/deploy/prj_frontend/zzz
            │
            └── VERCEL_FRONTEND_DEPLOY_HOOK_DEV
                └── https://api.vercel.com/v1/integrations/deploy/prj_frontend/www
```

## Vercel Deploy Hooks Configuration

```
Vercel Dashboard
│
├── Backend Project
│   └── Settings
│       └── Git
│           └── Deploy Hooks
│               ├── Backend Production
│               │   ├── Name: Backend Production
│               │   ├── Git Branch: main
│               │   └── URL: https://api.vercel.com/v1/integrations/deploy/prj_backend/xxx
│               │
│               └── Backend Development
│                   ├── Name: Backend Development
│                   ├── Git Branch: develop
│                   └── URL: https://api.vercel.com/v1/integrations/deploy/prj_backend/yyy
│
└── Frontend Project
    └── Settings
        └── Git
            └── Deploy Hooks
                ├── Frontend Production
                │   ├── Name: Frontend Production
                │   ├── Git Branch: main
                │   └── URL: https://api.vercel.com/v1/integrations/deploy/prj_frontend/zzz
                │
                └── Frontend Development
                    ├── Name: Frontend Development
                    ├── Git Branch: develop
                    └── URL: https://api.vercel.com/v1/integrations/deploy/prj_frontend/www
```

## Timeline: What Happens When You Push

```
Time  │ Action
──────┼────────────────────────────────────────────────────────────
0:00  │ 🔵 Developer pushes to develop branch
      │
0:01  │ 🟢 GitHub Actions workflow triggered
      │
0:02  │ ⚙️  Installing dependencies...
      │
0:15  │ ⚙️  Building shared package...
      │
0:20  │ ⚙️  Generating Prisma client...
      │
0:25  │ 🧪 Running backend unit tests (19 tests)...
      │
0:35  │ 🧪 Running backend e2e tests (2 tests)...
      │
0:40  │ 🧪 Running frontend tests (49 tests)...
      │
0:50  │ ⚙️  Building backend...
      │
1:00  │ ⚙️  Building frontend...
      │
1:10  │ ✅ All tests passed!
      │
1:11  │ 🚀 Triggering Vercel deployments...
      │    • POST to Backend DEV hook
      │    • POST to Frontend DEV hook
      │
1:12  │ 🟣 Vercel receives deploy hooks
      │
1:13  │ ⚙️  Vercel: Cloning repository...
      │
1:20  │ ⚙️  Vercel: Building backend...
      │    ⚙️  Vercel: Building frontend...
      │
2:00  │ ✅ Backend deployed to preview URL
      │
2:30  │ ✅ Frontend deployed to preview URL
      │
2:31  │ 🎉 Deployment complete!
```

## Comparison: Before vs After

### Before (Manual Process)

```
Developer                    Vercel Dashboard
    │                             │
    │ 1. Push code                │
    ├──────────────────────────►  │
    │                             │
    │ 2. Wait for tests           │
    │    (check GitHub Actions)   │
    │                             │
    │ 3. Go to Vercel             │
    ├─────────────────────────────┤
    │                             │
    │ 4. Click Deploy (Backend)   │
    ├────────────────────────────►│
    │                             │
    │ 5. Wait...                  │
    │                             │
    │ 6. Click Deploy (Frontend)  │
    ├────────────────────────────►│
    │                             │
    │ 7. Wait...                  │
    │                             │
    │ 8. Done ✅                   │
```

### After (Automated with Deploy Hooks)

```
Developer                    GitHub Actions              Vercel
    │                             │                        │
    │ 1. Push code                │                        │
    ├──────────────────────────►  │                        │
    │                             │                        │
    │                             │ 2. Run tests           │
    │                             │                        │
    │                             │ 3. Tests pass ✅        │
    │                             │                        │
    │                             │ 4. Trigger hooks       │
    │                             ├───────────────────────►│
    │                             │                        │
    │                             │                        │ 5. Deploy both
    │                             │                        │    projects
    │                             │                        │
    │ 6. Done ✅                   │                        │ ✅
    │    (automatically!)         │                        │
```

## Key Takeaways

1. **One Repo, Two Projects**: Your monorepo stays organized, but deploys separately
2. **Quality Gate**: Tests must pass before deployment
3. **Environment Separation**: `main` = production, `develop` = preview
4. **Fully Automated**: Push code → Tests run → Deploys happen
5. **Independent Deployments**: Frontend and backend deploy in parallel
6. **Safe**: PRs and feature branches don't auto-deploy

## What You Need to Do

1. ✅ Review the updated `.github/workflows/ci.yml`
2. 🔲 Create 4 deploy hooks in Vercel (2 per project)
3. 🔲 Add 4 secrets to GitHub
4. 🔲 Test with a push to `develop`
5. 🔲 Verify deployments in Vercel
6. ✅ Enjoy automated deployments! 🎉
