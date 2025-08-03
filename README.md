# SolMarket - Decentralized P2P Marketplace on Solana

A full-featured decentralized peer-to-peer marketplace built on the Solana blockchain, inspired by traditional classified ad sites like Marktplaats.nl and 2dehands.be, but enhanced with modern Web3 functionality, crypto payments, and comprehensive security features.

## 🌟 Features

### 🔗 Blockchain & Authentication
- **Solana Integration**: Built entirely on Solana using the Anchor framework
- **Wallet Support**: Compatible with Phantom, Solflare, and other Solana wallets
- **Crypto Payments**: All transactions use SOL or USDC (no fiat support)
- **On-chain Storage**: User profiles and transaction history stored on-chain

### 🧾 Marketplace Features
- **Item Listings**: Create detailed listings with images, descriptions, categories, and conditions
- **Advanced Filtering**: Search by category, price range, condition, location, and seller reputation
- **Categories**: Electronics, Clothing, Home & Garden, Sports, Books, Automotive, Art, Music, Gaming, and more
- **Condition Tracking**: New, Like New, Good, Fair, Poor condition options

### 💬 Communication
- **End-to-End Encrypted Messaging**: Secure communication between buyers and sellers using Dialect
- **Real-time Chat**: Instant messaging for negotiations and coordination
- **Listing-specific Chats**: Conversations tied to specific items for context

### 🧠 Reputation & Verification
- **Reputation System**: Star-based rating system (1-5 stars) with comprehensive scoring
- **KYC Integration**: Optional identity verification using Solana Attestation Service (SAS)
- **Account Verification**: Visual distinction between verified and unverified users
- **Transaction History**: Complete on-chain record of all purchases and sales

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with clean, intuitive interface
- **Real-time Updates**: Live updates for listings, messages, and transactions
- **Advanced Search**: Powerful filtering and search capabilities
- **Smooth Animations**: Modern transitions and interactions

## 🏗️ Architecture

### Smart Contracts (Anchor)
```
programs/marketplace/src/
├── lib.rs              # Main program logic
├── instructions/       # Transaction instructions
├── state/             # Account structures
└── error.rs           # Custom error types
```

### Frontend (Next.js + React)
```
frontend/src/
├── app/               # Next.js 14 app router
├── components/        # Reusable UI components
│   ├── ui/           # Base UI components
│   ├── wallet/       # Wallet integration
│   ├── marketplace/  # Marketplace-specific components
│   └── messaging/    # Chat and messaging
├── lib/              # Utilities and integrations
│   ├── anchor.ts     # Anchor program client
│   ├── sas.ts        # Solana Attestation Service
│   └── utils.ts      # Helper functions
├── store/            # State management (Zustand)
├── types/            # TypeScript definitions
└── hooks/            # Custom React hooks
```

## 🛠️ Technology Stack

### Blockchain
- **Solana**: High-performance blockchain for fast, low-cost transactions
- **Anchor**: Framework for building secure Solana programs
- **SPL Tokens**: Support for SOL and USDC payments

### Frontend
- **Next.js 14**: React framework with app router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Zustand**: Lightweight state management

### Integrations
- **Solana Wallet Adapter**: Universal wallet connection
- **Dialect**: Decentralized messaging protocol
- **Solana Attestation Service**: KYC and verification
- **IPFS/Arweave**: Decentralized storage for images and metadata

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Rust 1.70+
- Solana CLI
- Anchor CLI

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd solana-marketplace-dapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Solana environment**
   ```bash
   # Set to devnet for development
   solana config set --url devnet
   
   # Create a new keypair (if needed)
   solana-keygen new
   
   # Get some devnet SOL
   solana airdrop 2
   ```

4. **Build the smart contract**
   ```bash
   anchor build
   ```

5. **Deploy to devnet**
   ```bash
   anchor deploy
   ```

6. **Start the frontend**
   ```bash
   npm run dev
   ```

7. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📋 Smart Contract Overview

### Core Instructions

#### `initialize_marketplace`
- Sets up the global marketplace configuration
- Defines fee rates and initial parameters
- Creates the marketplace PDA (Program Derived Address)

#### `create_user_account`
- Creates an on-chain user profile
- Stores display name, bio, location, and reputation data
- Initializes reputation tracking

#### `create_listing`
- Creates a new item listing
- Stores item details, pricing, and metadata URIs
- Links to seller's account

#### `purchase_item`
- Facilitates secure item purchases
- Handles SOL/USDC transfers with marketplace fees
- Creates purchase records for tracking

#### `leave_review`
- Allows rating and reviewing after completed transactions
- Updates user reputation scores
- Maintains transaction history

#### `update_verification`
- Updates user verification status via SAS attestations
- Links KYC verification to user accounts
- Enhances trust and security

### Account Structures

#### `Marketplace`
```rust
pub struct Marketplace {
    pub authority: Pubkey,
    pub fee_rate: u16,           // Basis points (100 = 1%)
    pub total_listings: u64,
    pub total_users: u64,
    pub total_volume: u64,
    pub bump: u8,
}
```

#### `UserAccount`
```rust
pub struct UserAccount {
    pub authority: Pubkey,
    pub display_name: String,
    pub bio: String,
    pub location: String,
    pub reputation_score: u16,   // Average rating * 100
    pub total_reviews: u32,
    pub total_sales: u32,
    pub total_purchases: u32,
    pub is_verified: bool,
    pub verification_attestation: Option<String>,
    pub created_at: i64,
    pub bump: u8,
}
```

