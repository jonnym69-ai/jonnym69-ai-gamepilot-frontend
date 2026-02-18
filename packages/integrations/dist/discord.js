// Discord API integration for GamePilot
// v1: Public guild info and basic functionality
// No OAuth required for basic features
export class DiscordIntegration {
    constructor(botToken, userToken) {
        this.baseUrl = 'https://discord.com/api/v10';
        this.cdnUrl = 'https://cdn.discordapp.com';
        this.botToken = botToken || import.meta.env?.VITE_DISCORD_BOT_TOKEN;
        this.userToken = userToken || import.meta.env?.VITE_DISCORD_USER_TOKEN;
        if (!this.botToken && !this.userToken) {
            console.warn('Discord tokens not provided. Some features will be limited to public data only.');
        }
    }
    /**
     * Get public guild information
     * No authentication required for basic guild info
     */
    async getPublicGuildInfo(guildId) {
        try {
            // Try widget endpoint first (public, no auth required)
            const widgetResponse = await fetch(`${this.baseUrl}/guilds/${guildId}/widget.json`);
            if (widgetResponse.ok) {
                const widgetData = await widgetResponse.json();
                return this.transformWidgetResponse(widgetData, guildId);
            }
            // If widget not available, try with bot token
            if (this.botToken) {
                const guildResponse = await fetch(`${this.baseUrl}/guilds/${guildId}`, {
                    headers: {
                        'Authorization': `Bot ${this.botToken}`
                    }
                });
                if (guildResponse.ok) {
                    const guildData = await guildResponse.json();
                    return this.transformGuildResponse(guildData);
                }
            }
            return null;
        }
        catch (error) {
            console.error('Error fetching guild info:', error);
            return null;
        }
    }
    /**
     * Get channels for a guild
     * Requires bot token for full channel list
     */
    async getGuildChannels(guildId) {
        if (!this.botToken) {
            console.warn('Bot token required for channel list');
            return [];
        }
        try {
            const response = await fetch(`${this.baseUrl}/guilds/${guildId}/channels`, {
                headers: {
                    'Authorization': `Bot ${this.botToken}`
                }
            });
            if (!response.ok) {
                throw new Error(`Discord API Error: ${response.statusText}`);
            }
            const channels = await response.json();
            return channels.map((channel) => this.transformChannelResponse(channel));
        }
        catch (error) {
            console.error('Error fetching guild channels:', error);
            return [];
        }
    }
    /**
     * Get guilds for a user
     * Requires user authentication
     */
    async getGuildsForUser(token) {
        const authToken = token || this.userToken;
        if (!authToken) {
            console.warn('User token required for guild list');
            return [];
        }
        try {
            const response = await fetch(`${this.baseUrl}/users/@me/guilds`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            if (!response.ok) {
                throw new Error(`Discord API Error: ${response.statusText}`);
            }
            const guilds = await response.json();
            return guilds.map((guild) => this.transformGuildResponse(guild));
        }
        catch (error) {
            console.error('Error fetching user guilds:', error);
            return [];
        }
    }
    /**
     * Get user information
     * Requires authentication
     */
    async getUserInfo(token) {
        const authToken = token || this.userToken;
        if (!authToken) {
            console.warn('User token required for user info');
            return null;
        }
        try {
            const response = await fetch(`${this.baseUrl}/users/@me`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            if (!response.ok) {
                throw new Error(`Discord API Error: ${response.statusText}`);
            }
            return this.transformUserResponse(await response.json());
        }
        catch (error) {
            console.error('Error fetching user info:', error);
            return null;
        }
    }
    /**
     * Get user's current activity (Rich Presence)
     * This would require additional permissions and OAuth2 scope
     */
    async getUserActivity(token) {
        const authToken = token || this.userToken;
        if (!authToken) {
            console.warn('User token required for activity info');
            return null;
        }
        try {
            const response = await fetch(`${this.baseUrl}/users/@me/activities`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            if (!response.ok) {
                // Activity endpoint requires additional permissions
                console.log('Activity info requires additional Discord permissions');
                return null;
            }
            const activities = await response.json();
            return activities.length > 0 ? this.transformActivityResponse(activities[0]) : null;
        }
        catch (error) {
            console.error('Error fetching user activity:', error);
            return null;
        }
    }
    /**
     * Transform widget response to guild format
     */
    transformWidgetResponse(widgetData, guildId) {
        return {
            id: guildId,
            name: widgetData.name,
            description: widgetData.description,
            icon: widgetData.icon ? `${this.cdnUrl}/icons/${guildId}/${widgetData.icon}.png` : undefined,
            memberCount: widgetData.presence_count,
            presenceCount: widgetData.presence_count,
            channels: [], // Widget doesn't include channels
            features: [],
            createdAt: new Date() // Widget doesn't include creation date
        };
    }
    /**
     * Transform guild API response
     */
    transformGuildResponse(guildData) {
        return {
            id: guildData.id,
            name: guildData.name,
            description: guildData.description,
            icon: guildData.icon ? `${this.cdnUrl}/icons/${guildData.id}/${guildData.icon}.png` : undefined,
            memberCount: guildData.member_count,
            presenceCount: guildData.presence_count,
            ownerId: guildData.owner_id,
            features: guildData.features || [],
            channels: [], // Separate endpoint needed for channels
            createdAt: guildData.id ? this.extractSnowflakeDate(guildData.id) : new Date()
        };
    }
    /**
     * Transform channel API response
     */
    transformChannelResponse(channelData) {
        return {
            id: channelData.id,
            name: channelData.name,
            type: channelData.type,
            topic: channelData.topic,
            position: channelData.position,
            parentId: channelData.parent_id,
            nsfw: channelData.nsfw || false,
            permissionOverwrites: channelData.permission_overwrites
        };
    }
    /**
     * Transform user API response
     */
    transformUserResponse(userData) {
        return {
            id: userData.id,
            username: userData.username,
            discriminator: userData.discriminator,
            avatar: userData.avatar ? `${this.cdnUrl}/avatars/${userData.id}/${userData.avatar}.png` : undefined,
            publicFlags: userData.public_flags,
            bot: userData.bot || false
        };
    }
    /**
     * Transform activity API response
     */
    transformActivityResponse(activityData) {
        return {
            type: activityData.type,
            name: activityData.name,
            details: activityData.details,
            state: activityData.state,
            applicationId: activityData.application_id,
            sessionId: activityData.session_id,
            assets: activityData.assets,
            timestamps: activityData.timestamps,
            party: activityData.party,
            secrets: activityData.secrets
        };
    }
    /**
     * Extract date from Discord snowflake ID
     */
    extractSnowflakeDate(snowflake) {
        const epoch = 1420070400000; // Discord epoch
        const snowflakeBits = BigInt(snowflake);
        const timestamp = (snowflakeBits >> BigInt(22)) + BigInt(epoch);
        return new Date(Number(timestamp));
    }
    /**
     * Get mock guild data for testing
     */
    getMockGuilds() {
        return [
            {
                id: '123456789012345678',
                name: 'GamePilot Community',
                description: 'Official GamePilot Discord server for gaming enthusiasts',
                icon: '/images/mock/discord-icon.png',
                memberCount: 2500,
                presenceCount: 850,
                channels: [],
                features: ['COMMUNITY', 'NEWS', 'WELCOME_SCREEN_ENABLED'],
                createdAt: new Date('2020-06-15')
            },
            {
                id: '987654321098765432',
                name: 'Competitive Gaming Hub',
                description: 'Tournaments, scrims, and competitive gaming discussion',
                icon: '/images/mock/discord-icon-2.png',
                memberCount: 1200,
                presenceCount: 420,
                channels: [],
                features: ['COMMUNITY'],
                createdAt: new Date('2021-03-20')
            }
        ];
    }
    /**
     * Get mock channels for testing
     */
    getMockChannels() {
        return [
            {
                id: '123456789012345678',
                name: 'general',
                type: 'text',
                topic: 'General gaming discussion',
                position: 0,
                nsfw: false
            },
            {
                id: '987654321098765432',
                name: 'looking-for-group',
                type: 'text',
                topic: 'Find teammates for your favorite games',
                position: 1,
                nsfw: false
            },
            {
                id: '555566667778889999',
                name: 'Gaming Voice',
                type: 'voice',
                position: 2,
                nsfw: false
            }
        ];
    }
    /**
     * Check if integration is available
     */
    isIntegrationAvailable() {
        return {
            botAvailable: !!this.botToken,
            userAvailable: !!this.userToken,
            publicAvailable: true // Public guild info always available
        };
    }
    /**
     * Get integration info
     */
    getIntegrationInfo() {
        return {
            version: '1.0',
            features: {
                publicGuildInfo: true,
                userGuilds: !!this.userToken,
                guildChannels: !!this.botToken,
                userInfo: !!this.userToken,
                richPresence: false // Requires additional OAuth2 scopes
            },
            rateLimits: {
                requestsPerSecond: 50,
                requestsPerMinute: 1000
            }
        };
    }
}
