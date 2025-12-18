

import React, { useState, useMemo, useEffect } from 'react';
import Card from './Card';
import { User, AuditLog, ApiIntegration } from '../types';
import { PencilIcon, TrashIcon, PlusIcon, CodeBracketIcon, ShieldExclamationIcon } from './icons';
import Pagination from './Pagination';
import { useToast } from '../hooks/useToast';
import UserModal from './UserModal';
import ConfirmationModal from './ConfirmationModal';

const initialUsers: User[] = [
    { id: 'usr01', name: 'Admin', email: 'admin@novacorrente.com', role: 'Admin', avatar: `https://picsum.photos/seed/usr01/40/40`, lastLogin: 'Hoje, 10:30' },
    { id: 'usr02', name: 'Beatriz Costa', email: 'beatriz.costa@example.com', role: 'Editor', avatar: `https://picsum.photos/seed/usr02/40/40`, lastLogin: 'Ontem, 15:45' },
    { id: 'usr03', name: 'Carlos Silva', email: 'carlos.silva@example.com', role: 'Viewer', avatar: `https://picsum.photos/seed/usr03/40/40`, lastLogin: '03/07/2024, 09:12' },
    { id: 'usr04', name: 'Daniela Souza', email: 'daniela.souza@example.com', role: 'Editor', avatar: `https://picsum.photos/seed/usr04/40/40`, lastLogin: '01/07/2024, 18:20' },
    { id: 'usr05', name: 'Eduardo Lima', email: 'eduardo.lima@example.com', role: 'Viewer', avatar: `https://picsum.photos/seed/usr05/40/40`, lastLogin: '30/06/2024, 11:00' },
    { id: 'usr06', name: 'Fernanda Alves', email: 'fernanda.alves@example.com', role: 'Editor', avatar: `https://picsum.photos/seed/usr06/40/40`, lastLogin: 'Hoje, 08:55' },
    { id: 'usr07', name: 'Gustavo Pereira', email: 'gustavo.pereira@example.com', role: 'Viewer', avatar: `https://picsum.photos/seed/usr07/40/40`, lastLogin: '02/07/2024, 14:30' },
    { id: 'usr08', name: 'Helena Ribeiro', email: 'helena.ribeiro@example.com', role: 'Admin', avatar: `https://picsum.photos/seed/usr08/40/40`, lastLogin: 'Ontem, 09:05' },
];

const mockAuditLogs: AuditLog[] = [
    { id: 'log01', user: 'Admin', userAvatar: `https://picsum.photos/seed/usr01/40/40`, action: 'Gerou Relatório', details: 'Relatório Mensal de Inventário', timestamp: 'Hoje, 11:05'},
    { id: 'log02', user: 'Helena Ribeiro', userAvatar: `https://picsum.photos/seed/usr08/40/40`, action: 'Atualizou Usuário', details: 'Role de Carlos Silva para Editor', timestamp: 'Hoje, 09:15'},
    { id: 'log03', user: 'Fernanda Alves', userAvatar: `https://picsum.photos/seed/usr06/40/40`, action: 'Login no Sistema', details: 'Acesso via SSO', timestamp: 'Hoje, 08:55'},
    { id: 'log04', user: 'Admin', userAvatar: `https://picsum.photos/seed/usr01/40/40`, action: 'Limpou Cache', details: 'Cache do sistema limpo', timestamp: 'Ontem, 18:30'},
    { id: 'log05', user: 'Beatriz Costa', userAvatar: `https://picsum.photos/seed/usr02/40/40`, action: 'Gerou Relatório', details: 'Análise de Acurácia da Previsão - Q2', timestamp: 'Ontem, 16:00'},
    { id: 'log06', user: 'Beatriz Costa', userAvatar: `https://picsum.photos/seed/usr02/40/40`, action: 'Login no Sistema', details: 'Acesso via painel web', timestamp: 'Ontem, 15:45'},
];

const mockApiIntegrations: ApiIntegration[] = [
    { id: 'api01', name: 'Salesforce CRM', icon: <div className="w-4 h-4 rounded-full bg-blue-400" />, status: 'Connected', lastSync: 'Hoje, 10:55' },
    { id: 'api02', name: 'SAP ERP', icon: <div className="w-4 h-4 rounded-full bg-yellow-400" />, status: 'Connected', lastSync: 'Hoje, 10:40' },
    { id: 'api03', name: 'ServiceNow', icon: <div className="w-4 h-4 rounded-full bg-green-400" />, status: 'Disconnected', lastSync: 'Ontem, 14:00' },
];

