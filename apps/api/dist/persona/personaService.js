"use strict";
// Persona Service
// Core service for persona management, updates, and scoring
Object.defineProperty(exports, "__esModule", { value: true });
exports.personaService = exports.PersonaService = void 0;
const database_1 = require("../services/database");
const shared_1 = require("@gamepilot/shared");
/**
 * Persona Service - Manages user personas with real-time updates
 */
class PersonaService {
    static getInstance() {
        if (!PersonaService.instance) {
            PersonaService.instance = new PersonaService();
        }
        return PersonaService.instance;
    }
    constructor() {
        console.log('🧠 PersonaService initialized');
    }
    /**
     * Get user's current persona
     */
    async getPersona(userId) {
        try {
            console.log('🔍 Getting persona for user:', userId);
            // Get persona from database
            const personaData = await database_1.databaseService.getPersona(userId);
            if (!personaData) {
                console.log('📝 No persona found, creating default for user:', userId);
                return await this.createDefaultPersona(userId);
            }
            // Convert database data to UnifiedPersona
            const persona = this.mapDatabasePersona(personaData);
            // Check if persona needs refresh (older than 24 hours)
            const needsRefresh = this.shouldRefreshPersona(persona);
            if (needsRefresh) {
                console.log('🔄 Refreshing persona for user:', userId);
                return await this.refreshPersona(userId, persona);
            }
            return persona;
        }
        catch (error) {
            console.error('❌ Error getting persona:', error);
            return null;
        }
    }
    /**
     * Update persona with new data
     */
    async updatePersona(userId, update) {
        try {
            console.log('🔄 Updating persona for user:', userId, 'type:', Object.keys(update)[0]);
            // Get current persona
            const currentPersona = await this.getPersona(userId);
            if (!currentPersona) {
                throw new Error('Persona not found for user');
            }
            // Apply updates based on type
            let updatedPersona = { ...currentPersona };
            if (update.mood) {
                updatedPersona = await this.updateMood(updatedPersona, update.mood);
            }
            if (update.intent) {
                updatedPersona = await this.updateIntent(updatedPersona, update.intent);
            }
            if (update.behavior) {
                updatedPersona = await this.updateBehavioralPatterns(updatedPersona, update.behavior);
            }
            if (update.event) {
                updatedPersona = await this.processPersonaEvent(updatedPersona, update.event);
            }
            // Recompute derived values
            updatedPersona = await this.recomputePersona(updatedPersona);
            // Update timestamp
            updatedPersona.lastUpdated = new Date();
            // Save to database
            await database_1.databaseService.updatePersona(userId, updatedPersona);
            console.log('✅ Persona updated successfully for user:', userId);
            return updatedPersona;
        }
        catch (error) {
            console.error('❌ Error updating persona:', error);
            throw error;
        }
    }
    /**
     * Generate persona state for recommendation engine
     */
    async getPersonaState(userId) {
        try {
            const persona = await this.getPersona(userId);
            if (!persona)
                return null;
            return this.buildPersonaState(persona);
        }
        catch (error) {
            console.error('❌ Error building persona state:', error);
            return null;
        }
    }
    /**
     * Analyze persona with latest data
     */
    async analyzePersona(userId) {
        try {
            console.log('🔬 Analyzing persona for user:', userId);
            const startTime = Date.now();
            // Get user's gaming data
            const userData = await this.getUserGamingData(userId);
            // Build IdentityCore from raw data
            const identityCore = {
                raw: userData,
                signals: (0, shared_1.buildPersonaSignals)(userData),
                traits: (0, shared_1.buildPersonaTraits)((0, shared_1.buildPersonaSignals)(userData)),
                moodSignals: this.extractMoodSignals(userData),
                reflection: {} // Will be filled below
            };
            // Build reflection
            identityCore.reflection = (0, shared_1.buildReflection)(identityCore.traits, (0, shared_1.buildMoodState)(identityCore.moodSignals));
            // Create unified persona
            const persona = {
                userId,
                createdAt: new Date(),
                lastUpdated: new Date(),
                traits: this.mapIdentityTraitsToPersonaTraits(identityCore.traits),
                currentMood: this.inferCurrentMood(identityCore.moodSignals),
                currentIntent: this.inferCurrentIntent(this.mapIdentityTraitsToPersonaTraits(identityCore.traits), identityCore.moodSignals),
                moodIntensity: this.calculateMoodIntensity(identityCore.moodSignals),
                patterns: this.extractBehavioralPatterns(userData),
                history: this.buildPersonaHistory(userId),
                signals: identityCore.signals,
                confidence: identityCore.traits.explorer || 0.5, // Use explorer as fallback confidence
                dataPoints: this.countDataPoints(userData),
                lastAnalysisDate: new Date(),
                recommendationContext: this.buildRecommendationContext(identityCore)
            };
            // Build persona state
            const state = this.buildPersonaState(persona);
            // Generate insights
            const insights = this.generatePersonaInsights(persona, identityCore);
            const computationTime = Date.now() - startTime;
            // Save persona
            await database_1.databaseService.updatePersona(userId, persona);
            console.log('✅ Persona analysis completed for user:', userId, `in ${computationTime}ms`);
            return {
                persona,
                state,
                insights,
                metadata: {
                    analysisDate: new Date(),
                    dataPointsUsed: persona.dataPoints,
                    computationTime
                }
            };
        }
        catch (error) {
            console.error('❌ Error analyzing persona:', error);
            throw error;
        }
    }
    /**
     * Process persona update events
     */
    async processPersonaEvent(persona, event) {
        let updatedPersona = { ...persona };
        switch (event.type) {
            case 'mood':
                if (event.data.mood && event.data.intensity) {
                    updatedPersona.currentMood = event.data.mood;
                    updatedPersona.moodIntensity = event.data.intensity;
                    updatedPersona.history.moodHistory.push({
                        mood: event.data.mood,
                        intensity: event.data.intensity,
                        timestamp: event.timestamp,
                        context: event.data.context,
                        gameId: event.context?.gameId
                    });
                }
                break;
            case 'intent':
                if (event.data.intent) {
                    updatedPersona.currentIntent = event.data.intent;
                    updatedPersona.history.intentHistory.push({
                        intent: event.data.intent,
                        timestamp: event.timestamp,
                        success: event.data.success || false,
                        gameId: event.context?.gameId
                    });
                }
                break;
            case 'behavior':
                if (event.data.gameId) {
                    updatedPersona = await this.updateBehavioralPatterns(updatedPersona, event.data);
                }
                break;
            case 'session':
                // Handle session-specific events
                break;
            case 'achievement':
                // Handle achievement events
                break;
        }
        return updatedPersona;
    }
    // Private helper methods
    async createDefaultPersona(userId) {
        const defaultPersona = {
            userId,
            createdAt: new Date(),
            lastUpdated: new Date(),
            traits: {
                archetypeId: 'Casual',
                intensity: 'Medium',
                pacing: 'Flow',
                riskProfile: 'Balanced',
                socialStyle: 'Solo',
                confidence: 0.3 // Low confidence for default persona
            },
            currentMood: 'neutral',
            currentIntent: 'neutral',
            moodIntensity: 5,
            patterns: this.getDefaultBehavioralPatterns(),
            history: this.getDefaultPersonaHistory(),
            signals: this.getDefaultSignals(),
            confidence: 0.3,
            dataPoints: 0,
            lastAnalysisDate: new Date(),
            recommendationContext: this.getDefaultRecommendationContext()
        };
        await database_1.databaseService.createPersona(userId, defaultPersona);
        return defaultPersona;
    }
    shouldRefreshPersona(persona) {
        const hoursSinceLastUpdate = (Date.now() - persona.lastAnalysisDate.getTime()) / (1000 * 60 * 60);
        return hoursSinceLastUpdate > 24;
    }
    async refreshPersona(userId, persona) {
        // Re-analyze persona with latest data
        const analysis = await this.analyzePersona(userId);
        return analysis.persona;
    }
    mapDatabasePersona(dbPersona) {
        // Convert database persona to UnifiedPersona format
        return {
            ...dbPersona,
            createdAt: new Date(dbPersona.createdAt),
            lastUpdated: new Date(dbPersona.lastUpdated),
            lastAnalysisDate: new Date(dbPersona.lastAnalysisDate),
            patterns: {
                ...dbPersona.patterns,
                recentGames: dbPersona.patterns?.recentGames?.map((game) => ({
                    ...game,
                    lastPlayed: new Date(game.lastPlayed)
                })) || []
            },
            history: {
                moodHistory: dbPersona.history?.moodHistory?.map((entry) => ({
                    ...entry,
                    timestamp: new Date(entry.timestamp)
                })) || [],
                intentHistory: dbPersona.history?.intentHistory?.map((entry) => ({
                    ...entry,
                    timestamp: new Date(entry.timestamp)
                })) || [],
                traitEvolution: dbPersona.history?.traitEvolution?.map((entry) => ({
                    ...entry,
                    date: new Date(entry.date)
                })) || []
            }
        };
    }
    async updateMood(persona, moodUpdate) {
        const updated = { ...persona };
        updated.currentMood = moodUpdate.mood;
        updated.moodIntensity = moodUpdate.intensity;
        // Add to mood history
        updated.history.moodHistory.push({
            mood: moodUpdate.mood,
            intensity: moodUpdate.intensity,
            timestamp: new Date(),
            context: moodUpdate.context
        });
        // Keep only last 100 mood entries
        if (updated.history.moodHistory.length > 100) {
            updated.history.moodHistory = updated.history.moodHistory.slice(-100);
        }
        return updated;
    }
    async updateIntent(persona, intentUpdate) {
        const updated = { ...persona };
        updated.currentIntent = intentUpdate.intent;
        // Add to intent history
        updated.history.intentHistory.push({
            intent: intentUpdate.intent,
            timestamp: new Date(),
            success: false, // Will be updated when fulfilled
            gameId: undefined
        });
        // Keep only last 50 intent entries
        if (updated.history.intentHistory.length > 50) {
            updated.history.intentHistory = updated.history.intentHistory.slice(-50);
        }
        return updated;
    }
    async updateBehavioralPatterns(persona, behavior) {
        const updated = { ...persona };
        // Update recent games
        const existingGameIndex = updated.patterns.recentGames.findIndex(g => g.gameId === behavior.gameId);
        if (existingGameIndex >= 0) {
            // Update existing game
            const game = updated.patterns.recentGames[existingGameIndex];
            game.sessionCount++;
            game.totalPlaytime += behavior.sessionLength;
            game.lastPlayed = behavior.timestamp;
            game.averageSessionLength = game.totalPlaytime / game.sessionCount;
            game.completionRate = behavior.completed ? (game.completionRate + 1) / 2 : game.completionRate / 2;
        }
        else {
            // Add new game
            updated.patterns.recentGames.push({
                gameId: behavior.gameId,
                gameName: behavior.gameName || 'Unknown Game',
                sessionCount: 1,
                totalPlaytime: behavior.sessionLength,
                lastPlayed: behavior.timestamp,
                averageSessionLength: behavior.sessionLength,
                completionRate: behavior.completed ? 1 : 0
            });
        }
        // Keep only last 50 games
        if (updated.patterns.recentGames.length > 50) {
            updated.patterns.recentGames = updated.patterns.recentGames.slice(-50);
        }
        // Update session patterns
        updated.patterns.sessionPatterns.averageLength =
            (updated.patterns.sessionPatterns.averageLength + behavior.sessionLength) / 2;
        const hour = behavior.timestamp.getHours();
        updated.patterns.sessionPatterns.preferredTimes.push(hour);
        // Keep only last 100 session times
        if (updated.patterns.sessionPatterns.preferredTimes.length > 100) {
            updated.patterns.sessionPatterns.preferredTimes = updated.patterns.sessionPatterns.preferredTimes.slice(-100);
        }
        return updated;
    }
    async recomputePersona(persona) {
        // Recompute derived values based on updated data
        const updated = { ...persona };
        // Update confidence based on data points
        updated.confidence = Math.min(persona.dataPoints / 50, 1); // Max confidence at 50 data points
        // Update recommendation context based on patterns
        updated.recommendationContext = this.buildRecommendationContextFromPatterns(persona.patterns);
        return updated;
    }
    buildPersonaState(persona) {
        return {
            userId: persona.userId,
            archetype: persona.traits.archetypeId,
            mood: persona.currentMood,
            intent: persona.currentIntent,
            sessionLengthPreference: persona.patterns.sessionPatterns.averageLength,
            genreAffinities: persona.signals.genreAffinity || {},
            difficultyPreference: this.mapDifficultyToScale(persona.recommendationContext.difficultyPreference),
            socialPreference: this.mapSocialToScale(persona.recommendationContext.socialPreference),
            timeOfDay: new Date().getHours(),
            dayOfWeek: new Date().getDay(),
            recentGames: persona.patterns.recentGames.slice(0, 10).map(g => g.gameId),
            confidence: persona.confidence,
            dataFreshness: this.calculateDataFreshness(persona.lastAnalysisDate)
        };
    }
    /**
     * Fetch all gaming data for a user to power the Identity Engine
     */
    async getUserGamingData(userId) {
        console.log('📊 Fetching real gaming data for persona analysis:', userId);
        // Fetch games from database
        const games = await database_1.databaseService.getUserGames(userId);
        const sessions = await database_1.databaseService.getGameSessionHistory(userId);
        // Transform into Identity Engine format
        const steamGames = games.filter(g => g.appId);
        const playtime = {};
        const genres = {};
        games.forEach(g => {
            const id = g.appId?.toString() || g.id;
            playtime[id] = g.hoursPlayed || 0;
            g.genres.forEach((genre) => {
                const genreName = typeof genre === 'string' ? genre : genre.name;
                genres[genreName] = (genres[genreName] || 0) + 1;
            });
        });
        return {
            steam: {
                games: games.map(g => ({
                    appId: g.appId,
                    name: g.title,
                    playtimeForever: (g.hoursPlayed || 0) * 60,
                    genres: g.genres.map((gen) => typeof gen === 'string' ? gen : gen.name)
                })),
                playtime,
                genres,
                achievements: {}, // TODO: Fetch real achievements
                sessions: sessions.map(s => ({
                    gameId: s.gameId,
                    duration: s.duration || 0,
                    timestamp: s.startedAt
                }))
            }
        };
    }
    /**
     * Map raw Identity Engine traits to User-facing Persona traits
     */
    mapIdentityTraitsToPersonaTraits(traits) {
        // Determine archetype based on highest score
        const scores = [
            { id: 'Achiever', score: traits.completionist },
            { id: 'Explorer', score: traits.explorer },
            { id: 'Competitor', score: traits.competitor },
            { id: 'Strategist', score: traits.strategist },
            { id: 'Casual', score: traits.adventurer }
        ];
        const topArchetype = scores.sort((a, b) => b.score - a.score)[0];
        return {
            archetypeId: topArchetype.id,
            intensity: traits.competitor > 0.6 ? 'High' : traits.adventurer > 0.6 ? 'Low' : 'Medium',
            pacing: traits.strategist > 0.6 ? 'Marathon' : 'Flow',
            riskProfile: traits.explorer > 0.6 ? 'Experimental' : 'Balanced',
            socialStyle: traits.competitor > 0.5 ? 'Competitive' : 'Solo',
            confidence: Math.max(...scores.map(s => s.score))
        };
    }
    /**
     * Infer current mood based on recent gaming activity
     */
    inferCurrentMood(moodSignals) {
        // If we have recent data points, we can infer mood
        // For now, look at session pattern and genre shift
        if (moodSignals.sessionPattern > 120)
            return 'focused'; // Long sessions = focused
        if (moodSignals.playtimeSpike > 0.5)
            return 'energetic'; // Sudden surge in play = energetic
        if (moodSignals.genreShift > 0.7)
            return 'curious'; // Playing new types of games = curious
        return 'neutral';
    }
    /**
     * Infer current intent based on traits and mood signals
     */
    inferCurrentIntent(traits, moodSignals) {
        if (traits.intensity === 'High' && moodSignals.playtimeSpike > 0.3)
            return 'challenge';
        if (traits.pacing === 'Burst')
            return 'challenge';
        if (moodSignals.genreShift > 0.5)
            return 'exploration';
        return 'neutral';
    }
    /**
     * Calculate mood intensity (1-10)
     */
    calculateMoodIntensity(moodSignals) {
        const base = 5;
        const spikeAdjustment = Math.floor(moodSignals.playtimeSpike * 5);
        return Math.min(10, Math.max(1, base + spikeAdjustment));
    }
    /**
     * Extract behavioral patterns from historical gaming data
     */
    extractBehavioralPatterns(userData) {
        const games = userData.steam?.games || [];
        const sessions = userData.steam?.sessions || [];
        const recentGames = games.slice(0, 10).map((g) => ({
            gameId: g.appId?.toString() || 'unknown',
            gameName: g.name,
            sessionCount: sessions.filter((s) => s.gameId === g.appId?.toString()).length,
            totalPlaytime: g.playtimeForever / 60,
            lastPlayed: new Date(), // Fallback
            averageSessionLength: 0,
            completionRate: 0
        }));
        return {
            ...this.getDefaultBehavioralPatterns(),
            recentGames,
            completionPatterns: {
                gamesCompleted: games.filter((g) => (g.playtimeForever / 60) > 20).length,
                averageCompletionRate: 0.5,
                preferredCompletionTypes: ['main_story'],
                achievementHunting: false
            }
        };
    }
    buildPersonaHistory(userId) {
        return this.getDefaultPersonaHistory();
    }
    /**
     * Extract mood signals from user gaming data
     */
    extractMoodSignals(userData) {
        const sessions = userData.steam?.sessions || [];
        // Calculate session pattern (avg length of recent sessions)
        const recentSessions = sessions.slice(-5);
        const avgLength = recentSessions.length > 0
            ? recentSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / recentSessions.length
            : 0;
        // Calculate playtime spike (recent vs average)
        const allSessions = sessions;
        const totalPlaytime = allSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        const avgPlaytime = allSessions.length > 0 ? totalPlaytime / allSessions.length : 0;
        const spike = avgPlaytime > 0 ? (avgLength / avgPlaytime) - 1 : 0;
        return {
            sessionPattern: avgLength,
            genreShift: 0, // TODO: Implement genre shift detection
            playtimeSpike: Math.max(0, Math.min(1, spike)),
            returnFrequency: 0,
            abandonmentRate: 0
        };
    }
    countDataPoints(userData) {
        const gameCount = userData.steam?.games?.length || 0;
        const sessionCount = userData.steam?.sessions?.length || 0;
        return gameCount + sessionCount;
    }
    buildRecommendationContext(identityCore) {
        return this.getDefaultRecommendationContext();
    }
    buildRecommendationContextFromPatterns(patterns) {
        return this.getDefaultRecommendationContext();
    }
    generatePersonaInsights(persona, identityCore) {
        return {
            dominantTraits: [],
            behaviorPatterns: [],
            recommendations: [],
            confidence: persona.confidence
        };
    }
    getDefaultBehavioralPatterns() {
        return {
            recentGames: [],
            sessionPatterns: {
                averageLength: 60,
                preferredTimes: [],
                sessionsPerWeek: 3,
                lateNightRatio: 0.2,
                weekendRatio: 0.6
            },
            abandonedGames: [],
            completionPatterns: {
                gamesCompleted: 0,
                averageCompletionRate: 0,
                preferredCompletionTypes: [],
                achievementHunting: false
            }
        };
    }
    getDefaultPersonaHistory() {
        return {
            moodHistory: [],
            intentHistory: [],
            traitEvolution: []
        };
    }
    getDefaultSignals() {
        return {
            genreAffinity: {},
            completionRate: 0,
            sessionPattern: 0,
            playtimeDistribution: [],
            multiplayerRatio: 0
        };
    }
    getDefaultRecommendationContext() {
        return {
            preferredGenres: [],
            avoidedGenres: [],
            sessionLengthPreference: 'medium',
            difficultyPreference: 'normal',
            socialPreference: 'any'
        };
    }
    mapDifficultyToScale(difficulty) {
        const map = {
            'easy': 0.25,
            'normal': 0.5,
            'hard': 0.75,
            'adaptive': 0.5
        };
        return map[difficulty] || 0.5;
    }
    mapSocialToScale(social) {
        const map = {
            'solo': 0.1,
            'coop': 0.5,
            'competitive': 0.9,
            'any': 0.5
        };
        return map[social] || 0.5;
    }
    calculateDataFreshness(lastAnalysis) {
        const hoursSince = (Date.now() - lastAnalysis.getTime()) / (1000 * 60 * 60);
        return Math.max(0, 1 - hoursSince / 168); // Decay over 1 week
    }
}
exports.PersonaService = PersonaService;
// Export singleton instance
exports.personaService = PersonaService.getInstance();
//# sourceMappingURL=personaService.js.map