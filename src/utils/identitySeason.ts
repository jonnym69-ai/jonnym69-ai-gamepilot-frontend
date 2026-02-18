import type { IdentitySnapshot } from './identityHistory';
import type { Milestone } from './identityMilestones';

// Types for season reports
export interface SeasonReport {
  id: string;
  month: number; // 1-12
  year: number;
  monthName: string;
  dominantMoods: string[];
  sessionLengthTrends: {
    short: number;
    medium: number;
    long: number;
  };
  timeOfDayPatterns: {
    morning: number;
    afternoon: number;
    evening: number;
    'late-night': number;
  };
  newMilestones: Milestone[];
  topIdentityGames: {
    id: string;
    title: string;
    score: number;
    appearances: number;
  }[];
  shortNarrative: string;
  fullNarrative?: string;
  snapshotCount: number;
  completionRateChange: {
    start: number;
    end: number;
    change: number;
  };
  playPatternShifts: {
    pattern: string;
    startCount: number;
    endCount: number;
    change: number;
  }[];
  generatedAt: string;
}

export interface SeasonGenerationOptions {
  maxSeasons?: number;
  storageKey?: string;
}

/**
 * Generate a season report from snapshots and milestones
 */
export const generateSeasonReport = (
  snapshots: IdentitySnapshot[],
  allMilestones: Milestone[],
  options: SeasonGenerationOptions = {}
): SeasonReport | null => {
  if (snapshots.length === 0) return null;

  const { maxSeasons = 12, storageKey = 'identity_seasons' } = options;
  
  // Get the most recent month from snapshots
  const latestSnapshot = snapshots[0];
  const latestDate = new Date(latestSnapshot.timestamp);
  const month = latestDate.getMonth() + 1; // 1-12
  const year = latestDate.getFullYear();
  
  // Filter snapshots for this month
  const monthSnapshots = snapshots.filter(snapshot => {
    const date = new Date(snapshot.timestamp);
    return date.getMonth() + 1 === month && date.getFullYear() === year;
  });

  if (monthSnapshots.length === 0) return null;

  // Get existing season reports to find previous month
  const existingReports = getSeasonReports(options);
  const previousMonthSnapshots = getPreviousMonthSnapshots(snapshots, month, year, existingReports);

  // Generate season data
  const dominantMoods = calculateDominantMoods(monthSnapshots);
  const sessionLengthTrends = calculateSessionLengthTrends(monthSnapshots);
  const timeOfDayPatterns = calculateTimeOfDayPatterns(monthSnapshots);
  const newMilestones = getNewMilestonesForMonth(allMilestones, monthSnapshots, existingReports);
  const topIdentityGames = calculateTopIdentityGames(monthSnapshots);
  const completionRateChange = calculateCompletionRateChange(previousMonthSnapshots, monthSnapshots);
  const playPatternShifts = calculatePlayPatternShifts(previousMonthSnapshots, monthSnapshots);

  // Generate narratives
  const shortNarrative = generateSeasonNarrative({
    dominantMoods,
    sessionLengthTrends,
    timeOfDayPatterns,
    newMilestones,
    topIdentityGames,
    snapshotCount: monthSnapshots.length,
    completionRateChange,
    playPatternShifts,
    monthName: getMonthName(month),
    year
  });

  const fullNarrative = generateFullSeasonNarrative({
    dominantMoods,
    sessionLengthTrends,
    timeOfDayPatterns,
    newMilestones,
    topIdentityGames,
    snapshotCount: monthSnapshots.length,
    completionRateChange,
    playPatternShifts,
    monthName: getMonthName(month),
    year
  });

  return {
    id: `season_${year}_${month}`,
    month,
    year,
    monthName: getMonthName(month),
    dominantMoods,
    sessionLengthTrends,
    timeOfDayPatterns,
    newMilestones,
    topIdentityGames,
    shortNarrative,
    fullNarrative,
    snapshotCount: monthSnapshots.length,
    completionRateChange,
    playPatternShifts,
    generatedAt: new Date().toISOString()
  };
};

/**
 * Save a season report to localStorage
 */
