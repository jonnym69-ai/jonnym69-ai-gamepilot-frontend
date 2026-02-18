import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

interface EnhancedButtonProps {
  children: React.ReactNode
  to?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'accent'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  children,
  to,
  onClick,
  variant = 'primary',
  size = 'md',
  className = ''
}) => {
  const baseClasses = 'gaming-button hover-scale transition-all duration-300'
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  const buttonContent = (
    <motion.div
      className={`${baseClasses} ${sizeClasses[size]} ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.div>
  )

  if (to) {
    return <Link to={to}>{buttonContent}</Link>
  }

  return (
    <button onClick={onClick} className="inline-block">
      {buttonContent}
    </button>
  )
}
