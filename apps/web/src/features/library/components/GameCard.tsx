import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { PlayStatus } from '@gamepilot/types'
import type { Game } from '@gamepilot/types'
import { MOODS } from '@gamepilot/static-data'
import { getHighQualityGameImage } from "../../../utils/gameImageUtils";
import { useLibraryStore } from '../../../stores/useLibraryStore'
import { LazyImage } from '../../../components/LazyImage'
import { OptimizedImage } from '../../../components/OptimizedImage'
import { deriveMoodFromGame } from '../../../utils/moodMapping'

interface GameCardProps {
  game: Game
  isSelected?: boolean
  isSelectable?: boolean
  onSelect?: (game: Game, selected: boolean) => void
  currentSession?: { gameId: string; startedAt: number } | null
  onLaunch?: (game: Game) => void
  onDelete?: (game: Game) => void
  onEdit?: (game: Game) => void
  capsuleImage?: string
  recommendationScore?: any // Add recommendation score prop
}

export function GameCard({ game, isSelected, isSelectable, onSelect, currentSession, onLaunch, onDelete, onEdit, recommendationScore }: GameCardProps) {
  const navigate = useNavigate()
  const { actions } = useLibraryStore()
  const [isHovered, setIsHovered] = useState(false)
  const [isInSession, setIsInSession] = useState(false)
  const [isLaunching, setIsLaunching] = useState(false)
  
  // Check if game is currently in a session
  useEffect(() => {
    setIsInSession(currentSession?.gameId === game.id)
  }, [currentSession, game.id])

  const handleDetailsClick = () => {
    navigate(`/library/game/${game.id}`)
  }

  const handleLaunchClick = async () => {
    if (isLaunching || !onLaunch) return
    
    setIsLaunching(true)
    try {
      await onLaunch(game)
    } finally {
      setIsLaunching(false)
    }
  }

  const handleEndSession = async () => {
    if (currentSession) {
      // End the current session
      await actions.endGameSession(currentSession.gameId)
    }
  }

  const getStatusColor = (status: PlayStatus) => {
    switch (status) {
      case 'playing': return 'from-green-500 to-emerald-500'
      case 'completed': return 'from-blue-500 to-indigo-500'
      case 'backlog': return 'from-gray-500 to-slate-500'
      case 'abandoned': return 'from-red-500 to-pink-500'
      default: return 'from-gray-500 to-slate-500'
    }
  }

  const getStatusIcon = (status: PlayStatus) => {
    switch (status) {
      case 'playing': return '🎮'
      case 'completed': return '✅'
      case 'backlog': return '📚'
      case 'abandoned': return '🚫'
      default: return '📋'
    }
  }

  const getStatusBadgeStyles = (status: PlayStatus) => {
    const baseStyles = 'px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-lg backdrop-blur-md border'
    switch (status) {
      case 'playing':
        return `${baseStyles} bg-green-500/40 border-green-400/30`
      case 'completed':
        return `${baseStyles} bg-blue-500/40 border-blue-400/30`
      case 'backlog':
        return `${baseStyles} bg-gray-500/40 border-gray-400/30 text-gray-200`
      case 'abandoned':
        return `${baseStyles} bg-red-500/40 border-red-400/30`
      default:
        return `${baseStyles} bg-gray-500/40 border-gray-400/30`
    }
  }

  const hasSteamAppId = game.appId && String(game.appId).trim() !== ''
  const imageUrl = getHighQualityGameImage(game)

  // Debug logging for troubleshooting
  console.log(`GameCard for ${game.title}: hasSteamAppId=${hasSteamAppId}, appId=${game.appId}, imageUrl=${imageUrl}`)

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className={`group relative bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer hover:z-50 hover:shadow-2xl hover:shadow-gaming-primary/20 ${
        isSelected 
          ? 'border-gaming-primary ring-2 ring-gaming-primary/50' 
          : 'border-white/5 hover:border-white/10'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Selection Checkbox */}
      {isSelectable && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 left-4 z-20"
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation()
              onSelect?.(game, e.target.checked)
            }}
            className="w-6 h-6 rounded-lg border-2 border-white/20 bg-black/40 text-gaming-primary focus:ring-gaming-primary focus:ring-offset-0 transition-all cursor-pointer"
            aria-label={`Select ${game.title}`}
          />
        </motion.div>
      )}
      
      {/* Game Cover Image Container */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-900 flex-shrink-0">
        {imageUrl ? (
          <>
            <OptimizedImage
              src={imageUrl}
              alt={game.title}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-gaming-dark via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white/5 group-hover:bg-white/10 transition-colors">
            <span className="text-6xl grayscale group-hover:grayscale-0 transition-all duration-500 opacity-20 group-hover:opacity-40">🎮</span>
          </div>
        )}
        
        {/* Status Badge */}
        {game.playStatus && game.playStatus !== 'backlog' && (
          <div className="absolute top-4 right-4 z-10">
            <div className={getStatusBadgeStyles(game.playStatus)}>
              {getStatusIcon(game.playStatus)} {game.playStatus}
            </div>
          </div>
        )}

        {/* Progress Ring */}
        {game.completionPercentage !== undefined && game.completionPercentage > 0 && (
          <div className="absolute bottom-4 right-4 z-10 scale-75 md:scale-100">
            <div className="relative w-12 h-12 bg-black/40 backdrop-blur-md rounded-full p-1 border border-white/10">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="3" fill="none" className="text-white/10" />
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={113}
                  strokeDashoffset={113 - (113 * game.completionPercentage) / 100}
                  className="text-gaming-primary transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white">
                {Math.round(game.completionPercentage)}%
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Game Info Overlay Content */}
      <div className="p-5 flex flex-col h-full bg-gradient-to-b from-transparent to-black/20">
        <div className="mb-4">
          <h3 className="text-white font-gaming font-bold text-lg line-clamp-1 group-hover:text-gaming-primary transition-colors leading-tight mb-1">
            {game.title}
          </h3>
          
          <div className="flex items-center gap-2">
            {game.platforms?.[0] && (
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                {typeof game.platforms[0] === 'string' ? game.platforms[0] : game.platforms[0].name}
              </span>
            )}
            {game.hoursPlayed !== undefined && game.hoursPlayed > 0 && (
              <span className="text-[10px] font-black text-gaming-accent">
                • {Math.floor(game.hoursPlayed)}H
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Metadata Section */}
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {/* Recommendation Reasoning - Show when available */}
          {recommendationScore && (
            <div className="w-full mt-2 p-2 bg-white/5 rounded-lg border border-white/5">
              <div className="text-xs font-bold text-gaming-primary mb-1">
                {recommendationScore.reasoning.primary}
              </div>
              <div className="space-y-1">
                {recommendationScore.reasoning.secondary.map((line: string, index: number) => (
                  <div key={index} className="text-[10px] text-gray-400">
                    • {line}
                  </div>
                ))}
              </div>
              <div className={`text-[9px] font-bold mt-2 ${
                recommendationScore.reasoning.confidence === 'high' ? 'text-green-400' :
                recommendationScore.reasoning.confidence === 'medium' ? 'text-yellow-400' :
                'text-gray-500'
              }`}>
                {recommendationScore.reasoning.confidence === 'high' && 'High confidence match'}
                {recommendationScore.reasoning.confidence === 'medium' && 'Good potential match'}
                {recommendationScore.reasoning.confidence === 'low' && 'Experimental suggestion'}
              </div>
            </div>
          )}
          
          {/* Mood Display - Prioritized */}
          {(game.moods && game.moods.length > 0 ? game.moods : [deriveMoodFromGame(game)]).slice(0, 1).map((moodId) => {
            const mood = MOODS.find(m => m.id === moodId)
            if (!mood) return null
            return (
              <span 
                key={moodId}
                className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] font-bold text-gray-300 flex items-center gap-1.5 transition-colors group-hover:border-white/10"
              >
                <span aria-hidden="true">{mood.emoji}</span>
                <span className="uppercase tracking-tighter">{mood.name}</span>
              </span>
            )
          })}

          {/* Primary Genre */}
          {game.genres?.[0] && (
            <span className="px-2.5 py-1 rounded-md bg-gaming-primary/10 border border-gaming-primary/20 text-[10px] font-bold text-gaming-primary uppercase tracking-tighter">
              {typeof game.genres[0] === 'string' ? game.genres[0] : game.genres[0].name}
            </span>
          )}
        </div>

        {/* Always-visible Action Bar for debugging */}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-gaming-dark to-transparent flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleDetailsClick(); }}
            className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-all border border-white/10 backdrop-blur-md"
          >
            Details
          </button>
          {hasSteamAppId ? (
            <button
              onClick={(e) => { e.stopPropagation(); isInSession ? handleEndSession() : handleLaunchClick(); }}
              disabled={isLaunching}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 border shadow-lg ${
                isInSession
                  ? 'bg-red-500/80 border-red-400/50 text-white'
                  : 'bg-gaming-primary border-gaming-primary/50 text-white'
              }`}
            >
              {isInSession ? '⏹ Stop' : isLaunching ? '⏳...' : '▶ Play'}
            </button>
          ) : (
            <div className="flex-1 py-2.5 bg-gray-600 text-gray-400 rounded-lg text-xs font-bold flex items-center justify-center border border-gray-500">
              No Steam App ID
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
