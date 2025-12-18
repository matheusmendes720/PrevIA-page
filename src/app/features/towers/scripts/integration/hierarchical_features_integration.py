"""
Hierarchical Features Integration
Integrate tower locations with hierarchical features (parent-child aggregations)
"""

import logging
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime
import json

logger = logging.getLogger(__name__)


class HierarchicalFeaturesIntegration:
    """Integrate tower locations with hierarchical features"""
    
    def __init__(self, towers_df: pd.DataFrame):
        self.towers_df = towers_df.copy()
        self.hierarchical_data = {}
    
    def create_hierarchical_structure(self) -> Dict:
        """Create hierarchical structure: Region -> State -> Zone -> Tower"""
        logger.info("Creating hierarchical structure...")
        
        hierarchy = {
            'regions': {},
            'total_towers': len(self.towers_df)
        }
        
        if 'region' not in self.towers_df.columns:
            logger.warning("No region column found")
            return hierarchy
        
        # Group by region
        for region, region_df in self.towers_df.groupby('region'):
            region_data = {
                'name': region,
                'tower_count': len(region_df),
                'states': {}
            }
            
            # Group by state within region
            if 'state_code' in region_df.columns:
                for state, state_df in region_df.groupby('state_code'):
                    state_data = {
                        'name': state,
                        'tower_count': len(state_df),
                        'zones': {}
                    }
                    
                    # Group by zone within state
                    if 'maintenance_zone' in state_df.columns:
                        for zone, zone_df in state_df.groupby('maintenance_zone'):
                            zone_data = {
                                'name': zone,
                                'tower_count': len(zone_df),
                                'towers': zone_df['tower_id'].tolist() if 'tower_id' in zone_df.columns else []
                            }
                            state_data['zones'][zone] = zone_data
                    
                    region_data['states'][state] = state_data
            
            hierarchy['regions'][region] = region_data
        
        self.hierarchical_data = hierarchy
        logger.info(f"✓ Created hierarchical structure: {len(hierarchy['regions'])} regions")
        return hierarchy
    
    def calculate_hierarchical_aggregations(self) -> pd.DataFrame:
        """Calculate aggregations at different hierarchy levels"""
        logger.info("Calculating hierarchical aggregations...")
        
        df = self.towers_df.copy()
        
        # Region-level aggregations
        if 'region' in df.columns:
            region_agg = df.groupby('region').agg({
                'tower_id': 'count',
                'coverage_score': 'mean' if 'coverage_score' in df.columns else 'count',
                'priority': 'mean' if 'priority' in df.columns else 'count'
            }).round(2)
            region_agg.columns = ['region_tower_count', 'region_avg_coverage', 'region_avg_priority']
            df = df.merge(region_agg, left_on='region', right_index=True, how='left')
        
        # State-level aggregations
        if 'state_code' in df.columns:
            state_agg = df.groupby('state_code').agg({
                'tower_id': 'count',
                'coverage_score': 'mean' if 'coverage_score' in df.columns else 'count',
                'priority': 'mean' if 'priority' in df.columns else 'count'
            }).round(2)
            state_agg.columns = ['state_tower_count', 'state_avg_coverage', 'state_avg_priority']
            df = df.merge(state_agg, left_on='state_code', right_index=True, how='left')
        
        # Zone-level aggregations
        if 'maintenance_zone' in df.columns:
            zone_agg = df.groupby('maintenance_zone').agg({
                'tower_id': 'count',
                'coverage_score': 'mean' if 'coverage_score' in df.columns else 'count',
                'priority': 'mean' if 'priority' in df.columns else 'count'
            }).round(2)
            zone_agg.columns = ['zone_tower_count', 'zone_avg_coverage', 'zone_avg_priority']
            df = df.merge(zone_agg, left_on='maintenance_zone', right_index=True, how='left')
        
        logger.info("✓ Calculated hierarchical aggregations")
        return df
    
    def generate_hierarchical_variance_analysis(self) -> Dict:
        """Analyze variance across hierarchy levels"""
        logger.info("Generating hierarchical variance analysis...")
        
        df = self.calculate_hierarchical_aggregations()
        
        variance_analysis = {
            'timestamp': datetime.now().isoformat(),
            'region_variance': {},
            'state_variance': {},
            'zone_variance': {}
        }
        
        # Region variance
        if 'region' in df.columns and 'coverage_score' in df.columns:
            region_variance = df.groupby('region')['coverage_score'].agg(['mean', 'std', 'min', 'max'])
            variance_analysis['region_variance'] = region_variance.to_dict('index')
        
        # State variance
        if 'state_code' in df.columns and 'coverage_score' in df.columns:
            state_variance = df.groupby('state_code')['coverage_score'].agg(['mean', 'std', 'min', 'max'])
            variance_analysis['state_variance'] = state_variance.to_dict('index')
        
        # Zone variance
        if 'maintenance_zone' in df.columns and 'coverage_score' in df.columns:
            zone_variance = df.groupby('maintenance_zone')['coverage_score'].agg(['mean', 'std', 'min', 'max'])
            variance_analysis['zone_variance'] = zone_variance.to_dict('index')
        
        logger.info("✓ Generated variance analysis")
        return variance_analysis
    
    def generate_hierarchical_payload(self) -> Dict:
        """Generate hierarchical features payload for frontend"""
        logger.info("Generating hierarchical features payload...")
        
        hierarchy = self.create_hierarchical_structure()
        variance = self.generate_hierarchical_variance_analysis()
        
        # Create rollup data
        rollup_data = []
        
        for region_name, region_data in hierarchy['regions'].items():
            for state_name, state_data in region_data['states'].items():
                for zone_name, zone_data in state_data['zones'].items():
                    rollup_data.append({
                        'region': region_name,
                        'state': state_name,
                        'zone': zone_name,
                        'tower_count': zone_data['tower_count'],
                        'variance': variance.get('zone_variance', {}).get(zone_name, {})
                    })
        
        payload = {
            'hierarchy': hierarchy,
            'variance_analysis': variance,
            'rollup_data': rollup_data,
            'summary': {
                'total_regions': len(hierarchy['regions']),
                'total_states': sum(len(r['states']) for r in hierarchy['regions'].values()),
                'total_zones': sum(
                    len(s['zones']) 
                    for r in hierarchy['regions'].values() 
                    for s in r['states'].values()
                ),
                'total_towers': hierarchy['total_towers']
            }
        }
        
        logger.info("✓ Generated hierarchical features payload")
        return payload

