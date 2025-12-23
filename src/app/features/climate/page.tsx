'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

export default function ClimateFeaturesPage() {
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
          period: "19 Oct - 18 Nov 2025",
          avgTemp: 27,
          avgRainfall: 120,
          riskLevel: 'medium',
          narrative: 'Semana chuvosa esperada com risco médio de tempestades. Umidade elevada correlaciona com aumento de demanda em anticorrosivos.'
        },
        metrics: Array(30).fill(0).map((_, i) => {
          const date = new Date(2025, 9, 19 + i);
          const tempBase = 26 + Math.sin((i / 30) * Math.PI) * 4;
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
            stormRisk: stormRiskMap
          };
        }),
        alerts: [
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
        ],
        correlations: [
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
        ]
      };

      let state = {
        activeTab: 'temperature',
        dateFrom: '2025-10-19',
        dateTo: '2025-11-18',
        brazilMapViewMode: 'temperature',
        brazilMapRegionFilter: 'all'
      };

      let charts: any = {};

      // Render functions
      function renderAlerts() {
        const container = document.getElementById('alertsContainer');
        if (!container) return;
        container.innerHTML = '';

        const sorted = [...mockPayload.alerts].sort((a, b) => {
          const severityOrder: any = { critical: 0, warning: 1, info: 2 };
          return severityOrder[a.severity] - severityOrder[b.severity];
        });

        sorted.forEach(alert => {
          const card = document.createElement('div');
          card.className = `alert-card ${alert.severity}`;
          
          card.innerHTML = `
            <div class="alert-header">
              <div class="alert-severity ${alert.severity}"></div>
              <h3 class="alert-title">${alert.title}</h3>
            </div>
            <p class="alert-date">📅 ${alert.effectiveFrom} até ${alert.effectiveTo}</p>
            <p class="alert-impact">${alert.impact}</p>
            <div class="alert-recommendation">
              <strong>✅ Ação Recomendada:</strong><br/>${alert.recommendation}
            </div>
          `;
          container.appendChild(card);
        });
      }

      function renderCorrelationItems() {
        const container = document.getElementById('correlationItems');
        if (!container) return;
        container.innerHTML = '';

        mockPayload.correlations.forEach(corr => {
          const item = document.createElement('div');
          item.className = 'correlation-item';
          item.innerHTML = `
            <div class="correlation-factor">${corr.label}</div>
            <div class="correlation-impact">+${corr.demandImpact}%</div>
            <div style="font-size: 13px; color: var(--color-text-secondary); margin-bottom: var(--space-8);">Demanda</div>
            <div class="correlation-sla">SLA Risk +${corr.slaRiskDelta}%</div>
            <div style="font-size: 12px; color: var(--color-text-secondary); margin-top: var(--space-8);">
              📦 ${corr.materials}
            </div>
          `;
          container.appendChild(item);
        });
      }

      function renderStormBar() {
        const bar = document.getElementById('stormBar');
        if (!bar) return;
        bar.innerHTML = '';

        mockPayload.metrics.forEach((metric) => {
          const segment = document.createElement('div');
          segment.className = `storm-segment ${metric.stormRisk}`;
          
          const riskLabel = metric.stormRisk === 'high' ? 'ALTO' : metric.stormRisk === 'medium' ? 'MÉDIO' : 'BAIXO';
          segment.innerHTML = `
            <div class="storm-segment-tooltip">
              ${metric.date}: ${riskLabel}
            </div>
          `;
          bar.appendChild(segment);
        });

        // Update counts
        const highCount = mockPayload.metrics.filter(m => m.stormRisk === 'high').length;
        const mediumCount = mockPayload.metrics.filter(m => m.stormRisk === 'medium').length;
        const highCountEl = document.getElementById('highRiskCount');
        const mediumCountEl = document.getElementById('mediumRiskCount');
        if (highCountEl) highCountEl.textContent = highCount.toString();
        if (mediumCountEl) mediumCountEl.textContent = mediumCount.toString();
      }

      function initCharts() {
        // Temperature Chart
        const tempCanvas = document.getElementById('temperatureChart') as HTMLCanvasElement;
        if (tempCanvas && typeof (window as any).Chart !== 'undefined') {
          const tempCtx = tempCanvas.getContext('2d');
          if (tempCtx) {
            charts.temperature = new (window as any).Chart(tempCtx, {
              type: 'line',
              data: {
                labels: mockPayload.metrics.map(m => m.date.split('-')[2]),
                datasets: [
                  {
                    label: 'Média',
                    data: mockPayload.metrics.map(m => m.temperature.avg),
                    borderColor: '#20A084',
                    backgroundColor: 'rgba(32, 160, 132, 0.1)',
                    borderWidth: 2,
                    tension: 0.4
                  },
                  {
                    label: 'Máxima',
                    data: mockPayload.metrics.map(m => m.temperature.max),
                    borderColor: '#f97316',
                    backgroundColor: 'rgba(249, 115, 22, 0.1)',
                    borderWidth: 2,
                    tension: 0.4
                  },
                  {
                    label: 'Mínima',
                    data: mockPayload.metrics.map(m => m.temperature.min),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    tension: 0.4
                  }
                ]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { labels: { color: '#a0aab8', font: { size: 12 } } }
                },
                scales: {
                  y: {
                    ticks: { color: '#a0aab8' },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                  },
                  x: {
                    ticks: { color: '#a0aab8' },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                  }
                }
              }
            });
          }
        }

        // Precipitation Chart
        const precCanvas = document.getElementById('precipitationChart') as HTMLCanvasElement;
        if (precCanvas && typeof (window as any).Chart !== 'undefined') {
          const precCtx = precCanvas.getContext('2d');
          if (precCtx) {
            charts.precipitation = new (window as any).Chart(precCtx, {
              type: 'bar',
              data: {
                labels: mockPayload.metrics.map(m => m.date.split('-')[2]),
                datasets: [{
                  label: 'Precipitação (mm)',
                  data: mockPayload.metrics.map(m => m.rainfall),
                  backgroundColor: mockPayload.metrics.map(m => 
                    m.rainfall > 50 ? 'rgba(239, 68, 68, 0.8)' :
                    m.rainfall > 30 ? 'rgba(249, 115, 22, 0.8)' :
                    'rgba(32, 160, 132, 0.8)'
                  ),
                  borderColor: mockPayload.metrics.map(m => 
                    m.rainfall > 50 ? '#ef4444' :
                    m.rainfall > 30 ? '#f97316' :
                    '#20A084'
                  ),
                  borderWidth: 1
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { labels: { color: '#a0aab8', font: { size: 12 } } }
                },
                scales: {
                  y: {
                    ticks: { color: '#a0aab8' },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                  },
                  x: {
                    ticks: { color: '#a0aab8' },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                  }
                }
              }
            });

            // Update rainy week count
            const rainyWeeks = mockPayload.metrics.filter(m => m.rainfall > 50).length;
            const rainyWeekEl = document.getElementById('rainyWeekCount');
            if (rainyWeekEl) rainyWeekEl.textContent = rainyWeeks.toString();
          }
        }

        // Scatter Chart
        const scatterCanvas = document.getElementById('brushableScatterChart') as HTMLCanvasElement;
        if (scatterCanvas && typeof (window as any).Chart !== 'undefined') {
          const scatterCtx = scatterCanvas.getContext('2d');
          if (scatterCtx) {
            const scatterData = mockPayload.metrics.map((m, idx) => ({
              x: m.rainfall,
              y: (m.rainfall > 50 ? 40 : m.rainfall > 30 ? 25 : 10) + (Math.random() - 0.5) * 5,
              idx: idx,
              date: m.date
            }));

            charts.brushableScatter = new (window as any).Chart(scatterCtx, {
              type: 'scatter',
              data: {
                datasets: [{
                  label: 'Precipitação vs Demanda',
                  data: scatterData,
                  backgroundColor: 'rgba(32, 160, 132, 0.6)',
                  borderColor: '#20A084',
                  borderWidth: 1,
                  pointRadius: 6,
                  pointHoverRadius: 8
                }]
              },
              options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { labels: { color: '#a0aab8', font: { size: 12 } } },
                  tooltip: {
                    callbacks: {
                      label: function(ctx: any) {
                        return `Chuva: ${ctx.raw.x.toFixed(1)}mm | Demanda: +${ctx.raw.y.toFixed(0)}% | Data: ${ctx.raw.date}`;
                      }
                    }
                  }
                },
                scales: {
                  x: {
                    type: 'linear',
                    title: { display: true, text: 'Precipitação (mm)', color: '#a0aab8' },
                    ticks: { color: '#a0aab8' },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                  },
                  y: {
                    title: { display: true, text: 'Impacto Demanda (%)', color: '#a0aab8' },
                    ticks: { color: '#a0aab8' },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                  }
                }
              }
            });
          }
        }
      }

      // Brazil Weather Map data and functions
      const BRAZIL_STATES = {
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
      };

      const WEATHER_DATA = {
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
      };

      function getColorForValue(value: number, metric: string) {
        let normalized: number;
        if (metric === 'temperature') {
          normalized = Math.max(0, Math.min(1, (value - 10) / 25));
        } else if (metric === 'precipitation') {
          normalized = Math.max(0, Math.min(1, (value - 50) / 150));
        } else if (metric === 'humidity') {
          normalized = Math.max(0, Math.min(1, (value - 50) / 40));
        } else if (metric === 'wind') {
          normalized = Math.max(0, Math.min(1, value / 15));
        } else {
          normalized = 0;
        }

        if (normalized < 0.2) {
          return `hsl(200, 100%, ${70 - normalized * 20}%)`;
        } else if (normalized < 0.4) {
          return `hsl(180, 100%, ${70 - normalized * 20}%)`;
        } else if (normalized < 0.6) {
          return `hsl(60, 100%, ${70 - normalized * 20}%)`;
        } else if (normalized < 0.8) {
          return `hsl(30, 100%, ${70 - normalized * 20}%)`;
        } else {
          return `hsl(0, 100%, ${70 - normalized * 20}%)`;
        }
      }

      function shouldShowState(code: string) {
        const stateInfo = BRAZIL_STATES[code as keyof typeof BRAZIL_STATES];
        if (state.brazilMapRegionFilter !== 'all' && stateInfo.region !== state.brazilMapRegionFilter) {
          return false;
        }

        const data = WEATHER_DATA[code as keyof typeof WEATHER_DATA];
        const tempMinEl = document.getElementById('brazilTempMin') as HTMLInputElement;
        const tempMaxEl = document.getElementById('brazilTempMax') as HTMLInputElement;
        const precipMinEl = document.getElementById('brazilPrecipMin') as HTMLInputElement;
        const precipMaxEl = document.getElementById('brazilPrecipMax') as HTMLInputElement;

        if (!tempMinEl || !tempMaxEl || !precipMinEl || !precipMaxEl) return true;

        const tempMin = parseInt(tempMinEl.value);
        const tempMax = parseInt(tempMaxEl.value);
        const precipMin = parseInt(precipMinEl.value);
        const precipMax = parseInt(precipMaxEl.value);

        if (data.temp < tempMin || data.temp > tempMax) return false;
        if (data.precip < precipMin || data.precip > precipMax) return false;

        return true;
      }

      function renderBrazilHeatmap() {
        const grid = document.getElementById('brazilHeatmapGrid');
        if (!grid) return;

        grid.innerHTML = '';

        Object.entries(BRAZIL_STATES).forEach(([code, stateInfo]) => {
          if (!shouldShowState(code)) return;

          const data = WEATHER_DATA[code as keyof typeof WEATHER_DATA];
          const cell = document.createElement('div');
          cell.className = 'brazil-heatmap-cell';

          let value: number, unit: string;
          if (state.brazilMapViewMode === 'temperature') {
            value = data.temp;
            unit = '°C';
          } else if (state.brazilMapViewMode === 'precipitation') {
            value = data.precip;
            unit = 'mm';
          } else if (state.brazilMapViewMode === 'humidity') {
            value = data.humidity;
            unit = '%';
          } else if (state.brazilMapViewMode === 'wind') {
            value = data.wind;
            unit = 'km/h';
          } else {
            value = data.temp;
            unit = '°C';
          }

          const color = getColorForValue(value, state.brazilMapViewMode);
          cell.style.background = color;

          cell.innerHTML = `
            <div class="brazil-cell-code">${code}</div>
            <div class="brazil-cell-value">${value.toFixed(1)}${unit}</div>
            <div class="brazil-cell-label">${stateInfo.name}</div>
          `;

          grid.appendChild(cell);
        });

        updateBrazilStats();
      }

      function updateBrazilStats() {
        const visibleStates = Object.keys(BRAZIL_STATES).filter(code => shouldShowState(code));
        
        let avgTemp = 0, avgPrecip = 0, avgHumidity = 0, avgWind = 0;
        visibleStates.forEach(code => {
          const data = WEATHER_DATA[code as keyof typeof WEATHER_DATA];
          avgTemp += data.temp;
          avgPrecip += data.precip;
          avgHumidity += data.humidity;
          avgWind += data.wind;
        });

        avgTemp /= visibleStates.length || 1;
        avgPrecip /= visibleStates.length || 1;
        avgHumidity /= visibleStates.length || 1;
        avgWind /= visibleStates.length || 1;

        const statsPanel = document.getElementById('brazilStatsPanel');
        if (!statsPanel) return;

        statsPanel.innerHTML = `
          <div class="brazil-stat-card">
            <div class="brazil-stat-label">🌡️ Avg Temperature</div>
            <div class="brazil-stat-value">${avgTemp.toFixed(1)}°C</div>
          </div>
          <div class="brazil-stat-card">
            <div class="brazil-stat-label">🌧️ Avg Precipitation</div>
            <div class="brazil-stat-value">${avgPrecip.toFixed(0)}mm</div>
          </div>
          <div class="brazil-stat-card">
            <div class="brazil-stat-label">💧 Avg Humidity</div>
            <div class="brazil-stat-value">${avgHumidity.toFixed(0)}%</div>
          </div>
          <div class="brazil-stat-card">
            <div class="brazil-stat-label">📍 Visible States</div>
            <div class="brazil-stat-value">${visibleStates.length}/27</div>
          </div>
        `;
      }

      function initBrazilWeatherMap() {
        // Set up view mode buttons
        document.querySelectorAll('.brazil-view-mode-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const mode = (e.target as HTMLElement).dataset.mode;
            if (!mode) return;
            
            state.brazilMapViewMode = mode;
            document.querySelectorAll('.brazil-view-mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderBrazilHeatmap();
          });
        });

        // Set up region filter buttons
        document.querySelectorAll('.brazil-region-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const region = (e.target as HTMLElement).dataset.region;
            if (!region) return;
            
            state.brazilMapRegionFilter = region;
            document.querySelectorAll('.brazil-region-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderBrazilHeatmap();
          });
        });

        // Set up sliders
        ['brazilTempMin', 'brazilTempMax', 'brazilPrecipMin', 'brazilPrecipMax'].forEach(id => {
          const el = document.getElementById(id);
          if (el) {
            el.addEventListener('input', () => {
              renderBrazilHeatmap();
              updateBrazilTempDisplay();
            });
          }
        });

        renderBrazilHeatmap();
        updateBrazilTempDisplay();
      }

      function updateBrazilTempDisplay() {
        const tempMinEl = document.getElementById('brazilTempMin') as HTMLInputElement;
        const tempMaxEl = document.getElementById('brazilTempMax') as HTMLInputElement;
        const precipMinEl = document.getElementById('brazilPrecipMin') as HTMLInputElement;
        const precipMaxEl = document.getElementById('brazilPrecipMax') as HTMLInputElement;
        const tempDisplay = document.getElementById('brazilTempDisplay');
        const precipDisplay = document.getElementById('brazilPrecipDisplay');

        if (tempMinEl && tempMaxEl && tempDisplay) {
          tempDisplay.textContent = `${tempMinEl.value}°C - ${tempMaxEl.value}°C`;
        }
        if (precipMinEl && precipMaxEl && precipDisplay) {
          precipDisplay.textContent = `${precipMinEl.value}mm - ${precipMaxEl.value}mm`;
        }
      }

      function attachTabListeners() {
        document.querySelectorAll('.tab').forEach(tab => {
          tab.addEventListener('click', () => {
            const tabName = (tab as HTMLElement).dataset.tab;
            if (!tabName) return;
            
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            const contentEl = document.getElementById(`tab-${tabName}`);
            if (contentEl) contentEl.classList.add('active');
            state.activeTab = tabName;
            
            setTimeout(() => {
              if (charts[tabName]) charts[tabName].resize();
              if (tabName === 'brazil-map') {
                renderBrazilHeatmap();
              }
            }, 100);
          });
        });
      }

      // Initialize all components
      renderAlerts();
      renderCorrelationItems();
      renderStormBar();
      attachTabListeners();
      initCharts();
      initBrazilWeatherMap();

      setIsInitialized(true);
    };

    initPage();
  }, [isChartLoaded]);

  // Effect to check for Chart.js on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if Chart.js is already loaded
    if (typeof (window as any).Chart !== 'undefined') {
      setIsChartLoaded(true);
      return;
    }

    // Check for Chart.js with timeout
    let checkCount = 0;
    const maxChecks = 100; // 10 seconds max wait
    const checkChart = setInterval(() => {
      checkCount++;
      if (typeof (window as any).Chart !== 'undefined') {
        clearInterval(checkChart);
        setIsChartLoaded(true);
      } else if (checkCount >= maxChecks) {
        clearInterval(checkChart);
        console.warn('Chart.js failed to load after timeout');
        // Still initialize page without charts
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
      <div ref={containerRef} className="climate-features-container" style={{ display: isInitialized ? 'block' : 'none' }}>
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

          .climate-features-container {
            width: 100%;
            max-width: 100%;
            margin: 0;
            padding: 0;
            background: transparent;
            color: var(--color-text);
            min-height: auto;
          }

          .climate-header {
            margin-bottom: var(--space-24);
            border-bottom: 1px solid var(--color-border);
            padding-bottom: var(--space-16);
          }

          .climate-header h1 {
            margin: 0 0 var(--space-8) 0;
            font-size: 20px;
            font-weight: 600;
          }

          .climate-header p {
            margin: 0;
            color: var(--color-text-secondary);
            font-size: 15px;
          }

          .controls-bar {
            display: flex;
            gap: var(--space-12);
            margin-bottom: var(--space-16);
            align-items: center;
            flex-wrap: wrap;
          }

          .date-range {
            display: flex;
            gap: var(--space-12);
            align-items: center;
          }

          .date-range label {
            font-size: 15px;
            color: var(--color-text-secondary);
          }

          .date-input {
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            color: var(--color-text);
            padding: var(--space-8) var(--space-12);
            border-radius: var(--radius-base);
            font-size: 15px;
          }

          .card {
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            padding: var(--space-16);
            transition: all 0.3s;
            margin-bottom: var(--space-16);
          }

          .card:hover {
            border-color: var(--color-primary);
            box-shadow: 0 8px 24px rgba(32, 160, 132, 0.15);
          }

          .card-header {
            display: flex;
            align-items: center;
            gap: var(--space-12);
            margin-bottom: var(--space-12);
            padding-bottom: var(--space-12);
            border-bottom: 1px solid var(--color-border);
          }

          .card-icon {
            width: 28px;
            height: 28px;
            background: var(--color-secondary);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
          }

          .card-title {
            font-size: 18px;
            font-weight: 600;
            margin: 0;
            flex: 1;
          }

          .card-subtitle {
            font-size: 14px;
            color: var(--color-text-secondary);
            margin: 0;
          }

          .hero-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: var(--space-12);
          }

          .metric-badge {
            background: linear-gradient(135deg, rgba(32, 160, 132, 0.1), rgba(32, 160, 132, 0.05));
            border: 1px solid var(--color-primary);
            border-radius: var(--radius-lg);
            padding: var(--space-12);
            text-align: center;
          }

          .metric-label {
            font-size: 14px;
            color: var(--color-text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: var(--space-8);
          }

          .metric-value {
            font-size: 30px;
            font-weight: 700;
            color: var(--color-primary);
            margin-bottom: var(--space-4);
          }

          .metric-detail {
            font-size: 16px;
            color: var(--color-text-secondary);
          }

          .tabs {
            display: flex;
            gap: var(--space-8);
            border-bottom: 1px solid var(--color-border);
            margin-bottom: var(--space-16);
          }

          .tab {
            padding: var(--space-12) var(--space-16);
            cursor: pointer;
            font-size: 16px;
            color: var(--color-text-secondary);
            transition: all 0.2s;
            border-bottom: 2px solid transparent;
            position: relative;
            bottom: -1px;
          }

          .tab:hover {
            color: var(--color-primary);
          }

          .tab.active {
            color: var(--color-primary);
            border-bottom-color: var(--color-primary);
          }

          .tab-content {
            display: none;
          }

          .tab-content.active {
            display: block;
          }

          .chart-wrapper {
            position: relative;
            height: 250px;
            margin-bottom: var(--space-16);
          }

          .alert-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: var(--space-16);
          }

          .alert-card {
            border-radius: var(--radius-lg);
            padding: var(--space-16);
            border-left: 4px solid;
            transition: all 0.2s;
          }

          .alert-card.critical {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05));
            border-left-color: var(--color-error);
          }

          .alert-card.warning {
            background: linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(249, 115, 22, 0.05));
            border-left-color: var(--color-warning);
          }

          .alert-card.info {
            background: linear-gradient(135deg, rgba(32, 160, 132, 0.1), rgba(32, 160, 132, 0.05));
            border-left-color: var(--color-primary);
          }

          .alert-header {
            display: flex;
            align-items: center;
            gap: var(--space-12);
            margin-bottom: var(--space-8);
          }

          .alert-severity {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            flex-shrink: 0;
          }

          .alert-severity.critical {
            background: var(--color-error);
            box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
          }

          .alert-severity.warning {
            background: var(--color-warning);
            box-shadow: 0 0 8px rgba(249, 115, 22, 0.6);
          }

          .alert-severity.info {
            background: var(--color-primary);
            box-shadow: 0 0 8px rgba(32, 160, 132, 0.6);
          }

          .alert-title {
            font-weight: 600;
            font-size: 18px;
            color: var(--color-text);
            margin: 0;
          }

          .alert-date {
            font-size: 14px;
            color: var(--color-text-secondary);
            margin: 0 0 var(--space-8) 0;
          }

          .alert-impact {
            font-size: 16px;
            color: var(--color-text-secondary);
            margin: var(--space-8) 0;
            line-height: 1.5;
          }

          .alert-recommendation {
            background: var(--color-surface);
            border-left: 3px solid var(--color-primary);
            padding: var(--space-12);
            border-radius: 4px;
            margin-top: var(--space-12);
            font-size: 16px;
            color: var(--color-text-secondary);
            line-height: 1.5;
          }

          .storm-bar {
            display: flex;
            height: 40px;
            gap: 1px;
            margin-bottom: var(--space-12);
            border-radius: var(--radius-base);
            overflow: hidden;
          }

          .storm-segment {
            flex: 1;
            cursor: pointer;
            position: relative;
            transition: opacity 0.2s;
          }

          .storm-segment.low {
            background: rgba(16, 185, 129, 0.4);
          }

          .storm-segment.medium {
            background: rgba(249, 115, 22, 0.6);
          }

          .storm-segment.high {
            background: rgba(239, 68, 68, 0.8);
          }

          .storm-segment-tooltip {
            position: absolute;
            bottom: calc(100% + 8px);
            left: 50%;
            transform: translateX(-50%);
            background: var(--color-surface-alt);
            border: 2px solid var(--color-primary);
            border-radius: var(--radius-base);
            padding: var(--space-8);
            font-size: 14px;
            z-index: 10;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s;
            box-shadow: 0 8px 24px rgba(32, 160, 132, 0.3);
            white-space: nowrap;
          }

          .storm-segment:hover .storm-segment-tooltip {
            opacity: 1;
          }

          .correlation-items {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: var(--space-16);
            margin-top: var(--space-16);
          }

          .correlation-item {
            background: var(--color-surface-alt);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            padding: var(--space-16);
            text-align: center;
          }

          .correlation-factor {
            font-size: 15px;
            color: var(--color-text-secondary);
            text-transform: uppercase;
            margin-bottom: var(--space-8);
          }

          .correlation-impact {
            font-size: 24px;
            font-weight: 700;
            color: var(--color-primary);
            margin-bottom: var(--space-8);
          }

          .correlation-sla {
            font-size: 14px;
            color: var(--color-warning);
            padding: var(--space-8);
            background: rgba(249, 115, 22, 0.1);
            border-radius: 4px;
            margin-top: var(--space-8);
          }

          .checklist-sections {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: var(--space-16);
            margin-top: var(--space-16);
          }

          .checklist-section {
            background: var(--color-surface-alt);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            padding: var(--space-16);
          }

          .checklist-title {
            font-weight: 600;
            color: var(--color-primary);
            margin: 0 0 var(--space-12) 0;
            font-size: 18px;
          }

          .checklist-items {
            list-style: none;
            padding: 0;
            margin: 0;
          }

          .checklist-items li {
            padding: var(--space-8) 0;
            font-size: 16px;
            color: var(--color-text-secondary);
            display: flex;
            align-items: center;
            gap: var(--space-8);
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          }

          .checklist-items li:last-child {
            border-bottom: none;
          }

          .checklist-items li:before {
            content: "□";
            color: var(--color-primary);
            font-weight: bold;
            font-size: 18px;
          }

          .hint-box {
            font-size: 18px;
            color: var(--color-text-secondary);
            margin-top: var(--space-16);
            padding: var(--space-12);
            background: rgba(32, 160, 132, 0.05);
            border-radius: var(--radius-base);
            border-left: 3px solid var(--color-primary);
          }

          /* Brazil Weather Map Styles */
          .brazil-stats-panel {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: var(--space-16);
            margin-bottom: var(--space-24);
          }

          .brazil-stat-card {
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            padding: var(--space-16);
            text-align: center;
            transition: all 0.3s;
          }

          .brazil-stat-card:hover {
            border-color: var(--color-primary);
            box-shadow: 0 8px 24px rgba(32, 160, 132, 0.15);
          }

          .brazil-stat-label {
            font-size: 14px;
            color: var(--color-text-secondary);
            margin-bottom: var(--space-8);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 500;
          }

          .brazil-stat-value {
            font-size: 28px;
            color: var(--color-primary);
            font-weight: 700;
            text-shadow: 0 0 10px rgba(32, 160, 132, 0.3);
          }

          .brazil-controls-panel {
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            padding: var(--space-24);
            margin-bottom: var(--space-24);
          }

          .brazil-controls-title {
            font-size: 16px;
            color: var(--color-primary);
            margin-bottom: var(--space-16);
            font-weight: 600;
            letter-spacing: 1px;
          }

          .brazil-view-mode-selector {
            display: flex;
            gap: var(--space-12);
            margin-bottom: var(--space-24);
            flex-wrap: wrap;
          }

          .brazil-view-mode-btn, .brazil-region-btn {
            padding: var(--space-10) var(--space-16);
            border: 1px solid var(--color-border);
            background: var(--color-surface-alt);
            color: var(--color-text);
            border-radius: var(--radius-base);
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.3s;
            font-family: inherit;
          }

          .brazil-view-mode-btn:hover, .brazil-region-btn:hover {
            background: var(--color-surface);
            border-color: var(--color-primary);
            transform: translateY(-2px);
          }

          .brazil-view-mode-btn.active, .brazil-region-btn.active {
            background: var(--color-primary);
            color: white;
            border-color: var(--color-primary);
            box-shadow: 0 0 15px rgba(32, 160, 132, 0.4);
          }

          .brazil-controls-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: var(--space-20);
          }

          .brazil-filter-group {
            display: flex;
            flex-direction: column;
            gap: var(--space-8);
          }

          .brazil-filter-label {
            font-size: 13px;
            color: var(--color-text-secondary);
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .brazil-btn-group {
            display: flex;
            gap: var(--space-8);
            flex-wrap: wrap;
          }

          .brazil-slider-container {
            display: flex;
            gap: var(--space-12);
            align-items: center;
          }

          .brazil-slider-container input[type="range"] {
            flex: 1;
            height: 6px;
            border-radius: 3px;
            background: linear-gradient(90deg, #0066ff, #ff1744);
            outline: none;
            -webkit-appearance: none;
          }

          .brazil-slider-container input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: var(--color-primary);
            cursor: pointer;
            box-shadow: 0 0 10px rgba(32, 160, 132, 0.5);
          }

          .brazil-slider-container input[type="range"]::-moz-range-thumb {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: var(--color-primary);
            cursor: pointer;
            border: none;
            box-shadow: 0 0 10px rgba(32, 160, 132, 0.5);
          }

          .brazil-value-display {
            min-width: 100px;
            text-align: right;
            color: var(--color-primary);
            font-weight: 600;
            font-size: 14px;
          }

          .brazil-heatmap-container {
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-lg);
            padding: var(--space-24);
            margin-bottom: var(--space-24);
            position: relative;
            overflow: hidden;
          }

          .brazil-heatmap-container::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(32, 160, 132, 0.05) 0%, transparent 70%);
            pointer-events: none;
          }

          .brazil-heatmap-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
            gap: var(--space-16);
            position: relative;
            z-index: 1;
            margin-bottom: var(--space-24);
          }

          .brazil-heatmap-cell {
            aspect-ratio: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border-radius: var(--radius-base);
            cursor: pointer;
            transition: all 0.3s;
            border: 2px solid rgba(255, 255, 255, 0.2);
            position: relative;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
          }

          .brazil-heatmap-cell::before {
            content: '';
            position: absolute;
            inset: 0;
            background: inherit;
            filter: blur(8px);
            opacity: 0.6;
          }

          .brazil-heatmap-cell::after {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(
              to bottom,
              rgba(0, 0, 0, 0.1) 0%,
              rgba(0, 0, 0, 0.2) 50%,
              rgba(0, 0, 0, 0.3) 100%
            );
            pointer-events: none;
            z-index: 1;
          }

          .brazil-heatmap-cell:hover {
            transform: scale(1.08);
            border-color: var(--color-primary);
            box-shadow: 0 6px 25px rgba(32, 160, 132, 0.4);
            z-index: 10;
          }

          .brazil-cell-code {
            font-weight: 700;
            font-size: 24px;
            position: relative;
            z-index: 2;
            text-shadow: 
              0 0 8px rgba(0, 0, 0, 0.9),
              0 0 12px rgba(0, 0, 0, 0.7),
              0 2px 4px rgba(0, 0, 0, 0.8),
              0 1px 2px rgba(0, 0, 0, 0.9);
            color: #ffffff;
            filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.9));
            letter-spacing: 0.5px;
          }

          .brazil-cell-value {
            font-size: 16px;
            margin-top: 8px;
            position: relative;
            z-index: 2;
            color: #ffffff;
            font-weight: 700;
            text-shadow: 
              0 0 6px rgba(0, 0, 0, 0.9),
              0 0 10px rgba(0, 0, 0, 0.7),
              0 2px 4px rgba(0, 0, 0, 0.8),
              0 1px 2px rgba(0, 0, 0, 0.9);
            filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.9));
            letter-spacing: 0.3px;
          }

          .brazil-cell-label {
            font-size: 13px;
            margin-top: 6px;
            position: relative;
            z-index: 2;
            color: #ffffff;
            text-align: center;
            padding: 0 6px;
            font-weight: 600;
            text-shadow: 
              0 0 6px rgba(0, 0, 0, 0.9),
              0 0 8px rgba(0, 0, 0, 0.7),
              0 1px 3px rgba(0, 0, 0, 0.8),
              0 1px 2px rgba(0, 0, 0, 0.9);
            filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.9));
            line-height: 1.4;
          }

          .brazil-legend {
            display: flex;
            align-items: center;
            gap: var(--space-16);
            margin-top: var(--space-24);
            padding-top: var(--space-24);
            border-top: 1px solid var(--color-border);
            flex-wrap: wrap;
            position: relative;
            z-index: 1;
          }

          .brazil-legend-title {
            font-size: 13px;
            color: var(--color-text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
          }

          .brazil-legend-bar {
            display: flex;
            height: 30px;
            border-radius: var(--radius-base);
            flex: 1;
            min-width: 200px;
            background: linear-gradient(90deg, 
              #0066ff 0%,
              #00ccff 25%,
              #ffff00 50%,
              #ff8800 75%,
              #ff1744 100%);
            border: 1px solid var(--color-border);
            position: relative;
            overflow: hidden;
          }

          .brazil-legend-labels {
            display: flex;
            justify-content: space-between;
            gap: var(--space-10);
            flex: 0 0 auto;
            min-width: 150px;
          }

          .brazil-legend-label {
            font-size: 11px;
            color: var(--color-text-secondary);
            text-align: center;
            line-height: 1.4;
          }

          @media (max-width: 768px) {
            .hero-grid { grid-template-columns: 1fr; }
            .alert-cards { grid-template-columns: 1fr; }
            .correlation-items { grid-template-columns: 1fr; }
            .checklist-sections { grid-template-columns: 1fr; }
            .tabs { flex-wrap: wrap; }
            .brazil-stats-panel { grid-template-columns: 1fr; }
            .brazil-controls-grid { grid-template-columns: 1fr; }
            .brazil-heatmap-grid { grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); }
            .brazil-view-mode-selector { flex-direction: column; }
            .brazil-btn-group { flex-direction: column; }
            .brazil-cell-code { font-size: 20px; }
            .brazil-cell-value { font-size: 14px; }
            .brazil-cell-label { font-size: 11px; }
          }
        `}</style>

        <div className="climate-header">
          <h1>🌦️ Features Climáticas</h1>
          <p>Dados climáticos de Salvador/BA e impactos na operação</p>
        </div>

        <div className="controls-bar">
          <div className="date-range">
            <label>De:</label>
            <input type="date" id="dateFrom" className="date-input" defaultValue="2025-10-19" />
            <label>Até:</label>
            <input type="date" id="dateTo" className="date-input" defaultValue="2025-11-18" />
          </div>
        </div>

        {/* Hero Summary */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon">⚡</div>
            <div>
              <h3 className="card-title">Resumo Executivo</h3>
              <p className="card-subtitle">Próximos 30 dias - Condições climáticas e impactos operacionais</p>
            </div>
          </div>
          <div className="hero-grid">
            <div className="metric-badge">
              <div className="metric-label">Temperatura Média</div>
              <div className="metric-value">27°C</div>
              <div className="metric-detail">Sem variações extremas</div>
            </div>
            <div className="metric-badge">
              <div className="metric-label">Precipitação Total</div>
              <div className="metric-value">120mm</div>
              <div className="metric-detail">Semana chuvosa esperada</div>
            </div>
            <div className="metric-badge">
              <div className="metric-label">Nível de Risco</div>
              <div className="metric-value" style={{ color: 'var(--color-warning)' }}>MÉDIO</div>
              <div className="metric-detail">Período de vigilância</div>
            </div>
            <div className="metric-badge">
              <div className="metric-label">Umidade Média</div>
              <div className="metric-value">76%</div>
              <div className="metric-detail">Risco de corrosão elevado</div>
            </div>
          </div>
          <div className="hint-box">
            <strong>💡 Insight Executivo:</strong> Período caracterizado por semana chuvosa típica de Salvador. Umidade elevada aumenta risco de corrosão. Recomenda-se aumentar estoque de itens anticorrosivos em 25%.
          </div>
        </div>

        {/* Climate Metrics Tabs */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon">📊</div>
            <div>
              <h3 className="card-title">Métricas Climáticas Detalhadas</h3>
              <p className="card-subtitle">Temperatura, precipitação e riscos ao longo do período</p>
            </div>
          </div>

          <div className="tabs">
            <div className="tab active" data-tab="temperature">🌡️ Temperatura</div>
            <div className="tab" data-tab="precipitation">🌧️ Precipitação</div>
            <div className="tab" data-tab="stormrisk">⛈️ Risco de Tempestade</div>
            <div className="tab" data-tab="brazil-map">🗺️ Brazil Geo Weather Map</div>
          </div>

          <div className="tab-content active" id="tab-temperature">
            <div className="chart-wrapper">
              <canvas id="temperatureChart"></canvas>
            </div>
          </div>

          <div className="tab-content" id="tab-precipitation">
            <div className="chart-wrapper">
              <canvas id="precipitationChart"></canvas>
            </div>
            <div id="rainyWeekCount" style={{ display: 'none' }}>0</div>
          </div>

          <div className="tab-content" id="tab-stormrisk">
            <div style={{ marginBottom: 'var(--space-16)' }}>
              <div style={{ fontSize: '16px', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-12)', fontWeight: 600 }}>
                <strong>📈 Risco diário de tempestade (30 dias)</strong>
              </div>
              <div className="storm-bar" id="stormBar"></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-16)' }}>
              <div style={{ background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-16)', borderLeft: '4px solid var(--color-error)' }}>
                <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-8)' }}>🔴 RISCO ALTO</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-error)', marginBottom: 'var(--space-4)' }} id="highRiskCount">0</div>
                <div style={{ fontSize: '15px', color: 'var(--color-text)' }}>Dias com tempestade grave</div>
              </div>
              <div style={{ background: 'var(--color-surface-alt)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-16)', borderLeft: '4px solid var(--color-warning)' }}>
                <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-8)' }}>🟡 RISCO MÉDIO</div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-warning)', marginBottom: 'var(--space-4)' }} id="mediumRiskCount">0</div>
                <div style={{ fontSize: '15px', color: 'var(--color-text)' }}>Dias com chuva esperada</div>
              </div>
            </div>
          </div>

          <div className="tab-content" id="tab-brazil-map">
            <div className="brazil-stats-panel" id="brazilStatsPanel"></div>
            
            <div className="brazil-controls-panel">
              <div className="brazil-controls-title">⚙️ INTERACTIVE FILTERS</div>
              
              <div className="brazil-view-mode-selector">
                <button className="brazil-view-mode-btn active" data-mode="temperature">🌡️ Temperature</button>
                <button className="brazil-view-mode-btn" data-mode="precipitation">🌧️ Precipitation</button>
                <button className="brazil-view-mode-btn" data-mode="humidity">💧 Humidity</button>
                <button className="brazil-view-mode-btn" data-mode="wind">💨 Wind Speed</button>
              </div>
              
              <div className="brazil-controls-grid">
                <div className="brazil-filter-group">
                  <label className="brazil-filter-label">🌎 Region</label>
                  <div className="brazil-btn-group">
                    <button className="brazil-region-btn active" data-region="all">All Regions</button>
                    <button className="brazil-region-btn" data-region="North">North</button>
                    <button className="brazil-region-btn" data-region="Northeast">Northeast</button>
                    <button className="brazil-region-btn" data-region="Southeast">Southeast</button>
                    <button className="brazil-region-btn" data-region="South">South</button>
                    <button className="brazil-region-btn" data-region="Center-West">Center-West</button>
                  </div>
                </div>
                
                <div className="brazil-filter-group">
                  <label className="brazil-filter-label">🌡️ Temperature Range (°C)</label>
                  <div className="brazil-slider-container">
                    <input type="range" id="brazilTempMin" min="10" max="35" defaultValue="10" />
                    <input type="range" id="brazilTempMax" min="10" max="35" defaultValue="35" />
                    <div className="brazil-value-display" id="brazilTempDisplay">10°C - 35°C</div>
                  </div>
                </div>
                
                <div className="brazil-filter-group">
                  <label className="brazil-filter-label">💧 Precipitation Range (mm)</label>
                  <div className="brazil-slider-container">
                    <input type="range" id="brazilPrecipMin" min="50" max="200" defaultValue="50" />
                    <input type="range" id="brazilPrecipMax" min="50" max="200" defaultValue="200" />
                    <div className="brazil-value-display" id="brazilPrecipDisplay">50mm - 200mm</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="brazil-heatmap-container">
              <div className="brazil-heatmap-grid" id="brazilHeatmapGrid"></div>
              
              <div className="brazil-legend">
                <div className="brazil-legend-title">❄️ Color Scale:</div>
                <div className="brazil-legend-bar"></div>
                <div className="brazil-legend-labels">
                  <div className="brazil-legend-label">❄️ Cold<br/>15°C</div>
                  <div className="brazil-legend-label">🧊 Cool<br/>20°C</div>
                  <div className="brazil-legend-label">☀️ Warm<br/>25°C</div>
                  <div className="brazil-legend-label">🔥 Hot<br/>30°C</div>
                  <div className="brazil-legend-label">🌡️ Very Hot<br/>35°C</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Climate Alerts */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon">🚨</div>
            <div>
              <h3 className="card-title">Alertas Climáticos Ativos</h3>
              <p className="card-subtitle">Críticos e avisos para próximas 72h</p>
            </div>
          </div>
          <div className="alert-cards" id="alertsContainer"></div>
        </div>

        {/* Correlation Insights */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon">🔗</div>
            <div>
              <h3 className="card-title">Correlações: Clima → Demanda → Estoque</h3>
              <p className="card-subtitle">Descubra padrões e otimize suas decisões de estoque</p>
            </div>
          </div>
          <div className="chart-wrapper" style={{ height: '350px' }}>
            <canvas id="brushableScatterChart"></canvas>
          </div>
          <div className="correlation-items" id="correlationItems"></div>
        </div>

        {/* Operational Checklist */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon">✅</div>
            <div>
              <h3 className="card-title">Checklist Operacional</h3>
              <p className="card-subtitle">Ações recomendadas por área funcional baseadas em clima</p>
            </div>
          </div>
          <div className="checklist-sections">
            <div className="checklist-section">
              <h4 className="checklist-title">📦 Procurement</h4>
              <ul className="checklist-items">
                <li>Aumentar conectores em 35-40% para semanas com chuva prevista</li>
                <li>Aumentar anticorrosivos em 25% para períodos com umidade &gt;75%</li>
                <li>Revisar lead times: possível atraso em entrega com tempestades</li>
                <li>Validar fornecedores de backup para períodos de risco ALTO</li>
              </ul>
            </div>
            <div className="checklist-section">
              <h4 className="checklist-title">👥 Field Operations</h4>
              <ul className="checklist-items">
                <li>Suspender trabalhos em altura em dias de risco ALTO</li>
                <li>Equipar equipes com proteção anticorrosiva extra em semanas chuvosas</li>
                <li>Agendar manutenção preventiva 48h antes de tempestades</li>
                <li>Revisar transporte/logística em dias com precipitação &gt;60mm</li>
              </ul>
            </div>
            <div className="checklist-section">
              <h4 className="checklist-title">🚚 Logistics &amp; SLA</h4>
              <ul className="checklist-items">
                <li>Antecipar expedições em 24-48h antes de tempestade</li>
                <li>Comunicar clientes sobre possíveis atrasos em períodos de risco ALTO</li>
                <li>Revisar SLA buffers: adicionar 12h em semanas de risco MÉDIO</li>
                <li>Monitorar em tempo real durante alertas CRÍTICOS</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
