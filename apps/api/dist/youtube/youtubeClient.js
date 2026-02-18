"use strict";
// YouTube Integration Client - Now uses canonical UserIntegration model
// This client provides YouTube API integration with canonical UserIntegration support
Object.defineProperty(exports, "__esModule", { value: true });
exports.getYouTubeProfile = getYouTubeProfile;
exports.getYouTubeIntegration = getYouTubeIntegration;
exports.migrateLegacyYouTubeIntegration = migrateLegacyYouTubeIntegration;
exports.updateYouTubeTokens = updateYouTubeTokens;
exports.updateYouTubeStatus = updateYouTubeStatus;
exports.validateYouTubeIntegration = validateYouTubeIntegration;
exports.getYouTubeVideos = getYouTubeVideos;
exports.searchYouTubeVideos = searchYouTubeVideos;
const integrationAdapter_1 = require("../adapters/integrationAdapter");
/**
 * Get YouTube profile and convert to canonical UserIntegration
 * Now returns canonical UserIntegration
 */
async function getYouTubeProfile(userId) {
    console.log(' Fetching YouTube profile for canonical integration...');
    // This is a mock implementation
    // In a real implementation, you would:
    // 1. Get YouTube API key from environment variables
    // 2. Make HTTP request to YouTube Data API v3
    // 3. Parse and return the response
    const mockProfile = {
        id: 'UC123456789012345678',
        kind: 'youtube#channel',
        etag: '"abcdef123456"',
        snippet: {
            title: 'GamePilot Channel',
            description: 'Gaming content, reviews, and walkthroughs',
            customUrl: 'gamepilot',
            publishedAt: '2020-01-15T10:00:00Z',
            thumbnails: {
                default: { url: 'https://i.ytimg.com/i/default.jpg', width: 88, height: 88 },
                medium: { url: 'https://i.ytimg.com/i/medium.jpg', width: 240, height: 240 },
                high: { url: 'https://i.ytimg.com/i/high.jpg', width: 800, height: 800 }
            },
            defaultLanguage: 'en',
            localized: {
                title: 'GamePilot Channel',
                description: 'Gaming content, reviews, and walkthroughs'
            }
        },
        contentDetails: {
            relatedPlaylists: {
                likes: 'LL123456789012345678',
                uploads: 'UU123456789012345678'
            }
        },
        statistics: {
            viewCount: '1234567',
            subscriberCount: '89012',
            hiddenSubscriberCount: false,
            videoCount: '345'
        },
        topicDetails: {
            topicCategories: [
                {
                    id: '/m/02vx4',
                    assigner: 'Freebase'
                }
            ]
        },
        status: {
            privacyStatus: 'public',
            isLinked: true,
            longUploadsStatus: 'allowed'
        }
    };
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('✅ YouTube profile fetched, ready for canonical conversion');
    return mockProfile;
}
/**
 * Get YouTube profile as canonical UserIntegration
 * New function that returns the canonical UserIntegration model
 */
