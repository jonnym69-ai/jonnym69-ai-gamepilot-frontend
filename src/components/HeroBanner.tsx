import React from 'react'
import { AccentGlow } from './AccentGlow'

interface HeroBannerProps {
  title: string
  subtitle: string
  backgroundImage?: string
  overlay?: boolean
  height?: string
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ 
  title, 
  subtitle, 
  backgroundImage = 'https://via.placeholder.com/1920x400/1e3a8a/ffffff?text=Hero+Background'
}) => {
  return (
    <div className="relative h-96 overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.3)), url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-transparent to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center px-8">
        <div className="text-center max-w-4xl animate-fade-in">
          <h1 className="text-6xl font-bold text-white mb-4 animate-fade-in animate-delay-200">
            {title}
          </h1>
          <p className="text-xl text-white/90 mb-8 animate-fade-in animate-delay-300">
            {subtitle}
          </p>
        </div>
      </div>
      
      {/* Cinematic Glow Effect */}
      <AccentGlow color="accent-light" size="lg" intensity="medium">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 w-full h-full animate-glow-pulse" />
        </div>
      </AccentGlow>
    </div>
  )
}
