"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const node_fetch_1 = __importDefault(require("node-fetch"));
const router = (0, express_1.Router)();
// const steamIntegration = new SteamIntegration(process.env.STEAM_API_KEY)
console.log('🎮 Steam games router initialized');
// GET /api/steam/games/featured
router.get('/featured', async (req, res) => {
    console.log('🎮 GET /steam/games/featured - Handling request');
    try {
        // Note: SteamIntegration doesn't have getFeaturedGames method
        // Using mock data for now - this would need to be implemented in the integration package
        const featuredGames = [
            {
                id: '1',
                name: 'Cyberpunk 2077',
                appId: '1091500',
                headerImage: 'https://via.placeholder.com/460x215/8b5cf6/ffffff?text=Cyberpunk+2077',
                shortDescription: 'An open-world, action-adventure story set in Night City',
                genres: ['RPG', 'Action', 'Open World'],
                releaseDate: '2020-12-10',
                priceOverview: {
                    final: 2999,
                    original: 5999,
                    discountPercent: 50,
                    currency: 'USD'
                },
                platforms: ['windows', 'linux', 'macos']
            }
        ];
        res.json(featuredGames);
    }
    catch (error) {
        console.error('Error fetching featured games:', error);
        res.status(500).json({
            error: 'Failed to fetch featured games',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// GET /api/steam/games/:appId
router.get('/games/:appId', async (req, res) => {
    try {
        const { appId } = req.params;
        const appIdNum = parseInt(appId, 10);
        if (isNaN(appIdNum)) {
            return res.status(400).json({
                error: 'Invalid app ID',
                message: 'App ID must be a number'
            });
        }
        // const gameDetails = await steamIntegration.getGameDetails(appIdNum)
        res.json({}); // Return an empty object for now
    }
    catch (error) {
        console.error('Error fetching game details:', error);
        res.status(500).json({
            error: 'Failed to fetch game details',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// GET /api/steam/player/:steamId
router.get('/player/:steamId', async (req, res) => {
    try {
        const { steamId } = req.params;
        // const playerSummary = await steamIntegration.getPlayerSummary(steamId)
        res.json({ message: 'Player summary endpoint - would use SteamIntegration' });
    }
    catch (error) {
        console.error('Error fetching player summary:', error);
        res.status(500).json({
            error: 'Failed to fetch player summary',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// GET /api/steam/games?steamId=xxx&apiKey=xxx
router.get('/', async (req, res) => {
    try {
        const { steamId, apiKey } = req.query;
        if (!steamId || !apiKey) {
            return res.status(400).json({
                error: 'Missing required parameters',
                message: 'steamId and apiKey are required'
            });
        }
        console.log(`🎮 GET /steam/games - Fetching Steam games for ID: ${steamId}`);
        console.log(`🔑 Using API key: ${apiKey}`);
        // Build URL manually to avoid Node.js URL issues
        const steamUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&steamid=${steamId}&format=json&include_appinfo=true&include_played_free_games=true`;
        console.log(`🌐 Calling Steam API: ${steamUrl.replace(apiKey, 'REDACTED')}`);
        const steamResponse = await (0, node_fetch_1.default)(steamUrl);
        if (!steamResponse.ok) {
            console.error(`❌ Steam API returned ${steamResponse.status}: ${steamResponse.statusText}`);
            return res.status(500).json({
                error: 'Steam API error',
                message: `Steam API returned ${steamResponse.status}: ${steamResponse.statusText}`
            });
        }
        const data = await steamResponse.json();
        if (data.error) {
            console.error(`❌ Steam API error:`, data.error);
            return res.status(500).json({
                error: 'Steam API error',
                message: data.error
            });
        }
        const games = data.response?.games || [];
        console.log(`✅ Retrieved ${games.length} games from Steam API`);
        res.json({
            steamId,
            games,
            gameCount: games.length,
            source: 'real_steam_api'
        });
    }
    catch (error) {
        console.error('❌ Failed to fetch Steam games:', error);
        res.status(500).json({
            error: 'Failed to fetch Steam games',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// GET /api/steam/games/genre/:genre
router.get('/genre/:genre', async (req, res) => {
    console.log(`🎮 GET /steam/games/genre/${req.params.genre} - Handling request`);
    try {
        const { genre } = req.params;
        const { limit = 20 } = req.query;
        console.log(`🎮 GET /steam/games/genre/${genre} - Fetching Steam games for genre: ${genre}`);
        // Mock data for now - this would need Steam API integration for real genre search
        // For demonstration, return some popular games by genre
        const genreGames = {
            'action': [
                {
                    id: '1091500',
                    name: 'Cyberpunk 2077',
                    genres: ['Action', 'RPG'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1091500/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1091500/header.jpg',
                    description: 'An open-world, action-adventure story set in Night City',
                    price: '$29.99',
                    releaseDate: '2020-12-10'
                },
                {
                    id: '892970',
                    name: 'Valheim',
                    genres: ['Action', 'Adventure', 'Survival'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/892970/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/892970/header.jpg',
                    description: 'A brutal exploration and survival game for 1-10 players',
                    price: '$19.99',
                    releaseDate: '2021-02-02'
                }
            ],
            'indie': [
                {
                    id: '252490',
                    name: 'Rust',
                    genres: ['Action', 'Adventure', 'Indie', 'Massively Multiplayer'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/252490/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/252490/header.jpg',
                    description: 'The only aim in Rust is to survive.',
                    price: '$39.99',
                    releaseDate: '2013-02-21'
                },
                {
                    id: '105600',
                    name: 'Terraria',
                    genres: ['Action', 'Adventure', 'Indie', 'RPG'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/105600/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/105600/header.jpg',
                    description: 'Dig, fight, explore, build! The ultimate sandbox adventure.',
                    price: '$9.99',
                    releaseDate: '2011-05-16'
                }
            ],
            'rpg': [
                {
                    id: '1086940',
                    name: 'Baldur\'s Gate 3',
                    genres: ['RPG', 'Strategy', 'Adventure'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1086940/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1086940/header.jpg',
                    description: 'Gather your party and venture forth!',
                    price: '$59.99',
                    releaseDate: '2020-10-06'
                },
                {
                    id: '292030',
                    name: 'The Witcher 3: Wild Hunt',
                    genres: ['RPG', 'Adventure'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/292030/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/292030/header.jpg',
                    description: 'You are Geralt of Rivia, mercenary monster slayer.',
                    price: '$39.99',
                    releaseDate: '2015-05-19'
                }
            ],
            'sports': [
                {
                    id: '730',
                    name: 'Counter-Strike 2',
                    genres: ['Action', 'FPS', 'Multiplayer'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/730/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/730/header.jpg',
                    description: 'Counter-Strike 2 is a free-to-play multiplayer game.',
                    price: 'Free to Play',
                    releaseDate: '2023-09-27'
                },
                {
                    id: '210970',
                    name: 'Rocket League',
                    genres: ['Sports', 'Racing', 'Indie'],
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/210970/header.jpg',
                    headerImage: 'https://cdn.akamai.steamstatic.com/steam/apps/210970/header.jpg',
                    description: 'Rocket League is a high-powered hybrid of arcade-style soccer.',
                    price: 'Free to Play',
                    releaseDate: '2015-07-07'
                }
            ]
        };
        const games = genreGames[genre.toLowerCase()] || [];
        const limitedGames = games.slice(0, parseInt(limit, 10));
        console.log(`✅ Retrieved ${limitedGames.length} games for genre: ${genre}`);
        res.json({
            success: true,
            data: limitedGames,
            genre,
            totalFound: games.length,
            limit: parseInt(limit, 10)
        });
    }
    catch (error) {
        console.error('Error fetching games by genre:', error);
        res.status(500).json({
            error: 'Failed to fetch games by genre',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// GET /api/steam/library/:steamId
router.get('/library/:steamId', async (req, res) => {
    try {
        const { steamId } = req.params;
        // Note: SteamIntegration has getOwnedGames method, not getPlayerLibrary
        // const library = await steamIntegration.getOwnedGames(steamId)
        res.json({
            steamId,
            gameCount: 0,
            games: []
        });
    }
    catch (error) {
        console.error('Error fetching player library:', error);
        res.status(500).json({
            error: 'Failed to fetch player library',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=games.js.map