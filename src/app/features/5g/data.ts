// Data structures for 5G Features page
export const kpis = [
  { 
    icon: '🌐', 
    label: 'Cobertura', 
    value: '900', 
    unit: 'municípios', 
    trend: '+50%', 
    tooltip: 'Adicionamos 300 cidades à cobertura 5G nos últimos 12 meses.',
    insight: '📊 900 municípios cobertos representam 16% do total brasileiro. Crescimento de +25 municípios/mês indica expansão acelerada. Cada novo município gera +3.2% demanda em materiais. Meta: 1.200 municípios até 2026.'
  },
  { 
    icon: '💰', 
    label: 'Investimento', 
    value: 'R$ 2.4B', 
    unit: 'YTD', 
    trend: '+500M', 
    tooltip: 'Investimento total em infraestrutura 5G este ano.',
    insight: '💰 Investimento de R$ 2.4B YTD com ROI estimado de 12-15% ao ano. R$ 500M adicionais vs. ano anterior (+26%). Cada R$ 1M investido cobre ~0.38 municípios. Projeção 2025: R$ 3.2B.'
  },
  { 
    icon: '📈', 
    label: 'Demanda', 
    value: '+185%', 
    unit: 'picos', 
    trend: 'vs. média', 
    tooltip: 'Aumento esperado de demanda de materiais em regiões ativas.',
    insight: '📈 Demanda +185% vs. média histórica indica pico de expansão. Regiões Sudeste e Centro-Oeste concentram 57% da demanda. Oportunidade de vendas: R$ 3.2M. Recomenda-se priorizar estoque nestas regiões.'
  },
  { 
    icon: '🎯', label: 'Ações', 
    value: '8', 
    unit: 'pendentes', 
    trend: '1 urgente', 
    tooltip: 'Tarefas pendentes de conclusão. 1 item crítico requer atenção.',
    insight: '🎯 8 ações pendentes, sendo 1 crítica (PSUs - ATRASADO). 3 ações de Procurement, 2 de Operations, 2 de Sales, 1 de Financeiro. Ação crítica pode impactar 15 projetos. Prioridade: Resolver PSUs hoje.'
  }
];

export const mockMilestones = [
  { date: "2025-02-10", type: "coverage", description: "Novo rollout - Sudeste", region: "Sudeste", demand: 7, materials: ["RF Kit", "Switch"], impact: "high" },
  { date: "2025-03-22", type: "upgrade", description: "Upgrade Salvador Fase 2 (+150 kits RF)", region: "Nordeste", demand: 4, materials: ["RF Kit", "Conn"], impact: "med" },
  { date: "2025-05-08", type: "coverage", description: "Cobertura em 25 cidades", region: "Norte", demand: 2, materials: ["Antena", "Fibra"], impact: "low" },
  { date: "2025-06-03", type: "license", description: "Novas licenças 700MHz ANATEL", region: "Sul", demand: 5, materials: ["Licença", "RF Kit"], impact: "med" },
  { date: "2025-09-15", type: "upgrade", description: "Upgrade RF BRASIL", region: "Centro-Oeste", demand: 3, materials: ["RF Kit"], impact: "med" }
];

export const regionDemand = [
  { region: "Sudeste", demand: "Alto", level: "high", value: 9 },
  { region: "Nordeste", demand: "Médio", level: "med", value: 5 },
  { region: "Norte", demand: "Baixo", level: "low", value: 2 },
  { region: "Sul", demand: "Médio", level: "med", value: 6 },
  { region: "Centro-Oeste", demand: "Alto", level: "high", value: 8 }
];

export const projections = {
  base: [
    { period: "30 dias", volume: 900, coverage: 918, demandUplift: "+5%", desc: "Expansão moderada, estoques OK!" },
    { period: "60 dias", volume: 1150, coverage: 980, demandUplift: "+7%", desc: "Nova janela de upgrades em Salvador." },
    { period: "90 dias", volume: 1380, coverage: 1030, demandUplift: "+9%", desc: "Chave para antecipar compras de RF kits." }
  ],
  adverse: [
    { period: "30 dias", volume: 750, coverage: 900, demandUplift: "+3%", desc: "Expansão lenta por emissão ANATEL." },
    { period: "60 dias", volume: 900, coverage: 950, demandUplift: "+5%", desc: "Recomenda revisão estratégica." },
    { period: "90 dias", volume: 1020, coverage: 980, demandUplift: "+6%", desc: "Estoques apertados - rever logística." }
  ],
  optimistic: [
    { period: "30 dias", volume: 1100, coverage: 925, demandUplift: "+7%", desc: "Avanço acelerado, liberar caixa p/ compras." },
    { period: "60 dias", volume: 1300, coverage: 990, demandUplift: "+10%", desc: "Nova expansão - Sudeste/Sul." },
    { period: "90 dias", volume: 1600, coverage: 1050, demandUplift: "+14%", desc: "Otimizar giro de estoque para RF kits." }
  ]
};

