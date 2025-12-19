/**
 * AI Assistant Page
 * Universal interface for all Langbase agents with context switching
 */

'use client'

import { useState } from 'react'
import ChatWidget from '@/components/langbase/ChatWidget'
import type { PipeContext } from '@/lib/langbase/client'

// ============================================================================
// Context Configuration
// ============================================================================

interface ContextConfig {
  value: PipeContext
  label: string
  description: string
  icon: string
}

const CONTEXTS: ContextConfig[] = [
  {
    value: 'documentation',
    label: 'Documentation',
    description: 'Technical guides and API references',
    icon: '📚',
  },
  {
    value: 'faq',
    label: 'FAQ',
    description: 'Frequently asked questions',
    icon: '❓',
  },
  {
    value: 'pricing',
    label: 'Pricing',
    description: 'Pricing and ROI information',
    icon: '💰',
  },
  {
    value: 'features',
    label: 'Features',
    description: 'Product features and capabilities',
    icon: '✨',
  },
]

// ============================================================================
// Component
// ============================================================================

export default function AIAssistantPage() {
  const [activeContext, setActiveContext] = useState<PipeContext>('documentation')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto p-8">
        {/* ================================================================== */}
        {/* Header */}
        {/* ================================================================== */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Assistant
          </h1>
          <p className="text-xl text-gray-600">
            Get instant answers from our specialized AI advisors
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Powered by Langbase Serverless Agents
          </p>
        </div>

        {/* ================================================================== */}
        {/* Context Selector */}
        {/* ================================================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {CONTEXTS.map(ctx => (
            <button
              key={ctx.value}
              onClick={() => setActiveContext(ctx.value)}
              className={`p-6 rounded-xl border-2 text-left transition-all transform hover:scale-105 ${
                activeContext === ctx.value
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <div className="text-3xl mb-3">{ctx.icon}</div>
              <h3 className="font-semibold text-lg mb-1">{ctx.label}</h3>
              <p className="text-sm text-gray-600">{ctx.description}</p>
            </button>
          ))}
        </div>

        {/* ================================================================== */}
        {/* Chat Interface */}
        {/* ================================================================== */}
        <div className="max-w-4xl mx-auto">
          <ChatWidget
            key={activeContext} // Re-mount on context change for fresh conversation
            context={activeContext}
            className="h-[600px] shadow-2xl"
            showSources={true}
            showTokenUsage={true}
          />
        </div>

        {/* ================================================================== */}
        {/* Features Grid */}
        {/* ================================================================== */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">⚡</div>
            <h4 className="font-semibold mb-2">Instant Responses</h4>
            <p className="text-sm text-gray-600">
              Get immediate answers powered by GPT-4 Turbo
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">🎯</div>
            <h4 className="font-semibold mb-2">Context-Aware</h4>
            <p className="text-sm text-gray-600">
              Each agent specializes in specific domains
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">📖</div>
            <h4 className="font-semibold mb-2">Source Citations</h4>
            <p className="text-sm text-gray-600">
              See exactly where answers come from
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


