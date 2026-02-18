export interface MoodDefinition {
    id: string;
    name: string;
    description: string;
    color: string;
    gradient?: string;
    icon: string;
    energyLevel: number;
    socialPreference: 'solo' | 'cooperative' | 'competitive' | 'flexible';
    timeOfDay: ('morning' | 'afternoon' | 'evening' | 'night')[];
    genreAffinities: string[];
    category: 'energy' | 'exploration' | 'challenge' | 'social' | 'creative' | 'immersion' | 'action' | 'vibe';
}
export declare const GAMING_MOODS: MoodDefinition[];
export declare const getMoodById: (id: string) => MoodDefinition | undefined;
export declare const getMoodsByCategory: (category: MoodDefinition["category"]) => MoodDefinition[];
export declare const getMoodsByEnergyLevel: (minLevel: number, maxLevel: number) => MoodDefinition[];
export declare const getMoodsBySocialPreference: (preference: MoodDefinition["socialPreference"]) => MoodDefinition[];
export declare const getMoodsByTimeOfDay: (timeOfDay: "morning" | "afternoon" | "evening" | "night") => MoodDefinition[];
export declare const searchMoods: (query: string) => MoodDefinition[];
export declare const getPopularMoods: () => MoodDefinition[];
export declare const getMoodRecommendations: (currentMood: string, context?: {
    timeOfDay?: "morning" | "afternoon" | "evening" | "night";
    energyLevel?: number;
    socialContext?: "solo" | "cooperative" | "competitive";
}) => MoodDefinition[];
//# sourceMappingURL=moods.d.ts.map