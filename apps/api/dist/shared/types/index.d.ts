export declare enum PlatformCode {
    STEAM = "steam",
    XBOX = "xbox",
    PLAYSTATION = "playstation",
    NINTENDO = "nintendo",
    EPIC = "epic",
    GOG = "gog",
    ORIGIN = "origin",
    UPLAY = "uplay",
    BATTLENET = "battlenet",
    DISCORD = "discord",
    ITCH = "itch",
    HUMBLE = "humble",
    YOUTUBE = "youtube",
    CUSTOM = "custom"
}
export type PlayStatus = 'unplayed' | 'playing' | 'completed' | 'paused' | 'abandoned';
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
    tags: string[];
    moods: string[];
    playHistory: PlayHistory[];
    releaseYear: number;
    achievements?: {
        unlocked: number;
        total: number;
    };
    totalPlaytime?: number;
    averageRating?: number;
    completionPercentage?: number;
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
    description?: string;
    color: string;
    gradient?: string;
    icon?: string;
    associatedGenres: Genre[];
    timeOfDay: ('morning' | 'afternoon' | 'evening' | 'night')[];
    energyLevel: number;
    socialPreference: 'solo' | 'coop' | 'competitive' | 'any';
}
export interface Platform {
    id: string;
    name: string;
    code: PlatformCode;
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
    birthday?: string;
    website?: string;
    discordTag?: string;
    steamProfile?: string;
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
    platformCode: PlatformCode;
    title: string;
    description: string;
    icon?: string;
    unlockedAt?: Date;
    rarity?: number;
    points?: number;
}
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
//# sourceMappingURL=index.d.ts.map