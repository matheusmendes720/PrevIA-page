# 🔧 Towers Feature - Scripts & Tools

This folder contains all Python scripts organized by category.

---

## 📁 Folder Structure

### 📥 [data-extraction/](./data-extraction/)
Scripts for extracting and processing tower location data
- `extract_tower_locations.py` - Extract and consolidate tower locations
- `generate_tower_location_report.py` - Generate comprehensive reports
- `maximize_tower_coverage.py` - Main orchestrator (full pipeline)
- `move_tower_outputs_to_feature_folder.py` - Organize output files

### 📍 [geographic/](./geographic/)
Scripts for geographic analysis and reporting
- `generate_complete_geographic_report.py` - Complete geographic breakdown
- `generate_geographic_breakdown_report.py` - Geographic breakdown by zones

### 🔗 [integration/](./integration/)
Scripts for API and system integration
- `api_tower_integrations.py` - API endpoint integrations
- `backend_integration.py` - Backend system integration
- `frontend_integration_helper.py` - Frontend data transformation
- `hierarchical_features_integration.py` - Hierarchical features
- `tower_5g_integration.py` - 5G expansion features
- `tower_categorical_integration.py` - Categorical features
- `tower_route_planning.py` - Route planning features

### 🧪 [testing/](./testing/)
Test scripts for API and frontend
- `test_towers_api.py` - Python API test script
- `test_towers_api.ps1` - PowerShell API test script (Windows)
- `test_towers_frontend.sh` - Frontend test script (Linux/Mac)

### 📦 Dependencies
- `requirements_tower_system.txt` - Python dependencies

---

## 🚀 Quick Start

### Install Dependencies
```bash
pip install -r requirements_tower_system.txt
```

### Extract Tower Data
```bash
python scripts/data-extraction/extract_tower_locations.py
```

### Generate Reports
```bash
python scripts/data-extraction/generate_tower_location_report.py
```

### Run Full Pipeline
```bash
python scripts/data-extraction/maximize_tower_coverage.py
```

### Test API
```bash
python scripts/testing/test_towers_api.py
```

---

## 🗺️ Navigation

**For complete navigation with quick links, see:**
- **[../NAVIGATION_INDEX.md](../NAVIGATION_INDEX.md)** ⭐

---

## 📊 Quick Stats

- **Data Extraction:** 4 scripts
- **Geographic:** 2 scripts
- **Integration:** 7 scripts
- **Testing:** 3 scripts

**Total:** 16+ organized scripts


