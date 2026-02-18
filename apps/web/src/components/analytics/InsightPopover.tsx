import React, { useState, useEffect } from 'react';

interface InsightPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  children?: React.ReactNode;
  position?: 'center' | 'bottom';
}

export const InsightPopover: React.FC<InsightPopoverProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  position = 'center'
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
        onClick={handleBackdropClick}
      />
      
      {/* Popover Content */}
      <div className={`fixed z-50 ${position === 'bottom' ? 'bottom-0 left-0 right-0' : 'inset-0 flex items-center justify-center'}`}>
        <div 
          className={`
            glass-morphism rounded-2xl border border-white/20 shadow-2xl
            ${position === 'bottom' ? 'mx-4 mb-4' : 'mx-4 max-w-lg w-full'}
            ${isAnimating ? 'animate-scale-in' : 'animate-scale-out'}
            transition-all duration-300
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 hover:text-white transition-colors duration-200"
            >
              <span className="text-lg">×</span>
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <p className="text-gray-300 mb-4">{description}</p>
            {children && (
              <div className="mt-4">
                {children}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
