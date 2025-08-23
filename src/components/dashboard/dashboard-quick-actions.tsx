'use client'

import { TokenCreateButton } from '../token/token-create'
import { VestingCreateButton } from '../vesting/vesting-create'
import { VestingManageButton } from '../vesting/vesting-manage'

export function DashboardQuickActions() {
  const actions = [
    {
      title: "Create Token",
      description: "Launch your own SPL token",
      icon: "🪙",
      component: <TokenCreateButton />,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Create Vesting",
      description: "Set up token vesting schedule",
      icon: "🔒",
      component: <VestingCreateButton />,
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Manage Vesting",
      description: "View and claim tokens",
      icon: "📊",
      component: <VestingManageButton />,
      color: "from-green-500 to-green-600"
    }
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          🚀 Quick Actions
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Get started with token creation and vesting management
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {actions.map((action, index) => (
          <div key={index} className="group">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 h-full border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-3">
                  {action.icon}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {action.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {action.description}
                  </p>
                </div>
              </div>
              
              <div className="transform group-hover:scale-105 transition-transform duration-200">
                {action.component}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Additional Features */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="text-2xl mb-2">📈</div>
          <h4 className="font-medium text-blue-900 dark:text-blue-100">Analytics</h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">Track performance</p>
        </div>
        
        <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
          <div className="text-2xl mb-2">🔐</div>
          <h4 className="font-medium text-purple-900 dark:text-purple-100">Security</h4>
          <p className="text-sm text-purple-700 dark:text-purple-300">Multi-sig support</p>
        </div>
        
        <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div className="text-2xl mb-2">⚡</div>
          <h4 className="font-medium text-green-900 dark:text-green-100">Fast</h4>
          <p className="text-sm text-green-700 dark:text-green-300">Instant transactions</p>
        </div>
        
        <div className="text-center p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
          <div className="text-2xl mb-2">🌐</div>
          <h4 className="font-medium text-orange-900 dark:text-orange-100">Global</h4>
          <p className="text-sm text-orange-700 dark:text-orange-300">Worldwide access</p>
        </div>
      </div>
    </div>
  )
}
