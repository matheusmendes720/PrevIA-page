// Centralized mock data for 5G expansion features
export interface FiveGCoverage {
  state: string;
  currentCoverage: number;
  projectedCoverage: number;
  population: number;
  investmentRequired: number;
  timelineMonths: number;
}

export interface FiveGInventory {
  equipment: string;
  currentStock: number;
  requiredStock: number;
  unitCost: number;
  supplier: string;
  leadTime: number;
}

export interface FiveGProjection {
  quarter: string;
  towerDeployments: number;
  coverageIncrease: number;
  investmentAmount: number;
  expectedRevenue: number;
}

export const fiveGCoverageData: FiveGCoverage[] = [
  {
    state: 'SP',
    currentCoverage: 78.5,
    projectedCoverage: 92.3,
    population: 46649132,
    investmentRequired: 125000000,
    timelineMonths: 18
  },
  {
    state: 'RJ',
    currentCoverage: 72.8,
    projectedCoverage: 88.5,
    population: 17463370,
    investmentRequired: 85000000,
    timelineMonths: 16
  },
  {
    state: 'BA',
    currentCoverage: 45.2,
    projectedCoverage: 68.7,
    population: 14873064,
    investmentRequired: 95000000,
    timelineMonths: 24
  },
  {
    state: 'MG',
    currentCoverage: 52.1,
    projectedCoverage: 73.4,
    population: 21168791,
    investmentRequired: 110000000,
    timelineMonths: 22
  },
  {
    state: 'PR',
    currentCoverage: 58.6,
    projectedCoverage: 79.2,
    population: 11597484,
    investmentRequired: 68000000,
    timelineMonths: 20
  },
  {
    state: 'RS',
    currentCoverage: 61.3,
    projectedCoverage: 81.8,
    population: 11466630,
    investmentRequired: 72000000,
    timelineMonths: 19
  },
  {
    state: 'PE',
    currentCoverage: 42.7,
    projectedCoverage: 65.3,
    population: 9616621,
    investmentRequired: 58000000,
    timelineMonths: 23
  },
  {
    state: 'CE',
    currentCoverage: 38.5,
    projectedCoverage: 62.1,
    population: 9187103,
    investmentRequired: 54000000,
    timelineMonths: 25
  }
];

export const fiveGInventoryData: FiveGInventory[] = [
  {
    equipment: 'Antena 5G Massiva MIMO',
    currentStock: 1250,
    requiredStock: 3500,
    unitCost: 45000,
    supplier: 'Ericsson',
    leadTime: 90
  },
  {
    equipment: 'Radio Unit (RU)',
    currentStock: 2100,
    requiredStock: 5200,
    unitCost: 32000,
    supplier: 'Nokia',
    leadTime: 75
  },
  {
    equipment: 'Baseband Unit (BBU)',
    currentStock: 980,
    requiredStock: 2800,
    unitCost: 85000,
    supplier: 'Huawei',
    leadTime: 120
  },
  {
    equipment: 'Cabo de Fibra Óptica (km)',
    currentStock: 5400,
    requiredStock: 18500,
    unitCost: 850,
    supplier: 'Furukawa',
    leadTime: 45
  },
  {
    equipment: 'Torre Metálica 30m',
    currentStock: 340,
    requiredStock: 1200,
    unitCost: 125000,
    supplier: 'Engepoli',
    leadTime: 180
  },
  {
    equipment: 'Sistema de Energia Solar',
    currentStock: 580,
    requiredStock: 1500,
    unitCost: 28000,
    supplier: 'Canadian Solar',
    leadTime: 60
  },
  {
    equipment: 'Backup de Bateria',
    currentStock: 1850,
    requiredStock: 4200,
    unitCost: 15000,
    supplier: 'Moura',
    leadTime: 30
  },
  {
    equipment: 'Switch Ethernet Industrial',
    currentStock: 2200,
    requiredStock: 5800,
    unitCost: 8500,
    supplier: 'Cisco',
    leadTime: 45
  }
];

export const fiveGProjections: FiveGProjection[] = [
  {
    quarter: 'Q1 2025',
    towerDeployments: 280,
    coverageIncrease: 3.2,
    investmentAmount: 85000000,
    expectedRevenue: 12500000
  },
  {
    quarter: 'Q2 2025',
    towerDeployments: 350,
    coverageIncrease: 4.1,
    investmentAmount: 105000000,
    expectedRevenue: 18200000
  },
  {
    quarter: 'Q3 2025',
    towerDeployments: 420,
    coverageIncrease: 5.3,
    investmentAmount: 128000000,
    expectedRevenue: 25800000
  },
  {
    quarter: 'Q4 2025',
    towerDeployments: 480,
    coverageIncrease: 6.2,
    investmentAmount: 145000000,
    expectedRevenue: 34500000
  },
  {
    quarter: 'Q1 2026',
    towerDeployments: 520,
    coverageIncrease: 6.8,
    investmentAmount: 158000000,
    expectedRevenue: 42000000
  },
  {
    quarter: 'Q2 2026',
    towerDeployments: 580,
    coverageIncrease: 7.5,
    investmentAmount: 175000000,
    expectedRevenue: 51500000
  }
];

export interface NetworkMetric {
  metric: string;
  current: number;
  target: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
}

export const networkMetrics: NetworkMetric[] = [
  {
    metric: 'Latência Média',
    current: 15,
    target: 10,
    unit: 'ms',
    status: 'warning'
  },
  {
    metric: 'Throughput',
    current: 850,
    target: 1000,
    unit: 'Mbps',
    status: 'warning'
  },
  {
    metric: 'Disponibilidade',
    current: 99.2,
    target: 99.9,
    unit: '%',
    status: 'good'
  },
  {
    metric: 'Taxa de Drop',
    current: 0.8,
    target: 0.5,
    unit: '%',
    status: 'warning'
  },
  {
    metric: 'Handover Success',
    current: 97.5,
    target: 98.5,
    unit: '%',
    status: 'good'
  }
];
