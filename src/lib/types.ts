/**
 * Shared TypeScript types
 */

export interface ForecastData {
  date: string;
  value: number;
  lower?: number;
  upper?: number;
}

export interface InventoryData {
  item_id: string;
  current_stock: number;
  reorder_point: number;
  safety_stock: number;
  days_to_rupture: number;
  alert_level: 'normal' | 'medium' | 'high' | 'critical';
}

export interface ChartConfig {
  width?: number;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  colors?: string[];
}

