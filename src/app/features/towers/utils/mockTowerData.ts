/**
 * Mock Tower Data Generator
 * Generates 18,500 towers with proper Brazilian coordinates
 * EXCLUDING North region - Only Northeast, Center-West, Southeast, South (Tocantins included in Center-West)
 */

export interface Tower {
  id: string;
  lat: number;
  lng: number;
  zone: string;
  zoneType: 'Metro' | 'Urban' | 'Rural';
  region: 'Northeast' | 'Center-West' | 'Southeast' | 'South'; // North region excluded
  state: string;
  stateName: string;
  status: 'active' | 'maintenance' | 'inactive';
  priority: 'High' | 'Medium' | 'Low';
  height: number;
  lastMaintenance: string;
  nextMaintenance: string;
  operatorCount: number;
  signalStrength: number;
  uptime: number;
  towerType?: string;
  siteCode?: string;
}

// Brazilian states with centroids and regions
const BRAZIL_STATES = {
  // North Region
  'AC': { name: 'Acre', lat: -9.0191, lng: -67.7986, region: 'North' as const },
  'AP': { name: 'Amapá', lat: 1.4168, lng: -52.1685, region: 'North' as const },
  'AM': { name: 'Amazonas', lat: -3.1190, lng: -60.0217, region: 'North' as const },
  'PA': { name: 'Pará', lat: -1.9249, lng: -51.9253, region: 'North' as const },
  'RO': { name: 'Rondônia', lat: -11.7808, lng: -63.9039, region: 'North' as const },
  'RR': { name: 'Roraima', lat: 2.8235, lng: -60.6758, region: 'North' as const },
  'TO': { name: 'Tocantins', lat: -10.1753, lng: -48.2982, region: 'North' as const },
  
  // Northeast Region
  'AL': { name: 'Alagoas', lat: -9.5141, lng: -36.8210, region: 'Northeast' as const },
  'BA': { name: 'Bahia', lat: -12.9111, lng: -38.5109, region: 'Northeast' as const },
  'CE': { name: 'Ceará', lat: -3.7314, lng: -38.5270, region: 'Northeast' as const },
  'MA': { name: 'Maranhão', lat: -2.8869, lng: -45.2731, region: 'Northeast' as const },
  'PB': { name: 'Paraíba', lat: -7.0632, lng: -35.7332, region: 'Northeast' as const },
  'PE': { name: 'Pernambuco', lat: -7.9386, lng: -34.8816, region: 'Northeast' as const },
  'PI': { name: 'Piauí', lat: -6.5033, lng: -42.5853, region: 'Northeast' as const },
  'RN': { name: 'Rio Grande do Norte', lat: -5.4026, lng: -36.9480, region: 'Northeast' as const },
  'SE': { name: 'Sergipe', lat: -10.5741, lng: -37.3857, region: 'Northeast' as const },
  
  // Center-West Region
  'DF': { name: 'Distrito Federal', lat: -15.7942, lng: -47.8822, region: 'Center-West' as const },
  'GO': { name: 'Goiás', lat: -15.6939, lng: -48.8883, region: 'Center-West' as const },
  'MT': { name: 'Mato Grosso', lat: -12.6821, lng: -55.5096, region: 'Center-West' as const },
  'MS': { name: 'Mato Grosso do Sul', lat: -19.0150, lng: -55.7218, region: 'Center-West' as const },
  
  // Southeast Region
  'ES': { name: 'Espírito Santo', lat: -19.1906, lng: -40.3755, region: 'Southeast' as const },
  'MG': { name: 'Minas Gerais', lat: -18.8402, lng: -48.2829, region: 'Southeast' as const },
  'RJ': { name: 'Rio de Janeiro', lat: -22.2822, lng: -43.2103, region: 'Southeast' as const },
  'SP': { name: 'São Paulo', lat: -23.5505, lng: -46.6333, region: 'Southeast' as const },
  
  // South Region
  'PR': { name: 'Paraná', lat: -23.3041, lng: -51.4627, region: 'South' as const },
  'RS': { name: 'Rio Grande do Sul', lat: -29.6883, lng: -55.5496, region: 'South' as const },
  'SC': { name: 'Santa Catarina', lat: -27.2423, lng: -50.2189, region: 'South' as const },
};

// Brazil bounds (land areas only, avoiding water)
const BRAZIL_BOUNDS = {
  min_lat: -33.75,
  max_lat: 5.27,
  min_lng: -73.99,
  max_lng: -28.84,
};

// State-specific bounds - ALLOWS coastal cities but avoids actual water
// North region states EXCLUDED
const STATE_BOUNDS: Record<string, { minLat: number; maxLat: number; minLng: number; maxLng: number }> = {
  // Northeast - Allow coastal cities but stay away from actual water
  'AL': { minLat: -10.2, maxLat: -8.8, minLng: -37.5, maxLng: -36.0 }, // Allow Maceió (-36.78)
  'BA': { minLat: -17.5, maxLat: -9.5, minLng: -45.5, maxLng: -39.0 }, // More conservative: maxLng -39.0 to avoid water (Salvador at -38.50 still works with tighter radius)
  'CE': { minLat: -7.0, maxLat: -3.5, minLng: -42.0, maxLng: -38.0 }, // Allow Fortaleza (-38.54)
  'MA': { minLat: -6.2, maxLat: -2.0, minLng: -47.5, maxLng: -44.0 }, // Inland - safe
  'PB': { minLat: -8.0, maxLat: -6.5, minLng: -38.0, maxLng: -35.0 }, // Allow João Pessoa (-34.86)
  'PE': { minLat: -9.0, maxLat: -7.5, minLng: -42.0, maxLng: -35.0 }, // Allow Recife (-34.87)
  'PI': { minLat: -10.5, maxLat: -3.5, minLng: -44.5, maxLng: -41.0 }, // Inland - safe
  'RN': { minLat: -6.0, maxLat: -5.0, minLng: -38.0, maxLng: -35.0 }, // Allow Natal (-35.21)
  'SE': { minLat: -11.0, maxLat: -10.0, minLng: -38.0, maxLng: -37.0 }, // Allow Aracaju (-37.38)
  // Center-West - All inland, safer
  'DF': { minLat: -15.9, maxLat: -15.6, minLng: -48.2, maxLng: -47.3 },
  'GO': { minLat: -18.5, maxLat: -12.5, minLng: -51.5, maxLng: -45.5 },
  'MT': { minLat: -17.5, maxLat: -8.0, minLng: -60.5, maxLng: -50.5 },
  'MS': { minLat: -23.5, maxLat: -17.5, minLng: -57.5, maxLng: -50.5 },
  'TO': { minLat: -13.0, maxLat: -5.0, minLng: -50.5, maxLng: -45.5 }, // Tocantins - inland
  // Southeast - Allow coastal cities but avoid water
  'ES': { minLat: -20.5, maxLat: -18.0, minLng: -41.5, maxLng: -40.0 }, // Allow Vitória (-40.31)
  'MG': { minLat: -22.5, maxLat: -14.5, minLng: -50.5, maxLng: -40.0 }, // Inland - safe
  'RJ': { minLat: -23.0, maxLat: -21.0, minLng: -44.5, maxLng: -43.0 }, // Allow Rio (-43.21)
  'SP': { minLat: -24.5, maxLat: -20.0, minLng: -52.5, maxLng: -45.0 }, // Inland - safe
  // South - Allow coastal cities but avoid water
  'PR': { minLat: -26.0, maxLat: -23.0, minLng: -54.2, maxLng: -49.0 }, // Allow Curitiba (-49.27)
  'RS': { minLat: -33.0, maxLat: -27.5, minLng: -57.2, maxLng: -51.0 }, // Allow Porto Alegre (-51.21)
  'SC': { minLat: -29.0, maxLat: -26.0, minLng: -53.2, maxLng: -48.0 }, // Allow Florianópolis (-48.54)
};

