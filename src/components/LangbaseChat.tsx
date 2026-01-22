'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  responseTime?: number;
}

interface LangbaseChatProps {
  pipeName?: string;
  welcomeMessage?: string;
}

const LANGBASE_API_URL = 'https://api.langbase.com/v1/pipes/run';
const CORS_PROXY = 'https://corsproxy.io/?url=';

export default function LangbaseChat({
  pipeName = 'master-intelligence-advisor',
  welcomeMessage = '👋 Olá! Sou o **Consultor de Inteligência da Nova Corrente**.\n\nPosso ajudá-lo com:\n\n• 📊 **Análise de Dados** - MAPE, previsões, métricas de ML\n• 🏢 **Estratégia B2B** - SLA, fornecedores, lead time\n• 💡 **Recomendações Prescritivas** - Ações baseadas em dados\n• 📈 **Benchmarks de Mercado** - Comparações setoriais\n\nComo posso ajudar hoje?'
}: LangbaseChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: welcomeMessage,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'online' | 'loading' | 'error'>('online');
  const [lastResponseTime, setLastResponseTime] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Get API keys from environment or use embedded (for demo)
  const getApiKeys = () => {
    return {
      langbaseKey: process.env.NEXT_PUBLIC_LANGBASE_API_KEY || '',
      llmKey: process.env.NEXT_PUBLIC_LLM_API_KEY || '',
    };
  };

  // Build conversation history for context
  const buildConversationHistory = () => {
    return messages
      .slice(-10) // Last 10 messages for context
      .filter(m => m.id !== 'welcome')
      .map(m => ({
        role: m.role,
        content: m.content,
      }));
  };

  // Escape HTML to prevent XSS
  const escapeHtml = (text: string) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  // Send message to Langbase
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setStatus('loading');

    const startTime = Date.now();
    const { langbaseKey, llmKey } = getApiKeys();

    try {
      const conversationHistory = buildConversationHistory();
      conversationHistory.push({ role: 'user', content: userMessage.content });

      const response = await fetch(CORS_PROXY + encodeURIComponent(LANGBASE_API_URL), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${langbaseKey}`,
          'LB-LLM-Key': llmKey,
        },
        body: JSON.stringify({
          name: pipeName,
          messages: conversationHistory,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;
      setLastResponseTime(responseTime);

      const assistantContent = data.completion || data.choices?.[0]?.message?.content || 'Desculpe, não consegui processar sua solicitação.';

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
        responseTime,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setStatus('online');
    } catch (error) {
      console.error('Langbase API Error:', error);
      setStatus('error');

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Erro ao conectar com o agente. Por favor, tente novamente.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // Clear conversation
  const clearChat = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: welcomeMessage,
      timestamp: new Date(),
    }]);
    setLastResponseTime(null);
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Format markdown-like content
  const formatContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-brand-light-navy/50 px-1 rounded">$1</code>')
      .replace(/\n/g, '<br/>');
  };

  const statusConfig = {
    online: { color: 'bg-green-500', text: '🟢 Online' },
    loading: { color: 'bg-yellow-500 animate-pulse', text: '⏳ Processando...' },
    error: { color: 'bg-red-500', text: '🔴 Erro' },
  };

  return (
    <div className="flex flex-col h-[600px] bg-brand-navy/50 rounded-xl border border-brand-cyan/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-brand-light-navy/50 bg-brand-light-navy/30">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-brand-cyan/10 rounded-full flex items-center justify-center border border-brand-cyan/20">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <h3 className="font-bold text-brand-lightest-slate">Nova Corrente Intelligence</h3>
            <div className="flex items-center space-x-2 text-xs">
              <span className={`w-2 h-2 rounded-full ${statusConfig[status].color}`}></span>
              <span className="text-brand-slate">{statusConfig[status].text}</span>
              {lastResponseTime && status === 'online' && (
                <span className="text-brand-cyan">⚡ {lastResponseTime}ms</span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="px-3 py-1.5 text-xs bg-brand-light-navy/50 hover:bg-brand-light-navy text-brand-slate hover:text-brand-lightest-slate rounded-lg transition-colors"
        >
          🗑️ Limpar
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${message.role === 'user'
                  ? 'bg-brand-cyan/20 text-brand-lightest-slate border border-brand-cyan/30'
                  : 'bg-brand-light-navy/50 text-brand-lightest-slate border border-brand-light-navy/50'
                }`}
            >
              <div
                className="text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatContent(escapeHtml(message.content)) }}
              />
              <div className="flex items-center justify-between mt-2 text-xs text-brand-slate">
                <span>{message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                {message.responseTime && (
                  <span className="text-brand-cyan">⚡ {message.responseTime}ms</span>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-brand-light-navy/50 text-brand-slate p-3 rounded-lg border border-brand-light-navy/50">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <span className="w-2 h-2 bg-brand-cyan rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-brand-cyan rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-brand-cyan rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="text-sm">Analisando...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-brand-light-navy/50 bg-brand-light-navy/30">
        <div className="flex items-center space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua pergunta..."
            disabled={isLoading}
            className="flex-1 bg-brand-navy border border-brand-light-navy/50 rounded-lg px-4 py-3 text-brand-lightest-slate placeholder-brand-slate focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-brand-cyan text-brand-navy font-semibold rounded-lg hover:bg-brand-cyan/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '...' : 'Enviar'}
          </button>
        </div>
      </div>
    </div>
  );
}
