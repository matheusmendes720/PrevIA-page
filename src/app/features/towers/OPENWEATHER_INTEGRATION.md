# OpenWeatherMap API Integration

## Overview

Integrated OpenWeatherMap API for real-time weather forecasting and live animations on the tower map visualization.

## API Key
- **Key**: `941ae7a1a0e249c20b4926388c6758d8`
- **Provider**: [OpenWeatherMap](https://openweathermap.org/api)
- **Free Tier**: 1,000 API calls per day

## Features Implemented

### 1. Real-Time Weather Data
- Current weather conditions for each tower location
- Temperature, humidity, wind speed/direction, pressure
- Weather conditions and icons
- Visibility and UV index

### 2. Hourly Forecast
- 48-hour hourly forecast
- Weather conditions for each hour
- Precipitation predictions
- Temperature trends

### 3. Daily Forecast
- 8-day daily forecast (requires One Call API 3.0)
- Fallback to 5-day forecast for free tier
- Daily aggregated weather data

### 4. Weather Map Layers
- Temperature maps
- Precipitation maps
- Wind maps
- Cloud coverage maps
- Pressure maps

### 5. Forecast Animation
- Live animation of hourly forecasts
- Play/pause controls
- Step-by-step forecast progression
- Visual indicators for weather conditions

## Components

### `weatherService.ts`
Enhanced with OpenWeatherMap API integration:
- `getRealtimeWeather()` - Current weather data
- `getHourlyForecast()` - 48-hour hourly forecast
- `getDailyForecast()` - 8-day daily forecast

### `WeatherForecastAnimation.tsx`
New component for animated forecast visualization:
- Loads hourly forecasts for sampled towers
- Animates through forecast steps
- Shows weather conditions, temperature, precipitation
- Play/pause/reset controls
- Progress indicator

### `WeatherMapLayer.tsx`
New component for weather map tile overlay:
- Integrates OpenWeatherMap weather map tiles
- Supports multiple layer types (temperature, precipitation, wind, clouds, pressure)
- Adjustable opacity
- Real-time weather map visualization

### `WeatherLayer.tsx`
Enhanced with OpenWeatherMap weather icons:
- Displays weather condition icons
- Shows current weather conditions
- Real-time weather updates

### `WeatherControls.tsx`
Enhanced with new controls:
- Weather map layer toggle
- Forecast animation toggle
- Time range selection
- Metric selection

## API Endpoints Used

### Current Weather
```
GET https://api.openweathermap.org/data/2.5/weather
?lat={lat}&lon={lng}&appid={API_KEY}&units=metric&lang=pt_br
```

### Hourly Forecast (5-day)
```
GET https://api.openweathermap.org/data/2.5/forecast
?lat={lat}&lon={lng}&appid={API_KEY}&units=metric&lang=pt_br&cnt=48
```

### Daily Forecast (One Call API 3.0)
```
GET https://api.openweathermap.org/data/3.0/onecall
?lat={lat}&lon={lng}&appid={API_KEY}&units=metric&lang=pt_br
&exclude=current,minutely,hourly,alerts
```

### Weather Maps
```
https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={API_KEY}
```

## Usage

### Enable Weather Layer
```tsx
<WeatherLayer
  map={map}
  towers={towers}
  enabled={weatherEnabled}
  metric={selectedMetric}
/>
```

### Enable Forecast Animation
```tsx
<WeatherForecastAnimation
  map={map}
  towers={towers}
  enabled={animationEnabled}
  animationSpeed={2000} // milliseconds per step
/>
```

### Enable Weather Map Layer
```tsx
<WeatherMapLayer
  map={map}
  enabled={mapLayerEnabled}
  layerType="temperature" // or precipitation, wind, clouds, pressure
  opacity={0.6}
/>
```

## Rate Limiting

- **Free Tier**: 1,000 calls/day
- **Caching**: 5-minute TTL for current weather
- **Sampling**: Only loads weather for sampled towers (every 10th-20th tower)
- **Batching**: Forecasts loaded in parallel with Promise.all

## Weather Icons

OpenWeatherMap provides weather icons via:
```
https://openweathermap.org/img/wn/{icon}@2x.png
```

Icons are automatically displayed on weather markers based on current conditions.

## Future Enhancements

1. **One Call API 3.0**: Upgrade to get 8-day forecasts and more features
2. **Weather Alerts**: Integrate national weather alerts
3. **Historical Data**: Add historical weather data visualization
4. **Custom Animations**: More sophisticated animation effects
5. **Weather Stations**: Integrate personal weather station data

## References

- [OpenWeatherMap API Documentation](https://openweathermap.org/api)
- [One Call API 3.0](https://openweathermap.org/api/one-call-3)
- [Weather Maps](https://openweathermap.org/api/weathermaps)

