import React, { useState } from 'react'
import type { Game, PlayStatus } from '@gamepilot/types'
import { useLibraryStore } from '../../../stores/useLibraryStore'

interface GameDetailsPanelProps {
  game: Game | null
  onClose: () => void
  onGameUpdate?: (game: Game) => void
  onLaunchGame?: (game: Game) => void
}

export const GameDetailsPanel: React.FC<GameDetailsPanelProps> = ({
  game,
  onClose,
  onGameUpdate,
  onLaunchGame
}) => {
  const { actions } = useLibraryStore()
  const [isEditing, setIsEditing] = useState(false)
  const [editedNotes, setEditedNotes] = useState(game?.notes || '')
  const [editedRating, setEditedRating] = useState(game?.userRating || 0)
  const [editedStatus, setEditedStatus] = useState(game?.playStatus ?? 'backlog')

  if (!game) return null

  const handleSave = () => {
    if (onGameUpdate) {
      const updatedGame = {
        ...game,
        notes: editedNotes,
        userRating: editedRating,
        playStatus: editedStatus
      }
      onGameUpdate(updatedGame)
    }
    setIsEditing(false)
  }

  const handleLaunch = () => {
    if (onLaunchGame && game) {
      onLaunchGame(game)
    }
  }

  const handleStatusChange = (newStatus: PlayStatus) => {
    setEditedStatus(newStatus)
    if (game) {
      actions.updateGameStatus(game.id, newStatus)
    }
  }

  const handleCancel = () => {
    setEditedNotes(game.notes || '')
    setEditedRating(game.userRating || 0)
    setEditedStatus(game.playStatus || 'backlog')
    setIsEditing(false)
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-hidden">
      <div className="glass-morphism rounded-3xl max-w-5xl w-full max-h-[95vh] overflow-y-auto border border-white/10 shadow-2xl relative">
        
        {/* Cinematic Header */}
        <div className="relative h-[400px] w-full">
          <img
            src={game.coverImage || game.backgroundImages?.[0]}
            alt={game.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/60 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all border border-white/10"
          >
            ✕
          </button>
          
          <div className="absolute bottom-8 left-8 right-8">
             <div className="flex flex-wrap gap-2 mb-4">
                {game.moods?.map((mood) => (
                  <span key={mood} className="px-3 py-1 bg-gaming-primary/20 backdrop-blur-md text-gaming-primary rounded-full text-xs font-bold uppercase tracking-wider border border-gaming-primary/30">
                    {mood.replace('-', ' ')}
                  </span>
                ))}
             </div>
            <h1 className="text-5xl font-black text-white mb-4 tracking-tighter">{game.title}</h1>
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
              {game.developer && <span className="flex items-center gap-2">🏢 <b className="text-gray-200">{game.developer}</b></span>}
              {game.releaseYear && <span className="flex items-center gap-2">📅 <b className="text-gray-200">{game.releaseYear}</b></span>}
              <span className="flex items-center gap-2">⏱️ <b className="text-gray-200">{game.hoursPlayed || 0}h Played</b></span>
            </div>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-gaming-primary rounded-full" />
                About this game
              </h3>
              <p className="text-gray-400 text-lg leading-relaxed italic">
                {game.description || "No description available for this title."}
              </p>
            </div>

            {/* Personal Notes Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white mb-4">Personal Notes</h3>
              {isEditing ? (
                <div className="space-y-3">
                  <textarea
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    className="w-full h-40 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-gaming-primary outline-none resize-none"
                    placeholder="What did you think of the ending? How's the difficulty?"
                  />
                  <div className="flex gap-3 mt-4">
                    <button onClick={handleSave} className="flex-1 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200">
                      Save Changes
                    </button>
                    <button onClick={handleCancel} className="flex-1 py-3 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-white/5 rounded-2xl border border-white/5 text-gray-300 min-h-[100px]">
                  {game.notes || "Click edit to add your personal journey with this game..."}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-6">
              <button
                onClick={handleLaunch}
                className="w-full py-4 bg-gaming-primary text-white font-black rounded-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-3 shadow-lg shadow-gaming-primary/20"
              >
                <span>▶</span> Launch Game
              </button>

              <div className="pt-4 border-t border-white/10">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block">Current Status</label>
                <select
                  value={editedStatus}
                  onChange={(e) => handleStatusChange(e.target.value as PlayStatus)}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-gaming-primary"
                >
                  <option value="backlog">Backlog</option>
                  <option value="playing">Playing</option>
                  <option value="completed">Completed</option>
                  <option value="abandoned">Abandoned</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block">Your Rating</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range" min="0" max="5" step="0.5"
                    value={editedRating}
                    onChange={(e) => setEditedRating(parseFloat(e.target.value))}
                    disabled={!isEditing}
                    className="flex-1 accent-gaming-primary"
                  />
                  <span className="text-2xl font-black text-white">{editedRating} <span className="text-gaming-primary">★</span></span>
                </div>
              </div>
            </div>

            {isEditing ? (
              <div className="flex flex-col gap-3">
                <button onClick={handleSave} className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200">
                  Save Changes
                </button>
                <button onClick={handleCancel} className="w-full py-3 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10">
                  Cancel
                </button>
              </div>
            ) : (
              <button onClick={() => setIsEditing(true)} className="w-full py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 border border-white/10">
                Edit Details
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}