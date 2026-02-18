"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMoodBasedRecommendations = generateMoodBasedRecommendations;
/**
 * Generate mood-based game recommendations using mood forecast
 */
function generateMoodBasedRecommendations(forecastResult, availableGames, maxRecommendations = 10) {
    const predictedMood = forecastResult.primaryForecast.predictedMood;
    const confidence = forecastResult.primaryForecast.confidence;
    // Score each game based on mood compatibility
    const scoredGames = availableGames.map(game => ({
        game,
        score: calculateMoodGameScore(game, predictedMood, confidence),
        reasons: generateRecommendationReasons(game, predictedMood),
        moodMatch: calculateMoodMatch(game, predictedMood)
    }));
    // Sort by score and take top recommendations
    const recommendations = scoredGames
        .sort((a, b) => b.score - a.score)
        .slice(0, maxRecommendations);
    return {
        recommendations,
        predictedMood,
        confidence,
        totalGames: availableGames.length,
        generatedAt: new Date()
    };
}
/**
 * Calculate how well a game matches a predicted mood
 */
function calculateMoodGameScore(game, predictedMood, confidence) {
    let score = 50; // Base score
    // Genre-based scoring
    const genreScores = {
        'competitive': {
            'action': 90, 'shooter': 85, 'fighting': 80, 'sports': 75, 'racing': 70
        },
        'chill': {
            'puzzle': 90, 'simulation': 85, 'casual': 80, 'strategy': 70, 'adventure': 65
        },
        'energetic': {
            'action': 90, 'platformer': 85, 'racing': 80, 'shooter': 75, 'sports': 70
        },
        'focused': {
            'strategy': 90, 'puzzle': 85, 'rpg': 80, 'simulation': 75, 'turn-based': 70
        },
        'social': {
            'mmorpg': 90, 'multiplayer': 85, 'party': 80, 'co-op': 75, 'online': 70
        },
        'creative': {
            'sandbox': 90, 'building': 85, 'crafting': 80, 'simulation': 75, 'design': 70
        },
        'story': {
            'rpg': 90, 'adventure': 85, 'visual-novel': 80, 'narrative': 75, 'interactive-fiction': 70
        },
        'exploratory': {
            'open-world': 90, 'adventure': 85, 'exploration': 80, 'survival': 75, 'discovery': 70
        }
    };
    // Apply genre scoring
    const gameGenres = game.genres || [];
    gameGenres.forEach(genre => {
        const genreScore = genreScores[predictedMood]?.[String(genre).toLowerCase()];
        if (genreScore) {
            score = Math.max(score, genreScore);
        }
    });
    // Tag-based scoring
    const gameTags = game.tags || [];
    const tagScores = {
        'competitive': { 'pvp': 20, 'competitive': 20, 'ranked': 15, 'tournament': 15 },
        'chill': { 'relaxing': 20, 'casual': 15, 'peaceful': 15, 'zen': 10 },
        'energetic': { 'fast-paced': 20, 'action-packed': 15, 'intense': 15, 'thrilling': 10 },
        'focused': { 'strategic': 20, 'tactical': 15, 'deep': 15, 'complex': 10 },
        'social': { 'multiplayer': 20, 'co-op': 15, 'online': 15, 'community': 10 },
        'creative': { 'building': 20, 'crafting': 15, 'creation': 15, 'design': 10 },
        'story': { 'story-rich': 20, 'narrative': 15, 'cinematic': 15, 'plot': 10 },
        'exploratory': { 'exploration': 20, 'open-world': 15, 'discovery': 15, 'adventure': 10 }
    };
    // Apply tag scoring
    gameTags.forEach(tag => {
        const tagScore = tagScores[predictedMood]?.[tag.toLowerCase()];
        if (tagScore) {
            score += tagScore;
        }
    });
    // Apply confidence weighting
    score = score * (0.5 + confidence * 0.5); // Scale between 50% and 100% based on confidence
    return Math.min(100, Math.max(0, score));
}
/**
 * Generate human-readable recommendation reasons
 */
