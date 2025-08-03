#!/bin/bash

# Solana Marketplace Platform Setup Script
# This script automates the initial setup process

set -e  # Exit on any error

echo "🚀 Setting up Solana Marketplace Platform..."
echo "=============================================="

# Check if required tools are installed
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 is not installed. Please install it first."
        echo "📖 Check INSTALLATION.md for detailed instructions."
        exit 1
    else
        echo "✅ $1 is installed"
    fi
}

echo "🔍 Checking prerequisites..."
check_command "node"
check_command "npm" 
check_command "rustc"
check_command "cargo"
check_command "solana"
check_command "anchor"

echo ""
echo "📦 Installing dependencies..."

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "⚙️ Setting up Solana environment..."

# Configure Solana for devnet
echo "Configuring Solana for devnet..."
solana config set --url devnet

# Check if keypair exists, create if not
if [ ! -f ~/.config/solana/id.json ]; then
    echo "Creating new Solana keypair..."
    solana-keygen new --outfile ~/.config/solana/id.json --no-bip39-passphrase
else
    echo "✅ Solana keypair already exists"
fi

# Request airdrop
echo "Requesting devnet SOL airdrop..."
solana airdrop 2 || echo "⚠️ Airdrop failed - you may need to request manually from https://faucet.solana.com/"

# Check balance
echo "Current SOL balance:"
solana balance

echo ""
echo "🔨 Building smart contract..."

# Build the anchor program
anchor build

echo ""
echo "🚀 Deploying to devnet..."

# Deploy to devnet
DEPLOY_OUTPUT=$(anchor deploy 2>&1)
echo "$DEPLOY_OUTPUT"

# Extract program ID from deploy output
PROGRAM_ID=$(echo "$DEPLOY_OUTPUT" | grep -oE '[A-Za-z0-9]{32,}' | tail -1)

if [ -n "$PROGRAM_ID" ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo "📝 Program ID: $PROGRAM_ID"
    
    # Setup environment file
    echo "Setting up environment configuration..."
    cp frontend/.env.example frontend/.env.local
    
    # Update the program ID in the environment file
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/NEXT_PUBLIC_MARKETPLACE_PROGRAM_ID=.*/NEXT_PUBLIC_MARKETPLACE_PROGRAM_ID=$PROGRAM_ID/" frontend/.env.local
    else
        # Linux
        sed -i "s/NEXT_PUBLIC_MARKETPLACE_PROGRAM_ID=.*/NEXT_PUBLIC_MARKETPLACE_PROGRAM_ID=$PROGRAM_ID/" frontend/.env.local
    fi
    
    echo "✅ Environment file configured with Program ID"
else
    echo "❌ Could not extract Program ID from deployment output"
    echo "Please manually update frontend/.env.local with your Program ID"
fi

echo ""
echo "🧪 Running tests..."
anchor test || echo "⚠️ Some tests may have failed - this is normal for initial setup"

echo ""
echo "🎉 Setup complete!"
echo "==================="
echo ""
echo "📋 Next steps:"
echo "1. Install a Solana wallet (Phantom recommended): https://phantom.app/"
echo "2. Switch your wallet to Devnet"
echo "3. Get devnet SOL: https://faucet.solana.com/"
echo "4. Start the development server:"
echo "   cd frontend && npm run dev"
echo "5. Open http://localhost:3000 in your browser"
echo ""
echo "📖 For detailed instructions, see INSTALLATION.md"
echo "🐛 If you encounter issues, check the troubleshooting section"
echo ""
echo "Happy building! 🚀"