import { useState, useRef, useEffect } from 'react'

interface HighResImageProps {
  src: string
  alt: string
  className?: string
  onLoad?: () => void
  onError?: () => void
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
}

export function HighResImage({ 
  src, 
  alt, 
  className = '',
  onLoad,
  onError,
  objectFit = 'cover'
}: HighResImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {/* Loading placeholder */}
      <div 
        className={`
          absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black 
          flex items-center justify-center transition-all duration-500
          ${isLoaded ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
        `}
      >
        <div className="relative">
          <span className="text-4xl text-gray-600">🎮</span>
          <div className="absolute inset-0 blur-lg bg-gaming-primary/10 scale-150" />
        </div>
      </div>

      {/* High-resolution image */}
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          className={`
            absolute inset-0 w-full h-full transition-opacity duration-500
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
          `}
          style={{ 
            objectFit,
            imageRendering: '-webkit-optimize-contrast',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)',
            willChange: 'opacity',
            // Prevent blur on high-DPI displays
            maxWidth: '100%',
            maxHeight: '100%'
          }}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          decoding="async"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      )}

      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 via-red-800/20 to-red-900/30 flex flex-col items-center justify-center">
          <div className="relative">
            <span className="text-3xl text-red-500">🚫</span>
            <div className="absolute inset-0 blur-lg bg-red-500/10 scale-150" />
          </div>
          <span className="text-xs text-red-400 mt-2 font-medium">Failed to load</span>
        </div>
      )}

      {/* Hover overlay */}
      {isLoaded && !hasError && (
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent" />
        </div>
      )}
    </div>
  )
}
