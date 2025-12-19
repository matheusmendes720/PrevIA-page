# Gran Prix Frontend - Deployment Guide

## Quick Deploy to Netlify

### Prerequisites
- [Bun](https://bun.sh/) installed globally
- Netlify account (free tier works)
- Git repository connected to Netlify

### Option 1: Automated Deployment via Git

1. **Push to Git Repository**
   ```bash
   git add .
   git commit -m "feat: optimize frontend for Netlify deployment with Bun"
   git push origin main
   ```

2. **Netlify will automatically:**
   - Install Bun
   - Run `bun install`
   - Execute `bun run build`
   - Deploy to CDN

### Option 2: Manual Deployment with CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Run Deployment Script**
   
   On Windows:
   ```powershell
   cd frontend
   .\scripts\deploy-netlify.bat
   ```
   
   On macOS/Linux:
   ```bash
   cd frontend
   chmod +x scripts/deploy-netlify.sh
   ./scripts/deploy-netlify.sh
   ```

### Option 3: Local Build & Test

1. **Install Dependencies**
   ```bash
   cd frontend
   bun install
   ```

2. **Run Development Server**
   ```bash
   bun run dev
   # Opens at http://localhost:3003
   ```

3. **Build for Production**
   ```bash
   bun run build
   ```

4. **Test Production Build**
   ```bash
   bun run start
   # Opens at http://localhost:3003
   ```

## Performance Optimizations Implemented

### 1. Bun Runtime ⚡
- **3-5x faster** than npm for installs
- **2-3x faster** builds with native bundler
- Configured in `bunfig.toml` and `package.json`

### 2. Lazy Loading & Code Splitting 📦
- Dynamic imports for all heavy components
- Separate chunks for chart libraries
- Route-based code splitting
- Implemented in `src/lib/lazy-imports.ts`

### 3. Mock Data Services 🎭
- Centralized mock data in `src/mocks/`
- No API calls needed for demo
- Instant page loads
- Easy to switch to real API later

### 4. Route Prefetching 🚀
- FastLink component prefetches on hover
- Smart prefetching based on user behavior
- Implemented in `src/components/FastLink.tsx`

### 5. Chart Optimizations 📊
- React.memo wrapping for all charts
- useMemo for data transformations
- Prevents unnecessary re-renders

### 6. Skeleton Screens 💀
- Beautiful loading states
- Shimmer animations
- Located in `src/components/skeletons/`

### 7. Static Generation 📄
- Force-static export for feature pages
- Revalidation every hour
- Faster time-to-interactive

## Expected Performance Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Initial Load | ~13s | <3s | 77% faster |
| Route Switch | 7-14s | <1s | 85% faster |
| Module Count | 1792 | <500 | 72% reduction |
| Time to Interactive | ~15s | <4s | 73% faster |
| Lighthouse Score | ~60 | >90 | +50% |

## Troubleshooting

### Build Fails

**Problem:** `error: Cannot find module`
**Solution:** Clear cache and reinstall
```bash
rm -rf node_modules .next bun.lockb
bun install
bun run build
```

### Slow Build on Netlify

**Problem:** Build takes >10 minutes
**Solution:** Check Netlify build logs - Bun installation should be fast. If slow, verify `netlify.toml` has correct Bun setup.

### 404 on Routes

**Problem:** Direct URL navigation returns 404
**Solution:** Verify `_redirects` file exists in `public/` directory:
```
/*    /index.html   200
```

### Chart.js Not Loading

**Problem:** Climate/Business pages show "Loading..."
**Solution:** Charts use CDN. Check browser console for blocked scripts.

## Environment Variables

Create `.env.local` for development:
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_USE_MOCK_DATA=true
```

Production (set in Netlify):
```bash
NEXT_PUBLIC_API_URL=https://gran-prix-api.netlify.app
NEXT_PUBLIC_USE_MOCK_DATA=true
NODE_ENV=production
```

## Testing Checklist

Before deploying, verify:

- [ ] `bun install` completes without errors
- [ ] `bun run build` succeeds
- [ ] `bun run start` serves the app correctly
- [ ] All routes accessible (/, /main, /features/*)
- [ ] Charts render with mock data
- [ ] Navigation is fast (<1s between pages)
- [ ] No console errors in browser
- [ ] Mobile responsive
- [ ] Lighthouse score >90

## Monitoring

After deployment:

1. **Check Lighthouse Scores**
   - Performance: Target >90
   - Accessibility: Target >95
   - Best Practices: Target >95
   - SEO: Target >90

2. **Verify Core Web Vitals**
   - LCP (Largest Contentful Paint): <2.5s
   - FID (First Input Delay): <100ms
   - CLS (Cumulative Layout Shift): <0.1

3. **Test All Features**
   - Main dashboard loads
   - All 10 feature pages accessible
   - Charts render correctly
   - Mock data displays properly
   - Navigation smooth

## Rollback

If deployment fails:

1. **Revert in Netlify UI**
   - Go to Deploys tab
   - Click on previous successful deploy
   - Click "Publish deploy"

2. **Revert Git Commit**
   ```bash
   git revert HEAD
   git push origin main
   ```

## Support

For issues:
1. Check Netlify build logs
2. Verify all optimizations are in place
3. Test locally with `bun run build && bun run start`
4. Review this guide's troubleshooting section

## Next Steps

1. Connect custom domain in Netlify
2. Enable HTTPS (automatic with Netlify)
3. Set up monitoring (Sentry, etc.)
4. Configure CI/CD for automatic deploys
5. Switch mock data to real API when ready

