/**
 * Langbase Agent Types
 * Production-grade TypeScript types for Langbase serverless agents
 */

// ============================================================================
// Core Types
// ============================================================================

export type PipeContext = 'documentation' | 'faq' | 'pricing' | 'features' | 'api'

export interface AgentRequest {
  message: string
  pageContext: PipeContext
  conversationId?: string
  userId?: string
  metadata?: Record<string, any>
}

export interface AgentResponse {
  response: string
  conversationId: string
  tokensUsed?: number
  sources?: AgentSource[]
  metadata?: {
    model: string
    finishReason: string
    processingTime?: number
  }
}

export interface AgentSource {
  title: string
  content: string
  score: number
  metadata?: Record<string, any>
}

// ============================================================================
// Conversation History Types
// ============================================================================

export interface ConversationHistory {
  threadId: string
  messages: ConversationMessage[]
  createdAt: string
  updatedAt: string
}

export interface ConversationMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  sources?: AgentSource[]
}

// ============================================================================
// Error Types
// ============================================================================

export interface AgentError {
  code: string
  message: string
  details?: any
}

export type AgentErrorCode =
  | 'AGENT_ERROR'
  | 'HISTORY_ERROR'
  | 'DELETE_ERROR'
  | 'STREAM_ERROR'
  | 'RATE_LIMIT'
  | 'UNKNOWN_ERROR'

// ============================================================================
// Langbase SDK Types (for when SDK is installed)
// ============================================================================

export interface LangbaseConfig {
  apiKey: string
  projectId?: string
}

export interface PipeRunConfig {
  name: string
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  threadId: string
  temperature?: number
  maxTokens?: number
  streaming?: boolean
  metadata?: Record<string, any>
}

export interface PipeRunResult {
  completion: string
  usage?: {
    promptTokens?: number
    completionTokens?: number
    totalTokens?: number
  }
  sources?: any[]
  model?: string
  finishReason?: string
}

// ============================================================================
// Knowledge Base Types
// ============================================================================

export interface KnowledgeDocument {
  title: string
  content: string
  metadata: {
    pageSlug: string
    sectionId?: string
    createdAt: string
  }
}

export interface KnowledgeBase {
  name: string
  documents: KnowledgeDocument[]
  settings?: {
    chunkSize?: number
    chunkOverlap?: number
    embeddingModel?: string
  }
}

// ============================================================================
// Pipe Configuration Types
// ============================================================================

export interface PipeConfig {
  temperature: number
  maxTokens: number
  streaming: boolean
}

export interface PipeDefinition {
  name: string
  description: string
  model: string
  temperature: number
  maxTokens: number
  systemPrompt: string
  knowledgeBase: string
  memory: 'auto' | 'manual'
  tools?: any[]
  retrieval?: {
    topK: number
    similarityThreshold: number
  }
}

// ============================================================================
// UI Component Types
// ============================================================================

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: AgentSource[]
  tokensUsed?: number
}

export interface UseLangbaseAgentOptions {
  pageContext: PipeContext
  userId?: string
  onError?: (error: Error) => void
  autoSave?: boolean
}

export interface UseLangbaseAgentReturn {
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


