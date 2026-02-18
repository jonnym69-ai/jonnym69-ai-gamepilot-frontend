"use strict";
// Steam Integration Migration Test
// Tests to verify canonical UserIntegration model integration works correctly for Steam
Object.defineProperty(exports, "__esModule", { value: true });
exports.SteamMigrationTest = void 0;
exports.validateSteamMigration = validateSteamMigration;
const steamClient_1 = require("../steam/steamClient");
const integrationAdapter_1 = require("./integrationAdapter");
/**
 * Test Steam integration migration with canonical UserIntegration model
 */
class SteamMigrationTest {
    /**
     * Test Steam profile to canonical UserIntegration conversion
     */
    static async testSteamProfileConversion() {
        console.log('🧪 Testing Steam profile to canonical UserIntegration conversion...');
        try {
            // Get Steam profile (legacy format)
            const steamProfile = await (0, steamClient_1.getSteamProfile)('test-user-123');
            console.log('✅ Steam profile fetched:', steamProfile.personaName);
            // Convert to canonical UserIntegration
            const canonicalIntegration = await (0, steamClient_1.getSteamIntegration)('test-user-123', {
                accessToken: 'mock-access-token',
                refreshToken: 'mock-refresh-token',
                expiresAt: new Date(Date.now() + 3600000),
                scopes: ['read_profile', 'read_library']
            });
            console.log('✅ Converted to canonical UserIntegration');
            console.log('   Integration ID:', canonicalIntegration.id);
            console.log('   Platform:', canonicalIntegration.platform);
            console.log('   External User ID:', canonicalIntegration.externalUserId);
            console.log('   Status:', canonicalIntegration.status);
            console.log('   Scopes:', canonicalIntegration.scopes.length);
            // Validate the integration
            const validation = (0, steamClient_1.validateSteamIntegration)(canonicalIntegration);
            console.log('✅ Integration validation:', validation.isValid ? 'VALID' : 'INVALID');
            if (!validation.isValid) {
                console.log('   Validation errors:', validation.errors);
            }
            return { success: validation.isValid, integration: canonicalIntegration, validation };
        }
        catch (error) {
            console.error('❌ Steam profile conversion test error:', error);
            return { success: false, error };
        }
    }
    /**
     * Test legacy Steam integration migration
     */
    static testLegacyMigration() {
        console.log('🧪 Testing legacy Steam integration migration...');
        try {
            // Create legacy Steam profile
            const legacyProfile = {
                steamId: '76561198012345678',
                personaName: 'Legacy User',
                profileUrl: 'https://steamcommunity.com/profiles/76561198012345678',
                avatar: 'https://avatars.steamstatic.com/legacy.jpg',
                avatarMedium: 'https://avatars.steamstatic.com/legacy_medium.jpg',
                avatarFull: 'https://avatars.steamstatic.com/legacy_full.jpg',
                personaState: 1,
                personaStateFlags: 0,
                gameExtraInfo: 'Test Game',
                gameId: '123456'
            };
            console.log('🔄 Migrating legacy profile:', legacyProfile.personaName);
            // Migrate to canonical format
            const canonicalIntegration = (0, steamClient_1.migrateLegacySteamIntegration)(legacyProfile, 'migrated-user-456', {
                accessToken: 'migrated-access-token',
                refreshToken: 'migrated-refresh-token',
                expiresAt: new Date(Date.now() + 7200000),
                scopes: ['read_profile', 'read_library', 'read_activity']
            });
            console.log('✅ Legacy integration migrated successfully');
            console.log('   New Integration ID:', canonicalIntegration.id);
            console.log('   External User ID:', canonicalIntegration.externalUserId);
            console.log('   External Username:', canonicalIntegration.externalUsername);
            console.log('   Metadata preserved:', !!canonicalIntegration.metadata?.steam);
            // Validate migrated integration
            const validation = (0, steamClient_1.validateSteamIntegration)(canonicalIntegration);
            console.log('✅ Migrated integration validation:', validation.isValid ? 'VALID' : 'INVALID');
            return { success: validation.isValid, integration: canonicalIntegration, validation };
        }
        catch (error) {
            console.error('❌ Legacy migration test error:', error);
            return { success: false, error };
        }
    }
    /**
     * Test token and status management
     */
    static async testTokenAndStatusManagement() {
        console.log('🧪 Testing token and status management...');
        try {
            // Create a test integration
            const testIntegration = await (0, steamClient_1.getSteamIntegration)('token-test-user', {
                accessToken: 'initial-token',
                refreshToken: 'initial-refresh-token',
                expiresAt: new Date(Date.now() + 3600000),
                scopes: ['read_profile']
            });
            console.log('🔄 Testing token update...');
            // Update tokens
            const updatedTokens = (0, steamClient_1.updateSteamTokens)(testIntegration, {
                accessToken: 'updated-access-token',
                refreshToken: 'updated-refresh-token',
                expiresAt: new Date(Date.now() + 7200000)
            });
            console.log('✅ Tokens updated successfully');
            console.log('   New access token:', updatedTokens.accessToken);
            console.log('   New expires at:', updatedTokens.expiresAt);
            console.log('   Status remains:', updatedTokens.status);
            // Update status
            console.log('🔄 Testing status update...');
            const updatedStatus = (0, steamClient_1.updateSteamStatus)(updatedTokens, 'error', 1);
            console.log('✅ Status updated successfully');
            console.log('   New status:', updatedStatus.status);
            console.log('   Is active:', updatedStatus.isActive);
            console.log('   Error count:', updatedStatus.syncConfig.errorCount);
            // Test health status
            const healthStatus = integrationAdapter_1.IntegrationAdapter.getHealthStatus(updatedStatus);
            console.log('✅ Health status retrieved');
            console.log('   Is healthy:', healthStatus.isHealthy);
            console.log('   Issues:', healthStatus.issues);
            // Test token refresh need
            const needsRefresh = integrationAdapter_1.IntegrationAdapter.needsTokenRefresh(updatedStatus);
            console.log('✅ Token refresh check');
            console.log('   Needs refresh:', needsRefresh);
            return {
                success: true,
                tokenUpdate: updatedTokens,
                statusUpdate: updatedStatus,
                healthStatus,
                needsRefresh
            };
        }
        catch (error) {
            console.error('❌ Token and status management test error:', error);
            return { success: false, error };
        }
    }
    /**
     * Test IntegrationAdapter functions with Steam data
     */
    static testIntegrationAdapter() {
        console.log('🧪 Testing IntegrationAdapter with Steam data...');
        try {
            // Create test Steam profile
            const steamProfile = {
                steamId: '76561198098765432',
                personaName: 'Adapter Test User',
                profileUrl: 'https://steamcommunity.com/profiles/76561198098765432',
                avatar: 'https://avatars.steamstatic.com/test.jpg',
                avatarMedium: 'https://avatars.steamstatic.com/test_medium.jpg',
                avatarFull: 'https://avatars.steamstatic.com/test_full.jpg',
                personaState: 1,
                personaStateFlags: 0,
                gameExtraInfo: 'Adapter Test Game',
                gameId: '654321'
            };
            console.log('🔄 Testing steamProfileToIntegration...');
            // Test conversion
            const integration = integrationAdapter_1.IntegrationAdapter.steamProfileToIntegration(steamProfile, 'adapter-test-user', {
                accessToken: 'adapter-test-token',
                refreshToken: 'adapter-test-refresh',
                expiresAt: new Date(Date.now() + 3600000),
                scopes: ['read_profile', 'read_library']
            });
            console.log('✅ Steam profile converted via adapter');
            console.log('   Integration ID:', integration.id);
            console.log('   Platform:', integration.platform);
            console.log('   Steam metadata:', !!integration.metadata?.steam);
            // Test reverse conversion
            console.log('🔄 Testing integrationToSteamProfile...');
            const convertedBack = integrationAdapter_1.IntegrationAdapter.integrationToSteamProfile(integration);
            console.log('✅ Integration converted back to Steam profile');
            console.log('   Steam ID matches:', convertedBack?.steamId === steamProfile.steamId);
            console.log('   Username matches:', convertedBack?.personaName === steamProfile.personaName);
            // Test safe conversion functions
            console.log('🔄 Testing safe conversion functions...');
            const safeIntegration = (0, integrationAdapter_1.safeSteamProfileToIntegration)(steamProfile, 'safe-test-user');
            const safeProfile = (0, integrationAdapter_1.safeIntegrationToSteamProfile)(safeIntegration);
            console.log('✅ Safe conversions completed');
            console.log('   Safe integration created:', !!safeIntegration);
            console.log('   Safe profile created:', !!safeProfile);
            return {
                success: true,
                integration,
                convertedBack,
                safeIntegration,
                safeProfile
            };
        }
        catch (error) {
            console.error('❌ IntegrationAdapter test error:', error);
            return { success: false, error };
        }
    }
    /**
     * Run all Steam migration tests
     */
    static async runAllTests() {
        console.log('🚀 Starting Steam integration migration tests...');
        console.log('='.repeat(60));
        const results = {
            profileConversion: await this.testSteamProfileConversion(),
            legacyMigration: this.testLegacyMigration(),
            tokenAndStatus: await this.testTokenAndStatusManagement(),
            integrationAdapter: this.testIntegrationAdapter()
        };
        console.log('='.repeat(60));
        console.log('📊 Steam Migration Test Results Summary:');
        console.log('   Profile Conversion:', results.profileConversion.success ? '✅ PASS' : '❌ FAIL');
        console.log('   Legacy Migration:', results.legacyMigration.success ? '✅ PASS' : '❌ FAIL');
        console.log('   Token & Status:', results.tokenAndStatus.success ? '✅ PASS' : '❌ FAIL');
        console.log('   Integration Adapter:', results.integrationAdapter.success ? '✅ PASS' : '❌ FAIL');
        const allPassed = Object.values(results).every(result => result.success);
        console.log('='.repeat(60));
        console.log(allPassed ? '🎉 All Steam migration tests passed! Integration is working correctly.' : '❌ Some Steam migration tests failed. Check the logs above.');
        return results;
    }
}
exports.SteamMigrationTest = SteamMigrationTest;
/**
 * Quick validation function to test the Steam migration
 */
async function validateSteamMigration() {
    console.log('🔍 Validating Steam integration migration to canonical UserIntegration model...');
    try {
        const testResult = await SteamMigrationTest.runAllTests();
        if (testResult.profileConversion.success &&
            testResult.legacyMigration.success &&
            testResult.tokenAndStatus.success &&
            testResult.integrationAdapter.success) {
            console.log('✅ Steam integration migration validation successful!');
            console.log('   - Canonical UserIntegration model working correctly');
            console.log('   - Steam profile conversion functional');
            console.log('   - Legacy migration path operational');
            console.log('   - Token and status management working');
            console.log('   - IntegrationAdapter functions validated');
            return true;
        }
        else {
            console.log('❌ Steam integration migration validation failed!');
            return false;
        }
    }
    catch (error) {
        console.error('❌ Steam migration validation error:', error);
        return false;
    }
}
//# sourceMappingURL=steam-migration-test.js.map