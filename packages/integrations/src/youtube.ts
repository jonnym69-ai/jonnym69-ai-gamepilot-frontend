// YouTube Data API v3 integration for GamePilot
// Uses free tier with public data only

export interface YouTubeVideo {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  publishedAt: Date
  duration: string // ISO 8601 duration
  viewCount: number
  likeCount: number
  channelTitle: string
  channelId: string
  tags: string[]
  categoryId: string
}

export interface YouTubeChannel {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  subscriberCount: number
  videoCount: number
  viewCount: number
  publishedAt: Date
}

export interface YouTubeSearchResponse {
  videos: YouTubeVideo[]
  nextPageToken?: string
  prevPageToken?: string
  totalResults: number
  resultsPerPage: number
}

export interface YouTubePlaylistResponse {
  videos: YouTubeVideo[]
  nextPageToken?: string
  totalResults: number
}

export class YouTubeIntegration {
  private apiKey: string
  private baseUrl = 'https://www.googleapis.com/youtube/v3'
  private maxResultsPerPage = 50

  constructor(apiKey?: string) {
    // Use environment variable or provided key
    this.apiKey = apiKey || import.meta.env?.VITE_YOUTUBE_API_KEY || ''
    
    if (!this.apiKey) {
      console.warn('YouTube API key not provided. Some features will be limited.')
    }
  }

  /**
   * Get trending gaming videos
   * Uses free tier - limited to public data
   */
  async getTrendingGamingVideos(pageToken?: string): Promise<YouTubeSearchResponse> {
    if (!this.apiKey) {
      return this.getMockResponse('trending')
    }

    try {
      const params = new URLSearchParams({
        part: 'snippet,statistics,contentDetails',
        chart: 'mostPopular',
        videoCategoryId: '20', // Gaming category
        maxResults: this.maxResultsPerPage.toString(),
        key: this.apiKey,
        ...(pageToken && { pageToken })
      })

      const response = await fetch(`${this.baseUrl}/videos?${params}`)
      const data = await response.json()

      if (data.error) {
        throw new Error(`YouTube API Error: ${data.error.message}`)
      }

      return this.transformVideoResponse(data)
    } catch (error) {
      console.error('Error fetching trending gaming videos:', error)
      return this.getMockResponse('trending')
    }
  }

  /**
   * Get videos from a specific channel
   * Free tier - public channel data only
   */
  async getCreatorVideos(channelId: string, pageToken?: string): Promise<YouTubeSearchResponse> {
    if (!this.apiKey) {
      return this.getMockResponse('creator')
    }

    try {
      // First get channel details to get uploads playlist
      const channelParams = new URLSearchParams({
        part: 'contentDetails',
        id: channelId,
        key: this.apiKey
      })

      const channelResponse = await fetch(`${this.baseUrl}/channels?${channelParams}`)
      const channelData = await channelResponse.json()

      if (channelData.error) {
        throw new Error(`YouTube API Error: ${channelData.error.message}`)
      }

      const uploadsPlaylistId = channelData.items[0]?.contentDetails?.relatedPlaylists?.uploads
      if (!uploadsPlaylistId) {
        throw new Error('Channel not found or has no public uploads')
      }

      // Get videos from uploads playlist
      return this.getPlaylistVideos(uploadsPlaylistId, pageToken)
    } catch (error) {
      console.error('Error fetching creator videos:', error)
      return this.getMockResponse('creator')
    }
  }

  /**
   * Search for gaming content
   * Free tier - public search only
   */
  async searchGamingContent(
    query: string, 
    pageToken?: string,
    maxResults: number = 25
  ): Promise<YouTubeSearchResponse> {
    if (!this.apiKey) {
      return this.getMockResponse('search')
    }

    try {
      const params = new URLSearchParams({
        part: 'snippet,statistics',
        q: `${query} gaming`,
        type: 'video',
        maxResults: Math.min(maxResults, this.maxResultsPerPage).toString(),
        key: this.apiKey,
        relevanceLanguage: 'en',
        safeSearch: 'moderate',
        ...(pageToken && { pageToken })
      })

      const response = await fetch(`${this.baseUrl}/search?${params}`)
      const data = await response.json()

      if (data.error) {
        throw new Error(`YouTube API Error: ${data.error.message}`)
      }

      return this.transformSearchResponse(data)
    } catch (error) {
      console.error('Error searching gaming content:', error)
      return this.getMockResponse('search')
    }
  }

