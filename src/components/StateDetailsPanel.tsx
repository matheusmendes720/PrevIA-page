
import React, { useState, useEffect, useMemo } from 'react';
import { StateData, Project, MaintenanceTask, InventoryItem, Supplier } from '../types';
import { ServerIcon, InfoIcon, CurrencyDollarIcon, UserGroupIcon, CalendarIcon, WrenchScrewdriverIcon, ClipboardListIcon, ShieldCheckIcon } from './icons';

interface StateDetailsPanelProps {
  stateData: StateData | null;
}

const DetailItem: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex justify-between items-center py-3 border-b border-white/5">
    <span className="text-sm text-brand-slate">{label}</span>
    <span className="font-bold text-brand-lightest-slate">{typeof value === 'number' ? value.toLocaleString('pt-BR') : value}</span>
  </div>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const styles: { [key: string]: string } = {
      'Planning': 'bg-blue-500/20 text-blue-400',
      'In Progress': 'bg-yellow-500/20 text-yellow-400',
      'Completed': 'bg-green-500/20 text-green-400',
      'Scheduled': 'bg-purple-500/20 text-purple-400'
    };
    const text: { [key: string]: string } = {
        'In Progress': 'Em Progresso',
        'Planning': 'Planejamento',
        'Completed': 'Concluído',
        'Scheduled': 'Agendada'
    }
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${styles[status] || 'bg-gray-500/20 text-gray-400'}`}>{text[status] || status}</span>;
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button onClick={onClick} className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${active ? 'bg-brand-light-navy/50 text-brand-cyan border-b-2 border-brand-cyan' : 'text-brand-slate hover:bg-brand-light-navy/30'}`}>
    {children}
  </button>
);

const DetailCard: React.FC<{icon: React.ReactNode, title: string, children: React.ReactNode, className?: string}> = ({icon, title, children, className}) => (
    <div className={`mt-2 ${className}`}>
        <div className="flex items-center space-x-2 text-brand-light-slate">
            {icon}
            <h5 className="font-semibold text-xs uppercase tracking-wider">{title}</h5>
        </div>
        <div className="text-sm text-brand-slate mt-2 space-y-2">
            {children}
        </div>
    </div>
);


