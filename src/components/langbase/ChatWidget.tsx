/**
 * ChatWidget Component
 * Production-grade chat interface for Langbase agents
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { useLangbaseAgent } from '@/hooks/use-langbase-agent'
import type { PipeContext } from '@/lib/langbase/client'

// ============================================================================
// Component Props
// ============================================================================

interface ChatWidgetProps {
  context: PipeContext
  title?: string
  subtitle?: string
  className?: string
  userId?: string
  placeholder?: string
  showSources?: boolean
  showTokenUsage?: boolean
}

// ============================================================================
// Component Implementation
// ============================================================================

export default function ChatWidget({
  context,
  title,
  subtitle,
  className = '',
  userId,
  placeholder = 'Ask a question...',
  showSources = true,
  showTokenUsage = false,
}: ChatWidgetProps) {
  // ========================================================================
  // State & Refs
  // ========================================================================

  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    messages,
    loading,
    error,
    conversationId,
    sendMessage,
    clearConversation,
    totalTokens,
  } = useLangbaseAgent({
    pageContext: context,
    userId,
    onError: err => console.error('Agent error:', err),
  })

  // ========================================================================
  // Auto-scroll to bottom
  // ========================================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ========================================================================
  // Event Handlers
  // ========================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    await sendMessage(input)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  // ========================================================================
  // Styling Helpers
  // ========================================================================

  const getContextColor = (ctx: PipeContext) => {
    const colors = {
      documentation: 'bg-blue-500',
      faq: 'bg-green-500',
      pricing: 'bg-purple-500',
      features: 'bg-orange-500',
      api: 'bg-indigo-500',
    }
    return colors[ctx] || 'bg-gray-500'
  }

  const getContextLabel = (ctx: PipeContext) => {
    const labels = {
      documentation: 'Documentation',
      faq: 'FAQ',
      pricing: 'Pricing',
      features: 'Features',
      api: 'API',
    }
    return labels[ctx] || ctx
  }

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <div
      className={`flex flex-col border rounded-lg shadow-lg bg-white overflow-hidden ${className}`}
    >
      {/* ================================================================== */}
      {/* Header */}
      {/* ================================================================== */}
      <div
        className={`p-4 border-b text-white rounded-t-lg ${getContextColor(context)}`}
      >
        <h3 className="text-lg font-semibold">
          {title || `${getContextLabel(context)} Assistant`}
        </h3>
        {subtitle && <p className="text-sm opacity-90 mt-1">{subtitle}</p>}

        {messages.length > 0 && (
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/20">
            <button
              onClick={clearConversation}
              className="text-sm hover:underline opacity-90 hover:opacity-100 transition-opacity"
              aria-label="Clear conversation"
            >
              Clear conversation
            </button>
            {showTokenUsage && (
              <span className="text-xs opacity-80">
                {totalTokens.toLocaleString()} tokens
              </span>
            )}
          </div>
        )}
      </div>

      {/* ================================================================== */}
      {/* Messages Area */}
      {/* ================================================================== */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 h-96 bg-gray-50">
        {messages.length === 0 && !loading && (
          <div className="text-center text-gray-400 mt-8">
            <p className="text-lg mb-2">👋 Hi there!</p>
            <p className="text-sm">Start a conversation by asking a question below.</p>
          </div>
        )}

        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-900 border border-gray-200'
              }`}
            >
              {/* Message Content */}
              <div className="whitespace-pre-wrap break-words">{msg.content}</div>

              {/* Sources */}
              {showSources && msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-300/30">
                  <p className="text-xs font-semibold mb-2 opacity-80">Sources:</p>
                  <ul className="text-xs space-y-1">
                    {msg.sources.map((source, idx) => (
                      <li key={idx} className="flex items-start gap-1 opacity-80">
                        <span>•</span>
                        <span>
                          {source.title}
                          {source.score && (
                            <span className="ml-1">
                              ({(source.score * 100).toFixed(0)}%)
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Timestamp */}
              <div className="text-xs opacity-60 mt-2">
                {msg.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm text-gray-600">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800 flex items-center gap-2">
              <span>⚠️</span>
              <span>{error.message}</span>
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ================================================================== */}
      {/* Input Form */}
      {/* ================================================================== */}
      <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
            aria-label="Message input"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${getContextColor(
              context
            )} text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-label="Send message"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  )
}


