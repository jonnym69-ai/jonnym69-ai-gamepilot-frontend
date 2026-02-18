import { useState } from 'react'
import { SteamImportInline } from './SteamImportInline'
import { motion, AnimatePresence } from 'framer-motion'

interface EmptyLibraryStateProps {
  isSearchResult: boolean
  onImportSteam: () => void
}

export function EmptyLibraryState({ 
  isSearchResult, 
  onImportSteam 
}: EmptyLibraryStateProps) {
  const [showSteamImport, setShowSteamImport] = useState(false)

  // CASE 1: User searched for something that doesn't exist
  if (isSearchResult) {
    return (
      <div className="glass-morphism rounded-3xl p-16 text-center border border-white/5 bg-white/5 backdrop-blur-xl">
        <div className="text-6xl mb-6">🔍</div>
        <h3 className="text-3xl font-bold text-white mb-3">No games found</h3>
        <p className="text-gray-400 mb-8 text-lg max-w-md mx-auto">
          We couldn't find any games matching those filters or search terms.
        </p>
        <button
          onClick={() => window.location.reload()} // Simple way to reset state
          className="px-8 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all border border-white/10"
        >
          Clear All Filters
        </button>
      </div>
    )
  }

  // CASE 2: Library is actually empty (First time user)
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <div className="glass-morphism rounded-[2rem] p-12 text-center border border-gaming-primary/20 bg-gradient-to-b from-gaming-primary/10 to-transparent max-w-2xl w-full">
        <div className="w-24 h-24 bg-gaming-primary/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(var(--primary-rgb),0.3)]">
          <span className="text-5xl">🚀</span>
        </div>
        
        <h2 className="text-4xl font-black text-white mb-4 tracking-tight">
          Welcome to <span className="text-gaming-primary">GamePilot</span>
        </h2>
        
        <p className="text-gray-400 mb-10 text-lg leading-relaxed">
          Your library is looking a little light. Connect your Steam account to analyze your playstyle and find your perfect play.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setShowSteamImport(true)}
            className="px-10 py-4 bg-gaming-primary text-white font-black rounded-xl shadow-lg shadow-gaming-primary/25 hover:scale-105 transition-transform"
          >
            Connect Steam Library
          </button>
          <button
            className="px-10 py-4 bg-white/5 text-gray-300 font-bold rounded-xl hover:bg-white/10 transition-all border border-white/10"
          >
            Add Game Manually
          </button>
        </div>
      </div>

      {/* Steam Import Modal Overlay */}
      <AnimatePresence>
        {showSteamImport && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-900 border border-white/10 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-bold text-white">Import Library</h2>
                  <button
                    onClick={() => setShowSteamImport(false)}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <SteamImportInline />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}