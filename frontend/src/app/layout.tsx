import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { WalletContextProvider } from '@/components/wallet/WalletProvider';
import { Navigation } from '@/components/layout/Navigation';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SolMarket - Decentralized P2P Marketplace',
  description: 'A decentralized peer-to-peer marketplace built on Solana blockchain with reputation system and encrypted messaging.',
  keywords: ['solana', 'marketplace', 'crypto', 'web3', 'p2p', 'decentralized'],
  authors: [{ name: 'SolMarket Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <WalletContextProvider>
          <div className="min-h-screen bg-background">
            <Navigation />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
          </div>
          <Toaster 
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                border: '1px solid hsl(var(--border))',
              },
            }}
          />
        </WalletContextProvider>
      </body>
    </html>
  );
}