// Centralized mock data for climate features
export interface ClimateMetric {
  date: string;
  temperature: {
    avg: number;
    max: number;
    min: number;
  };
  rainfall: number;
  humidity: number;
  wind: number;
  stormRisk: 'low' | 'medium' | 'high';
}

export interface ClimateAlert {
  id: string;
  title: string;
  severity: 'info' | 'warning' | 'critical';
  impact: string;
  recommendation: string;
  effectiveFrom: string;
  effectiveTo: string;
}

export interface ClimateCorrelation {
  factor: string;
  label: string;
  demandImpact: number;
  slaRiskDelta: number;
  materials: string;
}

export interface ClimateSummary {
  period: string;
  avgTemp: number;
  avgRainfall: number;
  riskLevel: string;
  narrative: string;
}

export const generateClimateMetrics = (days: number = 30): ClimateMetric[] => {
  return Array(days).fill(0).map((_, i) => {
    const date = new Date(2025, 9, 19 + i);
    const tempBase = 26 + Math.sin((i / days) * Math.PI) * 4;
    const rainBase = (i % 7 === 5 || i % 7 === 6) ? 45 + Math.random() * 30 : 10 + Math.random() * 20;
    const stormRiskMap = rainBase > 50 ? 'high' : rainBase > 30 ? 'medium' : 'low';
    
    return {
      date: date.toISOString().split('T')[0],
      temperature: {
        avg: Math.round(tempBase),
        max: Math.round(tempBase + 4),
        min: Math.round(tempBase - 3)
      },
      rainfall: Math.round(rainBase),
      humidity: 70 + Math.random() * 20,
      wind: 5 + Math.random() * 12,
      stormRisk: stormRiskMap as 'low' | 'medium' | 'high'
    };
  });
};

export const climateAlerts: ClimateAlert[] = [
  {
    id: 'alert-1',
    title: 'Semana Chuvosa Identificada',
    severity: 'warning',
    impact: 'Chuva acumulada acima de 50mm esperada nos próximos 7 dias. Aumenta demanda de conectores e vedadores em 35-40%.',
    recommendation: 'Aumentar estoque de conectores em 400 unidades. Alertar equipe de field ops sobre condições adversas. Revisar agendamentos.',
    effectiveFrom: '2025-10-25',
    effectiveTo: '2025-11-01'
  },
  {
    id: 'alert-2',
    title: 'Risco de Tempestade - Preparar Contingência',
    severity: 'critical',
    impact: 'Evento de tempestade grave previsto para 2025-10-28. SLA em risco de até 25% se não houver preparação antecipada.',
    recommendation: 'Antecipar expedições em 48h. Suspender trabalhos de risco. Ativar equipe de 2º escalão. Comunicar clientes sobre possível atraso 24h antecipadamente.',
    effectiveFrom: '2025-10-26',
    effectiveTo: '2025-10-29'
  },
  {
    id: 'alert-3',
    title: 'Umidade Elevada - Risco de Corrosão',
    severity: 'info',
    impact: 'Umidade relativa acima de 75% durante 10 dias. Aumenta taxa de corrosão de metais em 30-40%.',
    recommendation: 'Aumentar anticorrosivos em estoque em 25%. Revisar embalagem de produtos sensíveis. Considerar desumidificadores em armazém.',
    effectiveFrom: '2025-10-19',
    effectiveTo: '2025-10-28'
  }
];

export const climateCorrelations: ClimateCorrelation[] = [
  {
    factor: 'rainfall',
    label: 'Precipitação >50mm',
    demandImpact: 40,
    slaRiskDelta: 15,
    materials: 'Conectores, vedadores'
  },
  {
    factor: 'humidity',
    label: 'Umidade >75%',
    demandImpact: 25,
    slaRiskDelta: 12,
    materials: 'Anticorrosivos, dessecantes'
  },
  {
    factor: 'temperature',
    label: 'Temperatura >30°C',
    demandImpact: 15,
    slaRiskDelta: 8,
    materials: 'Refrigeração, proteção térmica'
  },
  {
    factor: 'wind',
    label: 'Vento >15 km/h',
    demandImpact: 10,
    slaRiskDelta: 5,
    materials: 'Estruturais, ancoragem'
  }
];

export const climateSummary: ClimateSummary = {
  period: "19 Oct - 18 Nov 2025",
  avgTemp: 27,
  avgRainfall: 120,
  riskLevel: 'medium',
  narrative: 'Semana chuvosa esperada com risco médio de tempestades. Umidade elevada correlaciona com aumento de demanda em anticorrosivos.'
};

