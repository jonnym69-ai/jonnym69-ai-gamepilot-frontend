import React from 'react';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'solid';
}

export const Card: React.FC<CardProps> = ({ children, className, variant = 'default' }) => {
  return (
    <div
      className={clsx(
        'rounded-lg p-4',
        {
          'bg-white/10 backdrop-blur-md border border-white/20': variant === 'glass',
          'bg-gray-900': variant === 'solid',
          'bg-gray-800': variant === 'default',
        },
        className
      )}
    >
      {children}
    </div>
  );
};
