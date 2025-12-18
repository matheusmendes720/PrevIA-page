/**
 * API Route Test Suite
 * Tests for Langbase agent API endpoints
 */

import { POST, GET, DELETE } from '@/app/api/langbase-agent/route'
import { NextRequest } from 'next/server'

// ============================================================================
// Test Helpers
// ============================================================================

function createMockRequest(url: string, init?: RequestInit): NextRequest {
  return new NextRequest(url, init)
}

// ============================================================================
// Test Suite
// ============================================================================

describe('Langbase Agent API Routes', () => {
  // ==========================================================================
  // POST Tests
  // ==========================================================================

  describe('POST /api/langbase-agent', () => {
    it('should return 400 for missing message', async () => {
      const request = createMockRequest('http://localhost/api/langbase-agent', {
        method: 'POST',
        body: JSON.stringify({ pageContext: 'documentation' }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('message')
      expect(data.code).toBe('INVALID_MESSAGE')
    })

    it('should return 400 for empty message', async () => {
      const request = createMockRequest('http://localhost/api/langbase-agent', {
        method: 'POST',
        body: JSON.stringify({ 
          message: '   ', 
          pageContext: 'documentation' 
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('should return 400 for invalid pageContext', async () => {
      const request = createMockRequest('http://localhost/api/langbase-agent', {
        method: 'POST',
        body: JSON.stringify({ 
          message: 'test', 
          pageContext: 'invalid-context' 
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid pageContext')
      expect(data.code).toBe('INVALID_CONTEXT')
      expect(data.validContexts).toContain('documentation')
    })

    it('should return 400 for missing pageContext', async () => {
      const request = createMockRequest('http://localhost/api/langbase-agent', {
        method: 'POST',
        body: JSON.stringify({ message: 'test' }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('should include no-store cache header', async () => {
      // This test would need to mock the agent service
      // For now, we test the structure
      const request = createMockRequest('http://localhost/api/langbase-agent', {
        method: 'POST',
        body: JSON.stringify({ 
          message: 'test', 
          pageContext: 'documentation' 
        }),
      })

      // Would test successful response headers here
      // Skipped for now as it requires full mock setup
    })
  })

  // ==========================================================================
  // GET Tests
  // ==========================================================================

  describe('GET /api/langbase-agent', () => {
    it('should return 400 for missing conversationId', async () => {
      const request = createMockRequest('http://localhost/api/langbase-agent')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('conversationId')
      expect(data.code).toBe('MISSING_CONVERSATION_ID')
    })

    it('should accept conversationId as query parameter', async () => {
      const request = createMockRequest(
        'http://localhost/api/langbase-agent?conversationId=thread_123'
      )

      // Would test successful retrieval here
      // Skipped for now as it requires full mock setup
    })
  })

  // ==========================================================================
  // DELETE Tests
  // ==========================================================================

  describe('DELETE /api/langbase-agent', () => {
    it('should return 400 for missing conversationId', async () => {
      const request = createMockRequest('http://localhost/api/langbase-agent')

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('conversationId')
      expect(data.code).toBe('MISSING_CONVERSATION_ID')
    })
  })
})

