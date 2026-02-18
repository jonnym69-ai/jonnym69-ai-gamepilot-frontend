import { useState, useRef, useEffect } from 'react'
import { useIntersectionObserver, preloadImage } from '../hooks/useMemoryOptimization'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  placeholder?: string
  onLoad?: () => void
  onError?: () => void
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
}

export function LazyImage({ 
  src, 
  alt, 
  className = '',
  onLoad,
  onError
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [hasError, setHasError] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Use memory-optimized intersection observer
  const { observe, unobserve } = useIntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsInView(true)
          if (containerRef.current) {
            unobserve(containerRef.current)
          }
        }
      })
    },
    { threshold: 0.1, rootMargin: '50px' }
  )

  useEffect(() => {
    if (containerRef.current) {
      observe(containerRef.current)
    }

    return () => {
      if (containerRef.current) {
        unobserve(containerRef.current)
      }
    }
  }, [observe, unobserve])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  // Preload image when in view using memory-optimized caching
  useEffect(() => {
    if (isInView && !hasError) {
      preloadImage(src)
        .then(handleLoad)
        .catch(handleError)
    }
  }, [isInView, src, hasError])

  return (
    <div ref={containerRef} className={`relative aspect-square overflow-hidden ${className}`}>
      {/* Static Placeholder */}
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
        {/* Static loading indicator */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center">
          <div className="w-8 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full w-3/5 bg-gradient-to-r from-gaming-primary to-gaming-secondary rounded-full" />
          </div>
        </div>
      </div>

      {/* Enhanced actual image - respects object-fit from className */}
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          className={`
            absolute inset-0 w-full h-full object-center transition-opacity duration-500
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
          `}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          loading="lazy"
          decoding="async"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ 
            imageRendering: 'auto',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)',
            willChange: 'opacity'
          }}
        />
      )}

      {/* Enhanced error fallback */}
      {hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 via-red-800/20 to-red-900/30 flex flex-col items-center justify-center">
          <div className="relative">
            <span className="text-3xl text-red-500">🚫</span>
            <div className="absolute inset-0 blur-lg bg-red-500/10 scale-150" />
          </div>
          <span className="text-xs text-red-400 mt-2 font-medium">Failed to load</span>
        </div>
      )}

      {/* Hover overlay for loaded images */}
      {isLoaded && !hasError && (
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent" />
        </div>
      )}
    </div>
  )
}