const RoleBadge: React.FC<{ role: User['role'] }> = ({ role }) => {
    const roleStyles = {
        'Admin': 'bg-cyan-500/20 text-cyan-400',
        'Editor': 'bg-yellow-500/20 text-yellow-400',
        'Viewer': 'bg-gray-500/20 text-gray-400',
    };
    return (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${roleStyles[role]}`}>
            {role}
        </span>
    );
};

const ToggleSwitch: React.FC<{ enabled: boolean; setEnabled: (enabled: boolean) => void; }> = ({ enabled, setEnabled }) => {
    return (
        <button
            onClick={() => setEnabled(!enabled)}
            className={`relative inline-flex items-center h-7 rounded-full w-12 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-navy focus:ring-brand-cyan ${enabled ? 'bg-brand-cyan' : 'bg-brand-light-navy'}`}
            aria-checked={enabled}
            role="switch"
        >
            <span
                className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform duration-300 ease-in-out shadow-lg ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
            />
        </button>
    );
}

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button onClick={onClick} className={`px-4 py-3 text-sm font-semibold rounded-t-lg transition-colors border-b-2 ${active ? 'text-brand-cyan border-brand-cyan' : 'text-brand-slate hover:text-brand-lightest-slate border-transparent hover:border-brand-light-navy'}`}>
    {children}
  </button>
);

interface SettingsProps {
    searchTerm: string;
}

const USER_ITEMS_PER_PAGE = 5;
const LOG_ITEMS_PER_PAGE = 5;

const Settings: React.FC<SettingsProps> = ({ searchTerm }) => {
    const { addToast } = useToast();
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(false);
    const [smsNotifications, setSmsNotifications] = useState(false);
    const [userCurrentPage, setUserCurrentPage] = useState(1);
    const [logCurrentPage, setLogCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState('Geral');

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users;
        return users.filter(user => 
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.role.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, users]);

    useEffect(() => {
        setUserCurrentPage(1);
    }, [searchTerm]);

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        addToast('Perfil salvo com sucesso!', 'success');
    }

    const handleOpenAddModal = () => {
        setEditingUser(null);
        setIsUserModalOpen(true);
    }
    
    const handleOpenEditModal = (user: User) => {
        setEditingUser(user);
        setIsUserModalOpen(true);
    }

    const handleOpenDeleteModal = (user: User) => {
        setDeletingUser(user);
        setIsDeleteModalOpen(true);
    }

    const handleSaveUser = (user: User) => {
        if (user.id) { // Editing existing user
            setUsers(users.map(u => u.id === user.id ? user : u));
            addToast(`Usuário ${user.name} atualizado!`, 'success');
        } else { // Adding new user
            const newUser = { ...user, id: `usr${Date.now()}`, avatar: `https://picsum.photos/seed/usr${Date.now()}/40/40`, lastLogin: 'Agora' };
            setUsers([newUser, ...users]);
            addToast(`Usuário ${user.name} adicionado!`, 'success');
        }
        setIsUserModalOpen(false);
    }

    const handleDeleteUser = () => {
        if (deletingUser) {
            setUsers(users.filter(u => u.id !== deletingUser.id));
            addToast(`Usuário ${deletingUser.name} removido.`, 'error');
            setIsDeleteModalOpen(false);
            setDeletingUser(null);
        }
    }
    
    // Pagination logic for users
    const userTotalPages = Math.ceil(filteredUsers.length / USER_ITEMS_PER_PAGE);
    const userStartIndex = (userCurrentPage - 1) * USER_ITEMS_PER_PAGE;
    const userEndIndex = userStartIndex + USER_ITEMS_PER_PAGE;
    const currentUsers = filteredUsers.slice(userStartIndex, userEndIndex);
    
    // Pagination logic for logs
    const logTotalPages = Math.ceil(mockAuditLogs.length / LOG_ITEMS_PER_PAGE);
    const logStartIndex = (logCurrentPage - 1) * LOG_ITEMS_PER_PAGE;
    const logEndIndex = logStartIndex + LOG_ITEMS_PER_PAGE;
    const currentLogs = mockAuditLogs.slice(logStartIndex, logEndIndex);

    const inputStyles = "w-full bg-brand-light-navy/50 border border-white/10 rounded-lg py-2 px-4 text-brand-lightest-slate focus:outline-none focus:ring-2 focus:ring-brand-cyan";
    const tabs = ['Geral', 'Usuários', 'Integrações', 'Log de Auditoria'];

    return (
        <div className="space-y-6">
            <div className="border-b border-white/10">
                <nav className="flex space-x-2 -mb-px">
                    {tabs.map(tab => <TabButton key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)}>{tab}</TabButton>)}
                </nav>
            </div>

            {activeTab === 'Geral' && (
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fade-in-up">
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold text-brand-lightest-slate mb-4">Perfil</h3>
                            <Card>
                                <form className="space-y-4" onSubmit={handleSaveProfile}>
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-brand-slate mb-1">Nome</label>
                                        <input type="text" id="name" defaultValue="Admin" className={inputStyles} />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-brand-slate mb-1">Email</label>
                                        <input type="email" id="email" defaultValue="admin@novacorrente.com" className={inputStyles} />
                                    </div>
                                    <button type="submit" className="w-full bg-brand-cyan text-brand-navy font-bold py-2.5 px-4 rounded-lg hover:bg-opacity-80 transition-all duration-300 shadow-lg shadow-brand-cyan/20 hover:shadow-brand-cyan/40">
                                        Salvar Alterações
                                    </button>
                                </form>
                            </Card>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-brand-lightest-slate mb-4">Notificações</h3>
                            <Card>
                                <div className="space-y-6 py-1">
                                <div className="flex items-center justify-between">
                                        <span className="text-brand-light-slate">Alertas por Email</span>
                                        <ToggleSwitch enabled={emailNotifications} setEnabled={setEmailNotifications} />
                                </div>
                                <div className="flex items-center justify-between">
                                        <span className="text-brand-light-slate">Notificações Push</span>
                                        <ToggleSwitch enabled={pushNotifications} setEnabled={setPushNotifications} />
                                </div>
                                <div className="flex items-center justify-between">
                                        <span className="text-brand-light-slate">Relatórios por SMS</span>
                                        <ToggleSwitch enabled={smsNotifications} setEnabled={setSmsNotifications} />
                                </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-brand-lightest-slate mb-4">Sistema</h3>
                        <Card>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <p className="font-semibold text-brand-lightest-slate">Retenção de Dados</p>
                                    <p className="text-sm text-brand-slate">Defina por quanto tempo os dados de log serão mantidos.</p>
                                    <select className={inputStyles}>
                                        <option>90 Dias</option>
                                        <option>6 Meses</option>
                                        <option>1 Ano</option>
                                        <option>Indefinidamente</option>
                                    </select>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-brand-lightest-slate">Limpar Cache</p>
                                        <p className="text-sm text-brand-slate">Resolve problemas de exibição.</p>
                                    </div>
                                    <button onClick={() => addToast('Cache do sistema limpo.', 'info')} className="bg-yellow-500/20 text-yellow-400 font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-all shrink-0">
                                        Limpar
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            )}
            
            {activeTab === 'Usuários' && (
                 <div className="animate-fade-in-up">
                    <Card>
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-brand-light-slate">Todos os usuários da sua organização.</p>
                            <button onClick={handleOpenAddModal} className="bg-brand-cyan text-brand-navy font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-all duration-300 shadow-lg shadow-brand-cyan/20 hover:shadow-brand-cyan/40 flex items-center space-x-2">
                                <PlusIcon />
                                <span>Adicionar Usuário</span>
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="p-3 text-sm font-semibold text-brand-slate">Usuário</th>
                                        <th className="p-3 text-sm font-semibold text-brand-slate">Role</th>
                                        <th className="p-3 text-sm font-semibold text-brand-slate">Último Login</th>
                                        <th className="p-3 text-sm font-semibold text-brand-slate text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentUsers.map(user => (
                                        <tr key={user.id} className="border-b border-white/10 last:border-b-0 hover:bg-brand-light-navy/30">
                                            <td className="p-3">
                                                <div className="flex items-center space-x-3">
                                                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                                                    <div>
                                                        <p className="font-semibold text-brand-lightest-slate">{user.name}</p>
                                                        <p className="text-xs text-brand-slate">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3"><RoleBadge role={user.role} /></td>
                                            <td className="p-3 text-sm text-brand-slate">{user.lastLogin}</td>
                                            <td className="p-3">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <button onClick={() => handleOpenEditModal(user)} className="p-2 text-brand-slate hover:text-brand-cyan transition-colors"><PencilIcon /></button>
                                                    <button onClick={() => handleOpenDeleteModal(user)} className="p-2 text-brand-slate hover:text-red-400 transition-colors"><TrashIcon /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {userTotalPages > 1 && (
                            <Pagination
                                currentPage={userCurrentPage}
                                totalPages={userTotalPages}
                                onPageChange={setUserCurrentPage}
                            />
                        )}
                    </Card>
                </div>
            )}

            {activeTab === 'Integrações' && (
                <div className="animate-fade-in-up">
                    <Card>
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-brand-lightest-slate">Integrações de API</h3>
                                <p className="text-brand-slate text-sm">Conecte a plataforma com suas ferramentas existentes.</p>
                            </div>
                            <button className="bg-brand-cyan text-brand-navy font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-all duration-300 shadow-lg shadow-brand-cyan/20 hover:shadow-brand-cyan/40 flex items-center space-x-2">
                                <PlusIcon />
                                <span>Nova Integração</span>
                            </button>
                        </div>
                        <div className="space-y-3">
                            {mockApiIntegrations.map(api => (
                                <div key={api.id} className="flex items-center justify-between p-3 bg-brand-light-navy/30 rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-2 bg-brand-navy rounded-full">{api.icon}</div>
                                        <div>
                                            <p className="font-semibold text-brand-lightest-slate">{api.name}</p>
                                            <p className="text-xs text-brand-slate">Última Sincronização: {api.lastSync}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className={`text-xs font-bold ${api.status === 'Connected' ? 'text-green-400' : 'text-red-400'}`}>{api.status}</span>
                                        <ToggleSwitch enabled={api.status === 'Connected'} setEnabled={() => {}} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}
            
            {activeTab === 'Log de Auditoria' && (
                <div className="animate-fade-in-up">
                    <Card>
                        <h3 className="text-lg font-semibold text-brand-lightest-slate mb-4">Log de Auditoria</h3>
                        <div className="overflow-x-auto">
                           <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="p-3 text-sm font-semibold text-brand-slate">Usuário</th>
                                        <th className="p-3 text-sm font-semibold text-brand-slate">Ação</th>
                                        <th className="p-3 text-sm font-semibold text-brand-slate">Data</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentLogs.map(log => (
                                        <tr key={log.id} className="border-b border-white/10 last:border-b-0">
                                            <td className="p-3">
                                                 <div className="flex items-center space-x-3">
                                                    <img src={log.userAvatar} alt={log.user} className="w-8 h-8 rounded-full" />
                                                    <span className="font-medium text-brand-lightest-slate">{log.user}</span>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <p className="text-brand-light-slate">{log.action}</p>
                                                {log.details && <p className="text-xs text-brand-slate/70">Detalhes: {log.details}</p>}
                                            </td>
                                            <td className="p-3 text-sm text-brand-slate">{log.timestamp}</td>
                                        </tr>
                                    ))}
                                </tbody>
                           </table>
                        </div>
                         {logTotalPages > 1 && (
                            <Pagination
                                currentPage={logCurrentPage}
                                totalPages={logTotalPages}
                                onPageChange={setLogCurrentPage}
                            />
                        )}
                    </Card>
                </div>
            )}

             {isUserModalOpen && (
                <UserModal
                    user={editingUser}
                    onClose={() => setIsUserModalOpen(false)}
                    onSave={handleSaveUser}
                />
            )}
            {isDeleteModalOpen && deletingUser && (
                <ConfirmationModal
                    title="Confirmar Exclusão"
                    message={`Tem certeza que deseja excluir o usuário ${deletingUser.name}? Esta ação não pode ser desfeita.`}
                    onConfirm={handleDeleteUser}
                    onCancel={() => setIsDeleteModalOpen(false)}
                />
            )}
        </div>
    );
};

export default Settings;