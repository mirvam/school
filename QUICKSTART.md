# 🚀 Quick Start Guide

Get the Solana marketplace platform running in under 10 minutes!

## 🏃‍♂️ Super Quick Setup (Automated)

If you have all prerequisites installed, just run:

```bash
./setup.sh
```

This script will:
- Install all dependencies
- Configure Solana for devnet
- Build and deploy the smart contract
- Set up environment variables
- Run tests

Then skip to step 3 below!

## 📋 Step-by-Step Quick Setup

### 1. Prerequisites Check
```bash
# Check if you have the required tools
node --version    # Should be v18+
npm --version
rustc --version
cargo --version
solana --version
anchor --version
```

**Don't have these?** 👉 See [INSTALLATION.md](INSTALLATION.md) for detailed setup.

### 2. Install & Deploy
```bash
# Install dependencies
npm install
cd frontend && npm install && cd ..

# Setup Solana (devnet)
solana config set --url devnet
solana-keygen new --outfile ~/.config/solana/id.json  # If you don't have a keypair
solana airdrop 2

# Build & deploy smart contract
anchor build
anchor deploy

# Setup environment
cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local and update NEXT_PUBLIC_MARKETPLACE_PROGRAM_ID with your deployed program ID
```

### 3. Start the Platform
```bash
cd frontend
npm run dev
```

Open 🌐 http://localhost:3000

## 🎯 First Time Usage

### Setup Your Wallet
1. **Install Phantom Wallet**: https://phantom.app/
2. **Switch to Devnet**: 
   - Open Phantom
   - Click settings ⚙️
   - Change network to "Devnet"
3. **Get Test SOL**: https://faucet.solana.com/
   - Paste your wallet address
   - Request 1-2 SOL

### Test the Platform
1. **Connect Wallet**: Click "Connect Wallet" button
2. **Create Profile**: Click "Complete Profile" and fill in details
3. **Browse Items**: See the mock listings on the homepage
4. **Create Listing**: Click "Sell Item" and create a test listing
5. **Test Features**: Try filtering, searching, and messaging

## 🛠️ Development Workflow

### Making Changes

**Smart Contract Changes:**
```bash
# Edit programs/marketplace/src/lib.rs
anchor build
anchor deploy
# Update program ID in frontend/.env.local
```

**Frontend Changes:**
```bash
# Edit files in frontend/src/
# Development server auto-reloads
```

### Testing
```bash
anchor test              # Test smart contracts
cd frontend && npm test  # Test frontend (if tests exist)
```

## 🚨 Common Issues & Quick Fixes

### "Command not found" errors
```bash
# Add to your ~/.bashrc or ~/.zshrc:
export PATH="$HOME/.cargo/bin:$PATH"
export PATH="/home/$USER/.local/share/solana/install/active_release/bin:$PATH"
source ~/.bashrc
```

### Insufficient SOL
```bash
solana airdrop 2
# Or use web faucet: https://faucet.solana.com/
```

### Port already in use
```bash
cd frontend
npm run dev -- --port 3001
```

### Wallet won't connect
- Make sure you're on Devnet in your wallet
- Refresh the page
- Try disconnecting and reconnecting

### Build fails
```bash
anchor clean
anchor build
```

## 🎮 Quick Demo Script

Want to show off the platform quickly? Here's a demo flow:

1. **Show the Homepage** - Point out the modern UI and marketplace stats
2. **Connect Wallet** - Demonstrate Web3 wallet integration
3. **Create Profile** - Show on-chain user registration
4. **Browse Listings** - Demonstrate filtering and search
5. **Create Listing** - Show the listing creation flow
6. **Test Messaging** - Click "Message" on a listing
7. **Simulate Purchase** - Click "Buy Now" (mock transaction)

## 📱 What You'll See

### Homepage Features
- 🎨 Modern gradient design with Solana branding
- 📊 Live marketplace statistics
- 🔍 Advanced search and filtering
- 📱 Responsive mobile design

### Core Functionality
- 👤 User profile creation (on-chain)
- 🛍️ Item listing creation with categories
- 💬 Mock encrypted messaging
- ⭐ Reputation system display
- 🔐 Wallet-based authentication

### Mock Data
The platform includes sample listings to demonstrate functionality:
- MacBook Pro M2 (2.5 SOL)
- Vintage Leather Jacket (0.8 SOL) 
- Acoustic Guitar (1.2 SOL - sold)

## 🔗 Useful Links

- **Phantom Wallet**: https://phantom.app/
- **Solana Devnet Faucet**: https://faucet.solana.com/
- **Solana Explorer (Devnet)**: https://explorer.solana.com/?cluster=devnet
- **Anchor Documentation**: https://book.anchor-lang.com/

## 🆘 Need Help?

1. **Check the logs**: Browser console and terminal output
2. **Verify setup**: Run `solana config get` and `solana balance`
3. **Read docs**: [INSTALLATION.md](INSTALLATION.md) for detailed setup
4. **Check network**: Make sure you're on devnet everywhere

## ⚡ Super Quick Commands

```bash
# Reset everything
anchor clean && anchor build && anchor deploy

# Quick restart
cd frontend && npm run dev

# Check status
solana config get && solana balance

# Get more SOL
solana airdrop 2
```

Ready to build the future of decentralized commerce! 🌟