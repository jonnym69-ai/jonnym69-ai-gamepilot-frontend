import type { PersonaContext } from './contextualEngine';

// Types for analytics insights
interface AnalyticsInsights {
  timeOfDayUsage?: Record<string, number>;
  sessionLengthUsage?: Record<string, number>;
  moodUsage?: Record<string, number>;
  personaEffectiveness?: Record<string, { impressions: number; clicks: number }>;
}

interface NarrativeData {
  personaContext?: PersonaContext;
  analyticsInsights?: AnalyticsInsights;
}

/**
 * Generate a personalized gaming identity narrative
 */
export const generateIdentityNarrative = (data: NarrativeData): string => {
  const { personaContext, analyticsInsights } = data;
  
  // Fallback narrative if no data available
  if (!personaContext && !analyticsInsights) {
    return "Your gaming identity is waiting to be discovered. Start playing games to unlock your personalized gaming story.";
  }

  const narrativeParts: string[] = [];

  // Time-based narrative
  const timeBasedInsight = generateTimeBasedNarrative(personaContext, analyticsInsights);
  if (timeBasedInsight) narrativeParts.push(timeBasedInsight);

  // Session-based narrative
  const sessionBasedInsight = generateSessionBasedNarrative(personaContext, analyticsInsights);
  if (sessionBasedInsight) narrativeParts.push(sessionBasedInsight);

  // Mood-based narrative
  const moodBasedInsight = generateMoodBasedNarrative(personaContext, analyticsInsights);
  if (moodBasedInsight) narrativeParts.push(moodBasedInsight);

  // Play pattern narrative
  const playPatternInsight = generatePlayPatternNarrative(personaContext);
  if (playPatternInsight) narrativeParts.push(playPatternInsight);

  // Completion and achievement narrative
  const achievementInsight = generateAchievementNarrative(personaContext, analyticsInsights);
  if (achievementInsight) narrativeParts.push(achievementInsight);

  // Social gaming narrative
  const socialInsight = generateSocialNarrative(personaContext);
  if (socialInsight) narrativeParts.push(socialInsight);

  // Combine narrative parts into a cohesive story
  return combineNarrativeParts(narrativeParts);
};

/**
 * Generate time-based narrative insights
 */
const generateTimeBasedNarrative = (
  personaContext?: PersonaContext, 
  analyticsInsights?: AnalyticsInsights
): string | null => {
  const preferredTimes = personaContext?.preferredTimesOfDay || [];
  const timeUsage = analyticsInsights?.timeOfDayUsage || {};
  
  // Determine dominant time
  let dominantTime = '';
  let timeDescription = '';
  
  if (preferredTimes.length > 0) {
    dominantTime = preferredTimes[0];
  } else if (Object.keys(timeUsage).length > 0) {
    const maxTime = Object.entries(timeUsage).reduce((a, b) => 
      (b[1] as number) > (a[1] as number) ? b : a
    );
    dominantTime = maxTime[0];
  }

  // Generate time-based narrative
  switch (dominantTime) {
    case 'late-night':
      timeDescription = "You're a night owl who finds your gaming groove when the world sleeps";
      break;
    case 'evening':
      timeDescription = "Evening sessions are your sweet spot, perfect for unwinding after a long day";
      break;
    case 'afternoon':
      timeDescription = "Afternoons are when you shine, tackling gaming challenges with fresh energy";
      break;
    case 'morning':
      timeDescription = "You're an early bird who starts the day with gaming adventures";
      break;
    default:
      return null;
  }

  // Add additional context
  if (personaContext?.lateNightRatio && personaContext.lateNightRatio > 0.5) {
    timeDescription += ", often diving deep into immersive worlds when others are winding down";
  }

  return timeDescription;
};

/**
 * Generate session-based narrative insights
 */
const generateSessionBasedNarrative = (
  personaContext?: PersonaContext, 
  analyticsInsights?: AnalyticsInsights
): string | null => {
  const preferredSession = personaContext?.preferredSessionLength;
  const sessionUsage = analyticsInsights?.sessionLengthUsage || {};
  const avgSession = personaContext?.averageSessionLengthMinutes || 0;

  let sessionDescription = '';

  switch (preferredSession) {
    case 'short':
      sessionDescription = "You prefer quick gaming sessions that pack maximum fun into minimal time";
      break;
    case 'medium':
      sessionDescription = "Medium-length sessions are your sweet spot, perfect for immersive adventures without burning out";
      break;
    case 'long':
      sessionDescription = "You're a marathon gamer who loves diving deep into extensive gaming sessions";
      break;
    default:
      if (avgSession > 0) {
        if (avgSession < 30) {
          sessionDescription = "Your gaming sessions tend to be quick bursts of entertainment";
        } else if (avgSession < 90) {
          sessionDescription = "You balance your gaming time with thoughtful, moderate-length sessions";
        } else {
          sessionDescription = "You're someone who really sinks into your gaming experiences";
        }
      } else {
        return null;
      }
  }

  return sessionDescription;
};

