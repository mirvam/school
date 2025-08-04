# Installation Guide - Solana Marketplace Platform

This guide will walk you through setting up and running the decentralized marketplace platform on your local machine.

## 🔧 Prerequisites

### 1. Install Node.js (v18 or higher)
```bash
# Check if Node.js is installed
node --version
npm --version

# If not installed, download from https://nodejs.org/
# Or use a package manager:
# macOS (using Homebrew)
brew install node

# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm

# Windows (using Chocolatey)
choco install nodejs
```

### 2. Install Rust and Cargo
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Verify installation
rustc --version
cargo --version
```

### 3. Install Solana CLI
```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"

# Add to PATH (add to ~/.bashrc or ~/.zshrc)
export PATH="/home/$USER/.local/share/solana/install/active_release/bin:$PATH"

# Reload shell or run:
source ~/.bashrc  # or source ~/.zshrc

# Verify installation
solana --version
```

### 4. Install Anchor CLI
```bash
# Install Anchor Version Manager (avm)
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force

# Install and use Anchor v0.29.0
avm install latest
avm use latest

# Verify installation
anchor --version
```

### 5. Install Yarn (optional but recommended)
```bash
npm install -g yarn

# Verify installation
yarn --version
```

## 🚀 Project Setup

### Step 1: Clone and Enter the Project Directory
```bash
# If you have the project files, navigate to the directory
cd solana-marketplace-dapp

# Or if cloning from a repository:
# git clone <repository-url>
# cd solana-marketplace-dapp
```

### Step 2: Install Dependencies
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 3: Set up Solana Environment
```bash
# Configure Solana to use devnet
solana config set --url devnet

# Generate a new keypair (if you don't have one)
solana-keygen new --outfile ~/.config/solana/id.json

# Check your configuration
solana config get

# Get some devnet SOL for testing
solana airdrop 2

# Check your balance
solana balance
```

### Step 4: Build the Smart Contract
```bash
# Build the Anchor program
anchor build

# This will create the target directory with compiled program
```

### Step 5: Deploy the Smart Contract to Devnet
```bash
# Deploy to devnet
anchor deploy

# Note: Save the Program ID that gets printed - you'll need it!
# It should look something like: 7X8YZGZzE9p2FvWfKJGNZbDH9YXQ4dUfaEiLhCgRCLdx
```

### Step 6: Update Program ID in Frontend
```bash
# Copy the example environment file
cp frontend/.env.example frontend/.env.local

# Edit the .env.local file and update the MARKETPLACE_PROGRAM_ID
# with the Program ID from the deployment step
```

Example `.env.local` file:
```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_MARKETPLACE_PROGRAM_ID=YOUR_DEPLOYED_PROGRAM_ID_HERE
```

### Step 7: Run Tests (Optional)
```bash
# Run the smart contract tests
anchor test

# This will test the core marketplace functionality
```

### Step 8: Start the Frontend Development Server
```bash
# Navigate to frontend directory
cd frontend

# Start the development server
npm run dev

# Or if you're using yarn:
yarn dev
```

### Step 9: Open the Application
```bash
# Open your browser and go to:
http://localhost:3000
```

## 🎯 Quick Start Guide

### For First-Time Users:

1. **Connect Your Wallet**
   - Install Phantom wallet browser extension
   - Create a new wallet or import existing one
   - Switch to Devnet in wallet settings
   - Get devnet SOL from a faucet: https://faucet.solana.com/

2. **Using the Platform**
   - Click "Connect Wallet" in the top right
   - Create your user profile (required for marketplace activities)
   - Browse existing listings or create your own
   - Test the purchase flow with devnet SOL

### For Development:

1. **Making Changes to Smart Contract**
   ```bash
   # After modifying programs/marketplace/src/lib.rs
   anchor build
   anchor deploy
   # Update the program ID in frontend/.env.local
   ```

2. **Making Changes to Frontend**
   ```bash
   # The development server auto-reloads on file changes
   # No restart needed for most changes
   ```

## 🔍 Troubleshooting

### Common Issues and Solutions:

#### 1. "anchor: command not found"
```bash
# Make sure Anchor is in your PATH
export PATH="$HOME/.cargo/bin:$PATH"
source ~/.bashrc
```

#### 2. "solana: command not found"
```bash
# Add Solana to PATH
export PATH="/home/$USER/.local/share/solana/install/active_release/bin:$PATH"
source ~/.bashrc
```

#### 3. Insufficient SOL for deployment
```bash
# Get more devnet SOL
solana airdrop 2
# Or use the web faucet: https://faucet.solana.com/
```

#### 4. Port 3000 already in use
```bash
# Use a different port
cd frontend
npm run dev -- --port 3001
```

#### 5. Wallet connection issues
- Make sure you're on the correct network (devnet)
- Refresh the page and try connecting again
- Check if the wallet extension is updated

#### 6. Build errors
```bash
# Clean and rebuild
anchor clean
anchor build

# If still issues, try:
rm -rf target/
anchor build
```

## 📱 Testing the Platform

### 1. Create User Profiles
- Connect your wallet
- Click "Complete Profile" or "Get Started"
- Fill in display name, bio, and location
- Submit to create on-chain profile

### 2. Create a Listing
- Click "Sell Item" button
- Fill in item details (title, description, category, price)
- Upload images (optional in development)
- Submit to create listing

### 3. Browse and Filter
- Use the filters on the left sidebar
- Search for specific items
- Filter by category, condition, price range

### 4. Test Messaging (Mock)
- Click "Message" on any listing
- This opens a mock chat interface
- In production, this would use Dialect

### 5. Test Purchases (Mock)
- Click "Buy Now" on listings
- This simulates the purchase flow
- In production, this would transfer SOL

## 🔧 Advanced Configuration

### Custom RPC Endpoint
For better performance, you can use a custom RPC endpoint:

```env
# In frontend/.env.local
NEXT_PUBLIC_RPC_ENDPOINT=https://your-custom-rpc-endpoint.com
```

### Production Deployment
For production deployment:

1. **Deploy to Mainnet**
   ```bash
   solana config set --url mainnet-beta
   anchor deploy
   ```

2. **Update Environment**
   ```env
   NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
   NEXT_PUBLIC_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
   ```

3. **Build for Production**
   ```bash
   cd frontend
   npm run build
   npm start
   ```

## 📚 Next Steps

After successful installation:

1. **Explore the Code Structure**
   - `programs/marketplace/src/lib.rs` - Smart contract
   - `frontend/src/app/page.tsx` - Main homepage
   - `frontend/src/components/` - UI components
   - `frontend/src/lib/anchor.ts` - Blockchain integration

2. **Read the Documentation**
   - Check `README.md` for detailed feature overview
   - Review smart contract functions and data structures
   - Understand the frontend architecture

3. **Customize and Extend**
   - Modify UI components and styling
   - Add new marketplace features
   - Integrate real external services (IPFS, Dialect, SAS)

## 🆘 Getting Help

If you encounter issues:

1. Check the console for error messages
2. Verify all prerequisites are correctly installed
3. Ensure you're using the correct Solana network (devnet)
4. Check that your wallet has sufficient SOL
5. Review the troubleshooting section above

## 📝 Quick Commands Reference

```bash
# Start everything from scratch
solana config set --url devnet
solana airdrop 2
anchor build
anchor deploy
cd frontend && npm run dev

# Check status
solana config get
solana balance
anchor --version
node --version

# Clean rebuild
anchor clean
anchor build
```

Good luck with your marketplace platform! 🚀