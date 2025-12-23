'use client';

import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { ToastProvider } from '../../contexts/ToastContext';
import ToastContainer from '../../components/ToastContainer';

export default function ChatbotPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState('Chatbot');

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  const handlePageChange = (page: string) => {
    setActivePage(page);
  };

  return (
    <ToastProvider>
      <div className="min-h-screen text-brand-lightest-slate font-sans">
        <div className="flex">
          <Sidebar 
            activePage={activePage} 
            setActivePage={handlePageChange}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            isMobileOpen={isMobileMenuOpen}
            onMobileToggle={handleMobileMenuToggle}
          />
          <main className="flex-1 min-w-0 p-3 sm:p-4 md:p-5 lg:p-6">
            <Header
              title="Chatbot Assistente"
              subtitle="Assistente inteligente para análise e suporte"
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onMobileMenuToggle={handleMobileMenuToggle}
              isMobileMenuOpen={isMobileMenuOpen}
            />
            <div className="mt-4 sm:mt-5 animate-fade-in-up">
              <div className="bg-brand-navy/50 rounded-xl p-6 border border-brand-cyan/20">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-brand-cyan/10 rounded-full flex items-center justify-center border border-brand-cyan/20">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-brand-lightest-slate">Chatbot AI</h2>
                    <p className="text-sm text-brand-slate">Pronto para ajudar com suas análises</p>
                  </div>
                </div>
                
                <div className="bg-brand-light-navy/30 rounded-lg p-4 border border-brand-light-navy/50 min-h-[400px] flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-brand-slate mb-4">Interface do chatbot será implementada aqui</p>
                    <p className="text-xs text-brand-slate/70">Esta página está pronta para desenvolvimento futuro</p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
        <ToastContainer />
      </div>
    </ToastProvider>
  );
}
