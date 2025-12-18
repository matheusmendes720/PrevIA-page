

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import InventoryPieChart from './InventoryPieChart';
import SupplierBarChart from './SupplierBarChart';
import { PieChartData, BarChartData, StateData, TimeSeriesDataPoint, Project, FinancialDataPoint, InventoryItem, Supplier } from '../types';
import InteractiveMap from './InteractiveMap';
import HistoricalDataChart from './HistoricalDataChart';
import ProjectStatusChart from './ProjectStatusChart';
import FinancialOverviewChart from './FinancialOverviewChart';
import MaintenanceTypeChart from './MaintenanceTypeChart';
import Card from './Card';
import { LightBulbIcon } from './icons';
import GeminiAnalysis from './GeminiAnalysis';
import AnalyticsDetailModal from './AnalyticsDetailModal';
import FormulaExplainer from './FormulaExplainer';
import ClusteringDashboard from './ClusteringDashboard';
import ModelPerformanceDashboard from './ModelPerformanceDashboard';
import PrescriptiveRecommendationsEnhanced from './PrescriptiveRecommendationsEnhanced';

const globalInventoryData: PieChartData[] = [
    { name: 'Cabos e Fibras', value: 450 },
    { name: 'Conectores', value: 300 },
    { name: 'Equipamentos Ativos', value: 320 },
    { name: 'Hardware Estrutural', value: 210 },
    { name: 'Baterias e Energia', value: 180 },
];

const globalSupplierData: BarChartData[] = [
    { name: 'Fornecedor A', 'Lead Time (dias)': 15 },
    { name: 'Fornecedor B', 'Lead Time (dias)': 22 },
    { name: 'Fornecedor C', 'Lead Time (dias)': 18 },
    { name: 'Fornecedor D', 'Lead Time (dias)': 25 },
    { name: 'Fornecedor E', 'Lead Time (dias)': 12 },
];

const globalMaintenanceHistory: TimeSeriesDataPoint[] = [
    { date: 'Jan', Manutenções: 120 }, { date: 'Fev', Manutenções: 130 }, { date: 'Mar', Manutenções: 150 },
    { date: 'Abr', Manutenções: 140 }, { date: 'Mai', Manutenções: 160 }, { date: 'Jun', Manutenções: 155 },
    { date: 'Jul', Manutenções: 170 }, { date: 'Ago', Manutenções: 180 }, { date: 'Set', Manutenções: 175 },
    { date: 'Out', Manutenções: 190 }, { date: 'Nov', Manutenções: 210 }, { date: 'Dez', Manutenções: 200 },
];