// Gaussian random number generator
function gaussianRandom(mean: number, stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdDev + mean;
}

// Major Brazilian cities with coordinates and weights for realistic tower placement
// ENHANCED: Many northwest/inland cities added to fill empty areas
const MAJOR_CITIES: Record<string, Array<{ name: string; lat: number; lng: number; weight: number }>> = {
  // Northeast - EXPANDED with many northwest/inland cities
  'BA': [
    { name: 'Salvador', lat: -12.9714, lng: -38.5014, weight: 0.20 },
    { name: 'Feira de Santana', lat: -12.2667, lng: -38.9667, weight: 0.12 },
    { name: 'Vitória da Conquista', lat: -14.8661, lng: -40.8394, weight: 0.10 },
    { name: 'Juazeiro', lat: -9.4167, lng: -40.5000, weight: 0.10 },
    { name: 'Barreiras', lat: -12.1431, lng: -45.0008, weight: 0.08 }, // Northwest
    // More cities around Salvador (all inland)
    { name: 'Lauro de Freitas', lat: -12.8944, lng: -38.3272, weight: 0.06 },
    { name: 'Simões Filho', lat: -12.7867, lng: -38.4039, weight: 0.05 },
    { name: 'Candeias', lat: -12.6667, lng: -38.5500, weight: 0.05 },
    { name: 'Dias d\'Ávila', lat: -12.6167, lng: -38.3000, weight: 0.04 },
    { name: 'São Francisco do Conde', lat: -12.6333, lng: -38.6833, weight: 0.03 },
    { name: 'Ilhéus', lat: -14.7889, lng: -39.0489, weight: 0.08 },
    { name: 'Camaçari', lat: -12.6978, lng: -38.3239, weight: 0.08 },
    { name: 'Jequié', lat: -13.8581, lng: -40.0850, weight: 0.06 },
    { name: 'Alagoinhas', lat: -12.1356, lng: -38.4192, weight: 0.06 },
    { name: 'Teixeira de Freitas', lat: -17.5350, lng: -39.7419, weight: 0.05 },
    { name: 'Paulo Afonso', lat: -9.4061, lng: -38.2147, weight: 0.05 },
    // NEW: Northwest/Inland cities to fill empty areas
    { name: 'Bom Jesus da Lapa', lat: -13.2500, lng: -43.4167, weight: 0.03 },
    { name: 'Guanambi', lat: -14.2231, lng: -42.7797, weight: 0.03 },
    { name: 'Brumado', lat: -14.2036, lng: -41.6656, weight: 0.03 },
    { name: 'Senhor do Bonfim', lat: -10.4614, lng: -40.1897, weight: 0.03 },
    { name: 'Irecê', lat: -11.3000, lng: -41.8500, weight: 0.02 },
    { name: 'Jacobina', lat: -11.1833, lng: -40.5167, weight: 0.02 },
    { name: 'Eunápolis', lat: -16.3778, lng: -39.5806, weight: 0.02 },
    { name: 'Itabuna', lat: -14.7856, lng: -39.2803, weight: 0.02 },
  ],
  'PE': [
    { name: 'Recife', lat: -8.0476, lng: -34.8770, weight: 0.20 },
    { name: 'Jaboatão dos Guararapes', lat: -8.1128, lng: -35.0147, weight: 0.12 },
    { name: 'Caruaru', lat: -8.2833, lng: -35.9761, weight: 0.12 },
    { name: 'Petrolina', lat: -9.3928, lng: -40.5008, weight: 0.12 }, // Northwest
    // More cities around Recife (all inland)
    { name: 'Igarassu', lat: -7.8333, lng: -34.9000, weight: 0.06 },
    { name: 'São Lourenço da Mata', lat: -8.0000, lng: -35.0167, weight: 0.05 },
    { name: 'Moreno', lat: -8.1167, lng: -35.0833, weight: 0.04 },
    { name: 'Escada', lat: -8.3667, lng: -35.2167, weight: 0.03 },
    { name: 'Olinda', lat: -8.0089, lng: -34.8553, weight: 0.08 },
    { name: 'Paulista', lat: -7.9408, lng: -34.8731, weight: 0.08 },
    { name: 'Cabo de Santo Agostinho', lat: -8.2833, lng: -35.0333, weight: 0.06 },
    { name: 'Garanhuns', lat: -8.8900, lng: -36.4928, weight: 0.06 },
    { name: 'Vitória de Santo Antão', lat: -8.1167, lng: -35.2833, weight: 0.05 },
    { name: 'Camaragibe', lat: -8.0167, lng: -34.9833, weight: 0.04 },
    { name: 'Abreu e Lima', lat: -7.9000, lng: -34.9000, weight: 0.02 },
    // NEW: Northwest/Inland cities
    { name: 'Serra Talhada', lat: -7.9917, lng: -38.2981, weight: 0.03 },
    { name: 'Araripina', lat: -7.5758, lng: -40.4981, weight: 0.03 },
    { name: 'Salgueiro', lat: -8.0739, lng: -39.1197, weight: 0.02 },
    { name: 'Afogados da Ingazeira', lat: -7.7500, lng: -37.6333, weight: 0.02 },
    { name: 'Ouricuri', lat: -7.8833, lng: -40.0833, weight: 0.02 },
  ],
  'CE': [
    { name: 'Fortaleza', lat: -3.7172, lng: -38.5433, weight: 0.25 },
    { name: 'Caucaia', lat: -3.7322, lng: -38.6556, weight: 0.12 },
    { name: 'Juazeiro do Norte', lat: -7.2131, lng: -39.3153, weight: 0.10 },
    { name: 'Sobral', lat: -3.6881, lng: -40.3497, weight: 0.10 }, // Northwest
    // More cities around Fortaleza (all inland)
    { name: 'Pacatuba', lat: -3.9833, lng: -38.6167, weight: 0.05 },
    { name: 'Eusébio', lat: -3.8833, lng: -38.4500, weight: 0.04 },
    { name: 'Aquiraz', lat: -3.9000, lng: -38.3833, weight: 0.03 },
    { name: 'Maracanaú', lat: -3.8769, lng: -38.6258, weight: 0.08 },
    { name: 'Crato', lat: -7.2336, lng: -39.4086, weight: 0.08 },
    { name: 'Itapipoca', lat: -3.4944, lng: -39.5786, weight: 0.06 },
    { name: 'Maranguape', lat: -3.8900, lng: -38.6858, weight: 0.06 },
    { name: 'Iguatu', lat: -6.3619, lng: -39.2981, weight: 0.05 },
    { name: 'Quixadá', lat: -4.9708, lng: -39.0153, weight: 0.05 },
    // NEW: Northwest/Inland cities
    { name: 'Crateús', lat: -5.1781, lng: -40.6775, weight: 0.04 },
    { name: 'Tauá', lat: -6.0000, lng: -40.3000, weight: 0.03 },
    { name: 'Russas', lat: -4.9403, lng: -37.9758, weight: 0.02 },
    { name: 'Aracati', lat: -4.5619, lng: -37.7708, weight: 0.02 },
    { name: 'Limoeiro do Norte', lat: -5.1500, lng: -38.1000, weight: 0.02 },
  ],
  'PI': [
    { name: 'Teresina', lat: -5.0892, lng: -42.8019, weight: 0.30 },
    { name: 'Parnaíba', lat: -2.9047, lng: -41.7767, weight: 0.20 },
    // More cities around Teresina
    { name: 'Picos', lat: -7.0769, lng: -41.4672, weight: 0.15 },
    { name: 'Piripiri', lat: -4.2736, lng: -41.7769, weight: 0.10 },
    { name: 'Floriano', lat: -6.7667, lng: -43.0167, weight: 0.10 },
    { name: 'Campo Maior', lat: -4.8281, lng: -42.1681, weight: 0.10 },
    { name: 'Timon', lat: -5.0947, lng: -42.8369, weight: 0.05 },
    { name: 'União', lat: -4.5833, lng: -42.8667, weight: 0.04 },
    { name: 'Oeiras', lat: -7.0167, lng: -42.1333, weight: 0.03 },
    { name: 'São Raimundo Nonato', lat: -9.0167, lng: -42.7000, weight: 0.03 },
  ],
  'MA': [
    { name: 'São Luís', lat: -2.5387, lng: -44.2825, weight: 0.30 },
    { name: 'Imperatriz', lat: -5.5189, lng: -47.4778, weight: 0.25 }, // Northwest
    // More cities around São Luís
    { name: 'Caxias', lat: -4.8589, lng: -43.3558, weight: 0.15 },
    { name: 'Timon', lat: -5.0947, lng: -42.8369, weight: 0.10 },
    { name: 'Codó', lat: -4.4550, lng: -43.8856, weight: 0.10 },
    { name: 'Paço do Lumiar', lat: -2.5333, lng: -44.1000, weight: 0.10 },
    { name: 'Raposa', lat: -2.4167, lng: -44.1000, weight: 0.05 },
    { name: 'São José de Ribamar', lat: -2.5500, lng: -44.0500, weight: 0.05 },
    { name: 'Bacabal', lat: -4.2250, lng: -44.7917, weight: 0.04 },
    { name: 'Balsas', lat: -7.5333, lng: -46.0333, weight: 0.04 },
    { name: 'Açailândia', lat: -4.9500, lng: -47.5000, weight: 0.03 },
  ],
  'AL': [
    { name: 'Maceió', lat: -9.5713, lng: -36.7820, weight: 0.35 },
    { name: 'Arapiraca', lat: -9.7525, lng: -36.6611, weight: 0.25 },
    // More cities around Maceió (all inland)
    { name: 'Rio Largo', lat: -9.4833, lng: -35.8500, weight: 0.15 },
    { name: 'Palmeira dos Índios', lat: -9.4058, lng: -36.6269, weight: 0.10 },
    { name: 'União dos Palmares', lat: -9.1611, lng: -36.0306, weight: 0.10 },
    { name: 'Marechal Deodoro', lat: -9.7167, lng: -36.8833, weight: 0.05 },
    { name: 'Pilar', lat: -9.6000, lng: -36.0000, weight: 0.04 },
    { name: 'Coruripe', lat: -10.1275, lng: -36.1756, weight: 0.03 },
    { name: 'São Miguel dos Campos', lat: -9.7833, lng: -36.1000, weight: 0.03 },
  ],
  'SE': [
    { name: 'Aracaju', lat: -10.9091, lng: -37.0678, weight: 0.45 },
    { name: 'Nossa Senhora do Socorro', lat: -10.8500, lng: -37.1167, weight: 0.20 },
    // More cities around Aracaju (all inland)
    { name: 'Lagarto', lat: -10.9167, lng: -37.6500, weight: 0.15 },
    { name: 'Itabaiana', lat: -10.6850, lng: -37.4250, weight: 0.15 },
    { name: 'São Cristóvão', lat: -11.0147, lng: -37.2064, weight: 0.05 },
    { name: 'Estância', lat: -11.2667, lng: -37.4333, weight: 0.04 },
    { name: 'Propriá', lat: -10.2167, lng: -36.8333, weight: 0.03 },
    { name: 'Tobias Barreto', lat: -11.1833, lng: -37.9833, weight: 0.03 },
  ],
  'PB': [
    { name: 'João Pessoa', lat: -7.1150, lng: -34.8631, weight: 0.30 },
    { name: 'Campina Grande', lat: -7.2306, lng: -35.8811, weight: 0.30 },
    // More cities around João Pessoa (all inland)
    { name: 'Santa Rita', lat: -7.1167, lng: -34.9833, weight: 0.15 },
    { name: 'Bayeux', lat: -7.1333, lng: -34.9333, weight: 0.10 },
    { name: 'Cabedelo', lat: -6.9833, lng: -34.8333, weight: 0.05 },
    { name: 'Mamanguape', lat: -6.8333, lng: -35.1167, weight: 0.04 },
    { name: 'Guarabira', lat: -6.8500, lng: -35.4833, weight: 0.04 },
    { name: 'Patos', lat: -7.0244, lng: -37.2800, weight: 0.10 },
    { name: 'Sousa', lat: -6.7667, lng: -38.2333, weight: 0.03 },
    { name: 'Cajazeiras', lat: -6.8833, lng: -38.5667, weight: 0.03 },
  ],
  'RN': [
    { name: 'Natal', lat: -5.7945, lng: -35.2110, weight: 0.35 },
    { name: 'Mossoró', lat: -5.1875, lng: -37.3442, weight: 0.25 },
    // More cities around Natal (all inland)
    { name: 'Parnamirim', lat: -5.9167, lng: -35.2667, weight: 0.20 },
    { name: 'São Gonçalo do Amarante', lat: -5.7917, lng: -35.3292, weight: 0.15 },
    { name: 'Macaíba', lat: -5.8583, lng: -35.3539, weight: 0.05 },
    { name: 'Ceará-Mirim', lat: -5.6333, lng: -35.4167, weight: 0.04 },
    { name: 'São José de Mipibu', lat: -6.0667, lng: -35.2333, weight: 0.03 },
    { name: 'Currais Novos', lat: -6.2667, lng: -36.5167, weight: 0.03 },
  ],
  // Center-West - EXPANDED with more inland cities
  'GO': [
    { name: 'Goiânia', lat: -16.6864, lng: -49.2643, weight: 0.30 },
    { name: 'Aparecida de Goiânia', lat: -16.8194, lng: -49.2439, weight: 0.15 },
    { name: 'Anápolis', lat: -16.3267, lng: -48.9528, weight: 0.12 },
    { name: 'Rio Verde', lat: -17.7978, lng: -50.9289, weight: 0.10 },
    { name: 'Luziânia', lat: -16.2528, lng: -47.9503, weight: 0.10 },
    { name: 'Águas Lindas de Goiás', lat: -15.7617, lng: -48.2817, weight: 0.08 },
    { name: 'Valparaíso de Goiás', lat: -16.0667, lng: -47.9833, weight: 0.08 },
    { name: 'Trindade', lat: -16.6500, lng: -49.5000, weight: 0.07 },
    // NEW: More inland cities to fill empty areas
    { name: 'Formosa', lat: -15.5369, lng: -47.3339, weight: 0.03 },
    { name: 'Jataí', lat: -17.8833, lng: -51.7167, weight: 0.03 },
    { name: 'Catalão', lat: -18.1667, lng: -47.9500, weight: 0.02 },
    { name: 'Itumbiara', lat: -18.4167, lng: -49.2167, weight: 0.02 },
  ],
  'MT': [
    { name: 'Cuiabá', lat: -15.6014, lng: -56.0972, weight: 0.30 },
    { name: 'Várzea Grande', lat: -15.6467, lng: -56.1325, weight: 0.15 },
    { name: 'Rondonópolis', lat: -16.4703, lng: -54.6358, weight: 0.12 },
    { name: 'Sinop', lat: -11.8639, lng: -55.5036, weight: 0.10 },
    { name: 'Tangará da Serra', lat: -14.6228, lng: -57.4931, weight: 0.10 },
    { name: 'Cáceres', lat: -16.0714, lng: -57.6811, weight: 0.08 },
    { name: 'Sorriso', lat: -12.5500, lng: -55.7167, weight: 0.08 },
    { name: 'Lucas do Rio Verde', lat: -13.0667, lng: -55.9167, weight: 0.07 },
    // NEW: More cities to fill empty areas
    { name: 'Barra do Garças', lat: -15.8833, lng: -52.2500, weight: 0.03 },
    { name: 'Alta Floresta', lat: -9.8667, lng: -56.0833, weight: 0.02 },
    { name: 'Juína', lat: -11.3833, lng: -58.7333, weight: 0.02 },
  ],
  'MS': [
    { name: 'Campo Grande', lat: -20.4428, lng: -54.6464, weight: 0.35 },
    { name: 'Dourados', lat: -22.2231, lng: -54.8128, weight: 0.25 },
    // More cities around Campo Grande
    { name: 'Três Lagoas', lat: -20.7511, lng: -51.6783, weight: 0.15 },
    { name: 'Corumbá', lat: -19.0081, lng: -57.6517, weight: 0.10 },
    { name: 'Ponta Porã', lat: -22.5361, lng: -55.7258, weight: 0.10 },
    { name: 'Naviraí', lat: -23.0619, lng: -54.1917, weight: 0.05 },
    { name: 'Nova Andradina', lat: -22.2333, lng: -53.3431, weight: 0.05 },
    { name: 'Aquidauana', lat: -20.4708, lng: -55.7878, weight: 0.04 },
    { name: 'Paranaíba', lat: -19.6772, lng: -51.1908, weight: 0.03 },
  ],
  'DF': [
    { name: 'Brasília', lat: -15.7942, lng: -47.8822, weight: 0.60 },
    { name: 'Taguatinga', lat: -15.8333, lng: -48.0500, weight: 0.25 },
    // More cities around Brasília
    { name: 'Ceilândia', lat: -15.8167, lng: -48.1000, weight: 0.08 },
    { name: 'Samambaia', lat: -15.8833, lng: -48.0833, weight: 0.07 },
  ],
  'TO': [
    { name: 'Palmas', lat: -10.1753, lng: -48.2982, weight: 0.45 },
    { name: 'Araguaína', lat: -7.1911, lng: -48.2072, weight: 0.25 },
    // More cities around Palmas
    { name: 'Gurupi', lat: -11.7289, lng: -49.0686, weight: 0.15 },
    { name: 'Porto Nacional', lat: -10.7081, lng: -48.4169, weight: 0.10 },
    { name: 'Paraíso do Tocantins', lat: -10.1750, lng: -48.8833, weight: 0.05 },
    { name: 'Colinas do Tocantins', lat: -8.0667, lng: -48.4833, weight: 0.04 },
    { name: 'Formoso do Araguaia', lat: -11.8000, lng: -49.5167, weight: 0.03 },
    { name: 'Dianópolis', lat: -11.6167, lng: -46.8167, weight: 0.03 },
  ],
  // Southeast
  'SP': [
    { name: 'São Paulo', lat: -23.5505, lng: -46.6333, weight: 0.18 },
    { name: 'Campinas', lat: -22.9056, lng: -47.0608, weight: 0.10 },
    { name: 'São José dos Campos', lat: -23.1791, lng: -45.8872, weight: 0.08 },
    { name: 'Ribeirão Preto', lat: -21.1775, lng: -47.8103, weight: 0.08 },
    { name: 'Sorocaba', lat: -23.5015, lng: -47.4526, weight: 0.08 },
    // More cities around São Paulo (all inland)
    { name: 'Guarulhos', lat: -23.4538, lng: -46.5331, weight: 0.08 },
    { name: 'São Bernardo do Campo', lat: -23.6939, lng: -46.5650, weight: 0.08 },
    { name: 'Osasco', lat: -23.5329, lng: -46.7915, weight: 0.08 },
    { name: 'Santo André', lat: -23.6639, lng: -46.5383, weight: 0.06 },
    { name: 'Mauá', lat: -23.6677, lng: -46.4613, weight: 0.06 },
    { name: 'Diadema', lat: -23.6864, lng: -46.6228, weight: 0.06 },
    { name: 'Carapicuíba', lat: -23.5228, lng: -46.8358, weight: 0.05 },
    { name: 'Barueri', lat: -23.5108, lng: -46.8761, weight: 0.05 },
    { name: 'Itaquaquecetuba', lat: -23.4864, lng: -46.3483, weight: 0.04 },
    { name: 'Franco da Rocha', lat: -23.3217, lng: -46.7269, weight: 0.03 },
    { name: 'Santos', lat: -23.9608, lng: -46.3331, weight: 0.08 },
    // More inland cities
    { name: 'Jundiaí', lat: -23.1864, lng: -46.8842, weight: 0.05 },
    { name: 'Piracicaba', lat: -22.7253, lng: -47.6492, weight: 0.05 },
    { name: 'Taubaté', lat: -23.0264, lng: -45.5556, weight: 0.04 },
    { name: 'Americana', lat: -22.7375, lng: -47.3311, weight: 0.03 },
  ],
  'RJ': [
    { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729, weight: 0.25 },
    { name: 'Niterói', lat: -22.8833, lng: -43.1036, weight: 0.15 },
    { name: 'Campos dos Goytacazes', lat: -21.7523, lng: -41.3304, weight: 0.12 },
    // More cities around Rio (all inland)
    { name: 'Duque de Caxias', lat: -22.7856, lng: -43.3117, weight: 0.12 },
    { name: 'Nova Iguaçu', lat: -22.7592, lng: -43.4511, weight: 0.12 },
    { name: 'São Gonçalo', lat: -22.8269, lng: -43.0539, weight: 0.10 },
    { name: 'Petrópolis', lat: -22.5050, lng: -43.1786, weight: 0.09 },
    { name: 'São João de Meriti', lat: -22.8039, lng: -43.3722, weight: 0.06 },
    { name: 'Belford Roxo', lat: -22.7639, lng: -43.3992, weight: 0.06 },
    { name: 'Queimados', lat: -22.7161, lng: -43.5553, weight: 0.05 },
    { name: 'Nova Friburgo', lat: -22.2819, lng: -42.5311, weight: 0.05 },
    { name: 'Volta Redonda', lat: -22.5231, lng: -44.1042, weight: 0.05 },
    { name: 'Barra Mansa', lat: -22.5442, lng: -44.1711, weight: 0.04 },
  ],
  'MG': [
    { name: 'Belo Horizonte', lat: -19.9167, lng: -43.9345, weight: 0.16 },
    { name: 'Uberlândia', lat: -18.9186, lng: -48.2772, weight: 0.12 },
    { name: 'Contagem', lat: -19.9317, lng: -44.0536, weight: 0.10 },
    { name: 'Juiz de Fora', lat: -21.7595, lng: -43.3398, weight: 0.10 },
    // More cities around Belo Horizonte (all inland)
    { name: 'Betim', lat: -19.9678, lng: -44.1978, weight: 0.08 },
    { name: 'Ribeirão das Neves', lat: -19.7669, lng: -44.0869, weight: 0.08 },
    { name: 'Sabará', lat: -19.8861, lng: -43.8069, weight: 0.05 },
    { name: 'Santa Luzia', lat: -19.7700, lng: -43.8514, weight: 0.05 },
    { name: 'Vespasiano', lat: -19.6919, lng: -43.9233, weight: 0.04 },
    { name: 'Nova Lima', lat: -20.1281, lng: -43.8458, weight: 0.04 },
    { name: 'Ibirité', lat: -20.0219, lng: -44.0589, weight: 0.04 },
    { name: 'Montes Claros', lat: -16.7281, lng: -43.8631, weight: 0.08 },
    { name: 'Uberaba', lat: -19.7478, lng: -47.9319, weight: 0.08 },
    { name: 'Governador Valadares', lat: -18.8511, lng: -41.9494, weight: 0.08 },
    { name: 'Ipatinga', lat: -19.4703, lng: -42.5367, weight: 0.06 },
    // More inland cities
    { name: 'Divinópolis', lat: -20.1389, lng: -44.8839, weight: 0.05 },
    { name: 'Sete Lagoas', lat: -19.4658, lng: -44.2467, weight: 0.05 },
    { name: 'Poços de Caldas', lat: -21.7878, lng: -46.5611, weight: 0.04 },
    { name: 'Patos de Minas', lat: -18.5781, lng: -46.5181, weight: 0.04 },
  ],
  'ES': [
    { name: 'Vitória', lat: -20.3155, lng: -40.3128, weight: 0.30 },
    { name: 'Vila Velha', lat: -20.3297, lng: -40.2925, weight: 0.20 },
    // More cities around Vitória (all inland)
    { name: 'Cariacica', lat: -20.2633, lng: -40.4164, weight: 0.15 },
    { name: 'Serra', lat: -20.1289, lng: -40.3078, weight: 0.15 },
    { name: 'Viana', lat: -20.3833, lng: -40.4833, weight: 0.06 },
    { name: 'Guarapari', lat: -20.6667, lng: -40.5000, weight: 0.05 },
    { name: 'Aracruz', lat: -19.8200, lng: -40.2733, weight: 0.05 },
    { name: 'Linhares', lat: -19.3911, lng: -40.0722, weight: 0.04 },
    { name: 'Cachoeiro de Itapemirim', lat: -20.8489, lng: -41.1128, weight: 0.15 },
    // More inland cities
    { name: 'Colatina', lat: -19.5389, lng: -40.6308, weight: 0.05 },
    { name: 'São Mateus', lat: -18.7167, lng: -39.8589, weight: 0.04 },
  ],
  // South
  'PR': [
    { name: 'Curitiba', lat: -25.4284, lng: -49.2733, weight: 0.22 },
    { name: 'Londrina', lat: -23.3103, lng: -51.1628, weight: 0.18 },
    { name: 'Maringá', lat: -23.4205, lng: -51.9331, weight: 0.12 },
    { name: 'Ponta Grossa', lat: -25.0911, lng: -50.1667, weight: 0.10 },
    { name: 'Cascavel', lat: -24.9558, lng: -53.4553, weight: 0.10 },
    // More cities around Curitiba (all inland)
    { name: 'Colombo', lat: -25.2925, lng: -49.2261, weight: 0.07 },
    { name: 'São José dos Pinhais', lat: -25.5350, lng: -49.2056, weight: 0.05 },
    { name: 'Araucária', lat: -25.5931, lng: -49.4103, weight: 0.05 },
    { name: 'Pinhais', lat: -25.4447, lng: -49.1925, weight: 0.04 },
    { name: 'Fazenda Rio Grande', lat: -25.6583, lng: -49.3075, weight: 0.04 },
    { name: 'Campo Largo', lat: -25.4594, lng: -49.5292, weight: 0.03 },
    { name: 'Almirante Tamandaré', lat: -25.3247, lng: -49.3100, weight: 0.03 },
    { name: 'Foz do Iguaçu', lat: -25.5163, lng: -54.5856, weight: 0.08 },
    { name: 'Guarapuava', lat: -25.3908, lng: -51.4628, weight: 0.03 },
    // More inland cities
    { name: 'Apucarana', lat: -23.5508, lng: -51.4608, weight: 0.04 },
    { name: 'Umuarama', lat: -23.7661, lng: -53.3250, weight: 0.03 },
    { name: 'Toledo', lat: -24.7139, lng: -53.7431, weight: 0.03 },
  ],
  'RS': [
    { name: 'Porto Alegre', lat: -30.0346, lng: -51.2177, weight: 0.22 },
    { name: 'Caxias do Sul', lat: -29.1681, lng: -51.1792, weight: 0.12 },
    { name: 'Pelotas', lat: -31.7719, lng: -52.3425, weight: 0.10 },
    // More cities around Porto Alegre (all inland)
    { name: 'Canoas', lat: -29.9178, lng: -51.1836, weight: 0.10 },
    { name: 'Gravataí', lat: -29.9431, lng: -50.9919, weight: 0.08 },
    { name: 'Viamão', lat: -30.0811, lng: -51.0233, weight: 0.07 },
    { name: 'Novo Hamburgo', lat: -29.6914, lng: -51.1306, weight: 0.06 },
    { name: 'São Leopoldo', lat: -29.7603, lng: -51.1472, weight: 0.06 },
    { name: 'Alvorada', lat: -29.9911, lng: -51.0808, weight: 0.05 },
    { name: 'Cachoeirinha', lat: -29.9508, lng: -51.0939, weight: 0.04 },
    { name: 'Sapucaia do Sul', lat: -29.8417, lng: -51.1458, weight: 0.04 },
    { name: 'Esteio', lat: -29.8519, lng: -51.1792, weight: 0.04 },
    { name: 'Santa Maria', lat: -29.6842, lng: -53.8069, weight: 0.10 },
    { name: 'Rio Grande', lat: -32.0350, lng: -52.0986, weight: 0.06 },
    // More inland cities
    { name: 'Passo Fundo', lat: -28.2628, lng: -52.4067, weight: 0.05 },
    { name: 'Uruguaiana', lat: -29.7547, lng: -57.0883, weight: 0.04 },
    { name: 'Bagé', lat: -31.3319, lng: -54.1069, weight: 0.03 },
  ],
  'SC': [
    { name: 'Florianópolis', lat: -27.5954, lng: -48.5480, weight: 0.22 },
    { name: 'Joinville', lat: -26.3044, lng: -48.8461, weight: 0.18 },
    { name: 'Blumenau', lat: -26.9194, lng: -49.0661, weight: 0.12 },
    // More cities around Florianópolis (all inland)
    { name: 'São José', lat: -27.6144, lng: -48.6367, weight: 0.10 },
    { name: 'Palhoça', lat: -27.6444, lng: -48.6678, weight: 0.06 },
    { name: 'Biguaçu', lat: -27.4942, lng: -48.6556, weight: 0.05 },
    { name: 'Santo Amaro da Imperatriz', lat: -27.6881, lng: -48.7789, weight: 0.04 },
    { name: 'São Pedro de Alcântara', lat: -27.5667, lng: -48.8000, weight: 0.03 },
    { name: 'Criciúma', lat: -28.6775, lng: -49.3697, weight: 0.10 },
    { name: 'Chapecó', lat: -27.0964, lng: -52.6181, weight: 0.10 },
    { name: 'Itajaí', lat: -26.9078, lng: -48.6619, weight: 0.08 },
    { name: 'Lages', lat: -27.8161, lng: -50.3261, weight: 0.07 },
    { name: 'Tubarão', lat: -28.4833, lng: -49.0069, weight: 0.03 },
    { name: 'Jaraguá do Sul', lat: -26.4850, lng: -49.0661, weight: 0.02 },
    // More inland cities
    { name: 'Rio do Sul', lat: -27.2142, lng: -49.6431, weight: 0.04 },
    { name: 'Brusque', lat: -27.0978, lng: -48.9106, weight: 0.04 },
    { name: 'Concórdia', lat: -27.2333, lng: -52.0261, weight: 0.03 },
  ],
};