export const actions = [
  { title: "Financeiro: Contratar hedge importação RF", owner: "Financeiro", due: "2025-12-06", type: "finance" },
  { title: "Procurement: Verificar estoque switch", owner: "Procurement", due: "2025-11-26", type: "procurement" },
  { title: "Sales: Upsell IoT em regiões novas", owner: "Sales", due: "2025-12-10", type: "sales" },
  { title: "Operações: Planejar manutenção torre", owner: "Operations", due: "2025-11-20", type: "operations" },
  { title: "Procurement: Antecipar compra fibras", owner: "Procurement", due: "2025-12-05", type: "procurement" },
  { title: "Operations: Revisar cronograma centro-oeste", owner: "Operations", due: "2025-12-15", type: "operations" }
];

export const states = [
  { abbr: 'BA', name: 'Bahia', impact: 150, severity: 'high', x: 280, y: 350 },
  { abbr: 'AM', name: 'Amazonas', impact: 120, severity: 'high', x: 180, y: 150 },
  { abbr: 'PE', name: 'Pernambuco', impact: 90, severity: 'medium', x: 320, y: 320 },
  { abbr: 'DF', name: 'Distrito Federal', impact: 110, severity: 'medium', x: 260, y: 280 },
  { abbr: 'SP', name: 'São Paulo', impact: 45, severity: 'low', x: 300, y: 400 },
  { abbr: 'RJ', name: 'Rio de Janeiro', impact: 35, severity: 'low', x: 330, y: 390 },
  { abbr: 'MG', name: 'Minas Gerais', impact: 60, severity: 'low', x: 300, y: 350 }
];

export const events = [
  { date: '20/10', title: 'Salvador Fase 2', region: 'Northeast', impact: 150, severity: 'high', materials: '500 RF Conectores, 2km Fibra, 120 PSUs', revenue: 450 },
  { date: '15/10', title: 'Manaus Fase 1', region: 'North', impact: 120, severity: 'high', materials: '300 RF Conectores, 1.5km Fibra', revenue: 320 },
  { date: '31/10', title: 'Recife Upgrade', region: 'Northeast', impact: 90, severity: 'medium', materials: '250 RF Conectores, 1km Fibra', revenue: 280 },
  { date: '22/11', title: 'Brasília Expansão', region: 'Central', impact: 110, severity: 'medium', materials: '400 RF Conectores, 1.8km Fibra', revenue: 380 },
  { date: '05/11', title: 'Leilão Licenças', region: 'Multiple', impact: 85, severity: 'medium', materials: 'Diversos', revenue: 250 }
];

export const checklist = [
  {
    owner: '📦 Procurement',
    tasks: [
      { status: '✅', title: 'Garantir 500 RF Conectores', due: '15/11', info: '2 dias' },
      { status: '⏳', title: 'Pedir Cabo Fibra Óptica (2km)', due: '20/11', info: '7 dias' },
      { status: '🔴', title: 'URGENTE: PSUs (120 unidades)', due: 'HOJE', info: 'ATRASADO' }
    ]
  },
  {
    owner: '⚙️ Operations',
    tasks: [
      { status: '✅', title: 'Agendar levantamentos (Salvador)', due: '18/11', info: '5 dias' },
      { status: '⏳', title: 'Coordenar com times regionais', due: '22/11', info: '9 dias' }
    ]
  },
  {
    owner: '📢 Sales',
    tasks: [
      { status: '📌', title: 'Identificar oportunidades (Salvador)', due: '15/11', info: '2 dias' },
      { status: '📌', title: 'Preparar apresentação cliente', due: '18/11', info: '5 dias' },
      { status: '📌', title: 'Agendar chamadas executivas', due: '20/11', info: '7 dias' }
    ]
  }
];

export const towerMaintenanceData = {
  totalTowers: 18000,
  preventiveMaintenance: 12000,
  correctiveMaintenance: 800,
  urgentMaintenance: 200,
  monthlyCost: 65,
  annualProjection: 780,
  avgCostPerTower: 3600,
  maintenanceSchedule: [
    { month: 'Jan', towers: 1200, cost: 45 },
    { month: 'Fev', towers: 1350, cost: 48 },
    { month: 'Mar', towers: 1500, cost: 52 },
    { month: 'Abr', towers: 1450, cost: 50 },
    { month: 'Mai', towers: 1600, cost: 55 },
    { month: 'Jun', towers: 1750, cost: 58 }
  ]
};

