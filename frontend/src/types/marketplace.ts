import { PublicKey } from '@solana/web3.js';

export enum Category {
  Electronics = 'Electronics',
  Clothing = 'Clothing',
  Home = 'Home',
  Sports = 'Sports',
  Books = 'Books',
  Automotive = 'Automotive',
  Art = 'Art',
  Music = 'Music',
  Gaming = 'Gaming',
  Other = 'Other',
}

export enum Condition {
  New = 'New',
  LikeNew = 'LikeNew',
  Good = 'Good',
  Fair = 'Fair',
  Poor = 'Poor',
}

export interface UserAccount {
  authority: PublicKey;
  displayName: string;
  bio: string;
  location: string;
  reputationScore: number;
  totalReviews: number;
  totalSales: number;
  totalPurchases: number;
  isVerified: boolean;
  verificationAttestation?: string;
  createdAt: number;
  bump: number;
}

export interface Listing {
  publicKey: PublicKey;
  seller: PublicKey;
  buyer?: PublicKey;
  title: string;
  description: string;
  category: Category;
  price: number;
  condition: Condition;
  imagesUri: string;
  metadataUri: string;
  isActive: boolean;
  isSold: boolean;
  createdAt: number;
  bump: number;
}

export interface Purchase {
  publicKey: PublicKey;
  buyer: PublicKey;
  seller: PublicKey;
  listing: PublicKey;
  price: number;
  fee: number;
  purchasedAt: number;
  completedAt?: number;
  isCompleted: boolean;
  isDisputed: boolean;
  bump: number;
}

export interface Review {
  publicKey: PublicKey;
  reviewer: PublicKey;
  reviewee: PublicKey;
  purchase: PublicKey;
  rating: number;
  comment: string;
  isSellerReview: boolean;
  createdAt: number;
  bump: number;
}

export interface Marketplace {
  authority: PublicKey;
  feeRate: number;
  totalListings: number;
  totalUsers: number;
  totalVolume: number;
  bump: number;
}

export interface ListingFilter {
  category?: Category;
  condition?: Condition;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  sellerVerified?: boolean;
  search?: string;
}

export interface CreateListingFormData {
  title: string;
  description: string;
  category: Category;
  price: number;
  condition: Condition;
  images: File[];
}

export interface UserFormData {
  displayName: string;
  bio: string;
  location: string;
}

export interface Message {
  id: string;
  sender: PublicKey;
  recipient: PublicKey;
  content: string;
  timestamp: number;
  encrypted: boolean;
}

export interface ChatRoom {
  id: string;
  participants: PublicKey[];
  listingId?: PublicKey;
  lastMessage?: Message;
  createdAt: number;
}