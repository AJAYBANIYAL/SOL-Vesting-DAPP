use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod token_vesting {
    use super::*;

    pub fn create_vesting_schedule(
        ctx: Context<CreateVestingSchedule>,
        start_time: i64,
        end_time: i64,
        total_amount: u64,
    ) -> Result<()> {
        let vesting_schedule = &mut ctx.accounts.vesting_schedule;
        
        vesting_schedule.authority = ctx.accounts.authority.key();
        vesting_schedule.beneficiary = ctx.accounts.beneficiary.key();
        vesting_schedule.token_mint = ctx.accounts.token_mint.key();
        vesting_schedule.token_account = ctx.accounts.token_account.key();
        vesting_schedule.start_time = start_time;
        vesting_schedule.end_time = end_time;
        vesting_schedule.total_amount = total_amount;
        vesting_schedule.claimed_amount = 0;
        vesting_schedule.bump = *ctx.bumps.get("vesting_schedule").unwrap();

        Ok(())
    }

    pub fn claim_tokens(ctx: Context<ClaimTokens>) -> Result<()> {
        let vesting_schedule = &mut ctx.accounts.vesting_schedule;
        let clock = Clock::get()?;
        
        // Calculate how many tokens can be claimed
        let current_time = clock.unix_timestamp;
        
        if current_time < vesting_schedule.start_time {
            return err!(VestingError::VestingNotStarted);
        }
        
        let total_vesting_duration = vesting_schedule.end_time - vesting_schedule.start_time;
        let elapsed_time = current_time - vesting_schedule.start_time;
        
        let total_claimable = if current_time >= vesting_schedule.end_time {
            vesting_schedule.total_amount
        } else {
            (vesting_schedule.total_amount as u128 * elapsed_time as u128 / total_vesting_duration as u128) as u64
        };
        
        let claimable_amount = total_claimable - vesting_schedule.claimed_amount;
        
        if claimable_amount == 0 {
            return err!(VestingError::NoTokensToClaim);
        }
        
        // Transfer tokens to beneficiary
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.token_account.to_account_info(),
                to: ctx.accounts.beneficiary_token_account.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
            },
        );
        
        token::transfer(transfer_ctx, claimable_amount)?;
        
        // Update claimed amount
        vesting_schedule.claimed_amount += claimable_amount;
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateVestingSchedule<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + VestingSchedule::INIT_SPACE,
        seeds = [
            b"vesting_schedule",
            authority.key().as_ref(),
            beneficiary.key().as_ref(),
            token_mint.key().as_ref(),
        ],
        bump
    )]
    pub vesting_schedule: Account<'info, VestingSchedule>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    /// CHECK: This is the beneficiary of the vesting schedule
    pub beneficiary: AccountInfo<'info>,
    
    pub token_mint: Account<'info, token::Mint>,
    
    #[account(
        mut,
        constraint = token_account.owner == authority.key(),
        constraint = token_account.mint == token_mint.key(),
    )]
    pub token_account: Account<'info, TokenAccount>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ClaimTokens<'info> {
    #[account(
        mut,
        seeds = [
            b"vesting_schedule",
            authority.key().as_ref(),
            beneficiary.key().as_ref(),
            token_mint.key().as_ref(),
        ],
        bump = vesting_schedule.bump,
        constraint = vesting_schedule.beneficiary == beneficiary.key(),
    )]
    pub vesting_schedule: Account<'info, VestingSchedule>,
    
    pub authority: Signer<'info>,
    
    /// CHECK: This is the beneficiary claiming tokens
    pub beneficiary: AccountInfo<'info>,
    
    pub token_mint: Account<'info, token::Mint>,
    
    #[account(
        mut,
        constraint = token_account.owner == authority.key(),
        constraint = token_account.mint == token_mint.key(),
    )]
    pub token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = beneficiary_token_account.owner == beneficiary.key(),
        constraint = beneficiary_token_account.mint == token_mint.key(),
    )]
    pub beneficiary_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[account]
#[derive(InitSpace)]
pub struct VestingSchedule {
    pub authority: Pubkey,
    pub beneficiary: Pubkey,
    pub token_mint: Pubkey,
    pub token_account: Pubkey,
    pub start_time: i64,
    pub end_time: i64,
    pub total_amount: u64,
    pub claimed_amount: u64,
    pub bump: u8,
}

#[error_code]
pub enum VestingError {
    #[msg("Vesting has not started yet")]
    VestingNotStarted,
    #[msg("No tokens available to claim")]
    NoTokensToClaim,
}
