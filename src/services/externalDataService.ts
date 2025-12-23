// External Data Service - Aggregate data from BACEN, ANATEL, INMET

export interface EconomicIndicator {
  name: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  impact: string;
  source: 'BACEN';
  lastUpdated: string;
}

export interface InfrastructureData {
  name: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  impact: string;
  source: 'ANATEL';
  lastUpdated: string;
}

export interface WeatherData {
  name: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  impact: string;
  source: 'INMET';
  lastUpdated: string;
}

export interface ExternalFactorData {
  economic: EconomicIndicator[];
  infrastructure: InfrastructureData[];
  weather: WeatherData[];
}

class ExternalDataService {
  private cache: ExternalFactorData | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour

  async loadExternalData(): Promise<ExternalFactorData> {
    if (this.cache && Date.now() - this.cacheTimestamp < this.CACHE_DURATION) {
      return this.cache;
    }

    try {
      // Try API endpoints first
      const [economic, infrastructure, weather] = await Promise.allSettled([
        this.fetchEconomicData(),
        this.fetchInfrastructureData(),
        this.fetchWeatherData(),
      ]);

      const data: ExternalFactorData = {
        economic: economic.status === 'fulfilled' ? economic.value : this.getDefaultEconomicData(),
        infrastructure: infrastructure.status === 'fulfilled' ? infrastructure.value : this.getDefaultInfrastructureData(),
        weather: weather.status === 'fulfilled' ? weather.value : this.getDefaultWeatherData(),
      };

      this.cache = data;
      this.cacheTimestamp = Date.now();
      return data;
    } catch (error) {
      console.error('Error loading external data:', error);
      return {
        economic: this.getDefaultEconomicData(),
        infrastructure: this.getDefaultInfrastructureData(),
        weather: this.getDefaultWeatherData(),
      };
    }
  }

  private async fetchEconomicData(): Promise<EconomicIndicator[]> {
    // Use mock data for frontend-only implementation
    return this.getDefaultEconomicData();
  }

  private async fetchInfrastructureData(): Promise<InfrastructureData[]> {
    // Use mock data for frontend-only implementation
    return this.getDefaultInfrastructureData();
  }

  private async fetchWeatherData(): Promise<WeatherData[]> {
    // Use mock data for frontend-only implementation
    return this.getDefaultWeatherData();
  }

  private getDefaultEconomicData(): EconomicIndicator[] {
    return [
      {
        name: 'USD/BRL',
        value: '5.12',
        change: '+2.3%',
        changeType: 'increase',
        impact: '+3.8% custo de importação',
        source: 'BACEN',
        lastUpdated: new Date().toISOString(),
      },
      {
        name: 'IPCA',
        value: '4.42%',
        change: '-0.1%',
        changeType: 'decrease',
        impact: 'Pressão de margem neutra',
        source: 'BACEN',
        lastUpdated: new Date().toISOString(),
      },
      {
        name: 'SELIC',
        value: '10.50%',
        change: '→',
        changeType: 'neutral',
        impact: 'Custo de capital estável',
        source: 'BACEN',
        lastUpdated: new Date().toISOString(),
      },
    ];
  }

  private getDefaultInfrastructureData(): InfrastructureData[] {
    return [
      {
        name: 'Torres 5G Ativadas (Q4)',
        value: '342',
        change: '+12%',
        changeType: 'increase',
        impact: '+8% demanda de componentes',
        source: 'ANATEL',
        lastUpdated: new Date().toISOString(),
      },
      {
        name: 'Projeção Q1 2026',
        value: '512',
        change: '+50%',
        changeType: 'increase',
        impact: '+15% demanda esperada',
        source: 'ANATEL',
        lastUpdated: new Date().toISOString(),
      },
    ];
  }

  private getDefaultWeatherData(): WeatherData[] {
    return [
      {
        name: 'Risco Climático',
        value: 'BAIXO',
        change: '→',
        changeType: 'neutral',
        impact: 'Padrões normais de manutenção',
        source: 'INMET',
        lastUpdated: new Date().toISOString(),
      },
      {
        name: 'Sazonalidade Q4',
        value: '+20%',
        change: '→',
        changeType: 'neutral',
        impact: 'Pico de demanda esperado',
        source: 'INMET',
        lastUpdated: new Date().toISOString(),
      },
    ];
  }

  clearCache(): void {
    this.cache = null;
    this.cacheTimestamp = 0;
  }
}

export const externalDataService = new ExternalDataService();