// Helper to select a city based on weights (probability distribution)
function selectCityByWeight(cities: Array<{ name: string; lat: number; lng: number; weight: number }>): { lat: number; lng: number } {
  const rand = Math.random();
  let cumulative = 0;
  for (const city of cities) {
    cumulative += city.weight;
    if (rand <= cumulative) {
      return { lat: city.lat, lng: city.lng };
    }
  }
  // Fallback to last city if weights don't sum to 1.0
  return { lat: cities[cities.length - 1].lat, lng: cities[cities.length - 1].lng };
}

// Known water/coastal areas to avoid (approximate)
const WATER_AREAS: Array<{ minLat: number; maxLat: number; minLng: number; maxLng: number }> = [
  // Atlantic Ocean - Eastern coast
  { minLat: -33.75, maxLat: 5.27, minLng: -28.84, maxLng: -34.0 }, // Eastern edge
  // Avoid very close to coast (within ~0.5 degrees)
];

// Check if coordinate is likely in water - SMART: Allows coastal cities but avoids actual water
function isLikelyWater(lat: number, lng: number): boolean {
  // Check against known water areas
  for (const area of WATER_AREAS) {
    if (lat >= area.minLat && lat <= area.maxLat && lng >= area.minLng && lng <= area.maxLng) {
      return true;
    }
  }
  
  // SMART CHECK: Only reject if VERY close to coast (within 0.3 degrees = ~33km)
  // This allows coastal cities but prevents towers in actual water
  // Brazil's easternmost land point is around -34.8 lng, so we allow up to -35.0
  if (lng > -35.0) {
    return true; // Too close to coast, likely water
  }
  
  // PRECISE regional safety checks - Only reject areas that are definitely in water
  // Allow coastal cities but reject points that are clearly in the ocean
  if ((lat >= -20.5 && lat <= -18.0 && lng > -40.5) || // ES region - Allow Vitória (-40.31) but reject ocean
      (lat >= -23.0 && lat <= -21.0 && lng > -43.5) || // RJ region - Allow Rio (-43.21) but reject ocean
      // BA region - ULTRA-AGGRESSIVE: Multiple checks for different coastal areas
      (lat >= -17.5 && lat <= -9.5 && lng > -39.2) || // BA region - General: reject anything east of -39.2
      (lat >= -14.0 && lat <= -13.0 && lng > -39.5) || // BA region - Ilhéus area: extra protection for coastal inlets
      (lat >= -13.5 && lat <= -12.5 && lng > -39.3) || // BA region - Itabuna/Ilhéus: protect bay areas
      (lat >= -12.0 && lat <= -11.0 && lng > -39.0) || // BA region - Camamu/Maraú: protect large bay
      (lat >= -11.0 && lat <= -9.5 && lng > -38.9) || // BA region - Salvador area: tight protection
      (lat >= -11.0 && lat <= -10.0 && lng > -37.5) || // SE region - Allow Aracaju (-37.38) but reject ocean
      (lat >= -9.0 && lat <= -7.5 && lng > -35.2) || // PE region - Allow Recife (-34.87) but reject ocean
      (lat >= -8.0 && lat <= -6.5 && lng > -35.2) || // PB region - Allow João Pessoa (-34.86) but reject ocean
      (lat >= -10.2 && lat <= -8.8 && lng > -37.0) || // AL region - Allow Maceió (-36.78) but reject ocean
      (lat >= -7.0 && lat <= -3.5 && lng > -38.8) || // CE region - Allow Fortaleza (-38.54) but reject ocean
      (lat >= -6.0 && lat <= -5.0 && lng > -36.2) || // RN region - Allow Natal (-35.21) but reject ocean
      (lat >= -29.0 && lat <= -26.0 && lng > -48.8) || // SC region - Allow Florianópolis (-48.54) but reject ocean
      (lat >= -33.0 && lat <= -27.5 && lng > -51.5) || // RS region - Allow Porto Alegre (-51.21) but reject ocean
      (lat >= -26.0 && lat <= -23.0 && lng > -49.5)) { // PR region - Allow Curitiba (-49.27) but reject ocean
    return true; // Reject points that are clearly in the ocean
  }
  
  return false;
}

