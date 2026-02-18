"use strict";
// Platform constants for GamePilot
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALIDATION_RULES = exports.API_ENDPOINTS = exports.DEFAULT_EMOTIONAL_TAGS = exports.DEFAULT_MOODS = exports.TIME_OF_DAY = exports.SOCIAL_PREFERENCES = exports.PRIVACY_LEVELS = exports.INTEGRATION_TYPES = exports.SESSION_TYPES = exports.TAG_CATEGORIES = exports.PLAY_STATUS = exports.PLATFORMS = void 0;
exports.PLATFORMS = {
    STEAM: 'steam',
    XBOX: 'xbox',
    PLAYSTATION: 'playstation',
    NINTENDO: 'nintendo',
    EPIC: 'epic',
    GOG: 'gog',
    OTHER: 'other',
};
exports.PLAY_STATUS = {
    UNPLAYED: 'unplayed',
    PLAYING: 'playing',
    COMPLETED: 'completed',
    PAUSED: 'paused',
    ABANDONED: 'abandoned',
};
exports.TAG_CATEGORIES = {
    MEMORY: 'memory',
    FEELING: 'feeling',
    OCCASION: 'occasion',
    SOCIAL: 'social',
};
exports.SESSION_TYPES = {
    MAIN: 'main',
    BREAK: 'break',
    SOCIAL: 'social',
    ACHIEVEMENT: 'achievement',
};
exports.INTEGRATION_TYPES = {
    YOUTUBE: 'youtube',
    DISCORD: 'discord',
    SPOTIFY: 'spotify',
    TWITCH: 'twitch',
};
exports.PRIVACY_LEVELS = {
    PUBLIC: 'public',
    FRIENDS: 'friends',
    PRIVATE: 'private',
};
exports.SOCIAL_PREFERENCES = {
    SOLO: 'solo',
    COOP: 'coop',
    COMPETITIVE: 'competitive',
    ANY: 'any',
};
exports.TIME_OF_DAY = {
    MORNING: 'morning',
    AFTERNOON: 'afternoon',
    EVENING: 'evening',
    NIGHT: 'night',
};
// Default moods for the platform
exports.DEFAULT_MOODS = [
    {
        id: 'energetic',
        name: 'Energetic',
        color: '#FF6B6B',
        gradient: '#FF8E53',
        icon: '⚡',
        energyLevel: 9,
        socialPreference: 'any',
        timeOfDay: ['morning', 'afternoon'],
        description: 'Ready for high-energy gaming sessions',
    },
    {
        id: 'relaxed',
        name: 'Relaxed',
        color: '#4ECDC4',
        gradient: '#44A08D',
        icon: '🌊',
        energyLevel: 3,
        socialPreference: 'solo',
        timeOfDay: ['evening', 'night'],
        description: 'Looking for calm, low-stress gaming',
    },
    {
        id: 'focused',
        name: 'Focused',
        color: '#95E77E',
        gradient: '#56AB2F',
        icon: '🎯',
        energyLevel: 7,
        socialPreference: 'solo',
        timeOfDay: ['morning', 'afternoon'],
        description: 'Ready for deep, immersive gameplay',
    },
    {
        id: 'social',
        name: 'Social',
        color: '#FFE66D',
        gradient: '#F7971E',
        icon: '👥',
        energyLevel: 6,
        socialPreference: 'coop',
        timeOfDay: ['afternoon', 'evening'],
        description: 'Looking to play with friends',
    },
    {
        id: 'nostalgic',
        name: 'Nostalgic',
        color: '#C9B1FF',
        gradient: '#8E2DE2',
        icon: '🕰️',
        energyLevel: 4,
        socialPreference: 'solo',
        timeOfDay: ['evening', 'night'],
        description: 'In the mood for classic favorites',
    },
];
// Default emotional tags
exports.DEFAULT_EMOTIONAL_TAGS = [
    {
        id: 'childhood-favorite',
        name: 'Childhood Favorite',
        color: '#FFB6C1',
        icon: '🧸',
        category: 'memory',
        description: 'Games from my childhood',
    },
    {
        id: 'comfort-game',
        name: 'Comfort Game',
        color: '#98D8C8',
        icon: '🛋️',
        category: 'feeling',
        description: 'Games I return to for comfort',
    },
    {
        id: 'rainy-day',
        name: 'Rainy Day',
        color: '#6C5CE7',
        icon: '🌧️',
        category: 'occasion',
        description: 'Perfect for rainy weather',
    },
    {
        id: 'late-night',
        name: 'Late Night',
        color: '#2C3E50',
        icon: '🌙',
        category: 'occasion',
        description: 'Great for late night sessions',
    },
    {
        id: 'friend-favorite',
        name: 'Friend Favorite',
        color: '#E17055',
        icon: '👫',
        category: 'social',
        description: 'Games loved by my friends',
    },
];
// API endpoints
exports.API_ENDPOINTS = {
    GAMES: '/api/games',
    USERS: '/api/users',
    PLATFORMS: '/api/platforms',
    MOODS: '/api/moods',
    EMOTIONAL_TAGS: '/api/emotional-tags',
    PLAY_HISTORY: '/api/play-history',
    ACHIEVEMENTS: '/api/achievements',
    INTEGRATIONS: '/api/integrations',
    ACTIVITIES: '/api/activities',
};
// Validation rules
exports.VALIDATION_RULES = {
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 30,
    GAME_TITLE_MAX_LENGTH: 200,
    GAME_DESCRIPTION_MAX_LENGTH: 2000,
    TAG_NAME_MAX_LENGTH: 50,
    NOTES_MAX_LENGTH: 1000,
    BIO_MAX_LENGTH: 500,
    RATING_MIN: 1,
    RATING_MAX: 10,
    ENERGY_LEVEL_MIN: 1,
    ENERGY_LEVEL_MAX: 10,
};
//# sourceMappingURL=platform.js.map