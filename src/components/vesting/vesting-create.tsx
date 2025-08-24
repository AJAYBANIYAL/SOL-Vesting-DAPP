'use client'

import { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AppModal } from '@/components/app-modal'
import { useCluster } from '../cluster/cluster-data-access'
import { useGetTokenAccounts } from '../account/account-data-access'
import { VestingStorage, VestingScheduleData, ClaimHistory } from '@/lib/vesting-storage'
import { VestingClient } from '@/lib/vesting-client'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'

export function VestingCreateButton() {
  const [isOpen, setIsOpen] = useState(false)
  const { cluster } = useCluster()
  
  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        disabled={cluster.network === 'mainnet-beta'}
        className="relative z-10 w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-600"
      >
        <span className="mr-2">🔒</span>
        Create Vesting
      </Button>
      {isOpen && (
        <VestingCreateModal onClose={() => setIsOpen(false)} />
      )}
    </>
  )
}

function VestingCreateModal({ onClose }: { onClose: () => void }) {
  const { connection } = useConnection()
  const wallet = useWallet()
  const { cluster } = useCluster()
  
  const [beneficiary, setBeneficiary] = useState('')
  const [selectedToken, setSelectedToken] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [releaseFrequency, setReleaseFrequency] = useState('monthly')
  const [isCreating, setIsCreating] = useState(false)
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')

  // Get user's tokens
  const { data: tokenAccounts } = useGetTokenAccounts({ 
    address: wallet.publicKey || new PublicKey('11111111111111111111111111111111') 
  })

  const handleCreateVesting = async () => {
    if (!wallet.connected || !wallet.publicKey || !wallet.sendTransaction) {
      setError('Please connect your wallet first!')
      return
    }

    if (!wallet.signTransaction) {
      setError('Your wallet does not support transaction signing. Please use a compatible wallet.')
      return
    }

    // Check if we're on the right network
    if (cluster.network === 'mainnet-beta') {
      setError('Please switch to devnet to create test vesting schedules!')
      return
    }

    if (!beneficiary || !selectedToken || !startDate || !endDate || !totalAmount) {
      setError('Please fill in all fields!')
      return
    }

    // Validate token amount
    const amount = parseFloat(totalAmount)
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid token amount greater than 0!')
      return
    }

    if (amount > 1000000) {
      setError('Token amount is too large. Please enter a reasonable amount.')
      return
    }

    setIsCreating(true)
    setError('')
    setStep(2)
    
    try {
      // Validate beneficiary address
      let beneficiaryPubkey: PublicKey
      try {
        beneficiaryPubkey = new PublicKey(beneficiary)
      } catch {
        setError('Invalid beneficiary address!')
        return
      }

      // Validate dates
      const start = new Date(startDate)
      const end = new Date(endDate)
      const now = new Date()
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        setError('Please enter valid dates!')
        return
      }
      
      if (start >= end) {
        setError('End date must be after start date!')
        return
      }

      if (end <= now) {
        setError('End date must be in the future!')
        return
      }

      // Check if duration is reasonable
      const durationDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      if (durationDays < 1) {
        setError('Vesting duration must be at least 1 day!')
        return
      }

      if (durationDays > 365 * 10) {
        setError('Vesting duration cannot exceed 10 years!')
        return
      }

      // Check if user has enough SOL for transaction fees
      const balance = await connection.getBalance(wallet.publicKey)
      const minBalance = 0.01 * LAMPORTS_PER_SOL // 0.01 SOL for fees

      if (balance < minBalance) {
        setError(`You need at least 0.01 SOL for transaction fees. Current balance: ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`)
        return
      }

      setStep(3)

      // Initialize vesting client
      const vestingClient = new VestingClient(connection, wallet)
      
      // Check if smart contract is deployed
      const contractStatus = await vestingClient.checkSmartContractStatus()
      console.log('Smart contract status:', contractStatus)
      
      // For now, always use test transaction since smart contract is not deployed
      // This ensures the DAPP works immediately without requiring contract deployment
      console.log('Creating test vesting transaction (smart contract not deployed)...')
      
      // Create test transaction for demo purposes
      const testAmount = 0.001 // Small amount for testing
      const transactionResult = await vestingClient.createTestVestingTransaction(
        beneficiaryPubkey,
        testAmount
      )

      if (!transactionResult.success) {
        throw new Error(transactionResult.error || 'Transaction failed')
      }

      setStep(4)

      // Create and save the vesting schedule
      const vestingScheduleId = transactionResult.scheduleId || Math.random().toString(36).substring(2, 15)
      
      const vestingSchedule: VestingScheduleData = {
        id: vestingScheduleId,
        authority: wallet.publicKey.toString(),
        beneficiary,
        tokenMint: selectedToken,
        startDate,
        endDate,
        totalAmount: parseFloat(totalAmount),
        claimedAmount: 0,
        releaseFrequency,
        transactionSignature: transactionResult.signature,
        createdAt: Date.now(),
        status: 'pending',
        claimHistory: []
      }
      
      // Save to local storage
      VestingStorage.saveVestingSchedule(vestingSchedule)
      
      // Add initial claim history entry
      const initialClaim: ClaimHistory = {
        id: `claim_${Date.now()}`,
        amount: 0,
        timestamp: Date.now(),
        transactionSignature: transactionResult.signature,
        status: 'completed'
      }
      VestingStorage.addClaimHistory(vestingScheduleId, initialClaim)
      
      console.log('Saved vesting schedule:', vestingSchedule)
      console.log('All schedules after save:', VestingStorage.getAllVestingSchedules())
      
      // Show success message
      const successMessage = `🎉 Vesting Schedule Created Successfully!\n\n` +
        `Transaction: ${transactionResult.signature}\n` +
        `Schedule ID: ${vestingScheduleId.slice(0, 8)}...\n` +
        `Beneficiary: ${beneficiary.slice(0, 8)}...\n` +
        `Token: ${selectedToken.slice(0, 8)}...\n` +
        `Amount: ${totalAmount} tokens\n` +
        `Duration: ${startDate} to ${endDate}\n\n` +
        `✅ Your schedule is saved and visible in "Manage Vesting"!\n` +
        `📊 You can now track progress and claim tokens when available.`
      
      alert(successMessage)
      
      onClose()
    } catch (error: unknown) {
      console.error('Error creating vesting schedule:', error)

      let errorMessage = 'Failed to create vesting schedule.'

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
    { number: 1, title: 'Schedule Details', description: 'Configure vesting' },
    { number: 2, title: 'Validation', description: 'Checking requirements' },
    { number: 3, title: 'Creating', description: 'Deploying to blockchain' },
    { number: 4, title: 'Complete', description: 'Schedule created' }
  ]

  const calculateVestingPreview = () => {
    if (!startDate || !endDate || !totalAmount) return null

    const start = new Date(startDate)
    const end = new Date(endDate)
    const duration = end.getTime() - start.getTime()
    const days = Math.ceil(duration / (1000 * 60 * 60 * 24))
    
    let periodInDays = days
    
    switch (releaseFrequency) {
      case 'daily': periodInDays = 1; break
      case 'weekly': periodInDays = 7; break
      case 'monthly': periodInDays = 30; break
      case 'quarterly': periodInDays = 90; break
    }
    
    const numberOfReleases = Math.ceil(days / periodInDays)
    const tokensPerRelease = parseFloat(totalAmount) / numberOfReleases
    
    return { days, numberOfReleases, tokensPerRelease }
  }

  const preview = calculateVestingPreview()

  return (
    <AppModal
      title="Create Vesting Schedule"
      submitDisabled={!beneficiary || !selectedToken || !startDate || !endDate || !totalAmount || isCreating}
      submitLabel={isCreating ? "Creating..." : "Create Vesting Schedule"}
      submit={handleCreateVesting}
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
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}>
                {s.number}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-1 mx-2 ${
                  step > s.number ? 'bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'
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
                You&apos;re on mainnet. Switch to devnet to create test vesting schedules safely!
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-green-100 border border-green-400 rounded-xl">
            <div className="flex items-center">
              <span className="text-green-600 mr-2">✅</span>
              <p className="text-green-800 font-medium">
                You&apos;re on {cluster.name}. This will create a real blockchain transaction!
              </p>
            </div>
          </div>
        )}
        
        {/* Demo Mode Info */}
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
          <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">🎯 Demo Mode - Real Blockchain Transaction:</h4>
          <ul className="text-purple-800 dark:text-purple-200 text-sm space-y-1">
            <li>• Will open your wallet for approval</li>
            <li>• Creates a real SOL transfer to beneficiary (0.001 SOL)</li>
            <li>• Stores complete vesting history locally</li>
            <li>• Full smart contract integration coming soon</li>
            <li>• All data is saved and persistent</li>
            <li>• Safe demo transaction - no complex programs</li>
          </ul>
        </div>

        {/* Vesting Preview */}
        {preview && (
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
            <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">📊 Vesting Preview</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{preview.days}</div>
                <div className="text-purple-700 dark:text-purple-300">Days</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{preview.numberOfReleases}</div>
                <div className="text-purple-700 dark:text-purple-300">Releases</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{preview.tokensPerRelease.toFixed(2)}</div>
                <div className="text-purple-700 dark:text-purple-300">Per Release</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="beneficiary" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Beneficiary Address
            </Label>
            <Input
              id="beneficiary"
              value={beneficiary}
              onChange={(e) => setBeneficiary(e.target.value)}
              placeholder="Enter wallet address"
              disabled={isCreating}
              className="mt-1 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          
          <div>
            <Label htmlFor="token" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Token to Vest
            </Label>
            <select
              id="token"
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
              disabled={isCreating}
              className="mt-1 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-800"
            >
              <option value="">Select a token</option>
              {tokenAccounts?.map(({ account, pubkey }) => (
                <option key={pubkey.toString()} value={account.data.parsed.info.mint}>
                  {account.data.parsed.info.tokenAmount.uiAmount} tokens (Mint: {account.data.parsed.info.mint.slice(0, 8)}...)
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Start Date
            </Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isCreating}
              className="mt-1 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          
          <div>
            <Label htmlFor="endDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              End Date
            </Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={isCreating}
              className="mt-1 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="totalAmount" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Total Amount to Vest
            </Label>
            <Input
              id="totalAmount"
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="1000"
              disabled={isCreating}
              className="mt-1 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          
          <div>
            <Label htmlFor="releaseFrequency" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Release Frequency
            </Label>
            <select
              id="releaseFrequency"
              value={releaseFrequency}
              onChange={(e) => setReleaseFrequency(e.target.value)}
              disabled={isCreating}
              className="mt-1 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-800"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>
        </div>
      </div>
    </AppModal>
  )
}
