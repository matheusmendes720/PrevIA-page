# Deployment Guide

## 🚀 Automated CI/CD Workflow

Your frontend is now set up for **automated deployments**! Here's how it works:

```
Local Development → Git Push → Netlify Auto-Build → Live Deployment
```

---

## Quick Start

### 1. Make Changes Locally

```bash
cd d:\codex\datamaster\senai\gran_prix\frontend

# Make your improvements to the UI
# Edit components, pages, styles, etc.
```

### 2. Test Locally

```bash
# Build with mock data
$env:NEXT_PUBLIC_USE_MOCKS="true"
npm run build:npm

# Test the build locally (optional)
npx serve out
```

### 3. Commit and Push

```bash
git add -A
git commit -m "feat: your improvement description"
git push origin demo/frontend-improvements-v2.0.0
```

### 4. Auto-Deploy! ✨

Netlify automatically:
- ✅ Detects your push
- ✅ Builds the static site with `NEXT_PUBLIC_USE_MOCKS=true`
- ✅ Deploys to production
- ✅ Updates https://previa-novacorrente.netlify.app/main

---

## Project Information

**Site Details:**
- **Project Name**: `previa-novacorrente`
- **Owner**: SANTANA  
- **Project ID**: `269e6f2c-f523-40d1-a96e-36c8be4704ed`
- **Live URL**: https://previa-novacorrente.netlify.app/main
- **Admin URL**: https://app.netlify.com/sites/previa-novacorrente-web

**Git Configuration:**
- **Repository**: https://github.com/matheusmendes720/PrevIA-page
- **Current Branch**: `demo/frontend-improvements-v2.0.0`
- **Default Branch**: `master`

---

## Connecting Netlify to Git

To enable automated deployments, connect your Git repository to Netlify:

### Option 1: Via Netlify Dashboard (Recommended)

1. Go to https://app.netlify.com/sites/previa-novacorrente-web/settings
2. Click **Build & deploy** → **Continuous deployment**
3. Click **Link repository**
4. Select **GitHub** and authorize
5. Choose repository: `matheusmendes720/PrevIA-page`
6. Configure:
   - **Branch**: `demo/frontend-improvements-v2.0.0` (or `master` for production)
   - **Build command**: `NEXT_PUBLIC_USE_MOCKS=true npm run build:npm`
   - **Publish directory**: `out`
7. Add environment variable:
   - **Key**: `NEXT_PUBLIC_USE_MOCKS`
   - **Value**: `true`

### Option 2: Via Netlify CLI

```bash
cd d:\codex\datamaster\senai\gran_prix\frontend

# Link to existing site
npx netlify-cli link --id 269e6f2c-f523-40d1-a96e-36c8be4704ed

# Enable continuous deployment
npx netlify-cli sites:update --repo https://github.com/matheusmendes720/PrevIA-page
```

---

## Branch Strategy

### Current Setup

- **Development Branch**: `demo/frontend-improvements-v2.0.0`
- **Production Branch**: `master` (to be configured)

### Recommended Workflow

```
feature/new-ui
    ↓ (PR)
demo/frontend-improvements-v2.0.0  ← Deploy previews
    ↓ (merge when ready)
master  ← Production deployments
```

### Enable Deploy Previews

In Netlify settings:
1. **Deploy Previews**: Enable for Pull Requests
2. **Branch deploys**: Enable for `demo/frontend-improvements-v2.0.0`

This gives you:
- **Production URL**: https://previa-novacorrente.netlify.app (from `master`)
- **Staging URL**: https://demo--previa-novacorrente.netlify.app (from demo branch)
- **PR Previews**: Unique URL for each pull request

---

## Environment Variables

All builds use mock data. The following environment variables are set:

| Variable | Value | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_USE_MOCKS` | `true` | Enable mock data mode |
| `NODE_VERSION` | `20` | Node.js version for builds |
| `NEXT_TELEMETRY_DISABLED` | `1` | Disable Next.js telemetry |

---

## Build Configuration

The build process is defined in [`netlify.toml`](file:///d:/codex/datamaster/senai/gran_prix/frontend/netlify.toml):

```toml
[build]
  command = "NEXT_PUBLIC_USE_MOCKS=true npm run build:npm"
  publish = "out"
```

**Key Points:**
- ✅ `out` directory is in `.gitignore` (never committed)
- ✅ Built fresh on every deployment
- ✅ Uses mock data (no backend required)
- ✅ Static export for maximum performance

---

## Troubleshooting

### Build Fails

**Check build logs**: https://app.netlify.com/sites/previa-novacorrente-web/deploys

Common issues:
- Missing environment variables
- Type errors (run `npm run lint` locally)
- Build command incorrect

### Deploy Not Triggering

1. Verify Git connection in Netlify dashboard
2. Check branch name matches configuration
3. Ensure webhook is configured (auto-created by Netlify)

### Out Directory in Git

If you accidentally committed the `out` directory:

```bash
git rm -r --cached out
git commit -m "chore: remove out directory from git"
git push
```

---

## Next Steps

🎯 **You're all set!** Now you can:

1. ✅ Make UI improvements locally
2. ✅ Push to Git
3. ✅ Netlify auto-deploys
4. ✅ View changes at https://previa-novacorrente.netlify.app/main

**Happy coding!** 🚀
