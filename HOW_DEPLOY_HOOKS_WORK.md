# How Vercel Deploy Hooks Work with Your Monorepo

## The Problem

You have:
- **1 GitHub Repository** (monorepo with frontend + backend)
- **2 Vercel Projects** (separate deployments for FE and BE)
- **1 GitHub Actions CI** (runs tests for both)

**Challenge**: How do you deploy both projects automatically after tests pass?

## The Solution: Deploy Hooks

### What are Deploy Hooks?

Deploy Hooks are **unique URLs** provided by Vercel that trigger a deployment when called via HTTP POST.

Think of them as "deployment buttons" that you can press programmatically.

### How They Work

1. **Vercel gives you a URL** for each project (e.g., `https://api.vercel.com/v1/integrations/deploy/prj_xxx/yyy`)
2. **You call that URL** with a simple `curl -X POST <URL>`
3. **Vercel starts building and deploying** that specific project

## Your Complete Workflow

### Step-by-Step Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Developer pushes code to GitHub (main or develop branch)    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. GitHub Actions CI Pipeline Starts                            │
│    ├─ Install dependencies                                      │
│    ├─ Build shared package                                      │
│    ├─ Generate Prisma client                                    │
│    ├─ Run backend unit tests                                    │
│    ├─ Run backend e2e tests                                     │
│    ├─ Run frontend tests                                        │
│    ├─ Build backend                                             │
│    └─ Build frontend                                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │  Tests Pass?    │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                   YES               NO
                    │                 │
                    ▼                 ▼
         ┌──────────────────┐   ┌──────────┐
         │ Deploy Job Runs  │   │ STOP ❌  │
         │ (only on push)   │   │ No Deploy│
         └────────┬─────────┘   └──────────┘
                  │
                  ▼
         ┌──────────────────┐
         │ Determine Branch │
         │ main → prod      │
         │ develop → preview│
         └────────┬─────────┘
                  │
         ┌────────┴────────┐
         │                 │
         ▼                 ▼
┌────────────────┐  ┌────────────────┐
│ curl -X POST   │  │ curl -X POST   │
│ BACKEND_HOOK   │  │ FRONTEND_HOOK  │
└────────┬───────┘  └────────┬───────┘
         │                   │
         ▼                   ▼
