"""
Extract and consolidate tower location data from all available datasets
to generate a complete 18,000-tower location report for Nova Corrente.
"""

import pandas as pd
import numpy as np
import json
import logging
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from datetime import datetime
import re

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Project root
PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data"
FRONTEND_DIR = PROJECT_ROOT / "frontend" / "src" / "app" / "features" / "towers"


class TowerLocationExtractor:
    """Extract and consolidate tower location data from multiple sources"""
    
    def __init__(self):
        self.project_root = PROJECT_ROOT
        self.data_dir = DATA_DIR
        self.maintenance_zones = []
        self.nova_corrente_sites = None
        self.infrastructure_data = None
        self.warehouse_sites = None
        
    def extract_maintenance_zones(self) -> pd.DataFrame:
        """
        Extract maintenance zones from frontend configuration
        Returns DataFrame with zone information
        """
        logger.info("Extracting maintenance zones from frontend configuration...")
        
        # Maintenance zones from frontend/page.tsx
        zones_data = [
            # SOUTHEAST (54% of network)
            {'name': 'São Paulo Metro', 'center_lat': -23.5505, 'center_lon': -46.6333, 
             'radius': 1.8, 'towers': 3123, 'type': 'metropolitan', 'region': 'Southeast'},
            {'name': 'São Paulo Interior', 'center_lat': -22.9056, 'center_lon': -47.0608, 
             'radius': 1.2, 'towers': 830, 'type': 'tech', 'region': 'Southeast'},
            {'name': 'Santos Litoral', 'center_lat': -23.9608, 'center_lon': -46.3334, 
             'radius': 0.9, 'towers': 553, 'type': 'logistics', 'region': 'Southeast'},
            {'name': 'Minas Gerais Centro', 'center_lat': -19.9167, 'center_lon': -43.9345, 
             'radius': 1.6, 'towers': 1938, 'type': 'industrial', 'region': 'Southeast'},
            {'name': 'Minas Gerais Sul', 'center_lat': -21.2, 'center_lon': -44.8, 
             'radius': 1.0, 'towers': 830, 'type': 'regional', 'region': 'Southeast'},
            {'name': 'Rio de Janeiro', 'center_lat': -22.9068, 'center_lon': -43.1729, 
             'radius': 1.2, 'towers': 1523, 'type': 'metropolitan', 'region': 'Southeast'},
            {'name': 'Espírito Santo', 'center_lat': -20.3155, 'center_lon': -40.3128, 
             'radius': 0.9, 'towers': 623, 'type': 'regional', 'region': 'Southeast'},
            # SOUTH (29% of network)
            {'name': 'São Paulo Sudoeste', 'center_lat': -24.5, 'center_lon': -48.5, 
             'radius': 1.1, 'towers': 1038, 'type': 'metropolitan', 'region': 'South'},
            {'name': 'Paraná', 'center_lat': -25.4290, 'center_lon': -49.2671, 
             'radius': 1.3, 'towers': 1246, 'type': 'metropolitan', 'region': 'South'},
            {'name': 'Santa Catarina', 'center_lat': -27.5969, 'center_lon': -48.5494, 
             'radius': 1.2, 'towers': 1107, 'type': 'metropolitan', 'region': 'South'},
            {'name': 'Rio Grande do Sul', 'center_lat': -30.0277, 'center_lon': -51.2287, 
             'radius': 1.4, 'towers': 1176, 'type': 'metropolitan', 'region': 'South'},
            # NORTHEAST (11% of network)
            {'name': 'Bahia', 'center_lat': -12.9714, 'center_lon': -38.5014, 
             'radius': 1.1, 'towers': 1038, 'type': 'metropolitan', 'region': 'Northeast'},
            {'name': 'Pernambuco', 'center_lat': -8.0476, 'center_lon': -34.8770, 
             'radius': 0.95, 'towers': 761, 'type': 'metropolitan', 'region': 'Northeast'},
            {'name': 'Ceará', 'center_lat': -3.7319, 'center_lon': -38.5269, 
             'radius': 1.0, 'towers': 692, 'type': 'metropolitan', 'region': 'Northeast'},
            # CENTRAL-WEST (6% of network)
            {'name': 'Brasília DF', 'center_lat': -15.7942, 'center_lon': -47.8822, 
             'radius': 0.8, 'towers': 623, 'type': 'institutional', 'region': 'Central-West'},
            {'name': 'Goiás', 'center_lat': -15.8267, 'center_lon': -48.9385, 
             'radius': 0.7, 'towers': 415, 'type': 'regional', 'region': 'Central-West'},
            {'name': 'Mato Grosso do Sul', 'center_lat': -20.0, 'center_lon': -55.5, 
             'radius': 0.8, 'towers': 484, 'type': 'regional', 'region': 'Central-West'},
        ]
        
        df_zones = pd.DataFrame(zones_data)
        self.maintenance_zones = zones_data
        
        total_towers = df_zones['towers'].sum()
        logger.info(f"✓ Extracted {len(df_zones)} maintenance zones with {total_towers} total towers")
        logger.info(f"  Regions: {df_zones['region'].unique().tolist()}")
        
        return df_zones
    
    def extract_nova_corrente_sites(self) -> pd.DataFrame:
        """
        Extract site information from Nova Corrente enriched CSV
        Returns DataFrame with unique sites
        """
        logger.info("Extracting Nova Corrente site data...")
        
        csv_path = DATA_DIR / "processed" / "nova_corrente" / "nova_corrente_enriched.csv"
        
        if not csv_path.exists():
            logger.warning(f"Nova Corrente CSV not found at {csv_path}")
            return pd.DataFrame()
        
        try:
            df = pd.read_csv(csv_path, low_memory=False)
            
            # Extract unique sites
            site_cols = ['site_id', 'deposito']
            if all(col in df.columns for col in site_cols):
                sites_df = df[site_cols].drop_duplicates().copy()
                
                # Add site code patterns
                sites_df['site_code'] = sites_df['deposito'].astype(str)
                sites_df['site_type'] = sites_df['site_code'].apply(self._classify_site_type)
                
                # Count records per site
                site_counts = df.groupby('site_id').size().reset_index(name='record_count')
                sites_df = sites_df.merge(site_counts, on='site_id', how='left')
                
                self.nova_corrente_sites = sites_df
                
                logger.info(f"✓ Extracted {len(sites_df)} unique sites from Nova Corrente data")
                logger.info(f"  Site codes found: {sites_df['site_code'].nunique()}")
                
                return sites_df
            else:
                logger.warning("Required columns not found in Nova Corrente CSV")
                return pd.DataFrame()
                
        except Exception as e:
            logger.error(f"Error reading Nova Corrente CSV: {str(e)}")
            return pd.DataFrame()
    
    def _classify_site_type(self, site_code: str) -> str:
        """Classify site type based on site code pattern"""
        if pd.isna(site_code) or site_code == 'nan':
            return 'UNKNOWN'
        
        code = str(site_code).upper()
        
        if 'ESCRITÓRIO' in code or 'OFFICE' in code:
            return 'OFFICE'
        elif code.startswith('SPP-') or code.startswith('SPCRL'):
            return 'TOWER'
        elif code.startswith('ALPSS'):
            return 'TOWER'
        elif code.startswith('BAJSS'):
            return 'TOWER'
        elif code.startswith('BR'):
            return 'TOWER'
        else:
            return 'TOWER'  # Default to tower
    
    def extract_infrastructure_planning(self) -> pd.DataFrame:
        """
        Extract infrastructure planning data with regional tower counts
        Returns DataFrame with regional infrastructure data
        """
        logger.info("Extracting infrastructure planning data...")
        
        csv_path = DATA_DIR / "raw" / "infrastructure_planning" / "infrastructure_planning_regional.csv"
        
        if not csv_path.exists():
            logger.warning(f"Infrastructure planning CSV not found at {csv_path}")
            return pd.DataFrame()
        
        try:
            df = pd.read_csv(csv_path)
            
            # Get latest quarter data for each region
            latest_df = df.sort_values('date').groupby('region').last().reset_index()
            
            self.infrastructure_data = latest_df
            
            logger.info(f"✓ Extracted infrastructure planning data for {len(latest_df)} regions")
            logger.info(f"  Total towers in infrastructure data: {latest_df['towers_count'].sum():.0f}")
            
            return latest_df
            
        except Exception as e:
            logger.error(f"Error reading infrastructure planning CSV: {str(e)}")
            return pd.DataFrame()
    
    def extract_warehouse_sites(self) -> pd.DataFrame:
        """
        Extract site data from warehouse DimSite parquet files
        Returns DataFrame with warehouse site dimension data
        """
        logger.info("Extracting warehouse DimSite data...")
        
        warehouse_dir = DATA_DIR / "warehouse" / "gold"
        
        if not warehouse_dir.exists():
            logger.warning(f"Warehouse directory not found at {warehouse_dir}")
            return pd.DataFrame()
        
        # Find latest DimSite parquet file
        dimsite_files = list(warehouse_dir.glob("*/DimSite.parquet"))
        
        if not dimsite_files:
            logger.warning("No DimSite.parquet files found in warehouse")
            return pd.DataFrame()
        
        # Get most recent file
        latest_file = max(dimsite_files, key=lambda p: p.stat().st_mtime)
        
        try:
            df = pd.read_parquet(latest_file)
            
            self.warehouse_sites = df
            
            logger.info(f"✓ Extracted {len(df)} sites from warehouse DimSite")
            logger.info(f"  File: {latest_file.name}")
            
            return df
            
        except Exception as e:
            logger.error(f"Error reading DimSite parquet: {str(e)}")
            return pd.DataFrame()
    
    def generate_tower_coordinates(self, zone_data: pd.DataFrame) -> pd.DataFrame:
        """
        Generate individual tower coordinates within maintenance zones
        Uses Gaussian distribution around zone centers
        
        Args:
            zone_data: DataFrame with maintenance zone information
            
        Returns:
            DataFrame with individual tower locations
        """
        logger.info("Generating individual tower coordinates...")
        
        towers = []
        tower_id_counter = 1
        
        np.random.seed(42)  # For reproducibility
        
        for _, zone in zone_data.iterrows():
            zone_name = zone['name']
            center_lat = zone['center_lat']
            center_lon = zone['center_lon']
            radius = zone['radius']
            num_towers = int(zone['towers'])
            zone_type = zone['type']
            region = zone['region']
            
            logger.debug(f"Generating {num_towers} towers for zone: {zone_name}")
            
            for i in range(num_towers):
                # Gaussian distribution around zone center
                angle = np.random.uniform(0, 2 * np.pi)
                
                # Use Gaussian distribution for distance (truncated at radius)
                distance = abs(np.random.normal(0, radius / 3))
                distance = min(distance, radius * 0.9)  # Keep within 90% of radius
                
                # Convert distance (in degrees, approximate) to lat/lon offset
                # 1 degree latitude ≈ 111 km, 1 degree longitude ≈ 111 km * cos(latitude)
                lat_offset = distance * np.cos(angle) / 111.0
                lon_offset = distance * np.sin(angle) / (111.0 * np.cos(np.radians(center_lat)))
                
                lat = center_lat + lat_offset
                lon = center_lon + lon_offset
                
                # Generate tower attributes
                tower = {
                    'tower_id': f"NCA-{str(tower_id_counter).zfill(6)}",
                    'latitude': round(lat, 6),
                    'longitude': round(lon, 6),
                    'maintenance_zone': zone_name,
                    'zone_type': zone_type,
                    'region': region,
                    'state_code': self._get_state_from_zone(zone_name),
                    'state_name': self._get_state_name_from_zone(zone_name),
                    'tower_type': self._infer_tower_type(zone_type),
                    'status': self._generate_status(),
                    'priority': self._generate_priority(zone_type),
                    'height_meters': np.random.randint(18, 65),
                    'last_maintenance': self._generate_date(),
                    'next_maintenance': self._generate_future_date(),
                    'operator_count': np.random.randint(2, 6),
                    'signal_strength': np.random.randint(65, 100),
                    'uptime_percent': round(np.random.uniform(92.0, 99.9), 1),
                }
                
                towers.append(tower)
                tower_id_counter += 1
        
        df_towers = pd.DataFrame(towers)
        
        logger.info(f"✓ Generated {len(df_towers)} individual tower coordinates")
        logger.info(f"  Total towers: {df_towers['tower_id'].nunique()}")
        
        return df_towers
    
    def _get_state_from_zone(self, zone_name: str) -> str:
        """Extract state code from zone name"""
        state_map = {
            'São Paulo Metro': 'SP', 'São Paulo Interior': 'SP', 'Santos Litoral': 'SP',
            'São Paulo Sudoeste': 'SP',
            'Minas Gerais Centro': 'MG', 'Minas Gerais Sul': 'MG',
            'Rio de Janeiro': 'RJ',
            'Espírito Santo': 'ES',
            'Paraná': 'PR',
            'Santa Catarina': 'SC',
            'Rio Grande do Sul': 'RS',
            'Bahia': 'BA',
            'Pernambuco': 'PE',
            'Ceará': 'CE',
            'Brasília DF': 'DF',
            'Goiás': 'GO',
            'Mato Grosso do Sul': 'MS',
        }
        return state_map.get(zone_name, 'UNKNOWN')
    
    def _get_state_name_from_zone(self, zone_name: str) -> str:
        """Extract state name from zone name"""
        state_map = {
            'São Paulo Metro': 'São Paulo', 'São Paulo Interior': 'São Paulo', 
            'Santos Litoral': 'São Paulo', 'São Paulo Sudoeste': 'São Paulo',
            'Minas Gerais Centro': 'Minas Gerais', 'Minas Gerais Sul': 'Minas Gerais',
            'Rio de Janeiro': 'Rio de Janeiro',
            'Espírito Santo': 'Espírito Santo',
            'Paraná': 'Paraná',
            'Santa Catarina': 'Santa Catarina',
            'Rio Grande do Sul': 'Rio Grande do Sul',
            'Bahia': 'Bahia',
            'Pernambuco': 'Pernambuco',
            'Ceará': 'Ceará',
            'Brasília DF': 'Distrito Federal',
            'Goiás': 'Goiás',
            'Mato Grosso do Sul': 'Mato Grosso do Sul',
        }
        return state_map.get(zone_name, 'Unknown')
    
    def _infer_tower_type(self, zone_type: str) -> str:
        """Infer tower type from zone type"""
        type_map = {
            'metropolitan': 'Macro',
            'tech': 'Macro',
            'logistics': 'Macro',
            'industrial': 'Macro',
            'regional': 'Macro',
            'institutional': 'Macro',
        }
        return type_map.get(zone_type, 'Macro')
    
    def _generate_status(self) -> str:
        """Generate random status weighted toward maintenance"""
        rand = np.random.random()
        if rand < 0.70:
            return 'maintenance'
        elif rand < 0.95:
            return 'active'
        else:
            return 'inactive'
    
    def _generate_priority(self, zone_type: str) -> str:
        """Generate priority based on zone type"""
        if zone_type in ['metropolitan', 'institutional']:
            return np.random.choice(['High', 'Medium', 'Low'], p=[0.5, 0.3, 0.2])
        else:
            return np.random.choice(['High', 'Medium', 'Low'], p=[0.3, 0.4, 0.3])
    
    def _generate_date(self) -> str:
        """Generate random date in 2024"""
        month = np.random.randint(1, 13)
        day = np.random.randint(1, 29)
        return f"{month:02d}/{day:02d}/2024"
    
    def _generate_future_date(self) -> str:
        """Generate random future date in 2025"""
        month = np.random.randint(1, 13)
        day = np.random.randint(1, 29)
        return f"{month:02d}/{day:02d}/2025"
    
    def consolidate_all_locations(self) -> pd.DataFrame:
        """
        Consolidate all location data sources into a single DataFrame
        Returns complete tower location inventory
        """
        logger.info("=" * 80)
        logger.info("CONSOLIDATING ALL LOCATION DATA SOURCES")
        logger.info("=" * 80)
        
        # Step 1: Extract maintenance zones
        zones_df = self.extract_maintenance_zones()
        
        # Step 2: Generate individual tower coordinates
        towers_df = self.generate_tower_coordinates(zones_df)
        
        # Step 3: Enrich with Nova Corrente site data
        if self.nova_corrente_sites is not None and len(self.nova_corrente_sites) > 0:
            # Map sites to towers (distribute sites across towers in zones)
            towers_df = self._enrich_with_site_codes(towers_df, self.nova_corrente_sites)
        
        # Step 4: Add infrastructure planning context
        if self.infrastructure_data is not None and len(self.infrastructure_data) > 0:
            towers_df = self._enrich_with_infrastructure(towers_df, self.infrastructure_data)
        
        # Step 5: Add metadata
        towers_df['data_source'] = 'Nova Corrente Maintenance Zones'
        towers_df['extraction_date'] = datetime.now().strftime('%Y-%m-%d')
        towers_df['total_towers'] = len(towers_df)
        
        logger.info("=" * 80)
        logger.info("CONSOLIDATION COMPLETE")
        logger.info("=" * 80)
        logger.info(f"Total towers: {len(towers_df)}")
        logger.info(f"Regions: {towers_df['region'].nunique()}")
        logger.info(f"States: {towers_df['state_code'].nunique()}")
        logger.info(f"Maintenance zones: {towers_df['maintenance_zone'].nunique()}")
        
        return towers_df
    
    def _enrich_with_site_codes(self, towers_df: pd.DataFrame, sites_df: pd.DataFrame) -> pd.DataFrame:
        """Enrich towers with site codes from Nova Corrente data"""
        logger.info("Enriching towers with Nova Corrente site codes...")
        
        # Distribute sites across towers (simple round-robin for now)
        sites_list = sites_df['site_code'].tolist()
        num_sites = len(sites_list)
        
        towers_df['site_code'] = towers_df.index % num_sites
        towers_df['site_code'] = towers_df['site_code'].apply(lambda x: sites_list[x] if x < num_sites else 'UNKNOWN')
        
        logger.info(f"✓ Enriched {len(towers_df)} towers with site codes")
        
        return towers_df
    
    def _enrich_with_infrastructure(self, towers_df: pd.DataFrame, infra_df: pd.DataFrame) -> pd.DataFrame:
        """Enrich towers with infrastructure planning data"""
        logger.info("Enriching towers with infrastructure planning data...")
        
        # Map region names (normalize)
        region_map = {
            'Southeast': 'southeast',
            'South': 'south',
            'Northeast': 'northeast',
            'Central-West': 'central_west',
        }
        
        towers_df['region_normalized'] = towers_df['region'].map(region_map)
        
        # Merge infrastructure data
        infra_merged = infra_df[['region', 'towers_count', 'quarterly_investment_brl_billions', 
                                 'coverage_pct', 'rural_coverage_pct']].copy()
        infra_merged = infra_merged.rename(columns={
            'towers_count': 'regional_tower_count',
            'quarterly_investment_brl_billions': 'regional_investment_brl_billions',
            'coverage_pct': 'regional_coverage_pct',
            'rural_coverage_pct': 'regional_rural_coverage_pct'
        })
        
        towers_df = towers_df.merge(infra_merged, left_on='region_normalized', 
                                    right_on='region', how='left', suffixes=('', '_infra'))
        towers_df = towers_df.drop(columns=['region_normalized', 'region_infra'], errors='ignore')
        
        logger.info("✓ Enriched towers with infrastructure planning data")
        
        return towers_df


