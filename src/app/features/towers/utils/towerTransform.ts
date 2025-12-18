/**
 * Tower Data Transformation Utilities
 * Transform API tower data to frontend Tower interface
 */

import { Tower as APITower } from '@/services/towerService';

export interface Tower {
  id: string;
  lat: number;
  lng: number;
  zone: string;
  zoneType: string;
  region: string;
  state: string;
  stateName: string;
  status: 'active' | 'maintenance' | 'inactive';
  height: number;
  lastMaintenance: string;
  nextMaintenance: string;
  operatorCount: number;
  signalStrength: number;
  uptime: number;
  priority: 'High' | 'Medium' | 'Low';
  towerType?: string;
  siteCode?: string;
}

/**
 * Transform API tower data to frontend Tower interface
 */
export function transformAPITower(apiTower: APITower): Tower {
  return {
    id: apiTower.tower_id,
    lat: apiTower.latitude,
    lng: apiTower.longitude,
    zone: apiTower.maintenance_zone || '',
    zoneType: apiTower.zone_type || '',
    region: apiTower.region || '',
    state: apiTower.state_code || '',
    stateName: apiTower.state_name || '',
    status: (apiTower.status?.toLowerCase() as 'active' | 'maintenance' | 'inactive') || 'active',
    height: apiTower.height_meters || 0,
    lastMaintenance: apiTower.last_maintenance || '',
    nextMaintenance: apiTower.next_maintenance || '',
    operatorCount: apiTower.operator_count || 0,
    signalStrength: apiTower.signal_strength || 0,
    uptime: apiTower.uptime_percent || 0,
    priority: (apiTower.priority as 'High' | 'Medium' | 'Low') || 'Medium',
    towerType: apiTower.tower_type,
    siteCode: apiTower.site_code,
  };
}

/**
 * Transform array of API towers
 */
export function transformAPITowers(apiTowers: APITower[]): Tower[] {
  return apiTowers.map(transformAPITower);
}

