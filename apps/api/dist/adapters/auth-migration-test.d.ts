/**
 * Test authentication flows with canonical User model
 * This is a simple test to verify the migration works correctly
 */
export declare class AuthMigrationTest {
    /**
     * Test user registration with canonical User model
     */
    static testRegistration(): Promise<{
        success: boolean;
        canonicalUser: import("@gamepilot/shared").User;
        error?: undefined;
    } | {
        success: boolean;
        error: unknown;
        canonicalUser?: undefined;
    }>;
    /**
     * Test user login with canonical User model
     */
    static testLogin(): Promise<{
        success: boolean;
        canonicalUser: import("@gamepilot/shared").User;
        error?: undefined;
    } | {
        success: boolean;
        error: unknown;
        canonicalUser?: undefined;
    }>;
    /**
     * Test UserAdapter conversion functions
     */
    static testUserAdapter(): {
        success: boolean;
        validation: {
            isValid: boolean;
            errors: string[];
        };
        onboardingStatus: boolean;
        authStatus: {
            isAuthenticated: boolean;
            hasIntegrations: boolean;
            lastActive: Date | null;
            isOnboarded: boolean;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: unknown;
        validation?: undefined;
        onboardingStatus?: undefined;
        authStatus?: undefined;
    };
    /**
     * Test complete authentication flow
     */
    static testCompleteFlow(): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: unknown;
    }>;
    /**
     * Run all tests
     */
    static runAllTests(): Promise<{
        registration: {
            success: boolean;
            canonicalUser: import("@gamepilot/shared").User;
            error?: undefined;
        } | {
            success: boolean;
            error: unknown;
            canonicalUser?: undefined;
        };
        login: {
            success: boolean;
            canonicalUser: import("@gamepilot/shared").User;
            error?: undefined;
        } | {
            success: boolean;
            error: unknown;
            canonicalUser?: undefined;
        };
        adapter: {
            success: boolean;
            validation: {
                isValid: boolean;
                errors: string[];
            };
            onboardingStatus: boolean;
            authStatus: {
                isAuthenticated: boolean;
                hasIntegrations: boolean;
                lastActive: Date | null;
                isOnboarded: boolean;
            };
            error?: undefined;
        } | {
            success: boolean;
            error: unknown;
            validation?: undefined;
            onboardingStatus?: undefined;
            authStatus?: undefined;
        };
        completeFlow: {
            success: boolean;
            error?: undefined;
        } | {
            success: boolean;
            error: unknown;
        };
    }>;
}
/**
 * Quick validation function to test the migration
 */
export declare function validateAuthMigration(): Promise<boolean>;
//# sourceMappingURL=auth-migration-test.d.ts.map