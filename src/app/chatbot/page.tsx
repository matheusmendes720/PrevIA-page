'use client';

import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { ToastProvider } from '../../contexts/ToastContext';
import ToastContainer from '../../components/ToastContainer';
import LangbaseChat from '../../components/LangbaseChat';

export default function ChatbotPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <ToastProvider>
      <div className="min-h-screen text-brand-lightest-slate font-sans">
        <div className="flex">
          <Sidebar
            activePage="Chatbot"
            setActivePage={() => { }}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
          <main className="flex-1 min-w-0 p-3 sm:p-4 md:p-5 lg:p-6">
            <Header
              title="Chatbot Assistente"
              subtitle="Consultor de Inteligência de Mercado"
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
            <div className="mt-4 sm:mt-5 animate-fade-in-up">
              <LangbaseChat
                pipeName="master-intelligence-advisor"
                welcomeMessage="👋 Olá! Sou o **Consultor de Inteligência da Nova Corrente**.

Posso ajudá-lo com:

• 📊 **Análise de Dados** - MAPE, previsões, métricas de ML
• 🏢 **Estratégia B2B** - SLA, fornecedores, lead time
• 💡 **Recomendações Prescritivas** - Ações baseadas em dados
• 📈 **Benchmarks de Mercado** - Comparações setoriais
• 📚 **Estudos de Caso** - Exemplos reais do mercado

Como posso ajudar hoje?"
              />
            </div>
          </main>
        </div>
        <ToastContainer />
      </div>
    </ToastProvider>
  );
}