const StateDetailsPanel: React.FC<StateDetailsPanelProps> = ({ stateData }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'maintenance' | 'inventory'>('overview');
  const [selectedItem, setSelectedItem] = useState<{ type: string, id: string } | null>(null);

  useEffect(() => {
      if (stateData) {
        setActiveTab('overview');
        setSelectedItem(null);
      }
  }, [stateData]);

  const handleTabChange = (tab: 'overview' | 'projects' | 'maintenance' | 'inventory') => {
    setActiveTab(tab);
    setSelectedItem(null);
  }

  if (!stateData) {
    return (
      <div className="h-full flex flex-col items-center justify-center glass-card rounded-lg p-6 text-center min-h-[400px]">
        <ServerIcon className="w-12 h-12 text-brand-slate mb-4" />
        <h4 className="font-bold text-brand-lightest-slate">Selecione um Estado</h4>
        <p className="text-sm text-brand-slate mt-1">Clique em uma área do mapa para ver os detalhes da operação.</p>
      </div>
    );
  }
  
  const categoryText = stateData.category === 'consolidated' ? 'Área Consolidada' : 'Área de Expansão';
  const categoryClass = stateData.category === 'consolidated' ? 'text-brand-cyan' : 'text-yellow-400';

  const renderContent = () => {
    const project = selectedItem?.type === 'project' ? stateData.projectsList.find(p => p.id === selectedItem.id) : null;
    const task = selectedItem?.type === 'maintenance' ? stateData.maintenanceSchedule.find(t => t.id === selectedItem.id) : null;
    const item = selectedItem?.type === 'inventory' ? stateData.inventory.find(i => i.id === selectedItem.id) : null;
    
    switch(activeTab) {
        case 'overview':
            return (
                <div className="p-4">
                    <DetailItem label="Torres Ativas" value={stateData.towers} />
                    <DetailItem label="Manutenções Agendadas" value={stateData.maintenance} />
                    <DetailItem label="Projetos em Andamento" value={stateData.projects} />
                </div>
            )
        case 'projects':
        case 'maintenance':
        case 'inventory':
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 h-full overflow-hidden">
                    <div className="flex flex-col h-full overflow-y-auto border-r border-white/10">
                        {/* LIST PANEL */}
                        {activeTab === 'projects' && stateData.projectsList.map(p => (
                            <button key={p.id} onClick={() => setSelectedItem({type: 'project', id: p.id})} className={`text-left p-3 border-b border-white/5 hover:bg-brand-navy/50 transition-colors ${selectedItem?.id === p.id ? 'bg-brand-cyan/10' : ''}`}>
                                <p className="font-medium text-brand-lightest-slate text-sm">{p.name}</p>
                                <div className="flex justify-between items-center mt-1">
                                    <p className="text-xs text-brand-slate">Gerente: {p.manager || 'N/A'}</p>
                                    <StatusBadge status={p.status} />
                                </div>
                            </button>
                        ))}
                         {activeTab === 'maintenance' && stateData.maintenanceSchedule.map(t => (
                            <button key={t.id} onClick={() => setSelectedItem({type: 'maintenance', id: t.id})} className={`text-left p-3 border-b border-white/5 hover:bg-brand-navy/50 transition-colors ${selectedItem?.id === t.id ? 'bg-brand-cyan/10' : ''}`}>
                                <p className="font-medium text-brand-lightest-slate text-sm">{t.description}</p>
                                <div className="flex justify-between items-center mt-1">
                                    <p className="text-xs text-brand-slate">{t.scheduledDate}</p>
                                    <StatusBadge status={t.status} />
                                </div>
                            </button>
                        ))}
                         {activeTab === 'inventory' && stateData.inventory.map(i => (
                            <button key={i.id} onClick={() => setSelectedItem({type: 'inventory', id: i.id})} className={`text-left p-3 border-b border-white/5 hover:bg-brand-navy/50 transition-colors ${selectedItem?.id === i.id ? 'bg-brand-cyan/10' : ''}`}>
                                <p className="font-medium text-brand-lightest-slate text-sm">{i.name}</p>
                                <div className="flex justify-between items-center mt-1">
                                    <p className="text-xs text-brand-slate">{i.category}</p>
                                    <p className="text-xs text-brand-light-slate font-semibold">Qtd: {i.quantity.toLocaleString('pt-BR')}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                    <div className="p-4 overflow-y-auto">
                        {/* DETAIL PANEL */}
                        {!selectedItem && <p className="text-center text-brand-slate text-sm p-8">Selecione um item à esquerda para ver os detalhes.</p>}
                        {project && (
                            <div className="space-y-4">
                                <h4 className="font-bold text-brand-lightest-slate">{project.name}</h4>
                                <DetailCard icon={<InfoIcon/>} title="Descrição">
                                    <p>{project.description || 'Nenhuma descrição disponível.'}</p>
                                </DetailCard>
                                <DetailCard icon={<CurrencyDollarIcon/>} title="Financeiro">
                                    <p><strong>Orçamento:</strong> {project.budget.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
                                    <p><strong>Gasto Atual:</strong> {(project.actualBudget || 0).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
                                </DetailCard>
                                <DetailCard icon={<UserGroupIcon/>} title="Equipe">
                                    <p><strong>Gerente:</strong> {project.manager || 'N/A'}</p>
                                </DetailCard>
                                <DetailCard icon={<CalendarIcon/>} title="Cronograma">
                                    <p><strong>Início:</strong> {project.startDate || 'N/D'}</p>
                                    <p><strong>Término:</strong> {project.endDate || 'N/D'}</p>
                                </DetailCard>
                            </div>
                        )}
                        {task && (
                             <div className="space-y-4">
                                <h4 className="font-bold text-brand-lightest-slate">{task.description}</h4>
                                <DetailCard icon={<WrenchScrewdriverIcon/>} title="Detalhes da Tarefa">
                                    <p><strong>Tipo:</strong> {task.type === 'Preventive' ? 'Preventiva' : 'Corretiva'}</p>
                                    <p><strong>Equipamento:</strong> {task.equipmentId}</p>
                                    <p><strong>Status:</strong> {task.status}</p>
                                </DetailCard>
                                 <DetailCard icon={<UserGroupIcon/>} title="Equipe">
                                    <p><strong>Responsável:</strong> {task.assignedTo || 'Não atribuído'}</p>
                                </DetailCard>
                                <DetailCard icon={<ClipboardListIcon/>} title="Observações">
                                    <p>{task.notes || 'Nenhuma observação.'}</p>
                                </DetailCard>
                            </div>
                        )}
                        {item && (
                            <div className="space-y-4">
                                <h4 className="font-bold text-brand-lightest-slate">{item.name}</h4>
                                <DetailCard icon={<ShieldCheckIcon/>} title="Status do Estoque">
                                    <p><strong>Categoria:</strong> {item.category}</p>
                                    <p><strong>Quantidade:</strong> {item.quantity.toLocaleString('pt-BR')}</p>
                                    <p><strong>Valor Total:</strong> {item.value.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
                                    <p><strong>Ponto de Pedido:</strong> {item.reorderPoint?.toLocaleString('pt-BR') || 'N/D'}</p>
                                </DetailCard>
                                <DetailCard icon={<ServerIcon className="w-5 h-5"/>} title="Fornecedor">
                                     <p>{stateData.suppliers.find(s => s.id === item.supplierId)?.name || 'Não especificado'}</p>
                                </DetailCard>
                            </div>
                        )}
                    </div>
                </div>
            )
        default: return null;
    }
  }

  return (
    <div className="h-full glass-card rounded-lg flex flex-col min-h-[400px] max-h-[600px] overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <h3 className="text-lg font-bold text-brand-lightest-slate">{stateData.name}</h3>
        <p className={`text-sm font-semibold ${categoryClass}`}>{categoryText}</p>
      </div>

      <div className="border-b border-white/10 px-2">
        <nav className="flex space-x-2">
          <TabButton active={activeTab === 'overview'} onClick={() => handleTabChange('overview')}>Visão Geral</TabButton>
          <TabButton active={activeTab === 'projects'} onClick={() => handleTabChange('projects')}>Projetos</TabButton>
          <TabButton active={activeTab === 'maintenance'} onClick={() => handleTabChange('maintenance')}>Manutenções</TabButton>
          <TabButton active={activeTab === 'inventory'} onClick={() => handleTabChange('inventory')}>Inventário</TabButton>
        </nav>
      </div>

      <div className="flex-grow overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default React.memo(StateDetailsPanel);