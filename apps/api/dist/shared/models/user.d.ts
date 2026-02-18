import type { PlatformCode } from '../types';
import type { GenreId, MoodId } from '@gamepilot/static-data';
import type { UserIntegration } from './integration';
export interface User {
    id: string;
    email: string;
    username: string;
    displayName: string;
    avatar?: string;
    bio?: string;
    location?: string;
    website?: string;
    timezone: string;
    birthday?: string;
    discordTag?: string;
    steamProfile?: string;
    createdAt: Date;
    updatedAt: Date;
    lastActive?: Date;
    gamingProfile: {
        primaryPlatforms: PlatformCode[];
        genreAffinities: Record<GenreId, number>;
        playstyleArchetypes: PlaystyleArchetype[];
        moodProfile: MoodProfile;
        totalPlaytime: number;
        gamesPlayed: number;
        gamesCompleted: number;
        achievementsCount: number;
        averageRating: number;
        currentStreak: number;
        longestStreak: number;
        favoriteGames: string[];
    };
    integrations: UserIntegration[];
    privacy: {
        profileVisibility: 'public' | 'friends' | 'private';
        sharePlaytime: boolean;
        shareAchievements: boolean;
        shareGameLibrary: boolean;
        allowFriendRequests: boolean;
        showOnlineStatus: boolean;
    };
    preferences: {
        theme: 'dark' | 'light' | 'auto';
        language: string;
        notifications: {
            email: boolean;
            push: boolean;
            achievements: boolean;
            recommendations: boolean;
            friendActivity: boolean;
            platformUpdates: boolean;
        };
        display: {
            compactMode: boolean;
            showGameCovers: boolean;
            animateTransitions: boolean;
            showRatings: boolean;
        };
    };
    social: {
        friends: string[];
        blockedUsers: string[];
        favoriteGenres: GenreId[];
        customTags: string[];
    };
    customFields?: CustomField[];
}
export interface PlaystyleArchetype {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    traits: string[];
    score: number;
}
export interface MoodProfile {
    currentMood?: MoodId;
    moodHistory: UserMoodEntry[];
    moodTriggers: string[];
    moodPreferences: Record<MoodId, {
        preference: number;
        frequency: number;
        lastExperienced?: Date;
    }>;
}
export interface UserMoodEntry {
    moodId: MoodId;
    intensity: number;
    timestamp: Date;
    context?: string;
    gameId?: string;
}
export interface CustomField {
    id: string;
    name: string;
    value: string;
    type: 'text' | 'email' | 'url' | 'textarea';
    isPublic: boolean;
    order: number;
}
export declare enum PlaystyleArchetypeType {
    EXPLORER = "explorer",
    ACHIEVER = "achiever",
    STORYTELLER = "storyteller",
    COMPETITOR = "competitor",
    CREATOR = "creator",
    SOCIALIZER = "socializer"
}
export declare enum MoodType {
    NEUTRAL = "neutral",
    COMPETITIVE = "competitive",
    RELAXED = "relaxed",
    FOCUSED = "focused",
    SOCIAL = "social",
    CREATIVE = "creative",
    ADVENTUROUS = "adventurous",
    STRATEGIC = "strategic"
}
export type CreateUserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'lastActive' | 'gamingProfile' | 'integrations'> & {
    gamingProfile: Partial<User['gamingProfile']>;
    integrations: UserIntegration[];
};
export type UpdateUserInput = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>;
export type PublicUserProfile = Pick<User, 'id' | 'username' | 'displayName' | 'avatar' | 'bio' | 'gamingProfile'> & {
    gamingProfile: Pick<User['gamingProfile'], 'primaryPlatforms' | 'genreAffinities' | 'playstyleArchetypes' | 'totalPlaytime' | 'gamesPlayed' | 'achievementsCount'>;
};
export declare function isValidUser(user: any): user is User;
export declare function isValidGamingProfile(profile: any): boolean;
export declare function isValidPrivacySettings(privacy: any): boolean;
export declare function isValidPreferences(preferences: any): boolean;
export declare function isValidSocialSettings(social: any): boolean;
export declare function isValidPlaystyleArchetype(archetype: any): boolean;
export declare function isValidMoodProfile(moodProfile: any): boolean;
export declare function isValidUserMoodEntry(entry: any): boolean;
export declare function createDefaultUser(userData: {
    id: string;
    email: string;
    username: string;
    displayName?: string;
    timezone?: string;
}): User;
//# sourceMappingURL=user.d.ts.map