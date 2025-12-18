"""
Move all tower outputs and reports to towers feature folder
"""

import shutil
import logging
from pathlib import Path
from datetime import datetime

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).parent.parent
TOWERS_FEATURE_DIR = PROJECT_ROOT / "nova-corrente-workspace" / "feature-engineering" / "bifurcation-b-frontend-ux" / "features" / "towers"
OUTPUT_DIR = PROJECT_ROOT / "data" / "outputs" / "tower_locations"
SCRIPTS_DIR = PROJECT_ROOT / "scripts"

# Create subdirectories in towers feature folder
TOWERS_FEATURE_DIR.mkdir(parents=True, exist_ok=True)
(TOWERS_FEATURE_DIR / "reports").mkdir(exist_ok=True)
(TOWERS_FEATURE_DIR / "data").mkdir(exist_ok=True)
(TOWERS_FEATURE_DIR / "exports").mkdir(exist_ok=True)
(TOWERS_FEATURE_DIR / "geographic").mkdir(exist_ok=True)


def move_tower_files():
    """Move all tower-related files to towers feature folder"""
    logger.info("=" * 80)
    logger.info("MOVING TOWER OUTPUTS TO FEATURE FOLDER")
    logger.info("=" * 80)
    
    moved_count = 0
    
    # Move reports from scripts/
    logger.info("\n[1] Moving reports from scripts/...")
    report_files = [
        "TOWER_LOCATION_SYSTEM_COMPLETE_REPORT.md",
        "FINAL_GEOGRAPHIC_BREAKDOWN_REPORT.md",
        "GEOGRAPHIC_REPORT_SUMMARY.md",
        "FINAL_COMPLETION_REPORT.md",
        "COMPLETE_INTEGRATION_SUMMARY.md",
        "NEXT_STEPS_INTEGRATION.md",
        "SESSION_COMPLETE_OUTPUT_REPORT.md",
    ]
    
    for report_file in report_files:
        src = SCRIPTS_DIR / report_file
        if src.exists():
            dst = TOWERS_FEATURE_DIR / "reports" / report_file
            shutil.copy2(src, dst)
            logger.info(f"  ✓ Moved: {report_file}")
            moved_count += 1
    
    # Move geographic breakdown reports from output directory
    logger.info("\n[2] Moving geographic breakdown reports...")
    for geo_report in OUTPUT_DIR.glob("GEOGRAPHIC_BREAKDOWN_*.md"):
        dst = TOWERS_FEATURE_DIR / "reports" / geo_report.name
        shutil.copy2(geo_report, dst)
        logger.info(f"  ✓ Moved: {geo_report.name}")
        moved_count += 1
    
    # Move CSV files
    logger.info("\n[3] Moving CSV data files...")
    csv_files = list(OUTPUT_DIR.glob("*.csv"))
    for csv_file in csv_files:
        if "breakdown" in csv_file.name.lower() or "geographic" in csv_file.name.lower():
            dst = TOWERS_FEATURE_DIR / "geographic" / csv_file.name
        elif "complete" in csv_file.name.lower() or "enhanced" in csv_file.name.lower():
            dst = TOWERS_FEATURE_DIR / "data" / csv_file.name
        else:
            dst = TOWERS_FEATURE_DIR / "data" / csv_file.name
        shutil.copy2(csv_file, dst)
        logger.info(f"  ✓ Moved: {csv_file.name}")
        moved_count += 1
    
    # Move JSON files
    logger.info("\n[4] Moving JSON data files...")
    json_files = list(OUTPUT_DIR.glob("*.json"))
    for json_file in json_files:
        if "geographic" in json_file.name.lower() or "breakdown" in json_file.name.lower():
            dst = TOWERS_FEATURE_DIR / "geographic" / json_file.name
        elif "coverage" in json_file.name.lower() or "analytics" in json_file.name.lower():
            dst = TOWERS_FEATURE_DIR / "reports" / json_file.name
        else:
            dst = TOWERS_FEATURE_DIR / "data" / json_file.name
        shutil.copy2(json_file, dst)
        logger.info(f"  ✓ Moved: {json_file.name}")
        moved_count += 1
    
    # Move GeoJSON files
    logger.info("\n[5] Moving GeoJSON files...")
    geojson_files = list(OUTPUT_DIR.glob("*.geojson"))
    for geojson_file in geojson_files:
        dst = TOWERS_FEATURE_DIR / "geographic" / geojson_file.name
        shutil.copy2(geojson_file, dst)
        logger.info(f"  ✓ Moved: {geojson_file.name}")
        moved_count += 1
    
    # Move Excel files
    logger.info("\n[6] Moving Excel files...")
    excel_files = list(OUTPUT_DIR.glob("*.xlsx"))
    for excel_file in excel_files:
        dst = TOWERS_FEATURE_DIR / "exports" / excel_file.name
        shutil.copy2(excel_file, dst)
        logger.info(f"  ✓ Moved: {excel_file.name}")
        moved_count += 1
    
    # Create index file
    logger.info("\n[7] Creating index file...")
    index_content = f"""# Tower Location System - Outputs & Reports

**Last Updated**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Directory Structure

```
towers/
├── reports/          # All markdown reports and analysis JSON
├── data/             # CSV and JSON data files
├── exports/          # Excel and other export formats
├── geographic/       # Geographic breakdown files (CSV, JSON, GeoJSON)
└── towers-map.html   # Interactive map visualization
```

## Reports

### Complete Reports
- `TOWER_LOCATION_SYSTEM_COMPLETE_REPORT.md` - Complete technical report
- `FINAL_GEOGRAPHIC_BREAKDOWN_REPORT.md` - Geographic breakdown report
- `SESSION_COMPLETE_OUTPUT_REPORT.md` - Session output report
- `FINAL_COMPLETION_REPORT.md` - Final completion report

### Geographic Reports
- `GEOGRAPHIC_BREAKDOWN_COMPLETE_REPORT_*.md` - Auto-generated geographic reports

## Data Files

### Main Inventory
- `complete_tower_inventory_*.csv` - Complete tower inventory
- `enhanced_tower_inventory_*.csv` - Enhanced inventory with external data

### Geographic Breakdowns
- `breakdown_by_region_*.csv` - Regional breakdown
- `breakdown_by_state_*.csv` - State breakdown
- `breakdown_by_city_*.csv` - City breakdown
- `all_tower_coordinates_*.csv` - All tower coordinates
- `geographic_breakdown_complete_*.json` - Complete geographic data

### Analysis Files
- `coverage_analysis_*.json` - Coverage gap analysis
- `validation_results_*.json` - Data validation results

## Exports

- `complete_inventory_*.xlsx` - Excel format exports

## Geographic Files

- `complete_inventory_*.geojson` - GeoJSON format for GIS
- Geographic breakdown JSON files

## Quick Access

- **Latest Inventory**: Check `data/complete_tower_inventory_*.csv` (most recent timestamp)
- **Geographic Breakdown**: Check `geographic/geographic_breakdown_complete_*.json`
- **Interactive Map**: Open `towers-map.html` in browser
- **Complete Report**: See `reports/TOWER_LOCATION_SYSTEM_COMPLETE_REPORT.md`

## Statistics

- **Total Towers**: 18,000
- **Regions**: 4
- **States**: 13
- **Zones**: 17
- **Files**: {moved_count}+
"""
    
    index_file = TOWERS_FEATURE_DIR / "README.md"
    with open(index_file, 'w', encoding='utf-8') as f:
        f.write(index_content)
    logger.info(f"  ✓ Created index: README.md")
    
    logger.info("\n" + "=" * 80)
    logger.info("MOVE COMPLETE")
    logger.info("=" * 80)
    logger.info(f"Total files moved: {moved_count}")
    logger.info(f"Destination: {TOWERS_FEATURE_DIR}")
    logger.info("\nDirectory structure:")
    logger.info(f"  reports/     - {len(list((TOWERS_FEATURE_DIR / 'reports').glob('*')))} files")
    logger.info(f"  data/        - {len(list((TOWERS_FEATURE_DIR / 'data').glob('*')))} files")
    logger.info(f"  exports/     - {len(list((TOWERS_FEATURE_DIR / 'exports').glob('*')))} files")
    logger.info(f"  geographic/  - {len(list((TOWERS_FEATURE_DIR / 'geographic').glob('*')))} files")
    logger.info("=" * 80)


if __name__ == '__main__':
    move_tower_files()