export const saveSeasonReport = (report: SeasonReport, options: SeasonGenerationOptions = {}): void => {
  const { maxSeasons = 12, storageKey = 'identity_seasons' } = options;
  
  try {
    // Get existing reports
    const existingReports = getSeasonReports(options);
    
    // Check if this season already exists
    const existingIndex = existingReports.findIndex(r => r.id === report.id);
    if (existingIndex >= 0) {
      // Update existing report
      existingReports[existingIndex] = report;
    } else {
      // Add new report
      existingReports.push(report);
    }
    
    // Sort by date (newest first)
    existingReports.sort((a, b) => {
      const dateA = new Date(a.year, a.month - 1);
      const dateB = new Date(b.year, b.month - 1);
      return dateB.getTime() - dateA.getTime();
    });
    
    // Keep only the most recent seasons
    const trimmedReports = existingReports.slice(0, maxSeasons);
    
    // Save to localStorage
    localStorage.setItem(storageKey, JSON.stringify(trimmedReports));
    
    // Dispatch event for real-time updates
    window.dispatchEvent(new CustomEvent('season-reports-updated', {
      detail: { reports: trimmedReports }
    }));
    
  } catch (error) {
    console.warn('Failed to save season report:', error);
  }
};

/**
 * Get all season reports from localStorage
 */
export const getSeasonReports = (options: SeasonGenerationOptions = {}): SeasonReport[] => {
  const { storageKey = 'identity_seasons' } = options;
  
  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Failed to load season reports:', error);
    return [];
  }
};

/**
 * Check if a new season report should be generated
 */
export const shouldGenerateSeasonReport = (lastReport: SeasonReport | null): boolean => {
  if (!lastReport) return true;
  
  const now = new Date();
  const lastReportDate = new Date(lastReport.year, lastReport.month - 1);
  
  // Check if we're in a new month
  return now.getMonth() !== lastReportDate.getMonth() || 
         now.getFullYear() !== lastReportDate.getFullYear();
};

/**
 * Generate season reports for all available months
 */
export const generateAllSeasonReports = (
  snapshots: IdentitySnapshot[],
  allMilestones: Milestone[],
  options: SeasonGenerationOptions = {}
): SeasonReport[] => {
  const reports: SeasonReport[] = [];
  
  // Group snapshots by month
  const snapshotsByMonth = new Map<string, IdentitySnapshot[]>();
  
  snapshots.forEach(snapshot => {
    const date = new Date(snapshot.timestamp);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    if (!snapshotsByMonth.has(monthKey)) {
      snapshotsByMonth.set(monthKey, []);
    }
    snapshotsByMonth.get(monthKey)!.push(snapshot);
  });
  
  // Generate report for each month
  Array.from(snapshotsByMonth.entries())
    .sort(([a], [b]) => b.localeCompare(a)) // Sort by date (newest first)
    .forEach(([monthKey, monthSnapshots]) => {
      const [year, month] = monthKey.split('-').map(Number);
      const report = generateSeasonReport(monthSnapshots, allMilestones, options);
      
      if (report) {
        reports.push(report);
      }
    });
  
  return reports;
};

/**
 * Calculate dominant moods for the month
 */
const calculateDominantMoods = (snapshots: IdentitySnapshot[]): string[] => {
  const moodCounts: Record<string, number> = {};
  
  snapshots.forEach(snapshot => {
    snapshot.dominantMoods.forEach(mood => {
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });
  });
  
  return Object.entries(moodCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([mood]) => mood);
};

/**
 * Calculate session length trends
 */
const calculateSessionLengthTrends = (snapshots: IdentitySnapshot[]) => {
  const trends = { short: 0, medium: 0, long: 0 };
  
  snapshots.forEach(snapshot => {
    trends[snapshot.preferredSessionLength as keyof typeof trends]++;
  });
  
  return trends;
};

/**
 * Calculate time-of-day patterns
 */
const calculateTimeOfDayPatterns = (snapshots: IdentitySnapshot[]): { morning: number; afternoon: number; evening: number; 'late-night': number } => {
  const patterns = { morning: 0, afternoon: 0, evening: 0, 'late-night': 0 };
  
  snapshots.forEach(snapshot => {
    snapshot.preferredTimesOfDay.forEach(time => {
      const timeKey = time as keyof typeof patterns;
      if (patterns.hasOwnProperty(timeKey)) {
        patterns[timeKey]++;
      }
    });
  });
  
  return patterns;
};

/**
 * Get new milestones for the month
 */