async function getYouTubeIntegration(userId, authData) {
    console.log('🔄 Converting YouTube profile to canonical UserIntegration for user:', userId);
    try {
        // Get the YouTube profile
        const youtubeProfile = await getYouTubeProfile(userId);
        // Convert to canonical UserIntegration using the adapter
        const canonicalIntegration = integrationAdapter_1.IntegrationAdapter.fromConnectionData('youtube', userId, youtubeProfile.id, youtubeProfile.snippet.title, authData || {});
        // Add YouTube-specific metadata
        canonicalIntegration.metadata.youtube = {
            channelTitle: youtubeProfile.snippet.title,
            subscriberCount: parseInt(youtubeProfile.statistics.subscriberCount),
            videoCount: parseInt(youtubeProfile.statistics.videoCount),
            viewCount: parseInt(youtubeProfile.statistics.viewCount),
            publishedAt: new Date(youtubeProfile.snippet.publishedAt)
        };
        console.log('✅ YouTube profile converted to canonical UserIntegration:', canonicalIntegration.id);
        return canonicalIntegration;
    }
    catch (error) {
        console.error('❌ Failed to convert YouTube profile to canonical UserIntegration:', error);
        throw new Error(`YouTube integration conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
/**
 * Migrate legacy YouTube integration to canonical UserIntegration
 * Used when upgrading existing YouTube integrations to the new model
 */
function migrateLegacyYouTubeIntegration(legacyProfile, userId, additionalData) {
    console.log('🔄 Migrating legacy YouTube integration to canonical UserIntegration');
    console.log('   Legacy YouTube ID:', legacyProfile.id);
    console.log('   Target User ID:', userId);
    // Use the adapter to convert legacy data to canonical format
    const canonicalIntegration = integrationAdapter_1.IntegrationAdapter.fromConnectionData('youtube', userId, legacyProfile.id, legacyProfile.snippet.title, additionalData || {});
    // Add YouTube-specific metadata
    canonicalIntegration.metadata.youtube = {
        channelTitle: legacyProfile.snippet.title,
        subscriberCount: parseInt(legacyProfile.statistics.subscriberCount),
        videoCount: parseInt(legacyProfile.statistics.videoCount),
        viewCount: parseInt(legacyProfile.statistics.viewCount),
        publishedAt: new Date(legacyProfile.snippet.publishedAt)
    };
    console.log('✅ Legacy YouTube integration migrated to canonical format');
    return canonicalIntegration;
}
/**
 * Update YouTube integration tokens
 * Uses canonical UserIntegration model for token management
 */
function updateYouTubeTokens(integration, tokenData) {
    console.log('🔄 Updating YouTube integration tokens for:', integration.id);
    // Use the adapter to update tokens
    const updatedIntegration = integrationAdapter_1.IntegrationAdapter.updateTokens(integration, tokenData);
    console.log('✅ YouTube integration tokens updated');
    return updatedIntegration;
}
/**
 * Update YouTube integration status
 * Uses canonical UserIntegration model for status management
 */
function updateYouTubeStatus(integration, status, errorCount) {
    console.log('🔄 Updating YouTube integration status for:', integration.id);
    console.log('   New status:', status);
    // Use the adapter to update status
    const updatedIntegration = integrationAdapter_1.IntegrationAdapter.updateStatus(integration, status, errorCount);
    console.log('✅ YouTube integration status updated');
    return updatedIntegration;
}
/**
 * Validate YouTube integration
 * Uses canonical UserIntegration model for validation
 */
function validateYouTubeIntegration(integration) {
    console.log('🔍 Validating YouTube integration:', integration.id);
    // Use the adapter for validation
    const validation = integrationAdapter_1.IntegrationAdapter.validateForAuth(integration);
    // Additional YouTube-specific validation
    const youtubeSpecificErrors = [];
    if (integration.platform !== 'youtube') {
        youtubeSpecificErrors.push('Integration platform is not YouTube');
    }
    if (!integration.externalUserId) {
        youtubeSpecificErrors.push('YouTube channel ID is missing');
    }
    if (!integration.metadata?.youtube) {
        youtubeSpecificErrors.push('YouTube metadata is missing');
    }
    const allErrors = [...validation.errors, ...youtubeSpecificErrors];
    const isValid = allErrors.length === 0;
    console.log('✅ YouTube integration validation completed:', isValid ? 'VALID' : 'INVALID');
    if (!isValid) {
        console.log('   Errors:', allErrors);
    }
    return { isValid, errors: allErrors };
}
/**
 * Get YouTube videos for user
 * Uses canonical UserIntegration model for user context
 */
async function getYouTubeVideos(userId, maxResults = 10) {
    console.log('🎥 Getting YouTube videos for user:', userId);
    // Mock video data - in production this would fetch from YouTube Data API v3
    const mockVideos = [
        {
            id: 'abc123def456',
            kind: 'youtube#video',
            etag: '"video-etag-123"',
            snippet: {
                publishedAt: '2023-12-01T15:00:00Z',
                channelId: 'UC123456789012345678',
                title: 'Cyberpunk 2077: Phantom Liberty - Complete Review',
                description: 'In-depth review of the Phantom Liberty expansion...',
                thumbnails: {
                    default: { url: 'https://i.ytimg.com/vi/abc123def456/default.jpg', width: 120, height: 90 },
                    medium: { url: 'https://i.ytimg.com/vi/abc123def456/mqdefault.jpg', width: 320, height: 180 },
                    high: { url: 'https://i.ytimg.com/vi/abc123def456/hqdefault.jpg', width: 480, height: 360 }
                },
                channelTitle: 'GamePilot Channel',
                tags: ['gaming', 'cyberpunk', 'review', 'rpg'],
                categoryId: '20',
                liveBroadcastContent: 'none',
                defaultLanguage: 'en',
                localized: {
                    title: 'Cyberpunk 2077: Phantom Liberty - Complete Review',
                    description: 'In-depth review of the Phantom Liberty expansion...'
                }
            },
            contentDetails: {
                duration: 'PT25M30S',
                dimension: '2d',
                definition: 'hd',
                caption: 'true',
                licensedContent: true
            },
            statistics: {
                viewCount: '12345',
                likeCount: '890',
                dislikeCount: '0',
                commentCount: '123'
            },
            status: {
                uploadStatus: 'processed',
                privacyStatus: 'public',
                license: 'youtube',
                embeddable: true,
                publicStatsViewable: true
            }
        },
        {
            id: 'ghi789jkl012',
            kind: 'youtube#video',
            etag: '"video-etag-456"',
            snippet: {
                publishedAt: '2023-11-28T18:30:00Z',
                channelId: 'UC123456789012345678',
                title: 'Top 10 RPG Games of 2023',
                description: 'Our picks for the best RPG games released this year...',
                thumbnails: {
                    default: { url: 'https://i.ytimg.com/vi/ghi789jkl012/default.jpg', width: 120, height: 90 },
                    medium: { url: 'https://i.ytimg.com/vi/ghi789jkl012/mqdefault.jpg', width: 320, height: 180 },
                    high: { url: 'https://i.ytimg.com/vi/ghi789jkl012/hqdefault.jpg', width: 480, height: 360 }
                },
                channelTitle: 'GamePilot Channel',
                tags: ['gaming', 'rpg', 'top10', '2023'],
                categoryId: '20',
                liveBroadcastContent: 'none',
                defaultLanguage: 'en',
                localized: {
                    title: 'Top 10 RPG Games of 2023',
                    description: 'Our picks for the best RPG games released this year...'
                }
            },
            contentDetails: {
                duration: 'PT18M45S',
                dimension: '2d',
                definition: 'hd',
                caption: 'true',
                licensedContent: true
            },
            statistics: {
                viewCount: '23456',
                likeCount: '1234',
                dislikeCount: '0',
                commentCount: '234'
            },
            status: {
                uploadStatus: 'processed',
                privacyStatus: 'public',
                license: 'youtube',
                embeddable: true,
                publicStatsViewable: true
            }
        }
    ];
    // Limit results
    const limitedVideos = mockVideos.slice(0, maxResults);
    console.log('✅ Retrieved', limitedVideos.length, 'YouTube videos');
    return limitedVideos;
}
/**
 * Search YouTube videos for gaming content
 * Uses canonical UserIntegration model for user context
 */
async function searchYouTubeVideos(userId, query, maxResults = 10) {
    console.log('🔍 Searching YouTube videos for user:', userId);
    console.log('   Query:', query);
    // Mock search results - in production this would fetch from YouTube Data API v3
    const mockSearchResults = [
        {
            id: 'mno345pqr678',
            kind: 'youtube#video',
            etag: '"search-etag-123"',
            snippet: {
                publishedAt: '2023-11-25T12:00:00Z',
                channelId: 'UC987654321098765432',
                title: `Best ${query} Games - Ultimate Guide`,
                description: `Complete guide to the best ${query} games available...`,
                thumbnails: {
                    default: { url: 'https://i.ytimg.com/vi/mno345pqr678/default.jpg', width: 120, height: 90 },
                    medium: { url: 'https://i.ytimg.com/vi/mno345pqr678/mqdefault.jpg', width: 320, height: 180 },
                    high: { url: 'https://i.ytimg.com/vi/mno345pqr678/hqdefault.jpg', width: 480, height: 360 }
                },
                channelTitle: 'Gaming Central',
                liveBroadcastContent: 'none'
            }
        }
    ];
    // Limit results
    const limitedResults = mockSearchResults.slice(0, maxResults);
    console.log('✅ Search returned', limitedResults.length, 'results');
    return limitedResults;
}
//# sourceMappingURL=youtubeClient.js.map