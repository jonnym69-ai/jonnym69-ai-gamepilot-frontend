"use strict";
/**
 * Data Pipeline Normalizer
 * * Processes raw Steam API responses and normalizes them for our database schema
 * Handles genre mapping, mood assignment, and data validation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CANONICAL_MOODS = exports.CANONICAL_GENRES = void 0;
exports.normalizeTimeKey = normalizeTimeKey;
exports.normalizeMood = normalizeMood;
exports.normalizeGenre = normalizeGenre;
exports.normalizeGamesArray = normalizeGamesArray;
exports.normalizeSteamGames = normalizeSteamGames;
exports.normalizeGenres = normalizeGenres;
exports.normalizePlatforms = normalizePlatforms;
const static_data_1 = require("@gamepilot/static-data");
const shared_1 = require("@gamepilot/shared");
// --- 2. Named Exports (These fix the SyntaxError) ---
exports.CANONICAL_GENRES = [
    'Action', 'RPG', 'Strategy', 'Adventure', 'Simulation',
    'Puzzle', 'Sports', 'Racing', 'Horror', 'Indie', 'FPS', 'Multiplayer'
];
exports.CANONICAL_MOODS = [
    'intense', 'strategic', 'relaxing', 'creative', 'high-energy',
    'atmospheric', 'challenging', 'story-rich', 'competitive', 'social',
    'experimental', 'mindful', 'nostalgic', 'gritty', 'surreal', 'action-packed'
];
function normalizeTimeKey(time) {
    if (!time)
        return '60';
    const t = time.toLowerCase();
    if (t === 'short' || t === '15' || t === '30')
        return '30';
    if (t === 'medium' || t === '60' || t === '90')
        return '60';
    if (t === 'long' || t === '120' || t === '180')
        return '120';
    return t.replace(/\D/g, '') || '60';
}
function normalizeMood(mood) {
    return (mood || '').toLowerCase();
}
function normalizeGenre(genre) {
    if (!genre)
        return '';
    return genre.toLowerCase().trim();
}
function normalizeGamesArray(games) {
    if (!Array.isArray(games))
        return [];
    return games.map(g => ({
        ...g,
        moods: Array.isArray(g.moods) ? g.moods : [],
        genres: Array.isArray(g.genres) ? g.genres : []
    }));
}
// --- 3. Steam API Logic ---
function normalizeSteamGames(steamGames) {
    return steamGames.map(game => ({
        id: `steam-${game.appid}`,
        title: game.name || 'Unknown Game',
        description: game.detailed_description || game.short_description || '',
        coverImage: game.img_icon_url || game.img_logo_url || '',
        appId: game.appid,
        genres: normalizeGenres(game),
        platforms: normalizePlatforms(game),
        moods: [],
        emotionalTags: [],
        playStatus: 'unplayed',
        hoursPlayed: Math.floor((game.playtime_forever || 0) / 60),
        userRating: 0,
        globalRating: 0,
        lastPlayed: game.rtime_last_played ? new Date(game.rtime_last_played * 1000) : undefined,
        isFavorite: false,
        notes: '',
        releaseYear: game.release_date?.date ? new Date(game.release_date.date).getFullYear() : undefined,
        addedAt: new Date()
    }));
}
function normalizeGenres(game) {
    if (!game.genres || !Array.isArray(game.genres))
        return [];
    return game.genres.map((genre) => {
        let genreId;
        let genreName;
        if (typeof genre.id === 'number') {
            genreId = genre.id.toString();
            genreName = getGenreNameById(genreId) || `Genre ${genreId}`;
        }
        else {
            genreName = genre.description || genre.name || 'Unknown Genre';
            genreId = genreName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        }
        return { id: genreId, name: genreName, color: getGenreColor(genreName), subgenres: [] };
    });
}
function getGenreColor(genreName) {
    const genre = static_data_1.GENRES.find(g => g.id === genreName);
    return genre?.color || '#6B728';
}
function getGenreNameById(genreId) {
    const genreIdMap = {
        '0': 'action', '1': 'strategy', '2': 'rpg', '3': 'simulation',
        '4': 'sports', '5': 'racing', '6': 'adventure', '7': 'indie'
    };
    return genreIdMap[genreId];
}
function normalizePlatforms(game) {
    return [{
            id: 'steam',
            name: 'Steam',
            code: shared_1.PlatformCode.STEAM,
            isConnected: true
        }];
}
// --- 4. Default Export (for backward compatibility) ---
exports.default = {
    normalizeSteamGames,
    normalizeGenres,
    normalizePlatforms,
    normalizeTimeKey,
    normalizeMood,
    normalizeGenre,
    normalizeGamesArray,
    CANONICAL_GENRES: exports.CANONICAL_GENRES,
    CANONICAL_MOODS: exports.CANONICAL_MOODS
};
//# sourceMappingURL=dataPipelineNormalizer.js.map