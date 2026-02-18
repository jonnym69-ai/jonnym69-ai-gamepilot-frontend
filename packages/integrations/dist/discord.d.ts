export interface DiscordGuild {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    memberCount?: number;
    presenceCount?: number;
    ownerId?: string;
    features: string[];
    channels: DiscordChannel[];
    createdAt: Date;
}
export interface DiscordChannel {
    id: string;
    name: string;
    type: 'text' | 'voice' | 'category';
    topic?: string;
    position: number;
    parentId?: string;
    nsfw: boolean;
    permissionOverwrites?: any[];
}
export interface DiscordUser {
    id: string;
    username: string;
    discriminator: string;
    avatar?: string;
    publicFlags?: number;
    bot?: boolean;
}
export interface DiscordActivity {
    type: number;
    name: string;
    details?: string;
    state?: string;
    applicationId?: string;
    sessionId?: string;
    assets?: {
        largeImage?: string;
        largeText?: string;
        smallImage?: string;
        smallText?: string;
    };
    timestamps?: {
        start?: number;
        end?: number;
    };
    party?: {
        id?: string;
        size?: [number, number];
    };
    secrets?: {
        join?: string;
        spectate?: string;
        match?: string;
    };
}
export declare class DiscordIntegration {
    private baseUrl;
    private cdnUrl;
    private botToken?;
    private userToken?;
    constructor(botToken?: string, userToken?: string);
    /**
     * Get public guild information
     * No authentication required for basic guild info
     */
    getPublicGuildInfo(guildId: string): Promise<DiscordGuild | null>;
    /**
     * Get channels for a guild
     * Requires bot token for full channel list
     */
    getGuildChannels(guildId: string): Promise<DiscordChannel[]>;
    /**
     * Get guilds for a user
     * Requires user authentication
     */
    getGuildsForUser(token?: string): Promise<DiscordGuild[]>;
    /**
     * Get user information
     * Requires authentication
     */
    getUserInfo(token?: string): Promise<DiscordUser | null>;
    /**
     * Get user's current activity (Rich Presence)
     * This would require additional permissions and OAuth2 scope
     */
    getUserActivity(token?: string): Promise<DiscordActivity | null>;
    /**
     * Transform widget response to guild format
     */
    private transformWidgetResponse;
    /**
     * Transform guild API response
     */
    private transformGuildResponse;
    /**
     * Transform channel API response
     */
    private transformChannelResponse;
    /**
     * Transform user API response
     */
    private transformUserResponse;
    /**
     * Transform activity API response
     */
    private transformActivityResponse;
    /**
     * Extract date from Discord snowflake ID
     */
    private extractSnowflakeDate;
    /**
     * Get mock guild data for testing
     */
    getMockGuilds(): DiscordGuild[];
    /**
     * Get mock channels for testing
     */
    getMockChannels(): DiscordChannel[];
    /**
     * Check if integration is available
     */
    isIntegrationAvailable(): {
        botAvailable: boolean;
        userAvailable: boolean;
        publicAvailable: boolean;
    };
    /**
     * Get integration info
     */
    getIntegrationInfo(): {
        version: string;
        features: {
            publicGuildInfo: boolean;
            userGuilds: boolean;
            guildChannels: boolean;
            userInfo: boolean;
            richPresence: boolean;
        };
        rateLimits: {
            requestsPerSecond: number;
            requestsPerMinute: number;
        };
    };
}
