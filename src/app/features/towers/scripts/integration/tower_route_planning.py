"""
Tower Route Planning Optimization
Optimize maintenance routes using tower locations
"""

import logging
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from datetime import datetime
import json

logger = logging.getLogger(__name__)

# Optional optimization imports
try:
    from scipy.spatial.distance import cdist
    from scipy.optimize import minimize
    SCIPY_AVAILABLE = True
except ImportError:
    SCIPY_AVAILABLE = False
    logger.warning("scipy not available - route optimization will use simple heuristics")


class TowerRoutePlanner:
    """Optimize maintenance routes for towers"""
    
    def __init__(self, towers_df: pd.DataFrame):
        self.towers_df = towers_df.copy()
        self.routes = []
    
    def calculate_distance_matrix(self, towers_subset: Optional[pd.DataFrame] = None) -> np.ndarray:
        """Calculate distance matrix between towers"""
        df = towers_subset if towers_subset is not None else self.towers_df
        
        # Filter towers with valid coordinates
        valid_towers = df[
            df['latitude'].notna() & 
            df['longitude'].notna()
        ].copy()
        
        if len(valid_towers) < 2:
            logger.warning("Not enough towers with valid coordinates")
            return np.array([])
        
        # Calculate distances (simplified - would use haversine in production)
        coords = valid_towers[['latitude', 'longitude']].values
        
        if SCIPY_AVAILABLE:
            # Use scipy for efficient distance calculation
            distances = cdist(coords, coords, metric='euclidean')
            # Convert to approximate km (rough conversion for Brazil)
            distances_km = distances * 111  # ~111 km per degree
        else:
            # Simple euclidean distance
            n = len(coords)
            distances_km = np.zeros((n, n))
            for i in range(n):
                for j in range(n):
                    if i != j:
                        lat_diff = coords[i][0] - coords[j][0]
                        lon_diff = coords[i][1] - coords[j][1]
                        dist = np.sqrt(lat_diff**2 + lon_diff**2) * 111
                        distances_km[i, j] = dist
        
        logger.info(f"✓ Calculated distance matrix for {len(valid_towers)} towers")
        return distances_km
    
    def optimize_route_nearest_neighbor(self, start_tower_id: str, 
                                       tower_ids: Optional[List[str]] = None) -> List[str]:
        """Optimize route using nearest neighbor heuristic"""
        logger.info(f"Optimizing route starting from tower {start_tower_id}...")
        
        # Filter towers
        if tower_ids:
            df = self.towers_df[self.towers_df['tower_id'].isin(tower_ids)].copy()
        else:
            df = self.towers_df.copy()
        
        valid_towers = df[
            df['latitude'].notna() & 
            df['longitude'].notna()
        ].copy()
        
        if len(valid_towers) < 2:
            logger.warning("Not enough towers for route optimization")
            return []
        
        # Find start tower
        start_idx = valid_towers[valid_towers['tower_id'] == start_tower_id].index
        if len(start_idx) == 0:
            # Use first tower as start
            start_idx = valid_towers.index[0]
            start_tower_id = valid_towers.iloc[0]['tower_id']
        else:
            start_idx = start_idx[0]
        
        # Calculate distances
        coords = valid_towers[['latitude', 'longitude']].values
        route = [start_tower_id]
        visited = {start_tower_id}
        current_idx = valid_towers.index.get_loc(start_idx)
        
        # Nearest neighbor algorithm
        while len(visited) < len(valid_towers):
            min_dist = float('inf')
            next_idx = None
            
            for i, row in valid_towers.iterrows():
                tower_id = row['tower_id']
                if tower_id in visited:
                    continue
                
                # Calculate distance
                lat_diff = coords[current_idx][0] - row['latitude']
                lon_diff = coords[current_idx][1] - row['longitude']
                dist = np.sqrt(lat_diff**2 + lon_diff**2) * 111
                
                if dist < min_dist:
                    min_dist = dist
                    next_idx = valid_towers.index.get_loc(i)
                    next_tower_id = tower_id
            
            if next_idx is not None:
                route.append(next_tower_id)
                visited.add(next_tower_id)
                current_idx = next_idx
            else:
                break
        
        logger.info(f"✓ Optimized route with {len(route)} towers")
        return route
    
    def optimize_routes_by_zone(self) -> Dict[str, List[str]]:
        """Optimize routes for each maintenance zone"""
        logger.info("Optimizing routes by maintenance zone...")
        
        if 'maintenance_zone' not in self.towers_df.columns:
            logger.warning("No maintenance_zone column found")
            return {}
        
        zone_routes = {}
        
        for zone in self.towers_df['maintenance_zone'].unique():
            zone_towers = self.towers_df[self.towers_df['maintenance_zone'] == zone].copy()
            
            if len(zone_towers) == 0:
                continue
            
            # Find central tower (closest to centroid)
            if zone_towers['latitude'].notna().sum() > 0:
                centroid_lat = zone_towers['latitude'].mean()
                centroid_lon = zone_towers['longitude'].mean()
                
                # Find closest tower to centroid
                zone_towers['dist_to_centroid'] = np.sqrt(
                    (zone_towers['latitude'] - centroid_lat)**2 +
                    (zone_towers['longitude'] - centroid_lon)**2
                )
                start_tower = zone_towers.nsmallest(1, 'dist_to_centroid').iloc[0]
                start_tower_id = start_tower['tower_id']
                
                # Optimize route
                route = self.optimize_route_nearest_neighbor(
                    start_tower_id,
                    zone_towers['tower_id'].tolist()
                )
                
                zone_routes[zone] = route
        
        logger.info(f"✓ Optimized routes for {len(zone_routes)} zones")
        return zone_routes
    
    def calculate_route_metrics(self, route: List[str]) -> Dict:
        """Calculate metrics for a route"""
        if len(route) < 2:
            return {'total_distance_km': 0, 'estimated_time_hours': 0, 'tower_count': len(route)}
        
        route_towers = self.towers_df[self.towers_df['tower_id'].isin(route)].copy()
        route_towers = route_towers[
            route_towers['latitude'].notna() & 
            route_towers['longitude'].notna()
        ]
        
        if len(route_towers) < 2:
            return {'total_distance_km': 0, 'estimated_time_hours': 0, 'tower_count': len(route)}
        
        # Calculate total distance
        total_distance = 0
        coords = route_towers[['latitude', 'longitude']].values
        
        for i in range(len(coords) - 1):
            lat_diff = coords[i][0] - coords[i+1][0]
            lon_diff = coords[i][1] - coords[i+1][1]
            dist = np.sqrt(lat_diff**2 + lon_diff**2) * 111
            total_distance += dist
        
        # Estimate time (assuming 60 km/h average speed + 30 min per tower)
        avg_speed_kmh = 60
        time_driving = total_distance / avg_speed_kmh
        time_maintenance = len(route) * 0.5  # 30 min per tower
        total_time = time_driving + time_maintenance
        
        return {
            'total_distance_km': round(total_distance, 2),
            'estimated_time_hours': round(total_time, 2),
            'tower_count': len(route),
            'driving_time_hours': round(time_driving, 2),
            'maintenance_time_hours': round(time_maintenance, 2)
        }
    
    def generate_route_planning_report(self) -> Dict:
        """Generate comprehensive route planning report"""
        logger.info("Generating route planning report...")
        
        zone_routes = self.optimize_routes_by_zone()
        
        report = {
            'timestamp': datetime.now().isoformat(),
            'total_zones': len(zone_routes),
            'zone_routes': {},
            'summary': {
                'total_towers': len(self.towers_df),
                'total_routes': len(zone_routes),
                'total_distance_km': 0,
                'total_time_hours': 0
            }
        }
        
        for zone, route in zone_routes.items():
            metrics = self.calculate_route_metrics(route)
            report['zone_routes'][zone] = {
                'route': route,
                'metrics': metrics
            }
            report['summary']['total_distance_km'] += metrics['total_distance_km']
            report['summary']['total_time_hours'] += metrics['estimated_time_hours']
        
        logger.info("✓ Route planning report generated")
        return report

