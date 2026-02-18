import axios from 'axios'

export interface OllamaChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface OllamaChatRequest {
  model: string
  messages: OllamaChatMessage[]
  stream?: boolean
  options?: {
    temperature?: number
    top_p?: number
    num_predict?: number
  }
}

export interface OllamaChatResponse {
  model: string
  created_at: string
  message: {
    role: string
    content: string
  }
  done: boolean
  total_duration?: number
  load_duration?: number
  prompt_eval_count?: number
  eval_count?: number
  eval_duration?: number
}

export interface OllamaResponse {
  model: string
  created_at: string
  response: string
  done: boolean
  context?: number[]
  total_duration?: number
  load_duration?: number
  sample_count?: number
  sample_duration?: number
  prompt_eval_count?: number
  prompt_eval_duration?: number
  eval_count?: number
  eval_duration?: number
}

export interface MoodAnalysis {
  moods: string[]
}

export interface GamingCoachRecommendation {
  gameName: string
  reasoning: string
  confidence: number
  alternativeGames: string[]
}

class OllamaService {
  private baseUrl: string
  private model: string

  constructor(baseUrl: string = 'http://localhost:11434', model: string = 'llama3.1:8b-instruct-fp16') {
    this.baseUrl = baseUrl
    this.model = model
  }

