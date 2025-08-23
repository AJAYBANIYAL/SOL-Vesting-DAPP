'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useGetTokenAccounts } from '../account/account-data-access'
import { VestingStorage } from '@/lib/vesting-storage'
import { PublicKey } from '@solana/web3.js'
import { useEffect, useState } from 'react'

export function DashboardStats() {
  const wallet = useWallet()
  const { data: tokenAccounts } = useGetTokenAccounts({ 
    address: wallet.publicKey || new PublicKey('11111111111111111111111111111111') 
  })
  
  const [vestingStats, setVestingStats] = useState({
    activeVesting: 0,
    totalValueLocked: 0,
    claimableTokens: 0
  })

  useEffect(() => {
    if (wallet.publicKey) {
      const userSchedules = VestingStorage.getVestingSchedulesForUser(wallet.publicKey.toString())
      const activeCount = userSchedules.filter(s => VestingStorage.getScheduleStatus(s) === 'active').length
      const totalLocked = userSchedules.reduce((sum, s) => sum + (s.totalAmount - s.claimedAmount), 0)
      const claimable = userSchedules.reduce((sum, s) => sum + VestingStorage.calculateClaimableAmount(s), 0)
      
      setVestingStats({
        activeVesting: activeCount,
        totalValueLocked: totalLocked,
        claimableTokens: claimable
      })
    }
  }, [wallet.publicKey])

  const stats = [
    {
      title: "Total Tokens",
      value: tokenAccounts?.length || 0,
      change: "+12%",
      changeType: "positive",
      icon: "🪙",
      description: "Tokens in your wallet"
    },
    {
      title: "Active Vesting",
      value: vestingStats.activeVesting,
      change: "+2",
      changeType: "positive", 
      icon: "🔒",
      description: "Active vesting schedules"
    },
    {
      title: "Total Value Locked",
      value: `${vestingStats.totalValueLocked.toFixed(0)} tokens`,
      change: "+8.2%",
      changeType: "positive",
      icon: "💰",
      description: "Tokens in vesting"
    },
    {
      title: "Claimable Tokens",
      value: vestingStats.claimableTokens.toFixed(0),
      change: "+156",
      changeType: "positive",
      icon: "🎁",
      description: "Ready to claim"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.title}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stat.description}
              </p>
            </div>
            <div className="text-3xl">
              {stat.icon}
            </div>
          </div>
          
          <div className="mt-4 flex items-center">
            <span className={`text-sm font-medium ${
              stat.changeType === 'positive' 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {stat.change}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
              from last month
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
