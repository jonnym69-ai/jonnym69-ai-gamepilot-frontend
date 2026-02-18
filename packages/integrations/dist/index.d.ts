export * from './youtube';
export * from './discord';
export * from './steam';
import { YouTubeIntegration } from './youtube';
import { DiscordIntegration } from './discord';
import { SteamIntegration } from './steam';
export interface IntegrationConfig {
    youtube?: {
        apiKey?: string;
        enabled: boolean;
    };
    discord?: {
        botToken?: string;
        userToken?: string;
        enabled: boolean;
    };
    steam?: {
        apiKey?: string;
        enabled: boolean;
    };
}
export { YouTubeIntegration, DiscordIntegration, SteamIntegration };
export declare class IntegrationManager {
    private config;
    private youtube;
    private discord;
    private steam;
    constructor(config: IntegrationConfig);
    /**
     * Get YouTube integration
     */
    getYouTube(): YouTubeIntegration;
    /**
     * Get Discord integration
     */
    getDiscord(): DiscordIntegration;
    /**
     * Get Steam integration
     */
    getSteam(): SteamIntegration;
    /**
     * Check which integrations are available
     */
    getAvailableIntegrations(): {
        youtube: {
            available: boolean;
            enabled: boolean;
        };
        discord: {
            available: {
                botAvailable: boolean;
                userAvailable: boolean;
                publicAvailable: boolean;
            };
            enabled: boolean;
        };
        steam: {
            available: boolean;
            enabled: boolean;
        };
    };
    /**
     * Get integration status for UI
     */
    getIntegrationStatus(): {
        youtube: {
            status: string;
            message: string;
        };
        discord: {
            status: string;
            message: string;
        };
        steam: {
            status: string;
            message: string;
        };
    };
}