export const BRAZIL_STATES = {
  'AC': { name: 'Acre', lat: -9.0191, lng: -67.7986, region: 'North' },
  'AL': { name: 'Alagoas', lat: -9.5141, lng: -36.8210, region: 'Northeast' },
  'AP': { name: 'Amapá', lat: 1.4168, lng: -52.1685, region: 'North' },
  'AM': { name: 'Amazonas', lat: -3.1190, lng: -60.0217, region: 'North' },
  'BA': { name: 'Bahia', lat: -12.9111, lng: -38.5109, region: 'Northeast' },
  'CE': { name: 'Ceará', lat: -3.7314, lng: -38.5270, region: 'Northeast' },
  'DF': { name: 'Brasília', lat: -15.7942, lng: -47.8822, region: 'Center-West' },
  'ES': { name: 'Espírito Santo', lat: -19.1906, lng: -40.3755, region: 'Southeast' },
  'GO': { name: 'Goiás', lat: -15.6939, lng: -48.8883, region: 'Center-West' },
  'MA': { name: 'Maranhão', lat: -2.8869, lng: -45.2731, region: 'Northeast' },
  'MT': { name: 'Mato Grosso', lat: -12.6821, lng: -55.5096, region: 'Center-West' },
  'MS': { name: 'Mato Grosso do Sul', lat: -19.0150, lng: -55.7218, region: 'Center-West' },
  'MG': { name: 'Minas Gerais', lat: -18.8402, lng: -48.2829, region: 'Southeast' },
  'PA': { name: 'Pará', lat: -1.9249, lng: -51.9253, region: 'North' },
  'PB': { name: 'Paraíba', lat: -7.0632, lng: -35.7332, region: 'Northeast' },
  'PR': { name: 'Paraná', lat: -23.3041, lng: -51.4627, region: 'South' },
  'PE': { name: 'Pernambuco', lat: -7.9386, lng: -34.8816, region: 'Northeast' },
  'PI': { name: 'Piauí', lat: -6.5033, lng: -42.5853, region: 'Northeast' },
  'RJ': { name: 'Rio de Janeiro', lat: -22.2822, lng: -43.2103, region: 'Southeast' },
  'RN': { name: 'Rio Grande do Norte', lat: -5.4026, lng: -36.9480, region: 'Northeast' },
  'RS': { name: 'Rio Grande do Sul', lat: -29.6883, lng: -55.5496, region: 'South' },
  'RO': { name: 'Rondônia', lat: -11.7808, lng: -63.9039, region: 'North' },
  'RR': { name: 'Roraima', lat: 2.8235, lng: -60.6758, region: 'North' },
  'SC': { name: 'Santa Catarina', lat: -27.0932, lng: -49.4869, region: 'South' },
  'SP': { name: 'São Paulo', lat: -23.5505, lng: -46.6333, region: 'Southeast' },
  'SE': { name: 'Sergipe', lat: -10.5095, lng: -37.0675, region: 'Northeast' },
  'TO': { name: 'Tocantins', lat: -10.1753, lng: -48.2982, region: 'North' }
} as const;

export const WEATHER_DATA = {
  'AC': { temp: 28.5, precip: 191, humidity: 81, wind: 8 },
  'AL': { temp: 29.2, precip: 84, humidity: 81, wind: 9 },
  'AP': { temp: 32.3, precip: 151, humidity: 61, wind: 13 },
  'AM': { temp: 28.4, precip: 197, humidity: 87, wind: 5 },
  'BA': { temp: 25.5, precip: 82, humidity: 78, wind: 7 },
  'CE': { temp: 30.1, precip: 82, humidity: 87, wind: 7 },
  'DF': { temp: 25.1, precip: 135, humidity: 75, wind: 8 },
  'ES': { temp: 20.4, precip: 130, humidity: 71, wind: 5 },
  'GO': { temp: 24.2, precip: 135, humidity: 75, wind: 7 },
  'MA': { temp: 28.6, precip: 115, humidity: 88, wind: 10 },
  'MT': { temp: 23.7, precip: 138, humidity: 78, wind: 10 },
  'MS': { temp: 20.5, precip: 131, humidity: 71, wind: 10 },
  'MG': { temp: 22.6, precip: 122, humidity: 72, wind: 7 },
  'PA': { temp: 33.0, precip: 199, humidity: 89, wind: 14 },
  'PB': { temp: 26.5, precip: 85, humidity: 83, wind: 10 },
  'PR': { temp: 22.3, precip: 147, humidity: 67, wind: 14 },
  'PE': { temp: 27.0, precip: 86, humidity: 83, wind: 11 },
  'PI': { temp: 29.7, precip: 118, humidity: 84, wind: 13 },
  'RJ': { temp: 20.9, precip: 127, humidity: 68, wind: 12 },
  'RN': { temp: 31.3, precip: 84, humidity: 85, wind: 9 },
  'RS': { temp: 15.2, precip: 141, humidity: 61, wind: 10 },
  'RO': { temp: 26.1, precip: 189, humidity: 79, wind: 12 },
  'RR': { temp: 28.6, precip: 152, humidity: 62, wind: 5 },
  'SC': { temp: 17.5, precip: 143, humidity: 63, wind: 6 },
  'SP': { temp: 22.2, precip: 124, humidity: 67, wind: 9 },
  'SE': { temp: 27.7, precip: 83, humidity: 80, wind: 8 },
  'TO': { temp: 26.9, precip: 190, humidity: 80, wind: 7 }
} as const;

