# 🚀 Deployment Treadmill Workflow

Complete guide for the automated CI/CD pipeline: Local Development → Git Push → Netlify Auto-Deploy

## Overview

The **Deployment Treadmill** is an automated workflow that ensures every code change is automatically tested, built, and deployed to production. This enables rapid iteration and continuous improvement of the frontend.

## Architecture

```
Local Development (frontend/)
    ↓
1. Make changes to UI components/pages
    ↓
2. Test locally (npm run build:npm)
    ↓
3. Commit changes (git add . && git commit)
    ↓
4. Push to remote submodule (git push origin demo/frontend-improvements-v2.0.0)
    ↓
5. Netlify detects push (GitHub webhook)
    ↓
6. Netlify builds (NEXT_PUBLIC_USE_MOCKS=true npm run build:npm)
    ↓
7. Netlify deploys (publishes /out directory)
    ↓
8. Live at https://previa-novacorrente.netlify.app/main
```

## Quick Start Workflow

### 1. Make Changes Locally

```bash
cd d:\codex\datamaster\senai\gran_prix\frontend

# Edit your files (components, pages, styles, etc.)
# Example: vim src/components/Dashboard.tsx
```

### 2. Test Locally (Recommended)

```bash
# Build with mock data
$env:NEXT_PUBLIC_USE_MOCKS="true"
npm run build:npm

# If build succeeds, test the output (optional)
npx serve out
# Visit http://localhost:3000/main
```

### 3. Commit and Push

```bash
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: description of your changes"

# Push to remote (triggers Netlify auto-deploy)
git push origin demo/frontend-improvements-v2.0.0
```

### 4. Verify Deployment

1. **Check Netlify Dashboard**: https://app.netlify.com/sites/previa-novacorrente-web/deploys
2. **Watch Build Logs**: Monitor the build process in real-time
3. **Test Live Site**: https://previa-novacorrente.netlify.app/main (updates automatically)

## Project Configuration

### Netlify Site Details

- **Site Name**: `previa-novacorrente`
- **Site ID**: `269e6f2c-f523-40d1-a96e-36c8be4704ed`
- **Live URL**: https://previa-novacorrente.netlify.app/main
- **Admin Dashboard**: https://app.netlify.com/sites/previa-novacorrente-web

### Git Repository

- **Remote URL**: https://github.com/matheusmendes720/PrevIA-page.git
- **Development Branch**: `demo/frontend-improvements-v2.0.0`
- **Production Branch**: `master` (future use)

### Build Configuration

**netlify.toml:**
```toml
[build]
  command = "NEXT_PUBLIC_USE_MOCKS=true npm run build:npm"
  publish = "out"
```

**Environment Variables** (set in Netlify Dashboard):
- `NEXT_PUBLIC_USE_MOCKS=true` - Enable mock data mode
- `NODE_ENV=production` - Production mode
- `NEXT_TELEMETRY_DISABLED=1` - Disable Next.js telemetry

## Branch Strategy

### Current Setup

- **Development Branch**: `demo/frontend-improvements-v2.0.0`
  - Auto-deploys to Netlify on push
  - Used for active development and testing
  - Deploy previews enabled for PRs

- **Production Branch**: `master`
  - Reserved for stable releases
  - Can be configured for production deployments later

### Recommended Workflow

```
feature/new-ui-feature
    ↓ (create branch locally)
    Make changes and commit
    ↓ (push branch)
    Create Pull Request
    ↓ (PR preview deploy)
    Review on Netlify preview URL
    ↓ (merge PR)
demo/frontend-improvements-v2.0.0
    ↓ (auto-deploy)
    Netlify staging/preview
    ↓ (when stable, merge to)
master
    ↓ (production deploy)
    Production URL
```

## Using Sync Scripts

For convenience, use the provided sync scripts to streamline the workflow:

### Windows

```powershell
.\scripts\sync-frontend-submodule.bat "feat: your commit message"
```

### Linux/Mac

```bash
./scripts/sync-frontend-submodule.sh "feat: your commit message"
```

These scripts will:
1. Stage all changes
2. Commit with your message
3. Push to the remote branch
4. Show deployment status

## Troubleshooting

### Build Fails on Netlify

**Symptoms**: Deployment shows "Failed" status in Netlify dashboard

**Solutions**:
1. **Check Build Logs**: View detailed error messages in Netlify dashboard
2. **Test Locally**: Run `npm run build:npm` locally to catch errors early
3. **Type Errors**: Run `npm run type-check` before pushing
4. **Lint Errors**: Run `npm run lint` and fix issues
5. **Missing Dependencies**: Ensure `package.json` includes all required packages

### Deploy Not Triggering

**Symptoms**: Pushed code but Netlify didn't build

**Solutions**:
1. **Verify Git Connection**: Check Netlify dashboard → Site settings → Build & deploy → Continuous deployment
2. **Check Branch Name**: Ensure you're pushing to `demo/frontend-improvements-v2.0.0` (or the branch configured in Netlify)
3. **Webhook Status**: Verify GitHub webhook is active (auto-configured by Netlify)
4. **Manual Trigger**: Use "Trigger deploy" button in Netlify dashboard as temporary workaround

### Out Directory Committed

**Symptoms**: Git tracking the `out/` directory (should be ignored)

**Fix**:
```bash
# Remove from git cache (keeps local files)
git rm -r --cached out

# Commit the removal
git commit -m "chore: remove out directory from git"

# Push the fix
git push origin demo/frontend-improvements-v2.0.0
```

### Old Preview Image in Social Sharing

**Symptoms**: WhatsApp/Facebook shows old preview image

**Fix**:
1. Update `og-image.png` in `frontend/public/`
2. Clear cache using:
   - Facebook: https://developers.facebook.com/tools/debug/
   - Twitter: https://cards-dev.twitter.com/validator
   - LinkedIn: https://www.linkedin.com/post-inspector/

### Environment Variables Not Applied

**Symptoms**: Build behaves differently than expected (e.g., not using mocks)

**Solutions**:
1. **Check Netlify Dashboard**: Site settings → Environment variables
2. **Verify Variable Names**: Must match exactly (case-sensitive)
3. **Redeploy**: Trigger a new deploy after adding variables
4. **Check netlify.toml**: Environment variables can also be set there

## Best Practices

### Commit Messages

Use conventional commit format:
- `feat: add new feature`
- `fix: resolve bug in component`
- `style: update UI styling`
- `refactor: improve code structure`
- `docs: update documentation`
- `chore: maintenance tasks`

### Testing Before Push

Always test locally before pushing:
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build test
$env:NEXT_PUBLIC_USE_MOCKS="true"
npm run build:npm

# If all pass, proceed to commit and push
```

### Incremental Changes

- Make small, focused commits
- Push frequently to catch issues early
- Use descriptive commit messages
- Keep builds fast by avoiding large changes

### Monitoring Deployments

- Monitor Netlify build logs for warnings
- Check site performance after deployment
- Test critical user flows on live site
- Use Netlify analytics to track performance

## Advanced: GitHub Actions CI (Optional)

For additional validation, GitHub Actions can run checks on PRs:

**Workflow**: `.github/workflows/frontend-ci.yml`
- Runs on pull requests
- Validates: Type checking, Linting, Build test
- Does NOT deploy (Netlify handles deployment)

This provides an extra safety net before code is merged.

## Support & Resources

- **Netlify Docs**: https://docs.netlify.com/
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Git Submodules**: https://git-scm.com/book/en/v2/Git-Tools-Submodules
- **Project Issues**: Create issue in main repository

---

**Happy Deploying!** 🚀

*Last Updated: 2025-01-11*