const getNewMilestonesForMonth = (
  allMilestones: Milestone[],
  monthSnapshots: IdentitySnapshot[],
  existingReports: SeasonReport[]
): Milestone[] => {
  if (monthSnapshots.length === 0) return [];
  
  const monthStart = new Date(monthSnapshots[monthSnapshots.length - 1].timestamp);
  const monthEnd = new Date(monthSnapshots[0].timestamp);
  
  return allMilestones.filter(milestone => {
    const milestoneDate = new Date(milestone.timestamp);
    return milestoneDate >= monthStart && milestoneDate <= monthEnd;
  });
};

/**
 * Calculate top identity-defining games
 */
const calculateTopIdentityGames = (snapshots: IdentitySnapshot[]) => {
  const gameCounts: Record<string, { title: string; score: number; appearances: number }> = {};
  
  snapshots.forEach(snapshot => {
    snapshot.topIdentityGames.forEach(game => {
      if (!gameCounts[game.id]) {
        gameCounts[game.id] = {
          title: game.title,
          score: game.score,
          appearances: 0
        };
      }
      gameCounts[game.id].appearances++;
      gameCounts[game.id].score = Math.max(gameCounts[game.id].score, game.score);
    });
  });
  
  return Object.entries(gameCounts)
    .sort(([,a], [,b]) => b.score - a.score)
    .slice(0, 5)
    .map(([id, game]) => ({
      id,
      title: game.title,
      score: game.score,
      appearances: game.appearances
    }));
};

/**
 * Calculate completion rate change
 */
const calculateCompletionRateChange = (
  previousMonthSnapshots: IdentitySnapshot[],
  currentMonthSnapshots: IdentitySnapshot[]
) => {
  const startRate = previousMonthSnapshots.length > 0 
    ? previousMonthSnapshots.reduce((sum, s) => sum + s.completionRate, 0) / previousMonthSnapshots.length
    : 0;
  
  const endRate = currentMonthSnapshots.length > 0
    ? currentMonthSnapshots.reduce((sum, s) => sum + s.completionRate, 0) / currentMonthSnapshots.length
    : 0;
  
  return {
    start: startRate,
    end: endRate,
    change: endRate - startRate
  };
};

/**
 * Calculate play pattern shifts
 */
const calculatePlayPatternShifts = (
  previousMonthSnapshots: IdentitySnapshot[],
  currentMonthSnapshots: IdentitySnapshot[]
) => {
  const previousPatterns: Record<string, number> = {};
  const currentPatterns: Record<string, number> = {};
  
  previousMonthSnapshots.forEach(snapshot => {
    snapshot.recentPlayPatterns.forEach(pattern => {
      previousPatterns[pattern] = (previousPatterns[pattern] || 0) + 1;
    });
  });
  
  currentMonthSnapshots.forEach(snapshot => {
    snapshot.recentPlayPatterns.forEach(pattern => {
      currentPatterns[pattern] = (currentPatterns[pattern] || 0) + 1;
    });
  });
  
  const allPatterns = new Set([...Object.keys(previousPatterns), ...Object.keys(currentPatterns)]);
  
  return Array.from(allPatterns).map(pattern => ({
    pattern,
    startCount: previousPatterns[pattern] || 0,
    endCount: currentPatterns[pattern] || 0,
    change: (currentPatterns[pattern] || 0) - (previousPatterns[pattern] || 0)
  })).filter(shift => Math.abs(shift.change) > 0);
};

/**
 * Get previous month snapshots
 */
const getPreviousMonthSnapshots = (
  allSnapshots: IdentitySnapshot[],
  currentMonth: number,
  currentYear: number,
  existingReports: SeasonReport[]
): IdentitySnapshot[] => {
  // Find the previous month
  let prevMonth = currentMonth - 1;
  let prevYear = currentYear;
  
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear--;
  }
  
  // Filter snapshots for previous month
  return allSnapshots.filter(snapshot => {
    const date = new Date(snapshot.timestamp);
    return date.getMonth() + 1 === prevMonth && date.getFullYear() === prevYear;
  });
};

/**
 * Generate short season narrative
 */
