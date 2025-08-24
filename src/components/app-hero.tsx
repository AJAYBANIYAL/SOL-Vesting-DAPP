import React from 'react'

export function AppHero({ title, subtitle, children }: { title: string | React.ReactNode; subtitle: string | React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/30 to-teal-600/20"></div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMS41Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
      
      {/* Floating particles */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-teal-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          {/* Main title with gradient text */}
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-tight">
              {title}
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto rounded-full"></div>
          </div>
          
          {/* Subtitle */}
          <div className="text-xl sm:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed font-light">
            {subtitle}
          </div>
          
          {/* Children content */}
          {children && (
            <div className="mt-12 flex justify-center">
              {children}
            </div>
          )}
          
          {/* Feature badges */}
          <div className="mt-16 flex flex-wrap justify-center gap-4">
            <div className="group flex items-center space-x-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-3 hover:bg-white/10 transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
                🔒
              </div>
              <div className="text-left">
                <div className="text-white font-semibold text-sm">Secure</div>
                <div className="text-slate-300 text-xs">Blockchain protected</div>
              </div>
            </div>
            
            <div className="group flex items-center space-x-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-3 hover:bg-white/10 transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                ⚡
              </div>
              <div className="text-left">
                <div className="text-white font-semibold text-sm">Lightning Fast</div>
                <div className="text-slate-300 text-xs">Instant transactions</div>
              </div>
            </div>
            
            <div className="group flex items-center space-x-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-6 py-3 hover:bg-white/10 transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-400 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold">
                🌐
              </div>
              <div className="text-left">
                <div className="text-white font-semibold text-sm">Global</div>
                <div className="text-slate-300 text-xs">Worldwide access</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-20 text-slate-50 dark:text-slate-900" fill="currentColor" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
        </svg>
      </div>
    </div>
  )
}
