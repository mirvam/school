import { create } from 'zustand';
import { PublicKey } from '@solana/web3.js';
import { UserAccount, Listing, ListingFilter } from '@/types/marketplace';

interface MarketplaceState {
  // User state
  userAccount: UserAccount | null;
  isUserAccountLoading: boolean;
  
  // Listings state
  listings: Listing[];
  filteredListings: Listing[];
  isListingsLoading: boolean;
  listingFilter: ListingFilter;
  
  // UI state
  isCreateListingModalOpen: boolean;
  isCreateUserModalOpen: boolean;
  selectedListing: Listing | null;
  
  // Actions
  setUserAccount: (userAccount: UserAccount | null) => void;
  setUserAccountLoading: (loading: boolean) => void;
  
  setListings: (listings: Listing[]) => void;
  setListingsLoading: (loading: boolean) => void;
  setListingFilter: (filter: Partial<ListingFilter>) => void;
  applyFilter: () => void;
  addListing: (listing: Listing) => void;
  
  setCreateListingModalOpen: (open: boolean) => void;
  setCreateUserModalOpen: (open: boolean) => void;
  setSelectedListing: (listing: Listing | null) => void;
  
  // Computed
  getListingsByCategory: (category: string) => Listing[];
  getListingsBySeller: (seller: PublicKey) => Listing[];
}

export const useMarketplaceStore = create<MarketplaceState>((set, get) => ({
  // Initial state
  userAccount: null,
  isUserAccountLoading: false,
  
  listings: [],
  filteredListings: [],
  isListingsLoading: false,
  listingFilter: {},
  
  isCreateListingModalOpen: false,
  isCreateUserModalOpen: false,
  selectedListing: null,
  
  // Actions
  setUserAccount: (userAccount) => set({ userAccount }),
  setUserAccountLoading: (loading) => set({ isUserAccountLoading: loading }),
  
  setListings: (listings) => {
    set({ listings, filteredListings: listings });
    get().applyFilter();
  },
  setListingsLoading: (loading) => set({ isListingsLoading: loading }),
  
  setListingFilter: (filter) => {
    const currentFilter = get().listingFilter;
    const newFilter = { ...currentFilter, ...filter };
    set({ listingFilter: newFilter });
    get().applyFilter();
  },
  
  applyFilter: () => {
    const { listings, listingFilter } = get();
    let filtered = [...listings];
    
    // Apply category filter
    if (listingFilter.category) {
      filtered = filtered.filter(listing => listing.category === listingFilter.category);
    }
    
    // Apply condition filter
    if (listingFilter.condition) {
      filtered = filtered.filter(listing => listing.condition === listingFilter.condition);
    }
    
    // Apply price range filter
    if (listingFilter.minPrice !== undefined) {
      filtered = filtered.filter(listing => listing.price >= listingFilter.minPrice!);
    }
    if (listingFilter.maxPrice !== undefined) {
      filtered = filtered.filter(listing => listing.price <= listingFilter.maxPrice!);
    }
    
    // Apply location filter
    if (listingFilter.location) {
      filtered = filtered.filter(listing => 
        listing.seller.toString().toLowerCase().includes(listingFilter.location!.toLowerCase())
      );
    }
    
    // Apply search filter
    if (listingFilter.search) {
      const searchTerm = listingFilter.search.toLowerCase();
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(searchTerm) ||
        listing.description.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply verification filter
    if (listingFilter.sellerVerified) {
      // This would need to be enhanced to check actual seller verification status
      // For now, we'll assume this filter works with some mock data
    }
    
    // Sort by creation date (newest first) by default
    filtered.sort((a, b) => b.createdAt - a.createdAt);
    
    set({ filteredListings: filtered });
  },
  
  addListing: (listing) => {
    const { listings } = get();
    const newListings = [listing, ...listings];
    set({ listings: newListings, filteredListings: newListings });
    get().applyFilter();
  },
  
  setCreateListingModalOpen: (open) => set({ isCreateListingModalOpen: open }),
  setCreateUserModalOpen: (open) => set({ isCreateUserModalOpen: open }),
  setSelectedListing: (listing) => set({ selectedListing: listing }),
  
  // Computed functions
  getListingsByCategory: (category) => {
    const { listings } = get();
    return listings.filter(listing => listing.category === category);
  },
  
  getListingsBySeller: (seller) => {
    const { listings } = get();
    return listings.filter(listing => listing.seller.equals(seller));
  },
}));