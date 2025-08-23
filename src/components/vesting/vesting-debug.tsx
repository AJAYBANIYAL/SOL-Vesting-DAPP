'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { VestingStorage } from '@/lib/vesting-storage'
import { useState, useEffect } from 'react'

export function VestingDebug() {
  const wallet = useWallet()
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    if (wallet.publicKey) {
      const allSchedules = VestingStorage.getAllVestingSchedules()
      const userSchedules = VestingStorage.getVestingSchedulesForUser(wallet.publicKey.toString())
      
      setDebugInfo({
        walletAddress: wallet.publicKey.toString(),
        totalSchedules: allSchedules.length,
        userSchedules: userSchedules.length,
        allSchedules,
        userSchedules,
        localStorage: {
          vesting_schedules: localStorage.getItem('vesting_schedules')
        }
      })
    }
  }, [wallet.publicKey])

  const clearAllData = () => {
    localStorage.removeItem('vesting_schedules')
    window.location.reload()
  }

  const addTestData = () => {
    const testSchedule = {
      id: 'test-' + Date.now(),
      authority: wallet.publicKey?.toString() || '',
      beneficiary: wallet.publicKey?.toString() || '',
      tokenMint: 'TestToken123456789',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalAmount: 1000,
      claimedAmount: 0,
      releaseFrequency: 'monthly',
      createdAt: Date.now(),
      status: 'pending' as const
    }
    
    VestingStorage.saveVestingSchedule(testSchedule)
    window.location.reload()
  }

  if (!wallet.publicKey) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
        <h3 className="font-bold text-yellow-800">Debug Info</h3>
        <p className="text-yellow-700">Please connect your wallet to see debug information</p>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg border">
      <h3 className="text-lg font-bold mb-4">🔧 Vesting Debug Info</h3>
      
      <div className="space-y-4">
        <div>
          <strong>Wallet Address:</strong> {debugInfo.walletAddress}
        </div>
        
        <div>
          <strong>Total Schedules:</strong> {debugInfo.totalSchedules}
        </div>
        
        <div>
          <strong>Your Schedules:</strong> {debugInfo.userSchedules}
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={addTestData}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Test Data
          </button>
          <button 
            onClick={clearAllData}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear All Data
          </button>
        </div>
        
        {debugInfo.allSchedules && debugInfo.allSchedules.length > 0 && (
          <div>
            <strong>All Schedules:</strong>
            <pre className="mt-2 p-2 bg-gray-200 dark:bg-gray-700 rounded text-xs overflow-auto">
              {JSON.stringify(debugInfo.allSchedules, null, 2)}
            </pre>
          </div>
        )}
        
        {debugInfo.userSchedules && debugInfo.userSchedules.length > 0 && (
          <div>
            <strong>Your Schedules:</strong>
            <pre className="mt-2 p-2 bg-gray-200 dark:bg-gray-700 rounded text-xs overflow-auto">
              {JSON.stringify(debugInfo.userSchedules, null, 2)}
            </pre>
          </div>
        )}
        
        <div>
          <strong>Local Storage Raw:</strong>
          <pre className="mt-2 p-2 bg-gray-200 dark:bg-gray-700 rounded text-xs overflow-auto">
            {JSON.stringify(debugInfo.localStorage, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
