"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoodPersonaService = void 0;
const moodPersona_1 = require("../models/moodPersona");
/**
 * Service for managing mood and persona data persistence
 */
class MoodPersonaService {
    constructor(db) {
        this.db = db;
    }
    // Mood Selection operations
    async createMoodSelection(moodSelection) {
        const id = `mood_selection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        await this.db.run(`
      INSERT INTO mood_selections (
        id, userId, primaryMood, secondaryMood, intensity, sessionId,
        timestamp, context, outcomes, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            id,
            moodSelection.userId,
            moodSelection.primaryMood,
            moodSelection.secondaryMood,
            moodSelection.intensity,
            moodSelection.sessionId,
            moodSelection.timestamp.toISOString(),
            JSON.stringify(moodSelection.context),
            JSON.stringify(moodSelection.outcomes),
            now
        ]);
        return {
            ...moodSelection,
            id,
            createdAt: new Date(now)
        };
    }
    async getMoodSelections(userId, limit = 50) {
        const rows = await this.db.all(`
      SELECT * FROM mood_selections 
      WHERE userId = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `, [userId, limit]);
        return rows.map(moodPersona_1.mapRowToMoodSelection);
    }
    async getRecentMoodSelections(userId, hours = 24) {
        const rows = await this.db.all(`
      SELECT * FROM mood_selections 
      WHERE userId = ? AND timestamp > datetime('now', '-${hours} hours')
      ORDER BY timestamp DESC
    `, [userId]);
        return rows.map(moodPersona_1.mapRowToMoodSelection);
    }
    // Persona Profile operations
    async getPersonaProfile(userId) {
        const row = await this.db.get('SELECT * FROM persona_profile WHERE userId = ?', [userId]);
        if (!row)
            return null;
        return (0, moodPersona_1.mapRowToPersonaProfile)(row);
    }
    async createPersonaProfile(profile) {
        const id = `persona_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        await this.db.run(`
      INSERT INTO persona_profile (
        id, userId, genreWeights, tagWeights, moodAffinity, sessionPatterns,
        hybridSuccess, platformBiases, timePreferences, confidence,
        sampleSize, version, lastUpdated, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            id,
            profile.userId,
            JSON.stringify(profile.genreWeights),
            JSON.stringify(profile.tagWeights),
            JSON.stringify(profile.moodAffinity),
            JSON.stringify(profile.sessionPatterns),
            JSON.stringify(profile.hybridSuccess),
            JSON.stringify(profile.platformBiases),
            JSON.stringify(profile.timePreferences),
            profile.confidence,
            profile.sampleSize,
            profile.version,
            now,
            now,
            now
        ]);
        return {
            ...profile,
            id,
            createdAt: new Date(now),
            updatedAt: new Date(now)
        };
    }
    async updatePersonaProfile(userId, updates) {
        const current = await this.getPersonaProfile(userId);
        if (!current)
            throw new Error('Persona profile not found');
        const updated = {
            ...current,
            ...updates,
            lastUpdated: new Date(),
            updatedAt: new Date()
        };
        await this.db.run(`
      UPDATE persona_profile SET
        genreWeights = ?, tagWeights = ?, moodAffinity = ?, sessionPatterns = ?,
        hybridSuccess = ?, platformBiases = ?, timePreferences = ?,
        confidence = ?, sampleSize = ?, version = ?, lastUpdated = ?, updatedAt = ?
      WHERE userId = ?
    `, [
            JSON.stringify(updated.genreWeights),
            JSON.stringify(updated.tagWeights),
            JSON.stringify(updated.moodAffinity),
            JSON.stringify(updated.sessionPatterns),
            JSON.stringify(updated.hybridSuccess),
            JSON.stringify(updated.platformBiases),
            JSON.stringify(updated.timePreferences),
            updated.confidence,
            updated.sampleSize,
            updated.version,
            updated.lastUpdated.toISOString(),
            updated.updatedAt.toISOString(),
            userId
        ]);
        return updated;
    }
    // User Action operations
    async createUserAction(action) {
        const id = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        await this.db.run(`
      INSERT INTO user_actions (
        id, userId, type, gameId, gameTitle, moodContext, timestamp,
        sessionId, metadata, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            id,
            action.userId,
            action.type,
            action.gameId,
            action.gameTitle,
            action.moodContext ? JSON.stringify(action.moodContext) : null,
            action.timestamp.toISOString(),
            action.sessionId,
            JSON.stringify(action.metadata),
            now
        ]);
        return {
            ...action,
            id,
            createdAt: new Date(now)
        };
    }
    async getUserActions(userId, limit = 100) {
        const rows = await this.db.all(`
      SELECT * FROM user_actions 
      WHERE userId = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `, [userId, limit]);
        return rows.map(moodPersona_1.mapRowToUserAction);
    }
    async getUserActionsByType(userId, type, limit = 50) {
        const rows = await this.db.all(`
      SELECT * FROM user_actions 
      WHERE userId = ? AND type = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `, [userId, type, limit]);
        return rows.map(moodPersona_1.mapRowToUserAction);
    }
    // Recommendation Event operations
    async createRecommendationEvent(event) {
        const id = `rec_event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        await this.db.run(`
      INSERT INTO recommendation_events (
        id, userId, moodContext, recommendedGames, clickedGameId,
        successFlag, timestamp, sessionId, metadata, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            id,
            event.userId,
            JSON.stringify(event.moodContext),
            JSON.stringify(event.recommendedGames),
            event.clickedGameId,
            event.successFlag,
            event.timestamp.toISOString(),
            event.sessionId,
            event.metadata ? JSON.stringify(event.metadata) : null,
            now
        ]);
        return {
            ...event,
            id,
            createdAt: new Date(now)
        };
    }
    async getRecommendationEvents(userId, limit = 50) {
        const rows = await this.db.all(`
      SELECT * FROM recommendation_events 
      WHERE userId = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `, [userId, limit]);
        return rows.map(moodPersona_1.mapRowToRecommendationEvent);
    }
    // Mood Prediction operations
    async createMoodPrediction(prediction) {
        const id = `mood_pred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        await this.db.run(`
      INSERT INTO mood_predictions (
        id, userId, predictedMood, confidence, reasoning, contextualFactors,
        successProbability, acceptedFlag, timestamp, sessionId, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            id,
            prediction.userId,
            prediction.predictedMood,
            prediction.confidence,
            JSON.stringify(prediction.reasoning),
            JSON.stringify(prediction.contextualFactors),
            prediction.successProbability,
            prediction.acceptedFlag,
            prediction.timestamp.toISOString(),
            prediction.sessionId,
            now
        ]);
        return {
            ...prediction,
            id,
            createdAt: new Date(now)
        };
    }
    async getMoodPredictions(userId, limit = 50) {
        const rows = await this.db.all(`
      SELECT * FROM mood_predictions 
      WHERE userId = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `, [userId, limit]);
        return rows.map(moodPersona_1.mapRowToMoodPrediction);
    }
    async updateMoodPrediction(id, updates) {
        const setClause = [];
        const values = [];
        if (updates.acceptedFlag !== undefined) {
            setClause.push('acceptedFlag = ?');
            values.push(updates.acceptedFlag ? 1 : 0);
        }
        if (setClause.length === 0)
            return;
        values.push(id);
        await this.db.run(`
      UPDATE mood_predictions SET ${setClause.join(', ')} WHERE id = ?
    `, values);
    }
    // Mood Pattern operations
    async upsertMoodPattern(pattern) {
        const existing = await this.db.get(`
      SELECT * FROM mood_patterns 
      WHERE userId = ? AND patternType = ? AND patternKey = ? AND moodId = ?
    `, [pattern.userId, pattern.patternType, pattern.patternKey, pattern.moodId]);
        const now = new Date().toISOString();
        if (existing) {
            // Update existing pattern
            await this.db.run(`
        UPDATE mood_patterns SET
          frequency = ?, successRate = ?, lastSeen = ?, confidence = ?, updatedAt = ?
        WHERE id = ?
      `, [
                pattern.frequency,
                pattern.successRate,
                pattern.lastSeen.toISOString(),
                pattern.confidence,
                now,
                existing.id
            ]);
            return {
                ...pattern,
                id: existing.id,
                createdAt: new Date(existing.createdAt),
                updatedAt: new Date(now)
            };
        }
        else {
            // Create new pattern
            const id = `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await this.db.run(`
        INSERT INTO mood_patterns (
          id, userId, patternType, patternKey, moodId, frequency,
          successRate, lastSeen, confidence, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
                id,
                pattern.userId,
                pattern.patternType,
                pattern.patternKey,
                pattern.moodId,
                pattern.frequency,
                pattern.successRate,
                pattern.lastSeen.toISOString(),
                pattern.confidence,
                now,
                now
            ]);
            return {
                ...pattern,
                id,
                createdAt: new Date(now),
                updatedAt: new Date(now)
            };
        }
    }
    async getMoodPatterns(userId, patternType) {
        let query = 'SELECT * FROM mood_patterns WHERE userId = ?';
        const params = [userId];
        if (patternType) {
            query += ' AND patternType = ?';
            params.push(patternType);
        }
        query += ' ORDER BY lastSeen DESC';
        const rows = await this.db.all(query, params);
        return rows.map(moodPersona_1.mapRowToMoodPattern);
    }
    // Learning Metrics operations
    async createLearningMetrics(metrics) {
        const id = `metrics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        await this.db.run(`
      INSERT INTO learning_metrics (
        id, userId, metricType, metricValue, period, timestamp, metadata, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            id,
            metrics.userId,
            metrics.metricType,
            metrics.metricValue,
            metrics.period,
            metrics.timestamp.toISOString(),
            metrics.metadata ? JSON.stringify(metrics.metadata) : null,
            now
        ]);
        return {
            ...metrics,
            id,
            createdAt: new Date(now)
        };
    }
    async getLearningMetrics(userId, metricType, period, limit = 100) {
        let query = 'SELECT * FROM learning_metrics WHERE userId = ?';
        const params = [userId];
        if (metricType) {
            query += ' AND metricType = ?';
            params.push(metricType);
        }
        if (period) {
            query += ' AND period = ?';
            params.push(period);
        }
        query += ' ORDER BY timestamp DESC LIMIT ?';
        params.push(String(limit));
        const rows = await this.db.all(query, params);
        return rows.map(moodPersona_1.mapRowToLearningMetrics);
    }
    // Analytics and aggregation methods
    async getMoodSelectionStats(userId, days = 30) {
        const rows = await this.db.all(`
      SELECT 
        primaryMood,
        COUNT(*) as count,
        AVG(intensity) as avgIntensity,
        AVG(CAST(outcomes AS TEXT)) as outcomes
      FROM mood_selections 
      WHERE userId = ? AND timestamp > datetime('now', '-' || ? || ' days')
      GROUP BY primaryMood
    `, [userId, days]);
        const stats = {};
        for (const row of rows) {
            const outcomes = JSON.parse(row.outcomes || '{}');
            const successRate = outcomes.gamesRecommended > 0
                ? outcomes.gamesLaunched / outcomes.gamesRecommended
                : 0;
            stats[row.primaryMood] = {
                count: row.count,
                avgIntensity: row.avgIntensity,
                successRate
            };
        }
        return stats;
    }
    async getRecommendationSuccessRate(userId, days = 30) {
        const row = await this.db.get(`
      SELECT 
        AVG(CASE WHEN successFlag = 1 THEN 1.0 ELSE 0.0 END) as successRate
      FROM recommendation_events 
      WHERE userId = ? AND timestamp > datetime('now', '-' || ? || ' days')
      AND successFlag IS NOT NULL
    `, [userId, days]);
        return row?.successRate || 0;
    }
    async getMoodPredictionAccuracy(userId, days = 30) {
        const row = await this.db.get(`
      SELECT 
        AVG(CASE WHEN acceptedFlag = 1 THEN 1.0 ELSE 0.0 END) as accuracy
      FROM mood_predictions 
      WHERE userId = ? AND timestamp > datetime('now', '-' || ? || ' days')
      AND acceptedFlag IS NOT NULL
    `, [userId, days]);
        return row?.accuracy || 0;
    }
}
exports.MoodPersonaService = MoodPersonaService;
//# sourceMappingURL=moodPersonaService.js.map