  /**
   * Get channel information
   */
  async getChannelInfo(channelId: string): Promise<YouTubeChannel | null> {
    if (!this.apiKey) {
      return this.getMockChannel()
    }

    try {
      const params = new URLSearchParams({
        part: 'snippet,statistics',
        id: channelId,
        key: this.apiKey
      })

      const response = await fetch(`${this.baseUrl}/channels?${params}`)
      const data = await response.json()

      if (data.error) {
        throw new Error(`YouTube API Error: ${data.error.message}`)
      }

      if (!data.items || data.items.length === 0) {
        return null
      }

      return this.transformChannelResponse(data.items[0])
    } catch (error) {
      console.error('Error fetching channel info:', error)
      return this.getMockChannel()
    }
  }

  /**
   * Get videos from a playlist
   */
  private async getPlaylistVideos(
    playlistId: string, 
    pageToken?: string
  ): Promise<YouTubeSearchResponse> {
    try {
      const params = new URLSearchParams({
        part: 'snippet,statistics,contentDetails',
        playlistId,
        maxResults: this.maxResultsPerPage.toString(),
        key: this.apiKey,
        ...(pageToken && { pageToken })
      })

      const response = await fetch(`${this.baseUrl}/playlistItems?${params}`)
      const data = await response.json()

      if (data.error) {
        throw new Error(`YouTube API Error: ${data.error.message}`)
      }

      return this.transformPlaylistResponse(data)
    } catch (error) {
      console.error('Error fetching playlist videos:', error)
      return this.getMockResponse('playlist')
    }
  }

  /**
   * Transform YouTube API video response to our format
   */
  private transformVideoResponse(data: any): YouTubeSearchResponse {
    const videos = data.items.map((item: any) => {
      const snippet = item.snippet
      const statistics = item.statistics || {}
      const contentDetails = item.contentDetails || {}

      return {
        id: item.id,
        title: snippet.title,
        description: snippet.description,
        thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
        publishedAt: new Date(snippet.publishedAt),
        duration: contentDetails.duration,
        viewCount: parseInt(statistics.viewCount || '0'),
        likeCount: parseInt(statistics.likeCount || '0'),
        channelTitle: snippet.channelTitle,
        channelId: snippet.channelId,
        tags: snippet.tags || [],
        categoryId: snippet.categoryId
      }
    })

    return {
      videos,
      totalResults: data.pageInfo?.totalResults || videos.length,
      resultsPerPage: data.pageInfo?.resultsPerPage || videos.length,
      nextPageToken: data.nextPageToken,
      prevPageToken: data.prevPageToken
    }
  }

  /**
   * Transform YouTube API search response
   */
  private transformSearchResponse(data: any): YouTubeSearchResponse {
    const videos = data.items.map((item: any) => {
      const snippet = item.snippet
      const statistics = item.statistics || {}

      return {
        id: item.id.videoId,
        title: snippet.title,
        description: snippet.description,
        thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
        publishedAt: new Date(snippet.publishedAt),
        duration: '', // Search doesn't include duration
        viewCount: parseInt(statistics.viewCount || '0'),
        likeCount: parseInt(statistics.likeCount || '0'),
        channelTitle: snippet.channelTitle,
        channelId: snippet.channelId,
        tags: snippet.tags || [],
        categoryId: snippet.categoryId
      }
    })

    return {
      videos,
      totalResults: data.pageInfo?.totalResults || videos.length,
      resultsPerPage: data.pageInfo?.resultsPerPage || videos.length,
      nextPageToken: data.nextPageToken,
      prevPageToken: data.prevPageToken
    }
  }

