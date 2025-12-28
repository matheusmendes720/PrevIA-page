# Netlify Setup Checklist

This document provides a checklist for configuring Netlify for automated deployments.

## Site Information

- **Site Name**: `previa-novacorrente`
- **Site ID**: `269e6f2c-f523-40d1-a96e-36c8be4704ed`
- **Live URL**: https://previa-novacorrente.netlify.app/main
- **Admin Dashboard**: https://app.netlify.com/sites/previa-novacorrente-web

## Configuration Checklist

### 1. Git Repository Connection

- [ ] **Connect to GitHub Repository**
  - Go to: Site settings → Build & deploy → Continuous deployment
  - Click "Link repository"
  - Select GitHub and authorize
  - Choose repository: `matheusmendes720/PrevIA-page`
  - Select branch: `demo/frontend-improvements-v2.0.0`

### 2. Build Settings

- [ ] **Build Command**: `NEXT_PUBLIC_USE_MOCKS=true npm run build:npm`
  - Location: Site settings → Build & deploy → Build settings
  - Note: Can also be set in `netlify.toml` (already configured ✅)

- [ ] **Publish Directory**: `out`
  - Location: Site settings → Build & deploy → Build settings
  - Note: Already configured in `netlify.toml` ✅

- [ ] **Base Directory**: (leave empty, root of repo)

### 3. Environment Variables

Set these in: Site settings → Environment variables → Add a variable

- [ ] `NEXT_PUBLIC_USE_MOCKS` = `true`
- [ ] `NODE_ENV` = `production`
- [ ] `NEXT_TELEMETRY_DISABLED` = `1`
- [ ] `NODE_VERSION` = `20` (optional, but recommended)

### 4. Deploy Settings

- [ ] **Production Branch**: `demo/frontend-improvements-v2.0.0`
  - Location: Site settings → Build & deploy → Deploy settings

- [ ] **Branch Deploys**: Enabled
  - Location: Site settings → Build & deploy → Deploy settings
  - Enable "Deploy only the production branch" (optional, for now allow all branches)

- [ ] **Deploy Previews**: Enabled
  - Location: Site settings → Build & deploy → Deploy settings
  - Enable "Deploy pull requests"

### 5. Build Hooks (Optional - for manual triggers)

- [ ] **Create Build Hook** (if needed for manual triggers)
  - Location: Site settings → Build & deploy → Build hooks
  - Useful for triggering builds from external services

## Verification Steps

After configuration, verify:

1. **Test Auto-Deployment**
   ```bash
   cd frontend
   git add .
   git commit -m "test: verify netlify auto-deploy"
   git push origin demo/frontend-improvements-v2.0.0
   ```
   - Check Netlify dashboard for new deploy
   - Verify build succeeds
   - Check live site updates

2. **Check Build Logs**
   - Go to: Deploys tab in Netlify dashboard
   - Click on latest deploy
   - Verify build command runs correctly
   - Check for any errors or warnings

3. **Verify Environment Variables**
   - In build logs, check that `NEXT_PUBLIC_USE_MOCKS=true` is used
   - Verify build outputs to `out/` directory

## Current Configuration Status

### ✅ Already Configured (in netlify.toml)

- Build command with mock data flag
- Publish directory (`out`)
- Security headers
- Cache control headers
- Redirects (root → /main.html)

### ⚠️ Needs Manual Configuration

- Git repository connection (if not already connected)
- Environment variables (set in Netlify dashboard)
- Branch deploy settings

## Quick Setup Commands (Netlify CLI)

If you prefer using Netlify CLI:

```bash
# Install Netlify CLI (if not installed)
npm install -g netlify-cli

# Login to Netlify
netlify login

# Link to existing site
cd frontend
netlify link --id 269e6f2c-f523-40d1-a96e-36c8be4704ed

# Set environment variables (optional, can also do via dashboard)
netlify env:set NEXT_PUBLIC_USE_MOCKS true
netlify env:set NODE_ENV production
netlify env:set NEXT_TELEMETRY_DISABLED 1

# Verify configuration
netlify status
```

## Troubleshooting

### Build Fails

- Check build logs in Netlify dashboard
- Verify environment variables are set
- Ensure `package.json` has all dependencies
- Test build locally: `NEXT_PUBLIC_USE_MOCKS=true npm run build:npm`

### Deploy Not Triggering

- Verify Git repository is connected
- Check branch name matches configuration
- Verify webhook is active (auto-configured when linking repo)
- Try manual deploy: Netlify dashboard → Deploys → Trigger deploy

### Environment Variables Not Working

- Verify variables are set in Netlify dashboard (not just in netlify.toml)
- Check variable names are exact (case-sensitive)
- Redeploy after adding variables
- Check build logs to see what environment variables are available

---

**Last Updated**: 2025-01-11
**Status**: Configuration in progress

