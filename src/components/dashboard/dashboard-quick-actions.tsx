'use client'

import { TokenCreateButton } from '../token/token-create'
import { VestingCreateButton } from '../vesting/vesting-create'
import { VestingManageButton } from '../vesting/vesting-manage'

export function DashboardQuickActions() {
  const actions = [
    {
      title: "Create Token",
      description: "Launch your own SPL token on Solana",
      detailedDesc: "Deploy custom SPL tokens with your own branding and tokenomics",
      icon: "🪙",
      component: <TokenCreateButton />,
      gradient: "from-blue-500 via-blue-600 to-indigo-600",
      iconBg: "from-blue-400 to-blue-600",
      features: ["Custom metadata", "Mintable/Immutable", "Low fees"],
      bgPattern: "bg-blue-50 dark:bg-blue-900/10"
    },
    {
      title: "Create Vesting",
      description: "Set up token vesting schedules",
      detailedDesc: "Configure time-locked token distribution with custom release schedules",
      icon: "🔒",
      component: <VestingCreateButton />,
      gradient: "from-purple-500 via-purple-600 to-pink-600",
      iconBg: "from-purple-400 to-purple-600",
      features: ["Time-locked", "Custom schedules", "Beneficiary control"],
      bgPattern: "bg-purple-50 dark:bg-purple-900/10"
    },
    {
      title: "Manage Vesting",
      description: "View and claim vested tokens",
      detailedDesc: "Monitor vesting progress and claim available tokens when unlocked",
      icon: "📊",
      component: <VestingManageButton />,
      gradient: "from-emerald-500 via-green-600 to-teal-600",
      iconBg: "from-emerald-400 to-emerald-600",
      features: ["Real-time tracking", "Instant claims", "Progress analytics"],
      bgPattern: "bg-emerald-50 dark:bg-emerald-900/10"
    }
  ]

  const features = [
    {
      icon: "📈",
      title: "Analytics Dashboard",
      description: "Track performance metrics",
      color: "blue",
      bgGradient: "from-blue-500/10 to-cyan-500/10",
      iconGradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: "🔐",
      title: "Advanced Security",
      description: "Multi-signature support",
      color: "purple",
      bgGradient: "from-purple-500/10 to-violet-500/10",
      iconGradient: "from-purple-500 to-violet-500"
    },
    {
      icon: "⚡",
      title: "Lightning Fast",
      description: "Sub-second transactions",
      color: "amber",
      bgGradient: "from-amber-500/10 to-yellow-500/10",
      iconGradient: "from-amber-500 to-yellow-500"
    },
    {
      icon: "🌐",
      title: "Global Access",
      description: "Worldwide availability",
      color: "emerald",
      bgGradient: "from-emerald-500/10 to-teal-500/10",
      iconGradient: "from-emerald-500 to-teal-500"
    }
  ]

  return (
    <div className="space-y-12">
      {/* Main Actions Section */}
      <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-2xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-teal-50/50 dark:from-blue-900/20 dark:via-purple-900/10 dark:to-teal-900/20"></div>
        
        <div className="relative p-8 lg:p-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                🚀
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                Quick Actions
              </h2>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Streamline your token management workflow with our powerful suite of tools
            </p>
          </div>
          
          {/* Action Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {actions.map((action, index) => (
              <div key={index} className="group relative">
                {/* Card Container */}
                <div className="relative overflow-hidden rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-white/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.bgPattern} opacity-50 group-hover:opacity-70 transition-opacity duration-500 pointer-events-none`}></div>
                  
                  {/* Content */}
                  <div className="relative p-8">
                    {/* Icon & Title */}
                    <div className="flex items-start space-x-4 mb-6">
                      <div className={`w-16 h-16 bg-gradient-to-br ${action.iconBg} rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                        {action.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          {action.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Detailed Description */}
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                      {action.detailedDesc}
                    </p>
                    
                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mb-8">
                      {action.features.map((feature, idx) => (
                        <span 
                          key={idx}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                    
                    {/* Action Button */}
                    <div className="transform group-hover:scale-105 transition-transform duration-300 relative z-20">
                      {action.component}
                    </div>
                  </div>
                  
                  {/* Hover Glow */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <div key={index} className="group relative overflow-hidden rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-50 group-hover:opacity-80 transition-opacity duration-300`}></div>
            
            <div className="relative p-6 text-center">
              {/* Icon */}
              <div className={`w-12 h-12 bg-gradient-to-r ${feature.iconGradient} rounded-xl flex items-center justify-center text-xl shadow-lg mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              
              {/* Content */}
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
