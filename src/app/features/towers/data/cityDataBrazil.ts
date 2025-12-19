/**
 * Brazilian Cities Data
 * Top 100+ cities with coordinates and climate patterns
 * Source: IBGE + Climate data
 */

export interface CityData {
  id: string;
  name: string;
  state: string;
  stateName: string;
  lat: number;
  lng: number;
  population: number;
  elevation: number; // meters
  biome: string;
  climate: {
    avgTemp: number; // °C
    avgRain: number; // mm/year
    humidity: number; // %
  };
  urbanHeatIslandEffect: number; // °C addition
}

export const BRAZILIAN_CITIES: CityData[] = [
  // Southeast Region
  { id: 'sao-paulo', name: 'São Paulo', state: 'SP', stateName: 'São Paulo', lat: -23.5505, lng: -46.6333, population: 12325232, elevation: 760, biome: 'atlanticForest', climate: { avgTemp: 19.5, avgRain: 1454, humidity: 77 }, urbanHeatIslandEffect: 3.5 },
  { id: 'rio-janeiro', name: 'Rio de Janeiro', state: 'RJ', stateName: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729, population: 6748000, elevation: 2, biome: 'atlanticForest', climate: { avgTemp: 23.7, avgRain: 1173, humidity: 80 }, urbanHeatIslandEffect: 2.8 },
  { id: 'belo-horizonte', name: 'Belo Horizonte', state: 'MG', stateName: 'Minas Gerais', lat: -19.9167, lng: -43.9345, population: 2521564, elevation: 852, biome: 'atlanticForest', climate: { avgTemp: 21.1, avgRain: 1491, humidity: 74 }, urbanHeatIslandEffect: 2.2 },
  { id: 'brasilia', name: 'Brasília', state: 'DF', stateName: 'Distrito Federal', lat: -15.7942, lng: -47.8822, population: 3055149, elevation: 1172, biome: 'cerrado', climate: { avgTemp: 21.2, avgRain: 1478, humidity: 68 }, urbanHeatIslandEffect: 1.8 },
  { id: 'vitoria', name: 'Vitória', state: 'ES', stateName: 'Espírito Santo', lat: -20.3155, lng: -40.3128, population: 365855, elevation: 3, biome: 'atlanticForest', climate: { avgTemp: 24.2, avgRain: 1200, humidity: 79 }, urbanHeatIslandEffect: 1.5 },
  
  // South Region
  { id: 'curitiba', name: 'Curitiba', state: 'PR', stateName: 'Paraná', lat: -25.4284, lng: -49.2733, population: 1948626, elevation: 934, biome: 'atlanticForest', climate: { avgTemp: 17.5, avgRain: 1419, humidity: 81 }, urbanHeatIslandEffect: 1.9 },
  { id: 'porto-alegre', name: 'Porto Alegre', state: 'RS', stateName: 'Rio Grande do Sul', lat: -30.0346, lng: -51.2177, population: 1488252, elevation: 10, biome: 'pampas', climate: { avgTemp: 19.5, avgRain: 1345, humidity: 76 }, urbanHeatIslandEffect: 2.1 },
  { id: 'florianopolis', name: 'Florianópolis', state: 'SC', stateName: 'Santa Catarina', lat: -27.5954, lng: -48.5480, population: 508826, elevation: 3, biome: 'atlanticForest', climate: { avgTemp: 20.5, avgRain: 1532, humidity: 82 }, urbanHeatIslandEffect: 1.3 },
  
  // Northeast Region
  { id: 'salvador', name: 'Salvador', state: 'BA', stateName: 'Bahia', lat: -12.9714, lng: -38.5014, population: 2886698, elevation: 8, biome: 'atlanticForest', climate: { avgTemp: 25.9, avgRain: 1958, humidity: 80 }, urbanHeatIslandEffect: 2.4 },
  { id: 'fortaleza', name: 'Fortaleza', state: 'CE', stateName: 'Ceará', lat: -3.7319, lng: -38.5267, population: 2686612, elevation: 16, biome: 'caatinga', climate: { avgTemp: 26.6, avgRain: 1338, humidity: 78 }, urbanHeatIslandEffect: 2.6 },
  { id: 'recife', name: 'Recife', state: 'PE', stateName: 'Pernambuco', lat: -8.0476, lng: -34.8770, population: 1653461, elevation: 4, biome: 'atlanticForest', climate: { avgTemp: 25.8, avgRain: 2254, humidity: 82 }, urbanHeatIslandEffect: 2.3 },
  { id: 'natal', name: 'Natal', state: 'RN', stateName: 'Rio Grande do Norte', lat: -5.7945, lng: -35.2110, population: 890480, elevation: 30, biome: 'caatinga', climate: { avgTemp: 27.0, avgRain: 1545, humidity: 77 }, urbanHeatIslandEffect: 1.8 },
  { id: 'maceio', name: 'Maceió', state: 'AL', stateName: 'Alagoas', lat: -9.6658, lng: -35.7350, population: 1025360, elevation: 7, biome: 'atlanticForest', climate: { avgTemp: 25.4, avgRain: 1792, humidity: 79 }, urbanHeatIslandEffect: 1.7 },
  { id: 'aracaju', name: 'Aracaju', state: 'SE', stateName: 'Sergipe', lat: -10.9091, lng: -37.0677, population: 657013, elevation: 5, biome: 'atlanticForest', climate: { avgTemp: 26.1, avgRain: 1544, humidity: 80 }, urbanHeatIslandEffect: 1.6 },
  { id: 'joao-pessoa', name: 'João Pessoa', state: 'PB', stateName: 'Paraíba', lat: -7.1195, lng: -34.8450, population: 817511, elevation: 37, biome: 'atlanticForest', climate: { avgTemp: 26.2, avgRain: 1712, humidity: 79 }, urbanHeatIslandEffect: 1.5 },
  { id: 'teresina', name: 'Teresina', state: 'PI', stateName: 'Piauí', lat: -5.0892, lng: -42.8016, population: 868075, elevation: 72, biome: 'caatinga', climate: { avgTemp: 28.1, avgRain: 1219, humidity: 69 }, urbanHeatIslandEffect: 2.2 },
  { id: 'sao-luis', name: 'São Luís', state: 'MA', stateName: 'Maranhão', lat: -2.5297, lng: -44.3028, population: 1101884, elevation: 4, biome: 'amazon', climate: { avgTemp: 27.0, avgRain: 2098, humidity: 83 }, urbanHeatIslandEffect: 1.9 },
  
  // North Region
  { id: 'manaus', name: 'Manaus', state: 'AM', stateName: 'Amazonas', lat: -3.1190, lng: -60.0217, population: 2219580, elevation: 92, biome: 'amazon', climate: { avgTemp: 27.6, avgRain: 2307, humidity: 84 }, urbanHeatIslandEffect: 2.5 },
  { id: 'belem', name: 'Belém', state: 'PA', stateName: 'Pará', lat: -1.4558, lng: -48.5044, population: 1499641, elevation: 10, biome: 'amazon', climate: { avgTemp: 26.7, avgRain: 2892, humidity: 86 }, urbanHeatIslandEffect: 2.0 },
  { id: 'porto-velho', name: 'Porto Velho', state: 'RO', stateName: 'Rondônia', lat: -8.7619, lng: -63.9039, population: 529544, elevation: 87, biome: 'amazon', climate: { avgTemp: 26.1, avgRain: 2233, humidity: 82 }, urbanHeatIslandEffect: 1.4 },
  { id: 'rio-branco', name: 'Rio Branco', state: 'AC', stateName: 'Acre', lat: -9.9747, lng: -67.8248, population: 413418, elevation: 153, biome: 'amazon', climate: { avgTemp: 26.2, avgRain: 2022, humidity: 83 }, urbanHeatIslandEffect: 1.2 },
  { id: 'macapa', name: 'Macapá', state: 'AP', stateName: 'Amapá', lat: 0.0349, lng: -51.0694, population: 512902, elevation: 16, biome: 'amazon', climate: { avgTemp: 27.3, avgRain: 2274, humidity: 85 }, urbanHeatIslandEffect: 1.3 },
  { id: 'boa-vista', name: 'Boa Vista', state: 'RR', stateName: 'Roraima', lat: 2.8235, lng: -60.6758, population: 419652, elevation: 85, biome: 'amazon', climate: { avgTemp: 27.8, avgRain: 1664, humidity: 76 }, urbanHeatIslandEffect: 1.4 },
  { id: 'palmas', name: 'Palmas', state: 'TO', stateName: 'Tocantins', lat: -10.1842, lng: -48.3336, population: 306296, elevation: 230, biome: 'cerrado', climate: { avgTemp: 26.4, avgRain: 1643, humidity: 73 }, urbanHeatIslandEffect: 1.6 },
  
  // Center-West Region
  { id: 'goiania', name: 'Goiânia', state: 'GO', stateName: 'Goiás', lat: -16.6869, lng: -49.2648, population: 1536097, elevation: 749, biome: 'cerrado', climate: { avgTemp: 23.2, avgRain: 1487, humidity: 71 }, urbanHeatIslandEffect: 2.0 },
  { id: 'campo-grande', name: 'Campo Grande', state: 'MS', stateName: 'Mato Grosso do Sul', lat: -20.4697, lng: -54.6201, population: 906092, elevation: 592, biome: 'cerrado', climate: { avgTemp: 23.5, avgRain: 1533, humidity: 72 }, urbanHeatIslandEffect: 1.8 },
  { id: 'cuiaba', name: 'Cuiabá', state: 'MT', stateName: 'Mato Grosso', lat: -15.6014, lng: -56.0979, population: 618124, elevation: 165, biome: 'cerrado', climate: { avgTemp: 26.1, avgRain: 1469, humidity: 74 }, urbanHeatIslandEffect: 1.9 },
  
  // Additional Major Cities
  { id: 'campinas', name: 'Campinas', state: 'SP', stateName: 'São Paulo', lat: -22.9099, lng: -47.0626, population: 1213792, elevation: 680, biome: 'atlanticForest', climate: { avgTemp: 20.7, avgRain: 1425, humidity: 75 }, urbanHeatIslandEffect: 2.0 },
  { id: 'guarulhos', name: 'Guarulhos', state: 'SP', stateName: 'São Paulo', lat: -23.4624, lng: -46.5339, population: 1392121, elevation: 760, biome: 'atlanticForest', climate: { avgTemp: 19.2, avgRain: 1448, humidity: 78 }, urbanHeatIslandEffect: 2.3 },
  { id: 'sao-goncalo', name: 'São Gonçalo', state: 'RJ', stateName: 'Rio de Janeiro', lat: -22.8268, lng: -43.0534, population: 1091737, elevation: 19, biome: 'atlanticForest', climate: { avgTemp: 23.5, avgRain: 1180, humidity: 81 }, urbanHeatIslandEffect: 1.8 },
  { id: 'uberlandia', name: 'Uberlândia', state: 'MG', stateName: 'Minas Gerais', lat: -18.9146, lng: -48.2754, population: 699097, elevation: 863, biome: 'cerrado', climate: { avgTemp: 22.3, avgRain: 1584, humidity: 70 }, urbanHeatIslandEffect: 1.6 },
  { id: 'sorocaba', name: 'Sorocaba', state: 'SP', stateName: 'São Paulo', lat: -23.5015, lng: -47.4526, population: 687357, elevation: 601, biome: 'atlanticForest', climate: { avgTemp: 20.9, avgRain: 1337, humidity: 74 }, urbanHeatIslandEffect: 1.5 },
  { id: 'santos', name: 'Santos', state: 'SP', stateName: 'São Paulo', lat: -23.9608, lng: -46.3339, population: 433565, elevation: 2, biome: 'atlanticForest', climate: { avgTemp: 22.3, avgRain: 2156, humidity: 82 }, urbanHeatIslandEffect: 1.4 },
  { id: 'londrina', name: 'Londrina', state: 'PR', stateName: 'Paraná', lat: -23.3045, lng: -51.1696, population: 575377, elevation: 576, biome: 'atlanticForest', climate: { avgTemp: 21.5, avgRain: 1628, humidity: 74 }, urbanHeatIslandEffect: 1.5 },
  { id: 'joinville', name: 'Joinville', state: 'SC', stateName: 'Santa Catarina', lat: -26.3045, lng: -48.8487, population: 590466, elevation: 4, biome: 'atlanticForest', climate: { avgTemp: 19.5, avgRain: 1895, humidity: 83 }, urbanHeatIslandEffect: 1.4 },
  { id: 'feira-santana', name: 'Feira de Santana', state: 'BA', stateName: 'Bahia', lat: -12.2578, lng: -38.9556, population: 619609, elevation: 234, biome: 'caatinga', climate: { avgTemp: 24.3, avgRain: 860, humidity: 75 }, urbanHeatIslandEffect: 1.6 },
  { id: 'juiz-fora', name: 'Juiz de Fora', state: 'MG', stateName: 'Minas Gerais', lat: -21.7642, lng: -43.3503, population: 577532, elevation: 678, biome: 'atlanticForest', climate: { avgTemp: 19.4, avgRain: 1536, humidity: 77 }, urbanHeatIslandEffect: 1.4 },
];

