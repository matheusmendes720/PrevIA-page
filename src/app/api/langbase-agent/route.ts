/**
 * Langbase Agent API Routes
 * Next.js API handlers for agent operations
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  runAgent,
  getConversationHistory,
  deleteConversation,
} from '@/lib/langbase/agent-service'
import { isValidPipeContext } from '@/lib/langbase/client'
import type { AgentRequest } from '@/lib/langbase/types'

// ============================================================================
// POST /api/langbase-agent
// Run agent with user message
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, pageContext, conversationId, userId, metadata } = body

    // ========================================================================
    // Validation
    // ========================================================================

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { 
          error: 'Invalid or missing message',
          code: 'INVALID_MESSAGE' 
        },
        { status: 400 }
      )
    }

    if (!pageContext || !isValidPipeContext(pageContext)) {
      return NextResponse.json(
        { 
          error: `Invalid pageContext. Must be one of: documentation, faq, pricing, features, api`,
          code: 'INVALID_CONTEXT',
          validContexts: ['documentation', 'faq', 'pricing', 'features', 'api']
        },
        { status: 400 }
      )
    }

    // ========================================================================
    // Run Agent
    // ========================================================================

    const agentRequest: AgentRequest = {
      message: message.trim(),
      pageContext,
      conversationId,
      userId,
      metadata: {
        ...metadata,
        userAgent: req.headers.get('user-agent'),
        timestamp: new Date().toISOString(),
      },
    }

    const result = await runAgent(agentRequest)

    // ========================================================================
    // Return Response
    // ========================================================================

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'application/json',
      },
    })
  } catch (error: any) {
    console.error('Langbase agent API error:', error)

    // ========================================================================
    // Error Handling
    // ========================================================================

    const statusCode = error.code === 'RATE_LIMIT' ? 429 : 500

    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
        code: error.code || 'UNKNOWN_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.details : undefined,
      },
      { status: statusCode }
    )
  }
}

// ============================================================================
// GET /api/langbase-agent?conversationId=xxx
// Get conversation history
// ============================================================================

export async function GET(req: NextRequest) {
  try {
    const conversationId = req.nextUrl.searchParams.get('conversationId')

    // ========================================================================
    // Validation
    // ========================================================================

    if (!conversationId) {
      return NextResponse.json(
        { 
          error: 'Missing conversationId parameter',
          code: 'MISSING_CONVERSATION_ID' 
        },
        { status: 400 }
      )
    }

    // ========================================================================
    // Get History
    // ========================================================================

    const history = await getConversationHistory(conversationId)

    // ========================================================================
    // Return Response
    // ========================================================================

    return NextResponse.json(history, {
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=60',
        'Content-Type': 'application/json',
      },
    })
  } catch (error: any) {
    console.error('Get history API error:', error)

    return NextResponse.json(
      {
        error: error.message || 'Failed to retrieve conversation',
        code: error.code || 'UNKNOWN_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.details : undefined,
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE /api/langbase-agent?conversationId=xxx
// Delete conversation
// ============================================================================

export async function DELETE(req: NextRequest) {
  try {
    const conversationId = req.nextUrl.searchParams.get('conversationId')

    // ========================================================================
    // Validation
    // ========================================================================

    if (!conversationId) {
      return NextResponse.json(
        { 
          error: 'Missing conversationId parameter',
          code: 'MISSING_CONVERSATION_ID' 
        },
        { status: 400 }
      )
    }

    // ========================================================================
    // Delete Conversation
    // ========================================================================

    await deleteConversation(conversationId)

    // ========================================================================
    // Return Response
    // ========================================================================

    return NextResponse.json(
      { 
        success: true, 
        message: 'Conversation deleted successfully',
        conversationId 
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Delete conversation API error:', error)

    return NextResponse.json(
      {
        error: error.message || 'Failed to delete conversation',
        code: error.code || 'UNKNOWN_ERROR',
        details: process.env.NODE_ENV === 'development' ? error.details : undefined,
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// OPTIONS - CORS preflight
// ============================================================================

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}


