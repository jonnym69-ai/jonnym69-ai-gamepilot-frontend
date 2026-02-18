import React from 'react'

interface AccentGlowProps {
  children: React.ReactNode
  color?: 'primary' | 'secondary' | 'accent' | 'accent-light'
  size?: 'sm' | 'md' | 'lg'
  intensity?: 'subtle' | 'medium' | 'strong'
}

export const AccentGlow: React.FC<AccentGlowProps> = ({ 
  children, 
  color = 'accent', 
  size = 'md', 
  intensity = 'medium' 
}) => {
  const glowClass = `${color}-${size}-${intensity}`
  
  return (
    <div className={`relative ${glowClass}`}>
      {/* Glow Effect */}
      <div className={`absolute inset-0 pointer-events-none ${glowClass}`} />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
