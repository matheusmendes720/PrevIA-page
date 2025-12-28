// Prescriptive Data Service - Load and cache prescriptive JSON files

import type {
  PrescriptiveInsights,
  ComprehensivePrescriptive,
  RiskAssessment,
  PrescriptiveKpiData,
  PrescriptiveTooltipData,
} from '../types/prescriptive';

class PrescriptiveDataService {
  private prescriptiveInsightsCache: PrescriptiveInsights | null = null;
  private comprehensivePrescriptiveCache: ComprehensivePrescriptive | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async loadPrescriptiveInsights(): Promise<PrescriptiveInsights> {
    if (this.prescriptiveInsightsCache && Date.now() - this.cacheTimestamp < this.CACHE_DURATION) {
      return this.prescriptiveInsightsCache;
    }

    // Use mock data for frontend-only implementation
    const mockData: PrescriptiveInsights = {
      timestamp: new Date().toISOString(),
      recommendations: [
        'URGENT: Increase safety stock for EPI family by 50%',
        'URGENT: Increase safety stock for FERRO_E_AÇO family by 50%',
        'URGENT: Increase safety stock for MATERIAL_ELETRICO family by 50%',
        'Monitor exchange rate volatility - impact on import costs',
        'Track 5G expansion patterns - affects infrastructure demand',
        'Seasonal planning: Q4 typically shows 20% higher demand',
        'Consider local sourcing for high-risk items to reduce lead times',
      ],
      risk_assessments: {
        EPI: {
          risk_score: 0.7021167666263287,
          stockout_risk: 'HIGH',
          recommended_safety_stock_days: 25,
          recommended_reorder_point_multiplier: 2.202116766626329,
        },
        FERRAMENTAS_E_EQUIPAMENTOS: {
          risk_score: 0.30229533870930386,
          stockout_risk: 'LOW',
          recommended_safety_stock_days: 19,
          recommended_reorder_point_multiplier: 1.802295338709304,
        },
        FERRO_E_AÇO: {
          risk_score: 0.7722253992690511,
          stockout_risk: 'HIGH',
          recommended_safety_stock_days: 26,
          recommended_reorder_point_multiplier: 2.2722253992690513,
        },
        MATERIAL_CIVIL: {
          risk_score: 0.43306623146447104,
          stockout_risk: 'MEDIUM',
          recommended_safety_stock_days: 21,
          recommended_reorder_point_multiplier: 1.933066231464471,
        },
        MATERIAL_ELETRICO: {
          risk_score: 0.7292794103542293,
          stockout_risk: 'HIGH',
          recommended_safety_stock_days: 25,
          recommended_reorder_point_multiplier: 2.2292794103542293,
        },
      },
      action_items: [
        'Review EPI suppliers - diversification needed',
        'Review FERRO_E_AÇO suppliers - diversification needed',
        'Review MATERIAL_ELETRICO suppliers - diversification needed',
        'Implement weekly demand review meetings',
        'Set up automated alerts for low stock levels',
        'Update procurement policies based on forecast accuracy',
        'Create contingency plans for critical items',
      ],
      business_impact: {
        potential_stockout_reduction: '40-60%',
        inventory_cost_savings: '15-25%',
        sla_improvement: '5-10%',
        roi_estimate: '80-180% within 12 months',
      },
    };

    this.prescriptiveInsightsCache = mockData;
    this.cacheTimestamp = Date.now();
    return this.prescriptiveInsightsCache;
  }

