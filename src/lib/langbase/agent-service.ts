/**
 * Langbase Agent Service Layer
 * Production-grade service for agent operations
 */

import { langbaseClient, PIPE_NAMES, PIPE_CONFIGS, isValidPipeContext } from './client'
import type {
  AgentRequest,
  AgentResponse,
  ConversationHistory,
  AgentError,
  AgentSource,
  PipeContext,
} from './types'

// ============================================================================
// Core Agent Operations
// ============================================================================

/**
 * Run Langbase agent with automatic memory and retrieval
 * 
 * @param req - Agent request with message and context
 * @returns Agent response with answer, sources, and metadata
 */
export async function runAgent(req: AgentRequest): Promise<AgentResponse> {
  // Validate pipe context
  if (!isValidPipeContext(req.pageContext)) {
    throw {
      code: 'INVALID_CONTEXT',
      message: `Invalid page context: ${req.pageContext}`,
      details: { validContexts: Object.keys(PIPE_NAMES) },
    } as AgentError
  }

  const pipeName = PIPE_NAMES[req.pageContext]
  const config = PIPE_CONFIGS[req.pageContext]
  
  // Generate thread ID if not provided (user-based or anonymous)
  const threadId =
    req.conversationId || `thread_${Date.now()}_${req.userId || 'anon'}`

  const startTime = Date.now()

  try {
    const result = await langbaseClient.pipes.run({
      name: pipeName,
      messages: [
        {
          role: 'user',
          content: req.message,
        },
      ],
      threadId,
      ...config,
      metadata: {
        ...req.metadata,
        pageContext: req.pageContext,
        userId: req.userId,
        timestamp: new Date().toISOString(),
      },
    })

    const processingTime = Date.now() - startTime

    return {
      response: result.completion,
      conversationId: threadId,
      tokensUsed: result.usage?.totalTokens,
      sources: result.sources?.map((s: any) => ({
        title: s.title || 'Untitled',
        content: s.content || '',
        score: s.score || 0,
        metadata: s.metadata,
      })) as AgentSource[],
      metadata: {
        model: result.model || pipeName,
        finishReason: result.finishReason || 'complete',
        processingTime,
      },
    }
  } catch (error: any) {
    console.error('Langbase agent error:', error)
    
    throw {
      code: error.code || 'AGENT_ERROR',
      message: error.message || 'Failed to run agent',
      details: {
        pipeName,
        threadId,
        error: error.toString(),
      },
    } as AgentError
  }
}

// ============================================================================
// Conversation History Operations
// ============================================================================

/**
 * Get conversation history for a thread
 * 
 * @param conversationId - Thread ID to retrieve
 * @returns Complete conversation history with messages
 */
export async function getConversationHistory(
  conversationId: string
): Promise<ConversationHistory> {
  if (!conversationId) {
    throw {
      code: 'INVALID_THREAD_ID',
      message: 'Conversation ID is required',
      details: null,
    } as AgentError
  }

  try {
    const thread = await langbaseClient.pipes.getThread(conversationId)

    return {
      threadId: conversationId,
      messages: thread.messages.map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        sources: msg.sources,
      })),
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
    }
  } catch (error: any) {
    console.error('Get history error:', error)
    
    throw {
      code: 'HISTORY_ERROR',
      message: 'Failed to retrieve conversation history',
      details: {
        conversationId,
        error: error.toString(),
      },
    } as AgentError
  }
}

/**
 * Delete conversation thread
 * 
 * @param conversationId - Thread ID to delete
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  if (!conversationId) {
    throw {
      code: 'INVALID_THREAD_ID',
      message: 'Conversation ID is required',
      details: null,
    } as AgentError
  }

  try {
    await langbaseClient.pipes.deleteThread(conversationId)
  } catch (error: any) {
    console.error('Delete conversation error:', error)
    
    throw {
      code: 'DELETE_ERROR',
      message: 'Failed to delete conversation',
      details: {
        conversationId,
        error: error.toString(),
      },
    } as AgentError
  }
}

// ============================================================================
// Streaming Operations
// ============================================================================

/**
 * Stream agent response for real-time UX
 * 
 * @param req - Agent request with message and context
 * @yields Chunks of agent response
 */
export async function* streamAgent(req: AgentRequest): AsyncGenerator<string> {
  if (!isValidPipeContext(req.pageContext)) {
    throw {
      code: 'INVALID_CONTEXT',
      message: `Invalid page context: ${req.pageContext}`,
      details: { validContexts: Object.keys(PIPE_NAMES) },
    } as AgentError
  }

  const pipeName = PIPE_NAMES[req.pageContext]
  const config = PIPE_CONFIGS[req.pageContext]
  const threadId =
    req.conversationId || `thread_${Date.now()}_${req.userId || 'anon'}`

  try {
    const stream = await langbaseClient.pipes.run({
      name: pipeName,
      messages: [{ role: 'user', content: req.message }],
      threadId,
      ...config,
      streaming: true,
      metadata: {
        ...req.metadata,
        pageContext: req.pageContext,
        userId: req.userId,
        timestamp: new Date().toISOString(),
      },
    })

    for await (const chunk of stream) {
      if (chunk.completion) {
        yield chunk.completion
      }
    }
  } catch (error: any) {
    console.error('Streaming error:', error)
    
    throw {
      code: 'STREAM_ERROR',
      message: 'Failed to stream agent response',
      details: {
        pipeName,
        threadId,
        error: error.toString(),
      },
    } as AgentError
  }
}

// ============================================================================
// Batch Operations
// ============================================================================

/**
 * Run multiple agent requests in parallel
 * 
 * @param requests - Array of agent requests
 * @returns Array of agent responses
 */
export async function runAgentBatch(
  requests: AgentRequest[]
): Promise<AgentResponse[]> {
  try {
    const results = await Promise.allSettled(
      requests.map(req => runAgent(req))
    )

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        // Return error response
        return {
          response: 'Error processing request',
          conversationId: requests[index].conversationId || '',
          tokensUsed: 0,
          sources: [],
          metadata: {
            model: 'error',
            finishReason: 'error',
            processingTime: 0,
          },
        }
      }
    })
  } catch (error: any) {
    console.error('Batch operation error:', error)
    throw {
      code: 'BATCH_ERROR',
      message: 'Failed to process batch requests',
      details: error,
    } as AgentError
  }
}

// ============================================================================
// Export all functions
// ============================================================================

export default {
  runAgent,
  getConversationHistory,
  deleteConversation,
  streamAgent,
  runAgentBatch,
}

