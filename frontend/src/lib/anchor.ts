import { AnchorProvider, Program, Idl } from '@coral-xyz/anchor';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';

// Import the IDL (would be generated from anchor build)
export const MARKETPLACE_PROGRAM_ID = new PublicKey('7X8YZGZzE9p2FvWfKJGNZbDH9YXQ4dUfaEiLhCgRCLdx');

// Mock IDL for development - in production this would come from anchor build
export const MARKETPLACE_IDL: Idl = {
  version: '0.1.0',
  name: 'marketplace',
  instructions: [
    {
      name: 'initializeMarketplace',
      accounts: [
        { name: 'marketplace', isMut: true, isSigner: false },
        { name: 'authority', isMut: true, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [{ name: 'feeRate', type: 'u16' }],
    },
    {
      name: 'createUserAccount',
      accounts: [
        { name: 'userAccount', isMut: true, isSigner: false },
        { name: 'marketplace', isMut: true, isSigner: false },
        { name: 'authority', isMut: true, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [
        { name: 'displayName', type: 'string' },
        { name: 'bio', type: 'string' },
        { name: 'location', type: 'string' },
      ],
    },
    {
      name: 'createListing',
      accounts: [
        { name: 'listing', isMut: true, isSigner: false },
        { name: 'marketplace', isMut: true, isSigner: false },
        { name: 'sellerAccount', isMut: false, isSigner: false },
        { name: 'seller', isMut: true, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'category', type: { defined: 'Category' } },
        { name: 'price', type: 'u64' },
        { name: 'condition', type: { defined: 'Condition' } },
        { name: 'imagesUri', type: 'string' },
        { name: 'metadataUri', type: 'string' },
      ],
    },
    {
      name: 'purchaseItem',
      accounts: [
        { name: 'purchase', isMut: true, isSigner: false },
        { name: 'listing', isMut: true, isSigner: false },
        { name: 'buyerAccount', isMut: true, isSigner: false },
        { name: 'sellerAccount', isMut: true, isSigner: false },
        { name: 'marketplace', isMut: true, isSigner: false },
        { name: 'buyer', isMut: true, isSigner: true },
        { name: 'seller', isMut: true, isSigner: false },
        { name: 'mint', isMut: false, isSigner: false },
        { name: 'buyerAta', isMut: true, isSigner: false },
        { name: 'sellerAta', isMut: true, isSigner: false },
        { name: 'marketplaceAta', isMut: true, isSigner: false },
        { name: 'tokenProgram', isMut: false, isSigner: false },
        { name: 'associatedTokenProgram', isMut: false, isSigner: false },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [],
    },
    {
      name: 'leaveReview',
      accounts: [
        { name: 'review', isMut: true, isSigner: false },
        { name: 'purchase', isMut: false, isSigner: false },
        { name: 'listing', isMut: false, isSigner: false },
        { name: 'revieweeAccount', isMut: true, isSigner: false },
        { name: 'reviewer', isMut: true, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [
        { name: 'rating', type: 'u8' },
        { name: 'comment', type: 'string' },
        { name: 'isSellerReview', type: 'bool' },
      ],
    },
  ],
  accounts: [
    {
      name: 'Marketplace',
      type: {
        kind: 'struct',
        fields: [
          { name: 'authority', type: 'publicKey' },
          { name: 'feeRate', type: 'u16' },
          { name: 'totalListings', type: 'u64' },
          { name: 'totalUsers', type: 'u64' },
          { name: 'totalVolume', type: 'u64' },
          { name: 'bump', type: 'u8' },
        ],
      },
    },
    {
      name: 'UserAccount',
      type: {
        kind: 'struct',
        fields: [
          { name: 'authority', type: 'publicKey' },
          { name: 'displayName', type: 'string' },
          { name: 'bio', type: 'string' },
          { name: 'location', type: 'string' },
          { name: 'reputationScore', type: 'u16' },
          { name: 'totalReviews', type: 'u32' },
          { name: 'totalSales', type: 'u32' },
          { name: 'totalPurchases', type: 'u32' },
          { name: 'isVerified', type: 'bool' },
          { name: 'verificationAttestation', type: { option: 'string' } },
          { name: 'createdAt', type: 'i64' },
          { name: 'bump', type: 'u8' },
        ],
      },
    },
    {
      name: 'Listing',
      type: {
        kind: 'struct',
        fields: [
          { name: 'seller', type: 'publicKey' },
          { name: 'buyer', type: { option: 'publicKey' } },
          { name: 'title', type: 'string' },
          { name: 'description', type: 'string' },
          { name: 'category', type: { defined: 'Category' } },
          { name: 'price', type: 'u64' },
          { name: 'condition', type: { defined: 'Condition' } },
          { name: 'imagesUri', type: 'string' },
          { name: 'metadataUri', type: 'string' },
          { name: 'isActive', type: 'bool' },
          { name: 'isSold', type: 'bool' },
          { name: 'createdAt', type: 'i64' },
          { name: 'bump', type: 'u8' },
        ],
      },
    },
    {
      name: 'Purchase',
      type: {
        kind: 'struct',
        fields: [
          { name: 'buyer', type: 'publicKey' },
          { name: 'seller', type: 'publicKey' },
          { name: 'listing', type: 'publicKey' },
          { name: 'price', type: 'u64' },
          { name: 'fee', type: 'u64' },
          { name: 'purchasedAt', type: 'i64' },
          { name: 'completedAt', type: { option: 'i64' } },
          { name: 'isCompleted', type: 'bool' },
          { name: 'isDisputed', type: 'bool' },
          { name: 'bump', type: 'u8' },
        ],
      },
    },
    {
      name: 'Review',
      type: {
        kind: 'struct',
        fields: [
          { name: 'reviewer', type: 'publicKey' },
          { name: 'reviewee', type: 'publicKey' },
          { name: 'purchase', type: 'publicKey' },
          { name: 'rating', type: 'u8' },
          { name: 'comment', type: 'string' },
          { name: 'isSellerReview', type: 'bool' },
          { name: 'createdAt', type: 'i64' },
          { name: 'bump', type: 'u8' },
        ],
      },
    },
  ],
  types: [
    {
      name: 'Category',
      type: {
        kind: 'enum',
        variants: [
          { name: 'Electronics' },
          { name: 'Clothing' },
          { name: 'Home' },
          { name: 'Sports' },
          { name: 'Books' },
          { name: 'Automotive' },
          { name: 'Art' },
          { name: 'Music' },
          { name: 'Gaming' },
          { name: 'Other' },
        ],
      },
    },
    {
      name: 'Condition',
      type: {
        kind: 'enum',
        variants: [
          { name: 'New' },
          { name: 'LikeNew' },
          { name: 'Good' },
          { name: 'Fair' },
          { name: 'Poor' },
        ],
      },
    },
  ],
  errors: [
    { code: 6000, name: 'DisplayNameTooLong', msg: 'Display name is too long' },
    { code: 6001, name: 'BioTooLong', msg: 'Bio is too long' },
    { code: 6002, name: 'LocationTooLong', msg: 'Location is too long' },
  ],
};

export class MarketplaceProgram {
  constructor(
    public program: Program,
    public provider: AnchorProvider
  ) {}

  static async initialize(connection: Connection, wallet: WalletContextState): Promise<MarketplaceProgram> {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected');
    }

    const provider = new AnchorProvider(
      connection,
      wallet as any,
      { commitment: 'confirmed' }
    );

    const program = new Program(MARKETPLACE_IDL, MARKETPLACE_PROGRAM_ID, provider);
    
    return new MarketplaceProgram(program, provider);
  }

  // PDA helpers
  static getMarketplacePDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('marketplace')],
      MARKETPLACE_PROGRAM_ID
    );
  }

  static getUserPDA(authority: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('user'), authority.toBuffer()],
      MARKETPLACE_PROGRAM_ID
    );
  }

  static getListingPDA(seller: PublicKey, title: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('listing'), seller.toBuffer(), Buffer.from(title)],
      MARKETPLACE_PROGRAM_ID
    );
  }

  static getPurchasePDA(listing: PublicKey, buyer: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('purchase'), listing.toBuffer(), buyer.toBuffer()],
      MARKETPLACE_PROGRAM_ID
    );
  }

  static getReviewPDA(purchase: PublicKey, reviewer: PublicKey): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('review'), purchase.toBuffer(), reviewer.toBuffer()],
      MARKETPLACE_PROGRAM_ID
    );
  }

  // Instruction builders
  async initializeMarketplace(feeRate: number) {
    const [marketplace] = MarketplaceProgram.getMarketplacePDA();
    
    return this.program.methods
      .initializeMarketplace(feeRate)
      .accounts({
        marketplace,
        authority: this.provider.wallet.publicKey,
        systemProgram: PublicKey.default,
      })
      .rpc();
  }

  async createUserAccount(displayName: string, bio: string, location: string) {
    const [userAccount] = MarketplaceProgram.getUserPDA(this.provider.wallet.publicKey);
    const [marketplace] = MarketplaceProgram.getMarketplacePDA();

    return this.program.methods
      .createUserAccount(displayName, bio, location)
      .accounts({
        userAccount,
        marketplace,
        authority: this.provider.wallet.publicKey,
        systemProgram: PublicKey.default,
      })
      .rpc();
  }

  async createListing(
    title: string,
    description: string,
    category: any,
    price: number,
    condition: any,
    imagesUri: string,
    metadataUri: string
  ) {
    const [listing] = MarketplaceProgram.getListingPDA(this.provider.wallet.publicKey, title);
    const [marketplace] = MarketplaceProgram.getMarketplacePDA();
    const [sellerAccount] = MarketplaceProgram.getUserPDA(this.provider.wallet.publicKey);

    return this.program.methods
      .createListing(title, description, category, price, condition, imagesUri, metadataUri)
      .accounts({
        listing,
        marketplace,
        sellerAccount,
        seller: this.provider.wallet.publicKey,
        systemProgram: PublicKey.default,
      })
      .rpc();
  }

  // Fetch methods
  async fetchMarketplace(): Promise<any> {
    const [marketplace] = MarketplaceProgram.getMarketplacePDA();
    return this.program.account.marketplace.fetch(marketplace);
  }

  async fetchUserAccount(authority: PublicKey): Promise<any> {
    const [userAccount] = MarketplaceProgram.getUserPDA(authority);
    try {
      return await this.program.account.userAccount.fetch(userAccount);
    } catch (error) {
      return null; // User account doesn't exist
    }
  }

  async fetchAllListings(): Promise<any[]> {
    return this.program.account.listing.all();
  }

  async fetchUserListings(seller: PublicKey): Promise<any[]> {
    return this.program.account.listing.all([
      {
        memcmp: {
          offset: 8, // Skip discriminator
          bytes: seller.toBase58(),
        },
      },
    ]);
  }
}