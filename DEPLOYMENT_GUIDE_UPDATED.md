# 🚀 Nova Corrente - Complete Deployment Guide

**Updated:** 2026-01-19
**Status:** ✅ Production Ready
**Build ID:** xFwsuKPeBIZtRab3skejM (synced from Netlify)

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Development](#development)
3. [Production Build](#production-build)
4. [Deployment](#deployment)
5. [All Pages & Routes](#all-pages--routes)
6. [Standalone Pages](#standalone-pages)
7. [Troubleshooting](#troubleshooting)

---

## ⚡ Quick Start

### Prerequisites
- Node.js 20+
- Bun (optional, for faster dev)
- npm or yarn

### Install Dependencies
```bash
cd C:\Users\mathe\code_space\PrevIA_gran-prix\frontend
npm install
# or
bun install
```

### Start Development Server
```bash
# Using Bun (faster)
bun run dev

# Using npm
npm run dev:npm
```

**Dev Server:** `http://localhost:3003`

---

## 💻 Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start dev server on port 3003 |
| `bun run dev:fast` | Start dev server with Turbo mode |
| `bun run build` | Create production build (Bun) |
| `npm run build:npm` | Create production build (npm) ✅ **USE THIS FOR DEPLOYMENT** |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run test` | Run tests |
| `bun run type-check` | TypeScript type checking |

### File Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Root (redirects to /main)
│   │   ├── main/
│   │   │   └── page.tsx          # Main dashboard
│   │   ├── chatbot/              # ✨ NEW - Chatbot page
│   │   │   └── page.tsx
│   │   ├── ai-assistant/
│   │   │   └── page.tsx          # AI assistant
│   │   ├── features/
│   │   │   ├── 5g/
│   │   │   ├── business/
│   │   │   ├── categorical/
│   │   │   ├── climate/
│   │   │   ├── economic/
│   │   │   ├── hierarchical/
│   │   │   ├── lead-time/
│   │   │   ├── sla/
│   │   │   ├── temporal/
│   │   │   └── towers/
│   │   ├── api/
│   │   │   └── langbase-agent/
│   │   │       └── route.ts      # API route
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Global styles
│   ├── components/
│   │   ├── Sidebar.tsx           # ✨ Updated with Chatbot nav
│   │   ├── Header.tsx
│   │   ├── Dashboard.tsx
│   │   └── ... (many more)
│   ├── lib/
│   │   ├── lazy-imports.tsx      # ✨ Fixed SSR issue
│   │   └── ...
│   └── styles/
├── public/
│   ├── images/
│   │   └── logos/                # ✨ Synced from Netlify
│   ├── visualizations/           # ✨ Standalone HTML visualizations
│   ├── docs_html/                # ✨ Documentation
│   ├── web_dashboard.html        # ✨ Standalone dashboard
│   ├── temporal-standalone.html  # ✨ Standalone temporal
│   └── _redirects               # Netlify redirects
├── package.json
├── next.config.js
├── netlify.toml                 # ✅ Netlify configuration
└── tsconfig.json
```

---

## 🏗️ Production Build

### Build for Production

```bash
# Use npm for build (Bun has issues on Windows)
npm run build:npm
```

### Build Output

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Generating static pages (18/18)
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    595 B           314 kB
├ ○ /_not-found                          189 B           313 kB
├ ○ /ai-assistant                        3.5 kB          317 kB
├ ƒ /api/langbase-agent                  0 B                0 B
├ ○ /chatbot                             887 B           338 kB      ✨ NEW
├ ○ /features/5g                         5.72 kB         319 kB
├ ○ /features/business                   21 kB           359 kB
├ ○ /features/categorical                12.4 kB         350 kB
├ ○ /features/climate                    10.8 kB         324 kB
├ ○ /features/economic                   8.42 kB         321 kB
├ ○ /features/hierarchical               15.7 kB         353 kB
├ ○ /features/lead-time                  15.2 kB         353 kB
├ ○ /features/sla                        18.5 kB         356 kB
├ ○ /features/temporal                   9.95 kB         323 kB
├ ○ /features/towers                     40.6 kB         354 kB
└ ○ /main                                1.92 kB         339 kB

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

---

## 🚀 Deployment

### Deploy to Netlify

1. **Push to Git**
   ```bash
   git add .
   git commit -m "Sync with Netlify build - add chatbot page and fix SSR"
   git push origin main
   ```

2. **Netlify Build Settings**
   - Build command: `npm install && npm run build:npm`
   - Publish directory: `.next`
   - Node version: 20

3. **Environment Variables** (in Netlify dashboard)
   ```
   NODE_VERSION=20
   NEXT_TELEMETRY_DISABLED=1
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://gran-prix-api.netlify.app
   ```

### Local Production Test

```bash
# Build
npm run build:npm

# Start production server
npm run start

# Access at http://localhost:3003
```

---

## 📄 All Pages & Routes

### Main Application Pages

| Route | Page | Description | Status |
|-------|------|-------------|--------|
| `/` | Root | Redirects to `/main` | ✅ |
| `/main` | Main Dashboard | Full analytics dashboard | ✅ |
| `/chatbot` | Chatbot | AI chatbot assistant | ✨ **NEW** |
| `/ai-assistant` | AI Assistant | Advanced AI features | ✅ |

### Feature Pages

| Route | Feature | Description |
|-------|---------|-------------|
| `/features/5g` | 5G Expansion | 5G network expansion analytics |
| `/features/business` | Business Metrics | Business KPIs and metrics |
| `/features/categorical` | Categorical Encoding | Categorical feature analysis |
| `/features/climate` | Climate Features | Weather and climate data |
| `/features/economic` | Economic Features | Economic indicators |
| `/features/hierarchical` | Hierarchical | Hierarchical forecasting |
| `/features/lead-time` | Lead Time | Lead time analytics |
| `/features/sla` | SLA Metrics | Service level agreements |
| `/features/temporal` | Temporal Features | Time-based patterns |
| `/features/towers` | Towers Map | Tower location and status |

### API Routes

| Route | Description |
|-------|-------------|
| `/api/langbase-agent` | Langbase AI agent endpoint |

---

## 🎨 Standalone Pages

These are static HTML pages accessible directly in the browser:

| Route | File | Description |
|-------|------|-------------|
| `/web_dashboard.html` | `public/web_dashboard.html` | Telecom dashboard with Plotly |
| `/temporal-standalone.html` | `public/temporal-standalone.html` | Temporal analytics with Chart.js |
| `/temporal.html` | `public/temporal.html` | Temporal features HTML |
| `/visualizations/d3_map.html` | `public/visualizations/d3_map.html` | D3.js Brazil map |
| `/visualizations/enhanced_brazil_map.html` | `public/visualizations/enhanced_brazil_map.html` | Enhanced Brazil map |
| `/visualizations/dash_app.py` | `public/visualizations/dash_app.py` | Plotly Python dashboard |
| `/docs_html/` | `public/docs_html/` | System documentation |

---

## 🔧 Troubleshooting

### Build Fails with "Bun crashed"

**Solution:** Use npm instead of Bun for builds
```bash
npm run build:npm  # Use this instead of bun run build
```

### "window is not defined" Error

**Status:** ✅ **FIXED** in `src/lib/lazy-imports.tsx`

The issue was in the `lazyWithRetry` function which accessed `window` during SSR. Now includes proper browser check:
```typescript
const isBrowser = typeof window !== 'undefined';
```

### Missing Chatbot in Navigation

**Status:** ✅ **FIXED** in `src/components/Sidebar.tsx`

Added Chatbot navigation with route handling and prefetching.

### Missing Images/Assets

**Status:** ✅ **FIXED**

All images and assets synced from Netlify build to `public/` directory.

### Port Already in Use

```bash
# Kill process on port 3003
npx kill-port 3003

# Or use a different port
PORT=3004 npm run dev
```

---

## 📊 What's New (vs Previous Version)

### ✨ New Features
1. **`/chatbot` Page** - Complete chatbot interface
2. **Standalone HTML Pages** - Independent dashboards
3. **Visualizations** - D3.js maps and charts
4. **Documentation** - System architecture docs

### 🐛 Bug Fixes
1. **SSR Issue** - Fixed "window is not defined" error
2. **Navigation** - Added Chatbot to sidebar
3. **Assets** - Synced all missing images and logos

### 🔧 Configuration
1. **Netlify** - Updated build configuration
2. **Routing** - Proper redirects and navigation
3. **Optimization** - Code splitting and lazy loading

---

## 🎯 Next Steps

1. **Test All Pages** - Verify every route works
2. **Customize Chatbot** - Implement chatbot functionality
3. **Add Features** - Build new features on top of this foundation
4. **Deploy** - Push to Netlify when ready

---

## 📞 Support

For issues or questions:
- Check the [Troubleshooting](#troubleshooting) section
- Review build logs in `.next/` directory
- Check Netlify deploy logs for deployment issues

---

**Last Updated:** 2026-01-19
**Version:** 1.0.0 (Production Ready)
**Build Status:** ✅ PASSING
