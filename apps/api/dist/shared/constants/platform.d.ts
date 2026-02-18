export declare const PLATFORMS: {
    readonly STEAM: "steam";
    readonly XBOX: "xbox";
    readonly PLAYSTATION: "playstation";
    readonly NINTENDO: "nintendo";
    readonly EPIC: "epic";
    readonly GOG: "gog";
    readonly OTHER: "other";
};
export declare const PLAY_STATUS: {
    readonly UNPLAYED: "unplayed";
    readonly PLAYING: "playing";
    readonly COMPLETED: "completed";
    readonly PAUSED: "paused";
    readonly ABANDONED: "abandoned";
};
export declare const TAG_CATEGORIES: {
    readonly MEMORY: "memory";
    readonly FEELING: "feeling";
    readonly OCCASION: "occasion";
    readonly SOCIAL: "social";
};
export declare const SESSION_TYPES: {
    readonly MAIN: "main";
    readonly BREAK: "break";
    readonly SOCIAL: "social";
    readonly ACHIEVEMENT: "achievement";
};
export declare const INTEGRATION_TYPES: {
    readonly YOUTUBE: "youtube";
    readonly DISCORD: "discord";
    readonly SPOTIFY: "spotify";
    readonly TWITCH: "twitch";
};
export declare const PRIVACY_LEVELS: {
    readonly PUBLIC: "public";
    readonly FRIENDS: "friends";
    readonly PRIVATE: "private";
};
export declare const SOCIAL_PREFERENCES: {
    readonly SOLO: "solo";
    readonly COOP: "coop";
    readonly COMPETITIVE: "competitive";
    readonly ANY: "any";
};
export declare const TIME_OF_DAY: {
    readonly MORNING: "morning";
    readonly AFTERNOON: "afternoon";
    readonly EVENING: "evening";
    readonly NIGHT: "night";
};
export declare const DEFAULT_MOODS: readonly [{
    readonly id: "energetic";
    readonly name: "Energetic";
    readonly color: "#FF6B6B";
    readonly gradient: "#FF8E53";
    readonly icon: "⚡";
    readonly energyLevel: 9;
    readonly socialPreference: "any";
    readonly timeOfDay: readonly ["morning", "afternoon"];
    readonly description: "Ready for high-energy gaming sessions";
}, {
    readonly id: "relaxed";
    readonly name: "Relaxed";
    readonly color: "#4ECDC4";
    readonly gradient: "#44A08D";
    readonly icon: "🌊";
    readonly energyLevel: 3;
    readonly socialPreference: "solo";
    readonly timeOfDay: readonly ["evening", "night"];
    readonly description: "Looking for calm, low-stress gaming";
}, {
    readonly id: "focused";
    readonly name: "Focused";
    readonly color: "#95E77E";
    readonly gradient: "#56AB2F";
    readonly icon: "🎯";
    readonly energyLevel: 7;
    readonly socialPreference: "solo";
    readonly timeOfDay: readonly ["morning", "afternoon"];
    readonly description: "Ready for deep, immersive gameplay";
}, {
    readonly id: "social";
    readonly name: "Social";
    readonly color: "#FFE66D";
    readonly gradient: "#F7971E";
    readonly icon: "👥";
    readonly energyLevel: 6;
    readonly socialPreference: "coop";
    readonly timeOfDay: readonly ["afternoon", "evening"];
    readonly description: "Looking to play with friends";
}, {
    readonly id: "nostalgic";
    readonly name: "Nostalgic";
    readonly color: "#C9B1FF";
    readonly gradient: "#8E2DE2";
    readonly icon: "🕰️";
    readonly energyLevel: 4;
    readonly socialPreference: "solo";
    readonly timeOfDay: readonly ["evening", "night"];
    readonly description: "In the mood for classic favorites";
}];
export declare const DEFAULT_EMOTIONAL_TAGS: readonly [{
    readonly id: "childhood-favorite";
    readonly name: "Childhood Favorite";
    readonly color: "#FFB6C1";
    readonly icon: "🧸";
    readonly category: "memory";
    readonly description: "Games from my childhood";
}, {
    readonly id: "comfort-game";
    readonly name: "Comfort Game";
    readonly color: "#98D8C8";
    readonly icon: "🛋️";
    readonly category: "feeling";
    readonly description: "Games I return to for comfort";
}, {
    readonly id: "rainy-day";
    readonly name: "Rainy Day";
    readonly color: "#6C5CE7";
    readonly icon: "🌧️";
    readonly category: "occasion";
    readonly description: "Perfect for rainy weather";
}, {
    readonly id: "late-night";
    readonly name: "Late Night";
    readonly color: "#2C3E50";
    readonly icon: "🌙";
    readonly category: "occasion";
    readonly description: "Great for late night sessions";
}, {
    readonly id: "friend-favorite";
    readonly name: "Friend Favorite";
    readonly color: "#E17055";
    readonly icon: "👫";
    readonly category: "social";
    readonly description: "Games loved by my friends";
}];
export declare const API_ENDPOINTS: {
    readonly GAMES: "/api/games";
    readonly USERS: "/api/users";
    readonly PLATFORMS: "/api/platforms";
    readonly MOODS: "/api/moods";
    readonly EMOTIONAL_TAGS: "/api/emotional-tags";
    readonly PLAY_HISTORY: "/api/play-history";
    readonly ACHIEVEMENTS: "/api/achievements";
    readonly INTEGRATIONS: "/api/integrations";
    readonly ACTIVITIES: "/api/activities";
};
export declare const VALIDATION_RULES: {
    readonly USERNAME_MIN_LENGTH: 3;
    readonly USERNAME_MAX_LENGTH: 30;
    readonly GAME_TITLE_MAX_LENGTH: 200;
    readonly GAME_DESCRIPTION_MAX_LENGTH: 2000;
    readonly TAG_NAME_MAX_LENGTH: 50;
    readonly NOTES_MAX_LENGTH: 1000;
    readonly BIO_MAX_LENGTH: 500;
    readonly RATING_MIN: 1;
    readonly RATING_MAX: 10;
    readonly ENERGY_LEVEL_MIN: 1;
    readonly ENERGY_LEVEL_MAX: 10;
};
//# sourceMappingURL=platform.d.ts.map