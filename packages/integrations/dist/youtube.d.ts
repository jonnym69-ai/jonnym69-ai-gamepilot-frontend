export interface YouTubeVideo {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    publishedAt: Date;
    duration: string;
    viewCount: number;
    likeCount: number;
    channelTitle: string;
    channelId: string;
    tags: string[];
    categoryId: string;
}
export interface YouTubeChannel {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    subscriberCount: number;
    videoCount: number;
    viewCount: number;
    publishedAt: Date;
}
export interface YouTubeSearchResponse {
    videos: YouTubeVideo[];
    nextPageToken?: string;
    prevPageToken?: string;
    totalResults: number;
    resultsPerPage: number;
}
export interface YouTubePlaylistResponse {
    videos: YouTubeVideo[];
    nextPageToken?: string;
    totalResults: number;
}
export declare class YouTubeIntegration {
    private apiKey;
    private baseUrl;
    private maxResultsPerPage;
    constructor(apiKey?: string);
    /**
     * Get trending gaming videos
     * Uses free tier - limited to public data
     */
    getTrendingGamingVideos(pageToken?: string): Promise<YouTubeSearchResponse>;
    /**
     * Get videos from a specific channel
     * Free tier - public channel data only
     */
    getCreatorVideos(channelId: string, pageToken?: string): Promise<YouTubeSearchResponse>;
    /**
     * Search for gaming content
     * Free tier - public search only
     */
    searchGamingContent(query: string, pageToken?: string, maxResults?: number): Promise<YouTubeSearchResponse>;
    /**
     * Get channel information
     */
    getChannelInfo(channelId: string): Promise<YouTubeChannel | null>;
    /**
     * Get videos from a playlist
     */
    private getPlaylistVideos;
    /**
     * Transform YouTube API video response to our format
     */
    private transformVideoResponse;
    /**
     * Transform YouTube API search response
     */
    private transformSearchResponse;
    /**
     * Transform YouTube API playlist response
     */
    private transformPlaylistResponse;
    /**
     * Transform YouTube API channel response
     */
    private transformChannelResponse;
    /**
     * Get mock response when API is not available
     */
    private getMockResponse;
    /**
     * Get mock channel data
     */
    private getMockChannel;
    /**
     * Check if API is available
     */
    isApiAvailable(): boolean;
    /**
     * Get API usage info (for rate limiting)
     */
    getApiInfo(): {
        available: boolean;
        maxResultsPerPage: number;
        rateLimits: {
            requestsPerDay: number;
            requestsPer100Seconds: number;
        };
    };
}
