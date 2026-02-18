// YouTube API service for trailer detection
// Note: This is a simplified version. In production, you'd want to use YouTube Data API v3

export interface YouTubeSearchResult {
  videoId: string
  title: string
  channel: string
  thumbnail: string
  url: string
}

export class YouTubeService {
  private static readonly API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY
  private static readonly BASE_URL = 'https://www.googleapis.com/youtube/v3'

  // Search for game trailers
  static async searchGameTrailer(gameTitle: string): Promise<YouTubeSearchResult | null> {
    try {
      // For development, return a mock result to test the UI
      if (process.env.NODE_ENV === 'development') {
        console.log('🎬 Using mock YouTube trailer for development')
        return {
          videoId: 'jNQXAC9IVRw', // Use a real, safe video (Me at the zoo)
          title: `${gameTitle} Official Trailer`,
          channel: 'Game Developer',
          thumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/hqdefault.jpg',
          url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw'
        }
      }

      // Search queries to try in order
      const searchQueries = [
        `${gameTitle} official trailer`,
        `${gameTitle} gameplay trailer`,
        `${gameTitle} trailer`,
        `${gameTitle} game`
      ]

      for (const query of searchQueries) {
        const result = await this.searchVideos(query, 1)
        if (result.length > 0) {
          return result[0]
        }
      }

      return null
    } catch (error) {
      console.warn('YouTube search failed:', error)
      return null
    }
  }

  // Search videos (simplified version)
  private static async searchVideos(query: string, maxResults: number = 5): Promise<YouTubeSearchResult[]> {
    // In a real implementation, you'd use YouTube Data API v3
    // For now, we'll simulate the search with a fallback
    
    // This is a mock implementation - in production you'd make actual API calls
    return this.mockSearch(query, maxResults)
  }

  // Mock search for development/testing
  private static mockSearch(query: string, maxResults: number): Promise<YouTubeSearchResult[]> {
    // Simulate API delay
    return new Promise<YouTubeSearchResult[]>((resolve) => {
      setTimeout(() => {
        // Mock some common game trailers
        const mockTrailers: YouTubeSearchResult[] = [
          {
            videoId: 'dQw4w9WgXcQ',
            title: 'Official Game Trailer',
            channel: 'Game Developer',
            thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
          }
        ]
        
        resolve(mockTrailers.slice(0, maxResults))
      }, 500)
    })
  }

  // Extract video ID from YouTube URL
  static extractVideoId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  // Get thumbnail URL for video
  static getThumbnailUrl(videoId: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'default'): string {
    const qualityMap = {
      default: 'default',
      medium: 'mqdefault',
      high: 'hqdefault',
      maxres: 'maxresdefault'
    }
    
    return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`
  }

  // Validate YouTube URL
  static isValidYouTubeUrl(url: string): boolean {
    return this.extractVideoId(url) !== null
  }
}

// Helper function for automatic trailer detection
export async function detectGameTrailer(game: {
  title: string
  steamData?: any
  trailerUrl?: string
}): Promise<string | null> {
  // 1. Check if trailer already exists
  if (game.trailerUrl && YouTubeService.isValidYouTubeUrl(game.trailerUrl)) {
    return game.trailerUrl
  }

  // 2. Check Steam data for videos
  if (game.steamData?.videos?.length > 0) {
    const steamVideo = game.steamData.videos.find((video: any) => 
      video.name?.toLowerCase().includes('trailer') || 
      video.name?.toLowerCase().includes('gameplay')
    )
    
    if (steamVideo?.url) {
      const videoId = YouTubeService.extractVideoId(steamVideo.url)
      if (videoId) {
        return `https://www.youtube.com/watch?v=${videoId}`
      }
    }
  }

  // 3. Search YouTube for trailers
  try {
    const result = await YouTubeService.searchGameTrailer(game.title)
    return result?.url || null
  } catch (error) {
    console.warn('Failed to detect trailer:', error)
    return null
  }
}
