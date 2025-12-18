/**
 * Agent Service Test Suite
 * Comprehensive tests for Langbase agent service layer
 */

import { runAgent, getConversationHistory, deleteConversation } from '@/lib/langbase/agent-service'
import { langbaseClient } from '@/lib/langbase/client'

// ============================================================================
// Mock Langbase SDK
// ============================================================================

jest.mock('@/lib/langbase/client', () => ({
  langbaseClient: {
    pipes: {
      run: jest.fn(),
      getThread: jest.fn(),
      deleteThread: jest.fn(),
    },
  },
  PIPE_NAMES: {
    documentation: 'documentation-advisor',
    faq: 'faq-advisor',
    pricing: 'pricing-advisor',
    features: 'features-advisor',
    api: 'documentation-advisor',
  },
  PIPE_CONFIGS: {
    documentation: { temperature: 0.7, maxTokens: 2000, streaming: false },
    faq: { temperature: 0.6, maxTokens: 1500, streaming: false },
    pricing: { temperature: 0.7, maxTokens: 1800, streaming: false },
    features: { temperature: 0.7, maxTokens: 1800, streaming: false },
    api: { temperature: 0.7, maxTokens: 2000, streaming: false },
  },
  isValidPipeContext: (ctx: string) => 
    ['documentation', 'faq', 'pricing', 'features', 'api'].includes(ctx),
}))

// ============================================================================
// Test Suite
// ============================================================================

describe('Langbase Agent Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ==========================================================================
  // runAgent Tests
  // ==========================================================================

  describe('runAgent', () => {
    it('should run agent successfully with minimal parameters', async () => {
      const mockResponse = {
        completion: 'Test response',
        usage: { totalTokens: 150 },
        sources: [
          { 
            title: 'Test Doc', 
            content: 'Test content', 
            score: 0.95,
            metadata: { section: 'intro' }
          }
        ],
        model: 'gpt-4-turbo',
        finishReason: 'complete',
      }

      ;(langbaseClient.pipes.run as jest.Mock).mockResolvedValue(mockResponse)

      const result = await runAgent({
        message: 'Test question',
        pageContext: 'documentation',
      })

      expect(result).toEqual({
        response: 'Test response',
        conversationId: expect.any(String),
        tokensUsed: 150,
        sources: [
          { 
            title: 'Test Doc', 
            content: 'Test content', 
            score: 0.95,
            metadata: { section: 'intro' }
          }
        ],
        metadata: {
          model: 'gpt-4-turbo',
          finishReason: 'complete',
          processingTime: expect.any(Number),
        },
      })
    })

    it('should include conversationId when provided', async () => {
      const mockResponse = {
        completion: 'Response',
        usage: { totalTokens: 100 },
      }

      ;(langbaseClient.pipes.run as jest.Mock).mockResolvedValue(mockResponse)

      const result = await runAgent({
        message: 'Test',
        pageContext: 'faq',
        conversationId: 'thread_123',
      })

      expect(result.conversationId).toBe('thread_123')
    })

    it('should generate threadId when not provided', async () => {
      const mockResponse = {
        completion: 'Response',
        usage: { totalTokens: 100 },
      }

      ;(langbaseClient.pipes.run as jest.Mock).mockResolvedValue(mockResponse)

      const result = await runAgent({
        message: 'Test',
        pageContext: 'documentation',
      })

      expect(result.conversationId).toMatch(/^thread_\d+_anon$/)
    })

    it('should include userId in threadId when provided', async () => {
      const mockResponse = {
        completion: 'Response',
        usage: { totalTokens: 100 },
      }

      ;(langbaseClient.pipes.run as jest.Mock).mockResolvedValue(mockResponse)

      const result = await runAgent({
        message: 'Test',
        pageContext: 'documentation',
        userId: 'user_456',
      })

      expect(result.conversationId).toMatch(/^thread_\d+_user_456$/)
    })

    it('should handle errors gracefully', async () => {
      ;(langbaseClient.pipes.run as jest.Mock).mockRejectedValue(
        new Error('API Error')
      )

      await expect(
        runAgent({
          message: 'Test question',
          pageContext: 'documentation',
        })
      ).rejects.toMatchObject({
        code: 'AGENT_ERROR',
        message: expect.stringContaining('Failed to run agent'),
      })
    })

    it('should validate pageContext', async () => {
      await expect(
        runAgent({
          message: 'Test',
          pageContext: 'invalid' as any,
        })
      ).rejects.toMatchObject({
        code: 'INVALID_CONTEXT',
      })
    })

    it('should track processing time', async () => {
      const mockResponse = {
        completion: 'Response',
        usage: { totalTokens: 100 },
      }

      ;(langbaseClient.pipes.run as jest.Mock).mockResolvedValue(mockResponse)

      const result = await runAgent({
        message: 'Test',
        pageContext: 'documentation',
      })

      expect(result.metadata?.processingTime).toBeGreaterThan(0)
      expect(typeof result.metadata?.processingTime).toBe('number')
    })
  })

  // ==========================================================================
  // getConversationHistory Tests
  // ==========================================================================

  describe('getConversationHistory', () => {
    it('should retrieve conversation history', async () => {
      const mockHistory = {
        messages: [
          { 
            id: '1', 
            role: 'user', 
            content: 'Hello', 
            timestamp: '2025-01-01T00:00:00Z' 
          },
          { 
            id: '2', 
            role: 'assistant', 
            content: 'Hi!', 
            timestamp: '2025-01-01T00:00:01Z',
            sources: [{ title: 'Doc 1', content: 'Content', score: 0.9 }]
          },
        ],
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:01Z',
      }

      ;(langbaseClient.pipes.getThread as jest.Mock).mockResolvedValue(mockHistory)

      const result = await getConversationHistory('test-thread-id')

      expect(result.threadId).toBe('test-thread-id')
      expect(result.messages).toHaveLength(2)
      expect(result.messages[0].role).toBe('user')
      expect(result.messages[1].role).toBe('assistant')
      expect(result.messages[1].sources).toBeDefined()
    })

    it('should handle errors when retrieving history', async () => {
      ;(langbaseClient.pipes.getThread as jest.Mock).mockRejectedValue(
        new Error('Thread not found')
      )

      await expect(
        getConversationHistory('invalid-thread')
      ).rejects.toMatchObject({
        code: 'HISTORY_ERROR',
      })
    })

    it('should validate conversationId parameter', async () => {
      await expect(
        getConversationHistory('')
      ).rejects.toMatchObject({
        code: 'INVALID_THREAD_ID',
      })
    })
  })

  // ==========================================================================
  // deleteConversation Tests
  // ==========================================================================

  describe('deleteConversation', () => {
    it('should delete conversation successfully', async () => {
      ;(langbaseClient.pipes.deleteThread as jest.Mock).mockResolvedValue(undefined)

      await expect(
        deleteConversation('thread-to-delete')
      ).resolves.toBeUndefined()

      expect(langbaseClient.pipes.deleteThread).toHaveBeenCalledWith('thread-to-delete')
    })

    it('should handle deletion errors', async () => {
      ;(langbaseClient.pipes.deleteThread as jest.Mock).mockRejectedValue(
        new Error('Delete failed')
      )

      await expect(
        deleteConversation('thread-id')
      ).rejects.toMatchObject({
        code: 'DELETE_ERROR',
      })
    })

    it('should validate conversationId parameter', async () => {
      await expect(
        deleteConversation('')
      ).rejects.toMatchObject({
        code: 'INVALID_THREAD_ID',
      })
    })
  })
})

