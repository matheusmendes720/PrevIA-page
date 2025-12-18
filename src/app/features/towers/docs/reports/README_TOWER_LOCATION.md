# Tower Location Extraction and Coverage Maximization

## Overview

This directory contains scripts for extracting, consolidating, and maximizing coverage of Nova Corrente's 18,000-tower location data.

## Scripts

### 1. `extract_tower_locations.py`
Extracts and consolidates tower location data from all available datasets.

**Usage:**
```bash
python scripts/extract_tower_locations.py
```

**Output:**
- `data/outputs/tower_locations/complete_tower_inventory_YYYYMMDD_HHMMSS.csv`
- `data/outputs/tower_locations/extraction_stats_YYYYMMDD_HHMMSS.json`

### 2. `generate_tower_location_report.py`
Generates comprehensive reports in multiple formats (CSV, JSON, GeoJSON, Excel, PDF).

**Usage:**
```bash
python scripts/generate_tower_location_report.py
```

**Output:**
- `complete_inventory_YYYYMMDD_HHMMSS.csv`
- `complete_inventory_YYYYMMDD_HHMMSS.json`
- `complete_inventory_YYYYMMDD_HHMMSS.geojson`
- `complete_inventory_YYYYMMDD_HHMMSS.xlsx` (if openpyxl available)
- `complete_inventory_YYYYMMDD_HHMMSS.pdf` (if reportlab available)

### 3. `maximize_tower_coverage.py`
Main orchestrator script that:
- Fetches from external sources (ANATEL, OpenCellID, web)
- Matches and merges all data sources
- Identifies coverage gaps
- Enriches locations with metadata
- Validates data quality
- Generates enhanced reports

**Usage:**
```bash
python scripts/maximize_tower_coverage.py
```

**Output:**
- `enhanced_tower_inventory_YYYYMMDD_HHMMSS.csv`
- `coverage_analysis_YYYYMMDD_HHMMSS.json`
- `validation_results_YYYYMMDD_HHMMSS.json`
- All report formats (CSV, JSON, GeoJSON, Excel, PDF)

## Module Structure

### Enhanced Data Fetcher (`enhanced_data_fetcher.py`)
- **ANATELFetcher**: Fetches from ANATEL Mosaico System
- **OpenCellIDFetcher**: Processes OpenCellID database (40M+ records)
- **WebScraperFetcher**: Scrapes web sources for tower data

### Spatial Index (`spatial_index.py`)
- R-tree based spatial index for efficient location queries
- Nearest neighbor searches
- Radius-based queries
- Coverage gap detection

### Coverage Analyzer (`coverage_analyzer.py`)
- Identifies coverage gaps
- Calculates coverage density
- Finds high-priority areas
- Suggests new tower locations

### Location Enricher (`location_enricher.py`)
- Geocoding (addresses)
- Elevation data
- Weather station proximity
- Infrastructure data
- Demographics

### Data Validator (`data_validator.py`)
- Coordinate validation
- Duplicate detection
- Required field validation
- Coverage completeness validation

## Quick Start

1. **Extract tower locations:**
   ```bash
   python scripts/extract_tower_locations.py
   ```

2. **Generate reports:**
   ```bash
   python scripts/generate_tower_location_report.py
   ```

3. **Maximize coverage (full pipeline):**
   ```bash
   python scripts/maximize_tower_coverage.py
   ```

## Dependencies

### Required
- pandas
- numpy
- requests

### Optional (for enhanced features)
- `rtree` - Spatial indexing
- `geopy` - Geocoding and distance calculations
- `dask` - Large dataset processing (OpenCellID)
- `openpyxl` - Excel generation
- `reportlab` - PDF generation
- `beautifulsoup4` - Web scraping

## Data Sources

1. **Nova Corrente Enriched CSV** (`data/processed/nova_corrente/nova_corrente_enriched.csv`)
2. **Frontend Maintenance Zones** (`frontend/src/app/features/towers/page.tsx`)
3. **Infrastructure Planning** (`data/raw/infrastructure_planning/infrastructure_planning_regional.csv`)
4. **Warehouse DimSite** (`data/warehouse/gold/*/DimSite.parquet`)
5. **ANATEL** (via API/CSV)
6. **OpenCellID** (via database)
7. **Web Sources** (via scraping)

## Output Structure

```
data/outputs/tower_locations/
├── complete_tower_inventory_*.csv          # Complete inventory
├── complete_inventory_*.csv                # Standard reports
├── complete_inventory_*.json
├── complete_inventory_*.geojson
├── complete_inventory_*.xlsx
├── complete_inventory_*.pdf
├── enhanced_tower_inventory_*.csv          # Enhanced with external data
├── coverage_analysis_*.json                # Coverage gap analysis
└── validation_results_*.json               # Data quality validation
```

## Notes

- Tower coordinates are generated using Gaussian distribution within maintenance zones
- All 18,000 towers are distributed across 15 maintenance zones
- External data sources are matched using spatial proximity (100m threshold)
- Coverage gaps are identified using grid-based analysis
- Data validation ensures coordinate bounds, duplicates, and completeness

## Troubleshooting

1. **Missing dependencies**: Install optional packages for full functionality
2. **ANATEL data**: Ensure ANATEL CSV files are in `data/raw/anatel_comprehensive/`
3. **OpenCellID data**: Place OpenCellID CSV files in `data/raw/`
4. **Memory issues**: Use Dask for large OpenCellID datasets

