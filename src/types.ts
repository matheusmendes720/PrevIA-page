

import React from 'react';

export interface KpiData {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ReactNode;
}

export interface ForecastDataPoint {
  date: string;
  'Demanda Real': number;
  'Demanda Prevista': number;
}

export enum AlertLevel {
  CRITICAL = 'CRITICAL',
  WARNING = 'WARNING',
  NORMAL = 'NORMAL',
}

export interface Alert {
  item: string;
  itemCode: string;
  currentStock: number;
  reorderPoint: number;
  daysUntilStockout: number;
  level: AlertLevel;
  recommendation: string;
  stateId: string;
}

export enum ReportStatus {
    COMPLETED = 'COMPLETED',
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    FAILED = 'FAILED',
}

export interface Report {
    id: string;
    name: string;
    date: string;
    type: string;
    status: ReportStatus;
    isFavorite?: boolean;
    progress?: number;
    summary?: {
        metric: string;
        value: string;
        chartTitle: string;
        chartData?: PieChartData[];
    }
}

export interface PieChartData {
    name: string;
    value: number;
}

export interface BarChartData {
    name: string;
    'Lead Time (dias)': number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  avatar: string;
  lastLogin: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'Planning' | 'In Progress' | 'Completed';
  budget: number;
  actualBudget?: number;
  manager?: string;
  startDate?: string;
  endDate?: string;
}

export interface MaintenanceTask {
  id: string;
  description: string;
  type: 'Preventive' | 'Corrective';
  scheduledDate: string;
  status: 'Scheduled' | 'In Progress' | 'Completed';
  equipmentId: string;
  assignedTo?: string;
  projectId?: string;
  notes?: string;
}

export interface InventoryItem {
    id: string;
    name: string;
    category: string;
    quantity: number;
    value: number;
    reorderPoint?: number;
    supplierId?: string;
}

export interface Supplier {
    id: string;
    name: string;
    avgLeadTime: number;
    reliability: number; // as a percentage
}

export interface StateData {
  name: string;
  category: 'consolidated' | 'expansion';
  towers: number;
  maintenance: number;
  projects: number;
  projectsList: Project[];
  maintenanceSchedule: MaintenanceTask[];
  inventory: InventoryItem[];
  suppliers: Supplier[];
  inventoryDistribution?: PieChartData[];
  supplierPerformance?: BarChartData[];
  maintenanceHistory?: TimeSeriesDataPoint[];
}

export interface PrescriptiveRecommendation {
    id: string;
    title: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
    impact: string;
    estimatedSavings: string;
}

export interface TimeSeriesDataPoint {
    date: string;
    Manutenções: number;
}

export interface FinancialDataPoint {
    name: string;
    Orçamento: number;
    'Gasto Real': number;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
    id: string;
    message: string;
    type: ToastType;
}

export type NotificationSeverity = 'critical' | 'warning' | 'info';

export interface NotificationItem {
    id: string;
    type: NotificationSeverity;
    title: string;
    description: string;
    timestamp: string;
    isRead?: boolean;
}

export interface AuditLog {
    id: string;
    user: string;
    userAvatar: string;
    action: string;
    timestamp: string;
    details?: string;
}

export interface ApiIntegration {
    id: string;
    name: string;
    icon: React.ReactNode;
    status: 'Connected' | 'Disconnected';
    lastSync: string;
}