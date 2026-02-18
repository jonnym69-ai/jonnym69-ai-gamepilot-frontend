import type { User } from '@gamepilot/shared/models/user';
import type { UserIntegration } from '@gamepilot/shared/models/integration';
/**
 * Test unified identity service with canonical User model
 */
export declare class IdentityServiceTest {
    /**
     * Test basic user creation and retrieval
     */
    static testUserCreationAndRetrieval(): Promise<{
        success: boolean;
        createdUser: User;
        retrievedUser: User;
        legacyUser: import("./identityService").LegacyAuthUser;
        error?: undefined;
    } | {
        success: boolean;
        error: unknown;
        createdUser?: undefined;
        retrievedUser?: undefined;
        legacyUser?: undefined;
    }>;
    /**
     * Test login and registration flows
     */
    static testAuthenticationFlows(): Promise<{
        success: boolean;
        registerResult: {
            success: boolean;
            user?: import("./identityService").LegacyAuthUser;
            canonicalUser?: User;
            token?: string;
            message?: string;
        };
        loginResult: {
            success: boolean;
            user?: import("./identityService").LegacyAuthUser;
            canonicalUser?: User;
            token?: string;
            message?: string;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: unknown;
        registerResult?: undefined;
        loginResult?: undefined;
    }>;
    /**
     * Test user validation
     */
    static testUserValidation(): Promise<{
        success: boolean;
        validation: {
            isValid: boolean;
            errors: string[];
            warnings: string[];
        };
        testUser: User;
        error?: undefined;
    } | {
        success: boolean;
        error: unknown;
        validation?: undefined;
        testUser?: undefined;
    }>;
    /**
     * Test integration attachment
     */
    static testIntegrationAttachment(): Promise<{
        success: boolean;
        enrichedUser: User;
        userIntegrations: UserIntegration[];
        error?: undefined;
    } | {
        success: boolean;
        error: unknown;
        enrichedUser?: undefined;
        userIntegrations?: undefined;
    }>;
    /**
     * Test authentication state
     */
    static testAuthenticationState(): Promise<{
        success: boolean;
        authState: {
            isAuthenticated: boolean;
            isFullyOnboarded: boolean;
            hasIntegrations: boolean;
            integrationCount: number;
            activeIntegrations: number;
            lastActive: Date | null;
            authMethod: "email" | "steam" | "discord" | "youtube" | "multiple";
            securityLevel: "basic" | "enhanced" | "premium";
        };
        error?: undefined;
    } | {
        success: boolean;
        error: unknown;
        authState?: undefined;
    }>;
    /**
     * Test comprehensive profile
     */
    static testComprehensiveProfile(): Promise<{
        success: boolean;
        profileResult: {
            success: boolean;
            user?: User;
            authUser?: import("./identityService").LegacyAuthUser;
            authState?: ReturnType<import("./identityService").IdentityService["getUserAuthState"]>;
            integrations?: UserIntegration[];
            validation?: ReturnType<import("./identityService").IdentityService["validateCanonicalUser"]>;
            message?: string;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: unknown;
        profileResult?: undefined;
    }>;
    /**
     * Test token operations
     */
    static testTokenOperations(): Promise<{
        success: boolean;
        token: string;
        verifiedUser: import("./identityService").LegacyAuthUser;
        error?: undefined;
    } | {
        success: boolean;
        error: unknown;
        token?: undefined;
        verifiedUser?: undefined;
    }>;
    /**
     * Test UserAdapter integration
     */
    static testUserAdapterIntegration(): Promise<{
        success: boolean;
        canonicalUser: User;
        legacyUser: any;
        convertedBack: User;
        dataPreserved: boolean;
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
        canonicalUser?: undefined;
        legacyUser?: undefined;
        convertedBack?: undefined;
        dataPreserved?: undefined;
        validation?: undefined;
        onboardingStatus?: undefined;
        authStatus?: undefined;
    }>;
    /**
     * Test middleware functionality
     */
    static testMiddleware(): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: unknown;
    }>;
    /**
     * Run all identity service tests
     */
    static runAllTests(): Promise<{
        userCreation: {
            success: boolean;
            createdUser: User;
            retrievedUser: User;
            legacyUser: import("./identityService").LegacyAuthUser;
            error?: undefined;
        } | {
            success: boolean;
            error: unknown;
            createdUser?: undefined;
            retrievedUser?: undefined;
            legacyUser?: undefined;
        };
        authenticationFlows: {
            success: boolean;
            registerResult: {
                success: boolean;
                user?: import("./identityService").LegacyAuthUser;
                canonicalUser?: User;
                token?: string;
                message?: string;
            };
            loginResult: {
                success: boolean;
                user?: import("./identityService").LegacyAuthUser;
                canonicalUser?: User;
                token?: string;
                message?: string;
            };
            error?: undefined;
        } | {
            success: boolean;
            error: unknown;
            registerResult?: undefined;
            loginResult?: undefined;
        };
        userValidation: {
            success: boolean;
            validation: {
                isValid: boolean;
                errors: string[];
                warnings: string[];
            };
            testUser: User;
            error?: undefined;
        } | {
            success: boolean;
            error: unknown;
            validation?: undefined;
            testUser?: undefined;
        };
        integrationAttachment: {
            success: boolean;
            enrichedUser: User;
            userIntegrations: UserIntegration[];
            error?: undefined;
        } | {
            success: boolean;
            error: unknown;
            enrichedUser?: undefined;
            userIntegrations?: undefined;
        };
        authenticationState: {
            success: boolean;
            authState: {
                isAuthenticated: boolean;
                isFullyOnboarded: boolean;
                hasIntegrations: boolean;
                integrationCount: number;
                activeIntegrations: number;
                lastActive: Date | null;
                authMethod: "email" | "steam" | "discord" | "youtube" | "multiple";
                securityLevel: "basic" | "enhanced" | "premium";
            };
            error?: undefined;
        } | {
            success: boolean;
            error: unknown;
            authState?: undefined;
        };
        comprehensiveProfile: {
            success: boolean;
            profileResult: {
                success: boolean;
                user?: User;
                authUser?: import("./identityService").LegacyAuthUser;
                authState?: ReturnType<import("./identityService").IdentityService["getUserAuthState"]>;
                integrations?: UserIntegration[];
                validation?: ReturnType<import("./identityService").IdentityService["validateCanonicalUser"]>;
                message?: string;
            };
            error?: undefined;
        } | {
            success: boolean;
            error: unknown;
            profileResult?: undefined;
        };
        tokenOperations: {
            success: boolean;
            token: string;
            verifiedUser: import("./identityService").LegacyAuthUser;
            error?: undefined;
        } | {
            success: boolean;
            error: unknown;
            token?: undefined;
            verifiedUser?: undefined;
        };
        userAdapterIntegration: {
            success: boolean;
            canonicalUser: User;
            legacyUser: any;
            convertedBack: User;
            dataPreserved: boolean;
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
            canonicalUser?: undefined;
            legacyUser?: undefined;
            convertedBack?: undefined;
            dataPreserved?: undefined;
            validation?: undefined;
            onboardingStatus?: undefined;
            authStatus?: undefined;
        };
        middleware: {
            success: boolean;
            error?: undefined;
        } | {
            success: boolean;
            error: unknown;
        };
    }>;
}
/**
 * Quick validation function to test the unified identity service
 */
export declare function validateIdentityService(): Promise<boolean>;
//# sourceMappingURL=identity-service-test.d.ts.map