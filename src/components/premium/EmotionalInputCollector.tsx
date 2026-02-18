import React, { useState } from 'react';
import { motion } from 'framer-motion';

export interface EmotionalProfile {
  energyLevel: number;
  cognitiveLoad: number;
  toleranceLevel: number;
  socialAppetite: 'solo' | 'co-op' | 'competitive' | 'social';
  emotionalNeeds: string[];
  availableTime: number;
  sessionType: 'quick' | 'focused' | 'immersive' | 'marathon';
}

interface EmotionalInputCollectorProps {
  onSubmit: (profile: EmotionalProfile) => void;
  onCancel?: () => void;
  initialProfile?: Partial<EmotionalProfile>;
  isLoading?: boolean;
}

const EmotionalInputCollector: React.FC<EmotionalInputCollectorProps> = ({
  onSubmit,
  onCancel,
  initialProfile,
  isLoading = false
}) => {
  const [profile, setProfile] = useState<EmotionalProfile>({
    energyLevel: initialProfile?.energyLevel || 5,
    cognitiveLoad: initialProfile?.cognitiveLoad || 5,
    toleranceLevel: initialProfile?.toleranceLevel || 5,
    socialAppetite: initialProfile?.socialAppetite || 'solo',
    emotionalNeeds: initialProfile?.emotionalNeeds || [],
    availableTime: initialProfile?.availableTime || 60,
    sessionType: initialProfile?.sessionType || 'focused'
  });

  const emotionalOptions = [
    { id: 'comfort', label: 'Comfort', description: 'Gentle, predictable, safe experiences' },
    { id: 'escape', label: 'Escape', description: 'Immersion, distraction from reality' },
    { id: 'mastery', label: 'Mastery', description: 'Challenge, skill-building, achievement' },
    { id: 'chaos', label: 'Chaos', description: 'Unpredictable, intense, high-stakes' },
    { id: 'novelty', label: 'Novelty', description: 'New experiences, exploration, discovery' },
    { id: 'story_flow', label: 'Story Flow', description: 'Narrative-driven, emotional journey' }
  ];

  const socialOptions = [
    { value: 'solo', label: 'Solo', description: 'Playing alone, self-paced' },
    { value: 'co-op', label: 'Co-op', description: 'Cooperative play with others' },
    { value: 'competitive', label: 'Competitive', description: 'Against other players' },
    { value: 'social', label: 'Social', description: 'Casual multiplayer, hanging out' }
  ];

  const sessionOptions = [
    { value: 'quick', label: 'Quick Session', description: '15-45 minutes' },
    { value: 'focused', label: 'Focused Session', description: '1-2 hours' },
    { value: 'immersive', label: 'Immersive Session', description: '3-5 hours' },
    { value: 'marathon', label: 'Marathon Session', description: '5+ hours' }
  ];

  const handleEmotionalNeedToggle = (needId: string) => {
    setProfile(prev => ({
      ...prev,
      emotionalNeeds: prev.emotionalNeeds.includes(needId)
        ? prev.emotionalNeeds.filter(id => id !== needId)
        : [...prev.emotionalNeeds, needId]
    }));
  };

  const handleTimePreset = (minutes: number) => {
    setProfile(prev => ({ ...prev, availableTime: minutes }));
  };

  const getEnergyLabel = (level: number) => {
    if (level <= 3) return 'Low Energy';
    if (level <= 7) return 'Moderate Energy';
    return 'High Energy';
  };

  const getCognitiveLabel = (level: number) => {
    if (level <= 3) return 'Low Load';
    if (level <= 7) return 'Moderate Load';
    return 'High Load';
  };

  const getToleranceLabel = (level: number) => {
    if (level <= 3) return 'Low Tolerance';
    if (level <= 7) return 'Moderate Tolerance';
    return 'High Tolerance';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">How are you feeling today?</h2>
        <p className="text-slate-300">Help me understand your current state for the perfect gaming recommendation</p>
      </div>

      <div className="space-y-8">
        {/* Energy Level */}
        <div className="space-y-3">
          <label htmlFor="energy-slider" className="block text-sm font-medium text-slate-200">
            Energy Level: {profile.energyLevel}/10 - {getEnergyLabel(profile.energyLevel)}
          </label>
          <input
            id="energy-slider"
            type="range"
            min="1"
            max="10"
            value={profile.energyLevel}
            onChange={(e) => setProfile(prev => ({ ...prev, energyLevel: parseInt(e.target.value) }))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
            aria-label={`Energy level: ${profile.energyLevel} out of 10 - ${getEnergyLabel(profile.energyLevel)}`}
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>Exhausted</span>
            <span>Balanced</span>
            <span>Hyper</span>
          </div>
        </div>

        {/* Cognitive Load */}
        <div className="space-y-3">
          <label htmlFor="cognitive-slider" className="block text-sm font-medium text-slate-200">
            Cognitive Load: {profile.cognitiveLoad}/10 - {getCognitiveLabel(profile.cognitiveLoad)}
          </label>
          <input
            id="cognitive-slider"
            type="range"
            min="1"
            max="10"
            value={profile.cognitiveLoad}
            onChange={(e) => setProfile(prev => ({ ...prev, cognitiveLoad: parseInt(e.target.value) }))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
            aria-label={`Cognitive load: ${profile.cognitiveLoad} out of 10 - ${getCognitiveLabel(profile.cognitiveLoad)}`}
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>Overwhelmed</span>
            <span>Focused</span>
            <span>Sharp</span>
          </div>
        </div>

        {/* Tolerance Level */}
        <div className="space-y-3">
          <label htmlFor="tolerance-slider" className="block text-sm font-medium text-slate-200">
            Tolerance for Challenge: {profile.toleranceLevel}/10 - {getToleranceLabel(profile.toleranceLevel)}
          </label>
          <input
            id="tolerance-slider"
            type="range"
            min="1"
            max="10"
            value={profile.toleranceLevel}
            onChange={(e) => setProfile(prev => ({ ...prev, toleranceLevel: parseInt(e.target.value) }))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
            aria-label={`Tolerance for challenge: ${profile.toleranceLevel} out of 10 - ${getToleranceLabel(profile.toleranceLevel)}`}
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>Easy Mode</span>
            <span>Balanced</span>
            <span>Masochist</span>
          </div>
        </div>

        {/* Social Appetite */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-200">Social Preference</label>
          <div className="grid grid-cols-2 gap-3">
            {socialOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setProfile(prev => ({ ...prev, socialAppetite: option.value as any }))}
                className={`p-3 rounded-lg border transition-all ${
                  profile.socialAppetite === option.value
                    ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                    : 'border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="font-medium text-sm">{option.label}</div>
                <div className="text-xs text-slate-400 mt-1">{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Emotional Needs */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-200">What are you craving? (Select all that apply)</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {emotionalOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleEmotionalNeedToggle(option.id)}
                className={`p-3 rounded-lg border transition-all text-left ${
                  profile.emotionalNeeds.includes(option.id)
                    ? 'border-green-500 bg-green-500/20 text-green-300'
                    : 'border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="font-medium text-sm">{option.label}</div>
                <div className="text-xs text-slate-400 mt-1">{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Time Availability */}
        <div className="space-y-3">
          <label htmlFor="time-slider" className="block text-sm font-medium text-slate-200">
            How much time do you have? ({profile.availableTime} minutes)
          </label>
          <input
            id="time-slider"
            type="range"
            min="15"
            max="480"
            step="15"
            value={profile.availableTime}
            onChange={(e) => setProfile(prev => ({ ...prev, availableTime: parseInt(e.target.value) }))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
            aria-label={`Available time: ${profile.availableTime} minutes`}
          />
          <div className="flex justify-between">
            <div className="flex gap-2">
              {[15, 30, 60, 120].map((time) => (
                <button
                  key={time}
                  onClick={() => handleTimePreset(time)}
                  className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded text-slate-300"
                >
                  {time}m
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-400">{Math.floor(profile.availableTime / 60)}h {profile.availableTime % 60}m</span>
          </div>
        </div>

        {/* Session Type */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-200">Session Type</label>
          <div className="grid grid-cols-2 gap-3">
            {sessionOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setProfile(prev => ({ ...prev, sessionType: option.value as any }))}
                className={`p-3 rounded-lg border transition-all ${
                  profile.sessionType === option.value
                    ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                    : 'border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="font-medium text-sm">{option.label}</div>
                <div className="text-xs text-slate-400 mt-1">{option.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8">
        {onCancel && (
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          onClick={() => onSubmit(profile)}
          disabled={isLoading || profile.emotionalNeeds.length === 0}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all font-medium"
        >
          {isLoading ? 'Finding your perfect game...' : 'Get Gaming Recommendation'}
        </button>
      </div>

      {profile.emotionalNeeds.length === 0 && (
        <p className="text-xs text-amber-400 mt-2 text-center">
          Please select at least one emotional need to get a recommendation
        </p>
      )}
    </motion.div>
  );
};

export default EmotionalInputCollector;