#### `Listing`
```rust
pub struct Listing {
    pub seller: Pubkey,
    pub buyer: Option<Pubkey>,
    pub title: String,
    pub description: String,
    pub category: Category,
    pub price: u64,              // In lamports
    pub condition: Condition,
    pub images_uri: String,      // IPFS/Arweave URI
    pub metadata_uri: String,
    pub is_active: bool,
    pub is_sold: bool,
    pub created_at: i64,
    pub bump: u8,
}
```

## 🔐 Security Features

### On-Chain Security
- **Program Derived Addresses (PDAs)**: Secure account generation
- **Anchor Framework**: Built-in security validations
- **Input Validation**: Comprehensive parameter checking
- **Access Controls**: Owner-only operations where appropriate

### Reputation System
- **Weighted Scoring**: Recent transactions have slightly more impact
- **Multi-factor Reputation**: Considers ratings, transaction count, and completion rate
- **Verification Badges**: Visual indicators for KYC-verified users
- **Immutable History**: All ratings and reviews stored on-chain

### Privacy & Encryption
- **End-to-End Encryption**: All messages encrypted using Dialect
- **Metadata Privacy**: Sensitive data stored off-chain with hashes on-chain
- **Wallet-based Authentication**: No passwords or centralized accounts

## 🌐 Integrations

### Solana Attestation Service (SAS)
- **KYC Verification**: Identity verification with trusted providers
- **Reputation Attestations**: On-chain proof of user reputation
- **Listing Verification**: Third-party verification of item authenticity
- **Business Verification**: Enhanced verification for commercial sellers

### Dialect Messaging
- **Encrypted Chat**: Secure communication between users
- **Real-time Updates**: Instant message delivery
- **Persistence**: Message history maintained across sessions
- **Cross-platform**: Works across all supported devices

### Decentralized Storage
- **IPFS**: For image storage and redundancy
- **Arweave**: For permanent metadata storage
- **Content Addressing**: Immutable content references
- **Distributed Access**: No single point of failure

## 🎯 Usage Examples

### Creating a Listing
```typescript
const program = new MarketplaceProgram(connection, wallet);

await program.createListing(
  "MacBook Pro M2",                    // title
  "Excellent condition, barely used",  // description
  Category.Electronics,                // category
  2.5 * LAMPORTS_PER_SOL,             // price in lamports
  Condition.LikeNew,                   // condition
  "ipfs://...",                        // images URI
  "ar://..."                           // metadata URI
);
```

### Purchasing an Item
```typescript
await program.purchaseItem(listingPubkey);
// Automatically handles:
// - SOL transfer to seller
// - Marketplace fee deduction
// - Purchase record creation
// - Listing status update
```

### Leaving a Review
```typescript
await program.leaveReview(
  purchasePubkey,
  5,                          // rating (1-5 stars)
  "Great seller, fast shipping!",  // comment
  true                        // is reviewing seller
);
```

## 📱 Frontend Features

### Responsive Design
- **Mobile-first**: Optimized for smartphones and tablets
- **Progressive Enhancement**: Enhanced features on larger screens
- **Touch-friendly**: Intuitive gestures and interactions
- **Fast Loading**: Optimized for all network conditions

### Real-time Updates
- **Live Listings**: New items appear instantly
- **Message Notifications**: Real-time chat updates
- **Status Changes**: Immediate feedback on transactions
- **Price Updates**: Dynamic pricing information

### Advanced Search & Filtering
- **Multi-criteria Filtering**: Category, price, condition, location
- **Full-text Search**: Search titles and descriptions
- **Saved Searches**: Bookmark frequently used filters
- **Sort Options**: Price, date, popularity, distance

## 🔧 Development

### Code Structure
The project follows a modular architecture with clear separation of concerns:

- **Smart Contracts**: Rust-based Anchor programs
- **Frontend**: TypeScript React with Next.js
- **State Management**: Zustand for client-side state
- **Styling**: Tailwind CSS with custom components
- **Type Safety**: Full TypeScript coverage

### Testing
```bash
# Run smart contract tests
anchor test

# Run frontend tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

### Building for Production
```bash
# Build smart contracts
anchor build

# Build frontend
npm run build

# Start production server
npm start
```

## 🚦 Roadmap

### Phase 1: Core Features ✅
- [x] Basic marketplace functionality
- [x] User profiles and authentication
- [x] Listing creation and management
- [x] Simple messaging system

### Phase 2: Enhanced Features ✅
- [x] Reputation system
- [x] Advanced filtering
- [x] KYC integration with SAS
- [x] Encrypted messaging with Dialect

### Phase 3: Advanced Features 🔄
- [ ] Escrow system for high-value items
- [ ] NFT marketplace integration
- [ ] Auction functionality
- [ ] Multi-language support

### Phase 4: Scale & Optimize 📋
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] API for third-party integrations
- [ ] Governance token and DAO features

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Standards
- Use TypeScript for all new code
- Follow the existing code style
- Add documentation for new features
- Ensure all tests pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check our [docs](docs/) folder
- **Issues**: Report bugs on [GitHub Issues](issues)
- **Discord**: Join our community server
- **Email**: support@solmarket.io

## 🙏 Acknowledgments

- **Solana Foundation**: For the incredible blockchain infrastructure
- **Anchor**: For the secure smart contract framework
- **Dialect**: For decentralized messaging capabilities
- **The Community**: For feedback, testing, and contributions

---

**Built with ❤️ for the Solana ecosystem**
