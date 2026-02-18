import React, { useState } from 'react'
import type { IdentitySnapshot } from '../utils/identityHistory'

interface TimelineProps {
  snapshots: IdentitySnapshot[]
  onRegenerateCard: (snapshot: IdentitySnapshot) => void
  onDelete: (id: string) => void
}

export const IdentityTimeline: React.FC<TimelineProps> = ({
  snapshots,
  onRegenerateCard,
  onDelete
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString()
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  if (!snapshots || snapshots.length === 0) {
    return (
      <div className="identity-history-empty">
        <div className="empty-state-icon">📊</div>
        <h3>No Identity History Yet</h3>
        <p>Your gaming identity will evolve as you play. Start tracking your gaming sessions to see your identity timeline here.</p>
      </div>
    )
  }

  return (
    <div className="identity-timeline">
      <div className="timeline-header">
        <h2>Your Identity Timeline</h2>
        <div className="timeline-stats">
          <div className="timeline-stat">
            <div className="timeline-stat-number">{snapshots.length}</div>
            <div className="timeline-stat-label">Snapshots</div>
          </div>
          {snapshots.length > 1 && (
            <div className="timeline-stat">
              <div className="timeline-stat-number">
                {snapshots.length > 1 ? 
                  Math.round((snapshots[0].timestamp ? 
                    (new Date().getTime() - new Date(snapshots[0].timestamp).getTime()) / 
                    (1000 * 60 * 60 * 24) 
                  : 0)) : 0
                }
              </div>
              <div className="timeline-stat-label">Days Ago</div>
            </div>
          )}
        </div>
      </div>

      <div className="timeline">
        {snapshots.map((snapshot, _index) => (
          <div key={snapshot.id} className="timeline-item">
            <div className="timeline-dot">
              <div className="timeline-dot-inner" />
            </div>

            <div className="timeline-content">
              <div className="timeline-header">
                <div className="timeline-date">
                  <div className="timeline-date-text">{formatDate(snapshot.timestamp)}</div>
                  <div className="timeline-time-text">{formatTime(snapshot.timestamp)}</div>
                </div>
                <div className="timeline-actions">
                  <button
                    onClick={() => toggleExpanded(snapshot.id)}
                    className="timeline-toggle-btn"
                  >
                    {expandedItems.has(snapshot.id) ? 'Collapse' : 'Expand'}
                  </button>
                  <button
                    onClick={() => onRegenerateCard(snapshot)}
                    className="timeline-regenerate-btn"
                  >
                    Regenerate Card
                  </button>
                  <button
                    onClick={() => onDelete(snapshot.id)}
                    className="timeline-delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="timeline-summary">
                <h3>{snapshot.shortNarrative}</h3>
                <div className="timeline-moods">
                  {snapshot.dominantMoods.slice(0, 3).map(mood => (
                    <span key={mood} className="timeline-mood-tag">
                      {mood}
                    </span>
                  ))}
                </div>
              </div>

              {expandedItems.has(snapshot.id) && (
                <div className="timeline-expanded">
                  <div className="timeline-expanded-details">
                    <div className="timeline-section">
                      <h4>Gaming Moods</h4>
                      <div className="timeline-moods-grid">
                        {snapshot.dominantMoods.map(mood => (
                          <div key={mood} className="timeline-mood-item">
                            <span>{mood}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="timeline-section">
                      <h4>Gaming Stats</h4>
                      <div className="timeline-stats-grid">
                        <div className="timeline-stat-item">
                          <div className="timeline-stat-label">Completion Rate</div>
                          <div className="timeline-stat-value">
                            {Math.round(snapshot.completionRate * 100)}%
                          </div>
                        </div>
                        <div className="timeline-stat-item">
                          <div className="timeline-stat-label">Social Gaming</div>
                          <div className="timeline-stat-value">
                            {Math.round(snapshot.multiplayerRatio * 100)}%
                          </div>
                        </div>
                        <div className="timeline-stat-item">
                          <div className="timeline-stat-label">Avg Session</div>
                          <div className="timeline-stat-value">
                            {Math.round(snapshot.averageSessionLengthMinutes)} min
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="timeline-section">
                      <h4>Top Games</h4>
                      <div className="timeline-games-list">
                        {snapshot.topIdentityGames.map((game, gameIndex) => (
                          <div key={game.id} className="timeline-game-item">
                            <div className="timeline-game-rank">#{gameIndex + 1}</div>
                            <div className="timeline-game-info">
                              <div className="timeline-game-title">{game.title}</div>
                              <div className="timeline-game-score">
                                Score: {game.score.toFixed(1)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {snapshot.fullNarrative && (
                      <div className="timeline-section">
                        <h4>Full Story</h4>
                        <div className="timeline-full-narrative">
                          <p>{snapshot.fullNarrative}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
