"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.neuralMoodAnalyzer = exports.NeuralMoodAnalyzer = void 0;
const static_data_1 = require("@gamepilot/static-data");
class NeuralMoodAnalyzer {
    constructor(config = {
        learningRate: 0.01,
        momentum: 0.9,
        hiddenLayers: [64, 32, 16],
        activationFunction: 'relu',
        batchSize: 32,
        epochs: 100
    }) {
        this.moodPatterns = new Map();
        this.transitions = new Map();
        this.neuralWeights = [];
        this.isTrained = false;
        this.config = config;
        this.initializeNeuralNetwork();
    }
    /**
     * Analyze gaming sessions to extract mood patterns
     */
    async analyzeSessions(sessions) {
        this.extractMoodPatterns(sessions);
        this.analyzeTransitions(sessions);
        await this.trainNeuralNetwork(sessions);
    }
    /**
     * Predict current mood based on recent activity
     */
    predictCurrentMood(recentSessions, currentTime = new Date()) {
        if (!this.isTrained) {
            return this.fallbackPrediction(recentSessions, currentTime);
        }
        const features = this.extractFeatures(recentSessions, currentTime);
        const prediction = this.forwardPass(features);
        const moodIndex = this.argmax(prediction);
        const predictedMood = static_data_1.MOODS[moodIndex]?.id || 'relaxed';
        const confidence = prediction[moodIndex];
        return {
            predictedMood,
            confidence,
            factors: this.calculateFeatureContributions(features),
            reasoning: this.generateReasoning(prediction, features)
        };
    }
    /**
     * Get mood recommendations based on current state
     */
    getMoodRecommendations(currentMood, targetMood) {
        const pattern = this.moodPatterns.get(currentMood);
        if (!pattern) {
            return { suggestedGames: [], activities: [] };
        }
        let suggestedGames = pattern.gameAssociations;
        if (targetMood && targetMood !== currentMood) {
            const transition = this.findOptimalTransition(currentMood, targetMood);
            if (transition) {
                suggestedGames = [
                    ...suggestedGames,
                    ...transition.commonTriggers
                ];
            }
        }
        return {
            suggestedGames: [...new Set(suggestedGames)].slice(0, 10),
            activities: this.getMoodActivities(currentMood),
            transitionPath: targetMood ? this.findTransitionPath(currentMood, targetMood) : undefined
        };
    }
    /**
     * Update mood patterns with new session data
     */
    updatePatterns(newSession) {
        const moodId = newSession.mood;
        let pattern = this.moodPatterns.get(moodId);
        if (!pattern) {
            pattern = this.createMoodPattern(moodId);
            this.moodPatterns.set(moodId, pattern);
        }
        // Update confidence based on new data
        pattern.confidence = Math.min(1, pattern.confidence + 0.01);
        // Update game associations
        if (!pattern.gameAssociations.includes(newSession.gameId)) {
            pattern.gameAssociations.push(newSession.gameId);
        }
        // Update time patterns
        this.updateTimePattern(pattern, newSession.startTime);
        // Update intensity
        pattern.intensity = (pattern.intensity + newSession.intensity / 10) / 2;
    }
    /**
     * Get mood insights and analytics
     */
    getMoodInsights() {
        const patterns = Array.from(this.moodPatterns.values());
        const totalPatterns = patterns.length;
        const mostCommonMood = patterns
            .sort((a, b) => b.confidence - a.confidence)[0]?.moodId || 'unknown';
        const moodStability = this.calculateMoodStability(patterns);
        const peakTimes = this.calculatePeakTimes(patterns);
        return {
            totalPatterns,
            mostCommonMood,
            moodStability,
            peakTimes,
            recommendations: this.generateInsightRecommendations(patterns)
        };
    }
    initializeNeuralNetwork() {
        const inputSize = 20; // Feature vector size
        const outputSize = static_data_1.MOODS.length;
        let prevSize = inputSize;
        this.neuralWeights = [];
        for (const layerSize of [...this.config.hiddenLayers, outputSize]) {
            const layer = [];
            for (let i = 0; i < layerSize; i++) {
                const neuron = [];
                for (let j = 0; j < prevSize; j++) {
                    neuron.push((Math.random() - 0.5) * 0.1);
                }
                layer.push(neuron);
            }
            this.neuralWeights.push(layer);
            prevSize = layerSize;
        }
    }
    extractMoodPatterns(sessions) {
        const moodSessions = new Map();
        for (const session of sessions) {
            const moodId = session.mood;
            const moodSessionList = moodSessions.get(moodId) || [];
            moodSessionList.push(session);
            moodSessions.set(moodId, moodSessionList);
        }
        for (const [moodId, moodSessionList] of moodSessions) {
            const pattern = this.createMoodPattern(moodId);
            // Calculate confidence based on frequency
            pattern.confidence = moodSessionList.length / sessions.length;
            // Extract game associations
            pattern.gameAssociations = [...new Set(moodSessionList.map(s => s.gameId))];
            // Calculate average intensity
            pattern.intensity = moodSessionList.reduce((sum, s) => sum + s.intensity, 0) / moodSessionList.length;
            // Extract time patterns
            pattern.timePatterns = this.extractTimePatterns(moodSessionList);
            this.moodPatterns.set(moodId, pattern);
        }
    }
    analyzeTransitions(sessions) {
        const sortedSessions = sessions.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
        for (let i = 1; i < sortedSessions.length; i++) {
            const prevSession = sortedSessions[i - 1];
            const currSession = sortedSessions[i];
            const transitionKey = `${prevSession.mood}->${currSession.mood}`;
            let transition = this.transitions.get(transitionKey);
            if (!transition) {
                transition = {
                    fromMood: prevSession.mood,
                    toMood: currSession.mood,
                    probability: 0,
                    commonTriggers: [],
                    averageTransitionTime: 0
                };
                this.transitions.set(transitionKey, transition);
            }
            // Update transition probability
            transition.probability += 1 / sessions.length;
            // Update transition time
            const timeDiff = (currSession.startTime.getTime() - (prevSession.endTime?.getTime() || 0)) / (1000 * 60);
            transition.averageTransitionTime = (transition.averageTransitionTime + timeDiff) / 2;
            // Add triggers
            if (currSession.tags) {
                transition.commonTriggers.push(...currSession.tags);
            }
        }
    }
    async trainNeuralNetwork(sessions) {
        const trainingData = this.prepareTrainingData(sessions);
        for (let epoch = 0; epoch < this.config.epochs; epoch++) {
            for (const batch of this.createBatches(trainingData)) {
                await this.processBatch(batch);
            }
        }
        this.isTrained = true;
    }
    prepareTrainingData(sessions) {
        const trainingData = [];
        for (let i = 0; i < sessions.length - 1; i++) {
            const session = sessions[i];
            const nextSession = sessions[i + 1];
            const input = this.extractFeatures([session], session.startTime);
            const output = this.createOutputVector(nextSession.mood);
            trainingData.push({ input, output });
        }
        return trainingData;
    }
    extractFeatures(sessions, currentTime) {
        const features = new Array(20).fill(0);
        // Time features (0-3)
        features[0] = currentTime.getHours() / 24;
        features[1] = currentTime.getDay() / 7;
        features[2] = (currentTime.getMonth() + 1) / 12;
        features[3] = sessions.length > 0 ? sessions[0].duration ? sessions[0].duration / 300 : 0 : 0; // Normalized to 5 hours
        // Recent game features (4-9)
        const recentGames = sessions.slice(0, 3);
        for (let i = 0; i < 3; i++) {
            if (recentGames[i]) {
                features[4 + i * 2] = this.hashGameId(recentGames[i].gameId) / 1000;
                features[5 + i * 2] = recentGames[i].intensity / 10;
            }
        }
        // Mood history features (10-15)
        const recentMoods = sessions.slice(0, 3).map(s => s.mood);
        for (let i = 0; i < 6; i++) {
            if (i < recentMoods.length) {
                const moodIndex = static_data_1.MOODS.findIndex(m => m.id === recentMoods[i]);
                features[10 + i] = moodIndex >= 0 ? moodIndex / static_data_1.MOODS.length : 0;
            }
        }
        // Session pattern features (16-19)
        features[16] = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / (sessions.length * 300); // Avg session length
        features[17] = sessions.reduce((sum, s) => sum + s.intensity, 0) / (sessions.length * 10); // Avg intensity
        features[18] = sessions.filter(s => s.completed).length / sessions.length; // Completion rate
        features[19] = sessions.length > 5 ? 1 : sessions.length / 5; // Frequency factor
        return features;
    }
    createOutputVector(moodId) {
        const vector = new Array(static_data_1.MOODS.length).fill(0);
        const index = static_data_1.MOODS.findIndex(m => m.id === moodId);
        if (index >= 0) {
            vector[index] = 1;
        }
        return vector;
    }
    forwardPass(input) {
        let current = [...input];
        for (let layer = 0; layer < this.neuralWeights.length; layer++) {
            const next = [];
            for (let neuron = 0; neuron < this.neuralWeights[layer].length; neuron++) {
                let sum = 0;
                for (let weight = 0; weight < this.neuralWeights[layer][neuron].length; weight++) {
                    sum += current[weight] * this.neuralWeights[layer][neuron][weight];
                }
                next.push(this.activate(sum));
            }
            current = next;
        }
        return this.softmax(current);
    }
    activate(x) {
        switch (this.config.activationFunction) {
            case 'relu':
                return Math.max(0, x);
            case 'sigmoid':
                return 1 / (1 + Math.exp(-x));
            case 'tanh':
                return Math.tanh(x);
            default:
                return Math.max(0, x);
        }
    }
    softmax(x) {
        const max = Math.max(...x);
        const exp = x.map(val => Math.exp(val - max));
        const sum = exp.reduce((a, b) => a + b, 0);
        return exp.map(val => val / sum);
    }
    argmax(array) {
        let maxIndex = 0;
        let maxValue = array[0];
        for (let i = 1; i < array.length; i++) {
            if (array[i] > maxValue) {
                maxValue = array[i];
                maxIndex = i;
            }
        }
        return maxIndex;
    }
    hashGameId(gameId) {
        let hash = 0;
        for (let i = 0; i < gameId.length; i++) {
            hash = ((hash << 5) - hash) + gameId.charCodeAt(i);
            hash = hash & hash;
        }
        return Math.abs(hash);
    }
    createMoodPattern(moodId) {
        return {
            moodId,
            confidence: 0,
            triggers: [],
            timePatterns: [],
            gameAssociations: [],
            intensity: 0.5
        };
    }
    extractTimePatterns(sessions) {
        const patterns = [];
        for (const session of sessions) {
            const hour = session.startTime.getHours();
            const dayOfWeek = session.startTime.getDay();
            const existingPattern = patterns.find(p => p.hour === hour && p.dayOfWeek === dayOfWeek);
            if (existingPattern) {
                existingPattern.likelihood += 1 / sessions.length;
            }
            else {
                patterns.push({
                    hour,
                    dayOfWeek,
                    likelihood: 1 / sessions.length
                });
            }
        }
        return patterns;
    }
    updateTimePattern(pattern, sessionTime) {
        const hour = sessionTime.getHours();
        const dayOfWeek = sessionTime.getDay();
        const existingPattern = pattern.timePatterns.find(p => p.hour === hour && p.dayOfWeek === dayOfWeek);
        if (existingPattern) {
            existingPattern.likelihood = Math.min(1, existingPattern.likelihood + 0.01);
        }
        else {
            pattern.timePatterns.push({
                hour,
                dayOfWeek,
                likelihood: 0.01
            });
        }
    }
    fallbackPrediction(sessions, currentTime) {
        const recentMoods = sessions.slice(0, 3).map(s => s.mood);
        const mostRecent = recentMoods[0] || 'relaxed';
        return {
            predictedMood: mostRecent,
            confidence: 0.5,
            factors: {
                timeOfDay: 0.2,
                recentGames: 0.3,
                sessionLength: 0.2,
                dayOfWeek: 0.1
            },
            reasoning: ['Based on recent gaming sessions']
        };
    }
    calculateFeatureContributions(features) {
        return {
            timeOfDay: features[0],
            recentGames: (features[4] + features[6] + features[8]) / 3,
            sessionLength: features[16],
            dayOfWeek: features[1]
        };
    }
    generateReasoning(prediction, features) {
        const reasoning = [];
        const moodIndex = this.argmax(prediction);
        if (features[0] > 0.7)
            reasoning.push('Late night gaming session detected');
        if (features[1] > 0.7)
            reasoning.push('Weekend gaming pattern');
        if (features[16] > 0.7)
            reasoning.push('Long gaming sessions suggest immersive mood');
        if (features[17] > 0.7)
            reasoning.push('High intensity gaming detected');
        return reasoning;
    }
    getMoodActivities(moodId) {
        const activities = {
            'relaxed': ['Casual gaming', 'Exploration', 'Creative building'],
            'competitive': ['Ranked matches', 'Tournaments', 'Skill training'],
            'focused': ['Strategy games', 'Puzzle solving', 'Story progression'],
            'social': ['Multiplayer sessions', 'Co-op missions', 'Community events'],
            'energetic': ['Action games', 'Fast-paced challenges', 'Sports games'],
            'creative': ['Sandbox games', 'Building games', 'Art games'],
            'adventurous': ['Open-world exploration', 'New genres', 'Discovery'],
            'analytical': ['Strategy games', 'Complex systems', 'Optimization']
        };
        return activities[moodId] || ['General gaming'];
    }
    findOptimalTransition(fromMood, toMood) {
        const directTransition = this.transitions.get(`${fromMood}->${toMood}`);
        if (directTransition)
            return directTransition;
        // Find indirect transitions
        let bestTransition;
        let highestProbability = 0;
        for (const transition of this.transitions.values()) {
            if (transition.fromMood === fromMood && transition.probability > highestProbability) {
                bestTransition = transition;
                highestProbability = transition.probability;
            }
        }
        return bestTransition;
    }
    findTransitionPath(fromMood, toMood) {
        if (fromMood === toMood)
            return [fromMood];
        const visited = new Set();
        const queue = [{ mood: fromMood, path: [fromMood] }];
        while (queue.length > 0) {
            const { mood, path } = queue.shift();
            if (mood === toMood)
                return path;
            if (visited.has(mood))
                continue;
            visited.add(mood);
            for (const transition of this.transitions.values()) {
                if (transition.fromMood === mood && !visited.has(transition.toMood)) {
                    queue.push({
                        mood: transition.toMood,
                        path: [...path, transition.toMood]
                    });
                }
            }
        }
        return undefined;
    }
    calculateMoodStability(patterns) {
        if (patterns.length === 0)
            return 0;
        const avgConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length;
        const variance = patterns.reduce((sum, p) => sum + Math.pow(p.confidence - avgConfidence, 2), 0) / patterns.length;
        return Math.max(0, 1 - variance);
    }
    calculatePeakTimes(patterns) {
        const peakTimes = [];
        for (const pattern of patterns) {
            const bestTime = pattern.timePatterns.reduce((best, current) => current.likelihood > best.likelihood ? current : best, { hour: 12, likelihood: 0, dayOfWeek: 0 });
            peakTimes.push({
                mood: pattern.moodId,
                hour: bestTime.hour
            });
        }
        return peakTimes.sort((a, b) => b.hour - a.hour);
    }
    generateInsightRecommendations(patterns) {
        const recommendations = [];
        if (patterns.length < 3) {
            recommendations.push('Try gaming at different times to discover more mood patterns');
        }
        const lowConfidencePatterns = patterns.filter(p => p.confidence < 0.3);
        if (lowConfidencePatterns.length > 0) {
            recommendations.push('Some mood patterns need more data - continue gaming regularly');
        }
        const highIntensityPatterns = patterns.filter(p => p.intensity > 0.7);
        if (highIntensityPatterns.length > patterns.length / 2) {
            recommendations.push('Consider adding some relaxed gaming sessions for balance');
        }
        return recommendations;
    }
    createBatches(data) {
        const batches = [];
        for (let i = 0; i < data.length; i += this.config.batchSize) {
            batches.push(data.slice(i, i + this.config.batchSize));
        }
        return batches;
    }
    async processBatch(batch) {
        // Simplified batch processing - in real implementation, this would include backpropagation
        for (const sample of batch) {
            const prediction = this.forwardPass(sample.input);
            // Calculate error and update weights (simplified)
            // This would include proper backpropagation in a full implementation
        }
    }
}
exports.NeuralMoodAnalyzer = NeuralMoodAnalyzer;
// Singleton instance for the application
exports.neuralMoodAnalyzer = new NeuralMoodAnalyzer();
