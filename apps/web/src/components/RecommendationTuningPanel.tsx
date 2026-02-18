import React, { useState, useEffect } from 'react';

// Types for tuning settings
interface TuningSettings {
  personaWeight: number;
  moodWeight: number;
  sessionLengthWeight: number;
  timeOfDayWeight: number;
  playPatternWeight: number;
  autoTaggingAggressiveness: number;
}

interface GameScore {
  game: any;
  totalScore: number;
  breakdown: {
    persona: number;
    mood: number;
    sessionLength: number;
    timeOfDay: number;
    playPattern: number;
  };
}

const DEFAULT_SETTINGS: TuningSettings = {
  personaWeight: 0.4,
  moodWeight: 0.3,
  sessionLengthWeight: 0.2,
  timeOfDayWeight: 0.1,
  playPatternWeight: 0.15,
  autoTaggingAggressiveness: 0.5
};

export const RecommendationTuningPanel: React.FC = () => {
  const [settings, setSettings] = useState<TuningSettings>(DEFAULT_SETTINGS);
  const [sampleGames, setSampleGames] = useState<GameScore[]>([]);

  // Load settings from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('tuning_settings');
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.warn('Failed to load tuning settings:', error);
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = (newSettings: TuningSettings) => {
    try {
      localStorage.setItem('tuning_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
      
      // Trigger re-evaluation of recommendations
      window.dispatchEvent(new CustomEvent('tuning-settings-changed', { 
        detail: newSettings 
      }));
    } catch (error) {
      console.warn('Failed to save tuning settings:', error);
    }
  };

  // Reset to defaults
  const resetToDefaults = () => {
    saveSettings(DEFAULT_SETTINGS);
  };

  // Update individual setting
  const updateSetting = (key: keyof TuningSettings, value: number) => {
    saveSettings({
      ...settings,
      [key]: Math.max(0, Math.min(1, value)) // Clamp between 0 and 1
    });
  };

  // Calculate sample scores for live preview
  useEffect(() => {
    // Create sample games for demonstration
    const sampleData = [
      {
        game: {
          id: 'sample-1',
          title: 'Hades',
          moods: ['chill', 'competitive'],
          sessionLength: 'medium',
          recommendedTimes: ['evening', 'late-night'],
          hoursPlayed: 25,
          playStatus: 'playing'
        }
      },
      {
        game: {
          id: 'sample-2',
          title: 'Stardew Valley',
          moods: ['cozy', 'creative'],
          sessionLength: 'long',
          recommendedTimes: ['afternoon', 'evening'],
          hoursPlayed: 120,
          playStatus: 'completed'
        }
      },
      {
        game: {
          id: 'sample-3',
          title: 'Celeste',
          moods: ['focused', 'intense'],
          sessionLength: 'short',
          recommendedTimes: ['morning', 'afternoon'],
          hoursPlayed: 8,
          playStatus: 'playing'
        }
      }
    ];

    // Calculate scores with current settings
    const calculatedScores = sampleData.map(({ game }) => {
      const breakdown = {
        persona: Math.random() * 100 * settings.personaWeight,
        mood: game.moods.length * 20 * settings.moodWeight,
        sessionLength: 50 * settings.sessionLengthWeight,
        timeOfDay: game.recommendedTimes.length * 15 * settings.timeOfDayWeight,
        playPattern: game.hoursPlayed > 50 ? 30 * settings.playPatternWeight : 10 * settings.playPatternWeight
      };

      return {
        game,
        totalScore: Object.values(breakdown).reduce((sum, score) => sum + score, 0),
        breakdown
      };
    });

    setSampleGames(calculatedScores);
  }, [settings]);

  // Slider component
  const TuningSlider: React.FC<{
    label: string;
    value: number;
    onChange: (value: number) => void;
    description: string;
  }> = ({ label, value, onChange, description }) => (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
      <div className="flex items-center justify-between mb-2">
        <label className="text-white font-medium">{label}</label>
        <span className="text-blue-400 font-mono text-sm">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        aria-label={label}
      />
      <p className="text-gray-400 text-xs mt-1">{description}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">🎛️ Recommendation Tuning Panel</h2>
          <p className="text-gray-300">
            Real-time adjustment of recommendation engine weights and scoring parameters
          </p>
        </div>
        <button
          onClick={resetToDefaults}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Reset to Defaults
        </button>
      </div>

      {/* Tuning Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TuningSlider
          label="Persona Weight"
          value={settings.personaWeight}
          onChange={(value) => updateSetting('personaWeight', value)}
          description="Influence of user's long-term gaming patterns and behavior"
        />
        
        <TuningSlider
          label="Mood Weight"
          value={settings.moodWeight}
          onChange={(value) => updateSetting('moodWeight', value)}
          description="Importance of mood matching in recommendations"
        />
        
        <TuningSlider
          label="Session Length Weight"
          value={settings.sessionLengthWeight}
          onChange={(value) => updateSetting('sessionLengthWeight', value)}
          description="How much session duration preferences affect scoring"
        />
        
        <TuningSlider
          label="Time of Day Weight"
          value={settings.timeOfDayWeight}
          onChange={(value) => updateSetting('timeOfDayWeight', value)}
          description="Influence of current time on game recommendations"
        />
        
        <TuningSlider
          label="Play Pattern Weight"
          value={settings.playPatternWeight}
          onChange={(value) => updateSetting('playPatternWeight', value)}
          description="Impact of user's play history and completion patterns"
        />
        
        <TuningSlider
          label="Auto-tagging Aggressiveness"
          value={settings.autoTaggingAggressiveness}
          onChange={(value) => updateSetting('autoTaggingAggressiveness', value)}
          description="How aggressively to infer contextual data from game metadata"
        />
      </div>

      {/* Live Preview */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
        <h3 className="text-white font-semibold mb-4">🔍 Live Preview</h3>
        <p className="text-gray-300 text-sm mb-4">
          Sample games scored with current tuning settings
        </p>
        
        <div className="space-y-4">
          {sampleGames.map(({ game, totalScore, breakdown }) => (
            <div key={game.id} className="bg-black/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium">{game.title}</h4>
                <span className="text-green-400 font-mono text-sm">
                  Score: {totalScore.toFixed(1)}
                </span>
              </div>
              
              {/* Score Breakdown */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Persona:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${(breakdown.persona / 100) * 100}%` }}
                      />
                    </div>
                    <span className="text-gray-300 w-12 text-right">
                      {breakdown.persona.toFixed(1)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Mood:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(breakdown.mood / 100) * 100}%` }}
                      />
                    </div>
                    <span className="text-gray-300 w-12 text-right">
                      {breakdown.mood.toFixed(1)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Session:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${(breakdown.sessionLength / 100) * 100}%` }}
                      />
                    </div>
                    <span className="text-gray-300 w-12 text-right">
                      {breakdown.sessionLength.toFixed(1)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Time:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-full bg-yellow-500 rounded-full"
                        style={{ width: `${(breakdown.timeOfDay / 100) * 100}%` }}
                      />
                    </div>
                    <span className="text-gray-300 w-12 text-right">
                      {breakdown.timeOfDay.toFixed(1)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Pattern:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${(breakdown.playPattern / 100) * 100}%` }}
                      />
                    </div>
                    <span className="text-gray-300 w-12 text-right">
                      {breakdown.playPattern.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings Summary */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
        <h3 className="text-white font-semibold mb-3">Current Settings</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Persona:</span>
            <span className="text-white ml-2">{settings.personaWeight.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-gray-400">Mood:</span>
            <span className="text-white ml-2">{settings.moodWeight.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-gray-400">Session:</span>
            <span className="text-white ml-2">{settings.sessionLengthWeight.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-gray-400">Time:</span>
            <span className="text-white ml-2">{settings.timeOfDayWeight.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-gray-400">Pattern:</span>
            <span className="text-white ml-2">{settings.playPatternWeight.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-gray-400">Tagging:</span>
            <span className="text-white ml-2">{settings.autoTaggingAggressiveness.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
