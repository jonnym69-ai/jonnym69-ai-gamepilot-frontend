"use strict";
// Game model validation and utilities for GamePilot platform
Object.defineProperty(exports, "__esModule", { value: true });
exports.GAME_VALIDATION_RULES = exports.getWishlistStats = exports.getLibraryStats = exports.endGameSession = exports.createGameSession = exports.sortGamesByLastPlayed = exports.sortGamesByPlaytime = exports.sortGamesByRating = exports.sortGamesByTitle = exports.createSearchFilter = exports.getRelativeTime = exports.formatPlaytime = exports.getRatingLabel = exports.getRatingColor = exports.validateRating = exports.getPlatformName = exports.getPlatformColor = exports.isValidPlatformCode = exports.getMostPlayedGames = exports.getRecentGames = exports.getGameStats = exports.filterGamesByGenre = exports.filterGamesByPlatform = exports.filterGamesByStatus = exports.searchGames = exports.getGameById = exports.removeGameFromLibrary = exports.addGameToLibrary = exports.updateGamePlayStatus = exports.createGame = exports.validateGame = exports.getPlayStatusLabel = exports.getPlayStatusColor = exports.getPlayStatusTransition = exports.PLAY_STATUS_TRANSITIONS = exports.GameSchema = void 0;
const zod_1 = require("zod");
const types_1 = require("../types");
// Game validation schema
exports.GameSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    title: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().max(2000).optional(),
    coverImage: zod_1.z.string().url().optional(),
    backgroundImages: zod_1.z.array(zod_1.z.string().url()).optional(),
    releaseDate: zod_1.z.date().optional(),
    developer: zod_1.z.string().max(100).optional(),
    publisher: zod_1.z.string().max(100).optional(),
    genres: zod_1.z.array(zod_1.z.string()), // Will be validated with genre IDs
    subgenres: zod_1.z.array(zod_1.z.string()), // Will be validated with subgenre IDs
    platforms: zod_1.z.array(zod_1.z.string()), // Will be validated with platform codes
    emotionalTags: zod_1.z.array(zod_1.z.string()), // Will be validated with tag IDs
    userRating: zod_1.z.number().min(1).max(10).optional(),
    globalRating: zod_1.z.number().min(1).max(10).optional(),
    playStatus: zod_1.z.enum(['unplayed', 'playing', 'completed', 'paused', 'abandoned']),
    hoursPlayed: zod_1.z.number().min(0).optional(),
    lastPlayed: zod_1.z.date().optional(),
    addedAt: zod_1.z.date(),
    notes: zod_1.z.string().max(1000).optional(),
    isFavorite: zod_1.z.boolean(),
});
// Play status utilities
exports.PLAY_STATUS_TRANSITIONS = {
    'unplayed': { next: ['playing', 'paused'], label: 'Start Playing', color: '#10B981' },
    'playing': { next: ['completed', 'paused', 'abandoned'], label: 'Continue Playing', color: '#059669' },
    'paused': { next: ['playing', 'completed', 'unplayed'], label: 'Resume Playing', color: '#F59E0B' },
    'completed': { next: ['replaying'], label: 'Replay Game', color: '#10B981' },
    'abandoned': { next: ['unplayed'], label: 'Start Fresh', color: '#6B7280' }
};
const getPlayStatusTransition = (from, to) => {
    return exports.PLAY_STATUS_TRANSITIONS[from]?.next?.find(status => status === to) || null;
};
exports.getPlayStatusTransition = getPlayStatusTransition;
const getPlayStatusColor = (status) => {
    return exports.PLAY_STATUS_TRANSITIONS[status]?.color || '#6B7280';
};
exports.getPlayStatusColor = getPlayStatusColor;
const getPlayStatusLabel = (status) => {
    return exports.PLAY_STATUS_TRANSITIONS[status]?.label || status;
};
exports.getPlayStatusLabel = getPlayStatusLabel;
// Game utility functions
const validateGame = (game) => {
    const parsed = exports.GameSchema.parse(game);
    // Convert schema result to Game interface format
    return {
        ...parsed,
        coverImage: parsed.coverImage || '',
        genres: parsed.genres.map((genre) => ({ id: genre, name: genre, color: '#666', subgenres: [] })),
        subgenres: parsed.subgenres.map((subgenre) => ({ id: subgenre, name: subgenre, genre: { id: '', name: '', color: '', subgenres: [] } })),
        platforms: parsed.platforms.map((platform) => {
            const platformCode = platform.toLowerCase();
            let code;
            switch (platformCode) {
                case 'steam':
                    code = types_1.PlatformCode.STEAM;
                    break;
                case 'xbox':
                    code = types_1.PlatformCode.XBOX;
                    break;
                case 'playstation':
                    code = types_1.PlatformCode.PLAYSTATION;
                    break;
                case 'nintendo':
                    code = types_1.PlatformCode.NINTENDO;
                    break;
                case 'epic':
                    code = types_1.PlatformCode.EPIC;
                    break;
                case 'gog':
                    code = types_1.PlatformCode.GOG;
                    break;
                case 'origin':
                    code = types_1.PlatformCode.ORIGIN;
                    break;
                case 'uplay':
                    code = types_1.PlatformCode.UPLAY;
                    break;
                case 'battlenet':
                    code = types_1.PlatformCode.BATTLENET;
                    break;
                case 'discord':
                    code = types_1.PlatformCode.DISCORD;
                    break;
                case 'itch':
                    code = types_1.PlatformCode.ITCH;
                    break;
                case 'humble':
                    code = types_1.PlatformCode.HUMBLE;
                    break;
                default:
                    code = types_1.PlatformCode.CUSTOM;
                    break;
            }
            return { id: platform, name: platform, code, isConnected: false };
        }),
        emotionalTags: parsed.emotionalTags.map((tag) => ({ id: tag, name: tag, color: '#666', category: 'feeling', isCustom: false, games: [] })),
        tags: [],
        moods: [],
        playHistory: [],
        releaseYear: parsed.releaseDate?.getFullYear() || new Date().getFullYear()
    };
};
exports.validateGame = validateGame;
const createGame = (data) => {
    const now = new Date();
    return {
        id: crypto.randomUUID(),
        title: data.title || 'Untitled Game',
        description: data.description,
        backgroundImages: data.backgroundImages,
        coverImage: data.coverImage || '',
        releaseDate: data.releaseDate,
        developer: data.developer,
        publisher: data.publisher,
        genres: data.genres || [],
        subgenres: data.subgenres || [],
        platforms: data.platforms || [],
        emotionalTags: data.emotionalTags || [],
        userRating: data.userRating,
        globalRating: data.globalRating,
        playStatus: data.playStatus || 'unplayed',
        hoursPlayed: data.hoursPlayed,
        lastPlayed: data.lastPlayed,
        addedAt: data.addedAt || now,
        notes: data.notes,
        isFavorite: data.isFavorite || false,
        tags: data.tags || [],
        // Required properties matching Game interface
        moods: data.moods || [],
        playHistory: data.playHistory || [],
        releaseYear: data.releaseYear || new Date().getFullYear(),
        achievements: data.achievements || { unlocked: 0, total: 0 },
        totalPlaytime: data.totalPlaytime,
        averageRating: data.averageRating,
        completionPercentage: data.completionPercentage
    };
};
exports.createGame = createGame;
const updateGamePlayStatus = (game, newStatus) => {
    return {
        ...game,
        playStatus: newStatus,
        lastPlayed: newStatus === 'playing' ? new Date() : game.lastPlayed
    };
};
exports.updateGamePlayStatus = updateGamePlayStatus;
const addGameToLibrary = (game, library) => {
    const newGame = (0, exports.createGame)(game);
    return [...library, newGame];
};
exports.addGameToLibrary = addGameToLibrary;
const removeGameFromLibrary = (gameId, library) => {
    return library.filter(game => game.id !== gameId);
};
exports.removeGameFromLibrary = removeGameFromLibrary;
const getGameById = (gameId, library) => {
    return library.find(game => game.id === gameId);
};
exports.getGameById = getGameById;
const searchGames = (games, query) => {
    const lowercaseQuery = query.toLowerCase();
    return games.filter(game => game.title.toLowerCase().includes(lowercaseQuery) ||
        game.description?.toLowerCase().includes(lowercaseQuery) ||
        game.developer?.toLowerCase().includes(lowercaseQuery) ||
        game.publisher?.toLowerCase().includes(lowercaseQuery) ||
        game.genres.some((genre) => genre.name?.toLowerCase().includes(lowercaseQuery)) ||
        game.subgenres.some((subgenre) => subgenre.name?.toLowerCase().includes(lowercaseQuery)));
};
exports.searchGames = searchGames;
const filterGamesByStatus = (games, status) => {
    return games.filter(game => game.playStatus === status);
};
exports.filterGamesByStatus = filterGamesByStatus;
const filterGamesByPlatform = (games, platformCode) => {
    return games.filter(game => game.platforms.some((platform) => platform.code === platformCode));
};
exports.filterGamesByPlatform = filterGamesByPlatform;
const filterGamesByGenre = (games, genreId) => {
    return games.filter(game => game.genres.some((genre) => genre.id === genreId));
};
exports.filterGamesByGenre = filterGamesByGenre;
const getGameStats = (games) => {
    const totalGames = games.length;
    const playedGames = games.filter(game => game.playStatus !== 'unplayed').length;
    const completedGames = games.filter(game => game.playStatus === 'completed').length;
    const currentlyPlaying = games.filter(game => game.playStatus === 'playing').length;
    const totalHoursPlayed = games.reduce((total, game) => total + (game.hoursPlayed || 0), 0);
    const averageHoursPerGame = totalGames > 0 ? totalHoursPlayed / totalGames : 0;
    return {
        totalGames,
        playedGames,
        completedGames,
        currentlyPlaying,
        totalHoursPlayed,
        averageHoursPerGame,
        completionRate: totalGames > 0 ? (completedGames / playedGames) * 100 : 0
    };
};
exports.getGameStats = getGameStats;
const getRecentGames = (games, limit = 10) => {
    return games
        .filter(game => game.lastPlayed)
        .sort((a, b) => new Date(b.lastPlayed || 0).getTime() - new Date(a.lastPlayed || 0).getTime())
        .slice(0, limit);
};
exports.getRecentGames = getRecentGames;
const getMostPlayedGames = (games, limit = 5) => {
    return games
        .filter(game => game.hoursPlayed && game.hoursPlayed > 0)
        .sort((a, b) => (b.hoursPlayed || 0) - (a.hoursPlayed || 0))
        .slice(0, limit);
};
exports.getMostPlayedGames = getMostPlayedGames;
// Platform validation
const validCodes = [
    types_1.PlatformCode.STEAM, types_1.PlatformCode.XBOX, types_1.PlatformCode.PLAYSTATION, types_1.PlatformCode.NINTENDO,
    types_1.PlatformCode.EPIC, types_1.PlatformCode.GOG, types_1.PlatformCode.ORIGIN, types_1.PlatformCode.UPLAY,
    types_1.PlatformCode.BATTLENET, types_1.PlatformCode.DISCORD, types_1.PlatformCode.ITCH, types_1.PlatformCode.HUMBLE,
    types_1.PlatformCode.CUSTOM
];
const colors = {
    [types_1.PlatformCode.STEAM]: '#1B2838',
    [types_1.PlatformCode.XBOX]: '#107C10',
    [types_1.PlatformCode.PLAYSTATION]: '#003791',
    [types_1.PlatformCode.NINTENDO]: '#E60012',
    [types_1.PlatformCode.EPIC]: '#313131',
    [types_1.PlatformCode.GOG]: '#8B46FF',
    [types_1.PlatformCode.ORIGIN]: '#F56B00',
    [types_1.PlatformCode.UPLAY]: '#00B4D3',
    [types_1.PlatformCode.BATTLENET]: '#1A5CAD',
    [types_1.PlatformCode.DISCORD]: '#5865F2',
    [types_1.PlatformCode.ITCH]: '#FA5C5C',
    [types_1.PlatformCode.HUMBLE]: '#CB772D',
    [types_1.PlatformCode.YOUTUBE]: '#FF0000',
    [types_1.PlatformCode.CUSTOM]: '#6B7280'
};
const names = {
    [types_1.PlatformCode.STEAM]: 'Steam',
    [types_1.PlatformCode.XBOX]: 'Xbox',
    [types_1.PlatformCode.PLAYSTATION]: 'PlayStation',
    [types_1.PlatformCode.NINTENDO]: 'Nintendo',
    [types_1.PlatformCode.EPIC]: 'Epic Games',
    [types_1.PlatformCode.GOG]: 'GOG',
    [types_1.PlatformCode.ORIGIN]: 'Origin',
    [types_1.PlatformCode.UPLAY]: 'Ubisoft Connect',
    [types_1.PlatformCode.BATTLENET]: 'Battle.net',
    [types_1.PlatformCode.DISCORD]: 'Discord',
    [types_1.PlatformCode.ITCH]: 'Itch.io',
    [types_1.PlatformCode.HUMBLE]: 'Humble Bundle',
    [types_1.PlatformCode.YOUTUBE]: 'YouTube',
    [types_1.PlatformCode.CUSTOM]: 'Other'
};
const isValidPlatformCode = (code) => {
    return validCodes.includes(code);
};
exports.isValidPlatformCode = isValidPlatformCode;
const getPlatformColor = (platformCode) => {
    return colors[platformCode] || colors[types_1.PlatformCode.CUSTOM];
};
exports.getPlatformColor = getPlatformColor;
const getPlatformName = (platformCode) => {
    return names[platformCode] || names[types_1.PlatformCode.CUSTOM];
};
exports.getPlatformName = getPlatformName;
// Rating utilities
const validateRating = (rating) => {
    return rating >= 1 && rating <= 10;
};
exports.validateRating = validateRating;
const getRatingColor = (rating) => {
    if (rating >= 8)
        return '#059669'; // Excellent
    if (rating >= 6)
        return '#10B981'; // Great
    if (rating >= 4)
        return '#F59E0B'; // Good
    return '#6B7280'; // Average
};
exports.getRatingColor = getRatingColor;
const getRatingLabel = (rating) => {
    if (rating >= 8)
        return 'Excellent';
    if (rating >= 6)
        return 'Great';
    if (rating >= 4)
        return 'Good';
    return 'Average';
};
exports.getRatingLabel = getRatingLabel;
// Time utilities
const formatPlaytime = (hours) => {
    if (hours < 1)
        return `${Math.round(hours * 60)}m`;
    if (hours < 24)
        return `${Math.round(hours * 10) / 10}h`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}d ${Math.round(remainingHours)}h` : `${days}d`;
};
exports.formatPlaytime = formatPlaytime;
const getRelativeTime = (date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffHours < 1)
        return 'Just now';
    if (diffHours < 24)
        return `${diffHours} hours ago`;
    if (diffDays < 30)
        return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
};
exports.getRelativeTime = getRelativeTime;
// Search and filter utilities
const createSearchFilter = (query) => {
    const lowercaseQuery = query.toLowerCase();
    return (game) => {
        const searchFields = [
            game.title.toLowerCase(),
            game.description?.toLowerCase() || '',
            game.developer?.toLowerCase() || '',
            game.publisher?.toLowerCase() || '',
            ...game.genres.map((genre) => genre.name?.toLowerCase() || ''),
            ...game.subgenres.map((subgenre) => subgenre.name?.toLowerCase() || ''),
            ...game.platforms.map((platform) => platform.name?.toLowerCase() || '')
        ];
        return searchFields.some(field => field.includes(lowercaseQuery));
    };
};
exports.createSearchFilter = createSearchFilter;
// Sorting utilities
const sortGamesByTitle = (games) => {
    return [...games].sort((a, b) => a.title.localeCompare(b.title));
};
exports.sortGamesByTitle = sortGamesByTitle;
const sortGamesByRating = (games) => {
    return [...games].sort((a, b) => (b.userRating || 0) - (a.userRating || 0));
};
exports.sortGamesByRating = sortGamesByRating;
const sortGamesByPlaytime = (games) => {
    return [...games].sort((a, b) => (b.hoursPlayed || 0) - (a.hoursPlayed || 0));
};
exports.sortGamesByPlaytime = sortGamesByPlaytime;
const sortGamesByLastPlayed = (games) => {
    return [...games].sort((a, b) => new Date(b.lastPlayed || 0).getTime() - new Date(a.lastPlayed || 0).getTime());
};
exports.sortGamesByLastPlayed = sortGamesByLastPlayed;
// Game session utilities
const createGameSession = (gameId, platformCode) => {
    return {
        id: crypto.randomUUID(),
        gameId,
        platform: { code: platformCode, name: (0, exports.getPlatformName)(platformCode) },
        startTime: new Date(),
        endTime: undefined,
        duration: undefined,
        sessionType: 'main'
    };
};
exports.createGameSession = createGameSession;
const endGameSession = (session, endTime) => {
    const duration = endTime ?
        Math.floor((endTime.getTime() - new Date(session.startTime).getTime()) / (1000 * 60)) :
        undefined;
    return {
        ...session,
        endTime,
        duration
    };
};
exports.endGameSession = endGameSession;
// Game library management
const getLibraryStats = (games) => {
    const stats = (0, exports.getGameStats)(games);
    const genreDistribution = games.reduce((acc, game) => {
        game.genres.forEach((genre) => {
            const genreName = genre.name || 'Unknown';
            acc[genreName] = (acc[genreName] || 0) + 1;
        });
        return acc;
    }, {});
    return {
        totalGames: stats.totalGames,
        playedGames: stats.playedGames,
        completedGames: stats.completedGames,
        currentlyPlaying: stats.currentlyPlaying,
        totalHoursPlayed: stats.totalHoursPlayed,
        averageHoursPerGame: stats.averageHoursPerGame,
        completionRate: stats.completionRate,
        genreDistribution
    };
};
exports.getLibraryStats = getLibraryStats;
const getWishlistStats = (games) => {
    const wishlistGames = games.filter(game => game.playStatus === 'unplayed');
    const totalWishlistGames = wishlistGames.length;
    const averageRating = wishlistGames.reduce((sum, game) => sum + (game.userRating || 0), 0) / totalWishlistGames;
    return {
        totalWishlistGames,
        averageRating
    };
};
exports.getWishlistStats = getWishlistStats;
// Validation rules
exports.GAME_VALIDATION_RULES = {
    TITLE_MIN_LENGTH: 1,
    TITLE_MAX_LENGTH: 200,
    DESCRIPTION_MAX_LENGTH: 2000,
    RATING_MIN: 1,
    RATING_MAX: 10,
    NOTES_MAX_LENGTH: 1000,
    MAX_BACKGROUND_IMAGES: 10,
    MAX_GENRES_PER_GAME: 5,
    MAX_SUBGENRES_PER_GAME: 10,
    MAX_PLATFORMS_PER_GAME: 5,
    MAX_EMOTIONAL_TAGS_PER_GAME: 20
};
//# sourceMappingURL=game.js.map