"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSteamAuthUrl = generateSteamAuthUrl;
exports.verifySteamResponse = verifySteamResponse;
exports.fetchSteamUserProfile = fetchSteamUserProfile;
exports.fetchSteamGames = fetchSteamGames;
exports.fetchSteamRecentlyPlayedGames = fetchSteamRecentlyPlayedGames;
exports.createOrUpdateSteamUser = createOrUpdateSteamUser;
const addSteamFields_1 = require("../migrations/addSteamFields");
const database_1 = require("../services/database");
const shared_1 = require("@gamepilot/shared");
const axios_1 = __importDefault(require("axios"));
// Steam OpenID configuration
const STEAM_OPENID_URL = 'https://steamcommunity.com/openid/login';
const REALM = process.env.NODE_ENV === 'production'
    ? 'https://gamepilot.com'
    : 'http://localhost:3001'; // Point to API port
const RETURN_URL = 'http://localhost:3001/api/auth/callback/steam';
// Helper function to get STEAM_API_KEY dynamically
const getSteamApiKey = () => process.env.STEAM_API_KEY;
/**
 * Generate Steam OpenID authentication URL
 */
function generateSteamAuthUrl() {
    // Build OpenID URL manually
    const params = new URLSearchParams({
        'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
        'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
        'openid.return_to': RETURN_URL,
        'openid.realm': REALM,
        'openid.mode': 'checkid_setup',
        'openid.ns': 'http://specs.openid.net/auth/2.0'
    });
    const authUrl = `${STEAM_OPENID_URL}?${params.toString()}`;
    console.log('🔗 Generated Steam auth URL:', authUrl);
    return authUrl;
}
/**
 * Verify Steam OpenID response
 */
async function verifySteamResponse(query) {
    try {
        console.log('🔍 Verifying Steam OpenID response:', query);
        // Extract the claimed ID from the response
        const claimedId = query['openid.claimed_id'];
        if (!claimedId) {
            console.error('❌ No claimed_id found in Steam response');
            return { steamId: '', valid: false };
        }
        // Extract Steam ID from the claimed ID URL
        // Format: https://steamcommunity.com/openid/id/<steamId>
        const steamIdMatch = claimedId.match(/https:\/\/steamcommunity\.com\/openid\/id\/(\d+)/);
        if (!steamIdMatch) {
            console.error('❌ Invalid Steam ID format in claimed_id:', claimedId);
            return { steamId: '', valid: false };
        }
        const steamId = steamIdMatch[1];
        console.log('✅ Extracted Steam ID:', steamId);
        return { steamId, valid: true };
    }
    catch (error) {
        console.error('❌ Steam OpenID verification failed:', error);
        return { steamId: '', valid: false };
    }
}
/**
 * Fetch Steam user profile data
 */
async function fetchSteamUserProfile(steamId) {
    try {
        const STEAM_API_KEY = getSteamApiKey();
        if (!STEAM_API_KEY) {
            console.error('❌ STEAM_API_KEY not configured');
            return null;
        }
        console.log('👤 Fetching Steam user profile for ID:', steamId);
        const response = await axios_1.default.get('https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/', {
            params: {
                key: STEAM_API_KEY,
                steamids: steamId
            }
        });
        const players = response.data.response?.players;
        if (!players || players.length === 0) {
            console.error('❌ No player data found for Steam ID:', steamId);
            return null;
        }
        const player = players[0];
        const profileData = {
            personaName: player.personaname || 'Unknown',
            avatar: player.avatarmedium || player.avatar || '',
            realName: player.realname
        };
        console.log('✅ Fetched Steam user profile:', profileData);
        return profileData;
    }
    catch (error) {
        console.error('❌ Failed to fetch Steam user profile:', error);
        return null;
    }
}
/**
 * Fetch user's Steam games library
 */
async function fetchSteamGames(steamId) {
    try {
        const STEAM_API_KEY = getSteamApiKey();
        if (!STEAM_API_KEY) {
            console.error('❌ STEAM_API_KEY not configured');
            return [];
        }
        console.log('🎮 Fetching Steam games library for ID:', steamId);
        const response = await axios_1.default.get('https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/', {
            params: {
                key: STEAM_API_KEY,
                steamid: steamId,
                format: 'json',
                include_appinfo: true,
                include_played_free_games: true
            }
        });
        const games = response.data.response?.games || [];
        console.log(`✅ Fetched ${games.length} Steam games`);
        return games;
    }
    catch (error) {
        console.error('❌ Failed to fetch Steam games:', error);
        return [];
    }
}
/**
 * Fetch user's recently played Steam games
 */