export const stockManagement = {
  criticalItems: [
    { item: 'RF Kits', current: 450, ideal: 1000, percentage: 45, status: 'critical', leadTime: 18, cost: 2500 },
    { item: 'Fibra Óptica', current: 3.2, ideal: 10, percentage: 32, status: 'critical', leadTime: 25, cost: 120 },
    { item: 'PSUs', current: 780, ideal: 1000, percentage: 78, status: 'ok', leadTime: 15, cost: 450 },
    { item: 'Conectores', current: 780, ideal: 1000, percentage: 78, status: 'ok', leadTime: 12, cost: 85 },
    { item: 'Switches', current: 820, ideal: 1000, percentage: 82, status: 'ok', leadTime: 20, cost: 3200 },
    { item: 'Antenas', current: 580, ideal: 1000, percentage: 58, status: 'warning', leadTime: 22, cost: 1800 }
  ],
  totalInventoryValue: 12.5,
  turnoverRate: 4.2,
  stockoutRisk: 15
};

export const leadTimeAnalysis = {
  average: 18,
  target: 15,
  byCategory: [
    { category: 'RF Kits', avg: 18, min: 12, max: 25, trend: 'improving' },
    { category: 'Fibra Óptica', avg: 25, min: 18, max: 35, trend: 'stable' },
    { category: 'PSUs', avg: 15, min: 10, max: 20, trend: 'improving' },
    { category: 'Conectores', avg: 12, min: 8, max: 18, trend: 'improving' },
    { category: 'Switches', avg: 20, min: 15, max: 28, trend: 'stable' }
  ],
  costImpact: {
    current: 2.8,
    optimized: 1.9,
    savings: 0.9
  }
};

export const cashflowProjection = {
  currentMonth: 65,
  next3Months: [68, 72, 75],
  annualTotal: 780,
  byCategory: {
    preventive: 468,
    corrective: 156,
    upgrades: 156
  },
  paymentTerms: {
    immediate: 20,
    net30: 35,
    net60: 10
  }
};

export const alerts = [
  {
    id: 1,
    severity: 'critical',
    title: 'Estoque Crítico: RF Kits',
    message: 'Estoque abaixo de 50% (450/1000). Risco de stockout em 12 dias.',
    action: 'Urgente: Solicitar compra de 550 unidades',
    due: 'HOJE',
    impact: 'Alto - Pode afetar 15 projetos em andamento'
  },
  {
    id: 2,
    severity: 'critical',
    title: 'Fibra Óptica: Estoque Baixo',
    message: 'Apenas 32% do estoque ideal (3.2/10 km). Lead time de 25 dias.',
    action: 'Antecipar compra de 6.8 km',
    due: '15/11',
    impact: 'Alto - Necessário para 8 projetos Q1 2025'
  },
  {
    id: 3,
    severity: 'warning',
    title: 'Lead Time Aumentando: Switches',
    message: 'Lead time médio subiu para 20 dias (meta: 15 dias).',
    action: 'Revisar fornecedores alternativos',
    due: '20/11',
    impact: 'Médio - Pode impactar cronogramas'
  },
  {
    id: 4,
    severity: 'warning',
    title: 'Manutenção Urgente: 200 Torres',
    message: '200 torres requerem manutenção urgente. Custo estimado: R$ 4.2M',
    action: 'Priorizar manutenção corretiva',
    due: '18/11',
    impact: 'Alto - Risco de interrupção de serviço'
  },
  {
    id: 5,
    severity: 'info',
    title: 'Oportunidade: Otimização de Lead Time',
    message: 'Redução de lead time para 15 dias pode economizar R$ 0.9M/mês',
    action: 'Implementar estratégia de estoque just-in-time',
    due: '30/11',
    impact: 'Baixo - Oportunidade de melhoria'
  }
];

