export interface YouTubeVideo {
  id: string
  title: string
  description: string
  thumbnail: string
  channelTitle: string
  publishedAt: string
  duration: string
  viewCount: string
  url: string
}

export interface YouTubeSearchResponse {
  videos: YouTubeVideo[]
  totalResults: number
  nextPageToken?: string
  prevPageToken?: string
}

/**
 * Search YouTube for videos related to a game title
 * Uses YouTube Data API v3 public search endpoint
 * Note: In production, this should use API keys and proper error handling
 */
export async function searchYouTubeVideos(
  gameTitle: string
): Promise<YouTubeSearchResponse> {
  try {
    // For demo purposes, we'll simulate the API response
    // In production, replace with actual API call:
    // const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(gameTitle)}&key=AIzaSyDummyKey`
    // const response = await fetch(searchUrl)
    // const data = await response.json()
    
    // Mock response for demonstration
    const mockVideos: YouTubeVideo[] = [
      {
        id: 'dQw4w9WgXcQ',
        title: `${gameTitle} - Official Gameplay Trailer`,
        description: `Check out the official gameplay and trailer for ${gameTitle}. Features stunning graphics and immersive gameplay.`,
        thumbnail: 'https://via.placeholder.com/320x180/ff0000/ffffff?text=Gameplay+Trailer',
        channelTitle: 'GameTrailers HD',
        publishedAt: '2024-01-15T10:00:00Z',
        duration: '3:45',
        viewCount: '1234567',
        url: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
      },
      {
        id: 'abc123def456',
        title: `${gameTitle} - Complete Walkthrough Part 1`,
        description: `Full walkthrough guide for ${gameTitle}. Chapter 1 complete with all collectibles.`,
        thumbnail: 'https://via.placeholder.com/320x180/0000ff/ffffff?text=Walkthrough+Part+1',
        channelTitle: 'GameGuides Pro',
        publishedAt: '2024-01-10T15:30:00Z',
        duration: '45:20',
        viewCount: '987654',
        url: `https://www.youtube.com/watch?v=abc123def456`
      },
      {
        id: 'xyz789uvw012',
        title: `${gameTitle} - Review & First Impressions`,
        description: `Honest review and first impressions of ${gameTitle}. Is it worth your time?`,
        thumbnail: 'https://via.placeholder.com/320x180/00ff00/ffffff?text=Game+Review',
        channelTitle: 'GameReviewer',
        publishedAt: '2024-01-08T20:15:00Z',
        duration: '12:15',
        viewCount: '2345678',
        url: `https://www.youtube.com/watch?v=xyz789uvw012`
      }
    ]

    return {
      videos: mockVideos,
      totalResults: mockVideos.length,
      nextPageToken: undefined,
      prevPageToken: undefined
    }

  } catch (error) {
    console.error('Error searching YouTube videos:', error)
    throw new Error(`Failed to search YouTube videos: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get video thumbnail URL in different sizes
 */
export function getThumbnailUrl(videoId: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'high'): string {
  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    maxres: 'maxresdefault'
  }
  
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`
}

/**
 * Format view count for display
 */
export function formatViewCount(viewCount: string): string {
  const count = parseInt(viewCount)
  
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M views`
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K views`
  } else {
    return `${count} views`
  }
}

/**
 * Format duration for display (ISO 8601 to readable format)
 */
export function formatDuration(duration: string): string {
  // For demo purposes, return as-is
  // In production, parse ISO 8601 duration format (PT4M13S)
  return duration
}

/**
 * Search for specific types of game content
 */
export async function searchGameContent(
  gameTitle: string,
  contentType: 'gameplay' | 'review' | 'trailer' | 'walkthrough' | 'all' = 'all'
): Promise<YouTubeSearchResponse> {
  try {
    // For demo purposes, we'll simulate the API response
    // In production, replace with actual API call using contentType to refine search
    const mockVideos: YouTubeVideo[] = [
      {
        id: 'dQw4w9WgXcQ',
        title: `${gameTitle} - Official ${contentType === 'all' ? 'Content' : contentType.charAt(0).toUpperCase() + contentType.slice(1)}`,
        description: `Check out the ${contentType} for ${gameTitle}. Features stunning graphics and immersive gameplay.`,
        thumbnail: 'https://via.placeholder.com/320x180/ff0000/ffffff?text=Game+Content',
        channelTitle: 'GamePilot Official',
        publishedAt: '2024-01-15T10:00:00Z',
        duration: 'PT3M45S',
        viewCount: '1000000',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      {
        id: 'abc123def456',
        title: `${gameTitle} - ${contentType === 'all' ? 'Review' : 'Gameplay'} Analysis`,
        description: `In-depth ${contentType} analysis of ${gameTitle}.`,
        thumbnail: 'https://via.placeholder.com/320x180/00ff00/ffffff?text=Review+Video',
        channelTitle: 'GamePilot Reviews',
        publishedAt: '2024-01-14T15:30:00Z',
        duration: 'PT12M30S',
        viewCount: '500000',
        url: 'https://www.youtube.com/watch?v=abc123def456'
      }
    ]

    return {
      videos: mockVideos,
      totalResults: mockVideos.length,
      nextPageToken: undefined,
      prevPageToken: undefined
    }

  } catch (error) {
    console.error('Error searching game content:', error)
    throw new Error(`Failed to search game content: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
