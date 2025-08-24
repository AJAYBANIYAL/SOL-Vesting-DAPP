'use client'

import { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import {
  TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress
} from '@solana/spl-token'
import {
  Keypair,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL
} from '@solana/web3.js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AppModal } from '@/components/app-modal'
import { useCluster } from '../cluster/cluster-data-access'

export function TokenCreateButton() {
  const [isOpen, setIsOpen] = useState(false)
  const { cluster } = useCluster()

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        disabled={cluster.network === 'mainnet-beta'}
        className="relative z-10 w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-600"
      >
        <span className="mr-2">🪙</span>
        Create Token
      </Button>
      {isOpen && (
        <TokenCreateModal onClose={() => setIsOpen(false)} />
      )}
    </>
  )
}

function TokenCreateModal({ onClose }: { onClose: () => void }) {
  const { connection } = useConnection()
  const wallet = useWallet()
  const { cluster } = useCluster()

  const [tokenName, setTokenName] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [supply, setSupply] = useState('1000000')
  const [decimals, setDecimals] = useState('9')
  const [isCreating, setIsCreating] = useState(false)
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')

  const handleCreateToken = async () => {
    if (!wallet.connected || !wallet.publicKey || !wallet.sendTransaction) {
      setError('Please connect your wallet first!')
      return
    }

    if (!wallet.signTransaction) {
      setError('Your wallet does not support transaction signing. Please use a compatible wallet.')
      return
    }

    if (cluster.network === 'mainnet-beta') {
      setError('Please switch to devnet to create test tokens!')
      return
    }

    // Validate inputs
    if (!tokenName.trim() || !tokenSymbol.trim()) {
      setError('Please enter both token name and symbol!')
      return
    }

    const supplyNum = parseInt(supply)
    const decimalsNum = parseInt(decimals)

    if (isNaN(supplyNum) || supplyNum <= 0) {
      setError('Please enter a valid supply amount!')
      return
    }

    if (isNaN(decimalsNum) || decimalsNum < 0 || decimalsNum > 9) {
      setError('Decimals must be between 0 and 9!')
      return
    }

    if (tokenSymbol.length > 10) {
      setError('Token symbol must be 10 characters or less!')
      return
    }

    setIsCreating(true)
    setError('')
    setStep(2)

    try {
      // Check if user has enough SOL for transaction fees
      const balance = await connection.getBalance(wallet.publicKey)
      const minBalance = 0.01 * LAMPORTS_PER_SOL // 0.01 SOL for fees

      if (balance < minBalance) {
        setError(`You need at least 0.01 SOL for transaction fees. Current balance: ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`)
        return
      }

      // Generate a new keypair for the mint
      const mintKeypair = Keypair.generate()

      // Get the associated token account address
      const associatedTokenAccount = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        wallet.publicKey
      )

      // Calculate the space needed for the mint account
      const mintRent = await connection.getMinimumBalanceForRentExemption(82)

      // Create the transaction
      const transaction = new Transaction()

      // Add instruction to create the mint account
      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: 82,
          lamports: mintRent,
          programId: TOKEN_PROGRAM_ID,
        })
      )

      // Add instruction to create the mint
      transaction.add(
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          parseInt(decimals),
          wallet.publicKey,
          wallet.publicKey,
          TOKEN_PROGRAM_ID
        )
      )

      // Add instruction to create the associated token account
      transaction.add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          associatedTokenAccount,
          wallet.publicKey,
          mintKeypair.publicKey
        )
      )

      // Add instruction to mint tokens
      transaction.add(
        createMintToInstruction(
          mintKeypair.publicKey,
          associatedTokenAccount,
          wallet.publicKey,
          parseInt(supply) * Math.pow(10, parseInt(decimals))
        )
      )

      // Get a fresh blockhash
      const { blockhash } = await connection.getLatestBlockhash('confirmed')
      transaction.recentBlockhash = blockhash
      transaction.feePayer = wallet.publicKey

      // Sign the transaction with the mint keypair
      transaction.sign(mintKeypair)

      setStep(3)

      // Send the transaction with better error handling
      const signature = await wallet.sendTransaction(transaction, connection, {
        skipPreflight: false,
        maxRetries: 3,
        preflightCommitment: 'confirmed'
      })

      // Wait for confirmation with proper commitment
      await connection.confirmTransaction(signature, 'confirmed')

      setStep(4)

      const successMessage = `Token Created Successfully! 🎉\n\n` +
        `Name: ${tokenName}\n` +
        `Symbol: ${tokenSymbol}\n` +
        `Supply: ${parseInt(supply).toLocaleString()} tokens\n` +
        `Mint Address: ${mintKeypair.publicKey.toString()}\n\n` +
        `Transaction: ${signature}\n\n` +
        `Your token is now available in your wallet!`
      
      alert(successMessage)
      onClose()
    } catch (error: unknown) {
      console.error('Error creating token:', error)

      let errorMessage = 'Failed to create token.'

      // Handle specific wallet errors
      if (error instanceof Error) {
        const message = error.message.toLowerCase()
        if (message.includes('plugin closed') || message.includes('wallet closed')) {
          errorMessage = 'Wallet was closed. Please:\n\n1. Keep your wallet open\n2. Make sure you\'re on devnet\n3. Try again'
        } else if (message.includes('user rejected') || message.includes('rejected')) {
          errorMessage = 'Transaction was rejected. Please approve the transaction in your wallet.'
        } else if (message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds. Please ensure you have enough SOL for transaction fees.'
        } else if (message.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.'
        } else if (message.includes('blockhash')) {
          errorMessage = 'Transaction expired. Please try again.'
        } else {
          errorMessage += `\n\nError: ${error.message}`
        }
      } else if (error && typeof error === 'object' && 'logs' in error && Array.isArray(error.logs)) {
        errorMessage += `\n\nTransaction logs:\n${error.logs.join('\n')}`
      }

      setError(errorMessage)
    } finally {
      setIsCreating(false)
      setStep(1)
    }
  }

  const steps = [
    { number: 1, title: 'Token Details', description: 'Configure your token' },
    { number: 2, title: 'Validation', description: 'Checking requirements' },
    { number: 3, title: 'Creating', description: 'Deploying to blockchain' },
    { number: 4, title: 'Complete', description: 'Token created successfully' }
  ]

  return (
    <AppModal
      title="Create New Token"
      submitDisabled={!tokenName || !tokenSymbol || !supply || isCreating}
      submitLabel={isCreating ? "Creating..." : "Create Token"}
      submit={handleCreateToken}
    >
      <div className="space-y-6">
        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-100 border border-red-400 rounded-xl">
            <div className="flex items-center">
              <span className="text-red-600 mr-2">⚠️</span>
              <p className="text-red-800 font-medium whitespace-pre-line">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((s, index) => (
            <div key={s.number} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                step >= s.number
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}>
                {s.number}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-1 mx-2 ${
                  step > s.number ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}></div>
              )}
            </div>
          ))}
        </div>

        {/* Network Status */}
        {cluster.network === 'mainnet-beta' ? (
          <div className="p-4 bg-red-100 border border-red-400 rounded-xl">
            <div className="flex items-center">
              <span className="text-red-600 mr-2">⚠️</span>
              <p className="text-red-800 font-medium">
                You&apos;re on mainnet. Switch to devnet to create test tokens safely!
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-green-100 border border-green-400 rounded-xl">
            <div className="flex items-center">
              <span className="text-green-600 mr-2">✅</span>
              <p className="text-green-800 font-medium">
                You&apos;re on {cluster.name}. Make sure your wallet is also on {cluster.name}!
              </p>
            </div>
          </div>
        )}

        {/* Token Preview */}
        {tokenName && tokenSymbol && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Token Preview</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700 dark:text-blue-300">Name:</span>
                <span className="font-medium text-blue-900 dark:text-blue-100">{tokenName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 dark:text-blue-300">Symbol:</span>
                <span className="font-medium text-blue-900 dark:text-blue-100">{tokenSymbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 dark:text-blue-300">Supply:</span>
                <span className="font-medium text-blue-900 dark:text-blue-100">{parseInt(supply).toLocaleString()} tokens</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 dark:text-blue-300">Decimals:</span>
                <span className="font-medium text-blue-900 dark:text-blue-100">{decimals}</span>
              </div>
            </div>
          </div>
        )}

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tokenName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Token Name
            </Label>
            <Input
              id="tokenName"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              placeholder="My Awesome Token"
              disabled={isCreating}
              className="mt-1 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <Label htmlFor="tokenSymbol" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Token Symbol
            </Label>
            <Input
              id="tokenSymbol"
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value)}
              placeholder="MAT"
              disabled={isCreating}
              className="mt-1 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="supply" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Initial Supply
            </Label>
            <Input
              id="supply"
              type="number"
              value={supply}
              onChange={(e) => setSupply(e.target.value)}
              placeholder="1000000"
              disabled={isCreating}
              className="mt-1 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <Label htmlFor="decimals" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Decimals
            </Label>
            <Input
              id="decimals"
              type="number"
              value={decimals}
              onChange={(e) => setDecimals(e.target.value)}
              placeholder="9"
              min="0"
              max="9"
              disabled={isCreating}
              className="mt-1 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">🪙 Token Creation:</h4>
          <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-1">
            <li>• Keep your wallet open and unlocked</li>
            <li>• Ensure wallet is connected to devnet</li>
            <li>• Have at least 0.01 SOL for transaction fees</li>
            <li>• Approve the transaction when prompted</li>
            <li>• Token will appear in your wallet after creation</li>
          </ul>
        </div>
      </div>
    </AppModal>
  )
}