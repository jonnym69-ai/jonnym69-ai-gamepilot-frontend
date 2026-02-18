import type { UserIntegration } from '@gamepilot/shared/models/integration';
/**
 * Test Steam integration migration with canonical UserIntegration model
 */
export declare class SteamMigrationTest {
    /**
     * Test Steam profile to canonical UserIntegration conversion
     */
    static testSteamProfileConversion(): Promise<{
        success: boolean;
        integration: UserIntegration;
        validation: {
            isValid: boolean;
            errors: string[];
        };
        error?: undefined;
    } | {
        success: boolean;
        error: unknown;
        integration?: undefined;
        validation?: undefined;
    }>;
    /**
     * Test legacy Steam integration migration
     */
    static testLegacyMigration(): {
        success: boolean;
        integration: UserIntegration;
        validation: {
            isValid: boolean;
            errors: string[];
        };
        error?: undefined;
    } | {
        success: boolean;
        error: unknown;
        integration?: undefined;
        validation?: undefined;
    };
    /**
     * Test token and status management
     */
    static testTokenAndStatusManagement(): Promise<{
        success: boolean;
        tokenUpdate: UserIntegration;
        statusUpdate: UserIntegration;
        healthStatus: {
            isHealthy: boolean;
            status: string;
            issues: string[];
            lastSyncAge: number;
        };
        needsRefresh: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: unknown;
        tokenUpdate?: undefined;
        statusUpdate?: undefined;
        healthStatus?: undefined;
        needsRefresh?: undefined;
    }>;
    /**
     * Test IntegrationAdapter functions with Steam data
     */
    static testIntegrationAdapter(): {
        success: boolean;
        integration: UserIntegration;
        convertedBack: import("@gamepilot/shared").SteamProfile | null;
        safeIntegration: UserIntegration | null;
        safeProfile: import("@gamepilot/shared").SteamProfile | null;
        error?: undefined;
    } | {
        success: boolean;
        error: unknown;
        integration?: undefined;
        convertedBack?: undefined;
        safeIntegration?: undefined;
        safeProfile?: undefined;
    };
    /**
     * Run all Steam migration tests
     */
    static runAllTests(): Promise<{
        profileConversion: {
            success: boolean;
            integration: UserIntegration;
            validation: {
                isValid: boolean;
                errors: string[];
            };
            error?: undefined;
        } | {
            success: boolean;
            error: unknown;
            integration?: undefined;
            validation?: undefined;
        };
        legacyMigration: {
            success: boolean;
            integration: UserIntegration;
            validation: {
                isValid: boolean;
                errors: string[];
            };
            error?: undefined;
        } | {
            success: boolean;
            error: unknown;
            integration?: undefined;
            validation?: undefined;
        };
        tokenAndStatus: {
            success: boolean;
            tokenUpdate: UserIntegration;
            statusUpdate: UserIntegration;
            healthStatus: {
                isHealthy: boolean;
                status: string;
                issues: string[];
                lastSyncAge: number;
            };
            needsRefresh: boolean;
            error?: undefined;
        } | {
            success: boolean;
            error: unknown;
            tokenUpdate?: undefined;
            statusUpdate?: undefined;
            healthStatus?: undefined;
            needsRefresh?: undefined;
        };
        integrationAdapter: {
            success: boolean;
            integration: UserIntegration;
            convertedBack: import("@gamepilot/shared").SteamProfile | null;
            safeIntegration: UserIntegration | null;
            safeProfile: import("@gamepilot/shared").SteamProfile | null;
            error?: undefined;
        } | {
            success: boolean;
            error: unknown;
            integration?: undefined;
            convertedBack?: undefined;
            safeIntegration?: undefined;
            safeProfile?: undefined;
        };
    }>;
}
/**
 * Quick validation function to test the Steam migration
 */
export declare function validateSteamMigration(): Promise<boolean>;
//# sourceMappingURL=steam-migration-test.d.ts.map