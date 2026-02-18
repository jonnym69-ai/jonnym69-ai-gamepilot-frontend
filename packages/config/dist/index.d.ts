export interface GamePilotConfig {
    api: {
        baseUrl: string;
        timeout: number;
    };
    integrations: {
        youtube: {
            apiKey?: string;
            enabled: boolean;
            maxResults: number;
        };
        discord: {
            botToken?: string;
            userToken?: string;
            enabled: boolean;
        };
        steam: {
            apiKey?: string;
            enabled: boolean;
            baseUrl: string;
        };
    };
    features: {
        recommendations: {
            enabled: boolean;
            maxRecommendations: number;
        };
        identity: {
            enabled: boolean;
            moodTracking: boolean;
        };
        social: {
            enabled: boolean;
            activityFeed: boolean;
        };
    };
    ui: {
        theme: 'dark' | 'light' | 'auto';
        animations: boolean;
        reducedMotion: boolean;
    };
}
export declare const defaultConfig: GamePilotConfig;
export declare const getEnvironmentConfig: () => GamePilotConfig;
export declare const validateConfig: (config: Partial<GamePilotConfig>) => string[];
export declare const config: GamePilotConfig;
//# sourceMappingURL=index.d.ts.map