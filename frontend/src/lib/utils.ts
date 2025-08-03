import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PublicKey } from '@solana/web3.js';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address: string | PublicKey, chars = 4): string {
  const addressStr = typeof address === 'string' ? address : address.toBase58();
  return `${addressStr.slice(0, chars)}...${addressStr.slice(-chars)}`;
}

export function formatSOL(lamports: number): string {
  return (lamports / 1_000_000_000).toFixed(4);
}

export function formatPrice(lamports: number): string {
  const sol = lamports / 1_000_000_000;
  if (sol >= 1000) {
    return `${(sol / 1000).toFixed(1)}K SOL`;
  }
  if (sol >= 1) {
    return `${sol.toFixed(2)} SOL`;
  }
  return `${sol.toFixed(4)} SOL`;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString();
}

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp * 1000;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

export function validateSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

export function generateListingId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function categoryToDisplay(category: string): string {
  switch (category) {
    case 'Electronics':
      return '📱 Electronics';
    case 'Clothing':
      return '👕 Clothing';
    case 'Home':
      return '🏠 Home & Garden';
    case 'Sports':
      return '⚽ Sports';
    case 'Books':
      return '📚 Books';
    case 'Automotive':
      return '🚗 Automotive';
    case 'Art':
      return '🎨 Art';
    case 'Music':
      return '🎵 Music';
    case 'Gaming':
      return '🎮 Gaming';
    default:
      return '📦 Other';
  }
}

export function conditionToDisplay(condition: string): string {
  switch (condition) {
    case 'New':
      return '✨ New';
    case 'LikeNew':
      return '🌟 Like New';
    case 'Good':
      return '👍 Good';
    case 'Fair':
      return '👌 Fair';
    case 'Poor':
      return '🔧 Poor';
    default:
      return condition;
  }
}

export function getReputationStars(score: number): string {
  const stars = Math.round(score / 100); // Convert from 0-500 to 0-5
  return '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
}

export function uploadToIPFS(file: File): Promise<string> {
  // Mock IPFS upload - in production, integrate with Pinata, Web3.Storage, or similar
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockHash = `Qm${Math.random().toString(36).substring(2, 44)}`;
      resolve(`https://ipfs.io/ipfs/${mockHash}`);
    }, 1000);
  });
}

export function uploadMetadataToArweave(metadata: any): Promise<string> {
  // Mock Arweave upload - in production, integrate with Arweave
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockTxId = Math.random().toString(36).substring(2, 44);
      resolve(`https://arweave.net/${mockTxId}`);
    }, 1000);
  });
}