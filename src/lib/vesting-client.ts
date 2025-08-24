import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  getAccount
} from '@solana/spl-token'
import { Program, AnchorProvider, web3, BN } from '@project-serum/anchor'
import { IDL, TokenVesting } from '../idl/token_vesting'

export interface VestingTransactionResult {
  success: boolean
  signature?: string
  error?: string
  scheduleId?: string
}

export class VestingClient {
  private program: Program<TokenVesting>
  private connection: Connection
  private provider: AnchorProvider

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(connection: Connection, wallet: any) {
    this.connection = connection
    this.provider = new AnchorProvider(connection, wallet, {
      preflightCommitment: 'processed',
    })
    this.program = new Program(IDL, new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS'), this.provider)
  }

  async createVestingSchedule(
    beneficiary: PublicKey,
    tokenMint: PublicKey,
    startTime: number,
    endTime: number,
    totalAmount: number
  ): Promise<VestingTransactionResult> {
    try {
      console.log('Creating vesting schedule with params:', {
        beneficiary: beneficiary.toString(),
        tokenMint: tokenMint.toString(),
        startTime,
        endTime,
        totalAmount
      })

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

      // Check if beneficiary token account exists, if not create it
      try {
        await getAccount(this.connection, beneficiaryTokenAccount)
      } catch {
        console.log('Creating beneficiary token account...')
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
      
      console.log('Vesting schedule created successfully:', signature)
      
      return {
        success: true,
        signature,
        scheduleId: vestingSchedulePda.toString()
      }
    } catch (error) {
      console.error('Error creating vesting schedule:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async claimTokens(
    beneficiary: PublicKey,
    tokenMint: PublicKey,
    authority: PublicKey
  ): Promise<VestingTransactionResult> {
    try {
      console.log('Claiming tokens for beneficiary:', beneficiary.toString())

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
      
      console.log('Tokens claimed successfully:', signature)
      
      return {
        success: true,
        signature
      }
    } catch (error) {
      console.error('Error claiming tokens:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async getVestingSchedule(
    beneficiary: PublicKey,
    tokenMint: PublicKey,
    authority: PublicKey
  ) {
    try {
      const [vestingSchedulePda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('vesting_schedule'),
          authority.toBuffer(),
          beneficiary.toBuffer(),
          tokenMint.toBuffer(),
        ],
        this.program.programId
      )

      const schedule = await this.program.account.vestingSchedule.fetch(vestingSchedulePda)
      return {
        success: true,
        schedule
      }
    } catch (error) {
      console.error('Error fetching vesting schedule:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Create a test transaction that simulates vesting without requiring the full smart contract
  async createTestVestingTransaction(
    beneficiary: PublicKey,
    amount: number
  ): Promise<VestingTransactionResult> {
    try {
      console.log('Creating test vesting transaction...')

      // Create a simple SOL transfer transaction (no memo to avoid program issues)
      const transaction = new Transaction()

      // Add SOL transfer to beneficiary (small amount for testing)
      const transferAmount = Math.min(amount * LAMPORTS_PER_SOL, 0.001 * LAMPORTS_PER_SOL)
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: this.provider.wallet.publicKey,
          toPubkey: beneficiary,
          lamports: transferAmount,
        })
      )

      // Get latest blockhash
      const { blockhash } = await this.connection.getLatestBlockhash('confirmed')
      transaction.recentBlockhash = blockhash
      transaction.feePayer = this.provider.wallet.publicKey

      // Send the transaction
      const signature = await this.provider.sendAndConfirm(transaction, [], {
        commitment: 'confirmed',
        skipPreflight: false
      })
      
      console.log('Test vesting transaction created successfully:', signature)
      
      return {
        success: true,
        signature,
        scheduleId: `test_${Date.now()}`
      }
    } catch (error) {
      console.error('Error creating test vesting transaction:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Check if the smart contract is deployed and accessible
  async checkSmartContractStatus(): Promise<{ deployed: boolean; error?: string }> {
    try {
      const programInfo = await this.connection.getAccountInfo(this.program.programId)
      if (programInfo === null) {
        return {
          deployed: false,
          error: 'Smart contract not deployed at this address'
        }
      }
      
      // Also check if the program is executable
      if (!programInfo.executable) {
        return {
          deployed: false,
          error: 'Program exists but is not executable'
        }
      }
      
      return {
        deployed: true
      }
    } catch (error) {
      console.log('Smart contract check failed:', error)
      return {
        deployed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}