async function fetchSteamRecentlyPlayedGames(steamId) {
    try {
        const STEAM_API_KEY = getSteamApiKey();
        if (!STEAM_API_KEY) {
            console.error('❌ STEAM_API_KEY not configured');
            return [];
        }
        console.log('🕐 Fetching recently played Steam games for ID:', steamId);
        const response = await axios_1.default.get('https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/', {
            params: {
                key: STEAM_API_KEY,
                steamid: steamId,
                format: 'json'
            }
        });
        const games = response.data.response?.games || [];
        console.log(`✅ Fetched ${games.length} recently played Steam games`);
        return games;
    }
    catch (error) {
        console.error('❌ Failed to fetch recently played Steam games:', error);
        return [];
    }
}
/**
 * Create or update user with Steam data
 */
async function createOrUpdateSteamUser(steamId, profileData) {
    try {
        console.log('👤 Creating/updating Steam user:', profileData.personaName);
        // First, ensure Steam fields exist in database
        await (0, addSteamFields_1.addSteamFieldsToUsers)();
        // Check if user already exists by Steam ID
        let user = await (0, addSteamFields_1.getUserBySteamId)(steamId);
        if (user) {
            console.log('🔄 Updating existing Steam user:', user.id);
            // Update existing user with fresh Steam data
            await (0, addSteamFields_1.updateUserWithSteamData)(user.id, {
                steamId,
                personaName: profileData.personaName,
                avatar: profileData.avatar
            });
            // Get updated user
            user = await database_1.databaseService.getUserById(user.id);
        }
        else {
            console.log('🆕 Creating new Steam user:', profileData.personaName);
            // Create new user with Steam data
            user = await database_1.databaseService.createUser({
                username: profileData.personaName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
                email: `${profileData.personaName.toLowerCase().replace(/[^a-z0-9]/g, '_')}@steam.local`,
                displayName: profileData.personaName,
                avatar: profileData.avatar,
                bio: `Steam user - ${profileData.personaName}`,
                location: '',
                timezone: 'UTC',
                lastActive: new Date(),
                gamingProfile: {
                    primaryPlatforms: [shared_1.PlatformCode.STEAM],
                    genreAffinities: {},
                    playstyleArchetypes: [],
                    moodProfile: {
                        currentMood: 'neutral',
                        moodHistory: [],
                        moodTriggers: [],
                        moodPreferences: {}
                    },
                    totalPlaytime: 0,
                    gamesPlayed: 0,
                    gamesCompleted: 0,
                    achievementsCount: 0,
                    averageRating: 0,
                    currentStreak: 0,
                    longestStreak: 0,
                    favoriteGames: []
                },
                integrations: [],
                privacy: {
                    profileVisibility: 'public',
                    sharePlaytime: true,
                    shareAchievements: true,
                    shareGameLibrary: true,
                    allowFriendRequests: true,
                    showOnlineStatus: true
                },
                preferences: {
                    theme: 'dark',
                    language: 'en',
                    notifications: {
                        email: true,
                        push: true,
                        achievements: true,
                        recommendations: true,
                        friendActivity: true,
                        platformUpdates: false
                    },
                    display: {
                        compactMode: false,
                        showGameCovers: true,
                        animateTransitions: true,
                        showRatings: true
                    }
                },
                social: {
                    friends: [],
                    blockedUsers: [],
                    favoriteGenres: [],
                    customTags: []
                }
            });
            // Update with Steam-specific data
            await (0, addSteamFields_1.updateUserWithSteamData)(user.id, {
                steamId,
                personaName: profileData.personaName,
                avatar: profileData.avatar
            });
            // Get updated user
            user = await database_1.databaseService.getUserById(user.id);
        }
        if (!user) {
            throw new Error('Failed to create or update Steam user');
        }
        console.log('✅ Steam user created/updated successfully:', user.id);
        return user;
    }
    catch (error) {
        console.error('❌ Failed to create/update Steam user:', error);
        throw error;
    }
}
//# sourceMappingURL=steam.js.map