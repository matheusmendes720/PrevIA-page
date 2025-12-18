'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(true);
  
  useEffect(() => {
    // Redirect to main dashboard
    const timer = setTimeout(() => {
      router.replace('/main');
      setIsRedirecting(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [router]);

  if (!isRedirecting) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-navy via-brand-light-navy to-brand-navy flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 border-4 border-brand-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h1 className="text-5xl font-bold text-brand-lightest-slate mb-4">
          Nova Corrente
        </h1>
        <p className="text-xl text-brand-slate">
          Carregando Dashboard...
        </p>
      </div>
    </main>
  );
}

