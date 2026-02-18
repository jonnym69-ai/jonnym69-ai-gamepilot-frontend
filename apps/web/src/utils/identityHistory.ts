import type { PersonaContext } from './contextualEngine';
import type { ContextualMatch } from './contextualEngine';

// Types for identity snapshots
export interface IdentitySnapshot {
  id: string;
  timestamp: string;
  dominantMoods: string[];
  preferredSessionLength: string;
  preferredTimesOfDay: string[];
  recentPlayPatterns: string[];
  completionRate: number;
  multiplayerRatio: number;
  averageSessionLengthMinutes: number;
  topIdentityGames: {
    id: string;
    title: string;
    score: number;
  }[];
  shortNarrative: string;
  // Optional: Store the full narrative for reference
  fullNarrative?: string;
}

export interface IdentityHistoryOptions {
  maxSnapshots?: number;
  storageKey?: string;
}

/**
 * Save an identity snapshot to localStorage
 */
export const saveIdentitySnapshot = (
  snapshot: Omit<IdentitySnapshot, 'id'>, 
  options: IdentityHistoryOptions = {}
): void => {
  const {
    maxSnapshots = 20,
    storageKey = 'identity_history'
  } = options;

  try {
    // Get existing history
    const existingHistory = getIdentityHistory(options);
    
    // Create new snapshot with ID
    const newSnapshot: IdentitySnapshot = {
      ...snapshot,
      id: generateSnapshotId()
    };

    // Add new snapshot to beginning of array
    const updatedHistory = [newSnapshot, ...existingHistory];
    
    // Keep only the most recent snapshots
    const trimmedHistory = updatedHistory.slice(0, maxSnapshots);
    
    // Save to localStorage
    localStorage.setItem(storageKey, JSON.stringify(trimmedHistory));
    
    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('identity-history-updated', {
      detail: { snapshot: newSnapshot, history: trimmedHistory }
    }));
    
  } catch (error) {
    console.warn('Failed to save identity snapshot:', error);
  }
};

/**
 * Get all identity snapshots from localStorage
 */
export const getIdentityHistory = (options: IdentityHistoryOptions = {}): IdentitySnapshot[] => {
  const { storageKey = 'identity_history' } = options;
  
  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Failed to load identity history:', error);
    return [];
  }
};

/**
 * Clear all identity snapshots
 */
export const clearIdentityHistory = (options: IdentityHistoryOptions = {}): void => {
  const { storageKey = 'identity_history' } = options;
  
  try {
    localStorage.removeItem(storageKey);
    
    // Dispatch event for real-time updates
    window.dispatchEvent(new CustomEvent('identity-history-cleared'));
    
  } catch (error) {
    console.warn('Failed to clear identity history:', error);
  }
};

/**
 * Delete a specific snapshot by ID
 */
