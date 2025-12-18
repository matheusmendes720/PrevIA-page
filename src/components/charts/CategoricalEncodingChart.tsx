import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart } from 'recharts';
import Card from '../Card';
import { apiClient } from '../../lib/api';
import { FamilyEncoding, SiteEncoding, SupplierEncoding } from '../../types/features';
import { useToast } from '../../hooks/useToast';

interface CategoricalEncodingChartProps {
  materialId?: number;
  startDate?: string;
  endDate?: string;
}

const CategoricalEncodingChart: React.FC<CategoricalEncodingChartProps> = ({ materialId, startDate, endDate }) => {
  const [familyEncodings, setFamilyEncodings] = useState<FamilyEncoding[]>([]);
  const [siteEncodings, setSiteEncodings] = useState<SiteEncoding[]>([]);
  const [supplierEncodings, setSupplierEncodings] = useState<SupplierEncoding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'families' | 'sites' | 'suppliers'>('families');
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [familyResponse, siteResponse, supplierResponse] = await Promise.all([
          apiClient.getFamilyEncodings(),
          apiClient.getSiteEncodings(),
          apiClient.getSupplierEncodings(),
        ]);

        if (familyResponse.status === 'success') {
          setFamilyEncodings(familyResponse.data);
        }
        if (siteResponse.status === 'success') {
          setSiteEncodings(siteResponse.data);
        }
        if (supplierResponse.status === 'success') {
          setSupplierEncodings(supplierResponse.data);
        }
      } catch (error: any) {
        const errorMessage = error.message || 'Erro ao carregar encodings categóricos';
        if (errorMessage.includes('BACKEND_UNAVAILABLE')) {
          addToast('Servidor backend não está rodando. Por favor, inicie o servidor backend.', 'error');
        } else {
          addToast('Erro ao carregar encodings categóricos', 'error');
        }
        console.error('Error fetching categorical encodings:', error);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [materialId, startDate, endDate, addToast]);

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center h-96">
          <p className="text-brand-slate">Carregando encodings categóricos...</p>
        </div>
      </Card>
    );
  }

  if (error && !loading) {
    return (
      <Card>
        <div className="p-4">
          <div className="flex flex-wrap gap-2 mb-4 border-b border-brand-light-navy/50 pb-4">
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-brand-slate">Famílias</button>
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-brand-slate">Sites</button>
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-brand-slate">Fornecedores</button>
          </div>
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-red-400 mb-2">Erro ao carregar encodings categóricos</p>
            <p className="text-xs text-brand-slate/70">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  // Check for empty data per tab
  const hasData = (activeTab === 'families' && familyEncodings.length > 0) ||
                  (activeTab === 'sites' && siteEncodings.length > 0) ||
                  (activeTab === 'suppliers' && supplierEncodings.length > 0);

  if (!hasData && !loading) {
    const tabLabels = {
      families: 'famílias',
      sites: 'sites',
      suppliers: 'fornecedores'
    };

    return (
      <Card>
        <div className="p-4">
          <div className="flex flex-wrap gap-2 mb-4 border-b border-brand-light-navy/50 pb-4">
            <button
              onClick={() => setActiveTab('families')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'families'
                  ? 'bg-brand-light-navy text-brand-lightest-slate'
                  : 'text-brand-slate hover:bg-brand-light-navy/50'
              }`}
            >
              Famílias
            </button>
            <button
              onClick={() => setActiveTab('sites')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'sites'
                  ? 'bg-brand-light-navy text-brand-lightest-slate'
                  : 'text-brand-slate hover:bg-brand-light-navy/50'
              }`}
            >
              Sites
            </button>
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'suppliers'
                  ? 'bg-brand-light-navy text-brand-lightest-slate'
                  : 'text-brand-slate hover:bg-brand-light-navy/50'
              }`}
            >
              Fornecedores
            </button>
          </div>
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-brand-slate mb-2">Nenhum encoding de {tabLabels[activeTab]} disponível</p>
            <p className="text-xs text-brand-slate/70">Tente selecionar outra categoria ou verificar os dados</p>
          </div>
        </div>
      </Card>
    );
  }

  const renderFamiliesChart = () => {
    if (familyEncodings.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-brand-slate mb-2">Nenhum encoding de família disponível</p>
          <p className="text-xs text-brand-slate/70">Verifique se há dados cadastrados no sistema</p>
        </div>
      );
    }

    const validData = (familyEncodings || []).filter(item => item && (item.family_id || item.family_name));
    if (validData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-brand-slate mb-2">Nenhum dado válido de família encontrado</p>
          <p className="text-xs text-brand-slate/70">Verifique a qualidade dos dados</p>
        </div>
      );
    }

    const chartData = validData.map((item) => ({
      name: item.family_name || `Família ${item.family_id}`,
      encoded: item.encoded_value || 0,
      materials: item.material_count || 0,
    }));

    return (
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData.slice(0, 20)} margin={{ top: 5, right: 20, left: -10, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fill: '#8892b0' }} stroke="#334155" />
          <YAxis yAxisId="left" tick={{ fill: '#8892b0' }} stroke="#334155" />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: '#8892b0' }} stroke="#334155" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(10, 25, 47, 0.8)',
              borderColor: '#64ffda',
              color: '#ccd6f6',
              borderRadius: '0.5rem'
            }}
          />
          <Legend wrapperStyle={{ color: '#a8b2d1' }} />
          <Bar yAxisId="left" dataKey="encoded" fill="#64ffda" name="Valor Encoded" />
          <Bar yAxisId="right" dataKey="materials" fill="#60a5fa" name="Qtd. Materiais" />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  const renderSitesChart = () => {
    if (siteEncodings.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-brand-slate mb-2">Nenhum encoding de site disponível</p>
          <p className="text-xs text-brand-slate/70">Verifique se há dados cadastrados no sistema</p>
        </div>
      );
    }

    const validData = (siteEncodings || []).filter(item => item && (item.site_id || item.site_name));
    if (validData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-brand-slate mb-2">Nenhum dado válido de site encontrado</p>
          <p className="text-xs text-brand-slate/70">Verifique a qualidade dos dados</p>
        </div>
      );
    }

    const chartData = validData.map((item) => ({
      name: item.site_name || item.site_id || `Site ${item.site_id}`,
      encoded: item.encoded_value || 0,
      materials: item.material_count || 0,
    }));

    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData.slice(0, 20)} margin={{ top: 5, right: 20, left: -10, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fill: '#8892b0' }} stroke="#334155" />
          <YAxis yAxisId="left" tick={{ fill: '#8892b0' }} stroke="#334155" />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: '#8892b0' }} stroke="#334155" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(10, 25, 47, 0.8)',
              borderColor: '#64ffda',
              color: '#ccd6f6',
              borderRadius: '0.5rem'
            }}
          />
          <Legend wrapperStyle={{ color: '#a8b2d1' }} />
          <Bar yAxisId="left" dataKey="encoded" fill="#64ffda" name="Valor Encoded" />
          <Bar yAxisId="right" dataKey="materials" fill="#60a5fa" name="Qtd. Materiais" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderSuppliersChart = () => {
    if (supplierEncodings.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-brand-slate mb-2">Nenhum encoding de fornecedor disponível</p>
          <p className="text-xs text-brand-slate/70">Verifique se há dados cadastrados no sistema</p>
        </div>
      );
    }

    const validData = (supplierEncodings || []).filter(item => item && (item.supplier_id || item.supplier_name));
    if (validData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-brand-slate mb-2">Nenhum dado válido de fornecedor encontrado</p>
          <p className="text-xs text-brand-slate/70">Verifique a qualidade dos dados</p>
        </div>
      );
    }

    const chartData = validData.map((item) => ({
      name: item.supplier_name || `Fornecedor ${item.supplier_id}`,
      encoded: item.encoded_value || 0,
      materials: item.material_count || 0,
    }));

    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData.slice(0, 20)} margin={{ top: 5, right: 20, left: -10, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fill: '#8892b0' }} stroke="#334155" />
          <YAxis yAxisId="left" tick={{ fill: '#8892b0' }} stroke="#334155" />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: '#8892b0' }} stroke="#334155" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(10, 25, 47, 0.8)',
              borderColor: '#64ffda',
              color: '#ccd6f6',
              borderRadius: '0.5rem'
            }}
          />
          <Legend wrapperStyle={{ color: '#a8b2d1' }} />
          <Bar yAxisId="left" dataKey="encoded" fill="#64ffda" name="Valor Encoded" />
          <Bar yAxisId="right" dataKey="materials" fill="#60a5fa" name="Qtd. Materiais" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card>
      <div className="p-4">
        <div className="flex flex-wrap gap-2 mb-4 border-b border-brand-light-navy/50 pb-4">
          <button
            onClick={() => setActiveTab('families')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'families'
                ? 'bg-brand-light-navy text-brand-lightest-slate'
                : 'text-brand-slate hover:bg-brand-light-navy/50'
            }`}
          >
            Famílias
          </button>
          <button
            onClick={() => setActiveTab('sites')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'sites'
                ? 'bg-brand-light-navy text-brand-lightest-slate'
                : 'text-brand-slate hover:bg-brand-light-navy/50'
            }`}
          >
            Sites
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'suppliers'
                ? 'bg-brand-light-navy text-brand-lightest-slate'
                : 'text-brand-slate hover:bg-brand-light-navy/50'
            }`}
          >
            Fornecedores
          </button>
        </div>

        <div className="mt-4">
          {activeTab === 'families' && renderFamiliesChart()}
          {activeTab === 'sites' && renderSitesChart()}
          {activeTab === 'suppliers' && renderSuppliersChart()}
        </div>
      </div>
    </Card>
  );
};

export default CategoricalEncodingChart;

