import React, { useState } from 'react'

// Import persona components for debug display
import { PersonaIdentityCard } from '../../../components/persona'

// Import mock library for persona testing
// import { mockLibraryGames } from '../../../debug/mockLibraryWorking'
import { useLibraryStore } from '../../../stores/useLibraryStore'

interface DebugPanelProps {
  games: any[]
  store: any
  totalPlaytime: number
  currentSession: any
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ 
  games, 
  store, 
  totalPlaytime, 
  currentSession 
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <section className="mb-12">
      <div className="glass-morphism rounded-xl">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-800/50 transition-colors"
        >
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span>🔧</span>
            Debug Panel
          </h3>
          <span className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
            ▼
          </span>
        </button>
        
        {isExpanded && (
          <div className="p-4 border-t border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="text-white">
                <span className="text-gray-400">Games:</span>
                <div className="font-mono">{games?.length || 0}</div>
              </div>
              <div className="text-white">
                <span className="text-gray-400">Total Playtime:</span>
                <div className="font-mono">{Math.floor(totalPlaytime)}h</div>
              </div>
              <div className="text-white">
                <span className="text-gray-400">Store Status:</span>
                <div className="font-mono">{store ? 'OK' : 'NULL'}</div>
              </div>
              <div className="text-white">
                <span className="text-gray-400">Current Session:</span>
                <div className="font-mono">
                  {currentSession ? `Game ${currentSession.gameId}` : 'None'}
                </div>
              </div>
              <div className="text-white">
                <span className="text-gray-400">Session Started:</span>
                <div className="font-mono">
                  {currentSession 
                    ? new Date(currentSession.startedAt).toLocaleTimeString()
                    : 'N/A'
                  }
                </div>
              </div>
              <div className="text-white">
                <span className="text-gray-400">Session Duration:</span>
                <div className="font-mono">
                  {currentSession 
                    ? `${Math.floor((Date.now() - currentSession.startedAt) / 60000)}m`
                    : 'N/A'
                  }
                </div>
              </div>
            </div>
            
            {/* Sample Games Info */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <h4 className="text-white font-medium mb-2">Sample Games with Session Data:</h4>
              <div className="space-y-2 text-xs">
                {games?.slice(0, 3).map((game: any) => (
                  <div key={game.id} className="text-gray-300 font-mono">
                    {game.title}: 
                    <span className="text-gaming-accent ml-2">
                      {game.localSessionCount || 0} sessions, 
                      {game.localSessionMinutes || 0}min total
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Persona Engine Debug Section */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                <span>🧠</span>
                Persona Engine (Experimental)
              </h4>
              <div className="space-y-2 text-xs">
                <div className="text-gray-300">
                  <div className="font-mono text-gaming-accent mb-1">Mock Persona Analysis:</div>
                  <div>Archetype: Explorer (Medium, Flow)</div>
                  <div>Risk: Balanced | Social: Coop</div>
                  <div>Confidence: 75% | Tone: Reflective</div>
                  <div className="text-gray-400 italic mt-1">
                    "You're a curious explorer who prefers steady, balanced sessions with a balanced approach to gaming."
                  </div>
                </div>
                <div className="text-yellow-400 text-xs">
                  ⚠️ Persona Engine active - integration ready
                </div>
              </div>
            </div>
            
            {/* Persona Identity Card Demo */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <span>🎭</span>
                Persona Identity Card (Live Demo)
              </h4>
              <PersonaIdentityCard 
                persona={{
                  traits: {
                    archetypeId: "Explorer",
                    intensity: "Medium",
                    pacing: "Flow",
                    riskProfile: "Balanced",
                    socialStyle: "Solo",
                    confidence: 0.75
                  },
                  mood: {
                    moodId: "focused",
                    intensity: 7,
                    timestamp: new Date()
                  },
                  narrative: {
                    summary: "You're a curious explorer who prefers steady, balanced sessions with a balanced approach to gaming.",
                    tone: "Reflective"
                  },
                  confidence: 0.75
                }}
              />
            </div>
            
            {/* Persona Test Library Loader */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <span>📚</span>
                Persona Test Library
              </h4>
              <div className="space-y-2">
                <button
                  className="px-4 py-2 bg-gaming-primary hover:bg-gaming-secondary text-white rounded-lg transition-colors text-sm font-medium"
                  onClick={() => {
                    // Mock library loading disabled - import not found
                    // const libraryStore = useLibraryStore.getState()
                    // libraryStore.actions.setGames(mockLibraryGames)
                    console.log('Mock library loading disabled')
                  }}
                >
                  Load Persona Test Library (25 games)
                </button>
                <div className="text-xs text-gray-400">
                  Loads a diverse synthetic library for persona stress-testing
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
