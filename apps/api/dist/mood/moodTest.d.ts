import { Game } from '@gamepilot/types';
import { UserMood } from '@gamepilot/identity-engine';
/**
 * Mock Data for Testing
 */
export declare const calmHistory: UserMood[];
export declare const volatileHistory: UserMood[];
export declare const mockMoodHistory: UserMood[];
export declare const mockGames: Game[];
/**
 * Test Scenarios
 */
declare function scenario1(): Promise<void>;
declare function scenario2(): Promise<void>;
declare function scenario3(): Promise<void>;
/**
 * Main Test Runner
 */
declare function main(): Promise<void>;
export { scenario1, scenario2, scenario3, main };
//# sourceMappingURL=moodTest.d.ts.map