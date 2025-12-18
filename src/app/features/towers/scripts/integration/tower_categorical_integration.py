"""
Tower Location Integration with Categorical Features
Integrates tower locations with site/supplier/family categorical encodings
"""

import logging
import pandas as pd
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime
import json

logger = logging.getLogger(__name__)


class TowerCategoricalIntegration:
    """Integrate tower locations with categorical features"""
    
    def __init__(self, towers_df: pd.DataFrame):
        self.towers_df = towers_df.copy()
        self.categorical_features = {}
    
    def generate_site_categorical_features(self) -> pd.DataFrame:
        """Generate categorical features for sites/towers"""
        logger.info("Generating site categorical features...")
        
        df = self.towers_df.copy()
        
        # Site-level categorical features
        if 'maintenance_zone' in df.columns:
            # Zone encoding (one-hot or label encoding)
            df['zone_encoded'] = pd.Categorical(df['maintenance_zone']).codes
        
        if 'region' in df.columns:
            # Region encoding
            df['region_encoded'] = pd.Categorical(df['region']).codes
        
        if 'state_code' in df.columns:
            # State encoding
            df['state_encoded'] = pd.Categorical(df['state_code']).codes
        
        # Site type encoding (tower, base station, etc.)
        if 'site_type' not in df.columns:
            df['site_type'] = 'tower'  # Default
        df['site_type_encoded'] = pd.Categorical(df['site_type']).codes
        
        # Priority encoding
        if 'priority' in df.columns:
            df['priority_encoded'] = pd.Categorical(df['priority']).codes
        
        logger.info(f"✓ Generated site categorical features for {len(df)} towers")
        return df
    
    def calculate_site_importance_scores(self) -> Dict:
        """Calculate importance scores for categorical features"""
        logger.info("Calculating site importance scores...")
        
        importance = {}
        
        # Zone importance (based on tower count)
        if 'maintenance_zone' in self.towers_df.columns:
            zone_counts = self.towers_df['maintenance_zone'].value_counts()
            total = len(self.towers_df)
            importance['zones'] = {
                zone: {
                    'count': int(count),
                    'share': float(count / total),
                    'importance_score': float(count / total)
                }
                for zone, count in zone_counts.items()
            }
        
        # Region importance
        if 'region' in self.towers_df.columns:
            region_counts = self.towers_df['region'].value_counts()
            total = len(self.towers_df)
            importance['regions'] = {
                region: {
                    'count': int(count),
                    'share': float(count / total),
                    'importance_score': float(count / total)
                }
                for region, count in region_counts.items()
            }
        
        # State importance
        if 'state_code' in self.towers_df.columns:
            state_counts = self.towers_df['state_code'].value_counts()
            total = len(self.towers_df)
            importance['states'] = {
                state: {
                    'count': int(count),
                    'share': float(count / total),
                    'importance_score': float(count / total)
                }
                for state, count in state_counts.items()
            }
        
        self.categorical_features = importance
        logger.info("✓ Calculated importance scores")
        return importance
    
    def generate_categorical_encodings_payload(self) -> Dict:
        """Generate payload matching frontend categorical features spec"""
        logger.info("Generating categorical encodings payload...")
        
        importance = self.calculate_site_importance_scores()
        
        encodings = []
        insights = []
        
        # Zone encodings
        if 'zones' in importance:
            for zone, data in importance['zones'].items():
                encodings.append({
                    'categoryType': 'site',
                    'categoryId': f'zone_{zone}',
                    'categoryName': f'Zone {zone}',
                    'encodingValue': data['importance_score'],
                    'importanceScore': data['importance_score'],
                    'demandShare': data['share'] * 100,
                    'narrative': f'Maintenance zone {zone} contains {data["count"]} towers ({data["share"]*100:.1f}% of total)'
                })
        
        # Region encodings
        if 'regions' in importance:
            top_region = max(importance['regions'].items(), key=lambda x: x[1]['importance_score'])
            for region, data in importance['regions'].items():
                encodings.append({
                    'categoryType': 'site',
                    'categoryId': f'region_{region}',
                    'categoryName': region,
                    'encodingValue': data['importance_score'],
                    'importanceScore': data['importance_score'],
                    'demandShare': data['share'] * 100,
                    'narrative': f'{region} region contains {data["count"]} towers'
                })
        
        # Generate insights
        if encodings:
            top_contributor = max(encodings, key=lambda x: x['importanceScore'])
            insights.append({
                'categoryType': 'site',
                'title': f'{top_contributor["categoryName"]} is Top Contributor',
                'description': f'{top_contributor["categoryName"]} has the highest importance score ({top_contributor["importanceScore"]:.3f})',
                'recommendation': f'Focus maintenance resources on {top_contributor["categoryName"]} for optimal coverage'
            })
        
        payload = {
            'encodings': encodings,
            'insights': insights,
            'summary': {
                'topContributor': top_contributor['categoryName'] if encodings else 'N/A',
                'modelGain': top_contributor['importanceScore'] * 100 if encodings else 0,
                'narrative': f'Top contributor {top_contributor["categoryName"]} drives {top_contributor["importanceScore"]*100:.1f}% of model importance' if encodings else 'No data available'
            }
        }
        
        logger.info(f"✓ Generated categorical encodings payload: {len(encodings)} encodings, {len(insights)} insights")
        return payload

