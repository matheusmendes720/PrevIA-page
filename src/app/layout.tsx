import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  title: 'Nova Corrente - Demand Forecasting Dashboard',
  description: 'Production-ready demand forecasting system with ML/DL models',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-brand-blue text-brand-lightest-slate`}>{children}</body>
    </html>
  );
}