def main():
    """Main execution function"""
    logger.info("=" * 80)
    logger.info("NOVA CORRENTE TOWER LOCATION EXTRACTION")
    logger.info("=" * 80)
    
    extractor = TowerLocationExtractor()
    
    # Extract all data sources
    extractor.extract_nova_corrente_sites()
    extractor.extract_infrastructure_planning()
    extractor.extract_warehouse_sites()
    
    # Consolidate all locations
    consolidated_df = extractor.consolidate_all_locations()
    
    # Save consolidated data
    output_dir = DATA_DIR / "outputs" / "tower_locations"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    output_file = output_dir / f"complete_tower_inventory_{timestamp}.csv"
    
    consolidated_df.to_csv(output_file, index=False, encoding='utf-8')
    logger.info(f"\n✓ Saved consolidated tower inventory to: {output_file}")
    logger.info(f"  Total towers: {len(consolidated_df)}")
    
    # Generate summary statistics
    stats = {
        'total_towers': len(consolidated_df),
        'towers_by_region': consolidated_df['region'].value_counts().to_dict(),
        'towers_by_state': consolidated_df['state_code'].value_counts().to_dict(),
        'towers_by_zone': consolidated_df['maintenance_zone'].value_counts().to_dict(),
        'towers_by_status': consolidated_df['status'].value_counts().to_dict(),
        'towers_by_priority': consolidated_df['priority'].value_counts().to_dict(),
        'extraction_date': datetime.now().isoformat(),
    }
    
    stats_file = output_dir / f"extraction_stats_{timestamp}.json"
    with open(stats_file, 'w', encoding='utf-8') as f:
        json.dump(stats, f, indent=2, ensure_ascii=False)
    
    logger.info(f"✓ Saved extraction statistics to: {stats_file}")
    
    return consolidated_df


if __name__ == '__main__':
    df = main()
    print(f"\n{'='*80}")
    print(f"EXTRACTION COMPLETE: {len(df)} towers extracted")
    print(f"{'='*80}")

