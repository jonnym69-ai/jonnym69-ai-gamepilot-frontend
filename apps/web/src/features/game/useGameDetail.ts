import { useState, useEffect } from 'react'
import { useLibraryStore } from '../../stores/useLibraryStore'
import type { Game } from '@gamepilot/types'

export interface GameDetailData {
  id: string
  title: string
  platforms: string[]
  status: string
  playtime: number
  coverImage?: string
  tags?: string[]
}

export const useGameDetail = (gameId: string) => {
  const { games } = useLibraryStore()
  const [gameData, setGameData] = useState<GameDetailData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (games.length > 0 && gameId) {
      setIsLoading(true)
      const foundGame = games.find((g: Game) => g.id === gameId)
      
      if (foundGame) {
        // Convert Game to GameDetailData
        const gameDetailData: GameDetailData = {
          id: foundGame.id,
          title: foundGame.title,
          platforms: foundGame.platforms?.map(p => String(p)) || [],
          status: foundGame.playStatus || 'backlog',
          playtime: foundGame.hoursPlayed || 0,
          coverImage: foundGame.coverImage || '',
          tags: foundGame.tags
        }
        setGameData(gameDetailData)
      } else {
        setGameData(null)
      }
      
      setIsLoading(false)
    }
  }, [games, gameId])

  return {
    game: gameData,
    loading: isLoading,
    error: !gameData && !isLoading ? 'Game not found' : null
  }
}
