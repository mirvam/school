'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useMarketplaceStore } from '@/store/useMarketplaceStore';
import { Category, Condition } from '@/types/marketplace';
import { categoryToDisplay, conditionToDisplay } from '@/lib/utils';
import { 
  Filter, 
  X, 
  DollarSign,
  MapPin,
  ShieldCheck
} from 'lucide-react';

export function MarketplaceFilters() {
  const { listingFilter, setListingFilter } = useMarketplaceStore();

  const categories = Object.values(Category);
  const conditions = Object.values(Condition);

  const handleCategoryToggle = (category: Category) => {
    setListingFilter({
      category: listingFilter.category === category ? undefined : category
    });
  };

  const handleConditionToggle = (condition: Condition) => {
    setListingFilter({
      condition: listingFilter.condition === condition ? undefined : condition
    });
  };

  const handlePriceChange = (field: 'minPrice' | 'maxPrice', value: string) => {
    const price = value ? parseFloat(value) * 1_000_000_000 : undefined; // Convert SOL to lamports
    setListingFilter({ [field]: price });
  };

  const handleLocationChange = (location: string) => {
    setListingFilter({ location: location || undefined });
  };

  const toggleVerifiedSellers = () => {
    setListingFilter({
      sellerVerified: !listingFilter.sellerVerified
    });
  };

  const clearAllFilters = () => {
    setListingFilter({
      category: undefined,
      condition: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      location: undefined,
      sellerVerified: false,
      search: undefined,
    });
  };

  const hasActiveFilters = !!(
    listingFilter.category ||
    listingFilter.condition ||
    listingFilter.minPrice ||
    listingFilter.maxPrice ||
    listingFilter.location ||
    listingFilter.sellerVerified ||
    listingFilter.search
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </CardTitle>
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={clearAllFilters}
              className="text-xs"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Category Filter */}
        <div>
          <h3 className="font-semibold mb-3">Category</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={listingFilter.category === category ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start text-left"
                onClick={() => handleCategoryToggle(category)}
              >
                {categoryToDisplay(category)}
              </Button>
            ))}
          </div>
        </div>

        {/* Condition Filter */}
        <div>
          <h3 className="font-semibold mb-3">Condition</h3>
          <div className="flex flex-wrap gap-2">
            {conditions.map((condition) => (
              <Badge
                key={condition}
                variant={listingFilter.condition === condition ? "default" : "outline"}
                className="cursor-pointer hover:bg-accent"
                onClick={() => handleConditionToggle(condition)}
              >
                {conditionToDisplay(condition)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center">
            <DollarSign className="w-4 h-4 mr-1" />
            Price Range (SOL)
          </h3>
          <div className="space-y-2">
            <Input
              type="number"
              placeholder="Min price"
              value={listingFilter.minPrice ? (listingFilter.minPrice / 1_000_000_000).toString() : ''}
              onChange={(e) => handlePriceChange('minPrice', e.target.value)}
              step="0.1"
              min="0"
            />
            <Input
              type="number"
              placeholder="Max price"
              value={listingFilter.maxPrice ? (listingFilter.maxPrice / 1_000_000_000).toString() : ''}
              onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
              step="0.1"
              min="0"
            />
          </div>
        </div>

        {/* Location Filter */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            Location
          </h3>
          <Input
            placeholder="Search by location..."
            value={listingFilter.location || ''}
            onChange={(e) => handleLocationChange(e.target.value)}
          />
        </div>

        {/* Verified Sellers Filter */}
        <div>
          <Button
            variant={listingFilter.sellerVerified ? "default" : "outline"}
            size="sm"
            className="w-full justify-start"
            onClick={toggleVerifiedSellers}
          >
            <ShieldCheck className="w-4 h-4 mr-2" />
            Verified Sellers Only
          </Button>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div>
            <h3 className="font-semibold mb-3">Active Filters</h3>
            <div className="space-y-2 text-sm">
              {listingFilter.category && (
                <div className="flex items-center justify-between">
                  <span>Category: {categoryToDisplay(listingFilter.category)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setListingFilter({ category: undefined })}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
              
              {listingFilter.condition && (
                <div className="flex items-center justify-between">
                  <span>Condition: {conditionToDisplay(listingFilter.condition)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setListingFilter({ condition: undefined })}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
              
              {(listingFilter.minPrice || listingFilter.maxPrice) && (
                <div className="flex items-center justify-between">
                  <span>
                    Price: {listingFilter.minPrice ? `${(listingFilter.minPrice / 1_000_000_000).toFixed(2)}` : '0'} - {listingFilter.maxPrice ? `${(listingFilter.maxPrice / 1_000_000_000).toFixed(2)}` : '∞'} SOL
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setListingFilter({ minPrice: undefined, maxPrice: undefined })}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
              
              {listingFilter.location && (
                <div className="flex items-center justify-between">
                  <span>Location: {listingFilter.location}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setListingFilter({ location: undefined })}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
              
              {listingFilter.sellerVerified && (
                <div className="flex items-center justify-between">
                  <span>Verified sellers only</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setListingFilter({ sellerVerified: false })}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MarketplaceFilters;