"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionAnalyzer = exports.MoodRecommendationMapper = exports.FreeVectorSearch = exports.FreeRecommendationEngine = exports.FreeMoodEngine = exports.FreeAIEngine = exports.RecommendationEngine = exports.getPlaystyleInsights = exports.calculatePlaystyleScores = exports.PLAYSTYLE_ARCHETYPES = exports.PlaystyleModel = exports.IdentityEngine = exports.MoodPersonaIntegration = exports.generateMoodBasedRecommendations = exports.calculateMoodForecast = void 0;
// Export all types and classes
__exportStar(require("./types"), exports);
__exportStar(require("./moodModel"), exports);
__exportStar(require("./playstyleModel"), exports);
__exportStar(require("./recommendations"), exports);
__exportStar(require("./computeIdentity"), exports);
__exportStar(require("./moodFilterPipeline"), exports);
__exportStar(require("./enhancedRecommendations"), exports);
// Export mood forecasting analysis
var moodForecast_1 = require("./mood/moodForecast");
Object.defineProperty(exports, "calculateMoodForecast", { enumerable: true, get: function () { return moodForecast_1.calculateMoodForecast; } });
// Export mood-based game recommendations
var moodGameRecommendations_1 = require("./recommendation/moodGameRecommendations");
Object.defineProperty(exports, "generateMoodBasedRecommendations", { enumerable: true, get: function () { return moodGameRecommendations_1.generateMoodBasedRecommendations; } });
// Export free AI components
__exportStar(require("./freeAIComponents"), exports);
// Export mood-persona integration
var moodPersonaIntegration_1 = require("./moodPersonaIntegration");
Object.defineProperty(exports, "MoodPersonaIntegration", { enumerable: true, get: function () { return moodPersonaIntegration_1.MoodPersonaIntegration; } });
// Main exports
var computeIdentity_1 = require("./computeIdentity");
Object.defineProperty(exports, "IdentityEngine", { enumerable: true, get: function () { return computeIdentity_1.IdentityEngine; } });
var playstyleModel_1 = require("./playstyleModel");
Object.defineProperty(exports, "PlaystyleModel", { enumerable: true, get: function () { return playstyleModel_1.PlaystyleModel; } });
Object.defineProperty(exports, "PLAYSTYLE_ARCHETYPES", { enumerable: true, get: function () { return playstyleModel_1.PLAYSTYLE_ARCHETYPES; } });
Object.defineProperty(exports, "calculatePlaystyleScores", { enumerable: true, get: function () { return playstyleModel_1.calculatePlaystyleScores; } });
Object.defineProperty(exports, "getPlaystyleInsights", { enumerable: true, get: function () { return playstyleModel_1.getPlaystyleInsights; } });
var recommendations_1 = require("./recommendations");
Object.defineProperty(exports, "RecommendationEngine", { enumerable: true, get: function () { return recommendations_1.RecommendationEngine; } });
// Free AI Engine exports
var freeAIComponents_1 = require("./freeAIComponents");
Object.defineProperty(exports, "FreeAIEngine", { enumerable: true, get: function () { return freeAIComponents_1.FreeAIEngine; } });
Object.defineProperty(exports, "FreeMoodEngine", { enumerable: true, get: function () { return freeAIComponents_1.FreeMoodEngine; } });
Object.defineProperty(exports, "FreeRecommendationEngine", { enumerable: true, get: function () { return freeAIComponents_1.FreeRecommendationEngine; } });
Object.defineProperty(exports, "FreeVectorSearch", { enumerable: true, get: function () { return freeAIComponents_1.FreeVectorSearch; } });
Object.defineProperty(exports, "MoodRecommendationMapper", { enumerable: true, get: function () { return freeAIComponents_1.MoodRecommendationMapper; } });
Object.defineProperty(exports, "SessionAnalyzer", { enumerable: true, get: function () { return freeAIComponents_1.SessionAnalyzer; } });
