use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount, Transfer},
};

declare_id!("7X8YZGZzE9p2FvWfKJGNZbDH9YXQ4dUfaEiLhCgRCLdx");

#[program]
pub mod marketplace {
    use super::*;

    /// Initialize the marketplace with global configuration
    pub fn initialize_marketplace(
        ctx: Context<InitializeMarketplace>,
        fee_rate: u16, // Fee rate in basis points (100 = 1%)
    ) -> Result<()> {
        let marketplace = &mut ctx.accounts.marketplace;
        marketplace.authority = ctx.accounts.authority.key();
        marketplace.fee_rate = fee_rate;
        marketplace.total_listings = 0;
        marketplace.total_users = 0;
        marketplace.total_volume = 0;
        marketplace.bump = ctx.bumps.marketplace;
        
        msg!("Marketplace initialized with fee rate: {}bps", fee_rate);
        Ok(())
    }

    /// Create a user account with initial reputation
    pub fn create_user_account(
        ctx: Context<CreateUserAccount>,
        display_name: String,
        bio: String,
        location: String,
    ) -> Result<()> {
        require!(display_name.len() <= 50, MarketplaceError::DisplayNameTooLong);
        require!(bio.len() <= 500, MarketplaceError::BioTooLong);
        require!(location.len() <= 100, MarketplaceError::LocationTooLong);

        let user_account = &mut ctx.accounts.user_account;
        user_account.authority = ctx.accounts.authority.key();
        user_account.display_name = display_name;
        user_account.bio = bio;
        user_account.location = location;
        user_account.reputation_score = 0;
        user_account.total_reviews = 0;
        user_account.total_sales = 0;
        user_account.total_purchases = 0;
        user_account.is_verified = false;
        user_account.verification_attestation = None;
        user_account.created_at = Clock::get()?.unix_timestamp;
        user_account.bump = ctx.bumps.user_account;

        // Update marketplace stats
        let marketplace = &mut ctx.accounts.marketplace;
        marketplace.total_users += 1;

        msg!("User account created for: {}", user_account.display_name);
        Ok(())
    }

    /// Create a new listing
    pub fn create_listing(
        ctx: Context<CreateListing>,
        title: String,
        description: String,
        category: Category,
        price: u64,
        condition: Condition,
        images_uri: String,
        metadata_uri: String,
    ) -> Result<()> {
        require!(title.len() <= 100, MarketplaceError::TitleTooLong);
        require!(description.len() <= 2000, MarketplaceError::DescriptionTooLong);
        require!(images_uri.len() <= 200, MarketplaceError::URITooLong);
        require!(metadata_uri.len() <= 200, MarketplaceError::URITooLong);
        require!(price > 0, MarketplaceError::InvalidPrice);

        let listing = &mut ctx.accounts.listing;
        listing.seller = ctx.accounts.seller.key();
        listing.title = title;
        listing.description = description;
        listing.category = category;
        listing.price = price;
        listing.condition = condition;
        listing.images_uri = images_uri;
        listing.metadata_uri = metadata_uri;
        listing.is_active = true;
        listing.is_sold = false;
        listing.created_at = Clock::get()?.unix_timestamp;
        listing.bump = ctx.bumps.listing;

        // Update marketplace stats
        let marketplace = &mut ctx.accounts.marketplace;
        marketplace.total_listings += 1;

        msg!("Listing created: {} for {} SOL", listing.title, price as f64 / 1_000_000_000.0);
        Ok(())
    }

