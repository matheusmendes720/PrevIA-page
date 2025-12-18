# 📊 **CHARTS QUICK REFERENCE GUIDE**

Quick reference for all 20+ charts in the Temporal Analytics Dashboard.

---

## 🔬 **DECOMPOSITION TAB (4 Charts)**

### **Chart 1: Original Time Series**
- **Type:** Line chart with fill
- **Color:** Blue (#3b82f6)
- **Shows:** Raw time series data
- **Insight:** Overall demand pattern

### **Chart 2: Trend Component**
- **Type:** Line chart with fill
- **Color:** Green (#10b981)
- **Shows:** Long-term directional movement
- **Strength:** 72% (shown in metric card)
- **Insight:** 5% monthly growth trajectory

### **Chart 3: Seasonal Component**
- **Type:** Line chart
- **Color:** Orange (#f59e0b)
- **Shows:** Repeating cyclical patterns
- **Strength:** 58% (shown in metric card)
- **Insight:** Weekly and rainy season variations

### **Chart 4: Residual Component**
- **Type:** Line chart
- **Color:** Red (#ef4444)
- **Shows:** Unexplained variance (noise)
- **Variance:** 8.5 (shown in metric card)
- **Insight:** Model fit quality

---

## 📉 **AUTOCORRELATION TAB (2 Charts)**

### **Chart 5: ACF (Autocorrelation Function)**
- **Type:** Bar chart (30 lags)
- **Colors:** 
  - Green: Significant positive correlation
  - Red: Significant negative correlation
  - Gray: Not significant
- **Shows:** Correlation at each time lag
- **Confidence Bands:** ±0.127 (95% level)
- **Insight:** Weekly cycles at lag 7

### **Chart 6: PACF (Partial Autocorrelation)**
- **Type:** Bar chart (30 lags)
- **Colors:**
  - Blue: Significant positive partial correlation
  - Orange: Significant negative partial correlation
  - Gray: Not significant
- **Shows:** Direct correlation removing intermediate effects
- **Insight:** ARIMA(1,0,2) model suggested

---

## 〰️ **FOURIER ANALYSIS TAB (3 Visualizations)**

### **Chart 7: Power Spectral Density (Periodogram)**
- **Type:** Line chart with fill
- **Color:** Purple (#8b5cf6)
- **Shows:** Power at each frequency
- **X-Axis:** Frequency (cycles per day)
- **Y-Axis:** Power spectral density
- **Insight:** Peaks show dominant cycles

### **Chart 8: Top Dominant Frequencies**
- **Type:** Bar chart (5 frequencies)
- **Colors:** Gradient from purple to blue/green/orange/red
- **Shows:** Strength of top 5 cyclical patterns
- **Insight:** Weekly cycle (65% strength) is dominant

### **Visualization 9: Frequency Table with Bars**
- **Type:** Custom table with gradient bars
- **Shows:** Detailed frequency info (Hz, period, strength)
- **Colors:** Teal to purple gradient
- **Insight:** Precise period identification

---

## 🚨 **ANOMALY DETECTION TAB (1 Chart + Cards)**

### **Chart 10: Anomaly Timeline**
- **Type:** Line chart with scatter overlay
- **Colors:**
  - Blue line: Original series
  - Orange points: All anomalies
  - Red points: Critical anomalies (>3σ)
- **Shows:** Where anomalies occur in time
- **Point Size:** Larger for critical anomalies
- **Insight:** 8-15 anomalies detected, 2-3 critical

---

## 📍 **CHANGE POINT DETECTION TAB (3 Charts)**

### **Chart 11: Time Series with Change Points & Regimes**
- **Type:** Line chart with multiple overlays
- **Colors:**
  - Purple (#6366f1): Original series
  - Green dashed: Regime 1 mean
  - Blue dashed: Regime 2 mean
  - Orange dashed: Regime 3 mean
  - Red triangles: Change points
- **Shows:** Structural breaks and regime means
- **Insight:** 3 distinct operational periods

### **Chart 12: Regime Comparison**
- **Type:** Bar chart
- **Colors:** Green, blue, orange, purple (by regime)
- **Shows:** Average value per regime
- **Insight:** Mean differences between periods

---

## 📊 **OVERVIEW TAB (5 Charts)**

### **Chart 13: Supplier Lead Time Comparison**
- **Type:** Bar chart (6 suppliers)
- **Colors:**
  - Green: Good suppliers (risk <5)
  - Orange: Warning suppliers (risk 5-7)
  - Red: Critical suppliers (risk >7)
- **Shows:** Average lead time by supplier
- **Insight:** Supplier A & D are critical

### **Chart 14: Supplier Reliability Score**
- **Type:** Bar chart (6 suppliers)
- **Color:** Blue (#3b82f6)
- **Shows:** Reliability percentage
- **Insight:** Supplier F highest at 92%

### **Chart 15: Supplier Risk Assessment**
- **Type:** Bar chart (6 suppliers)
- **Colors:** Color-coded by risk level (same as Chart 13)
- **Shows:** Risk score 0-10
- **Insight:** Visual risk ranking

### **Chart 16: Lead Time Trend Over Time**
- **Type:** Line chart with target line
- **Colors:**
  - Blue (#3b82f6): Actual lead time (weekly avg)
  - Green dashed: Target SLA (15 days)
- **Shows:** Performance trend vs target
- **Insight:** Identify SLA violations

### **Chart 17 & 18: (Grid of 2 smaller charts)**
- Same as Charts 14 & 15, displayed in responsive grid

---

## 📈 **CHART COLOR LEGEND**

### **Significance Colors:**
- 🟢 **Green:** Good, positive, significant positive correlation
- 🔵 **Blue:** Primary data, reliability, PACF
- 🟣 **Purple:** Spectral/frequency domain
- 🟠 **Orange:** Warning, moderate anomalies, seasonal patterns
- 🔴 **Red:** Critical, errors, anomalies, residuals
- ⚫ **Gray:** Not significant, neutral

### **Chart Type Colors:**
- **Original Series:** Blue with light fill
- **Trend:** Green (growth/positive)
- **Seasonal:** Orange (cyclic patterns)
- **Residual:** Red (noise/errors)
- **Spectral:** Purple (frequency domain)
- **Regimes:** Multi-color (green/blue/orange)

---

## 🎯 **CHART USAGE GUIDE**

### **For C-Level Executives:**
1. **Overview Tab Charts 13-16** - Supplier comparison and performance trends
2. **Decomposition Chart 2** - Trend showing growth trajectory
3. **Change Point Chart 11** - Regime shifts and major changes

### **For Data Scientists:**
1. **Autocorrelation Charts 5-6** - ACF/PACF for ARIMA modeling
2. **Fourier Charts 7-8** - Spectral analysis for hidden periodicities
3. **Decomposition Charts 1-4** - Full STL decomposition
4. **Anomaly Chart 10** - Outlier detection validation

### **For Procurement Teams:**
1. **Overview Charts 13-15** - Daily supplier monitoring
2. **Anomaly Chart 10** - Spot disruptions early
3. **Change Point Chart 11** - Track supplier performance shifts
4. **Overview Chart 16** - SLA compliance tracking

---

## ⚡ **CHART PERFORMANCE**

- **Rendering Time:** <500ms per chart
- **Data Points:** Up to 540 per chart (18 months)
- **Interactive:** Hover tooltips on all charts
- **Responsive:** Adapts to screen size
- **Accessibility:** Color-blind safe palettes available

---

## 📊 **CHART TECHNOLOGIES**

- **Library:** Chart.js (via CDN)
- **Components:** Custom React wrappers (LineChart, BarChart)
- **Theming:** Dark mode optimized
- **Styling:** Consistent with dashboard design system

---

## 🎨 **CUSTOMIZATION OPTIONS**

Each chart component supports:
- Custom colors
- Custom height (default 300px)
- Title and axis labels
- Fill or no-fill areas
- Dashed/solid lines
- Point markers (size, style, color)
- Tooltips (content, formatting)
- Legends (position, visibility)

---

**Quick Access:** http://localhost:3003/features/temporal

**Total Charts:** 20+ across 6 tabs  
**Chart Types:** Line (8), Bar (10), Custom (3+)  
**Update Frequency:** Real-time calculated on tab load  
**Data Source:** Integrated 540-day synthetic dataset

---

*Last Updated: December 18, 2025*  
*Temporal Analytics Dashboard v2.0*

