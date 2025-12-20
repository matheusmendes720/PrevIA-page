# 🚀 Netlify Deployment Guide

Complete guide for deploying the Gran Prix frontend to Netlify.

## ✅ Pre-Deployment Checklist

- [ ] All tests passing (`npm run test`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] Environment variables documented in `.env.example`
- [ ] `netlify.toml` configured
- [ ] Git repository is up to date

## 📋 Quick Deploy (5 Minutes)

### Option 1: Git Integration (Recommended)

1. **Connect Repository to Netlify**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click **"Add new site"** → **"Import an existing project"**
   - Connect your Git provider (GitHub/GitLab/Bitbucket)
   - Select the `gran_prix` repository

2. **Configure Build Settings**
   - **Base directory**: `frontend`
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `.next` (automatically handled by @netlify/plugin-nextjs)

3. **Set Environment Variables**
   - Go to **Site settings** → **Environment variables**
   - Add the following (see `.env.example`):
     ```
     NEXT_PUBLIC_API_URL=https://your-api-url.com
     NEXT_PUBLIC_GEMINI_API_KEY=your_key_here (optional)
     NODE_ENV=production
     ```

4. **Deploy**
   - Click **"Deploy site"**
   - Netlify will automatically build and deploy

### Option 2: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Navigate to frontend directory
cd frontend

# Initialize Netlify (first time only)
netlify init

# Deploy to production
netlify deploy --prod
```

### Option 3: Drag & Drop (Testing Only)

```bash
# Build locally
cd frontend
npm install
npm run build

# Drag the .next folder to app.netlify.com/drop
```

## 🔧 Configuration Files

### `netlify.toml`
Main configuration file with build settings, headers, and redirects. The `@netlify/plugin-nextjs` plugin automatically handles:
- Next.js routing
- Serverless functions
- ISR (Incremental Static Regeneration)
- Image optimization

### Environment Variables

Set these in **Netlify Dashboard** → **Site settings** → **Environment variables**:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL |
| `NEXT_PUBLIC_GEMINI_API_KEY` | No | Gemini AI API key for AI features |
| `NODE_ENV` | Yes | Set to `production` |
| `NEXT_TELEMETRY_DISABLED` | No | Disables Next.js telemetry (default: 1) |

## 🏗️ Build Process

Netlify will:
1. Install dependencies (`npm install`)
2. Run build command (`npm run build`)
3. Use `@netlify/plugin-nextjs` to optimize output
4. Deploy to CDN

## 📊 Performance Optimizations

### Automatic Optimizations
- ✅ Code splitting (configured in `next.config.js`)
- ✅ Image optimization (Next.js Image component)
- ✅ Static asset caching (configured in `netlify.toml`)
- ✅ Gzip compression
- ✅ CDN distribution

### Manual Optimizations
- Chart libraries are lazy-loaded
- Heavy components use dynamic imports
- Mock data services for faster development

## 🔒 Security Headers

Configured in `netlify.toml`:
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

## 🐛 Troubleshooting

### Build Fails

**Error: Cannot find module**
```bash
# Solution: Ensure package.json has all dependencies
npm install
```

**Error: Build timeout**
```bash
# Solution: Optimize build or use Netlify build plugins
# Check build logs in Netlify dashboard
```

**Error: Environment variable not found**
```bash
# Solution: Add variables in Netlify dashboard
# Site settings → Environment variables → Add variable
```

### Runtime Errors

**Error: API calls failing**
```bash
# Check NEXT_PUBLIC_API_URL is set correctly
# Verify CORS settings on backend
```

**Error: Images not loading**
```bash
# Add image domain to next.config.js images.domains
# Or use remotePatterns for Netlify domains
```

## 🔄 Continuous Deployment

### Automatic Deploys
- **Production**: Deploys on push to `main` branch
- **Deploy Previews**: Created for pull requests
- **Branch Deploys**: Available for feature branches

### Manual Deploys
- Go to **Deploys** tab
- Click **"Trigger deploy"** → **"Deploy site"**

## 📈 Monitoring

### Build Logs
- View in **Deploys** → Click on deployment → **View build log**

### Function Logs
- View in **Functions** tab (for serverless functions)

### Analytics
- Enable in **Analytics** tab (Netlify Analytics addon)

## 🌐 Custom Domain

1. Go to **Domain settings**
2. Click **"Add custom domain"**
3. Follow DNS configuration instructions
4. Netlify provides free SSL certificates

## 🚨 Rollback

If something goes wrong:
1. Go to **Deploys** tab
2. Find previous working deployment
3. Click **"..."** → **"Publish deploy"**

## 📝 Next Steps

After deployment:
- [ ] Test all pages and features
- [ ] Verify API connections
- [ ] Check mobile responsiveness
- [ ] Run Lighthouse audit
- [ ] Set up monitoring/analytics
- [ ] Configure custom domain (optional)

## 📚 Resources

- [Netlify Next.js Docs](https://docs.netlify.com/integrations/frameworks/nextjs/)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Netlify Plugin Next.js](https://github.com/netlify/netlify-plugin-nextjs)

---

**Need Help?** Check the [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) or [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)
