# Vercel Deploy Hooks Setup Guide

## Overview

This guide explains how to set up automated deployments using Vercel Deploy Hooks integrated with GitHub Actions.

## How It Works

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐      ┌──────────┐
│ Git Push to │ ───▶ │ GitHub       │ ───▶ │ Tests Pass  │ ───▶ │ Trigger  │
│ main/develop│      │ Actions CI   │      │ ✅          │      │ Vercel   │
└─────────────┘      └──────────────┘      └─────────────┘      └──────────┘
                                                                       │
                                                                       ▼
                                            ┌──────────────────────────────────┐
                                            │  Vercel Builds & Deploys         │
                                            │  • Frontend (separate project)   │
                                            │  • Backend (separate project)    │
                                            └──────────────────────────────────┘
```

### Workflow Steps

1. **Developer pushes code** to `main` or `develop` branch
2. **GitHub Actions runs CI pipeline**:
   - Install dependencies
   - Build shared package
   - Run all tests (backend unit, backend e2e, frontend)
   - Build both apps
3. **If all tests pass**:
   - Trigger Backend Deploy Hook → Vercel builds & deploys backend
   - Trigger Frontend Deploy Hook → Vercel builds & deploys frontend
4. **If tests fail**: Deployment is blocked ❌

## Step 1: Get Deploy Hooks from Vercel

### For Backend Project

1. Go to your Vercel Dashboard
2. Select your **Backend** project
3. Navigate to **Settings** → **Git** → **Deploy Hooks**
4. Create two deploy hooks:

   **Production Hook:**
   - Name: `Backend Production`
   - Git Branch: `main`
   - Copy the generated URL (looks like: `https://api.vercel.com/v1/integrations/deploy/...`)

   **Preview/Development Hook:**
   - Name: `Backend Development`
   - Git Branch: `develop`
   - Copy the generated URL

### For Frontend Project

1. Select your **Frontend** project
2. Navigate to **Settings** → **Git** → **Deploy Hooks**
3. Create two deploy hooks:

   **Production Hook:**
   - Name: `Frontend Production`
   - Git Branch: `main`
   - Copy the generated URL

   **Preview/Development Hook:**
   - Name: `Frontend Development`
   - Git Branch: `develop`
   - Copy the generated URL

## Step 2: Add Secrets to GitHub

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following 4 secrets:

   | Secret Name | Value | Description |
   |-------------|-------|-------------|
   | `VERCEL_BACKEND_DEPLOY_HOOK_PROD` | Backend production hook URL | Triggers backend deployment for `main` |
   | `VERCEL_BACKEND_DEPLOY_HOOK_DEV` | Backend development hook URL | Triggers backend deployment for `develop` |
   | `VERCEL_FRONTEND_DEPLOY_HOOK_PROD` | Frontend production hook URL | Triggers frontend deployment for `main` |
   | `VERCEL_FRONTEND_DEPLOY_HOOK_DEV` | Frontend development hook URL | Triggers frontend deployment for `develop` |

## Step 3: Verify Configuration

### Test the Setup

1. **Create a test commit**:
   ```bash
   git checkout develop
   echo "# Test" >> README.md
   git add README.md
   git commit -m "test: verify deploy hooks"
   git push origin develop
   ```

2. **Watch GitHub Actions**:
   - Go to **Actions** tab in your GitHub repo
   - You should see the CI/CD workflow running
   - Wait for tests to pass
   - Check the "Deploy to Vercel" job

3. **Verify Vercel Deployments**:
   - Go to Vercel Dashboard
   - Check both Frontend and Backend projects
   - You should see new deployments triggered

## How Deployments Work

### Branch-Based Deployment Strategy

| Branch | Environment | What Happens |
|--------|-------------|--------------|
| `main` | Production | Deploys to production URLs with production environment variables |
| `develop` | Preview | Deploys to preview URLs with development environment variables |
| `feature/*` | No auto-deploy | Only runs tests, no deployment |
| Pull Requests | No auto-deploy | Only runs tests, no deployment |

### Environment Variables on Vercel

Make sure you have the correct environment variables set for each project:

**Backend Project:**
- Production: `PRISMA_DATABASE_URL`, `GEMINI_API_KEY`, etc.
- Preview: Same variables but potentially different values

**Frontend Project:**
- Production: `VITE_API_URL` pointing to production backend
- Preview: `VITE_API_URL` pointing to preview backend

## Advanced Configuration

### Deploy Only Changed Apps

If you want to deploy only the app that changed, you can modify the workflow to detect changes:

```yaml
- name: Check Backend Changes
  id: backend-changes
  run: |
    if git diff --name-only ${{ github.event.before }} ${{ github.sha }} | grep -q '^apps/backend/\|^packages/shared/'; then
      echo "changed=true" >> $GITHUB_OUTPUT
    else
      echo "changed=false" >> $GITHUB_OUTPUT
    fi

- name: Trigger Backend Deployment
  if: steps.backend-changes.outputs.changed == 'true'
  run: curl -X POST "${{ steps.env.outputs.backend_hook }}"
```

### Manual Deployment Trigger

You can also trigger deployments manually via GitHub Actions:

```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy'
        required: true
        type: choice
        options:
          - production
          - preview
```

## Monitoring Deployments

### GitHub Actions Logs
- View detailed logs in the **Actions** tab
- Each deployment shows which hooks were triggered

### Vercel Dashboard
- Real-time deployment status
- Build logs for debugging
- Deployment URLs

### Notifications
Consider adding Slack/Discord notifications:

```yaml
- name: Notify Deployment
  if: success()
  run: |
    curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
      -H 'Content-Type: application/json' \
      -d '{"text":"✅ Deployed to ${{ steps.env.outputs.environment }}"}'
```

## Troubleshooting

### Deployments Not Triggering

1. **Check GitHub Secrets**: Ensure all 4 deploy hook URLs are correctly set
2. **Verify Branch Names**: Make sure you're pushing to `main` or `develop`
3. **Check Workflow Conditions**: PRs don't trigger deployments by design
4. **Review GitHub Actions Logs**: Look for errors in the deploy job

### Tests Failing

- Deployments are blocked if tests fail
- Fix the tests first, then push again
- Check the CI logs to see which test failed

### Wrong Environment Deployed

- Verify the branch you pushed to
- Check the "Determine Environment" step in GitHub Actions logs
- Ensure deploy hooks are mapped to correct branches in Vercel

## Benefits of This Setup

✅ **Automated Deployments**: No manual deployment needed
✅ **Quality Gate**: Only deploys if tests pass
✅ **Separate Environments**: Production and preview environments
✅ **Independent Projects**: Frontend and backend deploy separately
✅ **Fast Feedback**: See deployment status in GitHub Actions
✅ **Rollback Safety**: Each deployment is versioned in Vercel

## Alternative: Vercel GitHub Integration

**Note**: You could also use Vercel's native GitHub integration, but the Deploy Hooks approach gives you:
- More control over when deployments happen
- Ability to run tests before deploying
- Custom deployment logic
- Works with monorepos more predictably

## Next Steps

1. ✅ Set up deploy hooks in Vercel
2. ✅ Add secrets to GitHub
3. ✅ Test with a commit to `develop`
4. ✅ Verify deployments in Vercel
5. ✅ Merge to `main` for production deployment
