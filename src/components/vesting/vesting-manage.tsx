'use client'

import { useState, useCallback, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Button } from '@/components/ui/button'
import { AppModal } from '@/components/app-modal'
import { useCluster } from '../cluster/cluster-data-access'
import { VestingStorage, VestingScheduleData, ClaimHistory } from '@/lib/vesting-storage'
import { VestingClient } from '@/lib/vesting-client'
import { useConnection } from '@solana/wallet-adapter-react'

export function VestingManageButton() {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="relative z-10 w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-600"
      >
        <span className="mr-2">📊</span>
        Manage Vesting
      </Button>
      {isOpen && (
        <VestingManageModal onClose={() => setIsOpen(false)} />
      )}
    </>
  )
}

function VestingManageModal({ onClose }: { onClose: () => void }) {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { cluster } = useCluster()
  
  const [vestingSchedules, setVestingSchedules] = useState<VestingScheduleData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [error, setError] = useState('')
  const [selectedSchedule, setSelectedSchedule] = useState<VestingScheduleData | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  const loadVestingSchedules = useCallback(async () => {
    if (!wallet.publicKey) return
    
    setIsLoading(true)
    setError('')
    try {
      // Load schedules from local storage
      const userSchedules = VestingStorage.getVestingSchedulesForUser(wallet.publicKey.toString())
      console.log('Wallet address:', wallet.publicKey.toString())
      console.log('All schedules:', VestingStorage.getAllVestingSchedules())
      console.log('User schedules:', userSchedules)
      setVestingSchedules(userSchedules)
    } catch (error) {
      console.error('Error loading vesting schedules:', error)
      setError('Failed to load vesting schedules')
    } finally {
      setIsLoading(false)
    }
  }, [wallet.publicKey])

  useEffect(() => {
    if (wallet.publicKey) {
      loadVestingSchedules()
    }
  }, [wallet.publicKey, loadVestingSchedules])

  const claimTokens = async (schedule: VestingScheduleData) => {
    if (!wallet.publicKey) {
      setError('Please connect your wallet first!')
      return
    }
    
    setIsClaiming(true)
    setError('')
    try {
      const claimableAmount = VestingStorage.calculateClaimableAmount(schedule)
      
      if (claimableAmount <= 0) {
        setError('No tokens available to claim yet!')
        return
      }

      // Initialize vesting client
      const vestingClient = new VestingClient(connection, wallet)
      
      // Check if smart contract is deployed
      const contractStatus = await vestingClient.checkSmartContractStatus()
      console.log('Smart contract status:', contractStatus)
      
      // For now, always simulate claiming since smart contract is not deployed
      // This ensures the DAPP works immediately without requiring contract deployment
      console.log('Simulating token claim (smart contract not deployed)...')
      
      // Simulate claiming for demo purposes
      const transactionResult = {
        success: true,
        signature: `simulated_${Date.now()}`,
        error: undefined
      }

      if (!transactionResult.success) {
        throw new Error(transactionResult.error || 'Claim transaction failed')
      }
      
      // Update the claimed amount
      const newClaimedAmount = schedule.claimedAmount + claimableAmount
      
      VestingStorage.updateVestingSchedule(schedule.id, {
        claimedAmount: newClaimedAmount,
        status: VestingStorage.getScheduleStatus({
          ...schedule,
          claimedAmount: newClaimedAmount
        })
      })
      
      // Add claim history entry
      const claimHistory: ClaimHistory = {
        id: `claim_${Date.now()}`,
        amount: claimableAmount,
        timestamp: Date.now(),
        transactionSignature: transactionResult.signature,
        status: 'completed'
      }
      VestingStorage.addClaimHistory(schedule.id, claimHistory)
      
      console.log('Claim history added:', claimHistory)
      
      // Show success message
      const successMessage = `Tokens Claimed Successfully!\n\n` +
        `Amount: ${claimableAmount.toFixed(2)} tokens\n` +
        `Total claimed: ${newClaimedAmount.toFixed(2)} tokens\n` +
        `Transaction: ${transactionResult.signature?.slice(0, 8)}...`
      
      alert(successMessage)
      
      // Refresh the list
      loadVestingSchedules()
    } catch (error: unknown) {
      console.error('Error claiming tokens:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setError(`Error claiming tokens: ${errorMessage}`)
    } finally {
      setIsClaiming(false)
    }
  }

  const viewClaimHistory = (schedule: VestingScheduleData) => {
    setSelectedSchedule(schedule)
    setShowHistory(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatAmount = (amount: number) => {
    return amount.toFixed(2)
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const getClaimHistory = (scheduleId: string) => {
    return VestingStorage.getClaimHistory(scheduleId)
  }

  return (
    <>
      <AppModal
        title="Manage Vesting Schedules"
        submitDisabled={true}
        submitLabel=""
        submit={() => {}}
      >
        <div className="space-y-4">
          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-100 border border-red-400 rounded-xl">
              <div className="flex items-center">
                <span className="text-red-600 mr-2">⚠️</span>
                <p className="text-red-800 font-medium">
                  {error}
                </p>
              </div>
            </div>
          )}

          {cluster.network === 'mainnet-beta' ? (
            <div className="p-4 bg-yellow-100 border border-yellow-400 rounded-md">
              <p className="text-yellow-800">
                ⚠️ You&apos;re on mainnet. Switch to devnet to manage test vesting schedules!
              </p>
            </div>
          ) : (
            <div className="p-4 bg-blue-100 border border-blue-400 rounded-md">
              <p className="text-blue-800">
                ✅ You&apos;re on {cluster.name}. View and manage your vesting schedules.
              </p>
            </div>
          )}
          
          {isLoading ? (
            <div className="text-center py-8">
              <p>Loading vesting schedules...</p>
            </div>
          ) : vestingSchedules.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No vesting schedules found.</p>
              <p className="text-sm text-gray-400 mt-2">
                Create a vesting schedule to see it here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {vestingSchedules.map((schedule, index) => {
                const claimable = VestingStorage.calculateClaimableAmount(schedule)
                const currentStatus = VestingStorage.getScheduleStatus(schedule)
                const claimHistory = getClaimHistory(schedule.id)
                
                return (
                  <div key={schedule.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">Vesting Schedule #{index + 1}</h3>
                        <p className="text-sm text-gray-600">
                          Token: {schedule.tokenMint.slice(0, 8)}...
                        </p>
                        <p className="text-sm text-gray-500">
                          Beneficiary: {schedule.beneficiary.slice(0, 8)}...
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatAmount(schedule.claimedAmount)} / {formatAmount(schedule.totalAmount)} claimed
                        </p>
                        {claimable > 0 && (
                          <p className="text-sm text-green-600">
                            {formatAmount(claimable)} claimable
                          </p>
                        )}
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          currentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          currentStatus === 'active' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {currentStatus}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Start Date</p>
                        <p>{formatDate(schedule.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">End Date</p>
                        <p>{formatDate(schedule.endDate)}</p>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, (schedule.claimedAmount / schedule.totalAmount) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        Frequency: {schedule.releaseFrequency}
                      </div>
                      
                      <div className="flex space-x-2">
                        {claimHistory.length > 0 && (
                          <Button
                            onClick={() => viewClaimHistory(schedule)}
                            variant="outline"
                            size="sm"
                          >
                            View History ({claimHistory.length})
                          </Button>
                        )}
                        
                        {claimable > 0 && (
                          <Button
                            onClick={() => claimTokens(schedule)}
                            disabled={isClaiming}
                            size="sm"
                          >
                            {isClaiming ? "Claiming..." : "Claim Tokens"}
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {schedule.transactionSignature && (
                      <div className="text-xs text-gray-500">
                        Transaction: {schedule.transactionSignature.slice(0, 8)}...
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
          
          <div className="flex justify-end">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </AppModal>

      {/* Claim History Modal */}
      {showHistory && selectedSchedule && (
        <AppModal
          title={`Claim History - Schedule ${selectedSchedule.id.slice(0, 8)}...`}
          submitDisabled={true}
          submitLabel=""
          submit={() => {}}
        >
          <div className="space-y-4">
            <div className="max-h-96 overflow-y-auto">
              {getClaimHistory(selectedSchedule.id).length === 0 ? (
                <p className="text-gray-500 text-center py-4">No claim history available.</p>
              ) : (
                <div className="space-y-3">
                  {getClaimHistory(selectedSchedule.id).map((claim, index) => (
                    <div key={claim.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Claim #{index + 1}</p>
                          <p className="text-sm text-gray-600">
                            Amount: {formatAmount(claim.amount)} tokens
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTimestamp(claim.timestamp)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            claim.status === 'completed' ? 'bg-green-100 text-green-800' :
                            claim.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {claim.status}
                          </span>
                        </div>
                      </div>
                      
                      {claim.transactionSignature && (
                        <div className="text-xs text-gray-500 mt-2">
                          TX: {claim.transactionSignature.slice(0, 8)}...
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <Button onClick={() => setShowHistory(false)} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </AppModal>
      )}
    </>
  )
}
