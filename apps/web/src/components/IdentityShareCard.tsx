import React, { useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Game } from '@gamepilot/shared';

export interface PersonaContext {
  dominantMoods: string[];
  preferredSessionLength: 'short' | 'medium' | 'long';
  preferredTimesOfDay: string[];
  recentPlayPatterns: string[];
}

export interface ContextualMatch {
  game: Game;
  score: number;
}

interface IdentityShareCardProps {
  personaContext?: PersonaContext;
  identityNarrative?: string;
  identityDefiningGames?: ContextualMatch[];
  className?: string;
}

const moodIcons: Record<string, string> = {
  'chill': '😌', 'creative': '🎨', 'competitive': '⚔️', 'focused': '🎯',
  'intense': '🔥', 'cozy': '🏠', 'exploration': '🗺️', 'puzzle': '🧩',
  'social': '👥', 'immersive': '🌟', 'relaxed': '🧘', 'energetic': '⚡',
  'strategic': '♟️', 'adventurous': '🚀', 'mysterious': '🌙', 'playful': '🎮'
};

const sessionIcons: Record<string, string> = { 'short': '⏱️', 'medium': '⏰', 'long': '⏳' };
const timeIcons: Record<string, string> = { 'morning': '🌅', 'afternoon': '☀️', 'evening': '🌆', 'late-night': '🌙' };

export const IdentityShareCard: React.FC<IdentityShareCardProps> = ({
  personaContext,
  identityNarrative,
  identityDefiningGames,
  className = ''
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const dominantMoods = useMemo(() => personaContext?.dominantMoods?.slice(0, 4) || [], [personaContext]);
  const preferredSession = personaContext?.preferredSessionLength || 'medium';
  const preferredTimes = useMemo(() => personaContext?.preferredTimesOfDay?.slice(0, 2) || [], [personaContext]);
  const topGames = useMemo(() => identityDefiningGames?.slice(0, 4) || [], [identityDefiningGames]);

  const shortNarrative = useMemo(() => {
    if (!identityNarrative) return 'Your unique gaming identity awaits discovery.';
    return identityNarrative.split('.').filter(Boolean).slice(0, 2).join('. ') + '.';
  }, [identityNarrative]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`identity-share-card-container ${className}`}
      style={{
        width: '400px',
        minHeight: '600px',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        borderRadius: '24px',
        padding: '32px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <div ref={cardRef} className="identity-card-content relative z-10">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '0.05em', margin: 0, color: '#4cc9f0' }}>
            PLAYER IDENTITY
          </h2>
          <div style={{ fontSize: '10px', opacity: 0.5, textTransform: 'uppercase', marginTop: '4px' }}>
            GamePilot Neural Profile
          </div>
        </div>

        {/* Mood Section */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 600, color: '#4cc9f0', marginBottom: '12px', textTransform: 'uppercase' }}>
            Dominant Moods
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {dominantMoods.map(mood => (
              <div key={mood} style={{ background: 'rgba(76, 201, 240, 0.15)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', border: '1px solid rgba(76, 201, 240, 0.3)' }}>
                {moodIcons[mood.toLowerCase()] || '🎮'} {mood}
              </div>
            ))}
          </div>
        </div>

        {/* Narrative Section */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 600, color: '#4cc9f0', marginBottom: '12px', textTransform: 'uppercase' }}>
            Identity Narrative
          </h3>
          <p style={{ fontSize: '14px', lineHeight: '1.6', opacity: 0.9, fontStyle: 'italic', margin: 0, padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
            "{shortNarrative}"
          </p>
        </div>

        {/* Top Games Section */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 600, color: '#4cc9f0', marginBottom: '12px', textTransform: 'uppercase' }}>
            Defining Games
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topGames.map((match, i) => (
              <div key={match.game.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '13px' }}>
                <span style={{ fontWeight: 500 }}>{i + 1}. {match.game.title}</span>
                <span style={{ color: '#4cc9f0', fontWeight: 'bold' }}>{match.score.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', opacity: 0.4, fontSize: '11px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span>{sessionIcons[preferredSession]} {preferredSession}</span>
            <span>{preferredTimes.map(t => timeIcons[t.toLowerCase()] || '🌅').join('')}</span>
          </div>
          <span>gamepilot.ai</span>
        </div>
      </div>

      {/* Background Decor */}
      <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '60%', height: '40%', background: 'radial-gradient(circle, rgba(76, 201, 240, 0.1) 0%, transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
    </motion.div>
  );
};

export default IdentityShareCard;