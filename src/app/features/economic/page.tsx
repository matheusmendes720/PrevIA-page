'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

export default function EconomicFeaturesPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isChartLoaded, setIsChartLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const initRef = useRef(false);

  // Effect to initialize when Chart.js is loaded
  useEffect(() => {
    if (!isChartLoaded || !containerRef.current || initRef.current) return;

    // Initialize the page after Chart.js loads
    const initPage = () => {
      if (typeof (window as any).Chart === 'undefined') {
        return;
      }

      if (initRef.current) return;
      initRef.current = true;

      // Mock data
      const mockPayload = {
        summary: {
          period: "Ago-Nov 2025",
          usdTrend: "up",
          inflationTrend: "up",
          liquidityRisk: "medium",
          narrative: "Câmbio USD/BRL em alta e inflação pressionando custos operacionais. Sinal amarelo para liquidez. Recomenda antecipar compras antes de novas elevações da SELIC."
        },
        taxSummary: {
          icms: 18.0,
          iss: 5.0,
          cofins: 7.6,
          ipi: 12.5,
          drawback: 20.0,
          narrative: "ICMS 18% (estadual) + ISS 5% (serviços) + COFINS 7.6% (fed) = 30.6% carga tributária. IPI 12.5% em peças de manutenção. Drawback Mercosul compensa 20% em importações qualificadas."
        },
        indicators: Array(90).fill(0).map((_, i) => {
          const fx = 4.8 + i * 0.0065 + Math.sin(i / 12) * 0.35 + Math.random() * 0.15;
          const ipca = 0.40 + (i / 90) * 0.5 + Math.sin(i / 20) * 0.25 + (Math.random() - 0.5) * 0.1;
          const selic = 12.25 + Math.floor(i / 30) * 0.25 + Math.sin(i / 15) * 0.12;
          const gdp = 2.5 + Math.sin(i / 25) * 0.8 + Math.cos(i / 40) * 0.4 + (Math.random() - 0.5) * 0.2;
          return {
            date: new Date(2025, 7, 1 + i).toISOString().split('T')[0],
            usdBrl: +fx.toFixed(2),
            ipca: +ipca.toFixed(3),
            selic: +selic.toFixed(2),
            gdpGrowth: +gdp.toFixed(2)
          };
        }),
        impacts: [
          { factor: 'usd_brl', demandImpact: 15, costImpact: 12, narrative: 'USD/BRL +10% = Estoque +15%, Custo +12%. Recomenda hedge da moeda para compras de materiais importados.' },
          { factor: 'ipca', demandImpact: 9, costImpact: 13, narrative: 'IPCA +0.3pp = Demanda +9%, Custos +13%. Antecipar ordens aproveitando menor inflação prevista.' },
          { factor: 'selic', demandImpact: -4, costImpact: 6, narrative: 'SELIC +0.25pp = Demanda -4%, Custo de capital +6%. Avaliar compensação com crédito externo.' },
          { factor: 'gdp', demandImpact: 7, costImpact: -3, narrative: 'PIB +0.5pp = Demanda +7%, Custo -3%. Momento positivo para expansão de estoque.' },
          { factor: 'icms', demandImpact: 0, costImpact: 3.2, narrative: 'ICMS 18% impacta R$ 18K/mês em custos de estoque local. Considerar distribuição em outros estados com alíquota menor.' },
          { factor: 'drawback', demandImpact: 0, costImpact: -4.4, narrative: 'Drawback Mercosul reduz 20% em tributos = -R$ 9.4K/mês em peças de manutenção de torre. Aumentar volume em 25-30%.' }
        ],
        recommendations: [
          { id: 'rec-fin-1', severity: 'critical', title: 'Financeiro: Hedge cambial 30 dias', description: 'Contratar hedge de moeda para importar materiais com USD/BRL acima de R$5,20.', actionOwner: 'Finance', dueDate: '2025-11-21' },
          { id: 'rec-proc-1', severity: 'warning', title: 'Procurement: Antecipar Compras', description: 'Realizar ordens de compra até 12/11 para evitar alta de custos operacionais.', actionOwner: 'Procurement', dueDate: '2025-11-12' },
          { id: 'rec-fin-2', severity: 'info', title: 'Financeiro: Negociar Crédito Externo', description: 'Buscar opções de crédito estrangeiro com juros abaixo da SELIC.', actionOwner: 'Finance', dueDate: '2025-12-03' },
          { id: 'rec-ops-1', severity: 'info', title: 'Operações: Ajustar Estoques', description: 'Expandir estoque de commodities durante crescimento do PIB (>3%).', actionOwner: 'Operations', dueDate: '2025-11-28' },
        ]
      };

      let scenario = 'base';
      let charts: any = {};

      // Render functions
      function renderSummaryTiles() {
        const el = document.getElementById('economicSummaryTiles');
        if (!el) return;
        el.innerHTML = '';
        [
          {
            label: 'USD/BRL',
            value: mockPayload.indicators[mockPayload.indicators.length - 1].usdBrl.toFixed(2),
            trend: mockPayload.summary.usdTrend,
            detail: 'Câmbio em alta',
          },
          {
            label: 'IPCA (%)',
            value: mockPayload.indicators[mockPayload.indicators.length - 1].ipca.toFixed(2),
            trend: mockPayload.summary.inflationTrend,
            detail: 'Inflação subindo',
          },
          {
            label: 'SELIC (%)',
            value: mockPayload.indicators[mockPayload.indicators.length - 1].selic.toFixed(2),
            trend: 'flat',
            detail: 'Juros estáveis',
          },
          {
            label: 'ROI (IA)',
            value: '1.6x',
            trend: 'up',
            detail: 'Savings resilientes',
          },
        ].forEach(t => {
          const trendIcon = t.trend === 'up' ? '↑' : t.trend === 'down' ? '↓' : '→';
          el.innerHTML += `<div class="economic-summary-card" title="Clique para explicação executiva">
            <div class="economic-card-label">${t.label}</div>
            <div class="economic-card-value">${t.value} <span class="economic-card-trend ${t.trend}">${trendIcon}</span></div>
            <div class="economic-card-detail">${t.detail}</div>
          </div>`;
        });
        const narrativeEl = document.getElementById('economicMacroNarrative');
        if (narrativeEl) narrativeEl.textContent = mockPayload.summary.narrative;
      }

      function renderTaxSummaryTiles() {
        const el = document.getElementById('economicTaxSummaryTiles');
        if (!el) return;
        el.innerHTML = '';
        [
          { label: 'ICMS', value: mockPayload.taxSummary.icms.toFixed(1), unit: '%', detail: 'Estadual (18%)' },
          { label: 'ISS', value: mockPayload.taxSummary.iss.toFixed(1), unit: '%', detail: 'Serviços (5%)' },
          { label: 'COFINS', value: mockPayload.taxSummary.cofins.toFixed(1), unit: '%', detail: 'Federal (7.6%)' },
          { label: 'IPI', value: mockPayload.taxSummary.ipi.toFixed(1), unit: '%', detail: 'Manutenção (12.5%)' },
          { label: 'Drawback', value: mockPayload.taxSummary.drawback.toFixed(0), unit: '%', detail: 'Subsídio (+)' },
        ].forEach(t => {
          el.innerHTML += `<div class="economic-summary-card" title="Impacto em preço e estoque">
            <div class="economic-card-label">${t.label}</div>
            <div class="economic-card-value">${t.value}<span style="font-size:14px; margin-left:4px;">${t.unit}</span></div>
            <div class="economic-card-detail">${t.detail}</div>
          </div>`;
        });
        const narrativeEl = document.getElementById('economicTaxNarrative');
        if (narrativeEl) narrativeEl.textContent = mockPayload.taxSummary.narrative;
      }

      function renderEconomicTimeline() {
        const canvas = document.getElementById('economicTimeline') as HTMLCanvasElement;
        if (!canvas || typeof (window as any).Chart === 'undefined') return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        charts.economicTimeline = new (window as any).Chart(ctx, {
          type: 'line',
          data: {
            labels: mockPayload.indicators.map(i => i.date),
            datasets: [
              { label: 'USD/BRL', data: mockPayload.indicators.map(i => i.usdBrl), borderColor: '#20A084', backgroundColor: 'rgba(32, 160, 132, 0.12)', borderWidth: 2.5, pointRadius: 0, tension: 0.35, fill: false },
              { label: 'IPCA (%)', data: mockPayload.indicators.map(i => i.ipca), borderColor: '#f97316', backgroundColor: 'rgba(249, 115, 22, 0.1)', borderWidth: 2.5, pointRadius: 0, tension: 0.35, fill: false },
              { label: 'SELIC (%)', data: mockPayload.indicators.map(i => i.selic), borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderWidth: 2.5, pointRadius: 0, tension: 0.35, fill: false },
              { label: 'PIB (%)', data: mockPayload.indicators.map(i => i.gdpGrowth), borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.08)', borderWidth: 2.5, pointRadius: 0, tension: 0.35, fill: false },
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { intersect: false, mode: 'index' },
            plugins: {
              legend: { labels: { color: '#a0aab8', font: { size: 12 } } },
              tooltip: { backgroundColor: 'rgba(15, 36, 56, 0.95)', titleColor: '#e0e8f0', bodyColor: '#a0aab8', borderColor: '#20A084', borderWidth: 1, padding: 12 }
            },
            scales: {
              x: { ticks: { color: '#a0aab8', maxTicksLimit: 12 }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
              y: { ticks: { color: '#a0aab8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
            }
          }
        });
      }

      function renderTaxImpactChart() {
        const canvas = document.getElementById('taxImpactChart') as HTMLCanvasElement;
        if (!canvas || typeof (window as any).Chart === 'undefined') return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        charts.taxImpact = new (window as any).Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['ICMS', 'ISS', 'COFINS', 'IPI', 'Carga Total', 'Drawback (-)'],
            datasets: [{
              label: 'Impacto em Custo (%)',
              data: [18, 5, 7.6, 12.5, 30.6, -20],
              backgroundColor: ['#20A084', '#f97316', '#10b981', '#ef4444', '#a855f7', '#22c55e'],
              borderRadius: 6
            }]
          },
          options: {
            indexAxis: 'x',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#a0aab8', font: { size: 12 } } } },
            scales: {
              x: { ticks: { color: '#a0aab8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
              y: { ticks: { color: '#a0aab8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
            }
          }
        });
      }

      function renderPriceVsTaxChart() {
        const canvas = document.getElementById('priceVsTaxChart') as HTMLCanvasElement;
        if (!canvas || typeof (window as any).Chart === 'undefined') return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const stockLevels = Array(30).fill(0).map((_, i) => i * 5000);
        const priceWithTax = stockLevels.map(s => s * 1.306);
        const priceWithDrawback = stockLevels.map(s => s * 1.086);
        const cashRequired = stockLevels.map(s => s * 0.7);

        charts.priceVsTax = new (window as any).Chart(ctx, {
          type: 'scatter',
          data: {
            datasets: [
              { label: 'Preço + Tributos Totais', data: stockLevels.map((x, i) => ({ x, y: priceWithTax[i] })), borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.3)', showLine: true, tension: 0.35 },
              { label: 'Preço + Tributos (Drawback)', data: stockLevels.map((x, i) => ({ x, y: priceWithDrawback[i] })), borderColor: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.3)', showLine: true, tension: 0.35 },
              { label: 'Caixa Necessário', data: stockLevels.map((x, i) => ({ x, y: cashRequired[i] })), borderColor: '#20A084', backgroundColor: 'rgba(32, 160, 132, 0.3)', showLine: true, tension: 0.35 }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#a0aab8', font: { size: 12 } } } },
            scales: {
              x: { title: { display: true, text: 'Estoque (R$)', color: '#a0aab8' }, ticks: { color: '#a0aab8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
              y: { title: { display: true, text: 'Custo/Caixa (R$)', color: '#a0aab8' }, ticks: { color: '#a0aab8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
            }
          }
        });
      }

      function setupScenarioSelector() {
        document.querySelectorAll('.economic-scenario-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            document.querySelectorAll('.economic-scenario-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            scenario = (btn as HTMLElement).dataset.scenario || 'base';
            renderImpactWaterfall();
          });
        });
      }

      function renderImpactWaterfall() {
        const el = document.getElementById('economicImpactBar');
        if (!el) return;
        el.innerHTML = '';
        let impacts = mockPayload.impacts;
        if (scenario === 'adverse') {
          impacts = [
            { factor: 'usd_brl', demandImpact: 22, costImpact: 18, narrative: 'USD/BRL +15% = Estoque +22%, Custo +18%. Reforçar hedge imediato.' },
            { factor: 'ipca', demandImpact: 14, costImpact: 18, narrative: 'IPCA +0.5pp = Demanda +14%, Custos +18%. Pós-eleição, remanejar ordens.' },
            { factor: 'selic', demandImpact: -7, costImpact: 14, narrative: 'SELIC +0.5pp = Demanda -7%, Custo de capital +14%.' },
            { factor: 'gdp', demandImpact: 3, costImpact: -7, narrative: 'PIB +0.2pp = Demanda +3%, Custo -7%. Contrair expansão temporária.' },
            { factor: 'icms', demandImpact: 0, costImpact: 5, narrative: 'ICMS sobe para 20% (alerta estadual). Custo +2.8K/mês.' },
            { factor: 'drawback', demandImpact: 0, costImpact: -3, narrative: 'Drawback reduzido para 15% (restrições). Economia -R$ 2.1K/mês.' }
          ];
        } else if (scenario === 'optimistic') {
          impacts = [
            { factor: 'usd_brl', demandImpact: 8, costImpact: 6, narrative: 'USD/BRL +5% = Estoque +8%, Custo +6%. Comprar dólar barato.' },
            { factor: 'ipca', demandImpact: 5, costImpact: 7, narrative: 'IPCA +0.1pp = Demanda +5%, Custos +7%. Estoque estratégico.' },
            { factor: 'selic', demandImpact: 2, costImpact: 0, narrative: 'SELIC -0.25pp = Demanda +2%, Custo de capital estável.' },
            { factor: 'gdp', demandImpact: 16, costImpact: 0, narrative: 'PIB +1.0pp = Demanda +16%, Custo neutro. Expansão acelerada.' },
            { factor: 'icms', demandImpact: 0, costImpact: -1, narrative: 'ICMS mantém 18%. Carga estável. Custo -R$ 400/mês via eficiência.' },
            { factor: 'drawback', demandImpact: 0, costImpact: -6, narrative: 'Drawback sobe para 25% (expansão Mercosul). Economia +R$ 11.8K/mês.' }
          ];
        }
        impacts.forEach(seg => {
            el.innerHTML += `<div class="economic-impact-segment" data-factor="${seg.factor}" title="${seg.narrative}">
            <span style="font-size:18px; font-weight: 700; margin-bottom: 4px;">${seg.factor.toUpperCase().replace('_', '/')}</span>
            <span style="font-size:16px; color:var(--color-success); font-weight: 700;">Dem: ${seg.demandImpact > 0 ? '+' : ''}${seg.demandImpact}%</span>
            <span style="font-size:16px; color:var(--color-error); font-weight: 700;">Custo: ${seg.costImpact > 0 ? '+' : ''}${seg.costImpact}%</span>
          </div>`;
        });
        const narrativeEl = document.getElementById('economicImpactNarrative');
        if (narrativeEl) narrativeEl.textContent = impacts.map(i => i.narrative).join(' | ');
      }

      function renderRecommendations() {
        const el = document.getElementById('economicRecomList');
        if (!el) return;
        el.innerHTML = '';
        mockPayload.recommendations.forEach(rec => {
          el.innerHTML += `<div class="economic-recom-card ${rec.severity}">
            <div class="economic-recom-title">${rec.title}</div>
            <div class="economic-recom-owner">👤 ${rec.actionOwner}</div>
            <div class="economic-recom-desc">${rec.description}</div>
            <div class="economic-recom-due">📅 Antes de ${rec.dueDate}</div>
          </div>`;
        });
      }

      function renderGauges() {
        const roiEl = document.getElementById('economicRoiGauge');
        const cashEl = document.getElementById('economicCashGauge');
        if (roiEl) roiEl.textContent = '1.6x';
        if (cashEl) cashEl.textContent = 'R$ 326K';
      }

      // Initialize all components
      renderSummaryTiles();
      renderTaxSummaryTiles();
      renderEconomicTimeline();
      renderTaxImpactChart();
      renderPriceVsTaxChart();
      renderGauges();
      setupScenarioSelector();
      renderImpactWaterfall();
      renderRecommendations();

      setIsInitialized(true);
    };

    initPage();
  }, [isChartLoaded]);

  // Effect to check for Chart.js on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (typeof (window as any).Chart !== 'undefined') {
      setIsChartLoaded(true);
      return;
    }

    let checkCount = 0;
    const maxChecks = 100;
    const checkChart = setInterval(() => {
      checkCount++;
      if (typeof (window as any).Chart !== 'undefined') {
        clearInterval(checkChart);
        setIsChartLoaded(true);
      } else if (checkCount >= maxChecks) {
        clearInterval(checkChart);
        console.warn('Chart.js failed to load after timeout');
        setIsInitialized(true);
      }
    }, 100);

    return () => {
      clearInterval(checkChart);
    };
  }, []);

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          setIsChartLoaded(true);
        }}
        onError={() => {
          console.error('Failed to load Chart.js');
          setIsInitialized(true);
        }}
      />
      {!isInitialized && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          color: 'var(--color-text-secondary)',
          fontSize: '18px'
        }}>
          Carregando visualizações...
        </div>
      )}
      <div ref={containerRef} className="economic-features-container" style={{ display: isInitialized ? 'block' : 'none' }}>
        <style jsx global>{`
          :root {
            --color-primary: #20A084;
            --color-primary-hover: #1a8a70;
            --color-secondary: rgba(32, 160, 132, 0.1);
            --color-surface: #0f2438;
            --color-surface-alt: #1a3a52;
            --color-text: #e0e8f0;
            --color-text-secondary: #a0aab8;
            --color-success: #10b981;
            --color-warning: #f97316;
            --color-error: #ef4444;
            --color-bg: #0a1628;
            --color-border: rgba(255, 255, 255, 0.1);
            --space-8: 8px;
            --space-12: 12px;
            --space-16: 16px;
            --space-24: 24px;
            --space-32: 32px;
            --radius-base: 8px;
            --radius-lg: 12px;
          }

          .economic-features-container {
            width: 100%;
            max-width: 100%;
            margin: 0;
            padding: 0;
            background: transparent;
            color: var(--color-text);
            min-height: auto;
          }

          .economic-header {
            margin-bottom: var(--space-32);
            border-bottom: 1px solid var(--color-border);
            padding-bottom: var(--space-24);
          }

          .economic-header h1 {
            margin: 0 0 var(--space-8) 0;
            font-size: 20px;
            font-weight: 600;
            color: var(--color-text);
          }

          .economic-header p {
            margin: 0;
            color: var(--color-text-secondary);
            font-size: 15px;
          }

          .economic-section-title {
            font-size: 15px;
            color: var(--color-text-secondary);
            margin-bottom: var(--space-12);
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 0.5px;
          }

          .economic-summary-tiles {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: var(--space-24);
            margin-bottom: var(--space-24);
          }

          .economic-summary-card {
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            padding: var(--space-24);
            text-align: center;
            cursor: help;
            transition: all 0.3s;
          }

          .economic-summary-card:hover {
            border-color: var(--color-primary);
            box-shadow: 0 8px 24px rgba(32, 160, 132, 0.15);
            transform: translateY(-2px);
          }

          .economic-card-label {
            font-size: 13px;
            color: var(--color-text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: var(--space-10);
            font-weight: 600;
          }

          .economic-card-value {
            font-size: 30px;
            font-weight: 700;
            color: var(--color-primary);
            margin-bottom: var(--space-10);
            line-height: 1.2;
          }

          .economic-card-trend.up { color: var(--color-success); }
          .economic-card-trend.down { color: var(--color-error); }
          .economic-card-trend.flat { color: var(--color-warning); }

          .economic-card-detail {
            font-size: 14px;
            color: var(--color-text-secondary);
            line-height: 1.4;
          }

          .economic-info-narrative {
            font-size: 16px;
            color: var(--color-warning);
            margin-top: var(--space-12);
            background: rgba(249, 115, 22, 0.08);
            border-radius: var(--radius-base);
            padding: var(--space-16);
            border-left: 3px solid var(--color-warning);
            line-height: 1.7;
            font-weight: 500;
          }

          .economic-indicator-chart-card {
            background: var(--color-surface);
            border-radius: var(--radius-lg);
            border: 1px solid var(--color-border);
            padding: var(--space-24);
            margin-bottom: var(--space-24);
            transition: all 0.3s;
          }

          .economic-indicator-chart-card:hover {
            border-color: var(--color-primary);
            box-shadow: 0 8px 24px rgba(32, 160, 132, 0.15);
          }

          .economic-chart-wrapper {
            position: relative;
            height: 290px;
            margin-top: var(--space-16);
          }

          .economic-chart-title {
            font-size: 18px;
            margin-bottom: var(--space-16);
            color: var(--color-primary);
            font-weight: 600;
          }

          .economic-storytelling-box {
            margin-top: var(--space-16);
            padding: var(--space-16);
            background: rgba(32, 160, 132, 0.08);
            border-radius: var(--radius-base);
            border-left: 4px solid var(--color-primary);
          }

          .economic-storytelling-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--color-primary);
            margin-bottom: var(--space-12);
          }

          .economic-storytelling-content {
            font-size: 15px;
            color: var(--color-text);
            line-height: 1.8;
          }

          .economic-storytelling-content p {
            margin: var(--space-8) 0;
          }

          .economic-storytelling-content strong {
            color: var(--color-primary);
          }

          .economic-scenario-selector {
            display: flex;
            gap: var(--space-12);
            margin-bottom: var(--space-24);
            flex-wrap: wrap;
          }

          .economic-scenario-btn {
            background: var(--color-surface);
            color: var(--color-text);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-base);
            padding: var(--space-12) var(--space-20);
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.3s;
            font-family: inherit;
            min-width: 120px;
          }

          .economic-scenario-btn:hover {
            background: var(--color-surface-alt);
            border-color: var(--color-primary);
          }

          .economic-scenario-btn.active {
            background: var(--color-primary);
            color: white;
            border-color: var(--color-primary);
            box-shadow: 0 0 15px rgba(32, 160, 132, 0.4);
          }

          .economic-waterfall-zone {
            background: var(--color-surface);
            border-radius: var(--radius-lg);
            border: 1px solid var(--color-border);
            padding: var(--space-24);
            margin-bottom: var(--space-24);
            transition: all 0.3s;
          }

          .economic-waterfall-zone:hover {
            border-color: var(--color-primary);
            box-shadow: 0 8px 24px rgba(32, 160, 132, 0.15);
          }

          .economic-waterfall-title {
            font-size: 18px;
            color: var(--color-primary);
            font-weight: 600;
            margin-bottom: var(--space-16);
          }

          .economic-impact-bar {
            width: 100%;
            min-height: 80px;
            display: flex;
            align-items: stretch;
            gap: var(--space-8);
            margin-bottom: var(--space-16);
            flex-wrap: wrap;
          }

          .economic-impact-segment {
            flex: 1;
            min-width: 140px;
            min-height: 80px;
            background: linear-gradient(90deg, rgba(32, 160, 132, 0.15), rgba(16, 185, 129, 0.1));
            border-radius: var(--radius-base);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            color: var(--color-text);
            font-weight: 600;
            transition: all 0.3s;
            border: 2px solid var(--color-border);
            padding: var(--space-12);
            flex-direction: column;
            gap: var(--space-8);
            text-align: center;
          }

          .economic-impact-segment:hover {
            transform: scale(1.05);
            border-color: var(--color-primary);
            box-shadow: 0 4px 12px rgba(32, 160, 132, 0.3);
            z-index: 10;
          }

          .economic-impact-segment[data-factor="usd_brl"] {
            background: linear-gradient(90deg, rgba(32, 160, 132, 0.2), rgba(239, 68, 68, 0.12));
            color: #20A084;
          }

          .economic-impact-segment[data-factor="ipca"] {
            background: linear-gradient(90deg, rgba(249, 115, 22, 0.25), rgba(32, 160, 132, 0.12));
            color: #f97316;
          }

          .economic-impact-segment[data-factor="selic"] {
            background: linear-gradient(90deg, rgba(16, 185, 129, 0.25), rgba(32, 160, 132, 0.1));
            color: #10b981;
          }

          .economic-impact-segment[data-factor="gdp"] {
            background: linear-gradient(90deg, rgba(32, 160, 132, 0.22), rgba(220, 38, 38, 0.1));
            color: #ef4444;
          }

          .economic-impact-segment[data-factor="icms"] {
            background: linear-gradient(90deg, rgba(168, 85, 247, 0.2), rgba(32, 160, 132, 0.1));
            color: #a855f7;
          }

          .economic-impact-segment[data-factor="drawback"] {
            background: linear-gradient(90deg, rgba(34, 197, 94, 0.25), rgba(32, 160, 132, 0.12));
            color: #22c55e;
          }

          .economic-impact-legend-row {
            font-size: 14px;
            margin-top: var(--space-12);
            color: var(--color-text-secondary);
            text-align: center;
            font-weight: 500;
            padding: var(--space-8) 0;
          }

          .economic-impact-narrative {
            font-size: 16px;
            color: var(--color-warning);
            background: rgba(249, 115, 22, 0.08);
            border-radius: var(--radius-base);
            padding: var(--space-16);
            margin-top: var(--space-16);
            border-left: 3px solid var(--color-warning);
            line-height: 1.8;
            font-weight: 500;
          }

          .economic-drawback-card {
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            padding: var(--space-16);
            margin-bottom: var(--space-24);
            transition: all 0.3s;
          }

          .economic-drawback-card:hover {
            border-color: var(--color-primary);
            box-shadow: 0 8px 24px rgba(32, 160, 132, 0.15);
          }

          .economic-drawback-title {
            font-size: 18px;
            color: var(--color-primary);
            font-weight: 600;
            margin-bottom: var(--space-16);
          }

          .economic-drawback-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: var(--space-16);
            margin-bottom: var(--space-16);
          }

          .economic-drawback-item {
            background: var(--color-surface-alt);
            padding: var(--space-12);
            border-radius: var(--radius-base);
            border-left: 4px solid var(--color-success);
          }

          .economic-drawback-item.primary {
            border-left-color: var(--color-primary);
          }

          .economic-drawback-item.warning {
            border-left-color: var(--color-warning);
          }

          .economic-drawback-label {
            font-size: 15px;
            color: var(--color-text-secondary);
            margin-bottom: var(--space-10);
            font-weight: 500;
          }

          .economic-drawback-value {
            font-size: 28px;
            font-weight: 700;
            color: var(--color-success);
            margin-bottom: var(--space-10);
            line-height: 1.2;
          }

          .economic-drawback-value.primary {
            color: var(--color-primary);
          }

          .economic-drawback-value.warning {
            color: var(--color-warning);
          }

          .economic-drawback-desc {
            font-size: 14px;
            color: var(--color-text-secondary);
            line-height: 1.6;
          }

          .economic-drawback-recommendation {
            margin-top: var(--space-16);
            padding: var(--space-12);
            background: rgba(16, 185, 129, 0.08);
            border-radius: var(--radius-base);
            border-left: 4px solid var(--color-success);
          }

          .economic-drawback-recommendation-title {
            font-size: 16px;
            color: var(--color-success);
            font-weight: 600;
            margin-bottom: var(--space-10);
          }

          .economic-drawback-recommendation-text {
            font-size: 15px;
            color: var(--color-text);
            line-height: 1.7;
            font-weight: 500;
          }

          .economic-recom-zone {
            background: var(--color-surface);
            border-radius: var(--radius-lg);
            border: 1px solid var(--color-border);
            padding: var(--space-24);
            margin-bottom: var(--space-24);
            transition: all 0.3s;
          }

          .economic-recom-zone:hover {
            border-color: var(--color-primary);
            box-shadow: 0 8px 24px rgba(32, 160, 132, 0.15);
          }

          .economic-recom-title {
            font-size: 18px;
            color: var(--color-primary);
            font-weight: 600;
            margin-bottom: var(--space-20);
          }

          .economic-recom-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: var(--space-16);
            margin-top: var(--space-12);
          }

          .economic-recom-card {
            background: var(--color-surface-alt);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-base);
            padding: var(--space-16);
            display: flex;
            flex-direction: column;
            gap: var(--space-8);
            transition: all 0.3s;
          }

          .economic-recom-card:hover {
            border-color: var(--color-primary);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(32, 160, 132, 0.2);
          }

          .economic-recom-card.info {
            border-left: 4px solid var(--color-primary);
          }

          .economic-recom-card.warning {
            border-left: 4px solid var(--color-warning);
          }

          .economic-recom-card.critical {
            border-left: 4px solid var(--color-error);
          }

          .economic-recom-card .economic-recom-title {
            color: var(--color-primary);
            font-size: 18px;
            font-weight: 600;
            margin-bottom: var(--space-8);
          }

          .economic-recom-owner {
            font-size: 15px;
            color: var(--color-text-secondary);
            font-weight: 500;
            margin-bottom: var(--space-8);
          }

          .economic-recom-desc {
            font-size: 15px;
            color: var(--color-text);
            line-height: 1.6;
            margin-bottom: var(--space-8);
          }

          .economic-recom-due {
            font-size: 14px;
            color: var(--color-warning);
            font-weight: 600;
          }

          .economic-gauge-zone {
            background: var(--color-surface);
            border-radius: var(--radius-lg);
            border: 1px solid var(--color-border);
            padding: var(--space-24);
            margin-bottom: var(--space-24);
            display: flex;
            align-items: center;
            gap: var(--space-24);
            flex-wrap: wrap;
            transition: all 0.3s;
          }

          .economic-gauge-zone:hover {
            border-color: var(--color-primary);
            box-shadow: 0 8px 24px rgba(32, 160, 132, 0.15);
          }

          .economic-gauge-card {
            background: var(--color-surface-alt);
            border-radius: var(--radius-base);
            padding: var(--space-16);
            border: 1px solid var(--color-border);
            width: 260px;
            min-width: 220px;
            text-align: center;
            transition: all 0.3s;
          }

          .economic-gauge-card:hover {
            border-color: var(--color-primary);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(32, 160, 132, 0.2);
          }

          .economic-gauge-title {
            font-size: 17px;
            font-weight: 600;
            color: var(--color-primary);
            margin-bottom: var(--space-12);
          }

          .economic-gauge-value {
            font-size: 36px;
            font-weight: 700;
            color: var(--color-success);
            margin-bottom: var(--space-12);
            line-height: 1.2;
          }

          .economic-gauge-summary {
            font-size: 15px;
            color: var(--color-warning);
            line-height: 1.6;
            font-weight: 500;
          }

          @media (max-width: 900px) {
            .economic-summary-tiles { grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); }
            .economic-gauge-zone { flex-direction: column; gap: var(--space-12); }
            .economic-gauge-card { width: 100%; }
            .economic-recom-list { grid-template-columns: 1fr; }
            .economic-drawback-grid { grid-template-columns: 1fr; }
            .economic-impact-bar { flex-wrap: wrap; height: auto; }
            .economic-impact-segment { 
              min-width: 140px; 
              min-height: 90px;
              font-size: 13px;
            }
            .economic-impact-segment span { font-size: 14px !important; }
            .economic-header h1 { font-size: 24px; }
            .economic-card-value { font-size: 26px; }
            .economic-gauge-value { font-size: 28px; }
          }
        `}</style>

        <div className="economic-header">
          <h1>💰 Features Econômicas Avançadas</h1>
          <p>Indicadores BACEN + Tributos (ICMS, ISS, COFINS, IPI) + Subsídios Drawback Mercosul</p>
        </div>

        {/* Macro Indicators Summary */}
        <div className="economic-section-title">📈 Indicadores Macro BACEN</div>
        <div className="economic-summary-tiles" id="economicSummaryTiles"></div>
        <div className="economic-info-narrative" id="economicMacroNarrative"></div>

        {/* Tax & Subsidy Summary */}
        <div className="economic-section-title" style={{ marginTop: 'var(--space-24)' }}>💰 Tributos & Subsídios</div>
        <div className="economic-summary-tiles" id="economicTaxSummaryTiles"></div>
        <div className="economic-info-narrative" id="economicTaxNarrative"></div>

        {/* Indicator Timeline */}
        <div className="economic-indicator-chart-card">
          <div className="economic-chart-title">📈 Indicadores Econômicos - 90 dias</div>
          <div className="economic-chart-wrapper">
            <canvas id="economicTimeline"></canvas>
          </div>
          <div className="economic-storytelling-box">
            <div className="economic-storytelling-title">💡 Storytelling: Variações Significativas - 90 Dias</div>
            <div className="economic-storytelling-content">
              <p><strong>📊 USD/BRL (Câmbio):</strong> Variação +8% em 90 dias (R$4,80 → R$5,18). Ciclos de 25-30 dias com volatilidade +/-0,35 pips. <span style={{ color: 'var(--color-warning)' }}>Implicação:</span> Compras de materiais importados sofrem impacto direto. <span style={{ color: 'var(--color-success)' }}>Recomendação:</span> Hedge de 60 dias antes de ordens internacionais.</p>
              <p><strong>📈 IPCA (Inflação):</strong> Aceleração contínua de 0,40% → 0,60% (trend +50%). Padrão sazonal detectado em janelas de 20 dias. <span style={{ color: 'var(--color-warning)' }}>Implicação:</span> Custos operacionais sobem sistematicamente. <span style={{ color: 'var(--color-success)' }}>Recomendação:</span> Antecipar compras antes da próxima inflexão (dias 60-75).</p>
              <p><strong>🔄 SELIC (Juros):</strong> Patamares: 12,25% (dias 1-30) → 12,50% (dias 31-60) → 12,75% (dias 61-90). Mudanças escalonadas simulam decisões do COPOM. <span style={{ color: 'var(--color-warning)' }}>Implicação:</span> Custo de capital aumenta 50bps cada mês. <span style={{ color: 'var(--color-success)' }}>Recomendação:</span> Priorizar créditos pré-fixados ou linhas externas antes de novas altas.</p>
              <p><strong>📊 PIB (Crescimento):</strong> Dupla sazonalidade: ciclos de 25 dias (volatilidade operacional) + 40 dias (ciclos econômicos maiores). Média 3,5% com banda ±0,8pp. <span style={{ color: 'var(--color-warning)' }}>Implicação:</span> Demanda oscila com padrões previsíveis. <span style={{ color: 'var(--color-success)' }}>Recomendação:</span> Dimensionar estoque sincronizado aos picos de PIB (dias 10-15, 35-40, 60-70).</p>
              <p style={{ marginTop: 'var(--space-12)', paddingTop: 'var(--space-12)', borderTop: '1px solid rgba(255,255,255,0.1)' }}><strong>🎯 Ação Imediata (Próximos 7 dias):</strong> Monitorar USD/BRL acima de R$5,15 para trigger de hedge | IPCA em inflexão para ajuste de ordens | Avaliar refinanciamento de dívidas antes de SELIC +25bps.</p>
            </div>
          </div>
        </div>

        {/* Tax Impact Analysis */}
        <div className="economic-indicator-chart-card">
          <div className="economic-chart-title">🔍 Análise Tributos: Tarifa × Tributo × Margem</div>
          <div className="economic-chart-wrapper">
            <canvas id="taxImpactChart"></canvas>
          </div>
          <div style={{ marginTop: 'var(--space-12)', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            <strong>Legenda:</strong> ICMS (Estadual 18%), ISS (Municipal 5%), COFINS (Fed 7.6%), IPI (Fed 10-35% eletro/manutenção)
          </div>
        </div>

        {/* Price vs Tax Margin Analysis */}
        <div className="economic-indicator-chart-card">
          <div className="economic-chart-title">📊 Preço vs Tributos: Estoque × Caixa</div>
          <div className="economic-chart-wrapper">
            <canvas id="priceVsTaxChart"></canvas>
          </div>
        </div>

        {/* Scenario Selector */}
        <div className="economic-scenario-selector">
          <button className="economic-scenario-btn active" data-scenario="base">Base</button>
          <button className="economic-scenario-btn" data-scenario="adverse">Adverso</button>
          <button className="economic-scenario-btn" data-scenario="optimistic">Otimista</button>
        </div>

        {/* Impact Waterfall - Macro + Tax */}
        <div className="economic-waterfall-zone">
          <div className="economic-waterfall-title">💧 Impactos Integrados: Macro + Tributos + Drawback</div>
          <div className="economic-impact-bar" id="economicImpactBar"></div>
          <div className="economic-impact-legend-row">IPCA | USD/BRL | SELIC | PIB | ICMS | ISS | COFINS | IPI | Drawback Mercosul</div>
          <div className="economic-impact-narrative" id="economicImpactNarrative"></div>
        </div>

        {/* Drawback Subsidy Card */}
        <div className="economic-drawback-card">
          <div className="economic-drawback-title">🎁 Subsídio Drawback Mercosul - Torre Manutenção</div>
          <div className="economic-drawback-grid">
            <div className="economic-drawback-item">
              <div className="economic-drawback-label">Drawback Taxa</div>
              <div className="economic-drawback-value">18-22%</div>
              <div className="economic-drawback-desc">Recuperação de tributos em peças importadas para manutenção de torres</div>
            </div>
            <div className="economic-drawback-item primary">
              <div className="economic-drawback-label">Economia Mensal</div>
              <div className="economic-drawback-value primary">R$ 47K</div>
              <div className="economic-drawback-desc">Baseado em volume típico de manutenção Mercosul</div>
            </div>
            <div className="economic-drawback-item warning">
              <div className="economic-drawback-label">Estoque Otimizado</div>
              <div className="economic-drawback-value warning">R$ 156K</div>
              <div className="economic-drawback-desc">Capital liberado via drawback para rotacionar caixa</div>
            </div>
          </div>
          <div className="economic-drawback-recommendation">
            <div className="economic-drawback-recommendation-title">✓ Recomendação:</div>
            <div className="economic-drawback-recommendation-text">Aumentar importações Mercosul para peças de torre em 25-30%. Drawback reduz custo efetivo em 18-22%, liberando R$ 47K/mês para giro de estoque e financiamento de outras operações.</div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="economic-recom-zone">
          <div className="economic-recom-title">📝 Recomendações Prescritivas</div>
          <div className="economic-recom-list" id="economicRecomList"></div>
        </div>

        {/* Cashflow Gauge */}
        <div className="economic-gauge-zone">
          <div className="economic-gauge-card">
            <div className="economic-gauge-title">ROI via IA</div>
            <div className="economic-gauge-value" id="economicRoiGauge">1.6x</div>
            <div className="economic-gauge-summary">Mesmo com volatividade, IA captura savings.</div>
          </div>
          <div className="economic-gauge-card">
            <div className="economic-gauge-title">Fluxo de Caixa vs Estoque</div>
            <div className="economic-gauge-value" id="economicCashGauge">R$ 326K</div>
            <div className="economic-gauge-summary">Capital otimizado para absorver flutuações nos custos.</div>
          </div>
        </div>
      </div>
    </>
  );
}
