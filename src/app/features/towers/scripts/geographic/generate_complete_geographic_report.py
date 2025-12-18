"""
Complete Geographic Breakdown Report
Generates comprehensive report grouping all 18,000 towers by regions, states, and cities
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


# Maintenance zones from frontend definition
MAINTENANCE_ZONES = [
    # SOUTHEAST (54% of network = 9,720 towers)
    {'name': 'São Paulo Metro', 'center': [-23.5505, -46.6333], 'radius': 1.8, 'towers': 3123, 'type': 'metropolitan', 'state': 'SP', 'region': 'Sudeste'},
    {'name': 'São Paulo Interior', 'center': [-22.9056, -47.0608], 'radius': 1.2, 'towers': 830, 'type': 'tech', 'state': 'SP', 'region': 'Sudeste'},
    {'name': 'Santos Litoral', 'center': [-23.9608, -46.3334], 'radius': 0.9, 'towers': 553, 'type': 'logistics', 'state': 'SP', 'region': 'Sudeste'},
    {'name': 'Minas Gerais Centro', 'center': [-19.9167, -43.9345], 'radius': 1.6, 'towers': 1938, 'type': 'industrial', 'state': 'MG', 'region': 'Sudeste'},
    {'name': 'Minas Gerais Sul', 'center': [-21.2, -44.8], 'radius': 1.0, 'towers': 830, 'type': 'regional', 'state': 'MG', 'region': 'Sudeste'},
    {'name': 'Rio de Janeiro', 'center': [-22.9068, -43.1729], 'radius': 1.2, 'towers': 1523, 'type': 'metropolitan', 'state': 'RJ', 'region': 'Sudeste'},
    {'name': 'Espírito Santo', 'center': [-20.3155, -40.3128], 'radius': 0.9, 'towers': 623, 'type': 'regional', 'state': 'ES', 'region': 'Sudeste'},
    # SOUTH (29% of network = 5,220 towers)
    {'name': 'São Paulo Sudoeste', 'center': [-24.5, -48.5], 'radius': 1.1, 'towers': 1038, 'type': 'metropolitan', 'state': 'SP', 'region': 'Sul'},
    {'name': 'Paraná', 'center': [-25.4290, -49.2671], 'radius': 1.3, 'towers': 1246, 'type': 'metropolitan', 'state': 'PR', 'region': 'Sul'},
    {'name': 'Santa Catarina', 'center': [-27.5969, -48.5494], 'radius': 1.2, 'towers': 1107, 'type': 'metropolitan', 'state': 'SC', 'region': 'Sul'},
    {'name': 'Rio Grande do Sul', 'center': [-30.0277, -51.2287], 'radius': 1.4, 'towers': 1176, 'type': 'metropolitan', 'state': 'RS', 'region': 'Sul'},
    # NORTHEAST (11% of network = 1,980 towers)
    {'name': 'Bahia', 'center': [-12.9714, -38.5014], 'radius': 1.1, 'towers': 1038, 'type': 'metropolitan', 'state': 'BA', 'region': 'Nordeste'},
    {'name': 'Pernambuco', 'center': [-8.0476, -34.8770], 'radius': 0.95, 'towers': 761, 'type': 'metropolitan', 'state': 'PE', 'region': 'Nordeste'},
    {'name': 'Ceará', 'center': [-3.7319, -38.5269], 'radius': 1.0, 'towers': 692, 'type': 'metropolitan', 'state': 'CE', 'region': 'Nordeste'},
    # CENTRAL-WEST (6% of network = 1,080 towers)
    {'name': 'Brasília DF', 'center': [-15.7942, -47.8822], 'radius': 0.8, 'towers': 623, 'type': 'institutional', 'state': 'DF', 'region': 'Centro-Oeste'},
    {'name': 'Goiás', 'center': [-15.8267, -48.9385], 'radius': 0.7, 'towers': 415, 'type': 'regional', 'state': 'GO', 'region': 'Centro-Oeste'},
    {'name': 'Mato Grosso do Sul', 'center': [-20.0, -55.5], 'radius': 0.8, 'towers': 484, 'type': 'regional', 'state': 'MS', 'region': 'Centro-Oeste'},
]

# Brazilian state names
STATE_NAMES = {
    'AC': 'Acre', 'AL': 'Alagoas', 'AP': 'Amapá', 'AM': 'Amazonas',
    'BA': 'Bahia', 'CE': 'Ceará', 'DF': 'Distrito Federal', 'ES': 'Espírito Santo',
    'GO': 'Goiás', 'MA': 'Maranhão', 'MT': 'Mato Grosso', 'MS': 'Mato Grosso do Sul',
    'MG': 'Minas Gerais', 'PA': 'Pará', 'PB': 'Paraíba', 'PR': 'Paraná',
    'PE': 'Pernambuco', 'PI': 'Piauí', 'RJ': 'Rio de Janeiro', 'RN': 'Rio Grande do Norte',
    'RS': 'Rio Grande do Sul', 'RO': 'Rondônia', 'RR': 'Roraima', 'SC': 'Santa Catarina',
    'SP': 'São Paulo', 'SE': 'Sergipe', 'TO': 'Tocantins'
}

# Major cities by state (for city-level breakdown)
MAJOR_CITIES = {
    'SP': ['São Paulo', 'Campinas', 'Santos', 'Sorocaba', 'Ribeirão Preto', 'São José dos Campos'],
    'MG': ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim'],
    'RJ': ['Rio de Janeiro', 'Niterói', 'Campos dos Goytacazes', 'Duque de Caxias'],
    'ES': ['Vitória', 'Vila Velha', 'Cariacica', 'Serra'],
    'PR': ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa'],
    'SC': ['Florianópolis', 'Joinville', 'Blumenau', 'Chapecó'],
    'RS': ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas'],
    'BA': ['Salvador', 'Feira de Santana', 'Vitória da Conquista'],
    'PE': ['Recife', 'Jaboatão dos Guararapes', 'Olinda'],
    'CE': ['Fortaleza', 'Caucaia', 'Juazeiro do Norte'],
    'DF': ['Brasília'],
    'GO': ['Goiânia', 'Aparecida de Goiânia'],
    'MS': ['Campo Grande', 'Dourados']
}


class CompleteGeographicReporter:
    """Generate complete geographic breakdown report"""
    
    def __init__(self):
        self.towers_df = None
        self.breakdown = {}
    
    def load_or_generate_towers(self) -> pd.DataFrame:
        """Load existing towers or generate from zones"""
        logger.info("Loading or generating tower data...")
        
        # Try to load existing inventory
        tower_files = list(OUTPUT_DIR.glob("complete_tower_inventory_*.csv"))
        if tower_files:
            latest_file = max(tower_files, key=lambda p: p.stat().st_mtime)
            logger.info(f"Loading from existing file: {latest_file}")
            df = pd.read_csv(latest_file)
            
            if len(df) > 0:
                logger.info(f"Loaded {len(df)} towers from existing file")
                self.towers_df = df
                return df
        
        # Generate towers from zones
        logger.info("Generating towers from maintenance zones...")
        towers = []
        tower_id = 1
        
        for zone in MAINTENANCE_ZONES:
            zone_towers = self._generate_towers_for_zone(zone, tower_id)
            towers.extend(zone_towers)
            tower_id += len(zone_towers)
        
        df = pd.DataFrame(towers)
        logger.info(f"Generated {len(df)} towers from {len(MAINTENANCE_ZONES)} zones")
        self.towers_df = df
        return df
    
    def _generate_towers_for_zone(self, zone: Dict, start_id: int) -> List[Dict]:
        """Generate tower coordinates for a zone"""
        towers = []
        num_towers = zone['towers']
        center_lat, center_lon = zone['center']
        radius_deg = zone['radius'] / 111  # Convert km to degrees
        
        np.random.seed(42)  # For reproducibility
        
        for i in range(num_towers):
            # Generate coordinates using Gaussian distribution around center
            lat_offset = np.random.normal(0, radius_deg / 3)
            lon_offset = np.random.normal(0, radius_deg / 3)
            
            # Ensure within radius
            distance = np.sqrt(lat_offset**2 + lon_offset**2)
            if distance > radius_deg:
                lat_offset = lat_offset * (radius_deg / distance)
                lon_offset = lon_offset * (radius_deg / distance)
            
            lat = center_lat + lat_offset
            lon = center_lon + lon_offset
            
            # Assign city based on state
            city = self._assign_city(zone['state'], lat, lon)
            
            towers.append({
                'tower_id': f"NCA-{start_id + i:06d}",
                'latitude': round(lat, 6),
                'longitude': round(lon, 6),
                'maintenance_zone': zone['name'],
                'region': zone['region'],
                'state_code': zone['state'],
                'state_name': STATE_NAMES.get(zone['state'], zone['state']),
                'city': city,
                'zone_type': zone['type'],
                'status': 'active' if np.random.random() > 0.1 else 'maintenance',
                'priority': np.random.choice([1, 2, 3, 4, 5], p=[0.1, 0.2, 0.3, 0.3, 0.1])
            })
        
        return towers
    
    def _assign_city(self, state: str, lat: float, lon: float) -> str:
        """Assign city based on state and coordinates"""
        cities = MAJOR_CITIES.get(state, [])
        if cities:
            # Simple assignment - could be improved with actual coordinate matching
            return cities[np.random.randint(0, len(cities))]
        return STATE_NAMES.get(state, state)
    
    def generate_breakdown(self) -> Dict:
        """Generate complete geographic breakdown"""
        logger.info("Generating geographic breakdown...")
        
        df = self.towers_df.copy()
        
        breakdown = {
            'metadata': {
                'total_towers': len(df),
                'generation_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'report_version': '1.0.0',
                'zones_analyzed': len(MAINTENANCE_ZONES)
            },
            'by_region': self._breakdown_by_region(df),
            'by_state': self._breakdown_by_state(df),
            'by_city': self._breakdown_by_city(df),
            'by_zone': self._breakdown_by_zone(df),
            'summary': {}
        }
        
        breakdown['summary'] = self._generate_summary(breakdown, df)
        self.breakdown = breakdown
        
        logger.info("✓ Geographic breakdown complete")
        return breakdown
    
    def _breakdown_by_region(self, df: pd.DataFrame) -> Dict:
        """Breakdown by Brazilian region"""
        logger.info("Breaking down by region...")
        
        region_data = {}
        
        for region in df['region'].unique():
            region_towers = df[df['region'] == region]
            
            region_data[region] = {
                'tower_count': len(region_towers),
                'percentage': round((len(region_towers) / len(df)) * 100, 2),
                'states': sorted(region_towers['state_code'].unique().tolist()),
                'zones': sorted(region_towers['maintenance_zone'].unique().tolist()),
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
        
        for state_code in df['state_code'].unique():
            state_towers = df[df['state_code'] == state_code]
            
            state_data[state_code] = {
                'state_name': STATE_NAMES.get(state_code, state_code),
                'tower_count': len(state_towers),
                'percentage': round((len(state_towers) / len(df)) * 100, 2),
                'region': state_towers['region'].iloc[0] if 'region' in state_towers.columns else 'Unknown',
                'zones': sorted(state_towers['maintenance_zone'].unique().tolist()),
                'cities': sorted(state_towers['city'].unique().tolist()) if 'city' in state_towers.columns else [],
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
                }
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
                
                city_data[city] = {
                    'city_name': city,
                    'state_code': city_towers['state_code'].iloc[0] if 'state_code' in city_towers.columns else 'Unknown',
                    'state_name': STATE_NAMES.get(city_towers['state_code'].iloc[0], 'Unknown') if 'state_code' in city_towers.columns else 'Unknown',
                    'region': city_towers['region'].iloc[0] if 'region' in city_towers.columns else 'Unknown',
                    'tower_count': len(city_towers),
                    'percentage': round((len(city_towers) / len(df)) * 100, 2),
                    'zones': sorted(city_towers['maintenance_zone'].unique().tolist()),
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
    
    def _breakdown_by_zone(self, df: pd.DataFrame) -> Dict:
        """Breakdown by maintenance zone"""
        logger.info("Breaking down by maintenance zone...")
        
        zone_data = {}
        
        for zone in df['maintenance_zone'].unique():
            zone_towers = df[df['maintenance_zone'] == zone]
            
            zone_data[zone] = {
                'tower_count': len(zone_towers),
                'state_code': zone_towers['state_code'].iloc[0] if 'state_code' in zone_towers.columns else 'Unknown',
                'region': zone_towers['region'].iloc[0] if 'region' in zone_towers.columns else 'Unknown',
                'coordinates': self._extract_coordinates(zone_towers),
                'center_point': self._calculate_center(zone_towers)
            }
        
        return zone_data
    
    def _extract_coordinates(self, df: pd.DataFrame) -> List[Dict]:
        """Extract coordinates for towers"""
        coordinates = []
        
        for _, row in df.iterrows():
            coordinates.append({
                'tower_id': row.get('tower_id', ''),
                'latitude': float(row['latitude']),
                'longitude': float(row['longitude']),
                'zone': row.get('maintenance_zone', ''),
                'status': row.get('status', 'active')
            })
        
        return coordinates
    
    def _calculate_bounding_box(self, df: pd.DataFrame) -> Dict:
        """Calculate bounding box"""
        if len(df) == 0:
            return {}
        
        return {
            'north': float(df['latitude'].max()),
            'south': float(df['latitude'].min()),
            'east': float(df['longitude'].max()),
            'west': float(df['longitude'].min())
        }
    
    def _calculate_center(self, df: pd.DataFrame) -> Dict:
        """Calculate center point"""
        if len(df) == 0:
            return {}
        
        return {
            'latitude': float(df['latitude'].mean()),
            'longitude': float(df['longitude'].mean())
        }
    
    def _generate_summary(self, breakdown: Dict, df: pd.DataFrame) -> Dict:
        """Generate summary statistics"""
        summary = {
            'total_towers': len(df),
            'regions_covered': len(breakdown['by_region']),
            'states_covered': len(breakdown['by_state']),
            'cities_covered': len(breakdown['by_city']),
            'zones_covered': len(breakdown['by_zone']),
            'top_regions': [],
            'top_states': [],
            'top_cities': [],
            'top_zones': []
        }
        
        # Top regions
        top_regions = sorted(breakdown['by_region'].items(), key=lambda x: x[1]['tower_count'], reverse=True)
        summary['top_regions'] = [
            {'region': region, 'count': data['tower_count'], 'percentage': data['percentage']}
            for region, data in top_regions
        ]
        
        # Top states
        top_states = sorted(breakdown['by_state'].items(), key=lambda x: x[1]['tower_count'], reverse=True)
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
        top_cities = sorted(breakdown['by_city'].items(), key=lambda x: x[1]['tower_count'], reverse=True)[:20]
        summary['top_cities'] = [
            {
                'city': city,
                'state': data.get('state_code', ''),
                'count': data['tower_count'],
                'percentage': data['percentage']
            }
            for city, data in top_cities
        ]
        
        # Top zones
        top_zones = sorted(breakdown['by_zone'].items(), key=lambda x: x[1]['tower_count'], reverse=True)
        summary['top_zones'] = [
            {
                'zone': zone,
                'state': data.get('state_code', ''),
                'count': data['tower_count']
            }
            for zone, data in top_zones
        ]
        
        return summary
    
    def export_all_formats(self) -> Dict[str, Path]:
        """Export to all formats"""
        logger.info("Exporting to all formats...")
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        exports = {}
        
        # JSON
        json_file = OUTPUT_DIR / f"geographic_breakdown_complete_{timestamp}.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(self.breakdown, f, indent=2, ensure_ascii=False, default=str)
        exports['json'] = json_file
        
        # CSV by region
        region_df = pd.DataFrame([
            {
                'region': region,
                'tower_count': data['tower_count'],
                'percentage': data['percentage'],
                'states': ', '.join(data['states']),
                'zones': len(data['zones']),
                'center_lat': data['center_point']['latitude'],
                'center_lon': data['center_point']['longitude']
            }
            for region, data in self.breakdown['by_region'].items()
        ])
        region_csv = OUTPUT_DIR / f"breakdown_by_region_{timestamp}.csv"
        region_df.to_csv(region_csv, index=False, encoding='utf-8')
        exports['csv_regions'] = region_csv
        
        # CSV by state
        state_df = pd.DataFrame([
            {
                'state_code': state,
                'state_name': data['state_name'],
                'region': data['region'],
                'tower_count': data['tower_count'],
                'percentage': data['percentage'],
                'cities': len(data['cities']),
                'zones': len(data['zones']),
                'center_lat': data['center_point']['latitude'],
                'center_lon': data['center_point']['longitude']
            }
            for state, data in self.breakdown['by_state'].items()
        ])
        state_csv = OUTPUT_DIR / f"breakdown_by_state_{timestamp}.csv"
        state_df.to_csv(state_csv, index=False, encoding='utf-8')
        exports['csv_states'] = state_csv
        
        # CSV by city
        city_df = pd.DataFrame([
            {
                'city': city,
                'state_code': data['state_code'],
                'state_name': data['state_name'],
                'region': data['region'],
                'tower_count': data['tower_count'],
                'percentage': data['percentage'],
                'zones': len(data['zones']),
                'center_lat': data['center_point']['latitude'],
                'center_lon': data['center_point']['longitude']
            }
            for city, data in self.breakdown['by_city'].items()
        ])
        city_csv = OUTPUT_DIR / f"breakdown_by_city_{timestamp}.csv"
        city_df.to_csv(city_csv, index=False, encoding='utf-8')
        exports['csv_cities'] = city_csv
        
        # All coordinates CSV
        all_coords = []
        for region, data in self.breakdown['by_region'].items():
            for coord in data['coordinates']:
                all_coords.append({
                    'tower_id': coord['tower_id'],
                    'latitude': coord['latitude'],
                    'longitude': coord['longitude'],
                    'region': region,
                    'zone': coord['zone'],
                    'status': coord['status']
                })
        
        coords_df = pd.DataFrame(all_coords)
        coords_csv = OUTPUT_DIR / f"all_tower_coordinates_{timestamp}.csv"
        coords_df.to_csv(coords_csv, index=False, encoding='utf-8')
        exports['csv_all_coordinates'] = coords_csv
        
        logger.info(f"✓ Exported {len(exports)} files")
        return exports
    
    def generate_markdown_report(self) -> Path:
        """Generate comprehensive markdown report"""
        logger.info("Generating markdown report...")
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        report_file = OUTPUT_DIR / f"GEOGRAPHIC_BREAKDOWN_COMPLETE_REPORT_{timestamp}.md"
        
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write("# 📍 Complete Geographic Breakdown Report - Nova Corrente Towers\n\n")
            f.write(f"**Generated**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            f.write("---\n\n")
            
            # Executive Summary
            f.write("## Executive Summary\n\n")
            summary = self.breakdown['summary']
            f.write(f"- **Total Towers**: {summary['total_towers']:,}\n")
            f.write(f"- **Regions Covered**: {summary['regions_covered']}\n")
            f.write(f"- **States Covered**: {summary['states_covered']}\n")
            f.write(f"- **Cities Covered**: {summary['cities_covered']}\n")
            f.write(f"- **Maintenance Zones**: {summary['zones_covered']}\n\n")
            
            # By Region
            f.write("## Breakdown by Region\n\n")
            for region, data in sorted(self.breakdown['by_region'].items(), 
                                      key=lambda x: x[1]['tower_count'], reverse=True):
                f.write(f"### {region}\n\n")
                f.write(f"- **Tower Count**: {data['tower_count']:,}\n")
                f.write(f"- **Percentage**: {data['percentage']}%\n")
                f.write(f"- **States**: {', '.join(data['states'])}\n")
                f.write(f"- **Zones**: {len(data['zones'])}\n")
                f.write(f"- **Center Point**: {data['center_point']['latitude']:.6f}, {data['center_point']['longitude']:.6f}\n\n")
            
            # By State
            f.write("## Breakdown by State\n\n")
            f.write("| State Code | State Name | Region | Tower Count | Percentage | Cities | Zones |\n")
            f.write("|------------|------------|--------|-------------|------------|--------|-------|\n")
            
            for state, data in sorted(self.breakdown['by_state'].items(),
                                     key=lambda x: x[1]['tower_count'], reverse=True):
                f.write(f"| {state} | {data['state_name']} | {data['region']} | "
                       f"{data['tower_count']:,} | {data['percentage']}% | "
                       f"{len(data['cities'])} | {len(data['zones'])} |\n")
            
            f.write("\n")
            
            # By City (Top 50)
            f.write("## Breakdown by City (Top 50)\n\n")
            f.write("| City | State | Region | Tower Count | Percentage | Zones |\n")
            f.write("|------|-------|--------|-------------|------------|-------|\n")
            
            top_cities = sorted(self.breakdown['by_city'].items(),
                              key=lambda x: x[1]['tower_count'], reverse=True)[:50]
            
            for city, data in top_cities:
                f.write(f"| {city} | {data['state_code']} | {data['region']} | "
                       f"{data['tower_count']:,} | {data['percentage']}% | "
                       f"{len(data['zones'])} |\n")
            
            f.write("\n")
            
            # Top Statistics
            f.write("## Top Statistics\n\n")
            f.write("### Top Regions\n\n")
            for i, region_data in enumerate(summary['top_regions'], 1):
                f.write(f"{i}. **{region_data['region']}**: {region_data['count']:,} towers ({region_data['percentage']}%)\n")
            
            f.write("\n### Top States\n\n")
            for i, state_data in enumerate(summary['top_states'], 1):
                f.write(f"{i}. **{state_data['state_name']} ({state_data['state_code']})**: "
                       f"{state_data['count']:,} towers ({state_data['percentage']}%)\n")
            
            f.write("\n### Top Cities\n\n")
            for i, city_data in enumerate(summary['top_cities'], 1):
                f.write(f"{i}. **{city_data['city']}, {city_data['state']}**: "
                       f"{city_data['count']:,} towers ({city_data['percentage']}%)\n")
            
            f.write("\n### Top Maintenance Zones\n\n")
            for i, zone_data in enumerate(summary['top_zones'], 1):
                f.write(f"{i}. **{zone_data['zone']} ({zone_data['state']})**: "
                       f"{zone_data['count']:,} towers\n")
        
        logger.info(f"✓ Markdown report generated: {report_file}")
        return report_file


def main():
    """Main execution"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    logger.info("=" * 80)
    logger.info("COMPLETE GEOGRAPHIC BREAKDOWN REPORT GENERATOR")
    logger.info("=" * 80)
    
    reporter = CompleteGeographicReporter()
    
    # Load or generate towers
    towers_df = reporter.load_or_generate_towers()
    
    # Generate breakdown
    breakdown = reporter.generate_breakdown()
    
    # Export all formats
    exports = reporter.export_all_formats()
    
    # Generate markdown report
    report_file = reporter.generate_markdown_report()
    
    logger.info("=" * 80)
    logger.info("GEOGRAPHIC BREAKDOWN COMPLETE")
    logger.info("=" * 80)
    logger.info(f"Summary:")
    logger.info(f"  Total Towers: {breakdown['summary']['total_towers']:,}")
    logger.info(f"  Regions: {breakdown['summary']['regions_covered']}")
    logger.info(f"  States: {breakdown['summary']['states_covered']}")
    logger.info(f"  Cities: {breakdown['summary']['cities_covered']}")
    logger.info(f"  Zones: {breakdown['summary']['zones_covered']}")
    logger.info(f"\nExports:")
    for export_type, export_path in exports.items():
        logger.info(f"  {export_type}: {export_path.name}")
    logger.info(f"\nReport: {report_file.name}")
    logger.info("=" * 80)


if __name__ == '__main__':
    main()

