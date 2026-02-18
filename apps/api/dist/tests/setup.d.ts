import { IntegrationStatus } from '@gamepilot/shared/models/integration';
export declare const mockValidToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImlhdCI6MTY5NDg4NjQwMCwiZXhwIjoxNjk0ODkwMDAwLCJhdWQiOiJnYW1lcGlsb3QtYXBpIiwiaXNzIjoiZ2FtZXBpbG90LWF1dGgiLCJzY29wZSI6WyJnYW1lczpyZWFkIiwiaW50ZWdyYXRpb25zOnJlYWQiXX0.test-signature";
export declare const mockExpiredToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImlhdCI6MTY5NDgwMDAwMCwiZXhwIjoxNjk0ODAzNjAwLCJhdWQiOiJnYW1lcGlsb3QtYXBpIiwiaXNzIjoiZ2FtZXBpbG90LWF1dGgifQ.expired-signature";
export declare const mockUser: {
    id: string;
    username: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
};
export declare const mockYouTubeIntegration: {
    id: string;
    userId: string;
    platform: any;
    externalUserId: string;
    externalUsername: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    scopes: string[];
    status: IntegrationStatus;
    isActive: boolean;
    isConnected: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastSyncAt: Date;
    lastUsedAt: Date;
    metadata: {
        channelTitle: string;
        subscriberCount: number;
        videoCount: number;
        viewCount: number;
    };
    syncConfig: {
        autoSync: boolean;
        syncFrequency: number;
        lastSyncAt: Date;
        errorCount: number;
        maxRetries: number;
    };
};
export declare const mockDiscordIntegration: {
    id: string;
    userId: string;
    platform: any;
    externalUserId: string;
    externalUsername: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    scopes: string[];
    status: IntegrationStatus;
    isActive: boolean;
    isConnected: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastSyncAt: Date;
    lastUsedAt: Date;
    metadata: {
        id: string;
        username: string;
        discriminator: string;
        avatar: string;
        bot: boolean;
        verified: boolean;
        email: string;
        flags: number;
        globalName: string;
        avatarUrl: string;
    };
    syncConfig: {
        autoSync: boolean;
        syncFrequency: number;
        lastSyncAt: Date;
        errorCount: number;
        maxRetries: number;
    };
};
export declare const mockSteamIntegration: {
    id: string;
    userId: string;
    platform: any;
    externalUserId: string;
    externalUsername: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    scopes: string[];
    status: IntegrationStatus;
    isActive: boolean;
    isConnected: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastSyncAt: Date;
    lastUsedAt: Date;
    metadata: {
        steamId: string;
        personaName: string;
        profileUrl: string;
        avatar: string;
        personaState: number;
        gameExtraInfo: string;
        gameId: string;
    };
    syncConfig: {
        autoSync: boolean;
        syncFrequency: number;
        lastSyncAt: Date;
        errorCount: number;
        maxRetries: number;
    };
};
export declare const mockYouTubeVideos: {
    videoId: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    publishedAt: string;
    viewCount: number;
    likeCount: number;
}[];
export declare const mockDiscordGuilds: {
    id: string;
    name: string;
    icon: string;
    memberCount: number;
    onlineCount: number;
    ownerId: string;
    features: string[];
}[];
export declare const mockSteamGames: {
    appId: number;
    name: string;
    headerImage: string;
    shortDescription: string;
    genres: string[];
    platforms: string[];
    releaseDate: string;
    priceOverview: {
        currency: string;
        initial: number;
        final: number;
        discountPercent: number;
    };
}[];
export declare const mockEnvVars: {
    JWT_SECRET: string;
    STEAM_API_KEY: string;
    YOUTUBE_API_KEY: string;
    DISCORD_BOT_TOKEN: string;
    NODE_ENV: string;
};
export declare const createMockRequest: (overrides?: any) => any;
export declare const createMockResponse: () => any;
export declare const setupMockDatabase: () => {
    get: (key: string) => any;
    set: (key: string, value: any) => Map<any, any>;
    delete: (key: string) => boolean;
    clear: () => void;
    has: (key: string) => boolean;
    size: () => number;
};
export declare const createMockRateLimiter: () => {
    checkLimit: (key: string, limit: number, windowMs: number) => boolean;
    clear: () => void;
};
//# sourceMappingURL=setup.d.ts.map