const mockStateData: Record<string, StateData> = {
    'AC': { name: 'Acre', category: 'consolidated', towers: 45, maintenance: 3, projects: 5, 
        projectsList: [
            {id: 'AC-P1', name: 'Conexão Rural Acre', status: 'Planning', budget: 500000, actualBudget: 50000, manager: 'Carlos Silva'}
        ], 
        maintenanceSchedule: [
            {id: 'AC-M1', description: 'Inspeção Torre Rio Branco', type: 'Preventive', scheduledDate: '15/08/2024', status: 'Scheduled', equipmentId: 'EQ-AC-001'}
        ], 
        inventory: [
             { id: 'AC-INV-01', name: 'Painel Solar 150W', category: 'Baterias e Energia', quantity: 20, value: 30000, reorderPoint: 10, supplierId: 'SUP-REG-NORTE' }
        ], 
        suppliers: [
            { id: 'SUP-REG-NORTE', name: 'Distribuidora Norte', avgLeadTime: 35, reliability: 85 }
        ],
        maintenanceHistory: [ { date: 'Jul', Manutenções: 3 } ]
    },
    'AL': { name: 'Alagoas', category: 'expansion', towers: 120, maintenance: 8, projects: 12, 
        projectsList: [
            {id: 'AL-P1', name: 'Fibra Litoral Alagoano', status: 'In Progress', budget: 1500000, actualBudget: 900000, manager: 'Daniela Souza'}
        ], 
        maintenanceSchedule: [
            {id: 'AL-M1', description: 'Manutenção Pajuçara', type: 'Corrective', scheduledDate: '10/07/2024', status: 'Completed', equipmentId: 'EQ-AL-001'}
        ], 
        inventory: [
            {id: 'AL-INV-1', name: 'Cabo Drop 1FO', category: 'Cabos e Fibras', quantity: 100, value: 30000, reorderPoint: 50, supplierId: 'SUP-NE-1'}
        ], 
        suppliers: [
            {id: 'SUP-NE-1', name: 'Fornecedor Nordeste A', avgLeadTime: 25, reliability: 90}
        ],
        maintenanceHistory: [ { date: 'Jul', Manutenções: 8 } ]
    },
    'AP': { name: 'Amapá', category: 'consolidated', towers: 30, maintenance: 1, projects: 4, 
        projectsList: [
            {id: 'AP-P1', name: 'Torre Macapá', status: 'Completed', budget: 750000, actualBudget: 740000, manager: 'Fernanda Alves'}
        ], 
        maintenanceSchedule: [], 
        inventory: [
            { id: 'AP-INV-01', name: 'Bateria Selada 12V', category: 'Baterias e Energia', quantity: 40, value: 24000, reorderPoint: 20, supplierId: 'SUP-REG-NORTE' }
        ], 
        suppliers: [
            { id: 'SUP-REG-NORTE', name: 'Distribuidora Norte', avgLeadTime: 35, reliability: 85 }
        ] 
    },
    'AM': { name: 'Amazonas', category: 'consolidated', towers: 80, maintenance: 5, projects: 10, 
        projectsList: [
            { id: 'AM-P1', name: 'Expansão 4G Manaus', description: 'Projeto para aumentar a cobertura 4G na área metropolitana de Manaus, incluindo a instalação de 15 novas torres.', status: 'In Progress', budget: 1200000, actualBudget: 750000, manager: 'Beatriz Costa', startDate: '01/06/2024', endDate: '31/10/2024' },
            { id: 'AM-P2', name: 'Fibra Óptica Parintins', description: 'Levar infraestrutura de fibra óptica para a cidade de Parintins para melhorar a conectividade local.', status: 'Completed', budget: 850000, actualBudget: 820000, manager: 'Fernanda Alves', startDate: '01/09/2023', endDate: '30/04/2024'  },
        ], 
        maintenanceSchedule: [
            { id: 'AM-M1', description: 'Manutenção Torre 112', type: 'Preventive', scheduledDate: '20/07/2024', status: 'Scheduled', equipmentId: 'EQ-AM-001', assignedTo: 'Equipe Gamma', notes: 'Verificação de rotina dos sistemas de energia e transmissão.' }
        ],
        inventory: [
            { id: 'AM-INV-01', name: 'Antena 3.5GHz', category: 'Equipamentos Ativos', quantity: 80, value: 96000, reorderPoint: 40, supplierId: 'SUP-02B' },
            { id: 'AM-INV-02', name: 'Caixa de Emenda Óptica', category: 'Hardware Estrutural', quantity: 300, value: 45000, reorderPoint: 150, supplierId: 'SUP-02B' },
        ],
        suppliers: [
            { id: 'SUP-02B', name: 'Fornecedor B (AM)', avgLeadTime: 35, reliability: 88.0 },
        ],
         maintenanceHistory: [ { date: 'Jul', Manutenções: 5 }, { date: 'Ago', Manutenções: 7 } ]
    },
    'BA': { name: 'Bahia', category: 'expansion', towers: 450, maintenance: 25, projects: 40, 
        projectsList: [
            {id: 'BA-P1', name: 'Expansão Costa do Dendê', status: 'In Progress', budget: 3500000, actualBudget: 2100000, manager: 'Gustavo Pereira'}, 
            {id: 'BA-P2', name: 'Modernização Salvador', status: 'Planning', budget: 5000000, manager: 'Helena Ribeiro'}
        ], 
        maintenanceSchedule: [
            {id: 'BA-M1', description: 'Manutenção de rotina Pelourinho', type: 'Preventive', scheduledDate: '22/07/2024', status: 'Scheduled', equipmentId: 'EQ-BA-PEL'}
        ], 
        inventory: [
            {id: 'BA-INV-1', name: 'Transceptor 5G', category: 'Equipamentos Ativos', quantity: 150, value: 450000, reorderPoint: 70, supplierId: 'SUP-NE-1'},
            {id: 'BA-INV-2', name: 'Parafuso M16 Aço Inox', category: 'Hardware Estrutural', quantity: 5000, value: 7500, reorderPoint: 2500, supplierId: 'SUP-NE-2'}
        ], 
        suppliers: [
            {id: 'SUP-NE-1', name: 'Fornecedor Nordeste A', avgLeadTime: 18, reliability: 94},
            {id: 'SUP-NE-2', name: 'Fornecedor Nordeste B', avgLeadTime: 24, reliability: 91}
        ],
        maintenanceHistory: [ { date: 'Jun', Manutenções: 20 }, { date: 'Jul', Manutenções: 25 } ]
    },
    'CE': { name: 'Ceará', category: 'expansion', towers: 300, maintenance: 18, projects: 22, 
        projectsList: [
            {id: 'CE-P1', name: 'Rede Metro Fortaleza', status: 'Completed', budget: 4000000, actualBudget: 3800000, manager: 'Fernanda Alves'}
        ], 
        maintenanceSchedule: [], 
        inventory: [
            { id: 'CE-INV-1', name: 'Roteador de Borda', category: 'Equipamentos Ativos', quantity: 40, value: 320000, reorderPoint: 15, supplierId: 'SUP-NE-1' }
        ], 
        suppliers: [
             {id: 'SUP-NE-1', name: 'Fornecedor Nordeste A', avgLeadTime: 20, reliability: 93}
        ] 
    },
    'DF': { name: 'Distrito Federal', category: 'expansion', towers: 150, maintenance: 10, projects: 15, 
        projectsList: [
            {id: 'DF-P1', name: '5G Eixo Monumental', status: 'In Progress', budget: 2000000, actualBudget: 1200000, manager: 'Beatriz Costa'}
        ], 
        maintenanceSchedule: [], 
        inventory: [
            { id: 'DF-INV-1', name: 'Antena 5G mmWave', category: 'Equipamentos Ativos', quantity: 60, value: 180000, reorderPoint: 25, supplierId: 'SUP-CO-1' }
        ], 
        suppliers: [
            {id: 'SUP-CO-1', name: 'Fornecedor Centro-Oeste', avgLeadTime: 15, reliability: 97 }
        ] 
    },
    'ES': { name: 'Espírito Santo', category: 'expansion', towers: 180, maintenance: 12, projects: 18, 
        projectsList: [
            {id: 'ES-P1', name: 'Malha Óptica Vitória', status: 'Planning', budget: 1800000, manager: 'Daniela Souza'}
        ], 
        maintenanceSchedule: [], 
        inventory: [
            { id: 'ES-INV-1', name: 'Splitter Óptico 1x8', category: 'Conectores', quantity: 200, value: 10000, reorderPoint: 100, supplierId: 'SUP-SE-2' }
        ], 
        suppliers: [
            { id: 'SUP-SE-2', name: 'Fornecedor Sudeste B', avgLeadTime: 16, reliability: 96 }
        ] 
    },
    'GO': { name: 'Goiás', category: 'expansion', towers: 320, maintenance: 20, projects: 30, 
        projectsList: [
            {id: 'GO-P1', name: 'Conectividade Agronegócio', status: 'In Progress', budget: 2800000, actualBudget: 1500000, manager: 'Gustavo Pereira'}
        ], 
        maintenanceSchedule: [], 
        inventory: [
             { id: 'GO-INV-1', name: 'Antena Rural 700MHz', category: 'Equipamentos Ativos', quantity: 150, value: 120000, reorderPoint: 60, supplierId: 'SUP-CO-1' }
        ], 
        suppliers: [
            {id: 'SUP-CO-1', name: 'Fornecedor Centro-Oeste', avgLeadTime: 18, reliability: 94 }
        ] 
    },
    'MA': { name: 'Maranhão', category: 'expansion', towers: 200, maintenance: 15, projects: 18, 
        projectsList: [
            {id: 'MA-P1', name: 'Expansão São Luís', status: 'Completed', budget: 2200000, actualBudget: 2100000, manager: 'Fernanda Alves'}
        ], 
        maintenanceSchedule: [], 
        inventory: [
            { id: 'MA-INV-1', name: 'Cabo Óptico 1Km', category: 'Cabos e Fibras', quantity: 30, value: 90000, reorderPoint: 15, supplierId: 'SUP-NE-2' }
        ], 
        suppliers: [
            { id: 'SUP-NE-2', name: 'Fornecedor Nordeste B', avgLeadTime: 28, reliability: 89 }
        ] 
    },
    'MT': { name: 'Mato Grosso', category: 'consolidated', towers: 250, maintenance: 14, projects: 25, 
        projectsList: [
            {id: 'MT-P1', name: 'Infovia do Pantanal', status: 'In Progress', budget: 3000000, actualBudget: 1800000, manager: 'Gustavo Pereira'}
        ], 
        maintenanceSchedule: [], 
        inventory: [
            { id: 'MT-INV-1', name: 'Rádio Ponto-a-Ponto 5.8GHz', category: 'Equipamentos Ativos', quantity: 50, value: 75000, reorderPoint: 20, supplierId: 'SUP-CO-1' }
        ], 
        suppliers: [
            { id: 'SUP-CO-1', name: 'Fornecedor Centro-Oeste', avgLeadTime: 22, reliability: 92 }
        ] 
    },
    'MS': { name: 'Mato Grosso do Sul', category: 'expansion', towers: 190, maintenance: 9, projects: 20, 
        projectsList: [
            {id: 'MS-P1', name: 'Conexão Bonito', status: 'Planning', budget: 1200000, manager: 'Daniela Souza'}
        ], 
        maintenanceSchedule: [], 
        inventory: [
            { id: 'MS-INV-1', name: 'OLT GPON 16 Portas', category: 'Equipamentos Ativos', quantity: 25, value: 175000, reorderPoint: 10, supplierId: 'SUP-SUL-1' }
        ], 
        suppliers: [
             { id: 'SUP-SUL-1', name: 'Fornecedor Sul A', avgLeadTime: 20, reliability: 95 }
        ] 
    },
    'MG': { name: 'Minas Gerais', category: 'expansion', towers: 600, maintenance: 40, projects: 55, 
        projectsList: [
            {id: 'MG-P1', name: '5G Cidades Históricas', status: 'In Progress', budget: 6000000, actualBudget: 3500000, manager: 'Beatriz Costa'}, 
            {id: 'MG-P2', name: 'Fibra Triângulo Mineiro', status: 'Completed', budget: 4500000, actualBudget: 4400000, manager: 'Fernanda Alves'}
        ], 
        maintenanceSchedule: [], 
        inventory: [
            { id: 'MG-INV-1', name: 'Bateria de Lítio 48V', category: 'Baterias e Energia', quantity: 250, value: 300000, reorderPoint: 100, supplierId: 'SUP-SE-1' },
            { id: 'MG-INV-2', name: 'Módulo SFP+ 10G', category: 'Equipamentos Ativos', quantity: 400, value: 200000, reorderPoint: 150, supplierId: 'SUP-SE-2' }
        ], 
        suppliers: [
            { id: 'SUP-SE-1', name: 'Fornecedor Sudeste A', avgLeadTime: 15, reliability: 98 },
            { id: 'SUP-SE-2', name: 'Fornecedor Sudeste B', avgLeadTime: 18, reliability: 94 }
        ] 
    },
    'PA': { name: 'Pará', category: 'consolidated', towers: 150, maintenance: 12, projects: 20, 
        projectsList: [
            {id: 'PA-P1', name: 'Norte Conectado - Pará', status: 'In Progress', budget: 4000000, actualBudget: 2000000, manager: 'Carlos Silva'}
        ], 
        maintenanceSchedule: [], 
        inventory: [
             { id: 'PA-INV-01', name: 'Antena Satelital Banda Ka', category: 'Equipamentos Ativos', quantity: 30, value: 210000, reorderPoint: 10, supplierId: 'SUP-REG-NORTE' }
        ], 
        suppliers: [
             { id: 'SUP-REG-NORTE', name: 'Distribuidora Norte', avgLeadTime: 40, reliability: 82 }
        ] 
    },
    'PB': { name: 'Paraíba', category: 'expansion', towers: 140, maintenance: 7, projects: 10, 
        projectsList: [
            {id: 'PB-P1', name: 'Projeto Litoral Paraibano', status: 'Completed', budget: 1300000, actualBudget: 1250000, manager: 'Eduardo Lima'}
        ], 
        maintenanceSchedule: [], 
        inventory: [
            { id: 'PB-INV-1', name: 'Caixa Terminal Óptica', category: 'Hardware Estrutural', quantity: 500, value: 35000, reorderPoint: 200, supplierId: 'SUP-NE-2' }
        ], 
        suppliers: [
            { id: 'SUP-NE-2', name: 'Fornecedor Nordeste B', avgLeadTime: 26, reliability: 90 }
        ] 
    },
    'PR': { name: 'Paraná', category: 'expansion', towers: 400, maintenance: 30, projects: 45, 
        projectsList: [
            {id: 'PR-P1', name: 'Expansão Curitiba e RMC', status: 'In Progress', budget: 4800000, actualBudget: 3000000, manager: 'Daniela Souza'}
        ], 
        maintenanceSchedule: [], 
        inventory: [
            { id: 'PR-INV-1', name: 'Switch Gerenciável L2', category: 'Equipamentos Ativos', quantity: 100, value: 200000, reorderPoint: 40, supplierId: 'SUP-SUL-1' },
            { id: 'PR-INV-2', name: 'Gabinete Outdoor 42U', category: 'Hardware Estrutural', quantity: 40, value: 120000, reorderPoint: 15, supplierId: 'SUP-SUL-2' }
        ], 
        suppliers: [
            { id: 'SUP-SUL-1', name: 'Fornecedor Sul A', avgLeadTime: 14, reliability: 97 },
            { id: 'SUP-SUL-2', name: 'Fornecedor Sul B', avgLeadTime: 19, reliability: 93 }
        ] 
    },
    'PE': { name: 'Pernambuco', category: 'expansion', towers: 350, maintenance: 22, projects: 30, 
        projectsList: [
            {id: 'PE-P1', name: 'Porto Digital Conectado', status: 'Completed', budget: 3200000, actualBudget: 3100000, manager: 'Fernanda Alves'},
            {id: 'PE-P2', name: 'Expansão 5G Agreste', description: 'Levar cobertura 5G para o interior do estado, focando no polo de confecções.', status: 'In Progress', budget: 4500000, actualBudget: 2000000, manager: 'Beatriz Costa' }
        ], 
        maintenanceSchedule: [
             {id: 'PE-M1', description: 'Verificação Torre Recife Antigo', type: 'Preventive', scheduledDate: '28/07/2024', status: 'Scheduled', equipmentId: 'EQ-PE-001'}
        ], 
        inventory: [
            { id: 'PE-INV-1', name: 'Switch Gerenciável L2', category: 'Equipamentos Ativos', quantity: 80, value: 160000, reorderPoint: 35, supplierId: 'SUP-NE-1' },
            { id: 'PE-INV-2', name: 'Cabo UTP Cat6', category: 'Cabos e Fibras', quantity: 50, value: 15000, reorderPoint: 25, supplierId: 'SUP-NE-2' }
        ], 
        suppliers: [
            { id: 'SUP-NE-1', name: 'Fornecedor Nordeste A', avgLeadTime: 21, reliability: 93.5 },
            { id: 'SUP-NE-2', name: 'Fornecedor Nordeste B', avgLeadTime: 25, reliability: 90 }
        ],
        maintenanceHistory: [ { date: 'Jun', Manutenções: 18 }, { date: 'Jul', Manutenções: 22 } ]
    },
    'PI': { name: 'Piauí', category: 'expansion', towers: 160, maintenance: 10, projects: 14, 
        projectsList: [
            {id: 'PI-P1', name: 'Serra da Capivara 4G', status: 'Planning', budget: 1100000, manager: 'Carlos Silva'}
        ], 
        maintenanceSchedule: [], 
        inventory: [
            { id: 'PI-INV-1', name: 'Conector Óptico SC/APC', category: 'Conectores', quantity: 2000, value: 10000, reorderPoint: 1000, supplierId: 'SUP-NE-2' }
        ], 
        suppliers: [
             { id: 'SUP-NE-2', name: 'Fornecedor Nordeste B', avgLeadTime: 30, reliability: 88 }
        ] 
    },
    'RJ': { name: 'Rio de Janeiro', category: 'expansion', towers: 550, maintenance: 35, projects: 50,
        projectsList: [
            { id: 'RJ-P1', name: 'Implantação 5G-SA', description: 'Implementação da rede 5G Stand-Alone em toda a região metropolitana do Rio, focando em áreas de alta densidade populacional.', status: 'In Progress', budget: 5000000, actualBudget: 3100000, manager: 'Beatriz Costa', startDate: '01/02/2024', endDate: '30/09/2024' },
            { id: 'RJ-P2', name: 'Reforço Estrutural Torre 20', description: 'Reforço da estrutura da Torre 20 para suportar novos equipamentos 5G e melhorar a resiliência a ventos fortes.', status: 'Planning', budget: 750000, manager: 'Daniela Souza', startDate: '01/10/2024', endDate: '31/12/2024' },
            { id: 'RJ-P3', name: 'Backbone Baixada Fluminense', description: 'Construção de um novo anel de fibra óptica para aumentar a capacidade e a redundância do backbone na Baixada Fluminense.', status: 'Completed', budget: 3200000, actualBudget: 3150000, manager: 'Fernanda Alves', startDate: '01/05/2023', endDate: '28/02/2024' },
        ],
        maintenanceSchedule: [
            { id: 'RJ-M1', description: 'Troca de Baterias - Torre 5', type: 'Preventive', scheduledDate: '25/07/2024', status: 'Scheduled', equipmentId: 'EQ-RJ-001', assignedTo: 'Equipe Beta', notes: 'Substituição preventiva do banco de baterias conforme ciclo de vida do fabricante.' },
            { id: 'RJ-M2', description: 'Falha no Transmissor - Torre 12', type: 'Corrective', scheduledDate: '01/07/2024', status: 'Completed', equipmentId: 'EQ-RJ-002', assignedTo: 'Carlos Silva', projectId: 'RJ-P1', notes: 'Transmissor substituído após falha intermitente. Causa raiz: superaquecimento.' },
        ],
        inventory: [
            { id: 'RJ-INV-01', name: 'Transceptor 5G', category: 'Equipamentos Ativos', quantity: 120, value: 360000, reorderPoint: 50, supplierId: 'SUP-05' },
            { id: 'RJ-INV-02', name: 'Conector Óptico SC/APC', category: 'Conectores', quantity: 5000, value: 25000, reorderPoint: 2000, supplierId: 'SUP-02' },
            { id: 'RJ-INV-03', name: 'Fonte de Alimentação AC/DC', category: 'Baterias e Energia', quantity: 200, value: 60000, reorderPoint: 100, supplierId: 'SUP-02' },
        ],
        suppliers: [
            { id: 'SUP-02', name: 'Fornecedor B (RJ)', avgLeadTime: 20, reliability: 92.3 },
            { id: 'SUP-05', name: 'Fornecedor E (RJ)', avgLeadTime: 14, reliability: 99.1 },
        ],
        maintenanceHistory: [ { date: 'Jun', Manutenções: 32 }, { date: 'Jul', Manutenções: 35 } ]
    },
    'RN': { name: 'Rio Grande do Norte', category: 'expansion', towers: 130, maintenance: 9, projects: 11, 
        projectsList: [
            {id: 'RN-P1', name: 'Conexão Litoral Potiguar', status: 'In Progress', budget: 1400000, actualBudget: 800000, manager: 'Eduardo Lima'}
        ], 
        maintenanceSchedule: [], 
        inventory: [
            { id: 'RN-INV-1', name: 'ONT Wi-Fi 6', category: 'Equipamentos Ativos', quantity: 300, value: 105000, reorderPoint: 150, supplierId: 'SUP-NE-1' }
        ], 
        suppliers: [
            { id: 'SUP-NE-1', name: 'Fornecedor Nordeste A', avgLeadTime: 24, reliability: 91 }
        ] 
    },
    'RS': { name: 'Rio Grande do Sul', category: 'expansion', towers: 420, maintenance: 28, projects: 38, 
        projectsList: [
            {id: 'RS-P1', name: 'Malha Metropolitana POA', status: 'Completed', budget: 4200000, actualBudget: 4100000, manager: 'Fernanda Alves'}
        ], 
        maintenanceSchedule: [], 
        inventory: [
             { id: 'RS-INV-1', name: 'Cabo Óptico 1Km', category: 'Cabos e Fibras', quantity: 60, value: 180000, reorderPoint: 25, supplierId: 'SUP-SUL-1' },
             { id: 'RS-INV-2', name: 'Placa de Circuito TX/RX', category: 'Equipamentos Ativos', quantity: 90, value: 135000, reorderPoint: 40, supplierId: 'SUP-SUL-2' }
        ], 
        suppliers: [
             { id: 'SUP-SUL-1', name: 'Fornecedor Sul A', avgLeadTime: 12, reliability: 98 },
             { id: 'SUP-SUL-2', name: 'Fornecedor Sul B', avgLeadTime: 18, reliability: 94 }
        ] 
    },
    'RO': { name: 'Rondônia', category: 'consolidated', towers: 60, maintenance: 4, projects: 8, 
        projectsList: [
            {id: 'RO-P1', name: 'BR-364 Conectada', status: 'Planning', budget: 900000, manager: 'Carlos Silva'}
        ], 
        maintenanceSchedule: [], 
        inventory: [
             { id: 'RO-INV-1', name: 'Rádio Ponto-a-Ponto 5.8GHz', category: 'Equipamentos Ativos', quantity: 30, value: 45000, reorderPoint: 15, supplierId: 'SUP-REG-NORTE' }
        ], 
        suppliers: [
            { id: 'SUP-REG-NORTE', name: 'Distribuidora Norte', avgLeadTime: 38, reliability: 84 }
        ] 
    },
    'RR': { name: 'Roraima', category: 'consolidated', towers: 25, maintenance: 2, projects: 3, 
        projectsList: [
            {id: 'RR-P1', name: 'Fronteira Digital', status: 'In Progress', budget: 600000, actualBudget: 300000, manager: 'Gustavo Pereira'}
        ], 
        maintenanceSchedule: [], 
        inventory: [
            { id: 'RR-INV-1', name: 'Antena Satelital Banda Ka', category: 'Equipamentos Ativos', quantity: 15, value: 105000, reorderPoint: 5, supplierId: 'SUP-REG-NORTE' }
        ], 
        suppliers: [
            { id: 'SUP-REG-NORTE', name: 'Distribuidora Norte', avgLeadTime: 45, reliability: 80 }
        ] 
    },
    'SC': { name: 'Santa Catarina', category: 'expansion', towers: 380, maintenance: 26, projects: 35, 
        projectsList: [
            {id: 'SC-P1', name: 'Vale do Itajaí 5G', status: 'In Progress', budget: 3600000, actualBudget: 2200000, manager: 'Daniela Souza'}
        ], 
        maintenanceSchedule: [], 
        inventory: [
            { id: 'SC-INV-1', name: 'Fibra Óptica Monomodo', category: 'Cabos e Fibras', quantity: 120, value: 48000, reorderPoint: 50, supplierId: 'SUP-SUL-1' }
        ], 
        suppliers: [
             { id: 'SUP-SUL-1', name: 'Fornecedor Sul A', avgLeadTime: 13, reliability: 97.5 }
        ] 
    },
    'SP': { name: 'São Paulo', category: 'expansion', towers: 800, maintenance: 50, projects: 70,
        projectsList: [
            { id: 'SP-P1', name: 'Data Center Campinas', description: 'Construção do novo data center regional em Campinas para suportar a expansão da nuvem e serviços 5G.', status: 'Completed', budget: 15000000, actualBudget: 14850000, manager: 'Fernanda Alves', startDate: '01/01/2023', endDate: '31/12/2023' },
            { id: 'SP-P2', name: 'Expansão 5G Litoral', description: 'Ampliação da cobertura 5G para todas as cidades do litoral paulista, visando a alta temporada de verão.', status: 'In Progress', budget: 7500000, actualBudget: 4200000, manager: 'Beatriz Costa', startDate: '15/03/2024', endDate: '31/12/2024' },
            { id: 'SP-P3', name: 'Fibra no Interior Paulista', description: 'Projeto de interiorização da rede de fibra óptica, conectando 50 novas cidades no oeste do estado.', status: 'Planning', budget: 12000000, manager: 'Daniela Souza', startDate: '01/09/2024', endDate: '30/06/2025' },
        ],
        maintenanceSchedule: [
            { id: 'SP-M1', description: 'Auditoria Anual - Torre Central', type: 'Preventive', scheduledDate: '01/08/2024', status: 'Scheduled', equipmentId: 'EQ-SP-001', assignedTo: 'Equipe Alpha', notes: 'Auditoria completa de segurança e infraestrutura da principal torre de São Paulo.' },
            { id: 'SP-M2', description: 'Reparo emergencial - Torre 345', type: 'Corrective', scheduledDate: '04/07/2024', status: 'In Progress', equipmentId: 'EQ-SP-002', assignedTo: 'Carlos Silva', projectId: 'SP-P2', notes: 'Substituição de módulo de rádio defeituoso. Atraso de 2h devido ao trânsito.' },
        ],
        inventory: [
            { id: 'SP-INV-01', name: 'Módulo SFP+ 10G', category: 'Equipamentos Ativos', quantity: 250, value: 125000, reorderPoint: 100, supplierId: 'SUP-01' },
            { id: 'SP-INV-02', name: 'Cabo Óptico 1Km', category: 'Cabos e Fibras', quantity: 80, value: 240000, reorderPoint: 40, supplierId: 'SUP-03' },
            { id: 'SP-INV-03', name: 'Gabinete Outdoor 42U', category: 'Hardware Estrutural', quantity: 30, value: 90000, reorderPoint: 15, supplierId: 'SUP-01' },
            { id: 'SP-INV-04', name: 'Bateria de Lítio 48V', category: 'Baterias e Energia', quantity: 150, value: 180000, reorderPoint: 75, supplierId: 'SUP-03' },
        ],
        suppliers: [
            { id: 'SUP-01', name: 'Fornecedor A (SP)', avgLeadTime: 12, reliability: 98.5 },
            { id: 'SUP-03', name: 'Fornecedor C (SP)', avgLeadTime: 15, reliability: 95.0 },
        ],
        maintenanceHistory: [
            { date: 'Jan', Manutenções: 40 }, { date: 'Fev', Manutenções: 42 }, { date: 'Mar', Manutenções: 45 },
            { date: 'Abr', Manutenções: 43 }, { date: 'Mai', Manutenções: 48 }, { date: 'Jun', Manutenções: 50 },
            { date: 'Jul', Manutenções: 55 }, { date: 'Ago', Manutenções: 53 }, { date: 'Set', Manutenções: 58 },
            { date: 'Out', Manutenções: 60 }, { date: 'Nov', Manutenções: 62 }, { date: 'Dez', Manutenções: 65 },
        ]
    },
    'SE': { name: 'Sergipe', category: 'expansion', towers: 110, maintenance: 6, projects: 9, 
        projectsList: [
            {id: 'SE-P1', name: '4G Cânion do Xingó', status: 'Completed', budget: 950000, actualBudget: 940000, manager: 'Eduardo Lima'}
        ], 
        maintenanceSchedule: [], 
        inventory: [
             { id: 'SE-INV-1', name: 'Conector Mecânico', category: 'Conectores', quantity: 1500, value: 12000, reorderPoint: 700, supplierId: 'SUP-NE-2' }
        ], 
        suppliers: [
            { id: 'SUP-NE-2', name: 'Fornecedor Nordeste B', avgLeadTime: 25, reliability: 91 }
        ] 
    },
    'TO': { name: 'Tocantins', category: 'expansion', towers: 90, maintenance: 5, projects: 12, 
        projectsList: [
            {id: 'TO-P1', name: 'Jalapão Conectado', status: 'Planning', budget: 1300000, manager: 'Carlos Silva'}
        ], 
        maintenanceSchedule: [], 
        inventory: [
             { id: 'TO-INV-1', name: 'Painel Solar 150W', category: 'Baterias e Energia', quantity: 50, value: 75000, reorderPoint: 20, supplierId: 'SUP-CO-1' }
        ], 
        suppliers: [
             { id: 'SUP-CO-1', name: 'Fornecedor Centro-Oeste', avgLeadTime: 28, reliability: 90 }
        ] 
    },
};

