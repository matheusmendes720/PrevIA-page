"""
Tower 5G Integration
Integrate tower locations with 5G expansion features
"""

import logging
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime
import json

logger = logging.getLogger(__name__)


class Tower5GIntegration:
    """Integrate tower locations with 5G expansion features"""
    
    def __init__(self, towers_df: pd.DataFrame):
        self.towers_df = towers_df.copy()
        self._5g_features = {}
    
    def identify_5g_expansion_candidates(self, coverage_radius_km: float = 5.0) -> pd.DataFrame:
        """Identify towers that are candidates for 5G expansion"""
        logger.info("Identifying 5G expansion candidates...")
        
        df = self.towers_df.copy()
        
        # Mark existing 5G towers (if available)
        if 'has_5g' not in df.columns:
            df['has_5g'] = False  # Default: no 5G yet
        
        # Calculate tower density
        if 'latitude' in df.columns and 'longitude' in df.columns:
            df['tower_density'] = self._calculate_tower_density(df, coverage_radius_km)
        
        # Identify expansion candidates
        # Priority: high-density areas without 5G
        df['5g_expansion_priority'] = 0
        
        if 'tower_density' in df.columns:
            # High density + no 5G = high priority
            high_density = df['tower_density'] > df['tower_density'].quantile(0.75)
            no_5g = ~df['has_5g']
            df.loc[high_density & no_5g, '5g_expansion_priority'] = 3  # High priority
            
            # Medium density + no 5G = medium priority
            medium_density = (df['tower_density'] > df['tower_density'].quantile(0.5)) & \
                           (df['tower_density'] <= df['tower_density'].quantile(0.75))
            df.loc[medium_density & no_5g, '5g_expansion_priority'] = 2  # Medium priority
            
            # Low density + no 5G = low priority
            low_density = df['tower_density'] <= df['tower_density'].quantile(0.5)
            df.loc[low_density & no_5g, '5g_expansion_priority'] = 1  # Low priority
        
        # Add regional 5G demand indicators
        if 'region' in df.columns:
            df['regional_5g_demand'] = df['region'].map(self._get_regional_5g_demand())
        
        logger.info(f"✓ Identified 5G expansion candidates: {len(df[df['5g_expansion_priority'] > 0])} towers")
        return df
    
    def _calculate_tower_density(self, df: pd.DataFrame, radius_km: float) -> pd.Series:
        """Calculate tower density around each tower"""
        valid_towers = df[df['latitude'].notna() & df['longitude'].notna()].copy()
        
        if len(valid_towers) == 0:
            return pd.Series(0, index=df.index)
        
        density = pd.Series(0, index=df.index)
        
        for idx, tower in valid_towers.iterrows():
            # Count towers within radius
            lat_diff = (valid_towers['latitude'] - tower['latitude']) * 111  # km
            lon_diff = (valid_towers['longitude'] - tower['longitude']) * 111  # km
            distances = np.sqrt(lat_diff**2 + lon_diff**2)
            
            within_radius = (distances <= radius_km).sum()
            density.loc[idx] = within_radius - 1  # Exclude self
        
        return density
    
    def _get_regional_5g_demand(self) -> Dict[str, float]:
        """Get regional 5G demand multipliers"""
        # Based on population density and economic activity
        return {
            'Southeast': 1.5,  # Highest demand
            'South': 1.3,
            'Northeast': 1.2,
            'Central West': 1.1,
            'North': 1.0
        }
    
    def estimate_5g_equipment_demand(self) -> Dict:
        """Estimate equipment demand for 5G expansion"""
        logger.info("Estimating 5G equipment demand...")
        
        df = self.identify_5g_expansion_candidates()
        
        # Equipment per tower (simplified)
        equipment_per_tower = {
            'antennas': 3,  # 3 antennas per tower
            'radios': 2,    # 2 radios per tower
            'cables': 100,  # meters of cable
            'power_supplies': 1,
            'cooling_units': 1
        }
        
        # Calculate demand by priority
        demand = {
            'high_priority': {
                'tower_count': len(df[df['5g_expansion_priority'] == 3]),
                'equipment': {}
            },
            'medium_priority': {
                'tower_count': len(df[df['5g_expansion_priority'] == 2]),
                'equipment': {}
            },
            'low_priority': {
                'tower_count': len(df[df['5g_expansion_priority'] == 1]),
                'equipment': {}
            }
        }
        
        for priority_level in ['high_priority', 'medium_priority', 'low_priority']:
            priority_value = {'high_priority': 3, 'medium_priority': 2, 'low_priority': 1}[priority_level]
            tower_count = demand[priority_level]['tower_count']
            
            for equipment, quantity_per_tower in equipment_per_tower.items():
                demand[priority_level]['equipment'][equipment] = tower_count * quantity_per_tower
        
        # Total demand
        total_towers = sum(d['tower_count'] for d in demand.values())
        total_demand = {}
        for equipment in equipment_per_tower.keys():
            total_demand[equipment] = sum(
                d['equipment'].get(equipment, 0) for d in demand.values()
            )
        
        result = {
            'timestamp': datetime.now().isoformat(),
            'total_expansion_towers': total_towers,
            'demand_by_priority': demand,
            'total_equipment_demand': total_demand,
            'equipment_per_tower': equipment_per_tower
        }
        
        logger.info(f"✓ Estimated 5G equipment demand for {total_towers} towers")
        return result
    
    def generate_5g_features_payload(self) -> Dict:
        """Generate 5G features payload for frontend"""
        logger.info("Generating 5G features payload...")
        
        df = self.identify_5g_expansion_candidates()
        equipment_demand = self.estimate_5g_equipment_demand()
        
        # Coverage expansion map data
        coverage_data = []
        for _, tower in df.iterrows():
            if pd.notna(tower['latitude']) and pd.notna(tower['longitude']):
                coverage_data.append({
                    'tower_id': tower.get('tower_id', ''),
                    'latitude': float(tower['latitude']),
                    'longitude': float(tower['longitude']),
                    'has_5g': bool(tower.get('has_5g', False)),
                    'expansion_priority': int(tower.get('5g_expansion_priority', 0)),
                    'tower_density': float(tower.get('tower_density', 0)),
                    'region': tower.get('region', '')
                })
        
        payload = {
            'coverage_expansion_map': {
                'towers': coverage_data,
                'total_towers': len(coverage_data),
                '5g_towers': int(df['has_5g'].sum()) if 'has_5g' in df.columns else 0,
                'expansion_candidates': int((df['5g_expansion_priority'] > 0).sum())
            },
            'equipment_demand': {
                'total_towers': equipment_demand['total_expansion_towers'],
                'equipment': equipment_demand['total_equipment_demand'],
                'by_priority': equipment_demand['demand_by_priority']
            },
            'summary': {
                'current_5g_coverage': f"{int(df['has_5g'].sum())} towers" if 'has_5g' in df.columns else "Unknown",
                'expansion_opportunity': f"{equipment_demand['total_expansion_towers']} towers",
                'estimated_equipment_value': "Calculate based on equipment costs"
            }
        }
        
        logger.info("✓ Generated 5G features payload")
        return payload

