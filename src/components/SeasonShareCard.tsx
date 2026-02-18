import React, { useRef } from 'react';
import type { SeasonReport } from '../utils/identitySeason';

interface SeasonShareCardProps {
  report: SeasonReport;
  className?: string;
}

export const SeasonShareCard: React.FC<SeasonShareCardProps> = ({
  report,
  className = ''
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

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
    .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'medium';

  // Get dominant time of day
  const dominantTime = Object.entries(report.timeOfDayPatterns)
    .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'evening';

  return (
    <div 
      ref={cardRef}
      className={`season-share-card ${className}`}
      style={{
        width: '450px',
        height: '650px',
        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        borderRadius: '20px',
        padding: '32px',
        color: 'white',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
      }}
    >
      {/* Background pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)',
        pointerEvents: 'none'
      }} />

      {/* Header */}
      <div style={{ position: 'relative', textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          margin: 0,
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          {report.monthName} {report.year}
        </h1>
        <div style={{ 
          fontSize: '14px', 
          opacity: 0.9,
          marginTop: '8px'
        }}>
          Your Gaming Season
        </div>
        <div style={{ 
          fontSize: '12px', 
          opacity: 0.8,
          marginTop: '4px'
        }}>
          {report.snapshotCount} Snapshots • {report.newMilestones.length} Milestones
        </div>
      </div>

      {/* Season Overview */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          marginBottom: '12px',
          opacity: 0.95
        }}>
          Season Overview
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          <div style={{ textAlign: 'center', padding: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>📅</div>
            <div style={{ fontSize: '12px', opacity: '0.8' }}>Snapshots</div>
            <div style={{ fontSize: '16px', fontWeight: '600' }}>{report.snapshotCount}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>🏆</div>
            <div style={{ fontSize: '12px', opacity: '0.8' }}>Milestones</div>
            <div style={{ fontSize: '16px', fontWeight: '600' }}>{report.newMilestones.length}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>📈</div>
            <div style={{ fontSize: '12px', opacity: '0.8' }}>Completion</div>
            <div style={{ fontSize: '16px', fontWeight: '600' }}>
              {Math.round(report.completionRateChange.end * 100)}%
              {report.completionRateChange.change !== 0 && (
                <span style={{ 
                  fontSize: '12px', 
                  marginLeft: '4px',
                  color: report.completionRateChange.change > 0 ? '#10b981' : '#ef4444'
                }}>
                  {report.completionRateChange.change > 0 ? '↑' : '↓'}
                  {Math.abs(report.completionRateChange.change * 100).toFixed(0)}%
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Gaming Patterns */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          marginBottom: '12px',
          opacity: 0.95
        }}>
          Gaming Patterns
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '16px', marginBottom: '4px' }}>🎭</div>
            <div style={{ fontSize: '12px', opacity: '0.8' }}>Dominant Moods</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px' }}>
              {report.dominantMoods.slice(0, 3).map(mood => (
                <span key={mood} style={{
                  fontSize: '14px',
                  background: 'rgba(255,255,255,0.2)',
                  padding: '2px 6px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px'
                }}>
                  {moodIcons[mood.toLowerCase()] || '🎮'}
                  {mood}
                </span>
              ))}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '16px', marginBottom: '4px' }}>⏰</div>
            <div style={{ fontSize: '12px', opacity: '0.8' }}>Session Length</div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>
              {sessionIcons[dominantSession]} {dominantSession}
            </div>
            <div style={{ fontSize: '12px', opacity: '0.8', marginTop: '2px' }}>
              {Object.entries(report.sessionLengthTrends).map(([length, count]) => (
                <span key={length} style={{ marginRight: '8px' }}>
                  {length}: {count}
                </span>
              ))}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '16px', marginBottom: '4px' }}>🕐️</div>
            <div style={{ fontSize: '12px', opacity: '0.8' }}>Peak Time</div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>
              {timeIcons[dominantTime]} {dominantTime.replace('-', ' ')}
            </div>
            <div style={{ fontSize: '12px', opacity: '0.8', marginTop: '2px' }}>
              {Object.entries(report.timeOfDayPatterns).map(([time, count]) => (
                <span key={time} style={{ marginRight: '8px' }}>
                  {timeIcons[time]} {count}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Games */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          marginBottom: '12px',
          opacity: 0.95
        }}>
          Top Identity Games
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {report.topIdentityGames.slice(0, 5).map((game, index) => (
            <div key={game.id} style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{ 
                fontSize: '12px', 
                fontWeight: '600', 
                color: '#f59e0b',
                minWidth: '20px',
                textAlign: 'center'
              }}>
                #{index + 1}
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>{game.title}</div>
                <div style={{ fontSize: '12px', opacity: '0.8' }}>
                  Score: {game.score.toFixed(1)} • {game.appearances} appearances
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Milestones */}
      {report.newMilestones.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            marginBottom: '12px',
            opacity: 0.95
          }}>
            New Milestones
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {report.newMilestones.slice(0, 4).map(milestone => (
              <div key={milestone.id} style={{
                background: 'rgba(255,255,255,0.15)',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minWidth: '120px'
              }}>
                <span style={{ fontSize: '16px' }}>{milestone.icon}</span>
                <div style={{ fontSize: '12px', textAlign: 'center' }}>
                  <div style={{ fontWeight: '500' }}>{milestone.title}</div>
                  <div style={{ fontSize: '10px', opacity: '0.8' }}>{milestone.category}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Season Story */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          marginBottom: '12px',
          opacity: 0.95
        }}>
          Your Season Story
        </h3>
        <div style={{ 
          fontSize: '13px', 
          lineHeight: '1.4',
          opacity: 0.9,
          fontStyle: 'italic',
          background: 'rgba(255,255,255,0.1)',
          padding: '12px',
          borderRadius: '8px',
          maxHeight: '80px',
          overflow: 'hidden'
        }}>
          <p style={{ margin: 0 }}>{report.shortNarrative}</p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        position: 'absolute',
        bottom: '16px',
        right: '16px',
        fontSize: '10px',
        opacity: 0.7,
        textAlign: 'right'
      }}>
        <div>Generated on {new Date(report.generatedAt).toLocaleDateString()}</div>
        <div>gamepilot.app • Season Report</div>
      </div>
    </div>
  );
};
