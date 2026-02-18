import type { User } from '@gamepilot/shared/models/user';
import type { UserIntegration } from '@gamepilot/shared/models/integration';
import type { SteamProfile } from '@gamepilot/shared/models/steamProfile';
import type { MoodVector, BehavioralSignal, NormalizedFeatures } from '../mood/types';
type AuthUser = any;
/**
 * Type guard to check if an object is a valid canonical User
 */
export declare function isCanonicalUser(obj: any): obj is User;
/**
 * Type guard to check if an object is a valid canonical UserIntegration
 */
export declare function isCanonicalIntegration(obj: any): obj is UserIntegration;
/**
 * Type guard to check if an object is a valid legacy AuthUser
 */
export declare function isLegacyAuthUser(obj: any): obj is AuthUser;
/**
 * Type guard to check if an object is a valid legacy SteamProfile
 */
export declare function isLegacySteamProfile(obj: any): obj is SteamProfile;
/**
 * Type guard to check if an object is a valid MoodVector
 */
export declare function isMoodVector(obj: any): obj is MoodVector;
/**
 * Type guard to check if an object is a valid BehavioralSignal
 */
export declare function isBehavioralSignal(obj: any): obj is BehavioralSignal;
/**
 * Type guard to check if an object is a valid NormalizedFeatures
 */
export declare function isNormalizedFeatures(obj: any): obj is NormalizedFeatures;
/**
 * Type guard to check if an object has canonical User structure
 */
export declare function hasCanonicalUserStructure(obj: any): boolean;
/**
 * Type guard to check if an object has canonical Integration structure
 */
export declare function hasCanonicalIntegrationStructure(obj: any): boolean;
/**
 * Type guard to check if an object has legacy AuthUser structure
 */
export declare function hasLegacyAuthUserStructure(obj: any): boolean;
/**
 * Type guard to check if an object has legacy SteamProfile structure
 */
export declare function hasLegacySteamProfileStructure(obj: any): boolean;
/**
 * Type guard to check if an object has mood analysis structure
 */
export declare function hasMoodAnalysisStructure(obj: any): boolean;
/**
 * Type guard to check if an object is a game (for games route)
 */
export declare function isGame(obj: any): obj is {
    id: string;
    title?: string;
    name?: string;
    platforms?: string[];
    status?: string;
    playtime?: number;
    coverImage?: string;
    launcherId?: string;
    tags?: string[];
};
/**
 * Type guard to check if an object is a Steam game (for steam integration)
 */
export declare function isSteamGame(obj: any): obj is {
    appId: number;
    name: string;
    steamId: string;
    playtimeForever: number;
    imgIconUrl: string;
    hasCommunityVisibleStats: boolean;
};
/**
 * Helper function to safely determine model type
 */
export declare function getModelType(obj: any): 'canonical-user' | 'canonical-integration' | 'legacy-auth-user' | 'legacy-steam-profile' | 'mood-vector' | 'behavioral-signal' | 'normalized-features' | 'unknown';
/**
 * Helper function to check if object can be converted to canonical User
 */
export declare function canConvertToCanonicalUser(obj: any): boolean;
/**
 * Helper function to check if object can be converted to canonical UserIntegration
 */
export declare function canConvertToCanonicalIntegration(obj: any): boolean;
/**
 * Helper function to check if object is Steam-related
 */
export declare function isSteamRelated(obj: any): boolean;
/**
 * Helper function to check if object is authentication-related
 */
export declare function isAuthRelated(obj: any): boolean;
/**
 * Helper function to check if object is mood-analysis related
 */
export declare function isMoodAnalysisRelated(obj: any): boolean;
/**
 * Runtime type checker for debugging
 */
export declare function debugType(obj: any, label?: string): void;
export {};
//# sourceMappingURL=typeGuards.d.ts.map