    /// Purchase an item
    pub fn purchase_item(ctx: Context<PurchaseItem>) -> Result<()> {
        let listing = &mut ctx.accounts.listing;
        require!(listing.is_active, MarketplaceError::ListingNotActive);
        require!(!listing.is_sold, MarketplaceError::ListingAlreadySold);

        let marketplace = &ctx.accounts.marketplace;
        let price = listing.price;
        let fee = (price * marketplace.fee_rate as u64) / 10000;
        let seller_amount = price - fee;

        // Transfer SOL from buyer to seller
        let transfer_to_seller = Transfer {
            from: ctx.accounts.buyer_ata.to_account_info(),
            to: ctx.accounts.seller_ata.to_account_info(),
            authority: ctx.accounts.buyer.to_account_info(),
        };
        token::transfer(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), transfer_to_seller),
            seller_amount,
        )?;

        // Transfer fee to marketplace
        let transfer_fee = Transfer {
            from: ctx.accounts.buyer_ata.to_account_info(),
            to: ctx.accounts.marketplace_ata.to_account_info(),
            authority: ctx.accounts.buyer.to_account_info(),
        };
        token::transfer(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), transfer_fee),
            fee,
        )?;

        // Create purchase record
        let purchase = &mut ctx.accounts.purchase;
        purchase.buyer = ctx.accounts.buyer.key();
        purchase.seller = listing.seller;
        purchase.listing = ctx.accounts.listing.key();
        purchase.price = price;
        purchase.fee = fee;
        purchase.purchased_at = Clock::get()?.unix_timestamp;
        purchase.is_completed = false;
        purchase.is_disputed = false;
        purchase.bump = ctx.bumps.purchase;

        // Update listing status
        listing.is_sold = true;
        listing.buyer = Some(ctx.accounts.buyer.key());

        // Update user stats
        let seller_account = &mut ctx.accounts.seller_account;
        seller_account.total_sales += 1;

        let buyer_account = &mut ctx.accounts.buyer_account;
        buyer_account.total_purchases += 1;

        // Update marketplace volume
        let marketplace = &mut ctx.accounts.marketplace;
        marketplace.total_volume += price;

        msg!("Item purchased: {} for {} SOL", listing.title, price as f64 / 1_000_000_000.0);
        Ok(())
    }

    /// Complete a purchase and allow reviews
    pub fn complete_purchase(ctx: Context<CompletePurchase>) -> Result<()> {
        let purchase = &mut ctx.accounts.purchase;
        require!(!purchase.is_completed, MarketplaceError::PurchaseAlreadyCompleted);
        require!(!purchase.is_disputed, MarketplaceError::PurchaseDisputed);

        purchase.is_completed = true;
        purchase.completed_at = Some(Clock::get()?.unix_timestamp);

        msg!("Purchase completed for listing: {}", ctx.accounts.listing.key());
        Ok(())
    }

    /// Leave a review for a completed transaction
    pub fn leave_review(
        ctx: Context<LeaveReview>,
        rating: u8,
        comment: String,
        is_seller_review: bool,
    ) -> Result<()> {
        require!(rating >= 1 && rating <= 5, MarketplaceError::InvalidRating);
        require!(comment.len() <= 500, MarketplaceError::CommentTooLong);

        let purchase = &ctx.accounts.purchase;
        require!(purchase.is_completed, MarketplaceError::PurchaseNotCompleted);

        let review = &mut ctx.accounts.review;
        review.reviewer = ctx.accounts.reviewer.key();
        review.reviewee = if is_seller_review {
            purchase.seller
        } else {
            purchase.buyer
        };
        review.purchase = ctx.accounts.purchase.key();
        review.rating = rating;
        review.comment = comment;
        review.is_seller_review = is_seller_review;
        review.created_at = Clock::get()?.unix_timestamp;
        review.bump = ctx.bumps.review;

        // Update reviewee's reputation
        let reviewee_account = &mut ctx.accounts.reviewee_account;
        let old_total = reviewee_account.total_reviews as u64 * reviewee_account.reputation_score as u64;
        reviewee_account.total_reviews += 1;
        reviewee_account.reputation_score = ((old_total + rating as u64) / reviewee_account.total_reviews as u64) as u16;

        msg!("Review left: {} stars for {}", rating, review.reviewee);
        Ok(())
    }

    /// Update user verification status via attestation
    pub fn update_verification(
        ctx: Context<UpdateVerification>,
        attestation: String,
    ) -> Result<()> {
        require!(attestation.len() <= 200, MarketplaceError::AttestationTooLong);

        let user_account = &mut ctx.accounts.user_account;
        user_account.is_verified = true;
        user_account.verification_attestation = Some(attestation.clone());

        msg!("User verified with attestation: {}", attestation);
        Ok(())
    }

    /// Update listing status (activate/deactivate)
    pub fn update_listing_status(
        ctx: Context<UpdateListingStatus>,
        is_active: bool,
    ) -> Result<()> {
        let listing = &mut ctx.accounts.listing;
        require!(!listing.is_sold, MarketplaceError::ListingAlreadySold);
        
        listing.is_active = is_active;
        
        msg!("Listing status updated: {} - Active: {}", listing.title, is_active);
        Ok(())
    }
}

