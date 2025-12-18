'use client';

import React from 'react';

interface WeatherControlsProps {
  enabled: boolean;
  metric: 'temperature' | 'precipitation' | 'wind' | 'humidity';
  timeRange: 'current' | '24h' | '7d' | '30d';
  showMapLayer: boolean;
  showForecastAnimation: boolean;
  showParticleWind?: boolean;
  showRainEffects?: boolean;
  showTemporalPlayback?: boolean;
  // New props for enhanced features
  granularity?: 'auto' | 'biome' | 'state' | 'city' | 'tower' | 'grid';
  showBiomeLayer?: boolean;
  showCityLayer?: boolean;
  showGridLayer?: boolean;
  showGradientLayer?: boolean;
  showPredictiveForecast?: boolean;
  onToggle: (enabled: boolean) => void;
  onMetricChange: (metric: 'temperature' | 'precipitation' | 'wind' | 'humidity') => void;
  onTimeRangeChange: (range: 'current' | '24h' | '7d' | '30d') => void;
  onMapLayerToggle: (enabled: boolean) => void;
  onForecastAnimationToggle: (enabled: boolean) => void;
  onParticleWindToggle?: (enabled: boolean) => void;
  onRainEffectsToggle?: (enabled: boolean) => void;
  onTemporalPlaybackToggle?: (enabled: boolean) => void;
  // New handlers
  onGranularityChange?: (granularity: 'auto' | 'biome' | 'state' | 'city' | 'tower' | 'grid') => void;
  onBiomeLayerToggle?: (enabled: boolean) => void;
  onCityLayerToggle?: (enabled: boolean) => void;
  onGridLayerToggle?: (enabled: boolean) => void;
  onGradientLayerToggle?: (enabled: boolean) => void;
  onPredictiveForecastToggle?: (enabled: boolean) => void;
}

