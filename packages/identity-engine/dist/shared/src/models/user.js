"use strict";
// Canonical User model for GamePilot platform
// This model unifies all User interfaces across the monorepo
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoodType = exports.PlaystyleArchetypeType = void 0;
exports.isValidUser = isValidUser;
exports.isValidGamingProfile = isValidGamingProfile;
exports.isValidPrivacySettings = isValidPrivacySettings;
exports.isValidPreferences = isValidPreferences;
exports.isValidSocialSettings = isValidSocialSettings;
exports.isValidPlaystyleArchetype = isValidPlaystyleArchetype;
exports.isValidMoodProfile = isValidMoodProfile;
exports.isValidUserMoodEntry = isValidUserMoodEntry;
exports.createDefaultUser = createDefaultUser;
// Enums for type safety
var PlaystyleArchetypeType;
(function (PlaystyleArchetypeType) {
    PlaystyleArchetypeType["EXPLORER"] = "explorer";
    PlaystyleArchetypeType["ACHIEVER"] = "achiever";
    PlaystyleArchetypeType["STORYTELLER"] = "storyteller";
    PlaystyleArchetypeType["COMPETITOR"] = "competitor";
    PlaystyleArchetypeType["CREATOR"] = "creator";
    PlaystyleArchetypeType["SOCIALIZER"] = "socializer";
})(PlaystyleArchetypeType || (exports.PlaystyleArchetypeType = PlaystyleArchetypeType = {}));
var MoodType;
(function (MoodType) {
    MoodType["NEUTRAL"] = "neutral";
    MoodType["COMPETITIVE"] = "competitive";
    MoodType["RELAXED"] = "relaxed";
    MoodType["FOCUSED"] = "focused";
    MoodType["SOCIAL"] = "social";
    MoodType["CREATIVE"] = "creative";
    MoodType["ADVENTUROUS"] = "adventurous";
    MoodType["STRATEGIC"] = "strategic";
})(MoodType || (exports.MoodType = MoodType = {}));
// Type guards and utilities
function isValidUser(user) {
    return (user &&
        typeof user.id === 'string' &&
        typeof user.email === 'string' &&
        typeof user.username === 'string' &&
        typeof user.displayName === 'string' &&
        typeof user.timezone === 'string' &&
        user.createdAt instanceof Date &&
        user.updatedAt instanceof Date &&
        isValidGamingProfile(user.gamingProfile) &&
        Array.isArray(user.integrations) &&
        isValidPrivacySettings(user.privacy) &&
        isValidPreferences(user.preferences) &&
        isValidSocialSettings(user.social));
}
function isValidGamingProfile(profile) {
    return (profile &&
        Array.isArray(profile.primaryPlatforms) &&
        typeof profile.genreAffinities === 'object' &&
        Array.isArray(profile.playstyleArchetypes) &&
        profile.moodProfile &&
        typeof profile.totalPlaytime === 'number' &&
        typeof profile.gamesPlayed === 'number' &&
        typeof profile.gamesCompleted === 'number' &&
        typeof profile.achievementsCount === 'number' &&
        typeof profile.averageRating === 'number' &&
        typeof profile.currentStreak === 'number' &&
        typeof profile.longestStreak === 'number' &&
        Array.isArray(profile.favoriteGames));
}
function isValidPrivacySettings(privacy) {
    return (privacy &&
        ['public', 'friends', 'private'].includes(privacy.profileVisibility) &&
        typeof privacy.sharePlaytime === 'boolean' &&
        typeof privacy.shareAchievements === 'boolean' &&
        typeof privacy.shareGameLibrary === 'boolean' &&
        typeof privacy.allowFriendRequests === 'boolean' &&
        typeof privacy.showOnlineStatus === 'boolean');
}
function isValidPreferences(preferences) {
    return (preferences &&
        ['dark', 'light', 'auto'].includes(preferences.theme) &&
        typeof preferences.language === 'string' &&
        preferences.notifications &&
        typeof preferences.notifications.email === 'boolean' &&
        typeof preferences.notifications.push === 'boolean' &&
        typeof preferences.notifications.achievements === 'boolean' &&
        typeof preferences.notifications.recommendations === 'boolean' &&
        typeof preferences.notifications.friendActivity === 'boolean' &&
        typeof preferences.notifications.platformUpdates === 'boolean' &&
        preferences.display &&
        typeof preferences.display.compactMode === 'boolean' &&
        typeof preferences.display.showGameCovers === 'boolean' &&
        typeof preferences.display.animateTransitions === 'boolean' &&
        typeof preferences.display.showRatings === 'boolean');
}
function isValidSocialSettings(social) {
    return (social &&
        Array.isArray(social.friends) &&
        Array.isArray(social.blockedUsers) &&
        Array.isArray(social.favoriteGenres) &&
        Array.isArray(social.customTags));
}
function isValidPlaystyleArchetype(archetype) {
    return (archetype &&
        typeof archetype.id === 'string' &&
        typeof archetype.name === 'string' &&
        typeof archetype.description === 'string' &&
        typeof archetype.icon === 'string' &&
        typeof archetype.color === 'string' &&
        Array.isArray(archetype.traits) &&
        typeof archetype.score === 'number' &&
        archetype.score >= 0 && archetype.score <= 100);
}
function isValidMoodProfile(moodProfile) {
    return (moodProfile &&
        Array.isArray(moodProfile.moodHistory) &&
        Array.isArray(moodProfile.moodTriggers) &&
        typeof moodProfile.moodPreferences === 'object');
}
function isValidUserMoodEntry(entry) {
    return (entry &&
        typeof entry.moodId === 'string' &&
        typeof entry.intensity === 'number' &&
        entry.intensity >= 1 && entry.intensity <= 10 &&
        entry.timestamp instanceof Date &&
        (typeof entry.context === 'string' || entry.context === undefined) &&
        (typeof entry.gameId === 'string' || entry.gameId === undefined));
}
function createDefaultUser(userData) {
    return {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        displayName: userData.displayName || userData.username,
        timezone: userData.timezone || 'UTC',
        createdAt: new Date(),
        updatedAt: new Date(),
        gamingProfile: {
            primaryPlatforms: [],
            genreAffinities: {},
            playstyleArchetypes: [],
            moodProfile: {
                currentMood: undefined,
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
            shareGameLibrary: false,
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
    };
}
