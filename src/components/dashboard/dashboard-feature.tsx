import { AppHero } from '@/components/app-hero'
import { DashboardStats } from './dashboard-stats'
import { DashboardQuickActions } from './dashboard-quick-actions'

const links: { label: string; href: string }[] = [
  { label: 'Solana Docs', href: 'https://docs.solana.com/' },
  { label: 'Solana Faucet', href: 'https://faucet.solana.com/' },
  { label: 'Solana Cookbook', href: 'https://solana.com/developers/cookbook/' },
  { label: 'Solana Stack Overflow', href: 'https://solana.stackexchange.com/' },
  { label: 'Solana Developers GitHub', href: 'https://github.com/solana-developers/' },
]

export function DashboardFeature() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <AppHero 
        title="TokenVest Pro" 
        subtitle="Professional Token Vesting & Management Platform for Solana Ecosystem" 
      />

      {/* Main Dashboard Content */}
      <div className="relative -mt-10 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            
            {/* Stats Cards */}
            <section className="relative">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-4">
                  Portfolio Overview
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  Monitor your token portfolio and vesting schedules in real-time
                </p>
              </div>
              <DashboardStats />
            </section>
            
            {/* Quick Actions */}
            <section className="relative">
              <DashboardQuickActions />
            </section>
            
            {/* Resources Section */}
            <section className="relative">
              <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-800/80 dark:to-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-2xl">
                <div className="p-8 lg:p-12">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                        📚
                      </div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-emerald-800 to-teal-800 dark:from-white dark:via-emerald-200 dark:to-teal-200 bg-clip-text text-transparent">
                        Developer Resources
                      </h2>
                    </div>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                      Essential tools and documentation to accelerate your Solana development journey
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {links.map((link, index) => (
                      <a
                        key={index}
                        href={link.href}
                        className="group relative overflow-hidden rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/50 dark:border-gray-700/50 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {/* Background Glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        <div className="relative flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                              {link.label}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Official documentation
                            </p>
                          </div>
                          <div className="ml-4 flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors duration-300">
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </section>



            {/* Bottom Spacer */}
            <div className="h-16"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
