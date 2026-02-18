import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    username: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    displayName: z.ZodString;
    timezone: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    username: string;
    password: string;
    displayName: string;
    timezone: string;
}, {
    email: string;
    username: string;
    password: string;
    displayName: string;
    timezone?: string | undefined;
}>;
export declare const loginSchema: z.ZodObject<{
    username: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    password: string;
}, {
    username: string;
    password: string;
}>;
export declare const updateProfileSchema: z.ZodObject<{
    displayName: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    website: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    timezone: z.ZodOptional<z.ZodString>;
    avatar: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
}, "strip", z.ZodTypeAny, {
    displayName?: string | undefined;
    timezone?: string | undefined;
    bio?: string | undefined;
    location?: string | undefined;
    website?: string | undefined;
    avatar?: string | undefined;
}, {
    displayName?: string | undefined;
    timezone?: string | undefined;
    bio?: string | undefined;
    location?: string | undefined;
    website?: string | undefined;
    avatar?: string | undefined;
}>;
export declare const addGameSchema: z.ZodObject<{
    title: z.ZodString;
    genres: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    platforms: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    rating: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<z.ZodEnum<["unplayed", "playing", "completed", "paused", "abandoned"]>>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    status?: "unplayed" | "playing" | "completed" | "paused" | "abandoned" | undefined;
    genres?: string[] | undefined;
    platforms?: string[] | undefined;
    tags?: string[] | undefined;
    notes?: string | undefined;
    rating?: number | undefined;
}, {
    title: string;
    status?: "unplayed" | "playing" | "completed" | "paused" | "abandoned" | undefined;
    genres?: string[] | undefined;
    platforms?: string[] | undefined;
    tags?: string[] | undefined;
    notes?: string | undefined;
    rating?: number | undefined;
}>;
export declare const updateGameSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    genres: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    platforms: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    rating: z.ZodOptional<z.ZodNumber>;
    status: z.ZodOptional<z.ZodEnum<["unplayed", "playing", "completed", "paused", "abandoned"]>>;
    notes: z.ZodOptional<z.ZodString>;
    playtime: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: string;
    status?: "unplayed" | "playing" | "completed" | "paused" | "abandoned" | undefined;
    title?: string | undefined;
    genres?: string[] | undefined;
    platforms?: string[] | undefined;
    tags?: string[] | undefined;
    notes?: string | undefined;
    rating?: number | undefined;
    playtime?: number | undefined;
}, {
    id: string;
    status?: "unplayed" | "playing" | "completed" | "paused" | "abandoned" | undefined;
    title?: string | undefined;
    genres?: string[] | undefined;
    platforms?: string[] | undefined;
    tags?: string[] | undefined;
    notes?: string | undefined;
    rating?: number | undefined;
    playtime?: number | undefined;
}>;
export declare const deleteGameSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const moodEntrySchema: z.ZodObject<{
    mood: z.ZodString;
    intensity: z.ZodNumber;
    triggers: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    activities: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    mood: string;
    intensity: number;
    notes?: string | undefined;
    triggers?: string[] | undefined;
    activities?: string[] | undefined;
}, {
    mood: string;
    intensity: number;
    notes?: string | undefined;
    triggers?: string[] | undefined;
    activities?: string[] | undefined;
}>;
export declare const personaUpdateSchema: z.ZodObject<{
    traits: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    preferences: z.ZodOptional<z.ZodObject<{
        genres: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        playtimes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        socialLevel: z.ZodOptional<z.ZodEnum<["solo", "small", "large"]>>;
        competitiveness: z.ZodOptional<z.ZodEnum<["casual", "moderate", "competitive"]>>;
    }, "strip", z.ZodTypeAny, {
        genres?: string[] | undefined;
        playtimes?: string[] | undefined;
        socialLevel?: "solo" | "small" | "large" | undefined;
        competitiveness?: "competitive" | "casual" | "moderate" | undefined;
    }, {
        genres?: string[] | undefined;
        playtimes?: string[] | undefined;
        socialLevel?: "solo" | "small" | "large" | undefined;
        competitiveness?: "competitive" | "casual" | "moderate" | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    preferences?: {
        genres?: string[] | undefined;
        playtimes?: string[] | undefined;
        socialLevel?: "solo" | "small" | "large" | undefined;
        competitiveness?: "competitive" | "casual" | "moderate" | undefined;
    } | undefined;
    traits?: string[] | undefined;
}, {
    preferences?: {
        genres?: string[] | undefined;
        playtimes?: string[] | undefined;
        socialLevel?: "solo" | "small" | "large" | undefined;
        competitiveness?: "competitive" | "casual" | "moderate" | undefined;
    } | undefined;
    traits?: string[] | undefined;
}>;
export declare const recommendationRequestSchema: z.ZodObject<{
    mood: z.ZodOptional<z.ZodString>;
    genres: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    platforms: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    playtime: z.ZodOptional<z.ZodObject<{
        min: z.ZodOptional<z.ZodNumber>;
        max: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        min?: number | undefined;
        max?: number | undefined;
    }, {
        min?: number | undefined;
        max?: number | undefined;
    }>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    mood?: string | undefined;
    genres?: string[] | undefined;
    platforms?: string[] | undefined;
    playtime?: {
        min?: number | undefined;
        max?: number | undefined;
    } | undefined;
}, {
    mood?: string | undefined;
    genres?: string[] | undefined;
    platforms?: string[] | undefined;
    limit?: number | undefined;
    playtime?: {
        min?: number | undefined;
        max?: number | undefined;
    } | undefined;
}>;
export declare const steamConnectSchema: z.ZodObject<{
    steamId: z.ZodString;
    username: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
    steamId: string;
}, {
    username: string;
    steamId: string;
}>;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
}, {
    limit?: number | undefined;
    page?: number | undefined;
}>;
export declare const gameFilterSchema: z.ZodObject<{
    genre: z.ZodOptional<z.ZodString>;
    platform: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["unplayed", "playing", "completed", "paused", "abandoned"]>>;
    rating: z.ZodOptional<z.ZodNumber>;
    search: z.ZodOptional<z.ZodString>;
} & {
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    status?: "unplayed" | "playing" | "completed" | "paused" | "abandoned" | undefined;
    platform?: string | undefined;
    search?: string | undefined;
    rating?: number | undefined;
    genre?: string | undefined;
}, {
    status?: "unplayed" | "playing" | "completed" | "paused" | "abandoned" | undefined;
    platform?: string | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    rating?: number | undefined;
    genre?: string | undefined;
    page?: number | undefined;
}>;
export declare function validateBody<T>(schema: z.ZodSchema<T>): (req: any, res: any, next: any) => any;
export declare function validateQuery<T>(schema: z.ZodSchema<T>): (req: any, res: any, next: any) => any;
export declare function validateParams<T>(schema: z.ZodSchema<T>): (req: any, res: any, next: any) => any;
//# sourceMappingURL=schemas.d.ts.map