// Force move any coordinate that's in water to a safe inland position
function forceInland(lat: number, lng: number, stateCode: string): { lat: number; lng: number } {
  if (!isLikelyWater(lat, lng)) {
    return { lat, lng }; // Already safe
  }
  
  // Move 3 degrees west (inland) and add some random variation
  const state = BRAZIL_STATES[stateCode as keyof typeof BRAZIL_STATES];
  const bounds = STATE_BOUNDS[stateCode] || {
    minLat: state.lat - 2,
    maxLat: state.lat + 2,
    minLng: state.lng - 2,
    maxLng: state.lng + 2,
  };
  
  // Force to safe inland position
  // For Bahia, move even further inland to avoid coastal inlets and bays
  const moveDistance = stateCode === 'BA' ? 4.5 : 3.0; // Move 4.5 degrees for Bahia (ultra-aggressive), 3.0 for others
  let safeLng = Math.min(lng - moveDistance, bounds.maxLng - 0.5); // Move west, stay 0.5 degrees from max bound
  let safeLat = lat + (Math.random() - 0.5) * 0.5; // Add small random variation
  
  // Clamp to bounds
  safeLat = Math.max(bounds.minLat, Math.min(bounds.maxLat, safeLat));
  safeLng = Math.max(bounds.minLng, Math.min(bounds.maxLng, safeLng));
  
  // Final validation
  safeLat = Math.max(BRAZIL_BOUNDS.min_lat, Math.min(BRAZIL_BOUNDS.max_lat, safeLat));
  safeLng = Math.max(BRAZIL_BOUNDS.min_lng, Math.min(BRAZIL_BOUNDS.max_lng, safeLng));
  
  return { lat: safeLat, lng: safeLng };
}

