'use client';

import React, { useEffect, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useMarketplaceStore } from '@/store/useMarketplaceStore';
import { MarketplaceProgram } from '@/lib/anchor';
import { ListingCard } from '@/components/marketplace/ListingCard';
import { MarketplaceFilters } from '@/components/marketplace/MarketplaceFilters';
import { CreateListingModal } from '@/components/marketplace/CreateListingModal';
import { CreateUserModal } from '@/components/marketplace/CreateUserModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Listing, Category } from '@/types/marketplace';
import { toast } from 'react-hot-toast';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign,
  Loader2,
  Zap,
  Plus
} from 'lucide-react';

// Mock data for development
const mockListings: Listing[] = [
  {
    publicKey: new PublicKey('11111111111111111111111111111111'),
    seller: new PublicKey('2222222222222222222222222222222222222222222222'),
    title: 'MacBook Pro M2 - Excellent Condition',
    description: 'Almost new MacBook Pro with M2 chip, 16GB RAM, 512GB SSD. Perfect for development and creative work.',
    category: Category.Electronics,
    price: 2.5 * 1_000_000_000, // 2.5 SOL in lamports
    condition: 'LikeNew' as any,
    imagesUri: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    metadataUri: '',
    isActive: true,
    isSold: false,
    createdAt: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
    bump: 255,
  },
  {
    publicKey: new PublicKey('33333333333333333333333333333333'),
    seller: new PublicKey('4444444444444444444444444444444444444444444444'),
    title: 'Vintage Leather Jacket',
    description: 'Authentic vintage leather jacket from the 90s. Great condition, size M.',
    category: Category.Clothing,
    price: 0.8 * 1_000_000_000, // 0.8 SOL
    condition: 'Good' as any,
    imagesUri: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
    metadataUri: '',
    isActive: true,
    isSold: false,
    createdAt: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
    bump: 255,
  },
  {
    publicKey: new PublicKey('55555555555555555555555555555555'),
    seller: new PublicKey('6666666666666666666666666666666666666666666666'),
    title: 'Acoustic Guitar - Martin D-28',
    description: 'Beautiful Martin D-28 acoustic guitar. Played professionally, well maintained.',
    category: Category.Music,
    price: 1.2 * 1_000_000_000, // 1.2 SOL
    condition: 'Good' as any,
    imagesUri: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400',
    metadataUri: '',
    isActive: true,
    isSold: true,
    createdAt: Math.floor(Date.now() / 1000) - 10800, // 3 hours ago
    bump: 255,
  },
];

export default function HomePage() {
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  const [program, setProgram] = useState<MarketplaceProgram | null>(null);
  
  const {
    listings,
    filteredListings,
    isListingsLoading,
    userAccount,
    isUserAccountLoading,
    isCreateListingModalOpen,
    isCreateUserModalOpen,
    setListings,
    setListingsLoading,
    setUserAccount,
    setUserAccountLoading,
    setSelectedListing,
    setCreateListingModalOpen,
    setCreateUserModalOpen,
  } = useMarketplaceStore();

  // Initialize marketplace program when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      initializeProgram();
      loadUserAccount();
      loadListings();
    }
  }, [connected, publicKey]);

  // Load mock data initially
  useEffect(() => {
    setListings(mockListings);
  }, []);

  const initializeProgram = async () => {
    try {
      // In a real app, we'd initialize the actual program here
      // For now, we'll just set a placeholder
      console.log('Initializing marketplace program...');
    } catch (error) {
      console.error('Failed to initialize program:', error);
      toast.error('Failed to connect to marketplace');
    }
  };

  const loadUserAccount = async () => {
    if (!publicKey) return;
    
    setUserAccountLoading(true);
    try {
      // In a real app, we'd fetch the user account from the blockchain
      // For now, we'll simulate a user account check
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate user account not existing for demo
      setUserAccount(null);
    } catch (error) {
      console.error('Failed to load user account:', error);
    } finally {
      setUserAccountLoading(false);
    }
  };

  const loadListings = async () => {
    setListingsLoading(true);
    try {
      // In a real app, we'd fetch listings from the blockchain
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Use mock data for now
      setListings(mockListings);
      toast.success('Listings loaded successfully');
    } catch (error) {
      console.error('Failed to load listings:', error);
      toast.error('Failed to load marketplace listings');
    } finally {
      setListingsLoading(false);
    }
  };

  const handlePurchase = async (listing: Listing) => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!userAccount) {
      toast.error('Please create your profile first');
      setCreateUserModalOpen(true);
      return;
    }

    try {
      // In a real app, we'd call the purchase instruction here
      toast.success(`Purchase initiated for ${listing.title}`);
      console.log('Purchasing:', listing);
    } catch (error) {
      console.error('Purchase failed:', error);
      toast.error('Purchase failed. Please try again.');
    }
  };

  const handleContact = (listing: Listing) => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    toast.success('Opening chat... (Feature coming soon)');
    console.log('Contacting seller for:', listing);
  };

  const stats = {
    totalListings: listings.length,
    activeListings: listings.filter(l => l.isActive && !l.isSold).length,
    totalVolume: listings.reduce((sum, l) => sum + l.price, 0),
    totalUsers: 1337, // Mock data
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-12 bg-gradient-to-br from-background to-muted rounded-2xl">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Decentralized Marketplace
            <span className="block gradient-text">Built on Solana</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Buy and sell items securely with crypto payments, reputation systems, and encrypted messaging.
          </p>
          
          {connected ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="solana"
                onClick={() => userAccount ? setCreateListingModalOpen(true) : setCreateUserModalOpen(true)}
              >
                <Plus className="w-5 h-5 mr-2" />
                {userAccount ? 'Sell an Item' : 'Get Started'}
              </Button>
              <Button size="lg" variant="outline">
                <Zap className="w-5 h-5 mr-2" />
                Browse Items
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-lg mb-4">Connect your Solana wallet to get started</p>
              <Badge variant="outline" className="text-sm">
                Supports Phantom, Solflare, and more
              </Badge>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-solana-purple" />
            <div className="text-2xl font-bold">{stats.activeListings}</div>
            <div className="text-sm text-muted-foreground">Active Listings</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-solana-green" />
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Users</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">{(stats.totalVolume / 1_000_000_000).toFixed(1)}K</div>
            <div className="text-sm text-muted-foreground">SOL Volume</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">99.2%</div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </CardContent>
        </Card>
      </section>

      {/* Filters and Listings */}
      <section>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <MarketplaceFilters />
          </div>

          {/* Listings Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                Marketplace ({filteredListings.length} items)
              </h2>
              
              {connected && userAccount && (
                <Button 
                  onClick={() => setCreateListingModalOpen(true)}
                  className="lg:hidden"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Sell Item
                </Button>
              )}
            </div>

            {isListingsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : filteredListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredListings.map((listing) => (
                  <ListingCard
                    key={listing.publicKey.toString()}
                    listing={listing}
                    onSelect={setSelectedListing}
                    onPurchase={handlePurchase}
                    onContact={handleContact}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold mb-2">No items found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or check back later for new listings.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Modals */}
      <CreateListingModal />
      <CreateUserModal />
    </div>
  );
}