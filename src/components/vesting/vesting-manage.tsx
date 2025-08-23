'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Button } from '@/components/ui/button'
import { AppModal } from '@/components/app-modal'
import { useCluster } from '../cluster/cluster-data-access'
import { VestingStorage, VestingScheduleData } from '@/lib/vesting-storage'

export function VestingManageButton() {
  const [isOpen, setIsOpen] = useState(false)
  const { cluster } = useCluster()
  
  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        disabled={cluster.network === 'mainnet-beta'}
        className="relative z-10 w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 focus:ring-4 focus:ring-emerald-300 dark:focus:ring-emerald-600"
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

// Remove the old interface since we're using VestingScheduleData from storage

function VestingManageModal({ onClose }: { onClose: () => void }) {
  const wallet = useWallet()
  const { cluster } = useCluster()
  
  const [vestingSchedules, setVestingSchedules] = useState<VestingScheduleData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)

  const loadVestingSchedules = useCallback(async () => {
    if (!wallet.publicKey) return
    
    setIsLoading(true)
    try {
      // Load schedules from local storage
      const userSchedules = VestingStorage.getVestingSchedulesForUser(wallet.publicKey.toString())
      console.log('Wallet address:', wallet.publicKey.toString())
      console.log('All schedules:', VestingStorage.getAllVestingSchedules())
      console.log('User schedules:', userSchedules)
      setVestingSchedules(userSchedules)
    } catch (error) {
      console.error('Error loading vesting schedules:', error)
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
    if (!wallet.publicKey) return
    
    setIsClaiming(true)
    try {
      const claimableAmount = VestingStorage.calculateClaimableAmount(schedule)
      
      if (claimableAmount <= 0) {
        alert('No tokens available to claim yet!')
        return
      }
      
      // For now, simulate claiming by updating the claimed amount
      const newClaimedAmount = schedule.claimedAmount + claimableAmount
      
      VestingStorage.updateVestingSchedule(schedule.id, {
        claimedAmount: newClaimedAmount,
        status: VestingStorage.getScheduleStatus({
          ...schedule,
          claimedAmount: newClaimedAmount
        })
      })
      
      alert(`Tokens claimed successfully!\n\nClaimed: ${claimableAmount.toFixed(2)} tokens\nTotal claimed: ${newClaimedAmount.toFixed(2)} tokens`)
      loadVestingSchedules() // Refresh the list
    } catch (error: unknown) {
      console.error('Error claiming tokens:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Error claiming tokens: ${errorMessage}`)
    } finally {
      setIsClaiming(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatAmount = (amount: number) => {
    return amount.toFixed(2)
  }

  return (
    <AppModal
      title="Manage Vesting Schedules"
      submitDisabled={true}
      submitLabel=""
      submit={() => {}}
    >
      <div className="space-y-4">
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
  )
}
