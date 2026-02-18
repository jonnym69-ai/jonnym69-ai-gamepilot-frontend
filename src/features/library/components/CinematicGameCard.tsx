import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { PlayStatus } from '@gamepilot/types'
import type { Game } from '@gamepilot/types'
import { getHighQualityGameImage } from "../../../utils/gameImageUtils";
import { useLibraryStore } from '../../../stores/useLibraryStore'
import { LazyImage } from '../../../components/LazyImage'
import { useDragAndDrop, useDragStyles } from '../../../hooks/useDragAndDrop'
import { emulatorService } from '../../../services/emulatorService'

interface CinematicGameCardProps {
  game: Game
  isSelected?: boolean
  isSelectable?: boolean
  isBulkSelectMode?: boolean
  onSelect?: (game: Game, selected: boolean) => void
  onLaunch?: (game: Game) => void
  capsuleImage?: string
  currentSession?: { gameId: string; startedAt: number } | null
  onEdit?: (game: Game) => void
  onDelete?: (game: Game) => void
  index?: number
  onReorder?: (fromIndex: number, toIndex: number) => void
  isDraggable?: boolean
  isLaunching?: boolean
}

export const CinematicGameCard: React.FC<CinematicGameCardProps> = ({ 
  game, 
  isSelected = false, 
  isSelectable = false, 
  onSelect, 
  capsuleImage, 
  currentSession, 
  onEdit, 
  onDelete,
  onLaunch,
  index = 0,
  onReorder,
  isDraggable = false,
  isLaunching = false
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const navigate = useNavigate()
  const { actions } = useLibraryStore()

  // Drag and drop functionality
  const {
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    isDraggedOver,
    isDragging
  } = useDragAndDrop({
    items: [game],
    onReorder: onReorder || (() => {}),
    disabled: !isDraggable || !onReorder
  })

  const currentIndex = index || 0
  const isDraggingResult = isDragging(currentIndex) ? true : false
  const dragStyles = useDragStyles(isDraggedOver(currentIndex), isDraggingResult)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleCardClick = () => {
    navigate(`/library/game/${game.id}`)
  }

  const hasSteamAppId = game.appId && game.appId > 0
  const isInSession = currentSession?.gameId === game.id

  const getStatusColor = (status?: PlayStatus) => {
    switch (status) {
      case 'playing': return 'from-green-500 to-emerald-600'
      case 'completed': return 'from-blue-500 to-indigo-600'
      case 'backlog': return 'from-yellow-500 to-orange-600'
      case 'unplayed': return 'from-gray-500 to-gray-600'
      case 'paused': return 'from-orange-500 to-red-600'
      case 'abandoned': return 'from-red-500 to-gray-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getStatusBadgeStyles = (status?: PlayStatus) => {
    switch (status) {
      case 'playing':
        return 'bg-gradient-to-r from-green-500/90 to-emerald-600/90 border-green-400/50 shadow-green-500/30'
      case 'completed':
        return 'bg-gradient-to-r from-blue-500/90 to-indigo-600/90 border-blue-400/50 shadow-blue-500/30'
      case 'backlog':
        return 'bg-gradient-to-r from-yellow-500/90 to-orange-600/90 border-yellow-400/50 shadow-yellow-500/30'
      case 'unplayed':
        return 'bg-gradient-to-r from-gray-500/90 to-gray-600/90 border-gray-400/50 shadow-gray-500/30'
      case 'paused':
        return 'bg-gradient-to-r from-orange-500/90 to-red-600/90 border-orange-400/50 shadow-orange-500/30'
      case 'abandoned':
        return 'bg-gradient-to-r from-red-500/90 to-gray-600/90 border-red-400/50 shadow-red-500/30'
      default:
        return 'bg-gradient-to-r from-gray-500/90 to-gray-600/90 border-gray-400/50 shadow-gray-500/30'
    }
  }

  const getStatusIcon = (status?: PlayStatus) => {
    switch (status) {
      case 'playing':
        return '🎮'
      case 'completed':
        return '✅'
      case 'backlog':
        return '📚'
      case 'unplayed':
        return '🆕'
      case 'paused':
        return '⏸️'
      case 'abandoned':
        return '❌'
      default:
        return '🎯'
    }
  }

  const handleDetailsClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    navigate(`/library/game/${game.id}`)
  }

  const handleLaunchClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    
    // Use the custom onLaunch handler if provided, otherwise fall back to store action
    if (onLaunch) {
      onLaunch(game)
    } else {
      // Use the store's launchGame action with Steam App ID
      if (game.appId) {
        actions.launchGame(game.appId.toString())
      } else {
        console.warn('No appId found for game:', game.title)
      }
    }
  }

  const handleEndSession = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    actions.endCurrentSession()
  }

  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div
      className={`
        relative group cursor-pointer transition-all duration-500 transform hover:scale-105
        ${isSelected ? 'ring-2 ring-gaming-primary ring-offset-2 ring-offset-gaming-dark' : ''}
        ${isMounted ? 'animate-fade-in' : 'opacity-0'}
        hover:shadow-2xl hover:shadow-gaming-primary/40
        ${isDraggable ? 'cursor-grab' : 'cursor-pointer'}
        h-[400px] // Increased height for better proportions
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      draggable={isDraggable}
      onDragStart={(e) => handleDragStart(e, currentIndex)}
      onDragEnd={handleDragEnd}
      onDragOver={(e) => handleDragOver(e, currentIndex)}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, currentIndex)}
      // eslint-disable-next-line react/style-prop-object
      style={dragStyles}
    >
      <div className="glass-morphism rounded-2xl overflow-hidden border border-gray-700/30 transition-all duration-500 group-hover:border-gaming-primary/50 group-hover:shadow-2xl group-hover:shadow-gaming-accent/30 h-full flex flex-col">
        {/* Selection Checkbox */}
        {isSelectable && (
          <div className="absolute top-3 left-3 z-20">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation()
                onSelect?.(game, e.target.checked)
              }}
              className="w-4 h-4 rounded border-gray-300 text-gaming-primary focus:ring-gaming-primary"
              aria-label={`Select ${game.title}`}
              title={`Select ${game.title}`}
            />
          </div>
        )}

        {/* Enhanced Game Cover */}
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-gradient-to-br from-gaming-primary/20 to-gaming-secondary/20 flex-shrink-0 group">
          {getHighQualityGameImage(game) ? (
            <>
              <LazyImage
                src={getHighQualityGameImage(game)}
                alt={game.title}
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
              />
              {/* Enhanced overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800 group-hover:from-gray-600 group-hover:to-gray-700 transition-all duration-500">
              <span className="text-6xl text-gray-500 group-hover:text-gray-400 transition-colors duration-300">🎮</span>
            </div>
          )}
          
          {/* Enhanced Sale Badge */}
          {(game as any).price && (game as any).price.discount_percent > 0 && (
            <div className="absolute top-3 left-3 px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 rounded-lg text-white text-sm font-bold z-10 shadow-lg shadow-red-500/30 animate-pulse">
              -{(game as any).price.discount_percent}%
            </div>
          )}

          {/* Enhanced Status Badge */}
          {game.playStatus && (
            <div className="absolute top-3 right-3 z-10">
              <div className={`px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg backdrop-blur-sm border ${getStatusBadgeStyles(game.playStatus)}`}>
                {getStatusIcon(game.playStatus)} {game.playStatus.toUpperCase()}
              </div>
            </div>
          )}

          {/* Enhanced Progress Ring */}
          {game.completionPercentage !== undefined && game.completionPercentage > 0 && (
            <div className="absolute bottom-3 right-3 z-10">
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="url(#progressGradient)"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - game.completionPercentage / 100)}`}
                    className="transition-all duration-500"
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{Math.round(game.completionPercentage)}%</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Enhanced Game Info Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 flex flex-col justify-end">
            {/* Enhanced Title */}
            <h3 className="text-white font-bold text-lg mb-3 line-clamp-2 transition-all duration-300 group-hover:text-gaming-primary leading-tight">
              {game.title}
            </h3>

            {/* Enhanced Metadata Row */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-700/40">
              {/* Platform and Genre with better styling */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {game.platforms && game.platforms.length > 0 && (
                  <span className="px-2.5 py-1 bg-gradient-to-r from-gray-800/90 to-gray-700/90 backdrop-blur-sm rounded-lg text-xs text-gray-200 font-semibold border border-gray-600/50 truncate shadow-sm">
                    🎯 {game.platforms[0].name}
                  </span>
                )}
                {game.genres && game.genres.length > 0 && (
                  <span className="px-2.5 py-1 bg-gradient-to-r from-blue-600/80 to-blue-700/80 backdrop-blur-sm rounded-lg text-xs text-blue-200 font-semibold border border-blue-500/40 truncate shadow-sm">
                    🎭 {typeof game.genres[0] === 'string' ? game.genres[0] : game.genres[0].name || 'Genre'}
                  </span>
                )}
              </div>
              {/* Enhanced Status and Playtime */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {game.playStatus && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-600/40 shadow-sm">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getStatusColor(game.playStatus)} animate-pulse`} />
                    <span className="text-xs text-white font-semibold capitalize">
                      {game.playStatus}
                    </span>
                  </div>
                )}
                {game.hoursPlayed !== undefined && game.hoursPlayed > 0 && (
                  <span className="text-xs text-gray-300 font-bold bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-gray-600/40 shadow-sm">
                    ⏱️ {Math.floor(game.hoursPlayed)}h
                  </span>
                )}
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="mt-auto pt-4 border-t border-gray-700/30">
              <div className="flex gap-2.5">
                {/* Enhanced Details Button */}
                <button
                  onClick={handleDetailsClick}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-gaming-primary/90 to-gaming-secondary/90 text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-gaming-primary/40 border border-gaming-primary/30 flex items-center justify-center gap-2 backdrop-blur-sm"
                >
                  <span className="text-base">📋</span>
                  <span>Details</span>
                </button>
                
                {/* Enhanced Play Button */}
                {hasSteamAppId && (
                  <button
                    onClick={isInSession ? handleEndSession : handleLaunchClick}
                    disabled={isLaunching}
                    className={`px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 border backdrop-blur-sm ${
                      isInSession 
                        ? 'bg-gradient-to-r from-red-600/90 to-red-700/90 text-white hover:opacity-90 hover:shadow-lg hover:shadow-red-600/40 border-red-500/30'
                        : isLaunching
                        ? 'bg-gradient-to-r from-gray-600/90 to-gray-700/90 text-gray-300 cursor-not-allowed border-gray-500/30'
                        : 'bg-gradient-to-r from-green-600/90 to-emerald-600/90 text-white hover:opacity-90 hover:shadow-lg hover:shadow-green-600/40 border-green-500/30'
                    }`}
                  >
                    <span className="text-base">{isInSession ? '⏹️' : isLaunching ? '⏳' : '▶️'}</span>
                    <span>{isInSession ? 'End' : isLaunching ? 'Launching...' : 'Play'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Glow Effect - Subtle Depth */}
      {isHovered && (
        <div className="absolute inset-0 rounded-lg bg-gaming-primary/5 blur-xl -z-10" />
      )}
    </div>
  )
}