type AnalyticsTab = 'Geographic' | 'Formulas' | 'Clustering' | 'Models' | 'Prescriptive';

interface AnalyticsProps {
    initialSelectedState?: string | null;
}

const Analytics: React.FC<AnalyticsProps> = ({ initialSelectedState }) => {
    const [selectedState, setSelectedState] = useState<string | null>(initialSelectedState || null);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [detailModalData, setDetailModalData] = useState<{title: string, data: any[], type: 'inventory' | 'supplier'} | null>(null);
    const [activeTab, setActiveTab] = useState<AnalyticsTab>('Geographic');

    useEffect(() => {
        setSelectedState(initialSelectedState ?? null);
        setShowAnalysis(false);
    }, [initialSelectedState]);

    const handleStateSelection = useCallback((stateId: string) => {
        setShowAnalysis(false);
        setSelectedState(currentSelected => {
            const newState = currentSelected === stateId ? null : stateId
            return newState;
        });
    }, []);

    const selectedStateData = selectedState ? mockStateData[selectedState] : null;

    const inventoryData = useMemo(() => {
        const data = selectedStateData ? selectedStateData.inventory : Object.values(mockStateData).flatMap(s => s.inventory);
        if (!data.length) return [];
        return Object.values(data.reduce((acc, item) => {
            if (!acc[item.category]) {
                acc[item.category] = { name: item.category, value: 0 };
            }
            acc[item.category].value += item.value;
            return acc;
        }, {} as Record<string, PieChartData>))
    }, [selectedStateData]);
        
    const supplierData = useMemo(() => {
        const data = selectedStateData ? selectedStateData.suppliers : Object.values(mockStateData).flatMap(s => s.suppliers);
        if (!data.length) return [];
        
        const uniqueSuppliers = Array.from(new Map(data.map(item => [item.id, item])).values());
        
        return uniqueSuppliers.map(s => ({ name: s.name, 'Lead Time (dias)': s.avgLeadTime }))
    }, [selectedStateData]);
        
    const maintenanceHistoryData = selectedStateData?.maintenanceHistory || globalMaintenanceHistory;

    const projectStatusData = useMemo(() => {
        const projectsToCount = selectedState ? (selectedStateData?.projectsList || []) : Object.values(mockStateData).flatMap(s => s.projectsList);
        if (!projectsToCount.length) return [];
        const statusCounts = projectsToCount.reduce((acc, project) => {
            acc[project.status] = (acc[project.status] || 0) + 1;
            return acc;
        }, {} as Record<Project['status'], number>);
        
        const statusMap: Record<Project['status'], string> = {
            'Planning': 'Planejamento',
            'In Progress': 'Em Progresso',
            'Completed': 'Concluído'
        };

        return Object.entries(statusCounts).map(([status, value]) => ({
            name: statusMap[status as Project['status']],
            value
        }));
    }, [selectedState, selectedStateData]);

    const financialOverviewData: FinancialDataPoint[] = useMemo(() => {
        const projectsToSum = selectedState ? (selectedStateData?.projectsList || []) : Object.values(mockStateData).flatMap(s => s.projectsList);
        if (!projectsToSum.length) return [];

        const totals = projectsToSum.reduce((acc, project) => {
            acc.Orçamento += project.budget;
            acc['Gasto Real'] += project.actualBudget || 0;
            return acc;
        }, { name: 'Total', 'Orçamento': 0, 'Gasto Real': 0 });

        return [totals];
    }, [selectedState, selectedStateData]);

    const maintenanceTypeData = useMemo(() => {
        const tasksToCount = selectedState ? (selectedStateData?.maintenanceSchedule || []) : Object.values(mockStateData).flatMap(s => s.maintenanceSchedule);
    
        if (!tasksToCount.length) return [
            { name: 'Preventiva', value: 0 },
            { name: 'Corretiva', value: 0 },
        ];
    
        const typeCounts = tasksToCount.reduce((acc, task) => {
            const typeName = task.type === 'Preventive' ? 'Preventiva' : 'Corretiva';
            acc[typeName] = (acc[typeName] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        const finalData = [
            { name: 'Preventiva', value: typeCounts['Preventiva'] || 0 },
            { name: 'Corretiva', value: typeCounts['Corretiva'] || 0 },
        ];
    
        return finalData;
    
    }, [selectedState, selectedStateData]);

    const handleInventoryDrillDown = (category: string) => {
        const allItems = selectedStateData ? selectedStateData.inventory : Object.values(mockStateData).flatMap(s => s.inventory);
        const filteredItems = allItems.filter(item => item.category === category);
        setDetailModalData({
            title: `Itens de Inventário: ${category}`,
            data: filteredItems,
            type: 'inventory'
        });
    }

    const handleSupplierDrillDown = (supplierName: string) => {
        const allSuppliers = selectedStateData ? selectedStateData.suppliers : Object.values(mockStateData).flatMap(s => s.suppliers);
        const uniqueSuppliers = Array.from(new Map(allSuppliers.map(item => [item.id, item])).values());
        const supplierDetails = uniqueSuppliers.filter(s => s.name === supplierName);
        setDetailModalData({
            title: `Detalhes do Fornecedor: ${supplierName}`,
            data: supplierDetails,
            type: 'supplier'
        });
    }

    const renderTabContent = () => {
        const inventoryTitle = `Distribuição de Inventário ${selectedStateData ? `- ${selectedStateData.name}` : '(Geral)'}`;
        const supplierTitle = `Performance de Fornecedores ${selectedStateData ? `- ${selectedStateData.name}` : '(Geral)'}`;
        const historyTitle = `Histórico de Manutenções ${selectedStateData ? `- ${selectedStateData.name}` : '(Geral)'}`;
        const projectStatusTitle = `Status dos Projetos ${selectedStateData ? `- ${selectedStateData.name}` : '(Geral)'}`;
        const financialOverviewTitle = `Visão Financeira ${selectedStateData ? `- ${selectedStateData.name}` : '(Geral)'}`;
        const maintenanceTypeTitle = `Tipos de Manutenção ${selectedStateData ? `- ${selectedStateData.name}` : '(Geral)'}`;

        switch (activeTab) {
            case 'Geographic':
                return (
                    <div className="space-y-6">
                        <InteractiveMap 
                            stateData={mockStateData}
                            selectedState={selectedState}
                            onStateClick={handleStateSelection}
                        />
                        {selectedStateData && (
                            <div className="animate-fade-in-up">
                                {showAnalysis ? (
                                    <GeminiAnalysis stateData={selectedStateData} onClose={() => setShowAnalysis(false)} />
                                ) : (
                                    <Card>
                                        <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left p-4">
                                            <div className="mb-4 sm:mb-0">
                                                <h4 className="text-lg font-bold text-brand-lightest-slate">Análise de IA para {selectedStateData.name}</h4>
                                                <p className="text-brand-slate">Obtenha insights e recomendações sobre a operação neste estado.</p>
                                            </div>
                                            <button
                                                onClick={() => setShowAnalysis(true)}
                                                className="bg-brand-cyan text-brand-navy font-bold py-2.5 px-6 rounded-lg hover:bg-opacity-80 transition-all duration-300 shadow-lg shadow-brand-cyan/20 hover:shadow-brand-cyan/40 flex items-center space-x-2"
                                            >
                                                <LightBulbIcon className="w-5 h-5" />
                                                <span>Gerar Análise com IA</span>
                                            </button>
                                        </div>
                                    </Card>
                                )}
                            </div>
                        )}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <InventoryPieChart title={inventoryTitle} data={inventoryData} onSliceClick={(e) => handleInventoryDrillDown(e.name)} />
                            <SupplierBarChart title={supplierTitle} data={supplierData} onBarClick={(e) => handleSupplierDrillDown(e.name)} />
                            <ProjectStatusChart title={projectStatusTitle} data={projectStatusData} />
                            <FinancialOverviewChart title={financialOverviewTitle} data={financialOverviewData} />
                            <MaintenanceTypeChart title={maintenanceTypeTitle} data={maintenanceTypeData} />
                            <HistoricalDataChart title={historyTitle} data={maintenanceHistoryData} />
                        </div>
                        {detailModalData && (
                            <AnalyticsDetailModal 
                                title={detailModalData.title}
                                data={detailModalData.data}
                                type={detailModalData.type}
                                onClose={() => setDetailModalData(null)}
                            />
                        )}
                    </div>
                );

            case 'Formulas':
                return <FormulaExplainer />;

            case 'Clustering':
                return <ClusteringDashboard />;

            case 'Models':
                return <ModelPerformanceDashboard />;

            case 'Prescriptive':
                return <PrescriptiveRecommendationsEnhanced />;

            default:
                return null;
        }
    };

    const tabs: { key: AnalyticsTab; label: string }[] = [
        { key: 'Geographic', label: 'Geográfico' },
        { key: 'Formulas', label: 'Fórmulas' },
        { key: 'Clustering', label: 'Clustering' },
        { key: 'Models', label: 'Modelos' },
        { key: 'Prescriptive', label: 'Prescritivo' },
    ];
    
    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="border-b border-brand-light-navy/50">
                <nav className="flex space-x-8 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                                activeTab === tab.key
                                    ? 'border-brand-cyan text-brand-cyan'
                                    : 'border-transparent text-brand-slate hover:text-brand-lightest-slate hover:border-brand-light-slate'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default Analytics;