export const deleteIdentitySnapshot = (snapshotId: string, options: IdentityHistoryOptions = {}): boolean => {
  const { storageKey = 'identity_history' } = options;
  
  try {
    const existingHistory = getIdentityHistory(options);
    const filteredHistory = existingHistory.filter(snapshot => snapshot.id !== snapshotId);
    
    if (filteredHistory.length !== existingHistory.length) {
      localStorage.setItem(storageKey, JSON.stringify(filteredHistory));
      
      // Dispatch event for real-time updates
      window.dispatchEvent(new CustomEvent('identity-history-deleted', {
        detail: { snapshotId, history: filteredHistory }
      }));
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.warn('Failed to delete identity snapshot:', error);
    return false;
  }
};

/**
 * Get a specific snapshot by ID
 */
export const getIdentitySnapshot = (snapshotId: string, options: IdentityHistoryOptions = {}): IdentitySnapshot | null => {
  const history = getIdentityHistory(options);
  return history.find(snapshot => snapshot.id === snapshotId) || null;
};

/**
 * Generate a unique snapshot ID
 */
const generateSnapshotId = (): string => {
  return `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create a snapshot from persona context and related data
 */
export const createIdentitySnapshot = (
  personaContext: PersonaContext,
  identityDefiningGames: ContextualMatch[],
  shortNarrative: string,
  fullNarrative?: string
): Omit<IdentitySnapshot, 'id'> => {
  const topGames = identityDefiningGames.slice(0, 5).map(match => ({
    id: match.game.id,
    title: match.game.title,
    score: match.score
  }));

  return {
    timestamp: new Date().toISOString(),
    dominantMoods: personaContext.dominantMoods || [],
    preferredSessionLength: personaContext.preferredSessionLength || 'medium',
    preferredTimesOfDay: personaContext.preferredTimesOfDay || [],
    recentPlayPatterns: personaContext.recentPlayPatterns || [],
    completionRate: personaContext.completionRate || 0,
    multiplayerRatio: personaContext.multiplayerRatio || 0,
    averageSessionLengthMinutes: personaContext.averageSessionLengthMinutes || 0,
    topIdentityGames: topGames,
    shortNarrative,
    fullNarrative
  };
};

/**
 * Check if a new snapshot should be created based on time criteria
 */
export const shouldCreateSnapshot = (lastSnapshotTime?: string): boolean => {
  if (!lastSnapshotTime) return true;
  
  const lastSnapshot = new Date(lastSnapshotTime);
  const now = new Date();
  const daysDiff = (now.getTime() - lastSnapshot.getTime()) / (1000 * 60 * 60 * 24);
  
  // Create snapshot if it's been more than 7 days
  return daysDiff >= 7;
};

/**
 * Get snapshot statistics
 */
export const getIdentityHistoryStats = (options: IdentityHistoryOptions = {}): {
  totalSnapshots: number;
  oldestSnapshot: string | null;
  newestSnapshot: string | null;
  moodFrequency: Record<string, number>;
  sessionLengthFrequency: Record<string, number>;
  timeOfDayFrequency: Record<string, number>;
} => {
  const history = getIdentityHistory(options);
  
  if (history.length === 0) {
    return {
      totalSnapshots: 0,
      oldestSnapshot: null,
      newestSnapshot: null,
      moodFrequency: {},
      sessionLengthFrequency: {},
      timeOfDayFrequency: {}
    };
  }

  const moodFrequency: Record<string, number> = {};
  const sessionLengthFrequency: Record<string, number> = {};
  const timeOfDayFrequency: Record<string, number> = {};

  // Calculate frequencies
  history.forEach(snapshot => {
    // Count moods
    snapshot.dominantMoods.forEach(mood => {
      moodFrequency[mood] = (moodFrequency[mood] || 0) + 1;
    });

    // Count session lengths
    sessionLengthFrequency[snapshot.preferredSessionLength] = 
      (sessionLengthFrequency[snapshot.preferredSessionLength] || 0) + 1;

    // Count times of day
    snapshot.preferredTimesOfDay.forEach(time => {
      timeOfDayFrequency[time] = (timeOfDayFrequency[time] || 0) + 1;
    });
  });

  return {
    totalSnapshots: history.length,
    oldestSnapshot: history[history.length - 1]?.timestamp || null,
    newestSnapshot: history[0]?.timestamp || null,
    moodFrequency,
    sessionLengthFrequency,
    timeOfDayFrequency
  };
};

/**
 * Export identity history as JSON for backup
 */
export const exportIdentityHistory = (options: IdentityHistoryOptions = {}): string => {
  const history = getIdentityHistory(options);
  return JSON.stringify(history, null, 2);
};

/**
 * Import identity history from JSON backup
 */
export const importIdentityHistory = (jsonString: string, options: IdentityHistoryOptions = {}): boolean => {
  try {
    const history = JSON.parse(jsonString);
    
    // Validate that it's an array of snapshots
    if (!Array.isArray(history)) {
      throw new Error('Invalid format: expected array of snapshots');
    }
    
    // Validate each snapshot
    const validHistory = history.filter(snapshot => {
      return snapshot.id && 
             snapshot.timestamp && 
             Array.isArray(snapshot.dominantMoods) &&
             typeof snapshot.preferredSessionLength === 'string' &&
             Array.isArray(snapshot.preferredTimesOfDay) &&
             typeof snapshot.shortNarrative === 'string';
    });
    
    if (validHistory.length !== history.length) {
      console.warn(`Filtered out ${history.length - validHistory.length} invalid snapshots`);
    }
    
    // Sort by timestamp (newest first)
    validHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Save to localStorage
    localStorage.setItem(options.storageKey || 'identity_history', JSON.stringify(validHistory));
    
    // Dispatch event for real-time updates
    window.dispatchEvent(new CustomEvent('identity-history-imported', {
      detail: { history: validHistory }
    }));
    
    return true;
  } catch (error) {
    console.error('Failed to import identity history:', error);
    return false;
  }
};