// Generate random coordinate within state bounds - AVOIDING WATER
// ENHANCED: Uses city-based generation when available, with same Gaussian style for clusters
function generateCoordinateInState(stateCode: string): { lat: number; lng: number } {
  const state = BRAZIL_STATES[stateCode as keyof typeof BRAZIL_STATES];
  const bounds = STATE_BOUNDS[stateCode] || {
    minLat: state.lat - 2,
    maxLat: state.lat + 2,
    minLng: state.lng - 2,
    maxLng: state.lng + 2,
  };

  const cities = MAJOR_CITIES[stateCode];
  
  // 70% city-based (if cities available), 30% even distribution - INCREASED for better coverage
  const useCityBased = cities && cities.length > 0 && Math.random() < 0.7;
  
  if (useCityBased) {
    const city = selectCityByWeight(cities);
    
    // SMART FIX: For coastal cities, use smaller radius to stay close to city but avoid water
    // Don't move the city center - just use tighter distribution
    let cityLat = city.lat;
    let cityLng = city.lng;
    
    // Check if city is coastal (lng > -40.0 means it's on the coast)
    const isCoastalCity = cityLng > -40.0;
    
    // For Bahia specifically, use ULTRA-TIGHT radius to avoid water inlets and bays
    const isBahiaCoastal = stateCode === 'BA' && cityLng > -39.5;
    
    // Try up to 150 times to find a valid coordinate near city (not in water)
    let attempts = 0;
    while (attempts < 150) {
      // Use polar coordinates for more organic circular clusters (prevents vertical/linear patterns)
      // ULTRA-TIGHT radius for Bahia coastal (0.25 degrees = ~28km) to avoid water inlets
      // Tighter radius for other coastal cities (0.4 degrees = ~44km)
      // Wider radius for inland cities (0.8 degrees = ~90km)
      const maxRadius = isBahiaCoastal ? 0.25 : (isCoastalCity ? 0.4 : 0.8);
      
      // Polar coordinate approach: random angle + random radius for circular distribution
      const angle = Math.random() * Math.PI * 2; // Random angle 0-360 degrees
      const radius = Math.sqrt(Math.random()) * maxRadius; // Square root for uniform distribution in circle
      
      // Convert polar to cartesian (lat/lng)
      const offsetLat = Math.cos(angle) * radius;
      const offsetLng = Math.sin(angle) * radius;
      
      // Apply slight Gaussian variation to break perfect circles
      const gaussianVariation = 0.15; // Small variation
      let lat = cityLat + offsetLat + gaussianRandom(0, gaussianVariation);
      let lng = cityLng + offsetLng + gaussianRandom(0, gaussianVariation);

      // Clamp to state bounds
      lat = Math.max(bounds.minLat, Math.min(bounds.maxLat, lat));
      lng = Math.max(bounds.minLng, Math.min(bounds.maxLng, lng));

      // Final validation against Brazil bounds
      lat = Math.max(BRAZIL_BOUNDS.min_lat, Math.min(BRAZIL_BOUNDS.max_lat, lat));
      lng = Math.max(BRAZIL_BOUNDS.min_lng, Math.min(BRAZIL_BOUNDS.max_lng, lng));

      // POST-PROCESSING: Force inland if still in water (safety net)
      const safe = forceInland(lat, lng, stateCode);
      if (!isLikelyWater(safe.lat, safe.lng)) {
        return safe;
      }
      
      attempts++;
    }
  }

  // Fallback to even state distribution (30% of time, or if city-based failed)
  // Try up to 150 times to find a valid coordinate (not in water)
  let attempts = 0;
  while (attempts < 150) {
    // Use polar coordinates for more organic distribution (prevents vertical/linear patterns)
    const angle = Math.random() * Math.PI * 2; // Random angle
    const radius = Math.sqrt(Math.random()) * 1.0; // Uniform distribution in circle
    
    // Convert polar to cartesian
    const offsetLat = Math.cos(angle) * radius;
    const offsetLng = Math.sin(angle) * radius;
    
    // Apply slight Gaussian variation
    let lat = state.lat + offsetLat + gaussianRandom(0, 0.2);
    let lng = state.lng + offsetLng + gaussianRandom(0, 0.2);

    // Clamp to state bounds
    lat = Math.max(bounds.minLat, Math.min(bounds.maxLat, lat));
    lng = Math.max(bounds.minLng, Math.min(bounds.maxLng, lng));

    // Final validation against Brazil bounds
    lat = Math.max(BRAZIL_BOUNDS.min_lat, Math.min(BRAZIL_BOUNDS.max_lat, lat));
    lng = Math.max(BRAZIL_BOUNDS.min_lng, Math.min(BRAZIL_BOUNDS.max_lng, lng));

    // POST-PROCESSING: Force inland if still in water (safety net)
    const safe = forceInland(lat, lng, stateCode);
    if (!isLikelyWater(safe.lat, safe.lng)) {
      return safe;
    }
    
    attempts++;
  }
  
  // If we couldn't find a good coordinate after 150 attempts, use a conservative fallback
  // Move further inland (reduce lng by 2 degrees) using polar coordinates
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.sqrt(Math.random()) * 0.8;
  const offsetLat = Math.cos(angle) * radius;
  const offsetLng = Math.sin(angle) * radius - 2.0; // Move west (inland)
  let lat = state.lat + offsetLat;
  let lng = state.lng + offsetLng;
  
  lat = Math.max(bounds.minLat, Math.min(bounds.maxLat, lat));
  lng = Math.max(bounds.minLng, Math.min(bounds.maxLng, lng));
  lat = Math.max(BRAZIL_BOUNDS.min_lat, Math.min(BRAZIL_BOUNDS.max_lat, lat));
  lng = Math.max(BRAZIL_BOUNDS.min_lng, Math.min(BRAZIL_BOUNDS.max_lng, lng));
  
  return { lat, lng };
}