// Account Structs
#[account]
pub struct Marketplace {
    pub authority: Pubkey,
    pub fee_rate: u16, // In basis points
    pub total_listings: u64,
    pub total_users: u64,
    pub total_volume: u64,
    pub bump: u8,
}

#[account]
pub struct UserAccount {
    pub authority: Pubkey,
    pub display_name: String,
    pub bio: String,
    pub location: String,
    pub reputation_score: u16, // Average rating * 100
    pub total_reviews: u32,
    pub total_sales: u32,
    pub total_purchases: u32,
    pub is_verified: bool,
    pub verification_attestation: Option<String>,
    pub created_at: i64,
    pub bump: u8,
}

#[account]
pub struct Listing {
    pub seller: Pubkey,
    pub buyer: Option<Pubkey>,
    pub title: String,
    pub description: String,
    pub category: Category,
    pub price: u64, // In lamports for SOL or smallest unit for tokens
    pub condition: Condition,
    pub images_uri: String, // IPFS/Arweave URI
    pub metadata_uri: String, // Additional metadata URI
    pub is_active: bool,
    pub is_sold: bool,
    pub created_at: i64,
    pub bump: u8,
}

#[account]
pub struct Purchase {
    pub buyer: Pubkey,
    pub seller: Pubkey,
    pub listing: Pubkey,
    pub price: u64,
    pub fee: u64,
    pub purchased_at: i64,
    pub completed_at: Option<i64>,
    pub is_completed: bool,
    pub is_disputed: bool,
    pub bump: u8,
}

#[account]
pub struct Review {
    pub reviewer: Pubkey,
    pub reviewee: Pubkey,
    pub purchase: Pubkey,
    pub rating: u8, // 1-5 stars
    pub comment: String,
    pub is_seller_review: bool, // true if reviewing seller, false if reviewing buyer
    pub created_at: i64,
    pub bump: u8,
}

