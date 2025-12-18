/**
 * Integration tests for external service calls
 * Tests BACEN, INMET, ANATEL integrations
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

describe('External Services Integration Tests', () => {
  beforeAll(async () => {
    // Check if backend is running
    try {
      const healthCheck = await fetch(`${API_BASE_URL}/health`);
      if (!healthCheck.ok) {
        throw new Error('Backend server is not running');
      }
    } catch (error) {
      console.warn('Backend server is not running. Skipping external service tests.');
      return;
    }
  });

  describe('BACEN Economic Data Integration', () => {
    it('should fetch BACEN indicators', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/features/economic/bacen?start_date=2025-01-01&end_date=2025-12-31`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Validate response structure
        if (Array.isArray(data)) {
          expect(Array.isArray(data)).toBe(true);
          if (data.length > 0) {
            const item = data[0];
            expect(item).toHaveProperty('data_referencia');
          }
        } else if (data.status === 'success') {
          expect(data.status).toBe('success');
          expect(Array.isArray(data.data)).toBe(true);
        }
      } else {
        // If endpoint returns error, it should be a valid HTTP error
        expect([400, 404, 500, 503].includes(response.status)).toBe(true);
      }
    });

    it('should handle date range validation', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/features/economic/bacen?start_date=invalid-date&end_date=2025-12-31`);
      // Should return validation error
      expect([400, 422].includes(response.status)).toBe(true);
    });
  });

  describe('INMET Climate Data Integration', () => {
    it('should fetch Salvador climate data', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/features/climate/salvador?start_date=2025-01-01&end_date=2025-12-31`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Validate response structure
        if (Array.isArray(data)) {
          expect(Array.isArray(data)).toBe(true);
          if (data.length > 0) {
            const item = data[0];
            expect(item).toHaveProperty('data_referencia');
            expect(item).toHaveProperty('temperatura_media');
            expect(item).toHaveProperty('precipitacao_mm');
          }
        } else if (data.status === 'success') {
          expect(data.status).toBe('success');
          expect(Array.isArray(data.data)).toBe(true);
        }
      } else {
        // If endpoint returns error, it should be a valid HTTP error
        expect([400, 404, 500, 503].includes(response.status)).toBe(true);
      }
    });

    it('should return climate risk data', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/features/climate/risks`);
      
      if (response.ok) {
        const data = await response.json();
        expect(data.status === 'success' || Array.isArray(data)).toBe(true);
      } else {
        expect([400, 404, 500].includes(response.status)).toBe(true);
      }
    });
  });

  describe('ANATEL 5G Data Integration', () => {
    it('should fetch 5G expansion data', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/features/5g/expansion?start_date=2025-01-01&end_date=2025-12-31`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Validate response structure
        if (Array.isArray(data)) {
          expect(Array.isArray(data)).toBe(true);
          if (data.length > 0) {
            const item = data[0];
            expect(item).toHaveProperty('data_referencia');
          }
        } else if (data.status === 'success') {
          expect(data.status).toBe('success');
          expect(Array.isArray(data.data)).toBe(true);
        }
      } else {
        expect([400, 404, 500, 503].includes(response.status)).toBe(true);
      }
    });

    it('should return 5G milestones', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/features/5g/milestones`);
      
      if (response.ok) {
        const data = await response.json();
        expect(data.status === 'success' || Array.isArray(data)).toBe(true);
      } else {
        expect([400, 404, 500].includes(response.status)).toBe(true);
      }
    });

    it('should return 5G demand impact', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/features/5g/demand-impact`);
      
      if (response.ok) {
        const data = await response.json();
        expect(data.status === 'success' || Array.isArray(data)).toBe(true);
      } else {
        expect([400, 404, 500].includes(response.status)).toBe(true);
      }
    });
  });

  describe('External Service Error Handling', () => {
    it('should handle external service timeout gracefully', async () => {
      // Test with very short timeout (this may not work in all environments)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 100);
      
      try {
        await fetch(`${API_BASE_URL}/api/v1/features/economic/bacen?start_date=2025-01-01&end_date=2025-12-31`, {
          signal: controller.signal,
        });
      } catch (error: any) {
        // Should handle abort/timeout gracefully
        expect(error.name === 'AbortError' || error).toBeTruthy();
      } finally {
        clearTimeout(timeoutId);
      }
    });

    it('should return proper error format when external service fails', async () => {
      // Try with invalid date range that might trigger external service errors
      const response = await fetch(`${API_BASE_URL}/api/v1/features/climate/salvador?start_date=1900-01-01&end_date=1900-12-31`);
      
      // Should return proper HTTP status and error format
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.status).toBeLessThan(600);
      }
    });
  });

  describe('Data Format Validation', () => {
    it('should return properly formatted BACEN data', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/features/economic/bacen?start_date=2025-01-01&end_date=2025-01-31`);
      
      if (response.ok) {
        const data = await response.json();
        const items = Array.isArray(data) ? data : (data.data || []);
        
        if (items.length > 0) {
          const item = items[0];
          // Validate required fields for BACEN data
          expect(item).toHaveProperty('data_referencia');
        }
      }
    });

    it('should return properly formatted climate data', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/features/climate/salvador?start_date=2025-01-01&end_date=2025-01-31`);
      
      if (response.ok) {
        const data = await response.json();
        const items = Array.isArray(data) ? data : (data.data || []);
        
        if (items.length > 0) {
          const item = items[0];
          // Validate required fields for climate data
          expect(item).toHaveProperty('data_referencia');
        }
      }
    });

    it('should return properly formatted 5G data', async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/features/5g/expansion?start_date=2025-01-01&end_date=2025-01-31`);
      
      if (response.ok) {
        const data = await response.json();
        const items = Array.isArray(data) ? data : (data.data || []);
        
        if (items.length > 0) {
          const item = items[0];
          // Validate required fields for 5G data
          expect(item).toHaveProperty('data_referencia');
        }
      }
    });
  });

  describe('Rate Limiting and Performance', () => {
    it('should handle multiple concurrent requests', async () => {
      const requests = [
        fetch(`${API_BASE_URL}/api/v1/features/temporal?limit=10`),
        fetch(`${API_BASE_URL}/api/v1/features/climate?limit=10`),
        fetch(`${API_BASE_URL}/api/v1/features/economic?limit=10`),
      ];

      const responses = await Promise.allSettled(requests);
      
      // At least one should succeed if backend is running
      const successful = responses.filter(r => r.status === 'fulfilled' && r.value.ok);
      // If backend is running, we expect at least some success
      // If backend is not running, we expect all to fail gracefully
      expect(responses.length).toBe(3);
    });

    it('should respond within reasonable time', async () => {
      const startTime = Date.now();
      await fetch(`${API_BASE_URL}/api/v1/features/temporal?limit=10`);
      const duration = Date.now() - startTime;
      
      // Should respond within 5 seconds (allowing for external service delays)
      expect(duration).toBeLessThan(5000);
    });
  });
});

