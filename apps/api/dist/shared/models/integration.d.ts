import { PlatformCode } from '../types';
export interface UserIntegration {
    id: string;
    userId: string;
    platform: PlatformCode;
    externalUserId: string;
    externalUsername?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
    scopes: string[];
    status: IntegrationStatus;
    isActive: boolean;
    isConnected: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastSyncAt?: Date;
    lastUsedAt?: Date;
    metadata?: Record<string, any>;
    syncConfig: {
        autoSync: boolean;
        syncFrequency: number;
        lastSyncAt?: Date;
        errorCount: number;
        maxRetries: number;
    };
}
export declare enum IntegrationStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    DISCONNECTED = "disconnected",
    EXPIRED = "expired",
    ERROR = "error"
}
export interface SteamIntegrationMetadata {
    steamId: string;
    personaName: string;
    profileUrl: string;
    avatar: string;
    personaState: number;
    gameExtraInfo?: string;
    gameId?: string;
}
export interface DiscordIntegrationMetadata {
    id: string;
    username: string;
    discriminator: string;
    avatar: string;
    bot: boolean;
    verified: boolean;
    email?: string;
    flags: number;
    premiumType?: number;
    globalName?: string;
    avatarUrl?: string;
    bannerUrl?: string;
    accentColor?: number;
}
export interface YouTubeIntegrationMetadata {
    channelTitle: string;
    subscriberCount: number;
    videoCount: number;
    viewCount: number;
    publishedAt: Date;
}
export declare function isValidUserIntegration(integration: any): integration is UserIntegration;
export declare function isValidSyncConfig(config: any): boolean;
export declare function isValidSteamIntegrationMetadata(metadata: any): boolean;
export declare function isValidDiscordIntegrationMetadata(metadata: any): boolean;
export declare function isValidYouTubeIntegrationMetadata(metadata: any): boolean;
export declare function createDefaultUserIntegration(userData: {
    id: string;
    userId: string;
    platform: PlatformCode;
    externalUserId: string;
    externalUsername: string;
}): UserIntegration;
export interface IntegrationValidation {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}
export declare function validateUserIntegration(integration: UserIntegration): IntegrationValidation;
export declare function isIntegrationActive(integration: UserIntegration): boolean;
export declare function isIntegrationExpired(integration: UserIntegration): boolean;
export declare function isIntegrationHealthy(integration: UserIntegration): boolean;
//# sourceMappingURL=integration.d.ts.map