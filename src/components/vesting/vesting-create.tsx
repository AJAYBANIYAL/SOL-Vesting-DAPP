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
import { VestingStorage, VestingScheduleData } from '@/lib/vesting-storage'
import { Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'

export function VestingCreateButton() {
  const [isOpen, setIsOpen] = useState(false)
  const { cluster } = useCluster()
  
  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        disabled={cluster.network === 'mainnet-beta'}
        variant="outline"
        className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0"
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

  // Get user's tokens
  const { data: tokenAccounts } = useGetTokenAccounts({ 
    address: wallet.publicKey || new PublicKey('11111111111111111111111111111111') 
  })

  const handleCreateVesting = async () => {
    if (!wallet.publicKey || !wallet.sendTransaction) {
      alert('Please connect your wallet first!')
      return
    }

    // Check if we're on the right network
    if (cluster.network === 'mainnet-beta') {
      alert('Please switch to devnet to create test vesting schedules!')
      return
    }

    if (!beneficiary || !selectedToken || !startDate || !endDate || !totalAmount) {
      alert('Please fill in all fields!')
      return
    }

    setIsCreating(true)
    setStep(2)
    
    try {
      // Validate beneficiary address
      let beneficiaryPubkey: PublicKey
      try {
        beneficiaryPubkey = new PublicKey(beneficiary)
      } catch {
        alert('Invalid beneficiary address!')
        return
      }

      // Validate dates
      const start = new Date(startDate)
      const end = new Date(endDate)
      if (start >= end) {
        alert('End date must be after start date!')
        return
      }

      // Check if user has enough SOL for transaction fees
      const balance = await connection.getBalance(wallet.publicKey)
      const minBalance = 0.01 * LAMPORTS_PER_SOL // 0.01 SOL for fees

      if (balance < minBalance) {
        alert(`You need at least 0.01 SOL for transaction fees. Current balance: ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`)
        return
      }

      // Show user guidance
      alert('Please keep Backpack wallet open and ready to approve the transaction!')

      setStep(3)

      // Create a real transaction that will open Backpack
      const transaction = new Transaction()

      // Add a simple SOL transfer to the beneficiary (this will open Backpack)
      // This simulates the vesting by sending a small amount of SOL
      const transferAmount = 0.001 * LAMPORTS_PER_SOL // 0.001 SOL
      
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: beneficiaryPubkey,
          lamports: transferAmount,
        })
      )

      // Get a fresh blockhash
      const { blockhash } = await connection.getLatestBlockhash('finalized')
      transaction.recentBlockhash = blockhash
      transaction.feePayer = wallet.publicKey

      // Send the transaction (this will open Backpack)
      const signature = await wallet.sendTransaction(transaction, connection, {
        skipPreflight: true,
        maxRetries: 3
      })

      // Wait for confirmation
      await connection.confirmTransaction(signature, 'processed')

      setStep(4)

      // Create and save the vesting schedule
      const vestingScheduleId = Math.random().toString(36).substring(2, 15)
      
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
        transactionSignature: signature,
        createdAt: Date.now(),
        status: 'pending'
      }
      
      // Save to local storage
      VestingStorage.saveVestingSchedule(vestingSchedule)
      
      alert(`Vesting Schedule Created Successfully!\n\n` +
        `Transaction: ${signature}\n` +
        `Vesting Schedule ID: ${vestingScheduleId}\n` +
        `Beneficiary: ${beneficiary}\n` +
        `Token: ${selectedToken.slice(0, 8)}...\n` +
        `Start: ${startDate}\n` +
        `End: ${endDate}\n` +
        `Total: ${totalAmount} tokens\n` +
        `Frequency: ${releaseFrequency}\n\n` +
        `Your schedule is now saved and visible in "Manage Vesting"!`)
      
      onClose()
    } catch (error: unknown) {
      console.error('Error creating vesting schedule:', error)

      let errorMessage = 'Failed to create vesting schedule.'

      // Handle specific wallet errors
      if (error instanceof Error && error.message && error.message.includes('Plugin Closed')) {
        errorMessage = 'Backpack wallet was closed. Please:\n\n1. Keep Backpack open\n2. Make sure you&apos;re on devnet\n3. Try again'
      } else if (error instanceof Error && error.message && error.message.includes('User rejected')) {
        errorMessage = 'Transaction was rejected. Please approve the transaction in Backpack.'
      } else if (error && typeof error === 'object' && 'logs' in error && Array.isArray(error.logs)) {
        errorMessage += `\n\nLogs:\n${error.logs.join('\n')}`
      } else if (error instanceof Error && error.message) {
        errorMessage += `\n\nError: ${error.message}`
      }

      alert(errorMessage)
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
    
    const releasesPerPeriod = 1
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
                You're on mainnet. Switch to devnet to create test vesting schedules safely!
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
        
        {/* Smart Contract Info */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">🔒 Real Blockchain Transaction:</h4>
          <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-1">
            <li>• Will open Backpack wallet for approval</li>
            <li>• Creates a test transaction to beneficiary</li>
            <li>• Real blockchain interaction</li>
            <li>• Full vesting smart contract coming soon</li>
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