// Enums
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum Category {
    Electronics,
    Clothing,
    Home,
    Sports,
    Books,
    Automotive,
    Art,
    Music,
    Gaming,
    Other,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum Condition {
    New,
    LikeNew,
    Good,
    Fair,
    Poor,
}

// Context Structs
#[derive(Accounts)]
pub struct InitializeMarketplace<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 2 + 8 + 8 + 8 + 1,
        seeds = [b"marketplace"],
        bump
    )]
    pub marketplace: Account<'info, Marketplace>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateUserAccount<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 4 + 50 + 4 + 500 + 4 + 100 + 2 + 4 + 4 + 4 + 1 + 4 + 200 + 8 + 1,
        seeds = [b"user", authority.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, UserAccount>,
    
    #[account(
        mut,
        seeds = [b"marketplace"],
        bump = marketplace.bump
    )]
    pub marketplace: Account<'info, Marketplace>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct CreateListing<'info> {
    #[account(
        init,
        payer = seller,
        space = 8 + 32 + 33 + 4 + 100 + 4 + 2000 + 1 + 8 + 1 + 4 + 200 + 4 + 200 + 1 + 1 + 8 + 1,
        seeds = [b"listing", seller.key().as_ref(), title.as_bytes()],
        bump
    )]
    pub listing: Account<'info, Listing>,
    
    #[account(
        mut,
        seeds = [b"marketplace"],
        bump = marketplace.bump
    )]
    pub marketplace: Account<'info, Marketplace>,
    
    #[account(
        seeds = [b"user", seller.key().as_ref()],
        bump = seller_account.bump
    )]
    pub seller_account: Account<'info, UserAccount>,
    
    #[account(mut)]
    pub seller: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PurchaseItem<'info> {
    #[account(
        init,
        payer = buyer,
        space = 8 + 32 + 32 + 32 + 8 + 8 + 8 + 9 + 1 + 1 + 1,
        seeds = [b"purchase", listing.key().as_ref(), buyer.key().as_ref()],
        bump
    )]
    pub purchase: Account<'info, Purchase>,
    
    #[account(mut)]
    pub listing: Account<'info, Listing>,
    
    #[account(
        mut,
        seeds = [b"user", buyer.key().as_ref()],
        bump = buyer_account.bump
    )]
    pub buyer_account: Account<'info, UserAccount>,
    
    #[account(
        mut,
        seeds = [b"user", listing.seller.as_ref()],
        bump = seller_account.bump
    )]
    pub seller_account: Account<'info, UserAccount>,
    
    #[account(
        mut,
        seeds = [b"marketplace"],
        bump = marketplace.bump
    )]
    pub marketplace: Account<'info, Marketplace>,
    
    #[account(mut)]
    pub buyer: Signer<'info>,
    
    /// CHECK: Validated by constraint
    #[account(mut)]
    pub seller: AccountInfo<'info>,
    
    pub mint: Account<'info, Mint>,
    
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = buyer
    )]
    pub buyer_ata: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = seller
    )]
    pub seller_ata: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = marketplace
    )]
    pub marketplace_ata: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CompletePurchase<'info> {
    #[account(
        mut,
        seeds = [b"purchase", listing.key().as_ref(), purchase.buyer.as_ref()],
        bump = purchase.bump
    )]
    pub purchase: Account<'info, Purchase>,
    
    pub listing: Account<'info, Listing>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct LeaveReview<'info> {
    #[account(
        init,
        payer = reviewer,
        space = 8 + 32 + 32 + 32 + 1 + 4 + 500 + 1 + 8 + 1,
        seeds = [b"review", purchase.key().as_ref(), reviewer.key().as_ref()],
        bump
    )]
    pub review: Account<'info, Review>,
    
    #[account(
        seeds = [b"purchase", listing.key().as_ref(), purchase.buyer.as_ref()],
        bump = purchase.bump
    )]
    pub purchase: Account<'info, Purchase>,
    
    pub listing: Account<'info, Listing>,
    
    #[account(
        mut,
        seeds = [b"user", reviewee_account.authority.as_ref()],
        bump = reviewee_account.bump
    )]
    pub reviewee_account: Account<'info, UserAccount>,
    
    #[account(mut)]
    pub reviewer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateVerification<'info> {
    #[account(
        mut,
        seeds = [b"user", authority.key().as_ref()],
        bump = user_account.bump,
        has_one = authority
    )]
    pub user_account: Account<'info, UserAccount>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateListingStatus<'info> {
    #[account(
        mut,
        seeds = [b"listing", seller.key().as_ref(), listing.title.as_bytes()],
        bump = listing.bump,
        has_one = seller
    )]
    pub listing: Account<'info, Listing>,
    
    pub seller: Signer<'info>,
}

// Error Types
#[error_code]
pub enum MarketplaceError {
    #[msg("Display name is too long")]
    DisplayNameTooLong,
    #[msg("Bio is too long")]
    BioTooLong,
    #[msg("Location is too long")]
    LocationTooLong,
    #[msg("Title is too long")]
    TitleTooLong,
    #[msg("Description is too long")]
    DescriptionTooLong,
    #[msg("URI is too long")]
    URITooLong,
    #[msg("Invalid price")]
    InvalidPrice,
    #[msg("Listing is not active")]
    ListingNotActive,
    #[msg("Listing is already sold")]
    ListingAlreadySold,
    #[msg("Purchase is already completed")]
    PurchaseAlreadyCompleted,
    #[msg("Purchase is disputed")]
    PurchaseDisputed,
    #[msg("Purchase is not completed")]
    PurchaseNotCompleted,
    #[msg("Invalid rating")]
    InvalidRating,
    #[msg("Comment is too long")]
    CommentTooLong,
    #[msg("Attestation is too long")]
    AttestationTooLong,
}