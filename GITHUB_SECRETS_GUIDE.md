# GitHub Secrets Configuration Guide

## Your Current GitHub Environments

You have these environments set up:
```
├── Production
│   ├── prism (frontend)
│   └── prism-backend
│
├── Preview
│   ├── prism (frontend)
│   └── prism-backend
│
└── develop (can be deleted - redundant)
```

## Recommended Setup for Deploy Hooks

### ✅ Option 1: Repository Secrets (Recommended - Simpler)

**Where**: Settings → Secrets and variables → Actions → **Secrets** tab → **Repository secrets**

**Add these 4 secrets**:

| Secret Name | Type | Value |
|-------------|------|-------|
| `VERCEL_BACKEND_DEPLOY_HOOK_PROD` | Secret | `https://api.vercel.com/v1/integrations/deploy/prj_xxx/yyy` |
| `VERCEL_BACKEND_DEPLOY_HOOK_DEV` | Secret | `https://api.vercel.com/v1/integrations/deploy/prj_xxx/zzz` |
| `VERCEL_FRONTEND_DEPLOY_HOOK_PROD` | Secret | `https://api.vercel.com/v1/integrations/deploy/prj_aaa/bbb` |
| `VERCEL_FRONTEND_DEPLOY_HOOK_DEV` | Secret | `https://api.vercel.com/v1/integrations/deploy/prj_aaa/ccc` |

**Why Repository Secrets?**
- ✅ Simpler - one place for all deploy hooks
- ✅ Works across all branches automatically
- ✅ No need to modify workflow file
- ✅ Deploy hooks are not sensitive (just trigger URLs)

---

### Option 2: Environment Secrets (More Complex - Not Recommended for Deploy Hooks)

If you really want to use environments, here's how:

**Production Environment** (`Production`):
- Add: `VERCEL_BACKEND_DEPLOY_HOOK` → Backend production hook URL
- Add: `VERCEL_FRONTEND_DEPLOY_HOOK` → Frontend production hook URL

**Preview Environment** (`Preview`):
- Add: `VERCEL_BACKEND_DEPLOY_HOOK` → Backend preview hook URL
- Add: `VERCEL_FRONTEND_DEPLOY_HOOK` → Frontend preview hook URL

Then update the workflow:

```yaml
deploy:
  name: Deploy to Vercel
  needs: build-and-test
  runs-on: ubuntu-latest
  environment: ${{ github.ref == 'refs/heads/main' && 'Production' || 'Preview' }}
  if: github.event_name == 'push' && (github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop')
  
  steps:
  - name: Trigger Backend Deployment
    run: |
      curl -X POST "${{ secrets.VERCEL_BACKEND_DEPLOY_HOOK }}"
  
  - name: Trigger Frontend Deployment
    run: |
      curl -X POST "${{ secrets.VERCEL_FRONTEND_DEPLOY_HOOK }}"
```

**Why NOT recommended?**
- ❌ More complex setup
- ❌ Need to configure environment protection rules
- ❌ Requires workflow changes
- ❌ No real benefit for deploy hooks

---

## What Should Go in Each Environment?

### Use Environments For: Sensitive Application Secrets

#### Production Environment
**Environment Secrets** (not variables):
```
GEMINI_API_KEY=sk_prod_xxxxx
PRISMA_DATABASE_URL=postgresql://prod_db_url
POSTGRES_URL=postgresql://prod_postgres_url
DATABASE_URL=file:./prod.db
```

#### Preview Environment
**Environment Secrets** (not variables):
```
GEMINI_API_KEY=sk_preview_xxxxx
PRISMA_DATABASE_URL=postgresql://preview_db_url
POSTGRES_URL=postgresql://preview_postgres_url
DATABASE_URL=file:./preview.db
```

### Use Repository Secrets For: Deploy Hooks

**Repository Secrets**:
```
VERCEL_BACKEND_DEPLOY_HOOK_PROD
VERCEL_BACKEND_DEPLOY_HOOK_DEV
VERCEL_FRONTEND_DEPLOY_HOOK_PROD
VERCEL_FRONTEND_DEPLOY_HOOK_DEV
```

---

## Secrets vs Variables

### When to Use Secrets (Encrypted)
- ✅ API keys
- ✅ Database passwords
- ✅ Authentication tokens
- ✅ Deploy hooks (even though not super sensitive)
- ✅ Anything you don't want visible in logs

### When to Use Variables (Plain Text)
- ✅ Non-sensitive configuration
- ✅ Feature flags (e.g., `ENABLE_ANALYTICS=true`)
- ✅ Public URLs (e.g., `API_URL=https://api.example.com`)
- ✅ Environment names (e.g., `ENV=production`)

**For Deploy Hooks**: Use **Secrets** (even though they're just URLs, it's best practice)

---

## Your Action Plan

### Step 1: Add Repository Secrets (Recommended)

1. Go to: **Settings → Secrets and variables → Actions**
2. Click **Secrets** tab
3. Click **New repository secret**
4. Add all 4 deploy hook secrets

### Step 2: Clean Up Environments (Optional)

You can delete the `develop` environment since it's redundant:
- Keep: `Production` and `Preview`
- Delete: `develop`

### Step 3: Use Environments for Other Secrets

Move your sensitive secrets to the appropriate environments:

**Production Environment**:
- GEMINI_API_KEY (production key)
- Database URLs (production)

**Preview Environment**:
- GEMINI_API_KEY (preview/test key)
- Database URLs (preview)

---

## Current Workflow Compatibility

Your current workflow (`.github/workflows/ci.yml`) is already configured to use **Repository Secrets**:

```yaml
echo "backend_hook=${{ secrets.VERCEL_BACKEND_DEPLOY_HOOK_PROD }}" >> $GITHUB_OUTPUT
echo "frontend_hook=${{ secrets.VERCEL_FRONTEND_DEPLOY_HOOK_PROD }}" >> $GITHUB_OUTPUT
```

This means you just need to:
1. ✅ Add the 4 repository secrets
2. ✅ Done! No workflow changes needed

---

## Quick Reference

### Where to Add Deploy Hooks

```
GitHub Repository
└── Settings
    └── Secrets and variables
        └── Actions
            └── Secrets (tab)
                └── Repository secrets (section)
                    ├── New repository secret
                    │   └── VERCEL_BACKEND_DEPLOY_HOOK_PROD
                    ├── New repository secret
                    │   └── VERCEL_BACKEND_DEPLOY_HOOK_DEV
                    ├── New repository secret
                    │   └── VERCEL_FRONTEND_DEPLOY_HOOK_PROD
                    └── New repository secret
                        └── VERCEL_FRONTEND_DEPLOY_HOOK_DEV
```

### Where to Add Sensitive App Secrets

```
GitHub Repository
└── Settings
    └── Environments
        ├── Production
        │   └── Environment secrets
        │       ├── GEMINI_API_KEY
        │       ├── PRISMA_DATABASE_URL
        │       └── POSTGRES_URL
        │
        └── Preview
            └── Environment secrets
                ├── GEMINI_API_KEY
                ├── PRISMA_DATABASE_URL
                └── POSTGRES_URL
```

---

## Summary

**For Deploy Hooks** → Use **Repository Secrets** ✅
- Simpler
- Already configured in your workflow
- Just add 4 secrets and you're done

**For App Secrets** → Use **Environment Secrets** ✅
- Better organization
- Environment-specific values
- Protection rules available

**Don't use** → Environment Variables for secrets ❌
- Variables are not encrypted
- Only use for non-sensitive config
