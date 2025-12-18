# 🧪 Complete Towers Page Testing Guide

## Quick Start Testing

### Step 1: Start Backend (Terminal 1)
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

### Step 2: Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

### Step 3: Run API Tests (Terminal 3)
```bash
# Install requests if needed
pip install requests

# Run test script
python scripts/test_towers_api.py
```

### Step 4: Manual Browser Testing
1. Open `http://localhost:3003/features/towers`
2. Open DevTools (F12)
3. Follow the checklist below

---

## ✅ Testing Checklist

### Backend API Tests
- [ ] API responds at `http://localhost:8000/api/v1/towers`
- [ ] Returns JSON with towers array
- [ ] Filters work (status, state, priority)
- [ ] Stats endpoint works (`/stats/summary`)
- [ ] Pagination works (limit/offset)

### Frontend Visual Tests
- [ ] Page loads without errors
- [ ] Map displays correctly
- [ ] Markers appear on map
- [ ] Stats cards show numbers
- [ ] Sidebar displays filters
- [ ] No console errors (red)

### Map Functionality
- [ ] Markers cluster when zoomed out
- [ ] Clicking cluster zooms in
- [ ] Clicking marker shows info panel
- [ ] Map controls work (zoom, pan)
- [ ] Map legend displays

### Filters
- [ ] Status filters work (Active/Maintenance/Inactive)
- [ ] Priority filters work (High/Medium/Low)
- [ ] Zone/State filters work
- [ ] Search works (ID, zone, state)
- [ ] Combined filters work together
- [ ] Map updates when filters change

### Export Functions
- [ ] CSV export downloads file
- [ ] JSON export downloads file
- [ ] PDF export opens print dialog
- [ ] Exported data matches filtered results

### Sorting
- [ ] Sort dropdown works
- [ ] Recent sort works
- [ ] Priority sort works (High → Low)
- [ ] Status sort works
- [ ] Name sort works

### Mobile Responsiveness
- [ ] Mobile viewport works (DevTools device mode)
- [ ] Sidebar hides/shows correctly
- [ ] Menu toggle button appears
- [ ] Panels fit on screen
- [ ] Touch interactions work

### Error Handling
- [ ] Backend offline shows error banner
- [ ] Fallback data loads
- [ ] Page remains functional
- [ ] Retry button works

### Performance
- [ ] Page loads in < 3 seconds
- [ ] Map renders smoothly
- [ ] Filters respond quickly (< 100ms)
- [ ] No lag with many towers

---

## 🐛 Common Issues & Fixes

### Issue: Backend not starting
**Fix:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Issue: Frontend not starting
**Fix:**
```bash
cd frontend
npm install
npm run dev
```

### Issue: API connection error
**Check:**
- Backend is running on port 8000
- Frontend env has `NEXT_PUBLIC_API_URL=http://localhost:8000`
- No CORS errors in console

### Issue: Map not rendering
**Check:**
- Leaflet scripts loaded (check Network tab)
- Map container has dimensions
- No JavaScript errors

### Issue: Clustering not working
**Check:**
- Leaflet.markercluster script loaded
- Check console for errors
- Verify clustering code is active

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________
Browser: ___________

### Results
Backend API: ✅ / ❌
Frontend Load: ✅ / ❌
Map Rendering: ✅ / ❌
Filters: ✅ / ❌
Export: ✅ / ❌
Mobile: ✅ / ❌

### Issues:
1. 
2. 

### Notes:


```

---

## 🚀 Quick Browser Console Test

Open browser console on towers page and run:

```javascript
// Quick API Test
async function quickTest() {
  console.log('🧪 Testing...');
  
  try {
    const res = await fetch('http://localhost:8000/api/v1/towers?limit=5');
    const data = await res.json();
    console.log('✅ API:', data.towers?.length || 0, 'towers');
  } catch (e) {
    console.error('❌ API Error:', e.message);
  }
  
  try {
    const res = await fetch('http://localhost:8000/api/v1/towers/stats/summary');
    const data = await res.json();
    console.log('✅ Stats:', data.total_towers || 0, 'total');
  } catch (e) {
    console.error('❌ Stats Error:', e.message);
  }
}

quickTest();
```

---

*Run all tests and check off each item. Report any issues found!*