const generateSeasonNarrative = (data: {
  dominantMoods: string[];
  sessionLengthTrends: any;
  timeOfDayPatterns: any;
  newMilestones: Milestone[];
  topIdentityGames: any[];
  snapshotCount: number;
  completionRateChange: any;
  playPatternShifts: any[];
  monthName: string;
  year: number;
}): string => {
  const { dominantMoods, sessionLengthTrends, timeOfDayPatterns, newMilestones, topIdentityGames, 
         snapshotCount, completionRateChange, playPatternShifts, monthName, year } = data;
  
  let narrative = `In ${monthName} ${year}, `;
  
  // Add mood information
  if (dominantMoods.length > 0) {
    narrative += `you were primarily ${dominantMoods.join(', ').replace(/, ([^,]+)$/, ' and $1')}, `;
  }
  
  // Add session length info
  const dominantSession = Object.entries(sessionLengthTrends)
    .sort(([,a]: [string, unknown], [,b]: [string, unknown]) => (b as number) - (a as number))[0]?.[0] || 'medium';
  narrative += `favoring ${dominantSession} sessions, `;
  
  // Add time pattern
  const dominantTime = Object.entries(timeOfDayPatterns)
    .sort(([,a]: [string, unknown], [,b]: [string, unknown]) => (b as number) - (a as number))[0]?.[0] || 'evening';
  narrative += `mostly gaming in the ${dominantTime.replace('-', ' ')}. `;
  
  // Add milestones
  if (newMilestones.length > 0) {
    narrative += `You unlocked ${newMilestones.length} milestone${newMilestones.length > 1 ? 's' : ''} including ${newMilestones[0].title}. `;
  }
  
  // Add games
  if (topIdentityGames.length > 0) {
    narrative += `${topIdentityGames[0].title} was your most identity-defining game. `;
  }
  
  // Add completion rate change
  if (completionRateChange.change !== 0) {
    const change = Math.abs((completionRateChange.change as number) * 100);
    const direction = completionRateChange.change > 0 ? 'increased' : 'decreased';
    narrative += `Your completion rate ${direction} by ${change.toFixed(0)}%. `;
  }
  
  // Add snapshot count
  narrative += `You created ${snapshotCount} identity snapshot${snapshotCount > 1 ? 's' : ''}.`;
  
  return narrative;
};

/**
 * Generate full season narrative
 */
const generateFullSeasonNarrative = (data: {
  dominantMoods: string[];
  sessionLengthTrends: any;
  timeOfDayPatterns: any;
  newMilestones: Milestone[];
  topIdentityGames: any[];
  snapshotCount: number;
  completionRateChange: any;
  playPatternShifts: any[];
  monthName: string;
  year: number;
}): string => {
  const { dominantMoods, sessionLengthTrends, timeOfDayPatterns, newMilestones, 
         topIdentityGames, snapshotCount, completionRateChange, playPatternShifts, 
         monthName, year } = data;
  
  let narrative = `Your ${monthName} ${year} gaming identity was a month of `;
  
  // Add mood evolution
  if (dominantMoods.length > 1) {
    narrative += `diverse emotional experiences, primarily ${dominantMoods.join(', ').replace(/, ([^,]+)$/, ' and $1')}. `;
  } else if (dominantMoods.length === 1) {
    narrative += `consistent ${dominantMoods[0]} gaming. `;
  }
  
  // Add session patterns
  const totalSessions = Object.values(sessionLengthTrends).reduce((a: number, b: unknown) => a + (b as number), 0);
  const dominantSession = Object.entries(sessionLengthTrends)
    .sort(([,a]: [string, unknown], [,b]: [string, unknown]) => (b as number) - (a as number))[0]?.[0] || 'medium';
  const sessionValue = sessionLengthTrends[dominantSession as keyof typeof sessionLengthTrends] as number;
  const sessionPercentage = ((sessionValue || 0) / totalSessions) * 100;
  
  narrative += `Your ${dominantSession} sessions dominated your playtime at ${sessionPercentage.toFixed(0)}%, `;
  
  // Add time patterns
  const dominantTime = Object.entries(timeOfDayPatterns)
    .sort(([,a]: [string, unknown], [,b]: [string, unknown]) => (b as number) - (a as number))[0]?.[0] || 'evening';
  narrative += `with ${dominantTime.replace('-', ' ')} being your preferred gaming time. `;
  
  // Add milestones celebration
  if (newMilestones.length > 0) {
    narrative += `This month marked significant achievements as you unlocked ${newMilestones.length} milestone${newMilestones.length > 1 ? 's' : ''}. `;
    if (newMilestones.length === 1) {
      narrative += `You earned the "${newMilestones[0].title}" achievement, `;
    } else {
      narrative += `Notable achievements include "${newMilestones[0].title}" and "${newMilestones[1]?.title}". `;
    }
  }
  
  // Add top games
  if (topIdentityGames.length > 0) {
    narrative += `${topIdentityGames[0].title} emerged as your most identity-defining game, `;
    if (topIdentityGames[0].appearances > 1) {
      narrative += `appearing in ${topIdentityGames[0].appearances} of your snapshots. `;
    }
  }
  
  // Add play pattern shifts
  if (playPatternShifts.length > 0) {
    narrative += `Your play patterns showed interesting shifts, `;
    const biggestShift = playPatternShifts.sort((a, b) => Math.abs(b.change) - Math.abs(a.change))[0];
    if (biggestShift.change > 0) {
      narrative += `with increased ${biggestShift.pattern} tendencies. `;
    } else {
      narrative += `with decreased ${biggestShift.pattern} tendencies. `;
    }
  }
  
  // Add completion rate analysis
  if (completionRateChange.change !== 0) {
    const change = Math.abs(completionRateChange.change * 100);
    const direction = completionRateChange.change > 0 ? 'improvement' : 'decline';
    narrative += `Your completion rate showed ${direction} of ${change.toFixed(0)}%, `;
    if (completionRateChange.change > 0) {
      narrative += `demonstrating your growing dedication to completing games. `;
    } else {
      narrative += `perhaps indicating a shift toward exploration over completion. `;
    }
  }
  
  // Add summary
  narrative += `With ${snapshotCount} identity snapshot${snapshotCount > 1 ? 's' : ''} created, `;
  narrative += `${monthName} ${year} represents a significant chapter in your ongoing gaming journey, `;
  narrative += `showcasing your evolving preferences and growing identity as a gamer.`;
  
  return narrative;
};