  async loadComprehensivePrescriptive(): Promise<ComprehensivePrescriptive> {
    if (this.comprehensivePrescriptiveCache && Date.now() - this.cacheTimestamp < this.CACHE_DURATION) {
      return this.comprehensivePrescriptiveCache;
    }

    // Use mock data for frontend-only implementation
    const mockData: ComprehensivePrescriptive = {
      best_model: 'RandomForest',
      model_performance: {
        mae: 27.376580335218588,
        rmse: 99.03011719838622,
        r2: 0.6240983552549567,
        mape: 342.4511737451515,
      },
      predictions: {
        frequency: {
          actual_demand: 8.4,
          predicted_demand: 8.214926235415003,
          demand_volatility: 0.0,
          forecast_error: 0.18507376458499714,
          risk_score: 0.020084128712145047,
        },
        demand_ma_7: {
          actual_demand: 1.0,
          predicted_demand: 1.0189485271597205,
          demand_volatility: 0.09608644779959069,
          forecast_error: 0.0194934090494843,
          risk_score: 0.009655228346464012,
        },
        demand_ma_30: {
          actual_demand: 1.0,
          predicted_demand: 1.005161507485148,
          demand_volatility: 0.023280037597069373,
          forecast_error: 0.005161507485148131,
          risk_score: 0.002574110597017014,
        },
      },
      recommendations: {
        frequency: {
          safety_stock: 0.0,
          reorder_point: 82.14926235415004,
          inventory_savings: 9857.911482497999,
          priority: 'LOW',
          recommended_action: 'STANDARD: Maintain current inventory policy for frequency, continue regular monitoring',
        },
        demand_ma_7: {
          safety_stock: 0.5013558450806083,
          reorder_point: 10.690841116677813,
          inventory_savings: 1222.7382325916642,
          priority: 'LOW',
          recommended_action: 'STANDARD: Maintain current inventory policy for demand_ma_7, continue regular monitoring',
        },
        demand_ma_30: {
          safety_stock: 0.12146960565480253,
          reorder_point: 10.173084680506284,
          inventory_savings: 1206.1938089821779,
          priority: 'LOW',
          recommended_action: 'STANDARD: Maintain current inventory policy for demand_ma_30, continue regular monitoring',
        },
      },
      business_scenarios: {
        frequency: {
          conservative: {
            demand_multiplier: 0.8,
            safety_stock_multiplier: 1.5,
            expected_cost: 47317.97511599042,
          },
          baseline: {
            demand_multiplier: 1.0,
            safety_stock_multiplier: 1.0,
            expected_cost: 39431.64592999202,
          },
          aggressive: {
            demand_multiplier: 1.2,
            safety_stock_multiplier: 0.7,
            expected_cost: 35488.481336992816,
          },
        },
        demand_ma_7: {
          conservative: {
            demand_multiplier: 0.8,
            safety_stock_multiplier: 1.5,
            expected_cost: 5869.14351643999,
          },
          baseline: {
            demand_multiplier: 1.0,
            safety_stock_multiplier: 1.0,
            expected_cost: 4890.952930366659,
          },
          aggressive: {
            demand_multiplier: 1.2,
            safety_stock_multiplier: 0.7,
            expected_cost: 4401.857637329993,
          },
        },
        demand_ma_30: {
          conservative: {
            demand_multiplier: 0.8,
            safety_stock_multiplier: 1.5,
            expected_cost: 5789.7302831144525,
          },
          baseline: {
            demand_multiplier: 1.0,
            safety_stock_multiplier: 1.0,
            expected_cost: 4824.775235928711,
          },
          aggressive: {
            demand_multiplier: 1.2,
            safety_stock_multiplier: 0.7,
            expected_cost: 4342.29771233584,
          },
        },
      },
      summary: {
        total_families_analyzed: 3,
        high_risk_families: 0,
        high_risk_family_names: [],
        total_inventory_savings: 12286.84352407184,
        implementation_cost: 50000,
        expected_roi: 1.948842445777242,
      },
    };

    this.comprehensivePrescriptiveCache = mockData;
    this.cacheTimestamp = Date.now();
    return this.comprehensivePrescriptiveCache;
  }

  getRiskAssessmentForFamily(family: string): RiskAssessment | null {
    if (!this.prescriptiveInsightsCache) return null;
    return this.prescriptiveInsightsCache.risk_assessments[family] || null;
  }

  getKpiPrescriptiveData(kpiTitle: string): PrescriptiveKpiData {
    const insights = this.prescriptiveInsightsCache;
    const comprehensive = this.comprehensivePrescriptiveCache;

    if (!insights && !comprehensive) {
      return {};
    }

    const data: PrescriptiveKpiData = {};

    // Map KPI titles to risk assessments
    const kpiToFamilyMap: Record<string, string> = {
      'Acurácia da Previsão': 'EPI',
      'Nível de Serviço': 'EPI',
      'Giro de Estoque': 'FERRO_E_AÇO',
      'Custo de Estoque': 'MATERIAL_ELETRICO',
    };

    const family = kpiToFamilyMap[kpiTitle];
    if (family && insights) {
      const riskAssessment = insights.risk_assessments[family];
      if (riskAssessment) {
        data.riskLevel = riskAssessment.stockout_risk;
        data.riskScore = riskAssessment.risk_score;
        
        // Determine action badge based on risk
        if (riskAssessment.risk_score > 0.65) {
          data.actionBadge = 'URGENT';
        } else if (riskAssessment.risk_score > 0.30) {
          data.actionBadge = 'REVIEW';
        } else {
          data.actionBadge = 'OK';
        }

        // Get ROI from business impact
        data.roi = insights.business_impact.roi_estimate;
        data.impact = insights.business_impact.inventory_cost_savings;
      }
    }

    // Get confidence from model performance
    if (comprehensive) {
      const r2 = comprehensive.model_performance.r2;
      data.confidence = Math.round(r2 * 100);
      data.sources = [
        'Internal: 24-month demand history',
        'ANATEL: 5G expansion patterns',
        'BACEN: Economic indicators',
        'INMET: Weather/climate data',
        'Model: RandomForest (optimized)',
      ];
    }

    return data;
  }