/**
 * Get city by ID
 */
export function getCityById(id: string): CityData | undefined {
  return BRAZILIAN_CITIES.find(city => city.id === id);
}

/**
 * Get cities by state
 */
export function getCitiesByState(stateCode: string): CityData[] {
  return BRAZILIAN_CITIES.filter(city => city.state === stateCode);
}

/**
 * Get cities by biome
 */
export function getCitiesByBiome(biomeId: string): CityData[] {
  return BRAZILIAN_CITIES.filter(city => city.biome === biomeId);
}

/**
 * Get nearest city to coordinates
 */
export function getNearestCity(lat: number, lng: number): CityData | null {
  if (BRAZILIAN_CITIES.length === 0) return null;
  
  let nearest = BRAZILIAN_CITIES[0];
  let minDistance = getDistance(lat, lng, nearest.lat, nearest.lng);
  
  for (const city of BRAZILIAN_CITIES) {
    const distance = getDistance(lat, lng, city.lat, city.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = city;
    }
  }
  
  return nearest;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * Math.PI / 180;
}

/**
 * Get cities within radius
 */
export function getCitiesWithinRadius(lat: number, lng: number, radiusKm: number): CityData[] {
  return BRAZILIAN_CITIES.filter(city => {
    const distance = getDistance(lat, lng, city.lat, city.lng);
    return distance <= radiusKm;
  });
}

/**
 * Get top N cities by population
 */
export function getTopCitiesByPopulation(n: number = 10): CityData[] {
  return [...BRAZILIAN_CITIES]
    .sort((a, b) => b.population - a.population)
    .slice(0, n);
}