/**
 * Generate mood-based narrative insights
 */
const generateMoodBasedNarrative = (
  personaContext?: PersonaContext, 
  analyticsInsights?: AnalyticsInsights
): string | null => {
  const dominantMoods = personaContext?.dominantMoods || [];
  const moodUsage = analyticsInsights?.moodUsage || {};

  // Get top moods
  let topMoods: string[] = [];
  if (dominantMoods.length > 0) {
    topMoods = dominantMoods.slice(0, 3);
  } else if (Object.keys(moodUsage).length > 0) {
    topMoods = Object.entries(moodUsage)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([mood]) => mood);
  }

  if (topMoods.length === 0) return null;

  // Generate mood-based narrative
  const moodDescriptions: Record<string, string> = {
    'chill': "seeking relaxation and stress-free entertainment",
    'creative': "expressing yourself through imaginative gameplay",
    'competitive': "thriving on challenges and strategic thinking",
    'focused': "diving deep into concentrated gaming experiences",
    'intense': "craving high-energy, adrenaline-pumping action",
    'cozy': "finding comfort in warm, welcoming gaming worlds",
    'exploration': "discovering new worlds and hidden secrets",
    'puzzle': "exercising your mind with clever challenges",
    'social': "connecting with others through shared gaming experiences",
    'immersive': "losing yourself in rich, detailed narratives"
  };

  const moodNarratives = topMoods
    .map(mood => moodDescriptions[mood.toLowerCase()])
    .filter(Boolean);

  if (moodNarratives.length === 0) {
    return `You're drawn to ${topMoods.join(', ')} experiences that shape your unique gaming personality`;
  }

  return `You're naturally ${moodNarratives.join(', and ')}`;
};

/**
 * Generate play pattern narrative insights
 */
const generatePlayPatternNarrative = (personaContext?: PersonaContext): string | null => {
  const playPatterns = personaContext?.recentPlayPatterns || [];
  
  if (playPatterns.length === 0) return null;

  const patternDescriptions: Record<string, string> = {
    'completionist': "a completionist who loves seeing games through to the end",
    'explorer': "an explorer who always seeks out new paths and hidden content",
    'strategist': "a strategist who plans every move carefully",
    'social': "a social gamer who enjoys connecting with others",
    'casual': "a casual player who values fun and relaxation",
    'competitive': "a competitive spirit who always aims for victory",
    'collector': "a collector who loves gathering achievements and rare items",
    'speedrunner': "a speedrunner who challenges themselves to beat records"
  };

  const patternNarratives = playPatterns
    .slice(0, 2)
    .map(pattern => patternDescriptions[pattern.toLowerCase()])
    .filter(Boolean);

  if (patternNarratives.length === 0) {
    return `Your play style shows ${playPatterns.join(' and ')} tendencies`;
  }

  return `You're ${patternNarratives.join(' and ')}`;
};

/**
 * Generate achievement and completion narrative
 */
const generateAchievementNarrative = (
  personaContext?: PersonaContext, 
  analyticsInsights?: AnalyticsInsights
): string | null => {
  const completionRate = personaContext?.completionRate || 0;
  
  if (completionRate > 0.7) {
    return "You have a remarkable ability to see games through to completion, showing dedication and perseverance";
  } else if (completionRate > 0.4) {
    return "You balance exploration with completion, enjoying both the journey and the destination";
  } else if (completionRate > 0) {
    return "You're more of an explorer who loves discovering new experiences rather than finishing every game";
  }

  return null;
};

/**
 * Generate social gaming narrative
 */
const generateSocialNarrative = (personaContext?: PersonaContext): string | null => {
  const multiplayerRatio = personaContext?.multiplayerRatio || 0;
  
  if (multiplayerRatio > 0.6) {
    return "Gaming is a social experience for you, thriving on multiplayer connections and shared adventures";
  } else if (multiplayerRatio > 0.3) {
    return "You enjoy both solo adventures and social gaming, finding balance in different play styles";
  } else if (multiplayerRatio > 0) {
    return "You prefer solitary gaming experiences, finding peace and focus in single-player worlds";
  }

  return null;
};

/**
 * Combine narrative parts into a cohesive story
 */
const combineNarrativeParts = (parts: string[]): string => {
  if (parts.length === 0) {
    return "Your gaming identity is uniquely yours, shaped by your choices and experiences.";
  }

  if (parts.length === 1) {
    return parts[0] + ".";
  }

  // For multiple parts, create a flowing narrative
  let narrative = parts[0];
  
  for (let i = 1; i < parts.length; i++) {
    if (i === parts.length - 1) {
      // Last part
      narrative += `, and ${parts[i].toLowerCase()}`;
    } else {
      // Middle parts
      narrative += `, ${parts[i].toLowerCase()}`;
    }
  }

  return narrative + ".";
};
