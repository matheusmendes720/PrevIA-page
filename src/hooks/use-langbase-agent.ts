/**
 * useLangbaseAgent Hook
 * Production-grade React hook for Langbase agent interactions
 */

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { PipeContext } from '@/lib/langbase/client'
import type { AgentResponse, AgentSource } from '@/lib/langbase/types'

// ============================================================================
// Types
// ============================================================================

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: AgentSource[]
  tokensUsed?: number
}

interface UseLangbaseAgentOptions {
  pageContext: PipeContext
  userId?: string
  onError?: (error: Error) => void
  autoSave?: boolean
}

interface UseLangbaseAgentReturn {
  messages: Message[]
  loading: boolean
  error: Error | null
  conversationId: string | null
  sendMessage: (message: string) => Promise<void>
  clearConversation: () => void
  deleteConversation: () => Promise<void>
  loadHistory: () => Promise<void>
  totalTokens: number
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useLangbaseAgent(
  options: UseLangbaseAgentOptions
): UseLangbaseAgentReturn {
  const { pageContext, userId, onError, autoSave = true } = options

  // ========================================================================
  // State
  // ========================================================================

  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [totalTokens, setTotalTokens] = useState(0)

  const abortControllerRef = useRef<AbortController | null>(null)

  // ========================================================================
  // Auto-save to localStorage
  // ========================================================================

  useEffect(() => {
    if (autoSave && conversationId && messages.length > 0) {
      const key = `langbase_conversation_${pageContext}_${conversationId}`
      const data = {
        conversationId,
        messages,
        totalTokens,
        lastUpdated: new Date().toISOString(),
      }
      
      try {
        localStorage.setItem(key, JSON.stringify(data))
      } catch (err) {
        console.error('Failed to save conversation to localStorage:', err)
      }
    }
  }, [messages, conversationId, totalTokens, pageContext, autoSave])

  // ========================================================================
  // Load history on mount
  // ========================================================================

  useEffect(() => {
    if (autoSave && conversationId) {
      const key = `langbase_conversation_${pageContext}_${conversationId}`
      const saved = localStorage.getItem(key)
      
      if (saved) {
        try {
          const data = JSON.parse(saved)
          setMessages(data.messages || [])
          setTotalTokens(data.totalTokens || 0)
        } catch (err) {
          console.error('Failed to load saved conversation:', err)
        }
      }
    }
  }, [conversationId, pageContext, autoSave])

  // ========================================================================
  // Send Message
  // ========================================================================

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || loading) return

      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()

      setLoading(true)
      setError(null)

      // Add user message immediately for better UX
      const userMessage: Message = {
        id: `user_${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, userMessage])

      try {
        const response = await fetch('/api/langbase-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            pageContext,
            conversationId,
            userId,
          }),
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to get response')
        }

        const data: AgentResponse = await response.json()

        // Add assistant message
        const assistantMessage: Message = {
          id: `assistant_${Date.now()}`,
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          sources: data.sources,
          tokensUsed: data.tokensUsed,
        }

        setMessages(prev => [...prev, assistantMessage])
        setConversationId(data.conversationId)
        setTotalTokens(prev => prev + (data.tokensUsed || 0))
      } catch (err: any) {
        if (err.name === 'AbortError') {
          // Request was cancelled, don't show error
          return
        }

        const errorObj = err instanceof Error ? err : new Error('Unknown error')
        setError(errorObj)

        // Add error message
        const errorMessage: Message = {
          id: `error_${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, an error occurred while processing your request. Please try again.',
          timestamp: new Date(),
        }

        setMessages(prev => [...prev, errorMessage])

        if (onError) {
          onError(errorObj)
        }
      } finally {
        setLoading(false)
        abortControllerRef.current = null
      }
    },
    [loading, pageContext, conversationId, userId, onError]
  )

  // ========================================================================
  // Clear Conversation
  // ========================================================================

  const clearConversation = useCallback(() => {
    setMessages([])
    setConversationId(null)
    setTotalTokens(0)
    setError(null)

    if (autoSave && conversationId) {
      const key = `langbase_conversation_${pageContext}_${conversationId}`
      try {
        localStorage.removeItem(key)
      } catch (err) {
        console.error('Failed to clear conversation from localStorage:', err)
      }
    }
  }, [conversationId, pageContext, autoSave])

  // ========================================================================
  // Delete Conversation (server-side)
  // ========================================================================

  const deleteConversation = useCallback(async () => {
    if (!conversationId) return

    try {
      await fetch(`/api/langbase-agent?conversationId=${conversationId}`, {
        method: 'DELETE',
      })

      clearConversation()
    } catch (err) {
      console.error('Failed to delete conversation:', err)
      const errorObj = err instanceof Error ? err : new Error('Delete failed')
      setError(errorObj)
      
      if (onError) {
        onError(errorObj)
      }
    }
  }, [conversationId, clearConversation, onError])

  // ========================================================================
  // Load History (server-side)
  // ========================================================================

  const loadHistory = useCallback(async () => {
    if (!conversationId) return

    setLoading(true)

    try {
      const response = await fetch(
        `/api/langbase-agent?conversationId=${conversationId}`
      )

      if (!response.ok) {
        throw new Error('Failed to load history')
      }

      const history = await response.json()

      setMessages(
        history.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          sources: msg.sources,
        }))
      )
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Load failed')
      setError(errorObj)
      
      if (onError) {
        onError(errorObj)
      }
    } finally {
      setLoading(false)
    }
  }, [conversationId, onError])

  // ========================================================================
  // Return Hook Interface
  // ========================================================================

  return {
    messages,
    loading,
    error,
    conversationId,
    sendMessage,
    clearConversation,
    deleteConversation,
    loadHistory,
    totalTokens,
  }
}

// ============================================================================
// Export
// ============================================================================

export default useLangbaseAgent