export const recommendations = [
  {
    category: 'Stock Management',
    priority: 'high',
    title: 'Implementar Sistema de Reabastecimento Automático',
    description: 'Automatizar pedidos quando estoque atinge 50% do ideal. Reduz risco de stockout em 80%.',
    impact: 'Reduz stockout risk de 15% para 3%',
    effort: 'Médio',
    roi: 'R$ 2.1M/ano em custos evitados',
    timeline: '30 dias'
  },
  {
    category: 'Lead Time',
    priority: 'high',
    title: 'Negociar Contratos com Fornecedores Prioritários',
    description: 'Estabelecer acordos de lead time garantido com fornecedores estratégicos.',
    impact: 'Reduz lead time médio de 18 para 15 dias',
    effort: 'Alto',
    roi: 'R$ 10.8M/ano em redução de custos de estoque',
    timeline: '60 dias'
  },
  {
    category: 'Cashflow',
    priority: 'medium',
    title: 'Otimizar Pagamentos para Manutenção',
    description: 'Negociar termos de pagamento estendidos (net60) para manutenção preventiva.',
    impact: 'Melhora cashflow em R$ 10M/mês',
    effort: 'Baixo',
    roi: 'R$ 120M/ano em melhor gestão de caixa',
    timeline: '15 dias'
  },
  {
    category: 'Tower Maintenance',
    priority: 'high',
    title: 'Programa Preventivo Agressivo',
    description: 'Aumentar manutenção preventiva de 67% para 80% das torres. Reduz manutenção corretiva.',
    impact: 'Reduz custos corretivos em 40% (R$ 62M/ano)',
    effort: 'Médio',
    roi: 'R$ 62M/ano em economia',
    timeline: '90 dias'
  },
  {
    category: 'Supply Chain',
    priority: 'medium',
    title: 'Diversificação de Fornecedores',
    description: 'Adicionar fornecedores alternativos para itens críticos (RF Kits, Fibra).',
    impact: 'Reduz risco de supply chain disruption em 60%',
    effort: 'Alto',
    roi: 'R$ 5M/ano em risco evitado',
    timeline: '120 dias'
  }
];

export const supplyChainStorytelling = [
  {
    title: 'O Desafio das 18.000 Torres',
    content: `Com uma frota de 18.000 torres espalhadas pelo Brasil, a gestão de manutenção e estoque se torna um desafio logístico complexo. Cada torre requer manutenção preventiva trimestral, com custo médio de R$ 3.600/mês. O total anual de manutenção chega a R$ 780M, distribuído entre preventiva (60%), corretiva (20%) e upgrades (20%).`,
    metrics: [
      { label: 'Torres Totais', value: '18.000', color: 'primary' },
      { label: 'Custo Mensal', value: 'R$ 65M', color: 'warning' },
      { label: 'Custo Anual', value: 'R$ 780M', color: 'error' }
    ]
  },
  {
    title: 'Gestão de Estoque: O Equilíbrio Perfeito',
    content: `Manter estoque adequado é crucial. Estoque excessivo trava capital (R$ 12.5M em inventário), enquanto estoque insuficiente causa stockouts e atrasos. Atualmente, RF Kits (45%) e Fibra Óptica (32%) estão em níveis críticos, com risco de stockout em 12-15 dias. O sistema recomenda reabastecimento automático quando estoque atinge 50% do ideal.`,
    metrics: [
      { label: 'Valor Total Estoque', value: 'R$ 12.5M', color: 'primary' },
      { label: 'Risco de Stockout', value: '15%', color: 'error' },
      { label: 'Giro de Estoque', value: '4.2x/ano', color: 'success' }
    ]
  },
  {
    title: 'Lead Time: O Tempo é Dinheiro',
    content: `O lead time médio atual é de 18 dias, acima da meta de 15 dias. Cada dia adicional de lead time custa aproximadamente R$ 155K em custos de estoque e oportunidades perdidas. Reduzir lead time para 15 dias economizaria R$ 0.9M/mês (R$ 10.8M/ano). Switches (20 dias) e Fibra Óptica (25 dias) são os maiores gargalos.`,
    metrics: [
      { label: 'Lead Time Médio', value: '18 dias', color: 'warning' },
      { label: 'Meta', value: '15 dias', color: 'success' },
      { label: 'Economia Potencial', value: 'R$ 10.8M/ano', color: 'success' }
    ]
  },
  {
    title: 'Cashflow: A Arte de Gerenciar o Caixa',
    content: `Com R$ 65M/mês em custos de manutenção, a gestão de cashflow é essencial. Atualmente, 30% é pago imediatamente, 54% em net30, e 16% em net60. Negociar termos estendidos para manutenção preventiva pode melhorar o cashflow em R$ 10M/mês, liberando capital para investimentos estratégicos.`,
    metrics: [
      { label: 'Custo Mensal', value: 'R$ 65M', color: 'warning' },
      { label: 'Melhoria Potencial', value: 'R$ 10M/mês', color: 'success' },
      { label: 'Impacto Anual', value: 'R$ 120M', color: 'primary' }
    ]
  }
];



















