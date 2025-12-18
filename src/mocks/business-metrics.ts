// Centralized mock data for business metrics features
export interface BusinessMetric {
  date: string;
  revenue: number;
  profit: number;
  orders: number;
  avgOrderValue: number;
  customerSatisfaction: number;
}

export interface BusinessKPI {
  id: string;
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
}

export const generateBusinessMetrics = (months: number = 12): BusinessMetric[] => {
  const baseRevenue = 150000;
  const startDate = new Date(2024, 0, 1);
  
  return Array(months).fill(0).map((_, i) => {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + i);
    
    const seasonalFactor = 1 + 0.2 * Math.sin((i / 12) * 2 * Math.PI);
    const growthFactor = 1 + (i * 0.03);
    const revenue = Math.round(baseRevenue * seasonalFactor * growthFactor * (0.9 + Math.random() * 0.2));
    const profit = Math.round(revenue * (0.15 + Math.random() * 0.1));
    const orders = Math.round(200 + i * 15 + Math.random() * 50);
    
    return {
      date: date.toISOString().split('T')[0],
      revenue,
      profit,
      orders,
      avgOrderValue: Math.round(revenue / orders),
      customerSatisfaction: Math.round(85 + Math.random() * 10)
    };
  });
};

export const businessKPIs: BusinessKPI[] = [
  {
    id: 'revenue',
    name: 'Receita Mensal',
    value: 187500,
    change: 12.5,
    trend: 'up',
    unit: 'R$'
  },
  {
    id: 'profit-margin',
    name: 'Margem de Lucro',
    value: 18.2,
    change: 2.1,
    trend: 'up',
    unit: '%'
  },
  {
    id: 'orders',
    name: 'Pedidos',
    value: 342,
    change: -3.2,
    trend: 'down',
    unit: ''
  },
  {
    id: 'avg-order',
    name: 'Ticket Médio',
    value: 548,
    change: 15.8,
    trend: 'up',
    unit: 'R$'
  },
  {
    id: 'satisfaction',
    name: 'Satisfação do Cliente',
    value: 92,
    change: 5.0,
    trend: 'up',
    unit: '%'
  },
  {
    id: 'churn',
    name: 'Taxa de Churn',
    value: 4.5,
    change: -1.2,
    trend: 'up',
    unit: '%'
  }
];

export interface CategoryPerformance {
  category: string;
  revenue: number;
  growth: number;
  units: number;
  avgPrice: number;
}

export const categoryPerformance: CategoryPerformance[] = [
  { category: 'Material Elétrico', revenue: 45600, growth: 15.2, units: 1250, avgPrice: 36.48 },
  { category: 'Material Civil', revenue: 38200, growth: 8.7, units: 980, avgPrice: 38.98 },
  { category: 'Ferro e Aço', revenue: 32800, growth: -2.3, units: 820, avgPrice: 40.00 },
  { category: 'Ferramentas', revenue: 28900, growth: 22.1, units: 1120, avgPrice: 25.80 },
  { category: 'EPI', revenue: 24500, growth: 18.5, units: 1580, avgPrice: 15.51 },
  { category: 'Outros', revenue: 17500, growth: 5.8, units: 892, avgPrice: 19.62 }
];

export interface RegionPerformance {
  region: string;
  state: string;
  revenue: number;
  growth: number;
  marketShare: number;
}

export const regionPerformance: RegionPerformance[] = [
  { region: 'Nordeste', state: 'BA', revenue: 52300, growth: 14.2, marketShare: 28.5 },
  { region: 'Sudeste', state: 'SP', revenue: 48700, growth: 11.8, marketShare: 26.5 },
  { region: 'Sul', state: 'PR', revenue: 35200, growth: 9.5, marketShare: 19.2 },
  { region: 'Centro-Oeste', state: 'DF', revenue: 28400, growth: 16.3, marketShare: 15.5 },
  { region: 'Norte', state: 'PA', revenue: 19100, growth: 21.7, marketShare: 10.3 }
];
