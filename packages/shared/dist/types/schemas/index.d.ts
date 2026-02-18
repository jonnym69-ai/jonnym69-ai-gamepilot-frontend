import { z } from 'zod';
export declare const PlatformCodeSchema: z.ZodEnum<["steam", "xbox", "playstation", "nintendo", "epic", "gog", "other"]>;
export declare const PlayStatusSchema: z.ZodEnum<["unplayed", "playing", "completed", "paused", "abandoned"]>;
export declare const TagCategorySchema: z.ZodEnum<["memory", "feeling", "occasion", "social"]>;
export declare const SessionTypeSchema: z.ZodEnum<["main", "break", "social", "achievement"]>;
export declare const GenreSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    color: z.ZodString;
    icon: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    color: string;
    description?: string | undefined;
    icon?: string | undefined;
}, {
    id: string;
    name: string;
    color: string;
    description?: string | undefined;
    icon?: string | undefined;
}>;
export declare const SubgenreSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    genre: z.ZodLazy<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        color: z.ZodString;
        icon: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        color: string;
        description?: string | undefined;
        icon?: string | undefined;
    }, {
        id: string;
        name: string;
        color: string;
        description?: string | undefined;
        icon?: string | undefined;
    }>>;
    color: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    genre: {
        id: string;
        name: string;
        color: string;
        description?: string | undefined;
        icon?: string | undefined;
    };
    description?: string | undefined;
    color?: string | undefined;
    icon?: string | undefined;
}, {
    id: string;
    name: string;
    genre: {
        id: string;
        name: string;
        color: string;
        description?: string | undefined;
        icon?: string | undefined;
    };
    description?: string | undefined;
    color?: string | undefined;
    icon?: string | undefined;
}>;
export declare const MoodSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    color: z.ZodString;
    gradient: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
    timeOfDay: z.ZodArray<z.ZodEnum<["morning", "afternoon", "evening", "night"]>, "many">;
    energyLevel: z.ZodNumber;
    socialPreference: z.ZodEnum<["solo", "coop", "competitive", "any"]>;
}, "strip", z.ZodTypeAny, {
    id: string;
    socialPreference: "solo" | "coop" | "competitive" | "any";
    timeOfDay: ("morning" | "afternoon" | "evening" | "night")[];
    energyLevel: number;
    name: string;
    color: string;
    description?: string | undefined;
    icon?: string | undefined;
    gradient?: string | undefined;
}, {
    id: string;
    socialPreference: "solo" | "coop" | "competitive" | "any";
    timeOfDay: ("morning" | "afternoon" | "evening" | "night")[];
    energyLevel: number;
    name: string;
    color: string;
    description?: string | undefined;
    icon?: string | undefined;
    gradient?: string | undefined;
}>;
export declare const PlatformSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    code: z.ZodEnum<["steam", "xbox", "playstation", "nintendo", "epic", "gog", "other"]>;
    logo: z.ZodOptional<z.ZodString>;
    apiEndpoint: z.ZodOptional<z.ZodString>;
    isConnected: z.ZodBoolean;
    userId: z.ZodOptional<z.ZodString>;
    lastSync: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    code: "steam" | "xbox" | "playstation" | "nintendo" | "epic" | "gog" | "other";
    isConnected: boolean;
    logo?: string | undefined;
    apiEndpoint?: string | undefined;
    userId?: string | undefined;
    lastSync?: Date | undefined;
}, {
    id: string;
    name: string;
    code: "steam" | "xbox" | "playstation" | "nintendo" | "epic" | "gog" | "other";
    isConnected: boolean;
    logo?: string | undefined;
    apiEndpoint?: string | undefined;
    userId?: string | undefined;
    lastSync?: Date | undefined;
}>;
export declare const EmotionalTagSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    color: z.ZodString;
    icon: z.ZodOptional<z.ZodString>;
    category: z.ZodEnum<["memory", "feeling", "occasion", "social"]>;
    isCustom: z.ZodBoolean;
    createdBy: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    category: "memory" | "feeling" | "occasion" | "social";
    name: string;
    color: string;
    isCustom: boolean;
    description?: string | undefined;
    icon?: string | undefined;
    createdBy?: string | undefined;
}, {
    id: string;
    category: "memory" | "feeling" | "occasion" | "social";
    name: string;
    color: string;
    isCustom: boolean;
    description?: string | undefined;
    icon?: string | undefined;
    createdBy?: string | undefined;
}>;
export declare const AchievementSchema: z.ZodObject<{
    id: z.ZodString;
    gameId: z.ZodString;
    platformCode: z.ZodEnum<["steam", "xbox", "playstation", "nintendo", "epic", "gog", "other"]>;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
    unlockedAt: z.ZodOptional<z.ZodDate>;
    rarity: z.ZodOptional<z.ZodNumber>;
    points: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    gameId: string;
    platformCode: "steam" | "xbox" | "playstation" | "nintendo" | "epic" | "gog" | "other";
    description?: string | undefined;
    icon?: string | undefined;
    unlockedAt?: Date | undefined;
    rarity?: number | undefined;
    points?: number | undefined;
}, {
    id: string;
    title: string;
    gameId: string;
    platformCode: "steam" | "xbox" | "playstation" | "nintendo" | "epic" | "gog" | "other";
    description?: string | undefined;
    icon?: string | undefined;
    unlockedAt?: Date | undefined;
    rarity?: number | undefined;
    points?: number | undefined;
}>;
export declare const PlayHistorySchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    gameId: z.ZodString;
    platform: z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        code: z.ZodEnum<["steam", "xbox", "playstation", "nintendo", "epic", "gog", "other"]>;
        logo: z.ZodOptional<z.ZodString>;
        apiEndpoint: z.ZodOptional<z.ZodString>;
        isConnected: z.ZodBoolean;
        userId: z.ZodOptional<z.ZodString>;
        lastSync: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        code: "steam" | "xbox" | "playstation" | "nintendo" | "epic" | "gog" | "other";
        isConnected: boolean;
        logo?: string | undefined;
        apiEndpoint?: string | undefined;
        userId?: string | undefined;
        lastSync?: Date | undefined;
    }, {
        id: string;
        name: string;
        code: "steam" | "xbox" | "playstation" | "nintendo" | "epic" | "gog" | "other";
        isConnected: boolean;
        logo?: string | undefined;
        apiEndpoint?: string | undefined;
        userId?: string | undefined;
        lastSync?: Date | undefined;
    }>;
    startTime: z.ZodDate;
    endTime: z.ZodOptional<z.ZodDate>;
    duration: z.ZodOptional<z.ZodNumber>;
    sessionType: z.ZodEnum<["main", "break", "social", "achievement"]>;
    mood: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        color: z.ZodString;
        gradient: z.ZodOptional<z.ZodString>;
        icon: z.ZodOptional<z.ZodString>;
        timeOfDay: z.ZodArray<z.ZodEnum<["morning", "afternoon", "evening", "night"]>, "many">;
        energyLevel: z.ZodNumber;
        socialPreference: z.ZodEnum<["solo", "coop", "competitive", "any"]>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        socialPreference: "solo" | "coop" | "competitive" | "any";
        timeOfDay: ("morning" | "afternoon" | "evening" | "night")[];
        energyLevel: number;
        name: string;
        color: string;
        description?: string | undefined;
        icon?: string | undefined;
        gradient?: string | undefined;
    }, {
        id: string;
        socialPreference: "solo" | "coop" | "competitive" | "any";
        timeOfDay: ("morning" | "afternoon" | "evening" | "night")[];
        energyLevel: number;
        name: string;
        color: string;
        description?: string | undefined;
        icon?: string | undefined;
        gradient?: string | undefined;
    }>>;
    notes: z.ZodOptional<z.ZodString>;
    achievements: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        gameId: z.ZodString;
        platformCode: z.ZodEnum<["steam", "xbox", "playstation", "nintendo", "epic", "gog", "other"]>;
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        icon: z.ZodOptional<z.ZodString>;
        unlockedAt: z.ZodOptional<z.ZodDate>;
        rarity: z.ZodOptional<z.ZodNumber>;
        points: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        title: string;
        gameId: string;
        platformCode: "steam" | "xbox" | "playstation" | "nintendo" | "epic" | "gog" | "other";
        description?: string | undefined;
        icon?: string | undefined;
        unlockedAt?: Date | undefined;
        rarity?: number | undefined;
        points?: number | undefined;
    }, {
        id: string;
        title: string;
        gameId: string;
        platformCode: "steam" | "xbox" | "playstation" | "nintendo" | "epic" | "gog" | "other";
        description?: string | undefined;
        icon?: string | undefined;
        unlockedAt?: Date | undefined;
        rarity?: number | undefined;
        points?: number | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    id: string;
    userId: string;
    gameId: string;
    platform: {
        id: string;
        name: string;
        code: "steam" | "xbox" | "playstation" | "nintendo" | "epic" | "gog" | "other";
        isConnected: boolean;
        logo?: string | undefined;
        apiEndpoint?: string | undefined;
        userId?: string | undefined;
        lastSync?: Date | undefined;
    };
    startTime: Date;
    sessionType: "social" | "main" | "break" | "achievement";
    notes?: string | undefined;
    achievements?: {
        id: string;
        title: string;
        gameId: string;
        platformCode: "steam" | "xbox" | "playstation" | "nintendo" | "epic" | "gog" | "other";
        description?: string | undefined;
        icon?: string | undefined;
        unlockedAt?: Date | undefined;
        rarity?: number | undefined;
        points?: number | undefined;
    }[] | undefined;
    endTime?: Date | undefined;
    duration?: number | undefined;
    mood?: {
        id: string;
        socialPreference: "solo" | "coop" | "competitive" | "any";
        timeOfDay: ("morning" | "afternoon" | "evening" | "night")[];
        energyLevel: number;
        name: string;
        color: string;
        description?: string | undefined;
        icon?: string | undefined;
        gradient?: string | undefined;
    } | undefined;
}, {
    id: string;
    userId: string;
    gameId: string;
    platform: {
        id: string;
        name: string;
        code: "steam" | "xbox" | "playstation" | "nintendo" | "epic" | "gog" | "other";
        isConnected: boolean;
        logo?: string | undefined;
        apiEndpoint?: string | undefined;
        userId?: string | undefined;
        lastSync?: Date | undefined;
    };
    startTime: Date;
    sessionType: "social" | "main" | "break" | "achievement";
    notes?: string | undefined;
    achievements?: {
        id: string;
        title: string;
        gameId: string;
        platformCode: "steam" | "xbox" | "playstation" | "nintendo" | "epic" | "gog" | "other";
        description?: string | undefined;
        icon?: string | undefined;
        unlockedAt?: Date | undefined;
        rarity?: number | undefined;
        points?: number | undefined;
    }[] | undefined;
    endTime?: Date | undefined;
    duration?: number | undefined;
    mood?: {
        id: string;
        socialPreference: "solo" | "coop" | "competitive" | "any";
        timeOfDay: ("morning" | "afternoon" | "evening" | "night")[];
        energyLevel: number;
        name: string;
        color: string;
        description?: string | undefined;
        icon?: string | undefined;
        gradient?: string | undefined;
    } | undefined;
}>;
export declare const GameSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    coverImage: z.ZodOptional<z.ZodString>;
    backgroundImages: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    releaseDate: z.ZodOptional<z.ZodDate>;
    developer: z.ZodOptional<z.ZodString>;
    publisher: z.ZodOptional<z.ZodString>;
    genres: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        color: z.ZodString;
        icon: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        color: string;
        description?: string | undefined;
        icon?: string | undefined;
    }, {
        id: string;
        name: string;
        color: string;
        description?: string | undefined;
        icon?: string | undefined;
    }>, "many">;
    subgenres: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        genre: z.ZodLazy<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            color: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            color: string;
            description?: string | undefined;
            icon?: string | undefined;
        }, {
            id: string;
            name: string;
            color: string;
            description?: string | undefined;
            icon?: string | undefined;
        }>>;
        color: z.ZodOptional<z.ZodString>;
        icon: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        genre: {
            id: string;
            name: string;
            color: string;
            description?: string | undefined;
            icon?: string | undefined;
        };
        description?: string | undefined;
        color?: string | undefined;
        icon?: string | undefined;
    }, {
        id: string;
        name: string;
        genre: {
            id: string;
            name: string;
            color: string;
            description?: string | undefined;
            icon?: string | undefined;
        };
        description?: string | undefined;
        color?: string | undefined;
        icon?: string | undefined;
    }>, "many">;
    platforms: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        code: z.ZodEnum<["steam", "xbox", "playstation", "nintendo", "epic", "gog", "other"]>;
        logo: z.ZodOptional<z.ZodString>;
        apiEndpoint: z.ZodOptional<z.ZodString>;
        isConnected: z.ZodBoolean;
        userId: z.ZodOptional<z.ZodString>;
        lastSync: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        code: "steam" | "xbox" | "playstation" | "nintendo" | "epic" | "gog" | "other";
        isConnected: boolean;
        logo?: string | undefined;
        apiEndpoint?: string | undefined;
        userId?: string | undefined;
        lastSync?: Date | undefined;
    }, {
        id: string;
        name: string;
        code: "steam" | "xbox" | "playstation" | "nintendo" | "epic" | "gog" | "other";
        isConnected: boolean;
        logo?: string | undefined;
        apiEndpoint?: string | undefined;
        userId?: string | undefined;
        lastSync?: Date | undefined;
    }>, "many">;
    emotionalTags: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        color: z.ZodString;
        icon: z.ZodOptional<z.ZodString>;
        category: z.ZodEnum<["memory", "feeling", "occasion", "social"]>;
        isCustom: z.ZodBoolean;
        createdBy: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        category: "memory" | "feeling" | "occasion" | "social";
        name: string;
        color: string;
        isCustom: boolean;
        description?: string | undefined;
        icon?: string | undefined;
        createdBy?: string | undefined;
    }, {
        id: string;
        category: "memory" | "feeling" | "occasion" | "social";
        name: string;
        color: string;
        isCustom: boolean;
        description?: string | undefined;
        icon?: string | undefined;
        createdBy?: string | undefined;
    }>, "many">;
    userRating: z.ZodOptional<z.ZodNumber>;
    globalRating: z.ZodOptional<z.ZodNumber>;
    playStatus: z.ZodEnum<["unplayed", "playing", "completed", "paused", "abandoned"]>;
    hoursPlayed: z.ZodOptional<z.ZodNumber>;
    lastPlayed: z.ZodOptional<z.ZodDate>;
    addedAt: z.ZodDate;
    notes: z.ZodOptional<z.ZodString>;
    isFavorite: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    genres: {
        id: string;
        name: string;
        color: string;
        description?: string | undefined;
        icon?: string | undefined;
    }[];
    subgenres: {
        id: string;
        name: string;
        genre: {
            id: string;
            name: string;
            color: string;
            description?: string | undefined;
            icon?: string | undefined;
        };
        description?: string | undefined;
        color?: string | undefined;
        icon?: string | undefined;
    }[];
    platforms: {
        id: string;
        name: string;
        code: "steam" | "xbox" | "playstation" | "nintendo" | "epic" | "gog" | "other";
        isConnected: boolean;
        logo?: string | undefined;
        apiEndpoint?: string | undefined;
        userId?: string | undefined;
        lastSync?: Date | undefined;
    }[];
    emotionalTags: {
        id: string;
        category: "memory" | "feeling" | "occasion" | "social";
        name: string;
        color: string;
        isCustom: boolean;
        description?: string | undefined;
        icon?: string | undefined;
        createdBy?: string | undefined;
    }[];
    playStatus: "unplayed" | "playing" | "completed" | "paused" | "abandoned";
    addedAt: Date;
    isFavorite: boolean;
    description?: string | undefined;
    backgroundImages?: string[] | undefined;
    coverImage?: string | undefined;
    releaseDate?: Date | undefined;
    developer?: string | undefined;
    publisher?: string | undefined;
    userRating?: number | undefined;
    globalRating?: number | undefined;
    hoursPlayed?: number | undefined;
    lastPlayed?: Date | undefined;
    notes?: string | undefined;
}, {
    id: string;
    title: string;
    genres: {
        id: string;
        name: string;
        color: string;
        description?: string | undefined;
        icon?: string | undefined;
    }[];
    subgenres: {
        id: string;
        name: string;
        genre: {
            id: string;
            name: string;
            color: string;
            description?: string | undefined;
            icon?: string | undefined;
        };
        description?: string | undefined;
        color?: string | undefined;
        icon?: string | undefined;
    }[];
    platforms: {
        id: string;
        name: string;
        code: "steam" | "xbox" | "playstation" | "nintendo" | "epic" | "gog" | "other";
        isConnected: boolean;
        logo?: string | undefined;
        apiEndpoint?: string | undefined;
        userId?: string | undefined;
        lastSync?: Date | undefined;
    }[];
    emotionalTags: {
        id: string;
        category: "memory" | "feeling" | "occasion" | "social";
        name: string;
        color: string;
        isCustom: boolean;
        description?: string | undefined;
        icon?: string | undefined;
        createdBy?: string | undefined;
    }[];
    playStatus: "unplayed" | "playing" | "completed" | "paused" | "abandoned";
    addedAt: Date;
    isFavorite: boolean;
    description?: string | undefined;
    backgroundImages?: string[] | undefined;
    coverImage?: string | undefined;
    releaseDate?: Date | undefined;
    developer?: string | undefined;
    publisher?: string | undefined;
    userRating?: number | undefined;
    globalRating?: number | undefined;
    hoursPlayed?: number | undefined;
    lastPlayed?: Date | undefined;
    notes?: string | undefined;
}>;
export declare const UserPreferencesSchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    favoriteGenres: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        color: z.ZodString;
        icon: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        color: string;
        description?: string | undefined;
        icon?: string | undefined;
    }, {
        id: string;
        name: string;
        color: string;
        description?: string | undefined;
        icon?: string | undefined;
    }>, "many">;
    playStyle: z.ZodObject<{
        competitive: z.ZodNumber;
        cooperative: z.ZodNumber;
        casual: z.ZodNumber;
        hardcore: z.ZodNumber;
        explorer: z.ZodNumber;
        completionist: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        competitive: number;
        explorer: number;
        cooperative: number;
        casual: number;
        hardcore: number;
        completionist: number;
    }, {
        competitive: number;
        explorer: number;
        cooperative: number;
        casual: number;
        hardcore: number;
        completionist: number;
    }>;
    moodPreferences: z.ZodArray<z.ZodObject<{
        mood: z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            color: z.ZodString;
            gradient: z.ZodOptional<z.ZodString>;
            icon: z.ZodOptional<z.ZodString>;
            timeOfDay: z.ZodArray<z.ZodEnum<["morning", "afternoon", "evening", "night"]>, "many">;
            energyLevel: z.ZodNumber;
            socialPreference: z.ZodEnum<["solo", "coop", "competitive", "any"]>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            socialPreference: "solo" | "coop" | "competitive" | "any";
            timeOfDay: ("morning" | "afternoon" | "evening" | "night")[];
            energyLevel: number;
            name: string;
            color: string;
            description?: string | undefined;
            icon?: string | undefined;
            gradient?: string | undefined;
        }, {
            id: string;
            socialPreference: "solo" | "coop" | "competitive" | "any";
            timeOfDay: ("morning" | "afternoon" | "evening" | "night")[];
            energyLevel: number;
            name: string;
            color: string;
            description?: string | undefined;
            icon?: string | undefined;
            gradient?: string | undefined;
        }>;
        gameTypes: z.ZodArray<z.ZodString, "many">;
        timeOfDay: z.ZodEnum<["morning", "afternoon", "evening", "night"]>;
    }, "strip", z.ZodTypeAny, {
        timeOfDay: "morning" | "afternoon" | "evening" | "night";
        mood: {
            id: string;
            socialPreference: "solo" | "coop" | "competitive" | "any";
            timeOfDay: ("morning" | "afternoon" | "evening" | "night")[];
            energyLevel: number;
            name: string;
            color: string;
            description?: string | undefined;
            icon?: string | undefined;
            gradient?: string | undefined;
        };
        gameTypes: string[];
    }, {
        timeOfDay: "morning" | "afternoon" | "evening" | "night";
        mood: {
            id: string;
            socialPreference: "solo" | "coop" | "competitive" | "any";
            timeOfDay: ("morning" | "afternoon" | "evening" | "night")[];
            energyLevel: number;
            name: string;
            color: string;
            description?: string | undefined;
            icon?: string | undefined;
            gradient?: string | undefined;
        };
        gameTypes: string[];
    }>, "many">;
    notificationSettings: z.ZodObject<{
        achievements: z.ZodBoolean;
        friendActivity: z.ZodBoolean;
        gameRecommendations: z.ZodBoolean;
        platformUpdates: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        achievements: boolean;
        friendActivity: boolean;
        gameRecommendations: boolean;
        platformUpdates: boolean;
    }, {
        achievements: boolean;
        friendActivity: boolean;
        gameRecommendations: boolean;
        platformUpdates: boolean;
    }>;
    privacySettings: z.ZodObject<{
        profileVisibility: z.ZodEnum<["public", "friends", "private"]>;
        activitySharing: z.ZodBoolean;
        gameLibraryVisibility: z.ZodEnum<["public", "friends", "private"]>;
    }, "strip", z.ZodTypeAny, {
        profileVisibility: "public" | "friends" | "private";
        activitySharing: boolean;
        gameLibraryVisibility: "public" | "friends" | "private";
    }, {
        profileVisibility: "public" | "friends" | "private";
        activitySharing: boolean;
        gameLibraryVisibility: "public" | "friends" | "private";
    }>;
}, "strip", z.ZodTypeAny, {
    id: string;
    userId: string;
    favoriteGenres: {
        id: string;
        name: string;
        color: string;
        description?: string | undefined;
        icon?: string | undefined;
    }[];
    playStyle: {
        competitive: number;
        explorer: number;
        cooperative: number;
        casual: number;
        hardcore: number;
        completionist: number;
    };
    moodPreferences: {
        timeOfDay: "morning" | "afternoon" | "evening" | "night";
        mood: {
            id: string;
            socialPreference: "solo" | "coop" | "competitive" | "any";
            timeOfDay: ("morning" | "afternoon" | "evening" | "night")[];
            energyLevel: number;
            name: string;
            color: string;
            description?: string | undefined;
            icon?: string | undefined;
            gradient?: string | undefined;
        };
        gameTypes: string[];
    }[];
    notificationSettings: {
        achievements: boolean;
        friendActivity: boolean;
        gameRecommendations: boolean;
        platformUpdates: boolean;
    };
    privacySettings: {
        profileVisibility: "public" | "friends" | "private";
        activitySharing: boolean;
        gameLibraryVisibility: "public" | "friends" | "private";
    };
}, {
    id: string;
    userId: string;
    favoriteGenres: {
        id: string;
        name: string;
        color: string;
        description?: string | undefined;
        icon?: string | undefined;
    }[];
    playStyle: {
        competitive: number;
        explorer: number;
        cooperative: number;
        casual: number;
        hardcore: number;
        completionist: number;
    };
    moodPreferences: {
        timeOfDay: "morning" | "afternoon" | "evening" | "night";
        mood: {
            id: string;
            socialPreference: "solo" | "coop" | "competitive" | "any";
            timeOfDay: ("morning" | "afternoon" | "evening" | "night")[];
            energyLevel: number;
            name: string;
            color: string;
            description?: string | undefined;
            icon?: string | undefined;
            gradient?: string | undefined;
        };
        gameTypes: string[];
    }[];
    notificationSettings: {
        achievements: boolean;
        friendActivity: boolean;
        gameRecommendations: boolean;
        platformUpdates: boolean;
    };
    privacySettings: {
        profileVisibility: "public" | "friends" | "private";
        activitySharing: boolean;
        gameLibraryVisibility: "public" | "friends" | "private";
    };
}>;
export declare const UserProfileSchema: z.ZodObject<{
    id: z.ZodString;
    username: z.ZodString;
    email: z.ZodString;
    avatar: z.ZodOptional<z.ZodString>;
    displayName: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    timezone: z.ZodString;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
    preferences: z.ZodObject<{
        id: z.ZodString;
        userId: z.ZodString;
        favoriteGenres: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            color: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            color: string;
            description?: string | undefined;
            icon?: string | undefined;
        }, {
            id: string;
            name: string;
            color: string;
            description?: string | undefined;
            icon?: string | undefined;
        }>, "many">;
        playStyle: z.ZodObject<{
            competitive: z.ZodNumber;
            cooperative: z.ZodNumber;
            casual: z.ZodNumber;
            hardcore: z.ZodNumber;
            explorer: z.ZodNumber;
            completionist: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            competitive: number;
            explorer: number;
            cooperative: number;
            casual: number;
            hardcore: number;
            completionist: number;
        }, {
            competitive: number;
            explorer: number;
            cooperative: number;
            casual: number;
            hardcore: number;
            completionist: number;
        }>;
        moodPreferences: z.ZodArray<z.ZodObject<{
            mood: z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                description: z.ZodOptional<z.ZodString>;
                color: z.ZodString;
                gradient: z.ZodOptional<z.ZodString>;
                icon: z.ZodOptional<z.ZodString>;
                timeOfDay: z.ZodArray<z.ZodEnum<["morning", "afternoon", "evening", "night"]>, "many">;
                energyLevel: z.ZodNumber;
                socialPreference: z.ZodEnum<["solo", "coop", "competitive", "any"]>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                socialPreference: "solo" | "coop" | "competitive" | "any";
                timeOfDay: ("morning" | "afternoon" | "evening" | "night")[];
                energyLevel: number;
                name: string;
                color: string;
                description?: string | undefined;
                icon?: string | undefined;
                gradient?: string | undefined;
            }, {
                id: string;
                socialPreference: "solo" | "coop" | "competitive" | "any";
                timeOfDay: ("morning" | "afternoon" | "evening" | "night")[];
                energyLevel: number;
                name: string;
                color: string;
                description?: string | undefined;
                icon?: string | undefined;
                gradient?: string | undefined;
            }>;
            gameTypes: z.ZodArray<z.ZodString, "many">;
            timeOfDay: z.ZodEnum<["morning", "afternoon", "evening", "night"]>;
        }, "strip", z.ZodTypeAny, {
            timeOfDay: "morning" | "afternoon" | "evening" | "night";
            mood: {
                id: string;
                socialPreference: "solo" | "coop" | "competitive" | "any";
                timeOfDay: ("morning" | "afternoon" | "evening" | "night")[];
                energyLevel: number;
                name: string;
                color: string;
                description?: string | undefined;
                icon?: string | undefined;
                gradient?: string | undefined;
            };
            gameTypes: string[];
        }, {
            timeOfDay: "morning" | "afternoon" | "evening" | "night";
            mood: {
                id: string;
                socialPreference: "solo" | "coop" | "competitive" | "any";
                timeOfDay: ("morning" | "afternoon" | "evening" | "night")[];
                energyLevel: number;
                name: string;
                color: string;
                description?: string | undefined;
                icon?: string | undefined;
                gradient?: string | undefined;
            };
            gameTypes: string[];
        }>, "many">;
        notificationSettings: z.ZodObject<{
            achievements: z.ZodBoolean;
            friendActivity: z.ZodBoolean;
            gameRecommendations: z.ZodBoolean;
            platformUpdates: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            achievements: boolean;
            friendActivity: boolean;
            gameRecommendations: boolean;
            platformUpdates: boolean;
        }, {
            achievements: boolean;
            friendActivity: boolean;
            gameRecommendations: boolean;
            platformUpdates: boolean;
        }>;
        privacySettings: z.ZodObject<{
            profileVisibility: z.ZodEnum<["public", "friends", "private"]>;
            activitySharing: z.ZodBoolean;
            gameLibraryVisibility: z.ZodEnum<["public", "friends", "private"]>;
        }, "strip", z.ZodTypeAny, {
            profileVisibility: "public" | "friends" | "private";
            activitySharing: boolean;
            gameLibraryVisibility: "public" | "friends" | "private";
        }, {
            profileVisibility: "public" | "friends" | "private";
            activitySharing: boolean;
            gameLibraryVisibility: "public" | "friends" | "private";
        }>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        userId: string;
        favoriteGenres: {
            id: string;
            name: string;
            color: string;
            description?: string | undefined;
            icon?: string | undefined;
        }[];
        playStyle: {
            competitive: number;
            explorer: number;
            cooperative: number;
            casual: number;
            hardcore: number;
            completionist: number;
        };
        moodPreferences: {
            timeOfDay: "morning" | "afternoon" | "evening" | "night";
            mood: {
                id: string;
                socialPreference: "solo" | "coop" | "competitive" | "any";
                timeOfDay: ("morning" | "afternoon" | "evening" | "night")[];
                energyLevel: number;
                name: string;
                color: string;
                description?: string | undefined;
                icon?: string | undefined;
                gradient?: string | undefined;
            };
            gameTypes: string[];
        }[];
        notificationSettings: {
            achievements: boolean;
            friendActivity: boolean;
            gameRecommendations: boolean;
            platformUpdates: boolean;
        };
        privacySettings: {
            profileVisibility: "public" | "friends" | "private";
            activitySharing: boolean;
            gameLibraryVisibility: "public" | "friends" | "private";
        };
    }, {
        id: string;
        userId: string;
        favoriteGenres: {
            id: string;
            name: string;
            color: string;
            description?: string | undefined;
            icon?: string | undefined;
        }[];
        playStyle: {
            competitive: number;
            explorer: number;
            cooperative: number;
            casual: number;
            hardcore: number;
            completionist: number;
        };
        moodPreferences: {
            timeOfDay: "morning" | "afternoon" | "evening" | "night";
            mood: {
                id: string;
                socialPreference: "solo" | "coop" | "competitive" | "any";
                timeOfDay: ("morning" | "afternoon" | "evening" | "night")[];
                energyLevel: number;
                name: string;
                color: string;
                description?: string | undefined;
                icon?: string | undefined;
                gradient?: string | undefined;
            };
            gameTypes: string[];
        }[];
        notificationSettings: {
            achievements: boolean;
            friendActivity: boolean;
            gameRecommendations: boolean;
            platformUpdates: boolean;
        };
        privacySettings: {
            profileVisibility: "public" | "friends" | "private";
            activitySharing: boolean;
            gameLibraryVisibility: "public" | "friends" | "private";
        };
    }>;
    platforms: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        code: z.ZodEnum<["steam", "xbox", "playstation", "nintendo", "epic", "gog", "other"]>;
        logo: z.ZodOptional<z.ZodString>;
        apiEndpoint: z.ZodOptional<z.ZodString>;
        isConnected: z.ZodBoolean;
        userId: z.ZodOptional<z.ZodString>;
        lastSync: z.ZodOptional<z.ZodDate>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        code: "steam" | "xbox" | "playstation" | "nintendo" | "epic" | "gog" | "other";
        isConnected: boolean;
        logo?: string | undefined;
        apiEndpoint?: string | undefined;
        userId?: string | undefined;
        lastSync?: Date | undefined;
    }, {
        id: string;
        name: string;
        code: "steam" | "xbox" | "playstation" | "nintendo" | "epic" | "gog" | "other";
        isConnected: boolean;
        logo?: string | undefined;
        apiEndpoint?: string | undefined;
        userId?: string | undefined;
        lastSync?: Date | undefined;
    }>, "many">;
    games: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        coverImage: z.ZodOptional<z.ZodString>;
        backgroundImages: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        releaseDate: z.ZodOptional<z.ZodDate>;
        developer: z.ZodOptional<z.ZodString>;
        publisher: z.ZodOptional<z.ZodString>;
        genres: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            color: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            color: string;
            description?: string | undefined;
            icon?: string | undefined;
        }, {
            id: string;
            name: string;
            color: string;
            description?: string | undefined;
            icon?: string | undefined;
        }>, "many">;
        subgenres: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            genre: z.ZodLazy<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                description: z.ZodOptional<z.ZodString>;
                color: z.ZodString;
                icon: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                name: string;
                color: string;
                description?: string | undefined;
                icon?: string | undefined;
            }, {
                id: string;
                name: string;
                color: string;
                description?: string | undefined;
                icon?: string | undefined;
            }>>;
            color: z.ZodOptional<z.ZodString>;
            icon: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            genre: {
                id: string;
                name: string;
                color: string;
                description?: string | undefined;
                icon?: string | undefined;
            };
            description?: string | undefined;
            color?: string | undefined;
            icon?: string | undefined;
        }, {
            id: string;
            name: string;
            genre: {
                id: string;
                name: string;
                color: string;
                description?: string | undefined;
                icon?: string | undefined;
            };
            description?: string | undefined;
            color?: string | undefined;
            icon?: string | undefined;
        }>, "many">;
        platforms: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            code: z.ZodEnum<["steam", "xbox", "playstation", "nintendo", "epic", "gog", "other"]>;
            logo: z.ZodOptional<z.ZodString>;
            apiEndpoint: z.ZodOptional<z.ZodString>;
            isConnected: z.ZodBoolean;
            userId: z.ZodOptional<z.ZodString>;
            lastSync: z.ZodOptional<z.ZodDate>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            code: "steam" | "xbox" | "playstation" | "nintendo" | "epic" | "gog" | "other";
            isConnected: boolean;
            logo?: string | undefined;
            apiEndpoint?: string | undefined;
            userId?: string | undefined;
            lastSync?: Date | undefined;
        }, {
            id: string;
            name: string;
            code: "steam" | "xbox" | "playstation" | "nintendo" | "epic" | "gog" | "other";
            isConnected: boolean;
            logo?: string | undefined;
            apiEndpoint?: string | undefined;
            userId?: string | undefined;
            lastSync?: Date | undefined;
        }>, "many">;
        emotionalTags: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            color: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            category: z.ZodEnum<["memory", "feeling", "occasion", "social"]>;
            isCustom: z.ZodBoolean;
            createdBy: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            category: "memory" | "feeling" | "occasion" | "social";
            name: string;
            color: string;
            isCustom: boolean;
            description?: string | undefined;
            icon?: string | undefined;
            createdBy?: string | undefined;
        }, {
            id: string;
            category: "memory" | "feeling" | "occasion" | "social";
            name: string;
            color: string;
            isCustom: boolean;
            description?: string | undefined;
            icon?: string | undefined;
            createdBy?: string | undefined;
        }>, "many">;
        userRating: z.ZodOptional<z.ZodNumber>;
        globalRating: z.ZodOptional<z.ZodNumber>;
        playStatus: z.ZodEnum<["unplayed", "playing", "completed", "paused", "abandoned"]>;
        hoursPlayed: z.ZodOptional<z.ZodNumber>;
        lastPlayed: z.ZodOptional<z.ZodDate>;
        addedAt: z.ZodDate;
        notes: z.ZodOptional<z.ZodString>;
        isFavorite: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        id: string;
        title: string;
        genres: {
            id: string;
            name: string;
            color: string;
            description?: string | undefined;
            icon?: string | undefined;
        }[];
        subgenres: {
            id: string;
            name: string;
            genre: {
                id: string;
                name: string;
                color: string;
                description?: string | undefined;
                icon?: string | undefined;
            };
            description?: string | undefined;
            color?: string | undefined;
            icon?: string | undefined;
        }[];
        platforms: {
            id: string;
            name: string;
            code: "steam" | "xbox" | "playstation" | "nintendo" | "epic" | "gog" | "other";
            isConnected: boolean;
            logo?: string | undefined;
            apiEndpoint?: string | undefined;
            userId?: string | undefined;
            lastSync?: Date | undefined;
        }[];
        emotionalTags: {
            id: string;
            category: "memory" | "feeling" | "occasion" | "social";
            name: string;
            color: string;
            isCustom: boolean;
            description?: string | undefined;
            icon?: string | undefined;
            createdBy?: string | undefined;
        }[];
        playStatus: "unplayed" | "playing" | "completed" | "paused" | "abandoned";
        addedAt: Date;
        isFavorite: boolean;
        description?: string | undefined;
        backgroundImages?: string[] | undefined;
        coverImage?: string | undefined;
        releaseDate?: Date | undefined;
        developer?: string | undefined;
        publisher?: string | undefined;
        userRating?: number | undefined;
        globalRating?: number | undefined;
        hoursPlayed?: number | undefined;
        lastPlayed?: Date | undefined;
        notes?: string | undefined;
    }, {
        id: string;
        title: string;
        genres: {
            id: string;
            name: string;
            color: string;
            description?: string | undefined;
            icon?: string | undefined;
        }[];
        subgenres: {
            id: string;
            name: string;
            genre: {
                id: string;
                name: string;
                color: string;
                description?: string | undefined;
                icon?: string | undefined;
            };
            description?: string | undefined;
            color?: string | undefined;
            icon?: string | undefined;
        }[];
        platforms: {
            id: string;
            name: string;
            code: "steam" | "xbox" | "playstation" | "nintendo" | "epic" | "gog" | "other";
            isConnected: boolean;
            logo?: string | undefined;
            apiEndpoint?: string | undefined;
            userId?: string | undefined;
            lastSync?: Date | undefined;
        }[];
        emotionalTags: {
            id: string;
            category: "memory" | "feeling" | "occasion" | "social";
            name: string;
            color: string;
            isCustom: boolean;
            description?: string | undefined;
            icon?: string | undefined;
            createdBy?: string | undefined;
        }[];
        playStatus: "unplayed" | "playing" | "completed" | "paused" | "abandoned";
        addedAt: Date;
        isFavorite: boolean;
        description?: string | undefined;
        backgroundImages?: string[] | undefined;
        coverImage?: string | undefined;
        releaseDate?: Date | undefined;
        developer?: string | undefined;
        publisher?: string | undefined;
        userRating?: number | undefined;
        globalRating?: number | undefined;
        hoursPlayed?: number | undefined;
        lastPlayed?: Date | undefined;
        notes?: string | undefined;
    }>, "many">;
    favoriteGenres: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        color: z.ZodString;
        icon: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        color: string;
        description?: string | undefined;
        icon?: string | undefined;
    }, {
        id: string;
        name: string;
        color: string;
        description?: string | undefined;
        icon?: string | undefined;
    }>, "many">;
    currentMood: z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        color: z.ZodString;
        gradient: z.ZodOptional<z.ZodString>;
        icon: z.ZodOptional<z.ZodString>;
        timeOfDay: z.ZodArray<z.ZodEnum<["morning", "afternoon", "evening", "night"]>, "many">;
        energyLevel: z.ZodNumber;
        socialPreference: z.ZodEnum<["solo", "coop", "competitive", "any"]>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        socialPreference: "solo" | "coop" | "competitive" | "any";
        timeOfDay: ("morning" | "afternoon" | "evening" | "night")[];
        energyLevel: number;
        name: string;
        color: string;
        description?: string | undefined;
        icon?: string | undefined;
        gradient?: string | undefined;
    }, {
        id: string;
        socialPreference: "solo" | "coop" | "competitive" | "any";
        timeOfDay: ("morning" | "afternoon" | "evening" | "night")[];
        energyLevel: number;
        name: string;
        color: string;
        description?: string | undefined;
        icon?: string | undefined;
        gradient?: string | undefined;
    }>>;
    totalPlaytime: z.ZodNumber;
    achievementCount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    email: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    username: string;
    timezone: string;
    preferences: {
        id: string;
        userId: string;
        favoriteGenres: {
            id: string;
            name: string;
            color: string;
            description?: string | undefined;
            icon?: string | undefined;
        }[];
        playStyle: {
            competitive: number;
            explorer: number;
            cooperative: number;
            casual: number;
            hardcore: number;
            completionist: number;
        };
        moodPreferences: {
            timeOfDay: "morning" | "afternoon" | "evening" | "night";
            mood: {
                id: string;
                socialPreference: "solo" | "coop" | "competitive" | "any";
                timeOfDay: ("morning" | "afternoon" | "evening" | "night")[];
                energyLevel: number;
                name: string;
                color: string;
                description?: string | undefined;
                icon?: string | undefined;
                gradient?: string | undefined;
            };
            gameTypes: string[];
        }[];
        notificationSettings: {
            achievements: boolean;
            friendActivity: boolean;
            gameRecommendations: boolean;
            platformUpdates: boolean;
        };
        privacySettings: {
            profileVisibility: "public" | "friends" | "private";
            activitySharing: boolean;
            gameLibraryVisibility: "public" | "friends" | "private";
        };
    };
    totalPlaytime: number;
    platforms: {
        id: string;
        name: string;
        code: "steam" | "xbox" | "playstation" | "nintendo" | "epic" | "gog" | "other";
        isConnected: boolean;
        logo?: string | undefined;
        apiEndpoint?: string | undefined;
        userId?: string | undefined;
        lastSync?: Date | undefined;
    }[];
    favoriteGenres: {
        id: string;
        name: string;
        color: string;
        description?: string | undefined;
        icon?: string | undefined;
    }[];
    games: {
        id: string;
        title: string;
        genres: {
            id: string;
            name: string;
            color: string;
            description?: string | undefined;
            icon?: string | undefined;
        }[];
        subgenres: {
            id: string;
            name: string;
            genre: {
                id: string;
                name: string;
                color: string;
                description?: string | undefined;
                icon?: string | undefined;
            };
            description?: string | undefined;
            color?: string | undefined;
            icon?: string | undefined;
        }[];
        platforms: {
            id: string;
            name: string;
            code: "steam" | "xbox" | "playstation" | "nintendo" | "epic" | "gog" | "other";
            isConnected: boolean;
            logo?: string | undefined;
            apiEndpoint?: string | undefined;
            userId?: string | undefined;
            lastSync?: Date | undefined;
        }[];
        emotionalTags: {
            id: string;
            category: "memory" | "feeling" | "occasion" | "social";
            name: string;
            color: string;
            isCustom: boolean;
            description?: string | undefined;
            icon?: string | undefined;
            createdBy?: string | undefined;
        }[];
        playStatus: "unplayed" | "playing" | "completed" | "paused" | "abandoned";
        addedAt: Date;
        isFavorite: boolean;
        description?: string | undefined;
        backgroundImages?: string[] | undefined;
        coverImage?: string | undefined;
        releaseDate?: Date | undefined;
        developer?: string | undefined;
        publisher?: string | undefined;
        userRating?: number | undefined;
        globalRating?: number | undefined;
        hoursPlayed?: number | undefined;
        lastPlayed?: Date | undefined;
        notes?: string | undefined;
    }[];
    achievementCount: number;
    displayName?: string | undefined;
    avatar?: string | undefined;
    bio?: string | undefined;
    location?: string | undefined;
    currentMood?: {
        id: string;
        socialPreference: "solo" | "coop" | "competitive" | "any";
        timeOfDay: ("morning" | "afternoon" | "evening" | "night")[];
        energyLevel: number;
        name: string;
        color: string;
        description?: string | undefined;
        icon?: string | undefined;
        gradient?: string | undefined;
    } | undefined;
}, {
    email: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    username: string;
    timezone: string;
    preferences: {
        id: string;
        userId: string;
        favoriteGenres: {
            id: string;
            name: string;
            color: string;
            description?: string | undefined;
            icon?: string | undefined;
        }[];
        playStyle: {
            competitive: number;
            explorer: number;
            cooperative: number;
            casual: number;
            hardcore: number;
            completionist: number;
        };
        moodPreferences: {
            timeOfDay: "morning" | "afternoon" | "evening" | "night";
            mood: {
                id: string;
                socialPreference: "solo" | "coop" | "competitive" | "any";
                timeOfDay: ("morning" | "afternoon" | "evening" | "night")[];
                energyLevel: number;
                name: string;
                color: string;
                description?: string | undefined;
                icon?: string | undefined;
                gradient?: string | undefined;
            };
            gameTypes: string[];
        }[];
        notificationSettings: {
            achievements: boolean;
            friendActivity: boolean;
            gameRecommendations: boolean;
            platformUpdates: boolean;
        };
        privacySettings: {
            profileVisibility: "public" | "friends" | "private";
            activitySharing: boolean;
            gameLibraryVisibility: "public" | "friends" | "private";
        };
    };
    totalPlaytime: number;
    platforms: {
        id: string;
        name: string;
        code: "steam" | "xbox" | "playstation" | "nintendo" | "epic" | "gog" | "other";
        isConnected: boolean;
        logo?: string | undefined;
        apiEndpoint?: string | undefined;
        userId?: string | undefined;
        lastSync?: Date | undefined;
    }[];
    favoriteGenres: {
        id: string;
        name: string;
        color: string;
        description?: string | undefined;
        icon?: string | undefined;
    }[];
    games: {
        id: string;
        title: string;
        genres: {
            id: string;
            name: string;
            color: string;
            description?: string | undefined;
            icon?: string | undefined;
        }[];
        subgenres: {
            id: string;
            name: string;
            genre: {
                id: string;
                name: string;
                color: string;
                description?: string | undefined;
                icon?: string | undefined;
            };
            description?: string | undefined;
            color?: string | undefined;
            icon?: string | undefined;
        }[];
        platforms: {
            id: string;
            name: string;
            code: "steam" | "xbox" | "playstation" | "nintendo" | "epic" | "gog" | "other";
            isConnected: boolean;
            logo?: string | undefined;
            apiEndpoint?: string | undefined;
            userId?: string | undefined;
            lastSync?: Date | undefined;
        }[];
        emotionalTags: {
            id: string;
            category: "memory" | "feeling" | "occasion" | "social";
            name: string;
            color: string;
            isCustom: boolean;
            description?: string | undefined;
            icon?: string | undefined;
            createdBy?: string | undefined;
        }[];
        playStatus: "unplayed" | "playing" | "completed" | "paused" | "abandoned";
        addedAt: Date;
        isFavorite: boolean;
        description?: string | undefined;
        backgroundImages?: string[] | undefined;
        coverImage?: string | undefined;
        releaseDate?: Date | undefined;
        developer?: string | undefined;
        publisher?: string | undefined;
        userRating?: number | undefined;
        globalRating?: number | undefined;
        hoursPlayed?: number | undefined;
        lastPlayed?: Date | undefined;
        notes?: string | undefined;
    }[];
    achievementCount: number;
    displayName?: string | undefined;
    avatar?: string | undefined;
    bio?: string | undefined;
    location?: string | undefined;
    currentMood?: {
        id: string;
        socialPreference: "solo" | "coop" | "competitive" | "any";
        timeOfDay: ("morning" | "afternoon" | "evening" | "night")[];
        energyLevel: number;
        name: string;
        color: string;
        description?: string | undefined;
        icon?: string | undefined;
        gradient?: string | undefined;
    } | undefined;
}>;
export declare const IntegrationSchema: z.ZodObject<{
    id: z.ZodString;
    platform: z.ZodString;
    type: z.ZodEnum<["youtube", "discord", "spotify", "twitch"]>;
    connected: z.ZodBoolean;
    userId: z.ZodOptional<z.ZodString>;
    accessToken: z.ZodOptional<z.ZodString>;
    refreshToken: z.ZodOptional<z.ZodString>;
    expiresAt: z.ZodOptional<z.ZodDate>;
    lastSync: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "discord" | "youtube" | "spotify" | "twitch";
    platform: string;
    connected: boolean;
    userId?: string | undefined;
    lastSync?: Date | undefined;
    accessToken?: string | undefined;
    refreshToken?: string | undefined;
    expiresAt?: Date | undefined;
}, {
    id: string;
    type: "discord" | "youtube" | "spotify" | "twitch";
    platform: string;
    connected: boolean;
    userId?: string | undefined;
    lastSync?: Date | undefined;
    accessToken?: string | undefined;
    refreshToken?: string | undefined;
    expiresAt?: Date | undefined;
}>;
export declare const ActivitySchema: z.ZodObject<{
    id: z.ZodString;
    userId: z.ZodString;
    type: z.ZodEnum<["achievement", "session_start", "session_end", "game_added", "integration_connected"]>;
    gameId: z.ZodOptional<z.ZodString>;
    platform: z.ZodOptional<z.ZodString>;
    data: z.ZodRecord<z.ZodString, z.ZodAny>;
    timestamp: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    type: "achievement" | "session_start" | "session_end" | "game_added" | "integration_connected";
    userId: string;
    data: Record<string, any>;
    timestamp: Date;
    gameId?: string | undefined;
    platform?: string | undefined;
}, {
    id: string;
    type: "achievement" | "session_start" | "session_end" | "game_added" | "integration_connected";
    userId: string;
    data: Record<string, any>;
    timestamp: Date;
    gameId?: string | undefined;
    platform?: string | undefined;
}>;
export declare const validateGame: (data: unknown) => {
    id: string;
    title: string;
    genres: {
        id: string;
        name: string;
        color: string;
        description?: string | undefined;
        icon?: string | undefined;
    }[];
    subgenres: {
        id: string;
        name: string;
        genre: {
            id: string;
            name: string;
            color: string;
            description?: string | undefined;
            icon?: string | undefined;
        };
        description?: string | undefined;
        color?: string | undefined;
        icon?: string | undefined;
    }[];
    platforms: {
        id: string;
        name: string;
        code: "steam" | "xbox" | "playstation" | "nintendo" | "epic" | "gog" | "other";
        isConnected: boolean;
        logo?: string | undefined;
        apiEndpoint?: string | undefined;
        userId?: string | undefined;
        lastSync?: Date | undefined;
    }[];
    emotionalTags: {
        id: string;
        category: "memory" | "feeling" | "occasion" | "social";
        name: string;
        color: string;
        isCustom: boolean;
        description?: string | undefined;
        icon?: string | undefined;
        createdBy?: string | undefined;
    }[];
    playStatus: "unplayed" | "playing" | "completed" | "paused" | "abandoned";
    addedAt: Date;
    isFavorite: boolean;
    description?: string | undefined;
    backgroundImages?: string[] | undefined;
    coverImage?: string | undefined;
    releaseDate?: Date | undefined;
    developer?: string | undefined;
    publisher?: string | undefined;
    userRating?: number | undefined;
    globalRating?: number | undefined;
    hoursPlayed?: number | undefined;
    lastPlayed?: Date | undefined;
    notes?: string | undefined;
};
export declare const validateUserProfile: (data: unknown) => {
    email: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    username: string;
    timezone: string;
    preferences: {
        id: string;
        userId: string;
        favoriteGenres: {
            id: string;
            name: string;
            color: string;
            description?: string | undefined;
            icon?: string | undefined;
        }[];
        playStyle: {
            competitive: number;
            explorer: number;
            cooperative: number;
            casual: number;
            hardcore: number;
            completionist: number;
        };
        moodPreferences: {
            timeOfDay: "morning" | "afternoon" | "evening" | "night";
            mood: {
                id: string;
                socialPreference: "solo" | "coop" | "competitive" | "any";
                timeOfDay: ("morning" | "afternoon" | "evening" | "night")[];
                energyLevel: number;
                name: string;
                color: string;
                description?: string | undefined;
                icon?: string | undefined;
                gradient?: string | undefined;
            };
            gameTypes: string[];
        }[];
        notificationSettings: {
            achievements: boolean;
            friendActivity: boolean;
            gameRecommendations: boolean;
            platformUpdates: boolean;
        };
        privacySettings: {
            profileVisibility: "public" | "friends" | "private";
            activitySharing: boolean;
            gameLibraryVisibility: "public" | "friends" | "private";
        };
    };
    totalPlaytime: number;
    platforms: {
        id: string;
        name: string;
        code: "steam" | "xbox" | "playstation" | "nintendo" | "epic" | "gog" | "other";
        isConnected: boolean;
        logo?: string | undefined;
        apiEndpoint?: string | undefined;
        userId?: string | undefined;
        lastSync?: Date | undefined;
    }[];
    favoriteGenres: {
        id: string;
        name: string;
        color: string;
        description?: string | undefined;
        icon?: string | undefined;
    }[];
    games: {
        id: string;
        title: string;
        genres: {
            id: string;
            name: string;
            color: string;
            description?: string | undefined;
            icon?: string | undefined;
        }[];
        subgenres: {
            id: string;
            name: string;
            genre: {
                id: string;
                name: string;
                color: string;
                description?: string | undefined;
                icon?: string | undefined;
            };
            description?: string | undefined;
            color?: string | undefined;
            icon?: string | undefined;
        }[];
        platforms: {
            id: string;
            name: string;
            code: "steam" | "xbox" | "playstation" | "nintendo" | "epic" | "gog" | "other";
            isConnected: boolean;
            logo?: string | undefined;
            apiEndpoint?: string | undefined;
            userId?: string | undefined;
            lastSync?: Date | undefined;
        }[];
        emotionalTags: {
            id: string;
            category: "memory" | "feeling" | "occasion" | "social";
            name: string;
            color: string;
            isCustom: boolean;
            description?: string | undefined;
            icon?: string | undefined;
            createdBy?: string | undefined;
        }[];
        playStatus: "unplayed" | "playing" | "completed" | "paused" | "abandoned";
        addedAt: Date;
        isFavorite: boolean;
        description?: string | undefined;
        backgroundImages?: string[] | undefined;
        coverImage?: string | undefined;
        releaseDate?: Date | undefined;
        developer?: string | undefined;
        publisher?: string | undefined;
        userRating?: number | undefined;
        globalRating?: number | undefined;
        hoursPlayed?: number | undefined;
        lastPlayed?: Date | undefined;
        notes?: string | undefined;
    }[];
    achievementCount: number;
    displayName?: string | undefined;
    avatar?: string | undefined;
    bio?: string | undefined;
    location?: string | undefined;
    currentMood?: {
        id: string;
        socialPreference: "solo" | "coop" | "competitive" | "any";
        timeOfDay: ("morning" | "afternoon" | "evening" | "night")[];
        energyLevel: number;
        name: string;
        color: string;
        description?: string | undefined;
        icon?: string | undefined;
        gradient?: string | undefined;
    } | undefined;
};
export declare const validatePlayHistory: (data: unknown) => {
    id: string;
    userId: string;
    gameId: string;
    platform: {
        id: string;
        name: string;
        code: "steam" | "xbox" | "playstation" | "nintendo" | "epic" | "gog" | "other";
        isConnected: boolean;
        logo?: string | undefined;
        apiEndpoint?: string | undefined;
        userId?: string | undefined;
        lastSync?: Date | undefined;
    };
    startTime: Date;
    sessionType: "social" | "main" | "break" | "achievement";
    notes?: string | undefined;
    achievements?: {
        id: string;
        title: string;
        gameId: string;
        platformCode: "steam" | "xbox" | "playstation" | "nintendo" | "epic" | "gog" | "other";
        description?: string | undefined;
        icon?: string | undefined;
        unlockedAt?: Date | undefined;
        rarity?: number | undefined;
        points?: number | undefined;
    }[] | undefined;
    endTime?: Date | undefined;
    duration?: number | undefined;
    mood?: {
        id: string;
        socialPreference: "solo" | "coop" | "competitive" | "any";
        timeOfDay: ("morning" | "afternoon" | "evening" | "night")[];
        energyLevel: number;
        name: string;
        color: string;
        description?: string | undefined;
        icon?: string | undefined;
        gradient?: string | undefined;
    } | undefined;
};
export declare const validateEmotionalTag: (data: unknown) => {
    id: string;
    category: "memory" | "feeling" | "occasion" | "social";
    name: string;
    color: string;
    isCustom: boolean;
    description?: string | undefined;
    icon?: string | undefined;
    createdBy?: string | undefined;
};
export declare const validateMood: (data: unknown) => {
    id: string;
    socialPreference: "solo" | "coop" | "competitive" | "any";
    timeOfDay: ("morning" | "afternoon" | "evening" | "night")[];
    energyLevel: number;
    name: string;
    color: string;
    description?: string | undefined;
    icon?: string | undefined;
    gradient?: string | undefined;
};
export declare const validatePlatform: (data: unknown) => {
    id: string;
    name: string;
    code: "steam" | "xbox" | "playstation" | "nintendo" | "epic" | "gog" | "other";
    isConnected: boolean;
    logo?: string | undefined;
    apiEndpoint?: string | undefined;
    userId?: string | undefined;
    lastSync?: Date | undefined;
};
//# sourceMappingURL=index.d.ts.map