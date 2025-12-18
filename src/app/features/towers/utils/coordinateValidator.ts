/**
 * Coordinate Validation Utilities
 * Validate and fine-tune tower coordinates
 */

// Brazil bounds (approximate)
const BRAZIL_BOUNDS = {
  north: 5.27,
  south: -33.75,
  east: -32.39,
  west: -73.99,
};

export interface CoordinateValidationResult {
  isValid: boolean;
  isOutlier: boolean;
  confidence: number; // 0-100
  issues: string[];
  suggestions?: {
    correctedLat?: number;
    correctedLng?: number;
  };
}

/**
 * Validate if coordinates are within Brazil bounds
 */
export function validateBrazilBounds(lat: number, lng: number): boolean {
  return (
    lat >= BRAZIL_BOUNDS.south &&
    lat <= BRAZIL_BOUNDS.north &&
    lng >= BRAZIL_BOUNDS.west &&
    lng <= BRAZIL_BOUNDS.east
  );
}

/**
 * Check if coordinates are within expected zone boundaries
 */
export function validateZoneBounds(
  lat: number,
  lng: number,
  zoneCenter: [number, number],
  zoneRadius: number
): boolean {
  const distance = calculateDistance(lat, lng, zoneCenter[0], zoneCenter[1]);
  return distance <= zoneRadius * 1.5; // Allow 50% margin
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Validate tower coordinates comprehensively
 */
export function validateCoordinates(
  lat: number,
  lng: number,
  zoneCenter?: [number, number],
  zoneRadius?: number
): CoordinateValidationResult {
  const issues: string[] = [];
  let confidence = 100;
  let isOutlier = false;

  // Check if coordinates are valid numbers
  if (isNaN(lat) || isNaN(lng)) {
    return {
      isValid: false,
      isOutlier: true,
      confidence: 0,
      issues: ['Invalid coordinate values (NaN)'],
    };
  }

  // Check Brazil bounds
  if (!validateBrazilBounds(lat, lng)) {
    issues.push('Coordinates outside Brazil bounds');
    confidence -= 50;
    isOutlier = true;
  }

  // Check if coordinates are zero (likely invalid)
  if (lat === 0 && lng === 0) {
    issues.push('Coordinates are zero (likely invalid)');
    confidence -= 30;
    isOutlier = true;
  }

  // Check zone bounds if provided
  if (zoneCenter && zoneRadius) {
    if (!validateZoneBounds(lat, lng, zoneCenter, zoneRadius)) {
      issues.push('Coordinates outside expected zone boundaries');
      confidence -= 20;
      isOutlier = true;
    }
  }

  // Check precision (should have at least 4 decimal places for accuracy)
  const latStr = lat.toString();
  const lngStr = lng.toString();
  const latDecimals = latStr.includes('.') ? latStr.split('.')[1].length : 0;
  const lngDecimals = lngStr.includes('.') ? lngStr.split('.')[1].length : 0;

  if (latDecimals < 4 || lngDecimals < 4) {
    issues.push('Low coordinate precision (less than 4 decimal places)');
    confidence -= 10;
  }

  return {
    isValid: issues.length === 0,
    isOutlier,
    confidence: Math.max(0, confidence),
    issues,
  };
}

/**
 * Get coordinate confidence score
 */
export function getCoordinateConfidence(
  lat: number,
  lng: number,
  zoneCenter?: [number, number],
  zoneRadius?: number
): number {
  const validation = validateCoordinates(lat, lng, zoneCenter, zoneRadius);
  return validation.confidence;
}

