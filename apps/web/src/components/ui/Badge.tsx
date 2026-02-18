import React from 'react';
import clsx from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'secondary';
}

export const Badge: React.FC<BadgeProps> = ({ children, className, variant = 'default' }) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
        {
          'bg-blue-500/20 text-blue-300 border border-blue-500/30': variant === 'default',
          'bg-green-500/20 text-green-300 border border-green-500/30': variant === 'success',
          'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30': variant === 'warning',
          'bg-red-500/20 text-red-300 border border-red-500/30': variant === 'error',
          'bg-gray-500/20 text-gray-300 border border-gray-500/30': variant === 'secondary',
        },
        className
      )}
    >
      {children}
    </span>
  );
};