  /**
   * Transform YouTube API playlist response
   */
  private transformPlaylistResponse(data: any): YouTubeSearchResponse {
    const videos = data.items.map((item: any) => {
      const snippet = item.snippet
      const statistics = item.statistics || {}

      return {
        id: item.contentDetails.videoId,
        title: snippet.title,
        description: snippet.description,
        thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
        publishedAt: new Date(snippet.publishedAt),
        duration: '', // Playlist items don't include duration
        viewCount: parseInt(statistics.viewCount || '0'),
        likeCount: parseInt(statistics.likeCount || '0'),
        channelTitle: snippet.channelTitle,
        channelId: snippet.channelId,
        tags: snippet.tags || [],
        categoryId: snippet.categoryId
      }
    })

    return {
      videos,
      totalResults: data.pageInfo?.totalResults || videos.length,
      resultsPerPage: data.pageInfo?.resultsPerPage || videos.length,
      nextPageToken: data.nextPageToken
    }
  }

  /**
   * Transform YouTube API channel response
   */
  private transformChannelResponse(item: any): YouTubeChannel {
    const snippet = item.snippet
    const statistics = item.statistics

    return {
      id: item.id,
      title: snippet.title,
      description: snippet.description,
      thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
      subscriberCount: parseInt(statistics.subscriberCount || '0'),
      videoCount: parseInt(statistics.videoCount || '0'),
      viewCount: parseInt(statistics.viewCount || '0'),
      publishedAt: new Date(snippet.publishedAt)
    }
  }

  /**
   * Get mock response when API is not available
   */
  private getMockResponse(type: 'trending' | 'creator' | 'search' | 'playlist'): YouTubeSearchResponse {
    const mockVideos: YouTubeVideo[] = [
      {
        id: 'mock1',
        title: 'Best Gaming Moments 2024',
        description: 'Amazing gaming highlights and funny moments from the past year',
        thumbnailUrl: '/images/mock/youtube-thumbnail-1.jpg',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        duration: 'PT10M32S',
        viewCount: 1250000,
        likeCount: 85000,
        channelTitle: 'GamePilot Highlights',
        channelId: 'UCgamepilot',
        tags: ['gaming', 'highlights', 'funny', '2024'],
        categoryId: '20'
      },
      {
        id: 'mock2',
        title: 'Epic Gaming Comeback',
        description: 'Incredible comeback in the final moments of the championship',
        thumbnailUrl: '/images/mock/youtube-thumbnail-2.jpg',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
        duration: 'PT5M45S',
        viewCount: 890000,
        likeCount: 62000,
        channelTitle: 'Pro Gaming Channel',
        channelId: 'UCprogaming',
        tags: ['gaming', 'comeback', 'esports', 'competitive'],
        categoryId: '20'
      }
    ]

    return {
      videos: mockVideos,
      totalResults: mockVideos.length,
      resultsPerPage: mockVideos.length
    }
  }

  /**
   * Get mock channel data
   */
  private getMockChannel(): YouTubeChannel {
    return {
      id: 'UCmockchannel',
      title: 'GamePilot Official',
      description: 'Your source for gaming content and community highlights',
      thumbnailUrl: '/images/mock/channel-avatar.jpg',
      subscriberCount: 150000,
      videoCount: 450,
      viewCount: 25000000,
      publishedAt: new Date('2020-01-01')
    }
  }

  /**
   * Check if API is available
   */
  isApiAvailable(): boolean {
    return !!this.apiKey
  }

  /**
   * Get API usage info (for rate limiting)
   */
  getApiInfo() {
    return {
      available: this.isApiAvailable(),
      maxResultsPerPage: this.maxResultsPerPage,
      rateLimits: {
        requestsPerDay: 10000, // Free tier limit
        requestsPer100Seconds: 100
      }
    }
  }
}
