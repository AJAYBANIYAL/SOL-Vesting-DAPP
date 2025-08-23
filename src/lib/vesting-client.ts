import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js'
import { 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID 
} from '@solana/spl-token'
import { Program, AnchorProvider, web3, BN } from '@project-serum/anchor'
import { IDL } from '../idl/token_vesting'

export class VestingClient {
  private program: Program
  private connection: Connection
  private provider: AnchorProvider

  constructor(connection: Connection, wallet: unknown) {
    this.connection = connection
    this.provider = new AnchorProvider(connection, wallet, {})
    this.program = new Program(IDL, new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS'), this.provider)
  }

  async createVestingSchedule(
    beneficiary: PublicKey,
    tokenMint: PublicKey,
    startTime: number,
    endTime: number,
    totalAmount: number
  ) {
    try {
      // Get the vesting schedule PDA
      const [vestingSchedulePda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('vesting_schedule'),
          this.provider.wallet.publicKey.toBuffer(),
          beneficiary.toBuffer(),
          tokenMint.toBuffer(),
        ],
        this.program.programId
      )

      // Get token accounts
      const authorityTokenAccount = await getAssociatedTokenAddress(
        tokenMint,
        this.provider.wallet.publicKey
      )

      const beneficiaryTokenAccount = await getAssociatedTokenAddress(
        tokenMint,
        beneficiary
      )

      // Create the transaction
      const transaction = new Transaction()

      // Add instruction to create beneficiary token account if it doesn't exist
      try {
        await this.connection.getAccountInfo(beneficiaryTokenAccount)
      } catch {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            this.provider.wallet.publicKey,
            beneficiaryTokenAccount,
            beneficiary,
            tokenMint
          )
        )
      }

      // Add the create vesting schedule instruction
      transaction.add(
        await this.program.methods
          .createVestingSchedule(
            new BN(startTime),
            new BN(endTime),
            new BN(totalAmount)
          )
          .accounts({
            vestingSchedule: vestingSchedulePda,
            authority: this.provider.wallet.publicKey,
            beneficiary: beneficiary,
            tokenMint: tokenMint,
            tokenAccount: authorityTokenAccount,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            rent: web3.SYSVAR_RENT_PUBKEY,
          })
          .instruction()
      )

      // Send the transaction
      const signature = await this.provider.sendAndConfirm(transaction)
      
      return {
        success: true,
        signature,
        vestingSchedulePda: vestingSchedulePda.toString()
      }
    } catch (error) {
      console.error('Error creating vesting schedule:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  async claimTokens(
    beneficiary: PublicKey,
    tokenMint: PublicKey,
    authority: PublicKey
  ) {
    try {
      // Get the vesting schedule PDA
      const [vestingSchedulePda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('vesting_schedule'),
          authority.toBuffer(),
          beneficiary.toBuffer(),
          tokenMint.toBuffer(),
        ],
        this.program.programId
      )

      // Get token accounts
      const authorityTokenAccount = await getAssociatedTokenAddress(
        tokenMint,
        authority
      )

      const beneficiaryTokenAccount = await getAssociatedTokenAddress(
        tokenMint,
        beneficiary
      )

      // Create the transaction
      const transaction = new Transaction()

      // Add the claim tokens instruction
      transaction.add(
        await this.program.methods
          .claimTokens()
          .accounts({
            vestingSchedule: vestingSchedulePda,
            authority: authority,
            beneficiary: beneficiary,
            tokenMint: tokenMint,
            tokenAccount: authorityTokenAccount,
            beneficiaryTokenAccount: beneficiaryTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .instruction()
      )

      // Send the transaction
      const signature = await this.provider.sendAndConfirm(transaction)
      
      return {
        success: true,
        signature
      }
    } catch (error) {
      console.error('Error claiming tokens:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  async getVestingSchedule(
    beneficiary: PublicKey,
    tokenMint: PublicKey,
    authority: PublicKey
  ) {
    try {
      // Get the vesting schedule PDA
      const [vestingSchedulePda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('vesting_schedule'),
          authority.toBuffer(),
          beneficiary.toBuffer(),
          tokenMint.toBuffer(),
        ],
        this.program.programId
      )

      // Fetch the vesting schedule account
      const vestingSchedule = await this.program.account.vestingSchedule.fetch(vestingSchedulePda)
      
      return {
        success: true,
        vestingSchedule
      }
    } catch (error) {
      console.error('Error fetching vesting schedule:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}
