# ✅ Netlify Deployment Checklist

## Pre-Deployment Setup

### ✅ Configuration Files Updated

- [x] **netlify.toml** - Optimized for Next.js 14 with @netlify/plugin-nextjs
- [x] **next.config.js** - Added Netlify image domains and standalone output
- [x] **.env.example** - Created with all required environment variables
- [x] **public/_redirects** - Fixed incorrect SPA fallback redirects
- [x] **package.json** - Added @netlify/plugin-nextjs as optional dependency

### Build Configuration

- **Build Command**: `npm install && npm run build:npm`
- **Publish Directory**: `.next` (handled automatically by plugin)
- **Node Version**: 20
- **Base Directory**: `frontend` (when deploying from root)

## Required Environment Variables

Set these in **Netlify Dashboard** → **Site settings** → **Environment variables**:

```
NEXT_PUBLIC_API_URL=https://your-api-url.com
NODE_ENV=production
```

Optional:
```
NEXT_PUBLIC_GEMINI_API_KEY=your_key_here
NEXT_PUBLIC_BFF_URL=https://your-bff-url.com
```

## Quick Deploy Steps

1. **Connect Repository**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Add new site → Import existing project
   - Select your repository

2. **Configure Build**
   - Base directory: `frontend`
   - Build command: `npm install && npm run build:npm`
   - Publish directory: `.next`

3. **Set Environment Variables**
   - Add all variables from `.env.example`

4. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete

## What's Configured

### ✅ Automatic Optimizations
- Next.js routing handled by @netlify/plugin-nextjs
- Serverless functions support
- ISR (Incremental Static Regeneration)
- Image optimization
- Code splitting

### ✅ Security Headers
- X-Frame-Options: DENY
- X-XSS-Protection
- X-Content-Type-Options: nosniff
- Referrer-Policy configured
- Permissions-Policy configured

### ✅ Caching
- Static assets cached for 1 year
- Next.js static files cached properly

### ✅ Redirects
- Root `/` redirects to `/main`
- Client-side routing handled automatically

## Verification

After deployment:
- [ ] Test homepage loads
- [ ] Test navigation between pages
- [ ] Verify API calls work (check browser console)
- [ ] Test on mobile devices
- [ ] Run Lighthouse audit
- [ ] Verify all environment variables are set

## Troubleshooting

See [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md) for detailed troubleshooting guide.