function generateRecommendationReasons(game, predictedMood) {
    const reasons = [];
    // Genre-based reasons
    const gameGenres = game.genres || [];
    const moodGenreMap = {
        'competitive': ['action', 'shooter', 'fighting', 'sports'],
        'chill': ['puzzle', 'simulation', 'casual', 'strategy'],
        'energetic': ['action', 'platformer', 'racing', 'shooter'],
        'focused': ['strategy', 'puzzle', 'rpg', 'simulation'],
        'social': ['mmorpg', 'multiplayer', 'party', 'co-op'],
        'creative': ['sandbox', 'building', 'crafting', 'simulation'],
        'story': ['rpg', 'adventure', 'visual-novel', 'narrative'],
        'exploratory': ['open-world', 'adventure', 'exploration', 'survival']
    };
    const matchingGenres = gameGenres.filter(genre => moodGenreMap[predictedMood]?.includes(String(genre).toLowerCase()));
    if (matchingGenres.length > 0) {
        reasons.push(`Perfect ${predictedMood} match with ${matchingGenres.join(', ')} genres`);
    }
    // Tag-based reasons
    const gameTags = game.tags || [];
    const moodTagMap = {
        'competitive': ['pvp', 'competitive', 'ranked'],
        'chill': ['relaxing', 'casual', 'peaceful'],
        'energetic': ['fast-paced', 'action-packed', 'intense'],
        'focused': ['strategic', 'tactical', 'deep'],
        'social': ['multiplayer', 'co-op', 'online'],
        'creative': ['building', 'crafting', 'creation'],
        'story': ['story-rich', 'narrative', 'cinematic'],
        'exploratory': ['exploration', 'open-world', 'discovery']
    };
    const matchingTags = gameTags.filter(tag => moodTagMap[predictedMood]?.includes(tag.toLowerCase()));
    if (matchingTags.length > 0) {
        reasons.push(`Features ${matchingTags.join(', ')} for ${predictedMood} gaming`);
    }
    if (reasons.length === 0) {
        reasons.push(`General recommendation for ${predictedMood} mood`);
    }
    return reasons.slice(0, 3); // Max 3 reasons
}
/**
 * Calculate mood match percentage
 */
function calculateMoodMatch(game, predictedMood) {
    // Simplified mood match calculation
    const gameGenres = game.genres || [];
    const gameTags = game.tags || [];
    let matchScore = 0;
    let totalFactors = 0;
    // Check genre compatibility
    const moodGenreMap = {
        'competitive': ['action', 'shooter', 'fighting', 'sports'],
        'chill': ['puzzle', 'simulation', 'casual', 'strategy'],
        'energetic': ['action', 'platformer', 'racing', 'shooter'],
        'focused': ['strategy', 'puzzle', 'rpg', 'simulation'],
        'social': ['mmorpg', 'multiplayer', 'party', 'co-op'],
        'creative': ['sandbox', 'building', 'crafting', 'simulation'],
        'story': ['rpg', 'adventure', 'visual-novel', 'narrative'],
        'exploratory': ['open-world', 'adventure', 'exploration', 'survival']
    };
    gameGenres.forEach(genre => {
        totalFactors += 2;
        if (moodGenreMap[predictedMood]?.includes(String(genre).toLowerCase())) {
            matchScore += 2;
        }
    });
    gameTags.forEach(tag => {
        totalFactors += 1;
        const moodTagMap = {
            'competitive': ['pvp', 'competitive', 'ranked'],
            'chill': ['relaxing', 'casual', 'peaceful'],
            'energetic': ['fast-paced', 'action-packed', 'intense'],
            'focused': ['strategic', 'tactical', 'deep'],
            'social': ['multiplayer', 'co-op', 'online'],
            'creative': ['building', 'crafting', 'creation'],
            'story': ['story-rich', 'narrative', 'cinematic'],
            'exploratory': ['exploration', 'open-world', 'discovery']
        };
        if (moodTagMap[predictedMood]?.includes(tag.toLowerCase())) {
            matchScore += 1;
        }
    });
    return totalFactors > 0 ? Math.min(100, (matchScore / totalFactors) * 100) : 0;
}
