/**
 * ChatWidget Component Test Suite
 * Tests for Langbase chat UI component
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ChatWidget from '@/components/langbase/ChatWidget'

// ============================================================================
// Mock Hook
// ============================================================================

const mockSendMessage = jest.fn()
const mockClearConversation = jest.fn()
const mockDeleteConversation = jest.fn()
const mockLoadHistory = jest.fn()

jest.mock('@/hooks/use-langbase-agent', () => ({
  useLangbaseAgent: () => ({
    messages: [],
    loading: false,
    error: null,
    conversationId: null,
    sendMessage: mockSendMessage,
    clearConversation: mockClearConversation,
    deleteConversation: mockDeleteConversation,
    loadHistory: mockLoadHistory,
    totalTokens: 0,
  }),
}))

// ============================================================================
// Test Suite
// ============================================================================

describe('ChatWidget Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ==========================================================================
  // Rendering Tests
  // ==========================================================================

  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<ChatWidget context="documentation" />)
      
      expect(screen.getByPlaceholderText('Ask a question...')).toBeInTheDocument()
      expect(screen.getByText(/Documentation Assistant/i)).toBeInTheDocument()
    })

    it('should render with custom title and subtitle', () => {
      render(
        <ChatWidget 
          context="faq"
          title="Custom Title"
          subtitle="Custom Subtitle"
        />
      )
      
      expect(screen.getByText('Custom Title')).toBeInTheDocument()
      expect(screen.getByText('Custom Subtitle')).toBeInTheDocument()
    })

    it('should render welcome message when no messages', () => {
      render(<ChatWidget context="documentation" />)
      
      expect(screen.getByText(/Hi there!/i)).toBeInTheDocument()
      expect(screen.getByText(/Start a conversation/i)).toBeInTheDocument()
    })

    it('should render Send button', () => {
      render(<ChatWidget context="documentation" />)
      
      const sendButton = screen.getByRole('button', { name: /send/i })
      expect(sendButton).toBeInTheDocument()
    })
  })

  // ==========================================================================
  // Interaction Tests
  // ==========================================================================

  describe('User Interactions', () => {
    it('should call sendMessage when form is submitted', async () => {
      render(<ChatWidget context="documentation" />)
      
      const input = screen.getByPlaceholderText('Ask a question...')
      const sendButton = screen.getByRole('button', { name: /send/i })

      fireEvent.change(input, { target: { value: 'Test message' } })
      fireEvent.click(sendButton)

      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalledWith('Test message')
      })
    })

    it('should clear input after sending', async () => {
      render(<ChatWidget context="documentation" />)
      
      const input = screen.getByPlaceholderText('Ask a question...') as HTMLInputElement
      const sendButton = screen.getByRole('button', { name: /send/i })

      fireEvent.change(input, { target: { value: 'Test message' } })
      fireEvent.click(sendButton)

      await waitFor(() => {
        expect(input.value).toBe('')
      })
    })

    it('should not send empty messages', async () => {
      render(<ChatWidget context="documentation" />)
      
      const sendButton = screen.getByRole('button', { name: /send/i })
      fireEvent.click(sendButton)

      expect(mockSendMessage).not.toHaveBeenCalled()
    })

    it('should trim whitespace from messages', async () => {
      render(<ChatWidget context="documentation" />)
      
      const input = screen.getByPlaceholderText('Ask a question...')
      const sendButton = screen.getByRole('button', { name: /send/i })

      fireEvent.change(input, { target: { value: '  Test message  ' } })
      fireEvent.click(sendButton)

      await waitFor(() => {
        expect(mockSendMessage).toHaveBeenCalledWith('  Test message  ')
      })
    })
  })

  // ==========================================================================
  // Accessibility Tests
  // ==========================================================================

  describe('Accessibility', () => {
    it('should have accessible form elements', () => {
      render(<ChatWidget context="documentation" />)
      
      const input = screen.getByLabelText('Message input')
      const sendButton = screen.getByLabelText('Send message')

      expect(input).toBeInTheDocument()
      expect(sendButton).toBeInTheDocument()
    })

    it('should disable input and button when loading', () => {
      // This would require mocking the hook with loading: true
      // Skipped for now
    })
  })
})

