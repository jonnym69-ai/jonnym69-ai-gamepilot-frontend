import React, { useState, useEffect } from 'react';
import { useLibraryStore } from '../stores/useLibraryStore';
import { generatePersonaContext } from '../utils/contextualEngine';
import { getPersonaContextualMatches } from '../utils/contextualEngine';
import { detectTimeOfDay } from '../utils/contextualEngine';
import { trackEvent } from '../utils/analytics';
import { useToast } from './ui/ToastProvider';
import { launchGame } from '../utils/launchGame';
import { TimeSelector } from './ui/TimeSelector';
import type { SessionLength } from '../utils/contextualEngine';

interface WhatToPlayNowProps {
  onClose?: () => void;
  className?: string;
}

interface GameRecommendation {
  game: any;
  score: number;
  reasons: string[];
}

export const WhatToPlayNow: React.FC<WhatToPlayNowProps> = ({
  onClose,
  className = ''
}) => {
  const { games } = useLibraryStore();
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const [recommendations, setRecommendations] = useState<GameRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rerollCount, setRerollCount] = useState(0);
  const [suggestedGameIds, setSuggestedGameIds] = useState<Set<string>>(new Set());
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinningGames, setSpinningGames] = useState<any[]>([]);
  const [finalGame, setFinalGame] = useState<GameRecommendation | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<SessionLength | null>(null);

  // Generate recommendations
  const generateRecommendations = async (excludeIds: Set<string> = new Set(), durationOverride?: SessionLength) => {
    setIsLoading(true);

    // Filter out invalid games
    const validGames = games?.filter((g: any) => g && g.id) || [];

    try {
      // Safety check for games array
      if (!games || !Array.isArray(games) || games.length === 0) {
        showInfo('No games available for recommendations');
        setRecommendations([]);
        return;
      }

      if (validGames.length === 0) {
        showWarning('No valid games found in your library');
        setRecommendations([]);
        return;
      }

      const activeDuration = durationOverride || selectedDuration || 'medium';

      // Track analytics
      trackEvent("what_to_play_opened", {
        timeOfDay: detectTimeOfDay(),
        selectedSessionLength: activeDuration,
        selectedMoods: 'auto'
      });

      // Build contextual filters from current context
      const contextualFilters = {
        selectedMoods: [], // Will be derived from persona
        selectedSessionLength: activeDuration,
        timeOfDay: detectTimeOfDay(),
        excludeIds: Array.from(excludeIds)
      };

      // Generate persona context
      const personaContext = generatePersonaContext(validGames);

      // Get ranked matches
      const matches = getPersonaContextualMatches(
        validGames,
        personaContext,
        contextualFilters,
        { personaWeight: 0.8 } // High persona weight for confident recommendations
      );

      // Take top recommendations
      const validMatches = (matches || []).filter(match => match && match.game && match.game.id);
      const topMatches = validMatches.slice(0, 3);

      if (topMatches.length === 0) {
        console.warn('No valid matches found, using fallback recommendations');
        showInfo('Using fallback recommendations');
        // Don't return early - let the fallback logic handle this
      }

      // Generate reasons for each recommendation only if we have matches
      let enrichedRecommendations: GameRecommendation[] = [];
      if (topMatches.length > 0) {
        enrichedRecommendations = topMatches.map(match => {
        const reasons: string[] = [];

        // Similar games reason
        if (personaContext?.dominantMoods && personaContext.dominantMoods.length > 0) {
          const similarReason = `Matches your dominant moods: ${personaContext.dominantMoods.slice(0, 2).join(', ')}`;
          reasons.push(similarReason);
        }

        // Session length reason
        if (personaContext?.preferredSessionLength) {
          const sessionReason = `Fits your usual session length: ${personaContext.preferredSessionLength}`;
          reasons.push(sessionReason);
        }

        // Time of day reason
        const timeReason = `Perfect for ${detectTimeOfDay()} gaming`;
        reasons.push(timeReason);

        // Similar games reason (fallback to library games if no persona data)
        if (games && games.length > 0) {
          const topGames = games.slice(0, 2).map(g => g.title || 'Unknown Game');
          const similarReason = `Similar to games in your library: ${topGames.join(', ')}`;
          reasons.push(similarReason);
        }

        // Completion rate reason
        if (personaContext?.completionRate && personaContext.completionRate > 0.7) {
          const completionReason = `Matches your ${Math.round(personaContext.completionRate * 100)}% completion rate`;
          reasons.push(completionReason);
        }

        return {
          game: match.game,
          score: match.score,
          reasons: reasons.slice(0, 4) // Limit to 4 reasons
        };
      });
      }

      // Use enriched recommendations if available, otherwise use fallback
      if (enrichedRecommendations.length > 0) {
        setRecommendations(enrichedRecommendations);
        showSuccess('Recommendations generated successfully');
      } else {
        console.warn('No enriched recommendations, using fallback');
        showInfo('Using fallback recommendations');
        const fallbackRecommendations = validGames
          .filter((g: any) => !excludeIds.has(g.id))
          .slice(0, 3)
          .map((game: any) => ({
            game,
            score: 0.5,
            reasons: ['Available in your library']
          }));
        setRecommendations(fallbackRecommendations);
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      showError('Failed to generate recommendations');
      // Fallback: just show top games
      const fallbackRecommendations = validGames
        .filter((g: any) => !excludeIds.has(g.id))
        .slice(0, 3)
        .map((game: any) => ({
          game,
          score: 0.5,
          reasons: ['Available in your library']
        }));
      setRecommendations(fallbackRecommendations);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial recommendations
  useEffect(() => {
    if (games.length > 0) {
      generateRecommendations(suggestedGameIds);
    }
  }, [games]);

  // Handle animated slot machine reroll
  const handleReroll = async () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setFinalGame(null);
    
    // Get games that match current criteria for the slot machine animation
    const matchingGames = recommendations.map(r => r.game).filter(Boolean);
    const validGames = games?.filter((g: any) => g && g.id) || [];
    
    // Mix matching games with some random ones for visual variety, but keep matching games prominent
    const displayGames = [...matchingGames];
    while (displayGames.length < 10 && validGames.length > 0) {
      const randomGame = validGames[Math.floor(Math.random() * validGames.length)];
      if (!displayGames.find(g => g.id === randomGame.id)) {
        displayGames.push(randomGame);
      }
    }
    setSpinningGames(displayGames.sort(() => Math.random() - 0.5));

    // Generate new recommendations with proper state synchronization
    try {
      const newSuggestedIds = new Set(suggestedGameIds);
      recommendations.forEach(rec => {
        if (rec.game?.id) {
          newSuggestedIds.add(rec.game.id);
        }
      });
      
      // Update state synchronously before async operation
      setSuggestedGameIds(newSuggestedIds);
      setRerollCount(prev => prev + 1);
      
      // Simulate slot machine spinning
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate new recommendations with updated state
      await generateRecommendations(newSuggestedIds);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setIsSpinning(false);
      setSpinningGames([]);
    }

    trackEvent("what_to_play_reroll", { 
      count: rerollCount + 1,
      totalSuggested: suggestedGameIds.size
    });
  };

  // Handle game launch
  const handleLaunchGame = async (game: any, isPrimary: boolean) => {
    if (!game?.id || !game?.title) {
      console.warn('Invalid game data for launch:', game);
      showError('Invalid game data for launch');
      return;
    }

    trackEvent(isPrimary ? "what_to_play_launch" : "what_to_play_alt_launch", {
      gameId: game.id,
      gameTitle: game.title,
      score: recommendations.find(r => r.game?.id === game.id)?.score,
      isPrimary
    });

    try {
      showSuccess(`Launching ${game.title}...`);
      
      if (game.appId) {
        await launchGame(game.appId);
        showSuccess(`${game.title} launched successfully!`);
      } else {
        showError(`No launch ID available for ${game.title}`);
      }
    } catch (error) {
      showError(`Failed to launch ${game.title}`);
      console.error('Launch error:', error);
    }
  };

  const primary = recommendations[0];
  const alternates = recommendations.slice(1, 3);

  if (isLoading) {
    return (
      <div className={`what-to-play-now ${className}`}>
        <div className="what-to-play-loading">
          <div className="loading-spinner"></div>
          <h3>Finding Your Perfect Game...</h3>
          <p>Analyzing your gaming personality and preferences</p>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className={`what-to-play-now ${className}`}>
        <div className="what-to-play-empty">
          <div className="empty-icon">🎮</div>
          <h3>No Games Available</h3>
          <p>Add some games to your library to get personalized recommendations!</p>
          <button onClick={onClose} className="close-btn">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`what-to-play-now ${className}`}>
      {/* Header */}
      <div className="what-to-play-header">
        <div className="header-content">
          <h2 className="title">I'm Not Sure What To Play</h2>
          <p className="subtitle">
            Let GamePilot pick based on your mood, time, and play style
          </p>
        </div>
        <button onClick={onClose} className="close-btn" aria-label="Close">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Duration Selection */}
      <div className="px-8 pt-4 pb-2">
        <p className="text-gray-400 text-sm mb-3 font-semibold uppercase tracking-wider">How much time do you have?</p>
        <TimeSelector 
          value={selectedDuration} 
          onChange={(val) => {
            setSelectedDuration(val);
            generateRecommendations(new Set(), val);
          }} 
        />
      </div>

      {/* Primary Recommendation */}
      {primary && primary.game && (
        <div className="primary-recommendation">
          <div className="game-card primary">
            <div className="game-content">
              <div className="game-header">
                <div className="game-info">
                  <h3 className="game-title">{primary.game.title || 'Unknown Game'}</h3>
                  <div className="game-meta">
                    {primary.game?.genres?.slice(0, 2).map((genre: any) => (
                      <span key={typeof genre === 'string' ? genre : genre.name} className="genre-tag">
                        {typeof genre === 'string' ? genre : genre.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="game-art">
                  {primary.game?.coverImage ? (
                    <img 
                      src={primary.game.coverImage} 
                      alt={primary.game?.title || 'Game'}
                      className="game-cover"
                    />
                  ) : (
                    <div className="game-cover-placeholder">
                      <div className="placeholder-icon">🎮</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="game-description">
                <p>{primary.game.description || 'No description available'}</p>
              </div>

              <div className="game-reasons">
                <h4>Why this game?</h4>
                <ul className="reasons-list">
                  {(primary.reasons || []).map((reason, index) => (
                    <li key={index} className="reason-item">
                      <span className="reason-icon">✓</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="game-actions">
                <button 
                  onClick={() => primary.game && handleLaunchGame(primary.game, true)}
                  className="launch-btn primary"
                >
                  <span className="btn-icon">🚀</span>
                  Launch Now
                </button>
                <div className="confidence-score">
                  <span className="score-label">Match Score:</span>
                  <span className="score-value">{Math.round((primary.score || 0) * 100)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slot Machine Animation */}
      {isSpinning && (
        <div className="slot-machine-container">
          <div className="slot-machine-header">
            <h3>🎰 Finding Your Perfect Game...</h3>
            <div className="spinning-indicator">
              <div className="spinner"></div>
            </div>
          </div>
          <div className="slot-machine-track">
            <div className="slot-machine-games">
              {spinningGames.map((game, index) => (
                <div 
                  key={`${game.id}-${index}`} 
                  className="slot-game-card"
                  style={{
                    animation: `slideIn 0.5s ease-in-out ${index * 0.1}s both`
                  }}
                >
                  <div className="slot-game-content">
                    <div className="slot-game-image">
                      {game.coverImage ? (
                        <img src={game.coverImage} alt={game.title} />
                      ) : (
                        <div className="slot-game-placeholder">🎮</div>
                      )}
                    </div>
                    <div className="slot-game-title">{game.title || 'Unknown Game'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Final Game Reveal */}
      {!isSpinning && finalGame && (
        <div className="final-game-reveal">
          <div className="reveal-animation">
            <div className="reveal-content">
              <h3>🎯 Your Perfect Match!</h3>
              <div className="final-game-card">
                <div className="final-game-image">
                  {finalGame.game.coverImage ? (
                    <img src={finalGame.game.coverImage} alt={finalGame.game.title} />
                  ) : (
                    <div className="final-game-placeholder">🎮</div>
                  )}
                </div>
                <div className="final-game-info">
                  <h4>{finalGame.game.title || 'Unknown Game'}</h4>
                  <div className="final-game-score">
                    {Math.round((finalGame.score || 0) * 100)}% Match
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alternate Recommendations */}
      {alternates.length > 0 && (
        <div className="alternate-recommendations">
          <div className="alternates-header">
            <h3>Or Try These</h3>
            <button 
              onClick={handleReroll}
              className="reroll-btn"
              disabled={games.length <= 3 || isSpinning}
            >
              <span className="reroll-icon">{isSpinning ? '🎰' : '🎲'}</span>
              {isSpinning ? 'Spinning...' : 'Surprise Me!'}
              {rerollCount > 0 && <span className="reroll-count">({rerollCount})</span>}
            </button>
          </div>

          <div className="alternates-grid">
            {alternates.map((rec) => (
              <div key={rec.game?.id || Math.random()} className="game-card alternate">
                <div className="game-content">
                  <div className="game-header">
                    <div className="game-info">
                      <h4 className="game-title">{rec.game?.title || 'Unknown Game'}</h4>
                      <div className="game-meta">
                        {rec.game?.genres?.slice(0, 1).map((genre: any) => (
                          <span key={typeof genre === 'string' ? genre : genre.name} className="genre-tag small">
                            {typeof genre === 'string' ? genre : genre.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="game-art small">
                      {rec.game?.coverImage ? (
                        <img 
                          src={rec.game.coverImage} 
                          alt={rec.game?.title || 'Game'}
                          className="game-cover small"
                        />
                      ) : (
                        <div className="game-cover-placeholder small">
                          <div className="placeholder-icon small">🎮</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="game-reasons small">
                    <div className="reasons-list">
                      {(rec.reasons || []).slice(0, 2).map((reason, reasonIndex) => (
                        <div key={reasonIndex} className="reason-item small">
                          <span className="reason-icon small">✓</span>
                          {reason}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="game-actions">
                    <button 
                      onClick={() => rec.game && handleLaunchGame(rec.game, false)}
                      className="launch-btn small"
                    >
                      Play Now
                    </button>
                    <div className="confidence-score small">
                      {Math.round((rec.score || 0) * 100)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="what-to-play-footer space-y-4">
        <button 
          onClick={onClose}
          className="px-8 py-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl transition-all border border-white/10 font-medium"
        >
          Maybe Later
        </button>
        <p className="footer-text">
          Recommendations based on your gaming personality and {games.length} games in your library
        </p>
      </div>
    </div>
  );
};

// Add CSS styles
const style = document.createElement('style');
style.textContent = `
.what-to-play-now {
  background: linear-gradient(135deg, #1e293b 0%, #111827 100%);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  max-width: 900px;
  margin: 0 auto;
  overflow: hidden;
}

.what-to-play-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid rgba(139, 92, 246, 0.2);
  border-top: 3px solid #8b5cf6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.what-to-play-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.what-to-play-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
  flex: 1;
}

.title {
  font-size: 2rem;
  font-weight: bold;
  color: white;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #9ca3af;
  font-size: 1rem;
  margin: 0;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  padding: 0.5rem;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.primary-recommendation {
  padding: 2rem;
}

.game-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.game-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.game-card.primary {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
  border-color: rgba(139, 92, 246, 0.3);
}

.game-content {
  padding: 1.5rem;
}

.game-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.game-info {
  flex: 1;
}

.game-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  margin-bottom: 0.5rem;
}

.game-meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.genre-tag {
  background: rgba(139, 92, 246, 0.2);
  color: #a78bfa;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

.genre-tag.small {
  background: rgba(139, 92, 246, 0.15);
  font-size: 0.625rem;
}

.game-art {
  width: 120px;
  height: 160px;
  border-radius: 0.5rem;
  overflow: hidden;
  flex-shrink: 0;
}

.game-art.small {
  width: 80px;
  height: 100px;
}

.game-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.game-cover-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  font-size: 2rem;
  opacity: 0.5;
}

.placeholder-icon.small {
  font-size: 1.5rem;
}

.game-description {
  margin-bottom: 1rem;
}

.game-description p {
  color: #d1d5db;
  line-height: 1.5;
  margin: 0;
}

.game-reasons {
  margin-bottom: 1.5rem;
}

.game-reasons h4 {
  color: white;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.reasons-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.reason-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  color: #d1d5db;
  font-size: 0.875rem;
  line-height: 1.4;
}

.reason-item.small {
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
}

.reason-icon {
  color: #10b981;
  font-weight: bold;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.reason-icon.small {
  font-size: 0.75rem;
}

.game-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.launch-btn {
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.launch-btn:hover {
  background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
  transform: translateY(-1px);
}

.launch-btn.small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.launch-btn.primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.launch-btn.primary:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

.btn-icon {
  font-size: 1rem;
}

.confidence-score {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
}

.confidence-score.small {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}

.score-label {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-bottom: 0.25rem;
}

.score-value {
  font-size: 1.125rem;
  font-weight: bold;
  color: #10b981;
}

.alternate-recommendations {
  padding: 0 2rem 2rem;
}

.alternates-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.alternates-header h3 {
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.reroll-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  color: white;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.reroll-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.reroll-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reroll-icon {
  font-size: 1rem;
}

.reroll-count {
  font-size: 0.75rem;
  opacity: 0.8;
}

/* Slot Machine Animations */
.slot-machine-container {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  margin: 1rem 0;
  overflow: hidden;
}

.slot-machine-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.slot-machine-header h3 {
  color: white;
  margin: 0;
  font-size: 1.2rem;
}

.spinning-indicator {
  display: flex;
  align-items: center;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.slot-machine-track {
  position: relative;
  height: 120px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.slot-machine-games {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  height: 100%;
  animation: slideAcross 3s ease-in-out;
}

@keyframes slideAcross {
  0% {
    transform: translateX(100%);
  }
  50% {
    transform: translateX(-50%);
  }
  100% {
    transform: translateX(0%);
  }
}

@keyframes slideIn {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.slot-game-card {
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  padding: 0.75rem;
  min-width: 150px;
  transition: all 0.3s ease;
}

.slot-game-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.slot-game-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.slot-game-image {
  width: 60px;
  height: 60px;
  border-radius: 0.25rem;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
}

.slot-game-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.slot-game-placeholder {
  font-size: 1.5rem;
}

.slot-game-title {
  color: white;
  font-size: 0.75rem;
  text-align: center;
  font-weight: 500;
  line-height: 1.2;
}

/* Final Game Reveal */
.final-game-reveal {
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(236, 72, 153, 0.1));
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  padding: 1.5rem;
  margin: 1rem 0;
  animation: fadeInScale 0.5s ease-out;
}

@keyframes fadeInScale {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.reveal-content h3 {
  color: white;
  text-align: center;
  margin: 0 0 1rem 0;
  font-size: 1.3rem;
}

.final-game-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.final-game-image {
  width: 80px;
  height: 80px;
  border-radius: 0.5rem;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
}

.final-game-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.final-game-placeholder {
  font-size: 2rem;
}

.final-game-info {
  flex: 1;
}

.final-game-info h4 {
  color: white;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.final-game-score {
  color: #10b981;
  font-weight: bold;
  font-size: 0.9rem;
}

.alternates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.game-card.alternate {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.05);
}

.game-card.alternate:hover {
  background: rgba(255, 255, 255, 0.08);
}

.game-reasons.small {
  margin-bottom: 1rem;
}

.what-to-play-footer {
  padding: 1rem 2rem 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.footer-text {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

@media (max-width: 768px) {
  .what-to-play-now {
    margin: 1rem;
    border-radius: 0.75rem;
  }

  .what-to-play-header {
    padding: 1.5rem 1.5rem 1rem;
  }

  .title {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: 0.875rem;
  }

  .game-header {
    flex-direction: column;
    gap: 0.75rem;
  }

  .game-art {
    width: 100%;
    height: 120px;
  }

  .alternates-grid {
    grid-template-columns: 1fr;
  }

  .game-actions {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .confidence-score {
    align-items: center;
    text-align: center;
  }

  .score-label {
    margin-bottom: 0;
  }
}
`;

document.head.appendChild(style);
