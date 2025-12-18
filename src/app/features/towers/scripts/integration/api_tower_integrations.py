"""
API Endpoints for Tower Integrations
REST API endpoints for categorical, route planning, and 5G features
"""

import logging
from flask import Flask, jsonify, request
from pathlib import Path
import pandas as pd
import json
from typing import Dict, Optional

logger = logging.getLogger(__name__)

app = Flask(__name__)

PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data"
OUTPUT_DIR = DATA_DIR / "outputs" / "tower_locations"


def load_latest_tower_data() -> pd.DataFrame:
    """Load latest tower inventory"""
    tower_files = list(OUTPUT_DIR.glob("enhanced_tower_inventory_*.csv"))
    if not tower_files:
        tower_files = list(OUTPUT_DIR.glob("complete_tower_inventory_*.csv"))
    
    if not tower_files:
        return pd.DataFrame()
    
    latest_file = max(tower_files, key=lambda p: p.stat().st_mtime)
    return pd.read_csv(latest_file)


@app.route('/api/v1/features/categorical', methods=['GET'])
def get_categorical_features():
    """Get categorical features for towers"""
    try:
        from tower_categorical_integration import TowerCategoricalIntegration
        
        towers_df = load_latest_tower_data()
        if towers_df.empty:
            return jsonify({'error': 'No tower data found'}), 404
        
        integration = TowerCategoricalIntegration(towers_df)
        payload = integration.generate_categorical_encodings_payload()
        
        return jsonify(payload)
    except Exception as e:
        logger.error(f"Error in get_categorical_features: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/v1/features/route-planning', methods=['GET'])
def get_route_planning():
    """Get optimized maintenance routes"""
    try:
        from tower_route_planning import TowerRoutePlanner
        
        towers_df = load_latest_tower_data()
        if towers_df.empty:
            return jsonify({'error': 'No tower data found'}), 404
        
        zone = request.args.get('zone')
        
        planner = TowerRoutePlanner(towers_df)
        
        if zone:
            # Get route for specific zone
            zone_routes = planner.optimize_routes_by_zone()
            if zone in zone_routes:
                route = zone_routes[zone]
                metrics = planner.calculate_route_metrics(route)
                return jsonify({
                    'zone': zone,
                    'route': route,
                    'metrics': metrics
                })
            else:
                return jsonify({'error': f'Zone {zone} not found'}), 404
        else:
            # Get all routes
            report = planner.generate_route_planning_report()
            return jsonify(report)
            
    except Exception as e:
        logger.error(f"Error in get_route_planning: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/v1/features/5g', methods=['GET'])
def get_5g_features():
    """Get 5G expansion features"""
    try:
        from tower_5g_integration import Tower5GIntegration
        
        towers_df = load_latest_tower_data()
        if towers_df.empty:
            return jsonify({'error': 'No tower data found'}), 404
        
        integration = Tower5GIntegration(towers_df)
        payload = integration.generate_5g_features_payload()
        
        return jsonify(payload)
    except Exception as e:
        logger.error(f"Error in get_5g_features: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/v1/features/5g/equipment-demand', methods=['GET'])
def get_5g_equipment_demand():
    """Get 5G equipment demand estimates"""
    try:
        from tower_5g_integration import Tower5GIntegration
        
        towers_df = load_latest_tower_data()
        if towers_df.empty:
            return jsonify({'error': 'No tower data found'}), 404
        
        integration = Tower5GIntegration(towers_df)
        demand = integration.estimate_5g_equipment_demand()
        
        return jsonify(demand)
    except Exception as e:
        logger.error(f"Error in get_5g_equipment_demand: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/v1/features/categorical/<category_type>', methods=['GET'])
def get_categorical_by_type(category_type: str):
    """Get categorical features by type (site, supplier, family)"""
    try:
        from tower_categorical_integration import TowerCategoricalIntegration
        
        towers_df = load_latest_tower_data()
        if towers_df.empty:
            return jsonify({'error': 'No tower data found'}), 404
        
        integration = TowerCategoricalIntegration(towers_df)
        payload = integration.generate_categorical_encodings_payload()
        
        # Filter by category type
        filtered_encodings = [
            e for e in payload.get('encodings', [])
            if e.get('categoryType', '').lower() == category_type.lower()
        ]
        
        return jsonify({
            'categoryType': category_type,
            'encodings': filtered_encodings,
            'count': len(filtered_encodings)
        })
    except Exception as e:
        logger.error(f"Error in get_categorical_by_type: {str(e)}")
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    logger.info("Starting Tower Integrations API Server...")
    logger.info("API Endpoints:")
    logger.info("  GET /api/v1/features/categorical - Get categorical features")
    logger.info("  GET /api/v1/features/categorical/<type> - Get by category type")
    logger.info("  GET /api/v1/features/route-planning - Get route planning")
    logger.info("  GET /api/v1/features/route-planning?zone=<zone> - Get route for zone")
    logger.info("  GET /api/v1/features/5g - Get 5G features")
    logger.info("  GET /api/v1/features/5g/equipment-demand - Get equipment demand")
    app.run(host='0.0.0.0', port=5001, debug=False)