/**
 * Get month name from number
 */
const getMonthName = (month: number): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1] || 'Unknown';
};

/**
 * Clear all season reports
 */
export const clearSeasonReports = (options: SeasonGenerationOptions = {}): void => {
  const { storageKey = 'identity_seasons' } = options;
  
  try {
    localStorage.removeItem(storageKey);
    
    // Dispatch event for real-time updates
    window.dispatchEvent(new CustomEvent('season-reports-cleared'));
  } catch (error) {
    console.warn('Failed to clear season reports:', error);
  }
};

/**
 * Get season statistics
 */
export const getSeasonStats = (options: SeasonGenerationOptions = {}): {
  totalSeasons: number;
  totalSnapshots: number;
  averageSnapshotsPerSeason: number;
  mostCommonMood: string;
  mostCommonSessionLength: string;
  totalMilestones: number;
} => {
  const reports = getSeasonReports(options);
  
  if (reports.length === 0) {
    return {
      totalSeasons: 0,
      totalSnapshots: 0,
      averageSnapshotsPerSeason: 0,
      mostCommonMood: '',
      mostCommonSessionLength: '',
      totalMilestones: 0
    };
  }
  
  const totalSnapshots = reports.reduce((sum, report) => sum + report.snapshotCount, 0);
  const averageSnapshotsPerSeason = totalSnapshots / reports.length;
  
  // Calculate most common mood
  const moodCounts: Record<string, number> = {};
  reports.forEach(report => {
    report.dominantMoods.forEach(mood => {
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });
  });
  const mostCommonMood = Object.entries(moodCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || '';
  
  // Calculate most common session length
  const sessionCounts: Record<string, number> = {};
  reports.forEach(report => {
    const dominant = Object.entries(report.sessionLengthTrends)
      .sort(([,a], [,b]) => b - a)[0]?.[0];
    if (dominant) {
      sessionCounts[dominant] = (sessionCounts[dominant] || 0) + 1;
    }
  });
  const mostCommonSessionLength = Object.entries(sessionCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || '';
  
  const totalMilestones = reports.reduce((sum, report) => sum + report.newMilestones.length, 0);
  
  return {
    totalSeasons: reports.length,
    totalSnapshots,
    averageSnapshotsPerSeason,
    mostCommonMood,
    mostCommonSessionLength,
    totalMilestones
  };
};
