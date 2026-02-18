"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaService = exports.ollamaService = void 0;
const axios_1 = __importDefault(require("axios"));
class OllamaService {
    constructor(baseUrl = 'http://localhost:11434', model = 'llama3.2') {
        this.baseUrl = baseUrl;
        this.model = model;
    }
    /**
     * Get moods from AI based on game description
     */
    async getMoodsFromAI(description) {
        try {
            console.log('🤖 Analyzing moods for game description:', description.substring(0, 100) + '...');
            // Check if we have a valid model, if not try to get one
            const availableModels = await this.getAvailableModels();
            if (availableModels.length === 0) {
                console.log('⚠️ No models available, using fallback mood');
                return ['intense'];
            }
            // Use the first available model if current model is not available
            let modelToUse = this.model;
            if (!availableModels.includes(this.model)) {
                modelToUse = availableModels[0];
                console.log(`🔄 Model '${this.model}' not found, using '${modelToUse}'`);
            }
            const prompt = `Analyze the following game description. You MUST choose 3 most accurate moods from this list ONLY: [Intense, Strategic, Relaxing, Creative, High-Energy, Atmospheric, Challenging].

Game Description: ${description}

Requirements:
- Analyze actual gameplay mechanics and emotional experience
- Do NOT default to Creative/Relaxing for every game
- Consider game's core challenge level and player engagement
- Output ONLY a JSON array with exactly 3 moods
- Example: ["Intense", "Strategic", "Challenging"]

Mood Definitions:
- Intense: High-pressure, competitive, fast-paced combat
- Strategic: Requires planning, tactics, careful decision-making  
- Relaxing: Low-stress, peaceful, zen-like gameplay
- Creative: Building, crafting, expression, customization
- High-Energy: Action-packed, exciting, adrenaline-fueled
- Atmospheric: Immersive world-building, exploration, mood-setting
- Challenging: Difficult, requires skill, punishing gameplay`;
            const response = await axios_1.default.post(`${this.baseUrl}/api/generate`, {
                model: modelToUse,
                prompt: prompt,
                stream: false,
                options: {
                    temperature: 0.3,
                    top_p: 0.9,
                    max_tokens: 100
                }
            });
            console.log('🤖 Ollama response:', response.data.response);
            // Parse the JSON response
            const cleanedResponse = response.data.response.trim();
            // Try to extract JSON from the response
            let moods = [];
            try {
                // Direct JSON parsing
                const parsed = JSON.parse(cleanedResponse);
                if (Array.isArray(parsed)) {
                    moods = parsed;
                }
                else if (parsed.moods && Array.isArray(parsed.moods)) {
                    moods = parsed.moods;
                }
            }
            catch (parseError) {
                // Try to extract moods from text response
                const moodMatches = cleanedResponse.match(/\b(Intense|Strategic|Relaxing|Creative|High-Energy|Atmospheric|Challenging)\b/gi);
                if (moodMatches) {
                    moods = moodMatches.map(mood => mood);
                }
            }
            // Validate and filter moods
            const validMoods = ['Intense', 'Strategic', 'Relaxing', 'Creative', 'High-Energy', 'Atmospheric', 'Challenging'];
            const filteredMoods = moods
                .filter(mood => validMoods.includes(mood))
                .slice(0, 3); // Ensure max 3 moods
            console.log('🎭 Extracted moods:', filteredMoods);
            return filteredMoods.length > 0 ? filteredMoods : ['Intense']; // Default fallback
        }
        catch (error) {
            console.error('❌ Error getting moods from Ollama:', error);
            // Return default mood on error
            return ['Intense'];
        }
    }
    /**
     * Check if Ollama service is available
     */
    async isAvailable() {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/api/tags`, { timeout: 5000 });
            return response.status === 200;
        }
        catch (error) {
            console.log('🤖 Ollama service not available:', error.message);
            return false;
        }
    }
    /**
     * Get available models from Ollama
     */
    async getAvailableModels() {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/api/tags`);
            return response.data.models?.map((model) => model.name) || [];
        }
        catch (error) {
            console.error('❌ Error getting Ollama models:', error);
            return [];
        }
    }
    /**
     * Set the model to use for mood analysis
     */
    setModel(model) {
        this.model = model;
    }
    /**
     * Get current model
     */
    getModel() {
        return this.model;
    }
}
exports.OllamaService = OllamaService;
// Export singleton instance
exports.ollamaService = new OllamaService();
//# sourceMappingURL=ollamaService.js.map