export default function WeatherControls({
  enabled,
  metric,
  timeRange,
  showMapLayer,
  showForecastAnimation,
  showParticleWind = false,
  showRainEffects = false,
  showTemporalPlayback = false,
  granularity = 'auto',
  showBiomeLayer = false,
  showCityLayer = false,
  showGridLayer = false,
  showGradientLayer = false,
  showPredictiveForecast = false,
  onToggle,
  onMetricChange,
  onTimeRangeChange,
  onMapLayerToggle,
  onForecastAnimationToggle,
  onParticleWindToggle,
  onRainEffectsToggle,
  onTemporalPlaybackToggle,
  onGranularityChange,
  onBiomeLayerToggle,
  onCityLayerToggle,
  onGridLayerToggle,
  onGradientLayerToggle,
  onPredictiveForecastToggle,
}: WeatherControlsProps) {
  return (
    <div className="bg-brand-navy/90 backdrop-blur-xl border border-brand-cyan/40 rounded-lg p-4 text-xs z-[500] shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-brand-cyan">Weather Overlay</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onToggle(e.target.checked)}
            className="accent-brand-cyan cursor-pointer"
          />
          <span className="text-brand-lightest-slate">Enable</span>
        </label>
      </div>

      {enabled && (
        <>
          <div className="mb-4">
            <label className="block text-brand-slate mb-2">Weather Metric</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onMetricChange('temperature')}
                className={`px-3 py-2 rounded transition ${
                  metric === 'temperature'
                    ? 'bg-brand-cyan text-white'
                    : 'bg-brand-light-navy/50 text-brand-lightest-slate hover:bg-brand-light-navy'
                }`}
              >
                Temperature
              </button>
              <button
                onClick={() => onMetricChange('precipitation')}
                className={`px-3 py-2 rounded transition ${
                  metric === 'precipitation'
                    ? 'bg-brand-cyan text-white'
                    : 'bg-brand-light-navy/50 text-brand-lightest-slate hover:bg-brand-light-navy'
                }`}
              >
                Precipitation
              </button>
              <button
                onClick={() => onMetricChange('wind')}
                className={`px-3 py-2 rounded transition ${
                  metric === 'wind'
                    ? 'bg-brand-cyan text-white'
                    : 'bg-brand-light-navy/50 text-brand-lightest-slate hover:bg-brand-light-navy'
                }`}
              >
                Wind
              </button>
              <button
                onClick={() => onMetricChange('humidity')}
                className={`px-3 py-2 rounded transition ${
                  metric === 'humidity'
                    ? 'bg-brand-cyan text-white'
                    : 'bg-brand-light-navy/50 text-brand-lightest-slate hover:bg-brand-light-navy'
                }`}
              >
                Humidity
              </button>
            </div>
          </div>

          <div>
            <label className="block text-brand-slate mb-2">Time Range</label>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => onTimeRangeChange('current')}
                className={`px-3 py-2 rounded text-left transition ${
                  timeRange === 'current'
                    ? 'bg-brand-cyan text-white'
                    : 'bg-brand-light-navy/50 text-brand-lightest-slate hover:bg-brand-light-navy'
                }`}
              >
                Current
              </button>
              <button
                onClick={() => onTimeRangeChange('24h')}
                className={`px-3 py-2 rounded text-left transition ${
                  timeRange === '24h'
                    ? 'bg-brand-cyan text-white'
                    : 'bg-brand-light-navy/50 text-brand-lightest-slate hover:bg-brand-light-navy'
                }`}
              >
                Last 24 Hours
              </button>
              <button
                onClick={() => onTimeRangeChange('7d')}
                className={`px-3 py-2 rounded text-left transition ${
                  timeRange === '7d'
                    ? 'bg-brand-cyan text-white'
                    : 'bg-brand-light-navy/50 text-brand-lightest-slate hover:bg-brand-light-navy'
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => onTimeRangeChange('30d')}
                className={`px-3 py-2 rounded text-left transition ${
                  timeRange === '30d'
                    ? 'bg-brand-cyan text-white'
                    : 'bg-brand-light-navy/50 text-brand-lightest-slate hover:bg-brand-light-navy'
                }`}
              >
                Last 30 Days
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-brand-cyan/20">
            <div className="text-brand-slate mb-2">Legend</div>
            <div className="space-y-1 text-xs">
              {metric === 'temperature' && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
                    <span className="text-brand-lightest-slate">&lt; 15°C (Cold)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
                    <span className="text-brand-lightest-slate">15-30°C (Normal)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#f97316]"></div>
                    <span className="text-brand-lightest-slate">30-35°C (Hot)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
                    <span className="text-brand-lightest-slate">&gt; 35°C (Extreme)</span>
                  </div>
                </>
              )}
              {metric === 'precipitation' && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#60a5fa]"></div>
                    <span className="text-brand-lightest-slate">0-20mm (Light)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
                    <span className="text-brand-lightest-slate">20-50mm (Moderate)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#1e40af]"></div>
                    <span className="text-brand-lightest-slate">&gt; 50mm (Heavy)</span>
                  </div>
                </>
              )}
              {metric === 'wind' && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
                    <span className="text-brand-lightest-slate">&lt; 30 km/h (Normal)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#f97316]"></div>
                    <span className="text-brand-lightest-slate">30-50 km/h (Moderate)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#dc2626]"></div>
                    <span className="text-brand-lightest-slate">&gt; 50 km/h (Strong)</span>
                  </div>
                </>
              )}
              {metric === 'humidity' && (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
                    <span className="text-brand-lightest-slate">&lt; 60% (Low)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
                    <span className="text-brand-lightest-slate">60-80% (Moderate)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#1e40af]"></div>
                    <span className="text-brand-lightest-slate">&gt; 80% (High)</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Map Layer Toggle */}
          <div className="mt-4 pt-4 border-t border-brand-cyan/20">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-brand-lightest-slate">Weather Map Layer</span>
              <input
                type="checkbox"
                checked={showMapLayer}
                onChange={(e) => onMapLayerToggle(e.target.checked)}
                className="accent-brand-cyan cursor-pointer"
              />
            </label>
            <p className="text-brand-slate text-xs mt-1">
              Overlay weather map tiles on map
            </p>
          </div>

          {/* Forecast Animation Toggle */}
          <div className="mt-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-brand-lightest-slate">Forecast Animation</span>
              <input
                type="checkbox"
                checked={showForecastAnimation}
                onChange={(e) => onForecastAnimationToggle(e.target.checked)}
                className="accent-brand-cyan cursor-pointer"
              />
            </label>
            <p className="text-brand-slate text-xs mt-1">
              Animate hourly forecast on map
            </p>
          </div>

          {/* Particle Wind Animation Toggle */}
          {onParticleWindToggle && (
            <div className="mt-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-brand-lightest-slate">💨 Particle Wind</span>
                <input
                  type="checkbox"
                  checked={showParticleWind}
                  onChange={(e) => onParticleWindToggle(e.target.checked)}
                  className="accent-brand-cyan cursor-pointer"
                />
              </label>
              <p className="text-brand-slate text-xs mt-1">
                Visualize wind patterns with particles
              </p>
            </div>
          )}

          {/* Rain Effects Animation Toggle */}
          {onRainEffectsToggle && (
            <div className="mt-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-brand-lightest-slate">🌧️ Rain Effects</span>
                <input
                  type="checkbox"
                  checked={showRainEffects}
                  onChange={(e) => onRainEffectsToggle(e.target.checked)}
                  className="accent-brand-cyan cursor-pointer"
                />
              </label>
              <p className="text-brand-slate text-xs mt-1">
                Animated rain particles on map
              </p>
            </div>
          )}

          {/* Temporal Playback Toggle */}
          {onTemporalPlaybackToggle && (
            <div className="mt-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-brand-lightest-slate">⏱️ Temporal Playback</span>
                <input
                  type="checkbox"
                  checked={showTemporalPlayback}
                  onChange={(e) => onTemporalPlaybackToggle(e.target.checked)}
                  className="accent-brand-cyan cursor-pointer"
                />
              </label>
              <p className="text-brand-slate text-xs mt-1">
                Time-lapse historical climate data
              </p>
            </div>
          )}

          {/* Data Granularity Section */}
          {onGranularityChange && (
            <div className="mt-4 pt-4 border-t border-brand-cyan/20">
              <label className="block text-brand-slate mb-2 font-semibold text-xs uppercase">Data Granularity</label>
              <select 
                value={granularity}
                onChange={(e) => onGranularityChange(e.target.value as any)}
                className="w-full px-3 py-2 bg-brand-light-navy/50 border border-brand-cyan/20 rounded-md text-sm text-brand-lightest-slate focus:outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all cursor-pointer"
              >
                <option value="auto">Auto (zoom-based)</option>
                <option value="biome">🌿 Biome Regions</option>
                <option value="state">🗺️ State Level</option>
                <option value="city">🏙️ City/Municipality</option>
                <option value="tower">🗼 Tower Locations</option>
                <option value="grid">⬜ Grid Cells (50km)</option>
              </select>
              <p className="text-brand-slate text-xs mt-1">
                Control data detail level
              </p>
            </div>
          )}

          {/* Additional Layers Section */}
          {(onBiomeLayerToggle || onCityLayerToggle || onGridLayerToggle || onGradientLayerToggle) && (
            <div className="mt-4 pt-4 border-t border-brand-cyan/20">
              <label className="block text-brand-slate mb-2 font-semibold text-xs uppercase">Additional Layers</label>
              
              {onBiomeLayerToggle && (
                <div className="mb-2">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-brand-lightest-slate text-sm">🌿 Biome Boundaries</span>
                    <input
                      type="checkbox"
                      checked={showBiomeLayer}
                      onChange={(e) => onBiomeLayerToggle(e.target.checked)}
                      className="accent-brand-cyan cursor-pointer"
                    />
                  </label>
                  <p className="text-brand-slate text-xs mt-0.5 ml-5">
                    Show ecological regions
                  </p>
                </div>
              )}

              {onCityLayerToggle && (
                <div className="mb-2">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-brand-lightest-slate text-sm">🏙️ City Weather Points</span>
                    <input
                      type="checkbox"
                      checked={showCityLayer}
                      onChange={(e) => onCityLayerToggle(e.target.checked)}
                      className="accent-brand-cyan cursor-pointer"
                    />
                  </label>
                  <p className="text-brand-slate text-xs mt-0.5 ml-5">
                    Urban climate data
                  </p>
                </div>
              )}

              {onGridLayerToggle && (
                <div className="mb-2">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-brand-lightest-slate text-sm">⬜ Interpolated Grid</span>
                    <input
                      type="checkbox"
                      checked={showGridLayer}
                      onChange={(e) => onGridLayerToggle(e.target.checked)}
                      className="accent-brand-cyan cursor-pointer"
                    />
                  </label>
                  <p className="text-brand-slate text-xs mt-0.5 ml-5">
                    50km grid cells with IDW
                  </p>
                </div>
              )}

              {onGradientLayerToggle && (
                <div className="mb-2">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-brand-lightest-slate text-sm">🎨 Gradient Overlay</span>
                    <input
                      type="checkbox"
                      checked={showGradientLayer}
                      onChange={(e) => onGradientLayerToggle(e.target.checked)}
                      className="accent-brand-cyan cursor-pointer"
                    />
                  </label>
                  <p className="text-brand-slate text-xs mt-0.5 ml-5">
                    Smooth color transitions
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Predictive Forecast Toggle */}
          {onPredictiveForecastToggle && (
            <div className="mt-4 pt-4 border-t border-brand-cyan/20">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-brand-lightest-slate">📈 Predictive Forecast (3-7-14d)</span>
                <input
                  type="checkbox"
                  checked={showPredictiveForecast}
                  onChange={(e) => onPredictiveForecastToggle(e.target.checked)}
                  className="accent-brand-cyan cursor-pointer"
                />
              </label>
              <p className="text-brand-slate text-xs mt-1">
                Multi-day forecast visualization
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

