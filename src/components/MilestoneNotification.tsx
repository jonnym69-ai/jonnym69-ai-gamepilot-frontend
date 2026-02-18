import React, { useState, useEffect } from 'react';
import type { Milestone } from '../utils/identityMilestones';

interface MilestoneNotificationProps {
  milestones: Milestone[];
  onClose: () => void;
  isOpen: boolean;
}

export const MilestoneNotification: React.FC<MilestoneNotificationProps> = ({
  milestones,
  onClose,
  isOpen
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen && milestones.length > 0) {
      setIsAnimating(true);
      setCurrentIndex(0);
    }
  }, [isOpen, milestones]);

  // Cleanup style element on unmount
  useEffect(() => {
    return () => {
      const existingStyle = document.getElementById('milestone-notification-styles');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

  const handleNext = () => {
    if (currentIndex < milestones.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsAnimating(true);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsAnimating(true);
    }
  };

  const currentMilestone = milestones[currentIndex];

  if (!isOpen || !currentMilestone) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-2xl max-w-md w-full border border-purple-500/30 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">Milestone Unlocked!</h3>
              <p className="text-purple-300 text-sm">Your gaming identity evolves</p>
            </div>
            <button
              onClick={onClose}
              className="text-purple-400 hover:text-white transition-colors"
              aria-label="Close milestone notification"
              title="Close milestone notification"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className={`text-center transition-all duration-500 ${isAnimating ? 'scale-105' : 'scale-100'}`}>
            {/* Milestone Icon */}
            <div className="text-6xl mb-4 animate-bounce">
              {currentMilestone.icon}
            </div>

            {/* Milestone Title */}
            <h4 
              className="text-xl font-bold text-white mb-2"
              style={{ color: currentMilestone.color }}
            >
              {currentMilestone.title}
            </h4>

            {/* Milestone Description */}
            <p className="text-gray-300 text-sm mb-4">
              {currentMilestone.description}
            </p>

            {/* Category Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 mb-4">
              <span className="text-xs text-purple-300 uppercase tracking-wide">
                {currentMilestone.category}
              </span>
            </div>

            {/* Progress Indicator */}
            {milestones.length > 1 && (
              <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                <span>{currentIndex + 1}</span>
                <span>/</span>
                <span>{milestones.length}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-purple-500/20">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex gap-2">
              {milestones.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? currentMilestone.color : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all"
            >
              {currentIndex === milestones.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>

        {/* Confetti Effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          <div className="confetti-container">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                  backgroundColor: ['#f59e0b', '#8b5cf6', '#10b981', '#ef4444', '#ec4899'][Math.floor(Math.random() * 5)]
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Confetti Styles */}
      <style id="milestone-notification-styles">{`
        .confetti-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }

        .confetti {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          animation: confetti-fall linear infinite;
        }

        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Hook to show milestone notifications
 */
export const useMilestoneNotifications = () => {
  const [notifications, setNotifications] = useState<Milestone[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const showNotifications = (newMilestones: Milestone[]) => {
    if (newMilestones.length > 0) {
      setNotifications(newMilestones);
      setIsNotificationOpen(true);
    }
  };

  const closeNotifications = () => {
    setIsNotificationOpen(false);
    setTimeout(() => setNotifications([]), 300);
  };

  return {
    notifications,
    isNotificationOpen,
    showNotifications,
    closeNotifications
  };
};
