import React, { lazy, Suspense } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLibraryStore } from '../../../stores/useLibraryStore'

const GameDetailsLayout = lazy(() => import('../components/GameDetailsLayout').then(module => ({ default: module.GameDetailsLayout })))

export const GameDetailsPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const { games } = useLibraryStore()

  
  // Find game by id
  const game = games.find(g => g.id === gameId)

  // Handle game not found
  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gaming-dark via-gray-900 to-gaming-darker flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎮</div>
          <h1 className="text-2xl font-bold text-white mb-2">Game not found</h1>
          <p className="text-gray-400 mb-6">The game you're looking for doesn't exist in your library.</p>
          <button
            onClick={() => navigate('/library')}
            className="px-6 py-3 bg-gradient-to-r from-gaming-primary to-gaming-secondary text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Back to Library
          </button>
        </div>
      </div>
    )
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gaming-dark via-gray-900 to-gaming-darker flex items-center justify-center">
        <div className="text-white text-xl">Loading game details...</div>
      </div>
    }>
      <GameDetailsLayout game={game} />
    </Suspense>
  )
}
