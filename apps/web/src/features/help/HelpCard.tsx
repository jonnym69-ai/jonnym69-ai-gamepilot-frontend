import React from 'react'

interface HelpCardProps {
  children: React.ReactNode
  className?: string
}

export const HelpCard: React.FC<HelpCardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 ${className}`}>
      {children}
    </div>
  )
}
