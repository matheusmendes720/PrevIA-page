"""
Frontend Integration Helper
Utilities for frontend integration and data transformation
"""

import logging
import pandas as pd
import json
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime

logger = logging.getLogger(__name__)


class FrontendIntegrationHelper:
    """Helper for frontend integration"""
    
    @staticmethod
    def transform_tower_data_for_frontend(towers_df: pd.DataFrame) -> List[Dict]:
        """Transform tower data for frontend consumption"""
        logger.info("Transforming tower data for frontend...")
        
        # Select and rename columns for frontend
        frontend_columns = {
            'tower_id': 'id',
            'latitude': 'lat',
            'longitude': 'lng',
            'maintenance_zone': 'zone',
            'region': 'region',
            'state_code': 'state',
            'status': 'status',
            'priority': 'priority',
            'coverage_score': 'coverage',
        }
        
        # Filter to available columns
        available_columns = {k: v for k, v in frontend_columns.items() if k in towers_df.columns}
        transformed_df = towers_df[list(available_columns.keys())].copy()
        transformed_df = transformed_df.rename(columns=available_columns)
        
        # Convert to list of dicts
        result = transformed_df.to_dict('records')
        
        # Clean up NaN values
        for record in result:
            for key, value in list(record.items()):
                if pd.isna(value):
                    record[key] = None
        
        logger.info(f"✓ Transformed {len(result)} towers for frontend")
        return result
    
    @staticmethod
    def generate_map_markers(towers_df: pd.DataFrame) -> List[Dict]:
        """Generate map markers for frontend mapping libraries"""
        logger.info("Generating map markers...")
        
        valid_towers = towers_df[
            towers_df['latitude'].notna() & 
            towers_df['longitude'].notna()
        ].copy()
        
        markers = []
        for _, tower in valid_towers.iterrows():
            marker = {
                'id': tower.get('tower_id', ''),
                'position': {
                    'lat': float(tower['latitude']),
                    'lng': float(tower['longitude'])
                },
                'title': f"Tower {tower.get('tower_id', 'N/A')}",
                'zone': tower.get('maintenance_zone', ''),
                'region': tower.get('region', ''),
                'status': tower.get('status', 'active'),
                'priority': int(tower.get('priority', 0)) if pd.notna(tower.get('priority')) else 0
            }
            markers.append(marker)
        
        logger.info(f"✓ Generated {len(markers)} map markers")
        return markers
    
    @staticmethod
    def generate_chart_data(towers_df: pd.DataFrame, group_by: str = 'region') -> Dict:
        """Generate chart data for frontend visualization"""
        logger.info(f"Generating chart data grouped by {group_by}...")
        
        if group_by not in towers_df.columns:
            logger.warning(f"Column {group_by} not found")
            return {}
        
        grouped = towers_df.groupby(group_by).agg({
            'tower_id': 'count',
            'coverage_score': 'mean' if 'coverage_score' in towers_df.columns else 'count',
            'priority': 'mean' if 'priority' in towers_df.columns else 'count'
        }).round(2)
        
        chart_data = {
            'labels': grouped.index.tolist(),
            'datasets': [
                {
                    'label': 'Tower Count',
                    'data': grouped['tower_id'].tolist(),
                    'backgroundColor': 'rgba(54, 162, 235, 0.5)'
                }
            ]
        }
        
        if 'coverage_score' in grouped.columns:
            chart_data['datasets'].append({
                'label': 'Avg Coverage Score',
                'data': grouped['coverage_score'].tolist(),
                'backgroundColor': 'rgba(255, 99, 132, 0.5)'
            })
        
        logger.info(f"✓ Generated chart data for {len(chart_data['labels'])} groups")
        return chart_data
    
    @staticmethod
    def generate_table_data(towers_df: pd.DataFrame, 
                           columns: Optional[List[str]] = None,
                           limit: int = 100) -> Dict:
        """Generate table data for frontend tables"""
        logger.info("Generating table data...")
        
        # Default columns
        if columns is None:
            columns = [
                'tower_id', 'maintenance_zone', 'region', 'state_code',
                'latitude', 'longitude', 'status', 'priority'
            ]
        
        # Filter to available columns
        available_columns = [c for c in columns if c in towers_df.columns]
        table_df = towers_df[available_columns].head(limit).copy()
        
        # Convert to records
        records = table_df.to_dict('records')
        
        # Clean NaN values
        for record in records:
            for key, value in list(record.items()):
                if pd.isna(value):
                    record[key] = None
        
        result = {
            'columns': available_columns,
            'data': records,
            'total': len(towers_df),
            'displayed': len(records)
        }
        
        logger.info(f"✓ Generated table data: {len(records)} rows")
        return result
    
    @staticmethod
    def generate_dashboard_summary(towers_df: pd.DataFrame) -> Dict:
        """Generate dashboard summary for frontend"""
        logger.info("Generating dashboard summary...")
        
        summary = {
            'total_towers': len(towers_df),
            'regions': towers_df['region'].nunique() if 'region' in towers_df.columns else 0,
            'states': towers_df['state_code'].nunique() if 'state_code' in towers_df.columns else 0,
            'zones': towers_df['maintenance_zone'].nunique() if 'maintenance_zone' in towers_df.columns else 0,
            'last_updated': datetime.now().isoformat()
        }
        
        # Add status breakdown
        if 'status' in towers_df.columns:
            summary['status_breakdown'] = towers_df['status'].value_counts().to_dict()
        
        # Add coverage stats
        if 'coverage_score' in towers_df.columns:
            summary['coverage_stats'] = {
                'mean': float(towers_df['coverage_score'].mean()),
                'min': float(towers_df['coverage_score'].min()),
                'max': float(towers_df['coverage_score'].max()),
                'std': float(towers_df['coverage_score'].std())
            }
        
        # Add priority breakdown
        if 'priority' in towers_df.columns:
            summary['priority_breakdown'] = {
                'high': int((towers_df['priority'] >= 8).sum()),
                'medium': int(((towers_df['priority'] >= 5) & (towers_df['priority'] < 8)).sum()),
                'low': int((towers_df['priority'] < 5).sum())
            }
        
        logger.info("✓ Generated dashboard summary")
        return summary
    
    @staticmethod
    def export_for_frontend(towers_df: pd.DataFrame, output_dir: Path) -> Dict[str, Path]:
        """Export all frontend-ready data"""
        logger.info("Exporting data for frontend...")
        
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        exports = {}
        
        # Export tower data
        tower_data = FrontendIntegrationHelper.transform_tower_data_for_frontend(towers_df)
        tower_file = output_dir / f"towers_frontend_{timestamp}.json"
        with open(tower_file, 'w', encoding='utf-8') as f:
            json.dump(tower_data, f, indent=2, ensure_ascii=False, default=str)
        exports['towers'] = tower_file
        
        # Export map markers
        markers = FrontendIntegrationHelper.generate_map_markers(towers_df)
        markers_file = output_dir / f"map_markers_{timestamp}.json"
        with open(markers_file, 'w', encoding='utf-8') as f:
            json.dump(markers, f, indent=2, ensure_ascii=False, default=str)
        exports['markers'] = markers_file
        
        # Export chart data
        chart_data = FrontendIntegrationHelper.generate_chart_data(towers_df, 'region')
        chart_file = output_dir / f"chart_data_{timestamp}.json"
        with open(chart_file, 'w', encoding='utf-8') as f:
            json.dump(chart_data, f, indent=2, ensure_ascii=False, default=str)
        exports['charts'] = chart_file
        
        # Export dashboard summary
        summary = FrontendIntegrationHelper.generate_dashboard_summary(towers_df)
        summary_file = output_dir / f"dashboard_summary_{timestamp}.json"
        with open(summary_file, 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2, ensure_ascii=False, default=str)
        exports['summary'] = summary_file
        
        logger.info(f"✓ Exported {len(exports)} frontend files")
        return exports

