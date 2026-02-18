"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateMoodForecast = calculateMoodForecast;
/**
 * Generate mood forecasts based on historical trend analysis
 */
function calculateMoodForecast(trendAnalysis, historicalData, forecastPeriod = 'next_month') {
    // Determine data quality based on historical data size
    const dataPoints = historicalData.length;
    const dataQuality = dataPoints >= 20 ? 'high' : dataPoints >= 10 ? 'medium' : 'low';
    // Get dominant trend as primary prediction base
    const dominantTrend = trendAnalysis.dominantTrend;
    // Calculate trend influence based on trend strength
    const trendInfluence = Math.abs(dominantTrend.changeRate) * dominantTrend.confidence;
    // Apply seasonality influence (simplified seasonal pattern)
    const currentMonth = new Date().getMonth();
    const seasonalityInfluence = getSeasonalityInfluence(currentMonth, dominantTrend.moodId);
    // Adjust confidence based on volatility
    const volatilityAdjustment = 1 - trendAnalysis.volatility;
    // Calculate predicted mood based on trend
    let predictedMood = dominantTrend.moodId;
    let confidence = dominantTrend.confidence * volatilityAdjustment;
    // Adjust prediction based on trend direction
    if (dominantTrend.trend === 'increasing' && confidence > 0.6) {
        // Strong increasing trend - predict same mood will continue
        confidence = Math.min(0.9, confidence + 0.2);
    }
    else if (dominantTrend.trend === 'decreasing' && confidence > 0.6) {
        // Strong decreasing trend - predict mood shift
        predictedMood = getAlternativeMood(dominantTrend.moodId);
        confidence = Math.max(0.3, confidence - 0.1);
    }
    // Generate reasoning
    const reasoning = [
        `Based on ${dominantTrend.trend} trend in ${dominantTrend.moodId}`,
        `Confidence adjusted for volatility: ${Math.round(volatilityAdjustment * 100)}%`,
        `Data quality: ${dataQuality} (${dataPoints} data points)`
    ];
    // Create primary forecast
    const primaryForecast = {
        predictedMood,
        confidence,
        timeframe: forecastPeriod,
        factors: {
            trendInfluence,
            seasonalityInfluence,
            volatilityAdjustment
        },
        reasoning
    };
    // Generate alternative forecasts
    const alternativeForecasts = trendAnalysis.trends
        .filter((trend) => trend.moodId !== dominantTrend.moodId)
        .slice(0, 3)
        .map((trend) => ({
        predictedMood: trend.moodId,
        confidence: trend.confidence * 0.7, // Lower confidence for alternatives
        timeframe: forecastPeriod,
        factors: {
            trendInfluence: Math.abs(trend.changeRate) * trend.confidence * 0.7,
            seasonalityInfluence: getSeasonalityInfluence(currentMonth, trend.moodId),
            volatilityAdjustment: 1 - trendAnalysis.volatility
        },
        reasoning: [
            `Alternative prediction based on ${trend.trend} trend`,
            `Lower confidence than primary forecast`
        ]
    }));
    // Calculate forecast accuracy (simplified)
    const forecastAccuracy = calculateForecastAccuracy(trendAnalysis, historicalData);
    return {
        primaryForecast,
        alternativeForecasts,
        forecastAccuracy,
        dataQuality,
        generatedAt: new Date()
    };
}
/**
 * Get seasonality influence for mood prediction
 */
function getSeasonalityInfluence(month, moodId) {
    // Simplified seasonal patterns
    const seasonalPatterns = {
        'chill': [0.8, 0.7, 0.6, 0.5, 0.6, 0.7, 0.8, 0.8, 0.7, 0.6, 0.7, 0.8], // Higher in winter/summer
        'competitive': [0.6, 0.7, 0.8, 0.9, 0.8, 0.7, 0.6, 0.6, 0.7, 0.8, 0.7, 0.6], // Higher in spring/fall
        'energetic': [0.5, 0.6, 0.7, 0.8, 0.9, 0.8, 0.7, 0.7, 0.8, 0.9, 0.8, 0.7], // Higher in summer
        'focused': [0.7, 0.8, 0.8, 0.7, 0.6, 0.7, 0.8, 0.8, 0.7, 0.6, 0.7, 0.8], // Consistent year-round
        'social': [0.6, 0.7, 0.8, 0.8, 0.7, 0.6, 0.7, 0.8, 0.8, 0.7, 0.6, 0.7], // Higher in fall/spring
    };
    return seasonalPatterns[moodId]?.[month] || 0.5;
}
/**
 * Get alternative mood for decreasing trends
 */
function getAlternativeMood(currentMood) {
    const alternatives = {
        'competitive': 'focused',
        'focused': 'competitive',
        'energetic': 'social',
        'social': 'energetic',
        'chill': 'creative',
        'creative': 'chill',
        'story': 'exploratory',
        'exploratory': 'story'
    };
    return alternatives[currentMood] || 'chill';
}
/**
 * Calculate forecast accuracy based on historical data
 */
function calculateForecastAccuracy(trendAnalysis, historicalData) {
    if (historicalData.length < 5)
        return 0.3; // Low accuracy with insufficient data
    // Simplified accuracy calculation based on trend consistency
    const avgConfidence = trendAnalysis.trends.reduce((sum, trend) => sum + trend.confidence, 0) / trendAnalysis.trends.length;
    const volatilityPenalty = trendAnalysis.volatility * 0.3;
    return Math.max(0.2, Math.min(0.95, avgConfidence - volatilityPenalty));
}
