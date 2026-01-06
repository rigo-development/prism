# Quick Answer: Where to Add Deploy Hooks

## ✅ Use Repository Secrets (Recommended)

### Location
```
Settings → Secrets and variables → Actions → Secrets → Repository secrets
```

### Add These 4 Secrets

| Secret Name | Get From Vercel |
|-------------|-----------------|
| `VERCEL_BACKEND_DEPLOY_HOOK_PROD` | Backend Project → Settings → Deploy Hooks → main branch |
| `VERCEL_BACKEND_DEPLOY_HOOK_DEV` | Backend Project → Settings → Deploy Hooks → develop branch |
| `VERCEL_FRONTEND_DEPLOY_HOOK_PROD` | Frontend Project → Settings → Deploy Hooks → main branch |
| `VERCEL_FRONTEND_DEPLOY_HOOK_DEV` | Frontend Project → Settings → Deploy Hooks → develop branch |

### Type
- ✅ **Secrets** (encrypted, hidden in logs)
- ❌ NOT Variables (plain text, visible)

## Why Repository Secrets?

✅ **Simpler** - One place for all hooks
✅ **Already configured** - Your workflow is ready
✅ **No changes needed** - Just add secrets and go

## Your Environments (Keep for Other Secrets)

Your GitHub Environments are perfect for **application secrets**:

### Production Environment
Use for:
- `GEMINI_API_KEY` (production)
- `PRISMA_DATABASE_URL` (production)
- Other production secrets

### Preview Environment
Use for:
- `GEMINI_API_KEY` (preview/test)
- `PRISMA_DATABASE_URL` (preview)
- Other preview secrets

### develop Environment
Can be **deleted** - it's redundant with Preview

## Summary

```
Deploy Hooks → Repository Secrets ✅
App Secrets  → Environment Secrets ✅
```

That's it! Add the 4 repository secrets and you're ready to deploy! 🚀
