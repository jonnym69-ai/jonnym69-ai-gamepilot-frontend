"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlaystyleInsights = exports.calculatePlaystyleScores = exports.PLAYSTYLE_ARCHETYPES = exports.PlaystyleModel = void 0;
class PlaystyleModel {
    constructor() {
        this.playstyleDefinitions = [
            {
                id: 'achiever',
                name: 'Achiever',
                description: 'Loves completing challenges and earning rewards',
                icon: '🏆',
                color: 'from-yellow-500 to-amber-600',
                traits: ['goal-oriented', 'completionist', 'competitive', 'dedicated']
            },
            {
                id: 'explorer',
                name: 'Explorer',
                description: 'Enjoys discovering new content and secrets',
                icon: '🗺️',
                color: 'from-green-500 to-emerald-600',
                traits: ['curious', 'thorough', 'adventurous', 'detail-oriented']
            },
            {
                id: 'socializer',
                name: 'Socializer',
                description: 'Prefers playing and interacting with others',
                icon: '👥',
                color: 'from-blue-500 to-cyan-600',
                traits: ['cooperative', 'communicative', 'team-player', 'friendly']
            },
            {
                id: 'competitor',
                name: 'Competitor',
                description: 'Thrives on competition and skill-based gameplay',
                icon: '⚔️',
                color: 'from-red-500 to-orange-600',
                traits: ['competitive', 'strategic', 'skill-focused', 'win-driven']
            },
            {
                id: 'creative',
                name: 'Creative',
                description: 'Enjoys building, customizing, and expressing creativity',
                icon: '🎨',
                color: 'from-purple-500 to-pink-600',
                traits: ['imaginative', 'expressive', 'builder', 'innovative']
            },
            {
                id: 'strategist',
                name: 'Strategist',
                description: 'Loves planning, tactics, and deep thinking',
                icon: '♟️',
                color: 'from-indigo-500 to-purple-600',
                traits: ['analytical', 'tactical', 'patient', 'forward-thinking']
            },
            {
                id: 'casual',
                name: 'Casual',
                description: 'Plays for relaxation and entertainment',
                icon: '😌',
                color: 'from-teal-500 to-cyan-600',
                traits: ['relaxed', 'flexible', 'entertainment-focused', 'stress-free']
            },
            {
                id: 'specialist',
                name: 'Specialist',
                description: 'Masters specific genres or game types',
                icon: '🎯',
                color: 'from-pink-500 to-rose-600',
                traits: ['focused', 'expert', 'dedicated', 'perfectionist']
            }
        ];
    }
    /**
     * Compute playstyle based on gaming sessions
     */
    computePlaystyle(sessions) {
        if (sessions.length === 0) {
            return this.getDefaultPlaystyle();
        }
        const traits = this.extractTraitsFromSessions(sessions);
        const primary = this.findBestMatchingPlaystyle(traits);
        const secondary = this.findSecondaryPlaystyle(traits, primary.id);
        const preferences = this.computePreferences(sessions);
        return {
            primary,
            secondary,
            preferences,
            traits,
            customPlaystyles: []
        };
    }
    /**
     * Extract personality traits from gaming sessions
     */
    extractTraitsFromSessions(sessions) {
        const traitCounts = {};
        sessions.forEach(session => {
            // Analyze session patterns
            if (session.duration && session.duration > 120) {
                traitCounts['dedicated'] = (traitCounts['dedicated'] || 0) + 1;
            }
            if (session.intensity >= 8) {
                traitCounts['competitive'] = (traitCounts['competitive'] || 0) + 1;
                traitCounts['skill-focused'] = (traitCounts['skill-focused'] || 0) + 1;
            }
            if (session.tags.includes('story') || session.tags.includes('narrative')) {
                traitCounts['curious'] = (traitCounts['curious'] || 0) + 1;
            }
            if (session.tags.includes('multiplayer') || session.tags.includes('co-op')) {
                traitCounts['cooperative'] = (traitCounts['cooperative'] || 0) + 1;
                traitCounts['social'] = (traitCounts['social'] || 0) + 1;
            }
            if (session.tags.includes('creative') || session.tags.includes('building')) {
                traitCounts['imaginative'] = (traitCounts['imaginative'] || 0) + 1;
                traitCounts['expressive'] = (traitCounts['expressive'] || 0) + 1;
            }
            if (session.tags.includes('strategy') || session.tags.includes('tactical')) {
                traitCounts['analytical'] = (traitCounts['analytical'] || 0) + 1;
                traitCounts['tactical'] = (traitCounts['tactical'] || 0) + 1;
            }
        });
        // Return top traits
        return Object.entries(traitCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 8)
            .map(([trait]) => trait);
    }
    /**
     * Find best matching playstyle based on traits
     */
    findBestMatchingPlaystyle(traits) {
        let bestMatch = this.playstyleDefinitions[0];
        let bestScore = 0;
        this.playstyleDefinitions.forEach(playstyle => {
            const score = this.calculatePlaystyleMatch(playstyle, traits);
            if (score > bestScore) {
                bestScore = score;
                bestMatch = playstyle;
            }
        });
        return bestMatch;
    }
    /**
     * Find secondary playstyle (different from primary)
     */
    findSecondaryPlaystyle(traits, primaryId) {
        const candidates = this.playstyleDefinitions.filter(p => p.id !== primaryId);
        let bestMatch;
        let bestScore = 0;
        candidates.forEach(playstyle => {
            const score = this.calculatePlaystyleMatch(playstyle, traits);
            if (score > bestScore && score > 0.3) { // Minimum threshold
                bestScore = score;
                bestMatch = playstyle;
            }
        });
        return bestMatch;
    }
    /**
     * Calculate how well a playstyle matches given traits
     */
    calculatePlaystyleMatch(playstyle, traits) {
        const matchingTraits = playstyle.traits.filter(trait => traits.includes(trait));
        return matchingTraits.length / playstyle.traits.length;
    }
    /**
     * Compute gaming preferences from sessions
     */
    computePreferences(sessions) {
        const totalSessions = sessions.length;
        if (totalSessions === 0) {
            return this.getDefaultPreferences();
        }
        // Session length preference
        const avgDuration = sessions.reduce((sum, s) => sum + (s.duration || 60), 0) / totalSessions;
        const sessionLength = avgDuration < 45 ? 'short' : avgDuration < 90 ? 'medium' : 'long';
        // Difficulty preference (based on completion rates and ratings)
        const completedSessions = sessions.filter(s => s.completed).length;
        const completionRate = completedSessions / totalSessions;
        const difficulty = completionRate > 0.8 ? 'casual' : completionRate > 0.5 ? 'normal' : completionRate > 0.3 ? 'hard' : 'expert';
        // Social preference
        const socialSessions = sessions.filter(s => s.tags.includes('multiplayer')).length;
        const socialRatio = socialSessions / totalSessions;
        const socialPreference = socialRatio > 0.6 ? 'competitive' : socialRatio > 0.3 ? 'cooperative' : 'solo';
        // Focus areas (based on tags)
        const storySessions = sessions.filter(s => s.tags.includes('story')).length;
        const graphicsSessions = sessions.filter(s => s.tags.includes('graphics') || s.tags.includes('visual')).length;
        const gameplaySessions = sessions.filter(s => s.tags.includes('gameplay') || s.tags.includes('mechanics')).length;
        return {
            sessionLength,
            difficulty,
            socialPreference,
            storyFocus: Math.round((storySessions / totalSessions) * 100),
            graphicsFocus: Math.round((graphicsSessions / totalSessions) * 100),
            gameplayFocus: Math.round((gameplaySessions / totalSessions) * 100)
        };
    }
    /**
     * Get default playstyle for new users
     */
    getDefaultPlaystyle() {
        return {
            primary: this.playstyleDefinitions[6], // Casual
            preferences: this.getDefaultPreferences(),
            traits: ['relaxed', 'flexible']
        };
    }
    /**
     * Get default preferences
     */
    getDefaultPreferences() {
        return {
            sessionLength: 'medium',
            difficulty: 'normal',
            socialPreference: 'solo',
            storyFocus: 70,
            graphicsFocus: 60,
            gameplayFocus: 80
        };
    }
    /**
     * Get all available playstyle definitions
     */
    getPlaystyleDefinitions() {
        return [...this.playstyleDefinitions];
    }
}
exports.PlaystyleModel = PlaystyleModel;
// Export playstyle definitions and utilities for backward compatibility
exports.PLAYSTYLE_ARCHETYPES = {
    explorer: {
        name: 'Explorer',
        description: 'Enjoys discovering new content and secrets',
        icon: '🗺️',
        color: 'from-green-500 to-emerald-600',
        recommendation: 'Open-world games and exploration-focused titles'
    },
    achiever: {
        name: 'Achiever',
        description: 'Loves completing challenges and earning rewards',
        icon: '🏆',
        color: 'from-yellow-500 to-amber-600',
        recommendation: 'Games with achievements and progression systems'
    },
    social: {
        name: 'Socializer',
        description: 'Prefers playing and interacting with others',
        icon: '👥',
        color: 'from-blue-500 to-cyan-600',
        recommendation: 'Multiplayer and cooperative games'
    },
    strategist: {
        name: 'Strategist',
        description: 'Enjoys planning and tactical thinking',
        icon: '🧠',
        color: 'from-purple-500 to-indigo-600',
        recommendation: 'Strategy and puzzle games'
    },
    casual: {
        name: 'Casual',
        description: 'Plays for relaxation and fun',
        icon: '🌟',
        color: 'from-pink-500 to-rose-600',
        recommendation: 'Relaxing and low-pressure games'
    },
    competitive: {
        name: 'Competitor',
        description: 'Thrives on competition and challenges',
        icon: '⚔️',
        color: 'from-red-500 to-orange-600',
        recommendation: 'Competitive and skill-based games'
    }
};
const calculatePlaystyleScores = (games = []) => {
    // Mock calculation based on game data
    return {
        explorer: Math.floor(Math.random() * 100),
        achiever: Math.floor(Math.random() * 100),
        social: Math.floor(Math.random() * 100),
        strategist: Math.floor(Math.random() * 100),
        casual: Math.floor(Math.random() * 100),
        competitive: Math.floor(Math.random() * 100)
    };
};
exports.calculatePlaystyleScores = calculatePlaystyleScores;
const getPlaystyleInsights = () => [
    'You prefer exploration and discovery',
    'Achievement hunting motivates your gameplay',
    'Social gaming enhances your experience',
    'Strategic thinking is your strength'
];
exports.getPlaystyleInsights = getPlaystyleInsights;
