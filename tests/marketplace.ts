import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Marketplace } from "../target/types/marketplace";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";

describe("marketplace", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Marketplace as Program<Marketplace>;
  const provider = anchor.getProvider();

  // Generate test keypairs
  const marketplaceAuthority = Keypair.generate();
  const user1 = Keypair.generate();
  const user2 = Keypair.generate();

  // PDA addresses
  let marketplacePda: PublicKey;
  let user1Pda: PublicKey;
  let user2Pda: PublicKey;
  let listingPda: PublicKey;

  before(async () => {
    // Airdrop SOL to test accounts
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(marketplaceAuthority.publicKey, 2000000000)
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(user1.publicKey, 2000000000)
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(user2.publicKey, 2000000000)
    );

    // Derive PDAs
    [marketplacePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("marketplace")],
      program.programId
    );

    [user1Pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("user"), user1.publicKey.toBuffer()],
      program.programId
    );

    [user2Pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("user"), user2.publicKey.toBuffer()],
      program.programId
    );
  });

  it("Initializes the marketplace", async () => {
    const feeRate = 250; // 2.5%

    const tx = await program.methods
      .initializeMarketplace(feeRate)
      .accounts({
        marketplace: marketplacePda,
        authority: marketplaceAuthority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([marketplaceAuthority])
      .rpc();

    console.log("Initialize marketplace transaction signature", tx);

    // Fetch the marketplace account
    const marketplaceAccount = await program.account.marketplace.fetch(marketplacePda);
    
    assert.equal(marketplaceAccount.authority.toString(), marketplaceAuthority.publicKey.toString());
    assert.equal(marketplaceAccount.feeRate, feeRate);
    assert.equal(marketplaceAccount.totalListings.toString(), "0");
    assert.equal(marketplaceAccount.totalUsers.toString(), "0");
    assert.equal(marketplaceAccount.totalVolume.toString(), "0");
  });

  it("Creates user accounts", async () => {
    // Create user1 account
    const tx1 = await program.methods
      .createUserAccount("Alice", "I love buying and selling items!", "Amsterdam, NL")
      .accounts({
        userAccount: user1Pda,
        marketplace: marketplacePda,
        authority: user1.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([user1])
      .rpc();

    console.log("Create user1 account transaction signature", tx1);

    // Create user2 account
    const tx2 = await program.methods
      .createUserAccount("Bob", "Tech enthusiast and collector", "Rotterdam, NL")
      .accounts({
        userAccount: user2Pda,
        marketplace: marketplacePda,
        authority: user2.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([user2])
      .rpc();

    console.log("Create user2 account transaction signature", tx2);

    // Fetch user accounts
    const user1Account = await program.account.userAccount.fetch(user1Pda);
    const user2Account = await program.account.userAccount.fetch(user2Pda);

    assert.equal(user1Account.displayName, "Alice");
    assert.equal(user1Account.location, "Amsterdam, NL");
    assert.equal(user1Account.reputationScore, 0);
    assert.equal(user1Account.isVerified, false);

    assert.equal(user2Account.displayName, "Bob");
    assert.equal(user2Account.location, "Rotterdam, NL");
    assert.equal(user2Account.reputationScore, 0);
    assert.equal(user2Account.isVerified, false);

    // Check marketplace stats updated
    const marketplaceAccount = await program.account.marketplace.fetch(marketplacePda);
    assert.equal(marketplaceAccount.totalUsers.toString(), "2");
  });

  it("Creates a listing", async () => {
    const listingTitle = "MacBook Pro M2";
    
    [listingPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("listing"), user1.publicKey.toBuffer(), Buffer.from(listingTitle)],
      program.programId
    );

    const category = { electronics: {} };
    const condition = { likeNew: {} };
    const price = new anchor.BN(2500000000); // 2.5 SOL

    const tx = await program.methods
      .createListing(
        listingTitle,
        "Excellent condition MacBook Pro with M2 chip",
        category,
        price,
        condition,
        "ipfs://test-images",
        "ar://test-metadata"
      )
      .accounts({
        listing: listingPda,
        marketplace: marketplacePda,
        sellerAccount: user1Pda,
        seller: user1.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([user1])
      .rpc();

    console.log("Create listing transaction signature", tx);

    // Fetch the listing
    const listingAccount = await program.account.listing.fetch(listingPda);
    
    assert.equal(listingAccount.seller.toString(), user1.publicKey.toString());
    assert.equal(listingAccount.title, listingTitle);
    assert.equal(listingAccount.price.toString(), price.toString());
    assert.equal(listingAccount.isActive, true);
    assert.equal(listingAccount.isSold, false);

    // Check marketplace stats updated
    const marketplaceAccount = await program.account.marketplace.fetch(marketplacePda);
    assert.equal(marketplaceAccount.totalListings.toString(), "1");
  });

  it("Updates listing status", async () => {
    // Deactivate the listing
    const tx = await program.methods
      .updateListingStatus(false)
      .accounts({
        listing: listingPda,
        seller: user1.publicKey,
      })
      .signers([user1])
      .rpc();

    console.log("Update listing status transaction signature", tx);

    // Fetch the updated listing
    const listingAccount = await program.account.listing.fetch(listingPda);
    assert.equal(listingAccount.isActive, false);

    // Reactivate the listing for subsequent tests
    await program.methods
      .updateListingStatus(true)
      .accounts({
        listing: listingPda,
        seller: user1.publicKey,
      })
      .signers([user1])
      .rpc();
  });

  it("Updates user verification", async () => {
    const attestation = "kyc_verification_12345";

    const tx = await program.methods
      .updateVerification(attestation)
      .accounts({
        userAccount: user1Pda,
        authority: user1.publicKey,
      })
      .signers([user1])
      .rpc();

    console.log("Update verification transaction signature", tx);

    // Fetch the updated user account
    const userAccount = await program.account.userAccount.fetch(user1Pda);
    assert.equal(userAccount.isVerified, true);
    assert.equal(userAccount.verificationAttestation, attestation);
  });

  // Note: Purchase and review tests would require token setup
  // This is a basic test suite to verify core functionality
});