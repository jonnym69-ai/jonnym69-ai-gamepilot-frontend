import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'destructive' | 'secondary';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  className, 
  variant = 'default', 
  disabled = false,
  type = 'button',
  ...props 
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        {
          'bg-blue-500 hover:bg-blue-600 text-white': variant === 'default',
          'bg-red-500 hover:bg-red-600 text-white': variant === 'destructive',
          'bg-gray-600 hover:bg-gray-700 text-white': variant === 'secondary',
          'opacity-50 cursor-not-allowed': disabled,
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