  getTooltipDataForKpi(kpiTitle: string): PrescriptiveTooltipData {
    const insights = this.prescriptiveInsightsCache;
    const comprehensive = this.comprehensivePrescriptiveCache;
    const kpiData = this.getKpiPrescriptiveData(kpiTitle);

    const tooltip: PrescriptiveTooltipData = {
      whatItMeans: '',
      whyItMatters: '',
      whatToDoNow: '',
    };

    // Customize based on KPI type
    switch (kpiTitle) {
      case 'Acurácia da Previsão':
        tooltip.whatItMeans = 'Mede a precisão do modelo de previsão de demanda. Valores mais altos indicam previsões mais confiáveis.';
        tooltip.whyItMatters = 'Alta acurácia reduz o risco de estoque insuficiente ou excessivo, otimizando custos de inventário e garantindo disponibilidade de componentes críticos.';
        tooltip.whatToDoNow = comprehensive
          ? `Modelo atual: ${comprehensive.best_model} (R² = ${comprehensive.model_performance.r2.toFixed(3)}). ${kpiData.riskLevel === 'HIGH' ? 'Ação urgente recomendada para famílias de alto risco.' : 'Continue monitorando regularmente.'}`
          : 'Continue monitorando a acurácia do modelo.';
        break;
      case 'Nível de Serviço':
        tooltip.whatItMeans = 'Percentual de atendimento de demandas sem ruptura de estoque. Indica a capacidade de manter componentes disponíveis quando necessários.';
        tooltip.whyItMatters = 'Nível de serviço alto garante manutenções sem atrasos, melhorando satisfação do cliente e evitando penalidades de SLA.';
        tooltip.whatToDoNow = insights
          ? `Melhoria potencial de SLA: ${insights.business_impact.sla_improvement}. ${kpiData.riskLevel === 'HIGH' ? 'Famílias de alto risco requerem atenção imediata para manter nível de serviço.' : 'Nível de serviço estável.'}`
          : 'Monitore continuamente o nível de serviço.';
        break;
      case 'Giro de Estoque':
        tooltip.whatItMeans = 'Número de vezes que o estoque é renovado em um período. Valores mais altos indicam melhor utilização do capital investido.';
        tooltip.whyItMatters = 'Alto giro reduz custos de carregamento de estoque e libera capital de giro para outros investimentos.';
        tooltip.whatToDoNow = insights
          ? `Potencial de economia: ${insights.business_impact.inventory_cost_savings}. ${kpiData.riskLevel === 'HIGH' ? 'Balancear giro com segurança de estoque para famílias críticas.' : 'Giro otimizado.'}`
          : 'Continue otimizando o giro de estoque.';
        break;
      case 'Custo de Estoque':
        tooltip.whatItMeans = 'Valor total do inventário mantido. Inclui custos de aquisição e carregamento.';
        tooltip.whyItMatters = 'Custos de estoque impactam diretamente o capital de giro e a rentabilidade. Otimização pode liberar recursos significativos.';
        tooltip.whatToDoNow = insights
          ? `Potencial de redução: ${insights.business_impact.inventory_cost_savings}. ROI estimado: ${insights.business_impact.roi_estimate}. ${kpiData.riskLevel === 'HIGH' ? 'Revisar estratégia de estoque para famílias de alto risco.' : 'Custos dentro do esperado.'}`
          : 'Monitore custos de estoque regularmente.';
        break;
      default:
        tooltip.whatItMeans = 'Métrica de desempenho operacional.';
        tooltip.whyItMatters = 'Impacta diretamente a eficiência operacional e financeira.';
        tooltip.whatToDoNow = 'Continue monitorando esta métrica.';
    }

    // Add root causes if high risk
    if (kpiData.riskLevel === 'HIGH' && insights) {
      tooltip.rootCauses = [
        'Alta volatilidade de demanda',
        'Tempos de entrega longos',
        'Dependência de fornecedor único',
        'Sazonalidade não planejada',
      ];
    }

    // Add recommended actions
    if (kpiData.actionBadge === 'URGENT' && insights) {
      tooltip.recommendedActions = [
        {
          action: 'Aumentar estoque de segurança',
          timeline: 'Esta semana',
          costImpact: 'Investimento adicional em estoque',
          benefit: 'Redução de 40-60% no risco de ruptura',
          roiMonths: 6,
          owner: 'Gerente de Compras',
          priority: 'URGENT',
        },
      ];
    }

    // Add data sources
    if (comprehensive) {
      tooltip.dataSources = [
        {
          name: 'Histórico de Demanda (24 meses)',
          type: 'internal',
          confidence: 95,
          description: 'Dados internos da Nova Corrente',
        },
        {
          name: 'ANATEL - Expansão 5G',
          type: 'government',
          confidence: 90,
          description: 'Dados oficiais de infraestrutura',
        },
        {
          name: 'BACEN - Indicadores Econômicos',
          type: 'government',
          confidence: 95,
          description: 'Dados do Banco Central do Brasil',
        },
        {
          name: 'INMET - Dados Climáticos',
          type: 'government',
          confidence: 85,
          description: 'Dados meteorológicos oficiais',
        },
      ];
    }

    return tooltip;
  }

  clearCache(): void {
    this.prescriptiveInsightsCache = null;
    this.comprehensivePrescriptiveCache = null;
    this.cacheTimestamp = 0;
  }
}

export const prescriptiveDataService = new PrescriptiveDataService();