┌────────────────┐  ┌────────────────┐
│ Vercel Backend │  │ Vercel Frontend│
│ Project Builds │  │ Project Builds │
│ & Deploys      │  │ & Deploys      │
└────────────────┘  └────────────────┘
```

## Detailed Explanation

### Phase 1: GitHub Actions CI (build-and-test job)

**When**: Runs on every push and PR to `main` or `develop`

**What it does**:
- Installs all dependencies
- Builds the shared package (used by both FE and BE)
- Generates Prisma client for database
- Runs **all tests** (49 frontend + 21 backend = 70 tests)
- Builds both applications to verify they compile

**Result**: Either ✅ passes or ❌ fails

### Phase 2: GitHub Actions Deploy (deploy job)

**When**: Only runs if:
- ✅ Tests passed
- ✅ It's a push event (not a PR)
- ✅ Branch is `main` or `develop`

**What it does**:

1. **Determines environment**:
   - `main` branch → Use production deploy hooks
   - `develop` branch → Use preview deploy hooks

2. **Triggers Backend Deployment**:
   ```bash
   curl -X POST "$VERCEL_BACKEND_DEPLOY_HOOK_PROD"
   ```
   This tells Vercel: "Hey, build and deploy the backend project!"

3. **Triggers Frontend Deployment**:
   ```bash
   curl -X POST "$VERCEL_FRONTEND_DEPLOY_HOOK_PROD"
   ```
   This tells Vercel: "Hey, build and deploy the frontend project!"

### Phase 3: Vercel Builds & Deploys

**What Vercel does** (for each project):

1. **Clones your repo** from GitHub
2. **Checks out the correct branch** (main or develop)
3. **Runs the build command** you configured in Vercel
4. **Deploys the output** to their CDN
5. **Assigns a URL**:
   - Production: `your-app.vercel.app`
   - Preview: `your-app-git-develop.vercel.app`

## Key Points

### 1. Independent Builds

Even though they're in the same repo, Vercel builds each project **independently**:

- **Backend build**: Only includes `apps/backend` and `packages/shared`
- **Frontend build**: Only includes `apps/frontend` and `packages/shared`

### 2. Environment-Specific Hooks

You have **4 deploy hooks total**:

| Hook | Project | Branch | Environment |
|------|---------|--------|-------------|
| `VERCEL_BACKEND_DEPLOY_HOOK_PROD` | Backend | main | Production |
| `VERCEL_BACKEND_DEPLOY_HOOK_DEV` | Backend | develop | Preview |
| `VERCEL_FRONTEND_DEPLOY_HOOK_PROD` | Frontend | main | Production |
| `VERCEL_FRONTEND_DEPLOY_HOOK_DEV` | Frontend | develop | Preview |

### 3. GitHub Secrets

These hooks are stored as **GitHub Secrets** so:
- ✅ They're encrypted and secure
- ✅ They're not visible in logs
- ✅ They're available to GitHub Actions

### 4. Pull Requests Don't Deploy

The workflow is configured to:
- ✅ Run tests on PRs
- ❌ NOT deploy on PRs

This prevents deploying untested/unreviewed code.

## Example Scenarios

### Scenario 1: Feature Development

```bash
# You're working on a feature
git checkout -b feature/new-ui
# ... make changes ...
git commit -m "feat: add new UI"
git push origin feature/new-ui
```

**What happens**:
- ✅ GitHub Actions runs tests
- ❌ No deployment (feature branch)

### Scenario 2: Merge to Develop

```bash
# Create PR and merge to develop
git checkout develop
git merge feature/new-ui
git push origin develop
```

**What happens**:
- ✅ GitHub Actions runs tests
- ✅ Tests pass
- ✅ Triggers PREVIEW deployment
- ✅ Backend deploys to preview URL
- ✅ Frontend deploys to preview URL

### Scenario 3: Production Release

```bash
# Merge develop to main
git checkout main
git merge develop
git push origin main
```

**What happens**:
- ✅ GitHub Actions runs tests
- ✅ Tests pass
- ✅ Triggers PRODUCTION deployment
- ✅ Backend deploys to production URL
- ✅ Frontend deploys to production URL

### Scenario 4: Tests Fail

```bash
git push origin develop
```

**What happens**:
- ✅ GitHub Actions runs tests
- ❌ Tests fail
- ❌ Deploy job is skipped
- ❌ Nothing gets deployed

## Benefits of This Approach

### ✅ Quality Gate
- Code must pass all tests before deploying
- Prevents broken code from reaching production

### ✅ Automated
- No manual deployment needed
- Just push to the right branch

### ✅ Environment Separation
- `develop` → Preview environment for testing
- `main` → Production environment for users

### ✅ Independent Scaling
- Frontend and backend can deploy independently
- If backend fails, frontend still deploys (and vice versa)

### ✅ Audit Trail
- Every deployment is logged in GitHub Actions
- You can see exactly what was deployed and when

## Comparison: With vs Without Deploy Hooks

### Without Deploy Hooks (Manual)
```
1. Push code to GitHub
2. Wait for tests to pass
3. Go to Vercel dashboard
4. Click "Deploy" on backend project
5. Wait for backend to deploy
6. Click "Deploy" on frontend project
7. Wait for frontend to deploy
```

### With Deploy Hooks (Automated)
```
1. Push code to GitHub
2. ✨ Everything else happens automatically ✨
```

## Troubleshooting

### "Deployment didn't trigger"

**Check**:
1. Did you push to `main` or `develop`? (not a feature branch)
2. Did tests pass?
3. Are the GitHub Secrets set correctly?
4. Is it a push event (not a PR)?

### "Only one project deployed"

**Check**:
1. Are both deploy hooks set in GitHub Secrets?
2. Check GitHub Actions logs for errors
3. Verify both hooks are valid in Vercel

### "Wrong environment deployed"

**Check**:
1. Which branch did you push to?
2. Check the "Determine Environment" step in GitHub Actions
3. Verify hook URLs match the correct branches in Vercel

## Summary

**Deploy Hooks = Remote Control for Vercel**

Instead of manually clicking "Deploy" in Vercel, you:
1. Store special URLs as GitHub Secrets
2. Call those URLs from GitHub Actions after tests pass
3. Vercel receives the call and starts deploying

This gives you:
- Automated deployments
- Quality gates (tests must pass)
- Environment separation (preview vs production)
- Full control over when and what deploys

It's like having a CI/CD pipeline that works perfectly with your monorepo setup! 🚀
