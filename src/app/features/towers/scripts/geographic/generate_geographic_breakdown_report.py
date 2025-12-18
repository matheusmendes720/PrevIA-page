"""
Geographic Breakdown Report Generator
Groups all 18,000+ towers by states, cities, and regions of Brazil
"""

import logging
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, List, Tuple
from datetime import datetime
import json

logger = logging.getLogger(__name__)

PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data"
OUTPUT_DIR = DATA_DIR / "outputs" / "tower_locations"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


class GeographicBreakdownReporter:
    """Generate comprehensive geographic breakdown reports"""
    
    def __init__(self, towers_df: pd.DataFrame):
        self.df = towers_df.copy()
        self.breakdown = {}
        
        # Brazilian states mapping
        self.state_names = {
            'AC': 'Acre', 'AL': 'Alagoas', 'AP': 'Amapá', 'AM': 'Amazonas',
            'BA': 'Bahia', 'CE': 'Ceará', 'DF': 'Distrito Federal', 'ES': 'Espírito Santo',
            'GO': 'Goiás', 'MA': 'Maranhão', 'MT': 'Mato Grosso', 'MS': 'Mato Grosso do Sul',
            'MG': 'Minas Gerais', 'PA': 'Pará', 'PB': 'Paraíba', 'PR': 'Paraná',
            'PE': 'Pernambuco', 'PI': 'Piauí', 'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte',
            'RS': 'Rio Grande do Sul', 'RO': 'Rondônia', 'RR': 'Roraima', 'SC': 'Santa Catarina',
            'SP': 'São Paulo', 'SE': 'Sergipe', 'TO': 'Tocantins'
        }
        
        # Brazilian regions mapping
        self.region_states = {
            'Norte': ['AC', 'AP', 'AM', 'PA', 'RO', 'RR', 'TO'],
            'Nordeste': ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'],
            'Centro-Oeste': ['DF', 'GO', 'MT', 'MS'],
            'Sudeste': ['ES', 'MG', 'RJ', 'SP'],
            'Sul': ['PR', 'RS', 'SC']
        }
    
    def generate_complete_breakdown(self) -> Dict:
        """Generate complete geographic breakdown"""
        logger.info("Generating complete geographic breakdown...")
        
        # Filter valid coordinates
        valid_df = self.df[
            self.df['latitude'].notna() & 
            self.df['longitude'].notna()
        ].copy()
        
        logger.info(f"Processing {len(valid_df)} towers with valid coordinates")
        
        breakdown = {
            'metadata': {
                'total_towers': len(self.df),
                'towers_with_coordinates': len(valid_df),
                'towers_without_coordinates': len(self.df) - len(valid_df),
                'generation_date': datetime.now().isoformat(),
                'report_version': '1.0.0'
            },
            'by_region': {},
            'by_state': {},
            'by_city': {},
            'summary': {}
        }
        
        # Breakdown by Region
        if 'region' in valid_df.columns:
            breakdown['by_region'] = self._breakdown_by_region(valid_df)
        
        # Breakdown by State
        if 'state_code' in valid_df.columns:
            breakdown['by_state'] = self._breakdown_by_state(valid_df)
        
        # Breakdown by City (if available)
        if 'city' in valid_df.columns:
            breakdown['by_city'] = self._breakdown_by_city(valid_df)
        else:
            # Try to infer from coordinates or use state as city
            breakdown['by_city'] = self._breakdown_by_state_as_city(valid_df)
        
        # Generate summary statistics
        breakdown['summary'] = self._generate_summary(breakdown)
        
        self.breakdown = breakdown
        logger.info("✓ Geographic breakdown complete")
        return breakdown
    
    def _breakdown_by_region(self, df: pd.DataFrame) -> Dict:
        """Breakdown by Brazilian region"""
        logger.info("Breaking down by region...")
        
        region_data = {}
        
        for region, states in self.region_states.items():
            # Filter towers in this region
            region_towers = df[df['state_code'].isin(states)] if 'state_code' in df.columns else pd.DataFrame()
            
            if len(region_towers) > 0:
                region_data[region] = {
                    'tower_count': len(region_towers),
                    'percentage': round((len(region_towers) / len(df)) * 100, 2),
                    'states': list(region_towers['state_code'].unique()) if 'state_code' in region_towers.columns else [],
                    'coordinates': self._extract_coordinates(region_towers),
                    'bounding_box': self._calculate_bounding_box(region_towers),
                    'center_point': self._calculate_center(region_towers),
                    'statistics': {
                        'avg_latitude': float(region_towers['latitude'].mean()),
                        'avg_longitude': float(region_towers['longitude'].mean()),
                        'min_latitude': float(region_towers['latitude'].min()),
                        'max_latitude': float(region_towers['latitude'].max()),
                        'min_longitude': float(region_towers['longitude'].min()),
                        'max_longitude': float(region_towers['longitude'].max())
                    }
                }
        
        return region_data
    
    def _breakdown_by_state(self, df: pd.DataFrame) -> Dict:
        """Breakdown by Brazilian state"""
        logger.info("Breaking down by state...")
        
        state_data = {}
        
        if 'state_code' not in df.columns:
            return state_data
        
        for state_code, state_name in self.state_names.items():
            state_towers = df[df['state_code'] == state_code]
            
            if len(state_towers) > 0:
                state_data[state_code] = {
                    'state_name': state_name,
                    'tower_count': len(state_towers),
                    'percentage': round((len(state_towers) / len(df)) * 100, 2),
                    'coordinates': self._extract_coordinates(state_towers),
                    'bounding_box': self._calculate_bounding_box(state_towers),
                    'center_point': self._calculate_center(state_towers),
                    'statistics': {
                        'avg_latitude': float(state_towers['latitude'].mean()),
                        'avg_longitude': float(state_towers['longitude'].mean()),
                        'min_latitude': float(state_towers['latitude'].min()),
                        'max_latitude': float(state_towers['latitude'].max()),
                        'min_longitude': float(state_towers['longitude'].min()),
                        'max_longitude': float(state_towers['longitude'].max())
                    },
                    'cities': self._get_cities_in_state(state_towers) if 'city' in state_towers.columns else []
                }
        
        return state_data
    
    def _breakdown_by_city(self, df: pd.DataFrame) -> Dict:
        """Breakdown by city"""
        logger.info("Breaking down by city...")
        
        city_data = {}
        
        if 'city' not in df.columns:
            return city_data
        
        for city in df['city'].unique():
            if pd.notna(city):
                city_towers = df[df['city'] == city]
                
                if len(city_towers) > 0:
                    state_code = city_towers['state_code'].iloc[0] if 'state_code' in city_towers.columns else 'Unknown'
                    region = city_towers['region'].iloc[0] if 'region' in city_towers.columns else 'Unknown'
                    
                    city_data[city] = {
                        'city_name': city,
                        'state_code': state_code,
                        'state_name': self.state_names.get(state_code, 'Unknown'),
                        'region': region,
                        'tower_count': len(city_towers),
                        'percentage': round((len(city_towers) / len(df)) * 100, 2),
                        'coordinates': self._extract_coordinates(city_towers),
                        'center_point': self._calculate_center(city_towers),
                        'statistics': {
                            'avg_latitude': float(city_towers['latitude'].mean()),
                            'avg_longitude': float(city_towers['longitude'].mean())
                        }
                    }
        
        # Sort by tower count
        city_data = dict(sorted(city_data.items(), key=lambda x: x[1]['tower_count'], reverse=True))
        
        return city_data
    
    def _breakdown_by_state_as_city(self, df: pd.DataFrame) -> Dict:
        """Use state as city when city data not available"""
        logger.info("Using state-level breakdown as city data...")
        
        city_data = {}
        
        if 'state_code' not in df.columns:
            return city_data
        
        for state_code in df['state_code'].unique():
            if pd.notna(state_code):
                state_towers = df[df['state_code'] == state_code]
                state_name = self.state_names.get(state_code, state_code)
                region = state_towers['region'].iloc[0] if 'region' in state_towers.columns else 'Unknown'
                
                city_data[state_name] = {
                    'city_name': state_name,
                    'state_code': state_code,
                    'state_name': state_name,
                    'region': region,
                    'tower_count': len(state_towers),
                    'percentage': round((len(state_towers) / len(df)) * 100, 2),
                    'coordinates': self._extract_coordinates(state_towers),
                    'center_point': self._calculate_center(state_towers),
                    'statistics': {
                        'avg_latitude': float(state_towers['latitude'].mean()),
                        'avg_longitude': float(state_towers['longitude'].mean())
                    }
                }
        
        return city_data
    
    def _extract_coordinates(self, df: pd.DataFrame) -> List[Dict]:
        """Extract coordinates for towers"""
        coordinates = []
        
        for _, row in df.iterrows():
            coord = {
                'tower_id': row.get('tower_id', ''),
                'latitude': float(row['latitude']),
                'longitude': float(row['longitude'])
            }
            
            # Add additional fields if available
            if 'maintenance_zone' in row:
                coord['zone'] = row['maintenance_zone']
            if 'status' in row:
                coord['status'] = row['status']
            if 'priority' in row:
                coord['priority'] = int(row['priority']) if pd.notna(row['priority']) else None
            
            coordinates.append(coord)
        
        return coordinates
    
    def _calculate_bounding_box(self, df: pd.DataFrame) -> Dict:
        """Calculate bounding box for towers"""
        if len(df) == 0:
            return {}
        
        return {
            'north': float(df['latitude'].max()),
            'south': float(df['latitude'].min()),
            'east': float(df['longitude'].max()),
            'west': float(df['longitude'].min())
        }
    
    def _calculate_center(self, df: pd.DataFrame) -> Dict:
        """Calculate center point for towers"""
        if len(df) == 0:
            return {}
        
        return {
            'latitude': float(df['latitude'].mean()),
            'longitude': float(df['longitude'].mean())
        }
    
    def _get_cities_in_state(self, df: pd.DataFrame) -> List[str]:
        """Get list of cities in state"""
        if 'city' not in df.columns:
            return []
        
        cities = df['city'].dropna().unique().tolist()
        return sorted(cities)
    
    def _generate_summary(self, breakdown: Dict) -> Dict:
        """Generate summary statistics"""
        summary = {
            'total_towers': breakdown['metadata']['total_towers'],
            'towers_with_coordinates': breakdown['metadata']['towers_with_coordinates'],
            'regions_covered': len(breakdown['by_region']),
            'states_covered': len(breakdown['by_state']),
            'cities_covered': len(breakdown['by_city']),
            'top_regions': [],
            'top_states': [],
            'top_cities': []
        }
        
        # Top regions
        if breakdown['by_region']:
            top_regions = sorted(
                breakdown['by_region'].items(),
                key=lambda x: x[1]['tower_count'],
                reverse=True
            )[:5]
            summary['top_regions'] = [
                {'region': region, 'count': data['tower_count'], 'percentage': data['percentage']}
                for region, data in top_regions
            ]
        
        # Top states
        if breakdown['by_state']:
            top_states = sorted(
                breakdown['by_state'].items(),
                key=lambda x: x[1]['tower_count'],
                reverse=True
            )[:10]
            summary['top_states'] = [
                {
                    'state_code': state,
                    'state_name': data['state_name'],
                    'count': data['tower_count'],
                    'percentage': data['percentage']
                }
                for state, data in top_states
            ]
        
        # Top cities
        if breakdown['by_city']:
            top_cities = sorted(
                breakdown['by_city'].items(),
                key=lambda x: x[1]['tower_count'],
                reverse=True
            )[:20]
            summary['top_cities'] = [
                {
                    'city': city,
                    'state': data.get('state_code', ''),
                    'count': data['tower_count'],
                    'percentage': data['percentage']
                }
                for city, data in top_cities
            ]
        
        return summary
    
    def export_to_formats(self, output_dir: Path) -> Dict[str, Path]:
        """Export breakdown to multiple formats"""
        logger.info("Exporting geographic breakdown to multiple formats...")
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        exports = {}
        
        # JSON export
        json_file = output_dir / f"geographic_breakdown_{timestamp}.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(self.breakdown, f, indent=2, ensure_ascii=False, default=str)
        exports['json'] = json_file
        logger.info(f"✓ JSON exported: {json_file}")
        
        # CSV exports
        # By region
        if self.breakdown['by_region']:
            region_df = pd.DataFrame([
                {
                    'region': region,
                    'tower_count': data['tower_count'],
                    'percentage': data['percentage'],
                    'states': ', '.join(data['states']),
                    'center_lat': data['center_point']['latitude'],
                    'center_lon': data['center_point']['longitude']
                }
                for region, data in self.breakdown['by_region'].items()
            ])
            region_csv = output_dir / f"geographic_breakdown_by_region_{timestamp}.csv"
            region_df.to_csv(region_csv, index=False, encoding='utf-8')
            exports['csv_regions'] = region_csv
            logger.info(f"✓ Regions CSV exported: {region_csv}")
        
        # By state
        if self.breakdown['by_state']:
            state_df = pd.DataFrame([
                {
                    'state_code': state,
                    'state_name': data['state_name'],
                    'tower_count': data['tower_count'],
                    'percentage': data['percentage'],
                    'center_lat': data['center_point']['latitude'],
                    'center_lon': data['center_point']['longitude'],
                    'cities_count': len(data.get('cities', []))
                }
                for state, data in self.breakdown['by_state'].items()
            ])
            state_csv = output_dir / f"geographic_breakdown_by_state_{timestamp}.csv"
            state_df.to_csv(state_csv, index=False, encoding='utf-8')
            exports['csv_states'] = state_csv
            logger.info(f"✓ States CSV exported: {state_csv}")
        
        # By city
        if self.breakdown['by_city']:
            city_df = pd.DataFrame([
                {
                    'city': city,
                    'state_code': data.get('state_code', ''),
                    'state_name': data.get('state_name', ''),
                    'region': data.get('region', ''),
                    'tower_count': data['tower_count'],
                    'percentage': data['percentage'],
                    'center_lat': data['center_point']['latitude'],
                    'center_lon': data['center_point']['longitude']
                }
                for city, data in self.breakdown['by_city'].items()
            ])
            city_csv = output_dir / f"geographic_breakdown_by_city_{timestamp}.csv"
            city_df.to_csv(city_csv, index=False, encoding='utf-8')
            exports['csv_cities'] = city_csv
            logger.info(f"✓ Cities CSV exported: {city_csv}")
        
        # Detailed coordinates export (GeoJSON)
        geojson = self._create_geojson()
        geojson_file = output_dir / f"geographic_breakdown_{timestamp}.geojson"
        with open(geojson_file, 'w', encoding='utf-8') as f:
            json.dump(geojson, f, indent=2, ensure_ascii=False)
        exports['geojson'] = geojson_file
        logger.info(f"✓ GeoJSON exported: {geojson_file}")
        
        return exports
    
    def _create_geojson(self) -> Dict:
        """Create GeoJSON format"""
        features = []
        
        # Add region features
        for region, data in self.breakdown['by_region'].items():
            for coord in data['coordinates']:
                features.append({
                    'type': 'Feature',
                    'properties': {
                        'tower_id': coord['tower_id'],
                        'region': region,
                        'type': 'tower'
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [coord['longitude'], coord['latitude']]
                    }
                })
        
        return {
            'type': 'FeatureCollection',
            'features': features
        }
    
    def generate_detailed_report(self, output_dir: Path) -> Path:
        """Generate detailed markdown report"""
        logger.info("Generating detailed markdown report...")
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        report_file = output_dir / f"GEOGRAPHIC_BREAKDOWN_REPORT_{timestamp}.md"
        
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write("# 📍 Geographic Breakdown Report - Nova Corrente Towers\n\n")
            f.write(f"**Generated**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            f.write("---\n\n")
            
            # Summary
            f.write("## Executive Summary\n\n")
            summary = self.breakdown['summary']
            f.write(f"- **Total Towers**: {summary['total_towers']:,}\n")
            f.write(f"- **Towers with Coordinates**: {summary['towers_with_coordinates']:,}\n")
            f.write(f"- **Regions Covered**: {summary['regions_covered']}\n")
            f.write(f"- **States Covered**: {summary['states_covered']}\n")
            f.write(f"- **Cities Covered**: {summary['cities_covered']}\n\n")
            
            # By Region
            f.write("## Breakdown by Region\n\n")
            for region, data in sorted(self.breakdown['by_region'].items(), 
                                      key=lambda x: x[1]['tower_count'], reverse=True):
                f.write(f"### {region}\n\n")
                f.write(f"- **Tower Count**: {data['tower_count']:,}\n")
                f.write(f"- **Percentage**: {data['percentage']}%\n")
                f.write(f"- **States**: {', '.join(data['states'])}\n")
                f.write(f"- **Center Point**: {data['center_point']['latitude']:.6f}, {data['center_point']['longitude']:.6f}\n")
                f.write(f"- **Bounding Box**:\n")
                f.write(f"  - North: {data['bounding_box']['north']:.6f}\n")
                f.write(f"  - South: {data['bounding_box']['south']:.6f}\n")
                f.write(f"  - East: {data['bounding_box']['east']:.6f}\n")
                f.write(f"  - West: {data['bounding_box']['west']:.6f}\n\n")
            
            # By State
            f.write("## Breakdown by State\n\n")
            f.write("| State Code | State Name | Tower Count | Percentage | Center Lat | Center Lon |\n")
            f.write("|------------|------------|-------------|------------|------------|------------|\n")
            
            for state, data in sorted(self.breakdown['by_state'].items(),
                                     key=lambda x: x[1]['tower_count'], reverse=True):
                f.write(f"| {state} | {data['state_name']} | {data['tower_count']:,} | "
                       f"{data['percentage']}% | {data['center_point']['latitude']:.6f} | "
                       f"{data['center_point']['longitude']:.6f} |\n")
            
            f.write("\n")
            
            # By City (Top 50)
            f.write("## Breakdown by City (Top 50)\n\n")
            f.write("| City | State | Region | Tower Count | Percentage |\n")
            f.write("|------|-------|--------|-------------|------------|\n")
            
            top_cities = sorted(self.breakdown['by_city'].items(),
                              key=lambda x: x[1]['tower_count'], reverse=True)[:50]
            
            for city, data in top_cities:
                f.write(f"| {city} | {data.get('state_code', '')} | {data.get('region', '')} | "
                       f"{data['tower_count']:,} | {data['percentage']}% |\n")
            
            f.write("\n")
            
            # Top Statistics
            f.write("## Top Statistics\n\n")
            f.write("### Top 5 Regions\n\n")
            for i, region_data in enumerate(summary['top_regions'], 1):
                f.write(f"{i}. **{region_data['region']}**: {region_data['count']:,} towers ({region_data['percentage']}%)\n")
            
            f.write("\n### Top 10 States\n\n")
            for i, state_data in enumerate(summary['top_states'], 1):
                f.write(f"{i}. **{state_data['state_name']} ({state_data['state_code']})**: "
                       f"{state_data['count']:,} towers ({state_data['percentage']}%)\n")
            
            f.write("\n### Top 20 Cities\n\n")
            for i, city_data in enumerate(summary['top_cities'], 1):
                f.write(f"{i}. **{city_data['city']}, {city_data['state']}**: "
                       f"{city_data['count']:,} towers ({city_data['percentage']}%)\n")
        
        logger.info(f"✓ Detailed report generated: {report_file}")
        return report_file


def main():
    """Main execution function"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    logger.info("=" * 80)
    logger.info("GEOGRAPHIC BREAKDOWN REPORT GENERATOR")
    logger.info("=" * 80)
    
    # Load tower data
    logger.info("Loading tower data...")
    tower_files = list(OUTPUT_DIR.glob("enhanced_tower_inventory_*.csv"))
    if not tower_files:
        tower_files = list(OUTPUT_DIR.glob("complete_tower_inventory_*.csv"))
    
    if not tower_files:
        logger.error("No tower inventory files found. Please run extraction first.")
        return
    
    latest_file = max(tower_files, key=lambda p: p.stat().st_mtime)
    logger.info(f"Loading from: {latest_file}")
    
    towers_df = pd.read_csv(latest_file)
    logger.info(f"Loaded {len(towers_df)} towers")
    
    # Generate breakdown
    reporter = GeographicBreakdownReporter(towers_df)
    breakdown = reporter.generate_complete_breakdown()
    
    # Export to formats
    exports = reporter.export_to_formats(OUTPUT_DIR)
    
    # Generate detailed report
    report_file = reporter.generate_detailed_report(OUTPUT_DIR)
    
    logger.info("=" * 80)
    logger.info("GEOGRAPHIC BREAKDOWN COMPLETE")
    logger.info("=" * 80)
    logger.info(f"Summary:")
    logger.info(f"  Total Towers: {breakdown['summary']['total_towers']:,}")
    logger.info(f"  Regions: {breakdown['summary']['regions_covered']}")
    logger.info(f"  States: {breakdown['summary']['states_covered']}")
    logger.info(f"  Cities: {breakdown['summary']['cities_covered']}")
    logger.info(f"\nExports:")
    for export_type, export_path in exports.items():
        logger.info(f"  {export_type}: {export_path.name}")
    logger.info(f"\nDetailed Report: {report_file.name}")
    logger.info("=" * 80)


if __name__ == '__main__':
    main()

