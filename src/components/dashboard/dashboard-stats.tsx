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
      icon: "🪙",
      iconBg: "from-amber-400 to-orange-500",
      cardBg: "from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20",
      description: "Tokens in your wallet",
      pulse: "bg-amber-200 dark:bg-amber-800"
    },
    {
      title: "Active Vesting",
      value: vestingStats.activeVesting,
      icon: "🔒",
      iconBg: "from-blue-400 to-indigo-500",
      cardBg: "from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
      description: "Active vesting schedules",
      pulse: "bg-blue-200 dark:bg-blue-800"
    },
    {
      title: "Total Value Locked",
      value: `${vestingStats.totalValueLocked.toFixed(0)}`,
      suffix: "tokens",
      icon: "💰",
      iconBg: "from-emerald-400 to-teal-500",
      cardBg: "from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20",
      description: "Tokens in vesting",
      pulse: "bg-emerald-200 dark:bg-emerald-800"
    },
    {
      title: "Claimable Tokens",
      value: vestingStats.claimableTokens.toFixed(0),
      icon: "🎁",
      iconBg: "from-purple-400 to-pink-500",
      cardBg: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
      description: "Ready to claim",
      pulse: "bg-purple-200 dark:bg-purple-800"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className="group relative overflow-hidden rounded-3xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 hover:-translate-y-2"
        >
          {/* Animated background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.cardBg} opacity-50 group-hover:opacity-70 transition-opacity duration-500 pointer-events-none`}></div>
          
          {/* Floating particles effect */}
          <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
            <div className={`absolute top-4 right-4 w-2 h-2 ${stat.pulse} rounded-full animate-ping`}></div>
            <div className={`absolute top-8 right-8 w-1 h-1 ${stat.pulse} rounded-full animate-ping delay-1000`}></div>
            <div className={`absolute top-12 right-6 w-1.5 h-1.5 ${stat.pulse} rounded-full animate-ping delay-500`}></div>
          </div>
          
          <div className="relative p-8">
            {/* Icon section */}
            <div className="flex items-center justify-between mb-6">
              <div className={`w-16 h-16 bg-gradient-to-br ${stat.iconBg} rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}>
                {stat.icon}
              </div>
              <div className="text-right">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {stat.title}
                </div>
              </div>
            </div>
            
            {/* Value section */}
            <div className="space-y-2">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {stat.value}
                </span>
                {stat.suffix && (
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.suffix}
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {stat.description}
              </p>
            </div>
            
            {/* Progress indicator */}
            <div className="mt-6 flex items-center space-x-2">
              <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${stat.iconBg} rounded-full transition-all duration-1000 delay-300 group-hover:w-full`}
                  style={{ width: '0%' }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Live
              </div>
            </div>
          </div>
          
          {/* Hover glow effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        </div>
      ))}
    </div>
  )
}
