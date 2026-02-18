import React, { useState } from 'react';
import type { SeasonReport } from '../utils/identitySeason';

interface SeasonTimelineProps {
  reports: SeasonReport[];
  onGenerateSeasonCard?: (report: SeasonReport) => void;
}

interface SeasonItemProps {
  report: SeasonReport;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  onGenerateCard: (report: SeasonReport) => void;
}

const SeasonItem: React.FC<SeasonItemProps> = ({
  report,
  isExpanded,
  onToggle,
  onGenerateCard
}) => {
  // Mood icons mapping
  const moodIcons: Record<string, string> = {
    'chill': '😌',
    'creative': '🎨',
    'competitive': '⚔️',
    'focused': '🎯',
    'intense': '🔥',
    'cozy': '🏠',
    'exploration': '🗺️',
    'puzzle': '🧩',
    'social': '👥',
    'immersive': '🌟',
    'relaxed': '🧘',
    'energetic': '⚡',
    'strategic': '♟️',
    'adventurous': '🚀',
    'mysterious': '🌙',
    'playful': '🎮'
  };

  // Session length icons
  const sessionIcons: Record<string, string> = {
    'short': '⏱️',
    'medium': '⏰',
    'long': '⏳'
  };

  // Time of day icons
  const timeIcons: Record<string, string> = {
    'morning': '🌅',
    'afternoon': '☀️',
    'evening': '🌆',
    'late-night': '🌙'
  };

  // Get dominant session length
  const dominantSession = Object.entries(report.sessionLengthTrends)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'medium';

  // Get dominant time of day
  const dominantTime = Object.entries(report.timeOfDayPatterns)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'evening';

  return (
    <div className="season-item">
      {/* Timeline dot */}
      <div className="timeline-dot">
        <div className="timeline-dot-inner season-dot" />
      </div>

      {/* Content */}
      <div className="timeline-content season-content">
        {/* Header */}
        <div className="season-header">
          <div className="season-date">
            <div className="season-date-text">{report.monthName} {report.year}</div>
            <div className="season-meta">
              {report.snapshotCount} snapshots • {report.newMilestones.length} milestones
            </div>
          </div>
          <div className="season-actions">
            <button
              onClick={() => onToggle(report.id)}
              className="timeline-expand-btn"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? '−' : '+'}
            </button>
            <button
              onClick={() => onGenerateCard(report)}
              className="season-generate-btn"
              aria-label="Generate season card"
            >
              🎴
            </button>
          </div>
        </div>

        {/* Compact View */}
        {!isExpanded && (
          <div className="season-compact">
            <div className="season-compact-overview">
              <div className="season-compact-moods">
                {report.dominantMoods.slice(0, 3).map(mood => (
                  <span key={mood} className="season-mood-tag">
                    {moodIcons[mood.toLowerCase()] || '🎮'}
                    {mood}
                  </span>
                ))}
              </div>
              <div className="season-compact-patterns">
                <span className="season-compact-pattern">
                  {sessionIcons[dominantSession]} {dominantSession}
                </span>
                <span className="season-compact-pattern">
                  {timeIcons[dominantTime]} {dominantTime.replace('-', ' ')}
                </span>
              </div>
            </div>
            
            <div className="season-compact-games">
              <div className="season-games-label">Top Games:</div>
              <div className="season-games-list">
                {report.topIdentityGames.slice(0, 3).map((game, index) => (
                  <div key={game.id} className="season-compact-game">
                    <span className="season-game-rank">#{index + 1}</span>
                    <span className="season-game-title">{game.title}</span>
                    <span className="season-game-score">{game.score.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="season-compact-narrative">
              {report.shortNarrative}
            </p>

            {/* Milestones */}
            {report.newMilestones.length > 0 && (
              <div className="season-compact-milestones">
                <div className="season-milestones-label">New Milestones:</div>
                <div className="season-milestones-list">
                  {report.newMilestones.slice(0, 3).map(milestone => (
                    <div key={milestone.id} className="season-compact-milestone">
                      <span className="season-milestone-icon">{milestone.icon}</span>
                      <span className="season-milestone-title">{milestone.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Expanded View */}
        {isExpanded && (
          <div className="season-expanded">
            {/* Full Overview */}
            <div className="season-section">
              <h4>Season Overview</h4>
              <div className="season-overview-grid">
                <div className="season-overview-item">
                  <div className="season-overview-label">Snapshots</div>
                  <div className="season-overview-value">{report.snapshotCount}</div>
                </div>
                <div className="season-overview-item">
                  <div className="season-overview-label">Milestones</div>
                  <div className="season-overview-value">{report.newMilestones.length}</div>
                </div>
                <div className="season-overview-item">
                  <div className="season-overview-label">Completion Rate</div>
                  <div className="season-overview-value">
                    {Math.round(report.completionRateChange.end * 100)}%
                    {report.completionRateChange.change !== 0 && (
                      <span className={`season-change ${report.completionRateChange.change > 0 ? 'positive' : 'negative'}`}>
                        {' '}{report.completionRateChange.change > 0 ? '↑' : '↓'}{Math.abs(report.completionRateChange.change * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Gaming Patterns */}
            <div className="season-section">
              <h4>Gaming Patterns</h4>
              <div className="season-patterns-grid">
                <div className="season-pattern-item">
                  <div className="season-pattern-header">
                    <span className="season-pattern-icon">🎭</span>
                    <span>Dominant Moods</span>
                  </div>
                  <div className="season-pattern-content">
                    {report.dominantMoods.map(mood => (
                      <div key={mood} className="season-pattern-mood">
                        <span>{moodIcons[mood.toLowerCase()] || '🎮'}</span>
                        <span>{mood}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="season-pattern-item">
                  <div className="season-pattern-header">
                    <span className="season-pattern-icon">⏰</span>
                    <span>Session Length</span>
                  </div>
                  <div className="season-pattern-content">
                    {Object.entries(report.sessionLengthTrends).map(([length, count]) => (
                      <div key={length} className="season-pattern-stat">
                        <span>{sessionIcons[length] || '⏰'}</span>
                        <span>{length}</span>
                        <span>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="season-pattern-item">
                  <div className="season-pattern-header">
                    <span className="season-pattern-icon">🕐️</span>
                    <span>Time of Day</span>
                  </div>
                  <div className="season-pattern-content">
                    {Object.entries(report.timeOfDayPatterns).map(([time, count]) => (
                      <div key={time} className="season-pattern-stat">
                        <span>{timeIcons[time] || '🌅'}</span>
                        <span>{time.replace('-', ' ')}</span>
                        <span>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Top Games */}
            <div className="season-section">
              <h4>Identity-Defining Games</h4>
              <div className="season-games-expanded">
                {report.topIdentityGames.map((game, index) => (
                  <div key={game.id} className="season-game-item">
                    <div className="season-game-rank">#{index + 1}</div>
                    <div className="season-game-info">
                      <div className="season-game-title">{game.title}</div>
                      <div className="season-game-meta">
                        Score: {game.score.toFixed(1)} • {game.appearances} appearances
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Milestones */}
            {report.newMilestones.length > 0 && (
              <div className="season-section">
                <h4>New Milestones Unlocked</h4>
                <div className="season-milestones-expanded">
                  {report.newMilestones.map(milestone => (
                    <div key={milestone.id} className="season-milestone-item">
                      <div className="season-milestone-icon">{milestone.icon}</div>
                      <div className="season-milestone-info">
                        <div className="season-milestone-title">{milestone.title}</div>
                        <div className="season-milestone-description">{milestone.description}</div>
                        <div className="season-milestone-category">{milestone.category}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Play Pattern Shifts */}
            {report.playPatternShifts.length > 0 && (
              <div className="season-section">
                <h4>Play Pattern Shifts</h4>
                <div className="season-shifts">
                  {report.playPatternShifts.map(shift => (
                    <div key={shift.pattern} className="season-shift-item">
                      <div className="season-shift-pattern">{shift.pattern}</div>
                      <div className="season-shift-change">
                        {shift.startCount} → {shift.endCount}
                        <span className={`season-shift-indicator ${shift.change > 0 ? 'positive' : 'negative'}`}>
                          {shift.change > 0 ? '↑' : '↓'}{Math.abs(shift.change)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Full Narrative */}
            <div className="season-section">
              <h4>Season Story</h4>
              <div className="season-full-narrative">
                <p>{report.fullNarrative}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const SeasonTimeline: React.FC<SeasonTimelineProps> = ({
  reports,
  onGenerateSeasonCard
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const handleToggle = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleGenerateCard = (report: SeasonReport) => {
    if (onGenerateSeasonCard) {
      onGenerateSeasonCard(report);
    }
  };

  if (reports.length === 0) {
    return (
      <div className="identity-seasons-empty">
        <div className="empty-state-icon">📅</div>
        <h3>No Season Reports Yet</h3>
        <p>Your monthly gaming identity seasons will appear here as you continue your journey.</p>
        <p>Keep creating snapshots to build your season history!</p>
      </div>
    );
  }

  return (
    <div className="identity-seasons">
      <div className="identity-seasons-header">
        <h2>Your Seasons</h2>
        <div className="identity-seasons-stats">
          <div className="season-stat">
            <div className="season-stat-number">{reports.length}</div>
            <div className="season-stat-label">Seasons</div>
          </div>
          <div className="season-stat">
            <div className="season-stat-number">
              {reports.reduce((sum, report) => sum + report.snapshotCount, 0)}
            </div>
            <div className="season-stat-label">Total Snapshots</div>
          </div>
          <div className="season-stat">
            <div className="season-stat-number">
              {reports.reduce((sum, report) => sum + report.newMilestones.length, 0)}
            </div>
            <div className="season-stat-label">Milestones</div>
          </div>
        </div>
      </div>

      <div className="timeline season-timeline">
        {reports.map((report, _index) => (
          <SeasonItem
            key={report.id}
            report={report}
            isExpanded={expandedItems.has(report.id)}
            onToggle={handleToggle}
            onGenerateCard={handleGenerateCard}
          />
        ))}
      </div>
    </div>
  );
};

// Add CSS styles
const style = document.createElement('style');
style.textContent = `
.identity-seasons {
  margin: 2rem 0;
}

.identity-seasons-header {
  text-align: center;
  margin-bottom: 2rem;
}

.identity-seasons-header h2 {
  font-size: 2rem;
  font-weight: bold;
  color: white;
  margin-bottom: 0.5rem;
}

.identity-seasons-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.season-stat {
  text-align: center;
}

.season-stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #8b5cf6;
}

.season-stat-label {
  font-size: 0.875rem;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.season-timeline {
  position: relative;
  padding-left: 2rem;
}

.season-timeline::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, #4b5563, #374151);
}

.season-item {
  position: relative;
  padding-bottom: 2rem;
}

.season-dot {
  position: absolute;
  left: -2rem;
  top: 0;
  width: 1rem;
  height: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.season-dot-inner {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background: #8b5cf6;
  border: 2px solid #1e293b;
  transition: all 0.2s ease;
}

.season-dot-inner.season-dot {
  background: #f59e0b;
}

.season-item:hover .season-dot-inner {
  transform: scale(1.2);
}

.season-content {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-left: 1rem;
  transition: all 0.3s ease;
}

.season-content.season-content {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.3);
}

.season-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.season-date {
  display: flex;
  flex-direction: column;
}

.season-date-text {
  font-size: 1.125rem;
  font-weight: 600;
  color: #e5e7eb;
}

.season-meta {
  font-size: 0.875rem;
  color: #9ca3af;
  margin-top: 0.25rem;
}

.season-actions {
  display: flex;
  gap: 0.5rem;
}

.timeline-expand-btn,
.season-generate-btn {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: #e5e7eb;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.timeline-expand-btn:hover,
.season-generate-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.season-compact {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.season-compact-overview {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.season-compact-moods {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.season-mood-tag {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: rgba(139, 92, 246, 0.2);
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: #a78bfa;
}

.season-compact-patterns {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.season-compact-pattern {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #9ca3af;
}

.season-compact-games {
  margin-top: 0.5rem;
}

.season-games-label {
  font-size: 0.75rem;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.season-games-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.season-compact-game {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #d1d5db;
}

.season-game-rank {
  font-weight: 600;
  color: #f59e0b;
  min-width: 1.5rem;
}

.season-game-title {
  flex: 1;
  font-weight: 500;
}

.season-game-score {
  color: #9ca3af;
}

.season-compact-narrative {
  font-size: 0.875rem;
  color: #d1d5db;
  line-height: 1.4;
  font-style: italic;
  margin: 0;
}

.season-compact-milestones {
  margin-top: 0.5rem;
}

.season-milestones-label {
  font-size: 0.75rem;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.season-milestones-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.season-compact-milestone {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #d1d5db;
}

.season-milestone-icon {
  font-size: 1rem;
}

.season-milestone-title {
  font-weight: 500;
}

.season-expanded {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.season-section {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1rem;
}

.season-section h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #e5e7eb;
  margin-bottom: 0.75rem;
}

.season-overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 1rem;
}

.season-overview-item {
  text-align: center;
  padding: 0.75rem;
  background: rgba(139, 92, 246, 0.1);
  border-radius: 0.5rem;
}

.season-overview-label {
  font-size: 0.75rem;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.season-overview-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: #e5e7eb;
}

.season-change {
  font-size: 0.75rem;
  margin-left: 0.25rem;
}

.season-change.positive {
  color: #10b981;
}

.season-change.negative {
  color: #ef4444;
}

.season-patterns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.season-pattern-item {
  background: rgba(34, 197, 94, 0.1);
  border-radius: 0.5rem;
  padding: 1rem;
}

.season-pattern-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #e5e7eb;
  margin-bottom: 0.75rem;
}

.season-pattern-icon {
  font-size: 1.25rem;
}

.season-pattern-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.season-pattern-mood {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #d1d5db;
}

.season-pattern-stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #d1d5db;
}

.season-games-expanded {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.season-game-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(55, 65, 81, 0.1);
  border-radius: 0.5rem;
}

.season-game-info {
  flex: 1;
}

.season-game-meta {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.25rem;
}

.season-milestones-expanded {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.season-milestone-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(245, 158, 11, 0.1);
  border-radius: 0.5rem;
}

.season-milestone-info {
  flex: 1;
}

.season-milestone-title {
  font-weight: 600;
  color: #e5e7eb;
  margin-bottom: 0.25rem;
}

.season-milestone-description {
  font-size: 0.875rem;
  color: #d1d5db;
  margin-bottom: 0.25rem;
}

.season-milestone-category {
  font-size: 0.75rem;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.season-shifts {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.season-shift-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: rgba(55, 65, 81, 0.1);
  border-radius: 0.5rem;
}

.season-shift-pattern {
  font-weight: 500;
  color: #e5e7eb;
}

.season-shift-change {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #d1d5db;
}

.season-shift-indicator {
  font-weight: 600;
}

.season-full-narrative {
  font-size: 0.875rem;
  color: #d1d5db;
  line-height: 1.5;
  font-style: italic;
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 0.5rem;
  margin: 0;
}

.identity-seasons-empty {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.empty-state-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.identity-seasons-empty h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #e5e7eb;
  margin-bottom: 0.5rem;
}

.identity-seasons-empty p {
  color: #9ca3af;
  line-height: 1.5;
  max-width: 400px;
  margin: 0 auto 0.5rem;
}
`;

document.head.appendChild(style);