// Tower distribution by region (18,500 total) - EXCLUDING NORTH REGION (except Tocantins)
const TOWER_DISTRIBUTION = {
  // North: 0,      // EXCLUDED - AC, AP, AM, PA, RO, RR (TO added to Center-West)
  Northeast: 5000,  // AL, BA, CE, MA, PB, PE, PI, RN, SE
  'Center-West': 3500, // DF, GO, MT, MS, TO (Tocantins added - 500 towers)
  Southeast: 7000,  // ES, MG, RJ, SP
  South: 3000,      // PR, RS, SC
};

// Distribution within each region - EXCLUDING NORTH (except Tocantins)
const REGION_STATE_DISTRIBUTION: Record<string, string[]> = {
  // North: ['PA', 'AM', 'AC', 'RO', 'RR', 'AP'], // EXCLUDED (TO moved to Center-West)
  Northeast: ['BA', 'PE', 'CE', 'MA', 'PB', 'PI', 'RN', 'AL', 'SE'],
  'Center-West': ['GO', 'MT', 'MS', 'DF', 'TO'], // Tocantins added
  Southeast: ['SP', 'MG', 'RJ', 'ES'],
  South: ['RS', 'PR', 'SC'],
};

/**
 * Generate mock towers
 */
export function generateMockTowers(): Tower[] {
  const towers: Tower[] = [];
  let towerIndex = 1;

  const statuses: Array<'active' | 'maintenance' | 'inactive'> = ['active', 'maintenance', 'inactive'];
  const priorities: Array<'High' | 'Medium' | 'Low'> = ['High', 'Medium', 'Low'];
  const zoneTypes: Array<'Metro' | 'Urban' | 'Rural'> = ['Metro', 'Urban', 'Rural'];
  const towerTypes = ['Lattice', 'Monopole', 'Guyed'];

  // Generate towers for each region
  Object.entries(TOWER_DISTRIBUTION).forEach(([region, count]) => {
    const states = REGION_STATE_DISTRIBUTION[region];
    const towersPerState = Math.floor(count / states.length);
    const remainder = count % states.length;

    states.forEach((stateCode, stateIndex) => {
      const stateTowerCount = towersPerState + (stateIndex < remainder ? 1 : 0);
      const state = BRAZIL_STATES[stateCode as keyof typeof BRAZIL_STATES];

      for (let i = 0; i < stateTowerCount; i++) {
        let { lat, lng } = generateCoordinateInState(stateCode);
        
        // FINAL SAFETY CHECK: Post-process to ensure no water points slip through
        if (isLikelyWater(lat, lng)) {
          const safe = forceInland(lat, lng, stateCode);
          lat = safe.lat;
          lng = safe.lng;
        }
        
        const status = statuses[towerIndex % statuses.length];
        const priority = priorities[towerIndex % priorities.length];
        const zoneType = zoneTypes[towerIndex % zoneTypes.length];
        const zone = `Zone ${(towerIndex % 17) + 1}`;

        // Realistic attributes
        const height = 30 + Math.random() * 50; // 30-80m
        const signalStrength = 60 + Math.random() * 40; // 60-100%
        const uptime = 85 + Math.random() * 15; // 85-100%
        const operatorCount = Math.floor(Math.random() * 5) + 1; // 1-5

        // Maintenance dates
        const daysAgo = Math.random() * 180; // 0-180 days ago
        const daysAhead = Math.random() * 90; // 0-90 days ahead
        const lastMaintenance = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
        const nextMaintenance = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);

        towers.push({
          id: `NCA-${String(towerIndex).padStart(6, '0')}`,
          lat,
          lng,
          zone,
          zoneType,
          region: state.region === 'North' && stateCode === 'TO' ? 'Center-West' : (state.region as 'Northeast' | 'Center-West' | 'Southeast' | 'South'),
          state: stateCode,
          stateName: state.name,
          status,
          priority,
          height,
          signalStrength,
          uptime,
          operatorCount,
          lastMaintenance: lastMaintenance.toLocaleDateString('pt-BR'),
          nextMaintenance: nextMaintenance.toLocaleDateString('pt-BR'),
          towerType: towerTypes[towerIndex % towerTypes.length],
          siteCode: `SITE-${stateCode}-${String(i + 1).padStart(4, '0')}`,
        });

        towerIndex++;
      }
    });
  });

  return towers;
}

/**
 * Generate mock statistics
 */
export function generateMockStats(towers: Tower[]) {
  const byStatus = towers.reduce((acc, tower) => {
    acc[tower.status] = (acc[tower.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byPriority = towers.reduce((acc, tower) => {
    acc[tower.priority] = (acc[tower.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byRegion = towers.reduce((acc, tower) => {
    acc[tower.region] = (acc[tower.region] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byState = towers.reduce((acc, tower) => {
    acc[tower.state] = (acc[tower.state] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byZone = towers.reduce((acc, tower) => {
    acc[tower.zone] = (acc[tower.zone] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total_towers: towers.length,
    by_status: byStatus,
    by_priority: byPriority,
    by_region: byRegion,
    by_state: byState,
    by_zone: byZone,
    average_height: towers.reduce((sum, t) => sum + t.height, 0) / towers.length,
    average_signal_strength: towers.reduce((sum, t) => sum + t.signalStrength, 0) / towers.length,
    average_uptime: towers.reduce((sum, t) => sum + t.uptime, 0) / towers.length,
  };
}

