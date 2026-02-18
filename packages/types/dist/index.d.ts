import { PlatformCode } from './platforms';
import type { User as CanonicalUser } from '../../shared/src/models/user';
import type { UserIntegration as CanonicalUserIntegration } from '../../shared/src/models/integration';
export { PlatformCode };
export type PlatformCodeType = PlatformCode;
export type PlayStatus = 'unplayed' | 'playing' | 'completed' | 'paused' | 'abandoned' | 'backlog';
export type TagCategory = 'memory' | 'feeling' | 'occasion' | 'social';
export type SessionType = 'main' | 'break' | 'social' | 'achievement';
export interface Game {
    id: string;
    title: string;
    description?: string;
    backgroundImages?: string[];
    coverImage: string;
    releaseDate?: Date;
    developer?: string;
    publisher?: string;
    genres: Genre[];
    subgenres: Subgenre[];
    platforms: Platform[];
    emotionalTags: EmotionalTag[];
    userRating?: number;
    globalRating?: number;
    playStatus: PlayStatus;
    hoursPlayed?: number;
    lastPlayed?: Date;
    addedAt: Date;
    notes?: string;
    isFavorite: boolean;
    tags?: string[];
    releaseYear: number;
    achievements?: {
        unlocked: number;
        total: number;
    };
    totalPlaytime?: number;
    averageRating?: number;
    completionPercentage?: number;
    launcherId?: string;
    appId?: number;
    lastLocalPlayedAt?: string | null;
    localSessionMinutes?: number;
    localSessionCount?: number;
}
export interface Genre {
    id: string;
    name: string;
    description?: string;
    color: string;
    icon?: string;
    subgenres: Subgenre[];
}
export interface Subgenre {
    id: string;
    name: string;
    description?: string;
    genre: Genre;
    color?: string;
    icon?: string;
}
export interface Mood {
    id: string;
    name: string;
    emoji: string;
    icon: string;
    color: string;
    description: string;
    intensity: number;
    associatedGenres: Genre[];
    timeOfDay: ('morning' | 'afternoon' | 'evening' | 'night')[];
    energyLevel: number;
    socialPreference: 'solo' | 'coop' | 'competitive' | 'any';
    gradient?: string;
}
export interface Platform {
    id: string;
    name: string;
    code: PlatformCodeType;
    logo?: string;
    apiEndpoint?: string;
    isConnected: boolean;
    userId?: string;
    lastSync?: Date;
}
export interface UserPreferences {
    id: string;
    userId: string;
    favoriteGenres: Genre[];
    playStyle: {
        competitive: number;
        cooperative: number;
        casual: number;
        hardcore: number;
        explorer: number;
        completionist: number;
    };
    moodPreferences: MoodPreference[];
    notificationSettings: {
        achievements: boolean;
        friendActivity: boolean;
        gameRecommendations: boolean;
        platformUpdates: boolean;
    };
    privacySettings: {
        profileVisibility: 'public' | 'friends' | 'private';
        activitySharing: boolean;
        gameLibraryVisibility: 'public' | 'friends' | 'private';
    };
}
export interface MoodPreference {
    mood: Mood;
    gameTypes: string[];
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}
/**
 * @deprecated Use canonical User from @gamepilot/shared/models/user instead
 * This interface is replaced by the canonical User model
 */
export interface UserProfile {
    id: string;
    username: string;
    email: string;
    avatar?: string;
    displayName?: string;
    bio?: string;
    location?: string;
    timezone: string;
    createdAt: Date;
    updatedAt: Date;
    preferences: UserPreferences;
    platforms: Platform[];
    games: Game[];
    favoriteGenres: Genre[];
    currentMood?: Mood;
    totalPlaytime: number;
    achievementCount: number;
}
export interface EmotionalTag {
    id: string;
    name: string;
    description?: string;
    color: string;
    icon?: string;
    category: TagCategory;
    isCustom: boolean;
    createdBy?: string;
    games: Game[];
}
export interface PlayHistory {
    id: string;
    userId: string;
    gameId: string;
    platform: Platform;
    startTime: Date;
    endTime?: Date;
    duration?: number;
    sessionType: SessionType;
    mood?: Mood;
    notes?: string;
    achievements?: Achievement[];
}
export interface Achievement {
    id: string;
    gameId: string;
    platformCode: PlatformCodeType;
    title: string;
    description: string;
    icon?: string;
    unlockedAt?: Date;
    rarity?: number;
    points?: number;
}
/**
 * @deprecated Use canonical UserIntegration from @gamepilot/shared/models/integration instead
 * This interface is replaced by the canonical UserIntegration model
 */
export interface Integration {
    id: string;
    platform: string;
    type: 'youtube' | 'discord' | 'spotify' | 'twitch';
    connected: boolean;
    userId?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
    lastSync?: Date;
}
export interface Activity {
    id: string;
    userId: string;
    type: 'achievement' | 'session_start' | 'session_end' | 'game_added' | 'integration_connected';
    gameId?: string;
    platform?: string;
    data: Record<string, any>;
    timestamp: Date;
}
export interface Recommendation {
    game: Game;
    reason: string;
    score: number;
    type: 'mood' | 'genre' | 'playstyle' | 'social' | 'trending';
}
export interface MoodProfile {
    mood: string;
    score: number;
    description: string;
    color: string;
    games: string[];
    timestamp: Date;
}
export interface GenreProfile {
    genre: string;
    score: number;
    description: string;
    games: string[];
    timestamp: Date;
}
export interface PersonalityProfile {
    type: string;
    description: string;
    traits: string[];
    games: string[];
    timestamp: Date;
}
/**
 * @deprecated Use canonical User from @gamepilot/shared/models/user instead
 * This re-export maintains backward compatibility during migration
 */
export type User = CanonicalUser;
/**
 * @deprecated Use canonical UserIntegration from @gamepilot/shared/models/integration instead
 * This re-export maintains backward compatibility during migration
 */
export type UserIntegration = CanonicalUserIntegration;
