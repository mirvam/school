'use client';

import React from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import { useMarketplaceStore } from '@/store/useMarketplaceStore';
import { 
  Search, 
  Plus, 
  User, 
  Settings, 
  MessageCircle,
  ShoppingBag,
  Heart
} from 'lucide-react';

export function Navigation() {
  const { connected, publicKey } = useWallet();
  const { userAccount, setCreateListingModalOpen, setCreateUserModalOpen } = useMarketplaceStore();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-solana-purple to-solana-green rounded-lg">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-solana-purple to-solana-green bg-clip-text text-transparent">
            SolMarket
          </span>
        </Link>

        {/* Search bar */}
        <div className="flex-1 max-w-xl mx-8">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search items..."
              className="w-full pl-8 pr-4 py-2 border border-input rounded-md bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              onChange={(e) => {
                const { setListingFilter } = useMarketplaceStore.getState();
                setListingFilter({ search: e.target.value });
              }}
            />
          </div>
        </div>

        {/* Navigation items */}
        <div className="flex items-center space-x-4">
          {connected && userAccount && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCreateListingModalOpen(true)}
                className="hidden sm:flex"
              >
                <Plus className="w-4 h-4 mr-2" />
                Sell Item
              </Button>

              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>

              <Link href="/messages">
                <Button variant="ghost" size="sm">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Messages
                </Button>
              </Link>

              <Link href="/favorites">
                <Button variant="ghost" size="sm">
                  <Heart className="w-4 h-4" />
                </Button>
              </Link>
            </>
          )}

          {connected && !userAccount && (
            <Button
              variant="solana"
              size="sm"
              onClick={() => setCreateUserModalOpen(true)}
            >
              Complete Profile
            </Button>
          )}

          {/* Wallet Connection */}
          <WalletMultiButton className="!bg-gradient-to-r !from-solana-purple !to-solana-green hover:!opacity-90 !transition-opacity" />
        </div>
      </div>
    </nav>
  );
}

export default Navigation;