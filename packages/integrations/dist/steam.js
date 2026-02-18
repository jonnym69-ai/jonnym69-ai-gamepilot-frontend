// Steam Web API integration for GamePilot
// Uses free Steam Web API for game data
export class SteamIntegration {
    constructor(apiKey) {
        this.baseUrl = 'https://store.steampowered.com/api/featured';
        this.apiUrl = 'https://api.steampowered.com';
        this.maxResultsPerPage = 100;
        this.apiKey = apiKey || import.meta.env?.VITE_STEAM_API_KEY || '';
        if (!this.apiKey) {
            console.warn('Steam API key not provided. Some features will be limited.');
        }
    }
    /**
     * Get games owned by a Steam user
     * Free tier - requires user's Steam ID
     */
    async getOwnedGames(steamId) {
        if (!this.apiKey) {
            return this.getMockOwnedGames();
        }
        try {
            const params = new URLSearchParams({
                key: this.apiKey,
                steamid: steamId,
                format: 'json',
                include_appinfo: 'true',
                include_played_free_games: 'true'
            });
            const response = await fetch(`${this.apiUrl}/IPlayerService/GetOwnedGames/v0001/?${params}`);
            if (!response.ok) {
                throw new Error(`Steam API Error: ${response.statusText}`);
            }
            const data = await response.json();
            return this.transformOwnedGamesResponse(data);
        }
        catch (error) {
            console.error('Error fetching owned games:', error);
            return this.getMockOwnedGames();
        }
    }
    /**
     * Get recently played games for a Steam user
     */
    async getRecentlyPlayed(steamId) {
        if (!this.apiKey) {
            return this.getMockRecentlyPlayedGames();
        }
        try {
            const params = new URLSearchParams({
                key: this.apiKey,
                steamid: steamId,
                format: 'json'
            });
            const response = await fetch(`${this.apiUrl}/IPlayerService/GetRecentlyPlayedGames/v0001/?${params}`);
            if (!response.ok) {
                throw new Error(`Steam API Error: ${response.statusText}`);
            }
            const data = await response.json();
            return this.transformRecentlyPlayedResponse(data);
        }
        catch (error) {
            console.error('Error fetching recently played games:', error);
            return this.getMockRecentlyPlayedGames();
        }
    }
    /**
     * Get detailed information about a specific game
     */
    async getGameDetails(appId) {
        if (!this.apiKey) {
            return this.getMockGameDetails(appId);
        }
        try {
            const params = new URLSearchParams({
                appids: appId.toString(),
                key: this.apiKey,
                format: 'json',
                cc: 'us',
                l: 'english'
            });
            const response = await fetch(`${this.apiUrl}/ISteamUser/GetPlayerSummaries/v0002/?${params}`);
            if (!response.ok) {
                throw new Error(`Steam API Error: ${response.statusText}`);
            }
            const data = await response.json();
            const games = data.response?.games || [];
            if (games.length === 0) {
                return null;
            }
            // Get detailed game info
            const detailParams = new URLSearchParams({
                appid: appId.toString(),
                key: this.apiKey,
                format: 'json',
                cc: 'us',
                l: 'english'
            });
            const detailResponse = await fetch(`${this.apiUrl}/ISteamUser/GetAppList/v2/?${detailParams}`);
            if (!detailResponse.ok) {
                throw new Error(`Steam API Error: ${detailResponse.statusText}`);
            }
            const detailData = await detailResponse.json();
            const appDetails = detailData.applist?.find((app) => app.appid === appId);
            if (!appDetails) {
                return null;
            }
            return this.transformGameDetailsResponse(appDetails);
        }
        catch (error) {
            console.error('Error fetching game details:', error);
            return this.getMockGameDetails(appId);
        }
    }
    /**
     * Get player summary for a Steam user
     */
    async getPlayerSummary(steamId) {
        if (!this.apiKey) {
            return this.getMockPlayerSummary();
        }
        try {
            const params = new URLSearchParams({
                key: this.apiKey,
                steamids: steamId,
                format: 'json'
            });
            const response = await fetch(`${this.apiUrl}/ISteamUser/GetPlayerSummaries/v0002/?${params}`);
            if (!response.ok) {
                throw new Error(`Steam API Error: ${response.statusText}`);
            }
            const data = await response.json();
            const players = data.response?.players || [];
            if (players.length === 0) {
                return null;
            }
            return this.transformPlayerSummaryResponse(players[0]);
        }
        catch (error) {
            console.error('Error fetching player summary:', error);
            return this.getMockPlayerSummary();
        }
    }
    /**
     * Transform owned games API response
     */
    transformOwnedGamesResponse(data) {
        const games = data.response?.games || [];
        return games.map((game) => {
            const appInfo = game.data || {};
            return {
                appId: appInfo.appid,
                name: appInfo.name || 'Unknown Game',
                steamId: game.steamid,
                playtimeForever: appInfo.playtime_forever || 0,
                playtimeWindows: appInfo.playtime_windows || 0,
                playtimeMac: appInfo.playtime_mac || 0,
                playtimeLinux: appInfo.playtime_linux || 0,
                imgIconUrl: appInfo.img_icon_url || '',
                imgLogoUrl: appInfo.img_logo_url || '',
                hasCommunityVisibleStats: appInfo.has_community_visible_stats || false,
                playtimeLastTwoWeeks: appInfo.playtime_last_two_weeks || 0,
                playtimeAtLastUpdate: new Date(),
                headerImage: appInfo.header_image || '',
                shortDescription: appInfo.short_description || '',
                supportedLanguages: appInfo.supported_languages || [],
                developers: appInfo.developers || [],
                publishers: appInfo.publishers || [],
                genres: appInfo.genres || [],
                categories: appInfo.categories || [],
                releaseDate: appInfo.release_date ? new Date(appInfo.release_date * 1000) : new Date(),
                metacriticScore: appInfo.metacritic?.score,
                recommendations: appInfo.recommendations || 0,
                isFree: appInfo.is_free || false,
                priceOverview: appInfo.price_overview,
                platforms: appInfo.platforms || []
            };
        });
    }
    /**
     * Transform recently played games response
     */
    transformRecentlyPlayedResponse(data) {
        const games = data.response?.games || [];
        return games.map((game) => {
            return {
                appId: game.appid,
                name: game.name || 'Unknown Game',
                playtime2weeks: game.playtime_2weeks || 0,
                playtimeForever: game.playtime_forever || 0,
                imgIconUrl: game.img_icon_url || '',
                lastPlayed: game.last_played ? new Date(game.last_played * 1000) : new Date()
            };
        });
    }
    /**
     * Transform game details response
     */
    transformGameDetailsResponse(appData) {
        return {
            steamId: appData.steamid || '',
            name: appData.name || 'Unknown Game',
            description: appData.detailed_description || '',
            aboutTheGame: appData.about_the_game || '',
            shortDescription: appData.short_description || '',
            supportedLanguages: appData.supported_languages || [],
            reviews: appData.reviews || '',
            headerImage: appData.header_image || '',
            website: appData.website,
            developers: appData.developers || [],
            publishers: appData.publishers || [],
            genres: appData.genres || [],
            categories: appData.categories || [],
            releaseDate: appData.steam_release_date ? new Date(appData.steam_release_date * 1000) : new Date(),
            platforms: appData.platforms || [],
            metacritic: appData.metacritic || { score: 0, url: '' },
            recommendations: appData.recommendations || 0,
            priceOverview: appData.price_overview,
            screenshots: appData.screenshots || [],
            movies: appData.movies || [],
            dlc: appData.dlc || [],
            requirements: appData.requirements || { minimum: '', recommended: '' }
        };
    }
    /**
     * Transform player summary response
     */
    transformPlayerSummaryResponse(player) {
        return {
            steamId: player.steamid || '',
            personaName: player.personaname || 'Unknown Player',
            profileUrl: player.profileurl || '',
            avatar: player.avatarfull || player.avatar || '',
            realName: player.realname || '',
            primaryClanId: player.primaryclanid,
            timeCreated: player.timecreated ? new Date(player.timecreated * 1000) : new Date(),
            lastLogoff: player.lastlogoff ? new Date(player.lastlogoff * 1000) : new Date(),
            gameCount: player.gamecount || 0,
            gameServerIp: player.gameserverip,
            gameServerPort: player.gameserverport
        };
    }
    /**
     * Get mock owned games for testing
     */
    getMockOwnedGames() {
        return [
            {
                appId: 730,
                name: 'Counter-Strike: Global Offensive',
                steamId: '76561197960287930',
                playtimeForever: 1250,
                playtimeWindows: 1200,
                playtimeMac: 50,
                playtimeLinux: 0,
                imgIconUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/730/icon.jpg',
                imgLogoUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/730/logo.jpg',
                hasCommunityVisibleStats: true,
                playtimeLastTwoWeeks: 300,
                playtimeAtLastUpdate: new Date(),
                headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/730/header.jpg',
                shortDescription: 'Play the world\'s number 1 online action game.',
                supportedLanguages: ['English', 'French', 'German', 'Spanish', 'Italian', 'Japanese'],
                developers: ['Valve', 'Hidden Path Entertainment'],
                publishers: ['Valve'],
                genres: ['Action'],
                categories: ['Multi-player', 'FPS'],
                releaseDate: new Date('2012-08-21'),
                metacriticScore: 83,
                recommendations: 0,
                isFree: false,
                platforms: ['Windows', 'macOS', 'Linux']
            },
            {
                appId: 440,
                name: 'Team Fortress 2',
                steamId: '76561197960287930',
                playtimeForever: 890,
                playtimeWindows: 850,
                playtimeMac: 40,
                playtimeLinux: 0,
                imgIconUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/440/icon.jpg',
                imgLogoUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/440/logo.jpg',
                hasCommunityVisibleStats: true,
                playtimeLastTwoWeeks: 200,
                playtimeAtLastUpdate: new Date(),
                headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/440/header.jpg',
                shortDescription: 'Team-based multiplayer FPS.',
                supportedLanguages: ['English', 'French', 'German', 'Spanish', 'Italian'],
                developers: ['Valve'],
                publishers: ['Valve'],
                genres: ['Action'],
                categories: ['Multi-player', 'FPS'],
                releaseDate: new Date('2007-10-10'),
                metacriticScore: 92,
                recommendations: 0,
                isFree: false,
                platforms: ['Windows', 'macOS', 'Linux']
            }
        ];
    }
    /**
     * Get mock recently played games
     */
    getMockRecentlyPlayedGames() {
        return [
            {
                appId: 730,
                name: 'Counter-Strike: Global Offensive',
                playtime2weeks: 25,
                playtimeForever: 1250,
                imgIconUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/730/icon.jpg',
                lastPlayed: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
            },
            {
                appId: 440,
                name: 'Team Fortress 2',
                playtime2weeks: 15,
                playtimeForever: 890,
                imgIconUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/440/icon.jpg',
                lastPlayed: new Date(Date.now() - 1000 * 60 * 60 * 48) // 2 days ago
            }
        ];
    }
    /**
     * Get mock player summary
     */
    getMockPlayerSummary() {
        return {
            steamId: '76561197960287930',
            personaName: 'GamePilotUser',
            profileUrl: 'https://steamcommunity.com/id/GamePilotUser',
            avatar: 'https://cdn.akamai.steamstatic.com/steamcommunity/public/images/avatars/01/01/12345678901234567890_full.jpg',
            realName: 'GamePilot User',
            timeCreated: new Date('2020-01-15'),
            lastLogoff: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            gameCount: 156,
            gameServerIp: '192.168.1.100',
            gameServerPort: 27015
        };
    }
    /**
     * Check if Steam API is available
     */
    isApiAvailable() {
        return !!this.apiKey;
    }
    /**
     * Get mock game details for testing
     */
    getMockGameDetails(appId) {
        // Return null to force real API calls
        return null;
    }
    /**
     * Get API info
     */
    getApiInfo() {
        return {
            available: this.isApiAvailable(),
            maxResultsPerPage: this.maxResultsPerPage,
            rateLimits: {
                requestsPerMinute: 100000, // Steam Web API limit
                requestsPerDay: 1000000
            }
        };
    }
}
