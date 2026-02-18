"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moodStrategy = exports.MoodStrategy = void 0;
const static_data_1 = require("@gamepilot/static-data");
// Static moods data
const MOOD_DATA = [
    {
        id: 'chill',
        name: 'Chill',
        emoji: '😌',
        color: 'from-blue-500 to-cyan-600',
        description: 'Relaxing and low-stress gaming experiences',
        intensity: 30
    },
    {
        id: 'competitive',
        name: 'Competitive',
        emoji: '🔥',
        color: 'from-red-500 to-orange-600',
        description: 'Intense competitive gameplay and challenges',
        intensity: 90
    },
    {
        id: 'story',
        name: 'Story',
        emoji: '📚',
        color: 'from-purple-500 to-pink-600',
        description: 'Narrative-driven and story-rich games',
        intensity: 50
    },
    {
        id: 'creative',
        name: 'Creative',
        emoji: '🎨',
        color: 'from-green-500 to-emerald-600',
        description: 'Building, crafting, and creative expression',
        intensity: 40
    },
    {
        id: 'social',
        name: 'Social',
        emoji: '👥',
        color: 'from-teal-500 to-cyan-600',
        description: 'Multiplayer and community-focused games',
        intensity: 60
    },
    {
        id: 'focused',
        name: 'Focused',
        emoji: '🎯',
        color: 'from-indigo-500 to-purple-600',
        description: 'Deep concentration and strategic thinking',
        intensity: 70
    },
    {
        id: 'energetic',
        name: 'Energetic',
        emoji: '⚡',
        color: 'from-orange-500 to-yellow-600',
        description: 'Fast-paced and action-packed gameplay',
        intensity: 80
    },
    {
        id: 'exploratory',
        name: 'Exploratory',
        emoji: '🗺️',
        color: 'from-green-500 to-teal-600',
        description: 'Discovery and open-world exploration',
        intensity: 45
    }
];
class MoodStrategy {
    /**
     * Compute current mood based on recent gaming sessions
     */
    computeCurrentMood(sessions) {
        if (sessions.length === 0)
            return 'chill';
        // Get recent sessions (last 7 days)
        const recentSessions = sessions.filter(session => {
            const sessionDate = new Date(session.startTime);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return sessionDate >= weekAgo;
        });
        if (recentSessions.length === 0)
            return 'chill';
        // Calculate mood scores based on sessions
        const moodScores = {};
        recentSessions.forEach(session => {
            const score = this.calculateSessionMoodScore(session);
            moodScores[session.mood] = (moodScores[session.mood] || 0) + score;
        });
        // Find mood with highest score
        let bestMood = 'chill';
        let bestScore = 0;
        Object.entries(moodScores).forEach(([mood, score]) => {
            if (score > bestScore) {
                bestScore = score;
                bestMood = mood;
            }
        });
        return bestMood;
    }
    /**
     * Calculate mood score for a single session
     */
    calculateSessionMoodScore(session) {
        const baseScore = 1;
        const intensityMultiplier = session.intensity / 10;
        const durationMultiplier = Math.min(session.duration || 60, 180) / 60; // Cap at 3 hours
        const recencyMultiplier = this.calculateRecencyMultiplier(session.startTime);
        return baseScore * intensityMultiplier * durationMultiplier * recencyMultiplier;
    }
    /**
     * Calculate recency multiplier - more recent sessions have higher impact
     */
    calculateRecencyMultiplier(sessionTime) {
        const sessionDate = new Date(sessionTime);
        const now = new Date();
        const hoursDiff = (now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60);
        // Decay over time: 1.0 for very recent, 0.1 for week-old
        return Math.max(0.1, 1 - (hoursDiff / (24 * 7)));
    }
    /**
     * Update mood preferences based on new session
     */
    updateMoodPreferences(currentMoods, newSession) {
        const updatedMoods = [...currentMoods];
        const moodIndex = updatedMoods.findIndex(m => m.id === newSession.mood);
        if (moodIndex >= 0) {
            // Update existing mood
            const mood = updatedMoods[moodIndex];
            mood.lastExperienced = new Date();
            // Adjust preference based on session rating
            if (newSession.rating) {
                const ratingAdjustment = (newSession.rating - 3) * 5; // -10 to +10
                mood.preference = Math.max(0, Math.min(100, mood.preference + ratingAdjustment));
            }
            // Update frequency (simple moving average)
            const currentFreq = mood.frequency;
            mood.frequency = Math.round((currentFreq * 0.8) + (1 * 0.2)); // Gradual increase
        }
        else {
            // Add new mood
            const moodData = static_data_1.MOODS.find(m => m.id === newSession.mood);
            if (moodData) {
                updatedMoods.push({
                    id: newSession.mood,
                    preference: 50, // Default preference
                    frequency: 1,
                    lastExperienced: new Date(),
                    associatedGenres: moodData.associatedGenres
                });
            }
        }
        return updatedMoods;
    }
    /**
     * Get mood recommendations based on current state
     */
    getMoodRecommendations(currentMoods, timeOfDay) {
        const timeBasedMoods = {
            morning: ['energetic', 'focused', 'chill'],
            afternoon: ['competitive', 'social', 'focused'],
            evening: ['story', 'creative', 'social'],
            night: ['chill', 'story', 'exploratory']
        };
        const suggestions = timeBasedMoods[timeOfDay] || ['chill'];
        // Filter by user preferences and sort by preference
        return suggestions
            .map((moodId) => ({
            moodId,
            userMood: currentMoods.find((m) => m.id === moodId)
        }))
            .filter(item => !item.userMood || item.userMood.preference > 30)
            .sort((a, b) => (b.userMood?.preference || 50) - (a.userMood?.preference || 50))
            .map(item => item.moodId);
    }
    /**
     * Initialize user mood profile with default moods
     */
    initializeUserMoodProfile() {
        const defaultMoods = static_data_1.MOODS.map(mood => ({
            id: mood.id,
            preference: 50, // Default neutral preference
            frequency: 0, // No initial frequency
            associatedGenres: mood.associatedGenres || []
        }));
        return defaultMoods;
    }
    /**
     * Map games to moods based on their genres and tags
     */
    mapGamesToMoods(games) {
        const mappings = [];
        games.forEach(game => {
            const gameGenres = game.genres || [];
            const gameTags = game.tags || [];
            const moodScores = {};
            // Calculate mood scores based on genres
            gameGenres.forEach((genre) => {
                const associatedMoods = this.getGenreMoodMapping()[genre.toLowerCase()] || [];
                associatedMoods.forEach(moodId => {
                    moodScores[moodId] = (moodScores[moodId] || 0) + 30;
                });
            });
            // Calculate mood scores based on tags
            gameTags.forEach((tag) => {
                const tagLower = tag.toLowerCase();
                // Tag-based mood mapping
                if (tagLower.includes('competitive') || tagLower.includes('pvp') || tagLower.includes('multiplayer')) {
                    moodScores['competitive'] = (moodScores['competitive'] || 0) + 40;
                    moodScores['social'] = (moodScores['social'] || 0) + 30;
                }
                if (tagLower.includes('relaxing') || tagLower.includes('casual') || tagLower.includes('peaceful')) {
                    moodScores['chill'] = (moodScores['chill'] || 0) + 40;
                }
                if (tagLower.includes('story') || tagLower.includes('narrative') || tagLower.includes('campaign')) {
                    moodScores['story'] = (moodScores['story'] || 0) + 40;
                }
                if (tagLower.includes('creative') || tagLower.includes('building') || tagLower.includes('crafting')) {
                    moodScores['creative'] = (moodScores['creative'] || 0) + 40;
                }
                if (tagLower.includes('exploration') || tagLower.includes('open-world') || tagLower.includes('discovery')) {
                    moodScores['exploratory'] = (moodScores['exploratory'] || 0) + 40;
                }
                if (tagLower.includes('fast-paced') || tagLower.includes('action') || tagLower.includes('intense')) {
                    moodScores['energetic'] = (moodScores['energetic'] || 0) + 40;
                }
            });
            // Find the best matching mood
            let bestMoodId = 'chill'; // default
            let bestScore = 0;
            Object.entries(moodScores).forEach(([moodId, score]) => {
                if (score > bestScore) {
                    bestScore = score;
                    bestMoodId = moodId;
                }
            });
            // Generate reasons for the mood match
            const reasons = [];
            const bestMood = MOOD_DATA.find(m => m.id === bestMoodId);
            if (bestMood) {
                if (moodScores[bestMoodId] >= 70) {
                    reasons.push(`Perfect match for ${bestMood.name} mood`);
                }
                else if (moodScores[bestMoodId] >= 50) {
                    reasons.push(`Good fit for ${bestMood.name} mood`);
                }
                else {
                    reasons.push(`Decent match for ${bestMood.name} mood`);
                }
                // Add specific reasons based on genres and tags
                if (gameGenres.some((g) => this.getGenreMoodMapping()[g.toLowerCase()]?.includes(bestMoodId))) {
                    reasons.push(`Genre alignment with ${bestMood.name}`);
                }
                if (gameTags.some((t) => t.toLowerCase().includes(bestMood.name.toLowerCase()))) {
                    reasons.push(`Tag matches your ${bestMood.name} preference`);
                }
            }
            mappings.push({
                gameId: game.id,
                moodId: bestMoodId,
                score: bestScore,
                reasons: reasons.slice(0, 3) // Max 3 reasons
            });
        });
        return mappings;
    }
    /**
     * Get mood recommendations for a specific mood
     */
    getMoodRecommendationsForTarget(games, targetMoodId, limit = 5) {
        const mappings = this.mapGamesToMoods(games);
        // Filter by target mood and sort by score
        const recommendations = mappings
            .filter(mapping => mapping.moodId === targetMoodId)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
        // Return the actual game objects
        return recommendations
            .map(mapping => games.find(game => game.id === mapping.gameId))
            .filter(Boolean); // Remove any undefined entries
    }
    /**
     * Get all available moods
     */
    getMoods() {
        return MOOD_DATA;
    }
    /**
     * Get genre to mood mapping for recommendations
     */
    getGenreMoodMapping() {
        return {
            'action': ['competitive', 'energetic', 'focused'],
            'rpg': ['story', 'exploratory', 'focused'],
            'adventure': ['exploratory', 'story', 'chill'],
            'strategy': ['focused', 'competitive', 'creative'],
            'simulation': ['creative', 'chill', 'focused'],
            'sports': ['competitive', 'energetic', 'social'],
            'racing': ['energetic', 'competitive', 'focused'],
            'puzzle': ['focused', 'creative', 'chill']
        };
    }
}
exports.MoodStrategy = MoodStrategy;
// Export singleton instance
exports.moodStrategy = new MoodStrategy();
