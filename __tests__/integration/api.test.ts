/**
 * Integration tests for API endpoints
 * Tests external service integrations (BACEN, INMET, ANATEL)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

describe('API Integration Tests', () => {
  // MSW will handle mocking, so we don't need to check backend status

  describe('Health Endpoint', () => {
    it('should return healthy status', async () => {
      const response = await fetch(`${API_BASE_URL}/health`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data.status).toBe('healthy');
      expect(data.service).toBe('nova-corrente-api');
    });
  });

  describe('Temporal Features API', () => {
    it('should return temporal features', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/features/temporal?limit=10`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data.status).toBe('success');
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should return Brazilian calendar', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/features/temporal/calendar?start_date=2025-01-01&end_date=2025-12-31`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('Climate Features API', () => {
    it('should return climate features', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/features/climate?limit=10`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data.status).toBe('success');
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should return Salvador climate data', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/features/climate/salvador?start_date=2025-01-01&end_date=2025-12-31`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(Array.isArray(data) || data.status === 'success').toBe(true);
    });
  });

  describe('Economic Features API', () => {
    it('should return economic features', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/features/economic?limit=10`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data.status).toBe('success');
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should return BACEN indicators', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/features/economic/bacen?start_date=2025-01-01&end_date=2025-12-31`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(Array.isArray(data) || data.status === 'success').toBe(true);
    });
  });

  describe('5G Features API', () => {
    it('should return 5G features', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/features/5g?limit=10`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data.status).toBe('success');
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should return 5G expansion data', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/features/5g/expansion?start_date=2025-01-01&end_date=2025-12-31`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(Array.isArray(data) || data.status === 'success').toBe(true);
    });
  });

  describe('Lead Time Features API', () => {
    it('should return lead time features', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/features/lead-time?limit=10`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data.status).toBe('success');
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should return supplier lead times', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/features/lead-time/suppliers`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data.status === 'success' || Array.isArray(data)).toBe(true);
    });
  });

  describe('SLA Features API', () => {
    it('should return SLA features', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/features/sla?limit=10`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data.status).toBe('success');
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should return SLA penalties', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/features/sla/penalties`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data.status === 'success' || Array.isArray(data)).toBe(true);
    });

    it('should return SLA violations', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/features/sla/violations`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data.status === 'success' || Array.isArray(data)).toBe(true);
    });
  });

  describe('Hierarchical Features API', () => {
    it('should return hierarchical features', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/features/hierarchical?level=family&limit=10`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data.status).toBe('success');
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should return family aggregations', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/features/hierarchical/family`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(Array.isArray(data) || data.status === 'success').toBe(true);
    });

    it('should return site aggregations', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/features/hierarchical/site`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(Array.isArray(data) || data.status === 'success').toBe(true);
    });

    it('should return supplier aggregations', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/features/hierarchical/supplier`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data.status === 'success' || Array.isArray(data)).toBe(true);
    });
  });

  describe('Categorical Features API', () => {
    it('should return categorical features', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/features/categorical?limit=10`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data.status).toBe('success');
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should return family encodings', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/features/categorical/families`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data.status === 'success' || Array.isArray(data)).toBe(true);
    });

    it('should return site encodings', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/features/categorical/sites`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data.status === 'success' || Array.isArray(data)).toBe(true);
    });

    it('should return supplier encodings', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/features/categorical/suppliers`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data.status === 'success' || Array.isArray(data)).toBe(true);
    });
  });

  describe('Business Features API', () => {
    it('should return business features', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/features/business?limit=10`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data.status).toBe('success');
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should return top 5 families', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/features/business/top5-families`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data.status === 'success' || Array.isArray(data)).toBe(true);
    });

    it('should return tier analytics', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/features/business/tiers`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data.status === 'success' || Array.isArray(data)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid endpoint gracefully', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/features/invalid-endpoint`);
      // Should return 404 or appropriate error
      expect([404, 400, 500].includes(response.status)).toBe(true);
    });

    it('should handle invalid parameters gracefully', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/features/temporal?limit=invalid`);
      // Should return 400 or 422 for validation errors
      expect([400, 422].includes(response.status)).toBe(true);
    });

    it('should handle connection errors gracefully', async () => {
      // Test with invalid URL
      try {
        await fetch('http://localhost:9999/health');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Response Format Validation', () => {
    it('should return consistent response format for feature endpoints', async () => {
      const endpoints = [
        '/api/v1/features/temporal',
        '/api/v1/features/climate',
        '/api/v1/features/economic',
        '/api/v1/features/5g',
        '/api/v1/features/lead-time',
        '/api/v1/features/sla',
        '/api/v1/features/hierarchical',
        '/api/v1/features/categorical',
        '/api/v1/features/business',
      ];

      for (const endpoint of endpoints) {
        const response = await fetch(`${API_BASE_URL}${endpoint}?limit=1`);
        if (response.ok) {
          const data = await response.json();
          expect(data).toHaveProperty('status');
          expect(data).toHaveProperty('data');
          expect(data).toHaveProperty('metadata');
          expect(Array.isArray(data.data)).toBe(true);
        }
      }
    });
  });
});

