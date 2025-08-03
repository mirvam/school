'use client';

import React from 'react';
import Image from 'next/image';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Listing } from '@/types/marketplace';
import { 
  formatPrice, 
  formatRelativeTime, 
  truncateAddress,
  categoryToDisplay,
  conditionToDisplay 
} from '@/lib/utils';
import { 
  MapPin, 
  Clock, 
  Star, 
  ShieldCheck,
  MessageCircle,
  ShoppingCart,
  Heart
} from 'lucide-react';

interface ListingCardProps {
  listing: Listing;
  onSelect?: (listing: Listing) => void;
  onPurchase?: (listing: Listing) => void;
  onContact?: (listing: Listing) => void;
  showSeller?: boolean;
}

export function ListingCard({ 
  listing, 
  onSelect, 
  onPurchase, 
  onContact,
  showSeller = true 
}: ListingCardProps) {
  const { publicKey } = useWallet();
  const isOwnListing = publicKey && listing.seller.equals(publicKey);
  
  // Mock seller data - in production this would come from userAccount
  const sellerData = {
    displayName: `Seller ${truncateAddress(listing.seller)}`,
    reputationScore: 450, // 4.5 stars
    totalReviews: 23,
    isVerified: Math.random() > 0.5, // Random for demo
    location: 'Amsterdam, NL'
  };

  const handleCardClick = () => {
    onSelect?.(listing);
  };

  const handlePurchaseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPurchase?.(listing);
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onContact?.(listing);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement favorites functionality
  };

  return (
    <Card 
      className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
      onClick={handleCardClick}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-t-lg">
        {listing.imagesUri ? (
          <Image
            src={listing.imagesUri}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-200 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <div className="text-4xl">📦</div>
          </div>
        )}
        
        {/* Overlay badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <Badge variant="secondary" className="text-xs">
            {categoryToDisplay(listing.category)}
          </Badge>
          <Badge variant="outline" className="text-xs bg-background/80">
            {conditionToDisplay(listing.condition)}
          </Badge>
        </div>

        {/* Favorite button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-background/80 hover:bg-background"
          onClick={handleFavoriteClick}
        >
          <Heart className="w-4 h-4" />
        </Button>

        {/* Sold overlay */}
        {listing.isSold && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="destructive" className="text-lg px-4 py-2">
              SOLD
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* Title and Price */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg line-clamp-2 flex-1 mr-2">
            {listing.title}
          </h3>
          <div className="text-right">
            <div className="font-bold text-xl text-solana-purple">
              {formatPrice(listing.price)}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {listing.description}
        </p>

        {/* Seller info */}
        {showSeller && (
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-solana-purple to-solana-green rounded-full flex items-center justify-center text-white text-xs font-bold">
                {sellerData.displayName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-medium">{sellerData.displayName}</span>
                  {sellerData.isVerified && (
                    <ShieldCheck className="w-3 h-3 text-blue-500" />
                  )}
                </div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span>{(sellerData.reputationScore / 100).toFixed(1)}</span>
                  <span>({sellerData.totalReviews})</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <MapPin className="w-3 h-3" />
            <span>{sellerData.location}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{formatRelativeTime(listing.createdAt)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {isOwnListing ? (
          <div className="w-full text-center">
            <Badge variant="outline">Your Listing</Badge>
          </div>
        ) : (
          <div className="flex space-x-2 w-full">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={handleContactClick}
              disabled={listing.isSold}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
            </Button>
            <Button 
              variant="solana" 
              size="sm" 
              className="flex-1"
              onClick={handlePurchaseClick}
              disabled={listing.isSold || !listing.isActive}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {listing.isSold ? 'Sold' : 'Buy Now'}
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

export default ListingCard;