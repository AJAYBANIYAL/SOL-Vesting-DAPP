'use client'

export function DashboardCharts() {
  // Mock data for charts
  const vestingData = [
    { month: 'Jan', claimed: 20, locked: 80 },
    { month: 'Feb', claimed: 35, locked: 65 },
    { month: 'Mar', claimed: 50, locked: 50 },
    { month: 'Apr', claimed: 65, locked: 35 },
    { month: 'May', claimed: 80, locked: 20 },
    { month: 'Jun', claimed: 100, locked: 0 },
  ]

  const tokenDistribution = [
    { token: 'SOL', amount: 45, color: 'bg-blue-500' },
    { token: 'USDC', amount: 30, color: 'bg-green-500' },
    { token: 'Custom', amount: 25, color: 'bg-purple-500' },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Vesting Progress Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            📈 Vesting Progress
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Token release schedule over time
          </p>
        </div>
        
        <div className="space-y-4">
          {vestingData.map((data, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{data.month}</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {data.claimed}% claimed
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${data.claimed}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Token Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            🍰 Token Distribution
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Your token portfolio breakdown
          </p>
        </div>
        
        <div className="space-y-4">
          {tokenDistribution.map((token, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${token.color}`}></div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {token.token}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`${token.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${token.amount}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                  {token.amount}%
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Summary Stats */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">12</div>
              <div className="text-xs text-blue-600 dark:text-blue-400">Total Tokens</div>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">$45K</div>
              <div className="text-xs text-green-600 dark:text-green-400">Total Value</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
