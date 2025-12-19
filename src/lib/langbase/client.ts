/**
 * Langbase Client Configuration
 * Centralized client for Langbase serverless agents
 */

import type { PipeContext, PipeConfig, LangbaseConfig } from './types'

// ============================================================================
// Langbase SDK Wrapper (placeholder until SDK is installed)
// ============================================================================

/**
 * Langbase client wrapper
 * This will be replaced with actual Langbase SDK once installed
 * For now, it provides the interface structure
 */
export class Langbase {
  private config: LangbaseConfig

  constructor(config: LangbaseConfig) {
    this.config = config
  }

  get pipes() {
    return {
      run: async (params: any) => {
        // TODO: Replace with actual Langbase SDK call
        throw new Error('Langbase SDK not yet initialized. Please install @langbase/sdk')
      },
      getThread: async (threadId: string) => {
        // TODO: Replace with actual Langbase SDK call
        throw new Error('Langbase SDK not yet initialized. Please install @langbase/sdk')
      },
      deleteThread: async (threadId: string) => {
        // TODO: Replace with actual Langbase SDK call
        throw new Error('Langbase SDK not yet initialized. Please install @langbase/sdk')
      },
    }
  }

  get knowledgeBases() {
    return {
      createOrUpdate: async (params: any) => {
        // TODO: Replace with actual Langbase SDK call
        throw new Error('Langbase SDK not yet initialized. Please install @langbase/sdk')
      },
    }
  }
}

// ============================================================================
// Client Instance
// ============================================================================

/**
 * Initialize Langbase client with API credentials
 * Will be initialized once environment variables are set
 */
export const langbaseClient = new Langbase({
  apiKey: process.env.LANGBASE_API_KEY || '',
  projectId: process.env.LANGBASE_PROJECT_ID,
})

// ============================================================================
// Pipe Name Mappings
// ============================================================================

/**
 * Maps page contexts to Langbase pipe names
 * Each context has its own specialized agent
 */
export const PIPE_NAMES: Record<PipeContext, string> = {
  documentation: 'documentation-advisor',
  faq: 'faq-advisor',
  pricing: 'pricing-advisor',
  features: 'features-advisor',
  api: 'documentation-advisor', // Reuse documentation advisor for API queries
} as const

// ============================================================================
// Pipe Configurations
// ============================================================================

/**
 * Configuration settings for each pipe
 * Controls temperature, max tokens, and streaming behavior
 */
export const PIPE_CONFIGS: Record<PipeContext, PipeConfig> = {
  documentation: {
    temperature: 0.7,
    maxTokens: 2000,
    streaming: false,
  },
  faq: {
    temperature: 0.6,
    maxTokens: 1500,
    streaming: false,
  },
  pricing: {
    temperature: 0.7,
    maxTokens: 1800,
    streaming: false,
  },
  features: {
    temperature: 0.7,
    maxTokens: 1800,
    streaming: false,
  },
  api: {
    temperature: 0.7,
    maxTokens: 2000,
    streaming: false,
  },
} as const

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Type guard to validate pipe context
 */
export function isValidPipeContext(context: string): context is PipeContext {
  return context in PIPE_NAMES
}

/**
 * Get pipe name for a given context
 */
export function getPipeName(context: PipeContext): string {
  return PIPE_NAMES[context]
}

/**
 * Get configuration for a given context
 */
export function getPipeConfig(context: PipeContext): PipeConfig {
  return PIPE_CONFIGS[context]
}

// ============================================================================
// Environment Configuration
// ============================================================================

/**
 * Check if Langbase is properly configured
 */
export function isLangbaseConfigured(): boolean {
  return !!(
    process.env.LANGBASE_API_KEY &&
    process.env.LANGBASE_API_KEY !== 'lb_sk_xxxxxxxxxxxxxxxxxxxx'
  )
}

/**
 * Get configuration status for debugging
 */
export function getConfigStatus() {
  return {
    hasApiKey: !!process.env.LANGBASE_API_KEY,
    hasProjectId: !!process.env.LANGBASE_PROJECT_ID,
    isEnabled: process.env.NEXT_PUBLIC_LANGBASE_ENABLED === 'true',
    isConfigured: isLangbaseConfigured(),
  }
}

// ============================================================================
// Re-export types for consumers
// ============================================================================

export type { PipeContext, PipeConfig, LangbaseConfig } from './types'

// ============================================================================
// Export default client
// ============================================================================

export default langbaseClient


