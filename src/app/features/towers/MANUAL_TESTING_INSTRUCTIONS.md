# 🧪 Manual Testing Instructions

## Quick Start

### 1. Start Backend Server
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

### 2. Start Frontend Server
```bash
cd frontend
npm run dev
```

**Expected Output:**
```
- ready started server on 0.0.0.0:3003
- Local:        http://localhost:3003
```

### 3. Open Browser
Navigate to: `http://localhost:3003/features/towers`

---

## ✅ Testing Checklist

### Initial Load
- [ ] Page loads without errors
- [ ] Loading spinner appears briefly
- [ ] Map displays correctly
- [ ] Markers appear on map
- [ ] Stats cards show numbers
- [ ] No red errors in console

### Map Functionality
- [ ] Map is interactive (zoom, pan)
- [ ] Markers cluster when zoomed out
- [ ] Clicking cluster zooms in
- [ ] Clicking marker shows info panel
- [ ] Marker colors match status (green=active, orange=maintenance, gray=inactive)

### Filters
- [ ] Status filters work (Active/Maintenance/Inactive)
- [ ] Priority filters work (High/Medium/Low)
- [ ] Zone/State filters populate and work
- [ ] Search works (try tower ID, zone name, state)
- [ ] Combined filters work together
- [ ] Map updates when filters change

### Export Functions
- [ ] CSV export button works
- [ ] JSON export button works
- [ ] PDF export button works
- [ ] Exported data matches filtered results

### Sorting
- [ ] Sort dropdown works
- [ ] "Recent" sort works
- [ ] "Priority" sort works (High → Low)
- [ ] "Status" sort works
- [ ] "Name" sort works

### Mobile Responsiveness
- [ ] Open DevTools (F12)
- [ ] Toggle device toolbar (Ctrl+Shift+M)
- [ ] Select mobile device
- [ ] Sidebar hides by default
- [ ] Menu toggle (☰) appears
- [ ] Sidebar slides in/out
- [ ] All features accessible

### Error Handling
- [ ] Stop backend server
- [ ] Refresh page
- [ ] Error banner appears (non-blocking)
- [ ] Fallback data loads (500 towers)
- [ ] Page still functional
- [ ] "(exemplo)" indicator shown

---

## 🐛 Common Issues & Fixes

### Issue: Backend won't start
**Possible Causes:**
- Port 8000 already in use
- Missing dependencies
- Python path issues

**Fix:**
```bash
# Check if port is in use
netstat -ano | findstr :8000

# Install dependencies
cd backend
pip install -r requirements.txt

# Try different port
uvicorn app.main:app --reload --port 8001
```

### Issue: Frontend won't start
**Possible Causes:**
- Port 3003 already in use
- Missing node_modules
- Node version issues

**Fix:**
```bash
# Install dependencies
cd frontend
npm install

# Try different port
npm run dev -- -p 3004
```

### Issue: API connection error
**Check:**
- Backend is running
- Frontend `.env.local` has: `NEXT_PUBLIC_API_URL=http://localhost:8000`
- No CORS errors in console

### Issue: Map not rendering
**Check:**
- Browser console for errors
- Network tab shows Leaflet scripts loaded
- Map container has dimensions

### Issue: No data loading
**Check:**
- Backend API responds: `curl http://localhost:8000/api/v1/towers?limit=1`
- CSV files exist in data folder
- Check backend terminal for errors

---

## 📊 Browser Console Test

Open browser console (F12) and run:

```javascript
// Quick API Test
async function quickTest() {
  console.log('🧪 Testing Towers API...\n');
  
  // Test 1: Basic endpoint
  try {
    const res = await fetch('http://localhost:8000/api/v1/towers?limit=5');
    const data = await res.json();
    console.log('✅ API Test:', data.towers?.length || 0, 'towers returned');
    console.log('   Total:', data.total);
  } catch (e) {
    console.error('❌ API Test Failed:', e.message);
  }
  
  // Test 2: Stats
  try {
    const res = await fetch('http://localhost:8000/api/v1/towers/stats/summary');
    const data = await res.json();
    console.log('✅ Stats Test:', data.total_towers || 0, 'total towers');
  } catch (e) {
    console.error('❌ Stats Test Failed:', e.message);
  }
  
  // Test 3: Filtered
  try {
    const res = await fetch('http://localhost:8000/api/v1/towers?status=active&limit=3');
    const data = await res.json();
    console.log('✅ Filter Test:', data.towers?.length || 0, 'active towers');
  } catch (e) {
    console.error('❌ Filter Test Failed:', e.message);
  }
  
  console.log('\n✅ Quick tests complete!');
}

quickTest();
```

---

## 📝 Test Results Template

```
Date: ___________
Browser: ___________
Backend: Running / Not Running
Frontend: Running / Not Running

### Test Results

✅ Initial Load: Pass / Fail
✅ Map Functionality: Pass / Fail
✅ Filters: Pass / Fail
✅ Export: Pass / Fail
✅ Sorting: Pass / Fail
✅ Mobile: Pass / Fail
✅ Error Handling: Pass / Fail

### Issues Found:
1. 
2. 
3. 

### Notes:


```

---

*Follow this checklist to thoroughly test all features!*



