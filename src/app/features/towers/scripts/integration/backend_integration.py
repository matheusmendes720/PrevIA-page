"""
Backend API Integration
Integrate tower location system with FastAPI backend
"""

import logging
import requests
import pandas as pd
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime
import json

logger = logging.getLogger(__name__)


class BackendAPIClient:
    """Client for backend API integration"""
    
    def __init__(self, base_url: str = "http://localhost:8000", api_key: Optional[str] = None):
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.session = requests.Session()
        
        if api_key:
            self.session.headers.update({'Authorization': f'Bearer {api_key}'})
        
        logger.info(f"Backend API client initialized: {self.base_url}")
    
    def health_check(self) -> Dict:
        """Check backend health"""
        try:
            response = self.session.get(f"{self.base_url}/health", timeout=5)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return {'status': 'unavailable', 'error': str(e)}
    
    def submit_tower_data(self, towers_df: pd.DataFrame, endpoint: str = "/api/v1/towers") -> Dict:
        """Submit tower data to backend"""
        try:
            # Convert DataFrame to JSON
            towers_json = towers_df.to_dict('records')
            
            # Submit in batches
            batch_size = 100
            results = []
            
            for i in range(0, len(towers_json), batch_size):
                batch = towers_json[i:i+batch_size]
                response = self.session.post(
                    f"{self.base_url}{endpoint}/batch",
                    json={'towers': batch},
                    timeout=30
                )
                response.raise_for_status()
                results.append(response.json())
                logger.info(f"Submitted batch {i//batch_size + 1}/{(len(towers_json)-1)//batch_size + 1}")
            
            logger.info(f"✓ Submitted {len(towers_json)} towers to backend")
            return {'success': True, 'batches': len(results), 'total_towers': len(towers_json)}
            
        except Exception as e:
            logger.error(f"Failed to submit tower data: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_temporal_features(self, start_date: str, end_date: str) -> Dict:
        """Get temporal features from backend"""
        try:
            response = self.session.get(
                f"{self.base_url}/api/v1/temporal/summary",
                params={'start_date': start_date, 'end_date': end_date},
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to get temporal features: {str(e)}")
            return {}
    
    def get_climate_features(self, region: str) -> Dict:
        """Get climate features from backend"""
        try:
            response = self.session.get(
                f"{self.base_url}/api/v1/climate/features",
                params={'region': region},
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to get climate features: {str(e)}")
            return {}
    
    def get_economic_features(self, state: str) -> Dict:
        """Get economic features from backend"""
        try:
            response = self.session.get(
                f"{self.base_url}/api/v1/economic/features",
                params={'state': state},
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to get economic features: {str(e)}")
            return {}
    
    def enrich_towers_with_backend_features(self, towers_df: pd.DataFrame) -> pd.DataFrame:
        """Enrich tower data with backend features"""
        logger.info("Enriching towers with backend features...")
        
        enriched_df = towers_df.copy()
        
        # Add temporal features
        try:
            start_date = (datetime.now() - pd.Timedelta(days=30)).strftime("%Y-%m-%d")
            end_date = (datetime.now() + pd.Timedelta(days=30)).strftime("%Y-%m-%d")
            temporal = self.get_temporal_features(start_date, end_date)
            
            if temporal:
                enriched_df['temporal_seasonality'] = temporal.get('summary', {}).get('seasonality_score', 0)
                logger.info("✓ Added temporal features")
        except Exception as e:
            logger.warning(f"Temporal enrichment failed: {str(e)}")
        
        # Add climate features by region
        if 'region' in enriched_df.columns:
            try:
                for region in enriched_df['region'].unique():
                    climate = self.get_climate_features(region)
                    if climate:
                        mask = enriched_df['region'] == region
                        enriched_df.loc[mask, 'climate_risk'] = climate.get('risk_score', 0)
                logger.info("✓ Added climate features")
            except Exception as e:
                logger.warning(f"Climate enrichment failed: {str(e)}")
        
        # Add economic features by state
        if 'state_code' in enriched_df.columns:
            try:
                for state in enriched_df['state_code'].unique():
                    economic = self.get_economic_features(state)
                    if economic:
                        mask = enriched_df['state_code'] == state
                        enriched_df.loc[mask, 'economic_index'] = economic.get('index', 0)
                logger.info("✓ Added economic features")
            except Exception as e:
                logger.warning(f"Economic enrichment failed: {str(e)}")
        
        logger.info(f"✓ Enriched {len(enriched_df)} towers with backend features")
        return enriched_df


def integrate_with_backend(towers_df: pd.DataFrame, backend_url: str = "http://localhost:8000") -> pd.DataFrame:
    """Integrate tower data with backend API"""
    client = BackendAPIClient(backend_url)
    
    # Check backend health
    health = client.health_check()
    if health.get('status') != 'healthy':
        logger.warning(f"Backend not healthy: {health}")
        return towers_df
    
    # Enrich with backend features
    enriched_df = client.enrich_towers_with_backend_features(towers_df)
    
    # Submit to backend
    submit_result = client.submit_tower_data(enriched_df)
    if submit_result.get('success'):
        logger.info(f"✓ Successfully integrated with backend")
    
    return enriched_df