  /**
   * Get AI-powered gaming coach recommendations
   */
  async getGamingCoachRecommendation(
    emotionalProfile: {
      energyLevel: number
      cognitiveLoad: number
      toleranceLevel: number
      emotionalNeeds: string[]
      socialAppetite: string
    },
    ownedGames: Array<{gameId: string, gameName: string, genres: string[], difficulty: string}>,
    recentGames: string[] = [],
    availableTime: number = 60
  ): Promise<GamingCoachRecommendation | null> {
    try {
      if (ownedGames.length === 0) {
        return null;
      }

      // Convert numeric values to readable categories
      const energyLevel = emotionalProfile.energyLevel <= 3 ? 'low' : emotionalProfile.energyLevel <= 7 ? 'moderate' : 'high';
      const cognitiveLoad = emotionalProfile.cognitiveLoad <= 3 ? 'light' : emotionalProfile.cognitiveLoad <= 7 ? 'moderate' : 'heavy';
      const toleranceLevel = emotionalProfile.toleranceLevel <= 3 ? 'low' : emotionalProfile.toleranceLevel <= 7 ? 'moderate' : 'high';

      const systemPrompt = `You are an expert gaming coach who understands psychology and game design. Your role is to recommend the perfect game from a user's library based on their current emotional state and gaming preferences.

Available games in user's library:
${ownedGames.map(game => `- ${game.gameName} (${game.genres.join(', ')}) - Difficulty: ${game.difficulty}`).join('\n')}

Recent games played: ${recentGames.length > 0 ? recentGames.join(', ') : 'None'}

Guidelines:
- Only recommend games from the user's library
- Consider emotional needs, energy level, and available time
- Provide thoughtful reasoning for your recommendation
- Suggest 2-3 alternative games if the primary choice isn't ideal
- Be encouraging and understanding of the player's current state`;

      const userPrompt = `Player Profile:
- Current Energy: ${energyLevel} (1-10 scale: ${emotionalProfile.energyLevel}/10)
- Cognitive Load: ${cognitiveLoad} (thinking intensity they can handle)
- Frustration Tolerance: ${toleranceLevel} (how much challenge they can handle)
- Emotional Needs: ${emotionalProfile.emotionalNeeds.join(', ')}
- Social Preference: ${emotionalProfile.socialAppetite}
- Available Time: ${availableTime} minutes

Please recommend the best game from their library for this moment and explain why it's perfect for their current state. Format your response as:
PRIMARY: [Game Name]
REASONING: [Why this game fits their current state]
CONFIDENCE: [High/Medium/Low]
ALTERNATIVES: [2-3 other games from their library]`;

      const messages: OllamaChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];

      const response = await this.chatCompletion(messages, {
        temperature: 0.7,
        numPredict: 400
      });

      // Parse the AI response
      const lines = response.split('\n');
      let primaryGame = '';
      let reasoning = '';
      let confidence = 0.7; // default
      let alternatives: string[] = [];

      for (const line of lines) {
        if (line.startsWith('PRIMARY:')) {
          primaryGame = line.replace('PRIMARY:', '').trim();
        } else if (line.startsWith('REASONING:')) {
          reasoning = line.replace('REASONING:', '').trim();
        } else if (line.startsWith('CONFIDENCE:')) {
          const confText = line.replace('CONFIDENCE:', '').trim().toLowerCase();
          confidence = confText.includes('high') ? 0.9 : confText.includes('low') ? 0.5 : 0.7;
        } else if (line.startsWith('ALTERNATIVES:')) {
          const altText = line.replace('ALTERNATIVES:', '').trim();
          alternatives = altText.split(',').map(g => g.trim()).filter(g => g.length > 0);
        }
      }

      // Validate primary game is in library
      const primaryGameData = ownedGames.find(g => g.gameName.toLowerCase() === primaryGame.toLowerCase());
      if (!primaryGameData) {
        // Fallback to first owned game
        const fallback = ownedGames[0];
        return {
          gameName: fallback.gameName,
          reasoning: 'AI recommendation not available from your library. Here\'s a game you own that might suit your current mood.',
          confidence: 0.5,
          alternativeGames: ownedGames.slice(1, 4).map(g => g.gameName)
        };
      }

      return {
        gameName: primaryGameData.gameName,
        reasoning: reasoning || 'This game matches your current emotional state and preferences.',
        confidence,
        alternativeGames: alternatives.slice(0, 3)
      };

    } catch (error) {
      console.error('❌ Error getting AI gaming coach recommendation:', error);
      return null;
    }
  }

  /**
   * Generate personalized gaming advice using AI
   */
  async getPersonalizedGamingAdvice(
    context: {
      currentMood: string
      recentSession?: { difficulty: string, duration: number, frustration: number }
      goals?: string[]
      constraints?: string[]
    }
  ): Promise<string> {
    try {
      const systemPrompt = `You are a compassionate gaming coach who provides personalized, actionable advice. Your advice should be:
- Encouraging and understanding
- Specific to gaming psychology
- Actionable with clear next steps
- Considerate of the player's emotional state
- Focused on healthy gaming habits`;

      const userPrompt = `Player Context:
- Current Mood: ${context.currentMood}
${context.recentSession ? `- Last Session: ${context.recentSession.duration}min, difficulty: ${context.recentSession.difficulty}, frustration level: ${context.recentSession.frustration}/10` : ''}
${context.goals ? `- Goals: ${context.goals.join(', ')}` : ''}
${context.constraints ? `- Constraints: ${context.constraints.join(', ')}` : ''}

Provide personalized gaming advice for this player. Keep it to 2-3 paragraphs, be supportive and practical.`;

      const messages: OllamaChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];

      return await this.chatCompletion(messages, {
        temperature: 0.8,
        numPredict: 300
      });

    } catch (error) {
      console.error('❌ Error getting personalized gaming advice:', error);
      return 'I\'m here to help you make the most of your gaming time. Take it one session at a time, and remember that gaming should enhance your life, not complicate it.';
    }
  }

  /**
   * Use the modern chat API for completions
   */
  private async chatCompletion(
    messages: OllamaChatMessage[],
    options: { temperature?: number; numPredict?: number } = {}
  ): Promise<string> {
    try {
      // Check if we have a valid model
      const availableModels = await this.getAvailableModels();
      if (availableModels.length === 0) {
        throw new Error('No Ollama models available');
      }

      let modelToUse = this.model;
      if (!availableModels.includes(this.model)) {
        modelToUse = availableModels[0];
        console.log(`🔄 Model '${this.model}' not found, using '${modelToUse}'`);
      }

      const request: OllamaChatRequest = {
        model: modelToUse,
        messages,
        stream: false,
        options: {
          temperature: options.temperature ?? 0.7,
          num_predict: options.numPredict ?? 200
        }
      };

      const response = await axios.post<OllamaChatResponse>(`${this.baseUrl}/api/chat`, request);

      return response.data.message.content.trim();

    } catch (error) {
      console.error('❌ Chat completion error:', error);
      // Fallback to generate API if chat fails
      return this.fallbackGenerate(messages);
    }
  }

  /**
   * Fallback to generate API for older Ollama versions
   */
  private async fallbackGenerate(messages: OllamaChatMessage[]): Promise<string> {
    try {
      const availableModels = await this.getAvailableModels();
      if (availableModels.length === 0) {
        throw new Error('No Ollama models available');
      }

      let modelToUse = this.model;
      if (!availableModels.includes(this.model)) {
        modelToUse = availableModels[0];
      }

      // Convert messages to a single prompt
      const systemMessage = messages.find(m => m.role === 'system')?.content || '';
      const userMessage = messages.find(m => m.role === 'user')?.content || '';

      const prompt = systemMessage ? `${systemMessage}\n\n${userMessage}` : userMessage;

      const response = await axios.post<OllamaResponse>(`${this.baseUrl}/api/generate`, {
        model: modelToUse,
        prompt,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 200
        }
      });

      return response.data.response.trim();

    } catch (error) {
      console.error('❌ Fallback generate error:', error);
      throw error;
    }
  }

  /**
   * Get moods from AI based on game description
   */
  async getMoodsFromAI(description: string): Promise<string[]> {
    try {
      console.log('🤖 Analyzing moods for game description:', description.substring(0, 100) + '...')

      // Check if we have a valid model, if not try to get one
      const availableModels = await this.getAvailableModels()
      if (availableModels.length === 0) {
        console.log('⚠️ No models available, using fallback mood')
        return ['intense']
      }

      // Use the first available model if current model is not available
      let modelToUse = this.model
      if (!availableModels.includes(this.model)) {
        modelToUse = availableModels[0]
        console.log(`🔄 Model '${this.model}' not found, using '${modelToUse}'`)
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
- Challenging: Difficult, requires skill, punishing gameplay`

      const response = await axios.post<OllamaResponse>(`${this.baseUrl}/api/generate`, {
        model: modelToUse,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.3,
          top_p: 0.9,
          max_tokens: 100
        }
      })

      console.log('🤖 Ollama response:', response.data.response)

      // Parse the JSON response
      const cleanedResponse = response.data.response.trim()
      
      // Try to extract JSON from the response
      let moods: string[] = []
      
      try {
        // Direct JSON parsing
        const parsed = JSON.parse(cleanedResponse)
        if (Array.isArray(parsed)) {
          moods = parsed
        } else if (parsed.moods && Array.isArray(parsed.moods)) {
          moods = parsed.moods
        }
      } catch (parseError) {
        // Try to extract moods from text response
        const moodMatches = cleanedResponse.match(/\b(Intense|Strategic|Relaxing|Creative|High-Energy|Atmospheric|Challenging)\b/gi)
        if (moodMatches) {
          moods = moodMatches.map(mood => mood)
        }
      }

      // Validate and filter moods
      const validMoods = ['Intense', 'Strategic', 'Relaxing', 'Creative', 'High-Energy', 'Atmospheric', 'Challenging']
      const filteredMoods = moods
        .filter(mood => validMoods.includes(mood))
        .slice(0, 3) // Ensure max 3 moods

      console.log('🎭 Extracted moods:', filteredMoods)

      return filteredMoods.length > 0 ? filteredMoods : ['Intense'] // Default fallback
    } catch (error) {
      console.error('❌ Error getting moods from Ollama:', error)
      
      // Return default mood on error
      return ['Intense']
    }
  }

  /**
   * Check if Ollama service is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`, { timeout: 5000 })
      return response.status === 200
    } catch (error) {
      console.log('🤖 Ollama service not available:', (error as Error).message)
      return false
    }
  }

  /**
   * Get available models from Ollama
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`)
      return response.data.models?.map((model: any) => model.name) || []
    } catch (error) {
      console.error('❌ Error getting Ollama models:', error)
      return []
    }
  }

  /**
   * Set the model to use for mood analysis
   */
  setModel(model: string): void {
    this.model = model
  }

  /**
   * Generate a personalized weekly play plan based on user goals and patterns
   */
  async generateWeeklyPlayPlan(userContext: {
    goals: Array<{ type: string; title: string; description?: string; priority: string }>;
    moodHistory: Array<{ mood: string; timestamp: string }>;
    recentGames: Array<{ gameId: string; gameName: string; genres: string[]; difficulty: string; sessions: number; lastPlayed: string }>;
    availableTime: number; // hours per week
    preferredGenres?: string[];
    currentStreak?: number;
  }): Promise<{
    theme: string;
    recommendations: Array<{
      gameId: string;
      gameName: string;
      reasoning: string;
      estimatedTime: number; // minutes
      alignmentScore: number; // 0-1, how well it aligns with goals
      moodSuitability: string;
    }>;
    goalsAlignment: Array<{ goalType: string; alignment: string; progress: string }>;
    weeklyTips: string[];
    totalEstimatedTime: number;
  }> {
    try {
      const prompt = `You are a professional gaming coach creating a personalized weekly play plan. Analyze the user's context and create an engaging, achievable plan.

USER CONTEXT:
- Goals: ${userContext.goals.map(g => `${g.priority} priority: ${g.title} (${g.description || 'No description'})`).join(', ')}
- Recent mood trends: ${userContext.moodHistory.slice(-7).map(m => m.mood).join(', ')}
- Available time: ${userContext.availableTime} hours per week
- Preferred genres: ${userContext.preferredGenres?.join(', ') || 'Not specified'}
- Current streak: ${userContext.currentStreak || 0} days

RECENT GAMES:
${userContext.recentGames.map(g => `- ${g.gameName} (${g.genres.join(', ')}) - ${g.sessions} sessions, last played ${g.lastPlayed}`).join('\n')}

Create a weekly theme and 3-5 game recommendations that:
1. Align with their goals and mood patterns
2. Respect their time constraints
3. Include variety and balance
4. Provide specific reasoning for each recommendation
5. Include estimated play time and mood suitability

Format your response as JSON with this structure:
{
  "theme": "Catchy theme name",
  "recommendations": [
    {
      "gameId": "from recent games list",
      "gameName": "exact name from list",
      "reasoning": "why this game fits their goals and current state",
      "estimatedTime": 90,
      "alignmentScore": 0.8,
      "moodSuitability": "Energizing"
    }
  ],
  "goalsAlignment": [
    {
      "goalType": "finish_backlog",
      "alignment": "Directly supports by focusing on completion",
      "progress": "Could complete 1-2 games this week"
    }
  ],
  "weeklyTips": ["Tip 1", "Tip 2", "Tip 3"],
  "totalEstimatedTime": 420
}`;

      const messages: OllamaChatMessage[] = [
        { role: 'user', content: prompt }
      ];

      const response = await this.chatCompletion(messages, {
        temperature: 0.7,
        numPredict: 600
      });

      // Parse the JSON response
      const parsed = JSON.parse(response);

      // Validate the response structure
      if (!parsed.theme || !Array.isArray(parsed.recommendations)) {
        throw new Error('Invalid response structure from AI');
      }

      console.log('📅 Generated weekly play plan:', parsed.theme);
      return parsed;

    } catch (error) {
      console.error('❌ Error generating weekly play plan:', error);

      // Return a basic fallback plan
      return {
        theme: "Balanced Gaming Week",
        recommendations: userContext.recentGames.slice(0, 3).map(game => ({
          gameId: game.gameId,
          gameName: game.gameName,
          reasoning: "Continuing with recently played game to maintain momentum",
          estimatedTime: 120,
          alignmentScore: 0.6,
          moodSuitability: "Neutral"
        })),
        goalsAlignment: userContext.goals.map(goal => ({
          goalType: goal.type,
          alignment: "General alignment with gaming goals",
          progress: "Building consistent habits"
        })),
        weeklyTips: [
          "Track your mood before and after each session",
          "Take breaks between intense gaming sessions",
          "Celebrate small victories and completed goals"
        ],
        totalEstimatedTime: 360
      };
    }
  }

  /**
   * Get goal-based recommendations with specific coaching advice
   */
  async getGoalBasedRecommendations(goal: {
    type: string;
    title: string;
    description?: string;
    currentProgress?: number;
    targetValue?: number;
  }, userContext: {
    ownedGames: Array<{ gameId: string; gameName: string; genres: string[]; difficulty: string }>;
    recentActivity: Array<{ gameId: string; sessions: number; totalTime: number }>;
    moodProfile: { currentMood: string; preferredMoods: string[] };
    availableTime: number;
  }): Promise<{
    recommendations: Array<{
      gameId: string;
      gameName: string;
      priority: 'high' | 'medium' | 'low';
      coachingRationale: string;
      expectedOutcome: string;
      timeCommitment: number;
    }>;
    coachingAdvice: string;
    motivationalMessage: string;
    nextSteps: string[];
  }> {
    try {
      const prompt = `You are a gaming coach specializing in goal achievement. Provide specific recommendations and coaching for this goal.

GOAL: ${goal.title}
Type: ${goal.type}
Description: ${goal.description || 'Not provided'}
Progress: ${goal.currentProgress || 0}/${goal.targetValue || 'Not set'}

USER CONTEXT:
Available games: ${userContext.ownedGames.map(g => `${g.gameName} (${g.genres.join(', ')}, ${g.difficulty})`).join(', ')}
Recent activity: ${userContext.recentActivity.map(a => `${a.sessions} sessions, ${a.totalTime}min total`).join(', ')}
Current mood: ${userContext.moodProfile.currentMood}
Preferred moods: ${userContext.moodProfile.preferredMoods.join(', ')}
Available time per session: ${userContext.availableTime} minutes

Provide 2-4 game recommendations that will help achieve this specific goal. Include coaching advice and motivation.

Format as JSON:
{
  "recommendations": [
    {
      "gameId": "from owned games",
      "gameName": "exact name",
      "priority": "high",
      "coachingRationale": "why this helps the goal",
      "expectedOutcome": "what they'll achieve",
      "timeCommitment": 60
    }
  ],
  "coachingAdvice": "Specific advice for achieving this goal",
  "motivationalMessage": "Encouraging message",
  "nextSteps": ["Step 1", "Step 2", "Step 3"]
}`;

      const messages: OllamaChatMessage[] = [
        { role: 'user', content: prompt }
      ];

      const response = await this.chatCompletion(messages, {
        temperature: 0.7,
        numPredict: 600
      });
      const parsed = JSON.parse(response);

      console.log('🎯 Generated goal-based recommendations for:', goal.title);
      return parsed;

    } catch (error) {
      console.error('❌ Error getting goal-based recommendations:', error);

      // Return basic fallback
      return {
        recommendations: userContext.ownedGames.slice(0, 2).map(game => ({
          gameId: game.gameId,
          gameName: game.gameName,
          priority: 'medium' as const,
          coachingRationale: "General gaming activity to build momentum",
          expectedOutcome: "Improved gaming consistency",
          timeCommitment: 60
        })),
        coachingAdvice: "Focus on consistent, enjoyable gaming sessions that align with your goals.",
        motivationalMessage: "Every session brings you closer to your gaming objectives!",
        nextSteps: [
          "Choose one game to focus on this week",
          "Set a specific time to play regularly",
          "Track your progress and celebrate achievements"
        ]
      };
    }
  }

  /**
   * Analyze user patterns for adaptive coaching insights
   */
  async analyzeUserPatterns(patterns: {
    sessionFrequency: number; // sessions per week
    averageSessionLength: number; // minutes
    genrePreferences: Record<string, number>; // genre -> preference score
    moodGameChoices: Record<string, string[]>; // mood -> gameIds played
    completionRate: number; // percentage of games completed
    timeManagement: { plannedVsActual: number; consistency: number };
  }): Promise<{
    insights: Array<{ type: 'strength' | 'opportunity' | 'concern'; message: string; priority: number }>;
    recommendations: string[];
    predictedTrends: Array<{ timeframe: string; prediction: string; confidence: number }>;
    coachingFocus: string;
  }> {
    try {
      const prompt = `Analyze this gamer's patterns and provide coaching insights. Be specific and actionable.

PATTERNS DATA:
- Session frequency: ${patterns.sessionFrequency} sessions/week
- Average session: ${patterns.averageSessionLength} minutes
- Genre preferences: ${Object.entries(patterns.genrePreferences).map(([genre, score]) => `${genre}: ${score}`).join(', ')}
- Mood-based choices: ${Object.entries(patterns.moodGameChoices).map(([mood, games]) => `${mood}: ${games.length} games`).join(', ')}
- Completion rate: ${patterns.completionRate}%
- Time management: ${patterns.timeManagement.consistency * 100}% consistent

Identify:
1. Key strengths in their gaming habits
2. Areas for improvement
3. Potential concerns
4. Specific recommendations
5. Predicted trends over next month

Format as JSON:
{
  "insights": [
    {"type": "strength", "message": "Specific strength", "priority": 1},
    {"type": "opportunity", "message": "Improvement area", "priority": 2}
  ],
  "recommendations": ["Specific recommendation 1", "Specific recommendation 2"],
  "predictedTrends": [
    {"timeframe": "Next week", "prediction": "Will maintain current pace", "confidence": 0.8}
  ],
  "coachingFocus": "Main area to focus coaching efforts"
}`;

      const messages: OllamaChatMessage[] = [
        { role: 'user', content: prompt }
      ];

      const response = await this.chatCompletion(messages, {
        temperature: 0.7,
        numPredict: 600
      });
      const parsed = JSON.parse(response);

      console.log('📊 Analyzed user patterns, focus:', parsed.coachingFocus);
      return parsed;

    } catch (error) {
      console.error('❌ Error analyzing user patterns:', error);

      return {
        insights: [
          { type: 'strength' as const, message: 'Consistent gaming schedule', priority: 1 },
          { type: 'opportunity' as const, message: 'Could benefit from goal setting', priority: 2 }
        ],
        recommendations: [
          'Set specific gaming goals',
          'Track mood patterns',
          'Experiment with new genres'
        ],
        predictedTrends: [
          { timeframe: 'Next week', prediction: 'Will continue current habits', confidence: 0.7 }
        ],
        coachingFocus: 'Goal setting and progress tracking'
      };
    }
  }

  /**
   * Get current model
   */
  getModel(): string {
    return this.model
  }
}

// Export singleton instance
export const ollamaService = new OllamaService()

// Export class for testing
export { OllamaService }
