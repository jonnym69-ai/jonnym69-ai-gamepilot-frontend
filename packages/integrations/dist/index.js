// Export all integrations
export * from './youtube';
export * from './discord';
export * from './steam';
// Import classes for re-export
import { YouTubeIntegration } from './youtube';
import { DiscordIntegration } from './discord';
import { SteamIntegration } from './steam';
// Main exports
export { YouTubeIntegration, DiscordIntegration, SteamIntegration };
export class IntegrationManager {
    constructor(config) {
        this.config = config;
        this.youtube = new YouTubeIntegration(config.youtube?.apiKey);
        this.discord = new DiscordIntegration(config.discord?.botToken, config.discord?.userToken);
        this.steam = new SteamIntegration(config.steam?.apiKey);
    }
    /**
     * Get YouTube integration
     */
    getYouTube() {
        return this.youtube;
    }
    /**
     * Get Discord integration
     */
    getDiscord() {
        return this.discord;
    }
    /**
     * Get Steam integration
     */
    getSteam() {
        return this.steam;
    }
    /**
     * Check which integrations are available
     */
    getAvailableIntegrations() {
        return {
            youtube: {
                available: this.youtube.isApiAvailable(),
                enabled: this.config.youtube?.enabled || false
            },
            discord: {
                available: this.discord.isIntegrationAvailable(),
                enabled: this.config.discord?.enabled || false
            },
            steam: {
                available: this.steam.isApiAvailable(),
                enabled: this.config.steam?.enabled || false
            }
        };
    }
    /**
     * Get integration status for UI
     */
    getIntegrationStatus() {
        const available = this.getAvailableIntegrations();
        return {
            youtube: {
                status: available.youtube.enabled && available.youtube.available ? 'connected' :
                    available.youtube.enabled ? 'error' : 'disabled',
                message: available.youtube.available ? 'Connected to YouTube API' :
                    available.youtube.enabled ? 'YouTube API unavailable' : 'YouTube integration disabled'
            },
            discord: {
                status: available.discord.available.botAvailable ? 'connected' :
                    available.discord.enabled ? 'partial' : 'disabled',
                message: available.discord.available.botAvailable ? 'Connected to Discord API' :
                    available.discord.enabled ? 'Discord partially connected' : 'Discord integration disabled'
            },
            steam: {
                status: available.steam.enabled && available.steam.available ? 'connected' :
                    available.steam.enabled ? 'error' : 'disabled',
                message: available.steam.available ? 'Connected to Steam API' :
                    available.steam.enabled ? 'Steam API unavailable' : 'Steam integration disabled'
            }
        };
    }
}
