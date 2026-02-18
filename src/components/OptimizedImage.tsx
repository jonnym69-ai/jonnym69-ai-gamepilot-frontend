import { useState, useRef, useEffect } from 'react'
import { useIntersectionObserver, preloadImage } from '../hooks/useMemoryOptimization'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  placeholder?: string
  onLoad?: () => void
  onError?: () => void
  sizes?: string
  webpSrc?: string
  avifSrc?: string
  priority?: boolean // For above-the-fold images
}

export function OptimizedImage({
  src,
  alt,
  className = '',
  onLoad,
  onError,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  webpSrc,
  avifSrc,
  priority = false
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(priority) // Load immediately if priority
  const [hasError, setHasError] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Check browser support for modern formats
  const supportsWebP = useWebPSupport()
  const supportsAVIF = useAVIFSupport()

  // Use memory-optimized intersection observer (skip for priority images)
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
    if (!priority && containerRef.current) {
      observe(containerRef.current)
    }

    return () => {
      if (!priority && containerRef.current) {
        unobserve(containerRef.current)
      }
    }
  }, [observe, unobserve, priority])

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
      const imageToPreload = avifSrc && supportsAVIF ? avifSrc :
                            webpSrc && supportsWebP ? webpSrc : src
      preloadImage(imageToPreload)
        .then(handleLoad)
        .catch(handleError)
    }
  }, [isInView, src, webpSrc, avifSrc, supportsWebP, supportsAVIF, hasError])

  // Generate srcset for responsive images
  const generateSrcSet = (baseSrc: string) => {
    if (!baseSrc.includes('cdn') && !baseSrc.includes('steam')) return baseSrc

    // For Steam images, generate multiple sizes
    const sizes = [256, 512, 1024]
    return sizes.map(size => `${baseSrc}?w=${size} ${size}w`).join(', ')
  }

  return (
    <div ref={containerRef} className={`relative aspect-square overflow-hidden ${className}`}>
      {/* Enhanced Loading Placeholder */}
      <div
        className={`
          absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black
          flex items-center justify-center transition-all duration-500
          ${isLoaded ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
        `}
      >
        <div className="relative">
          <span className="text-4xl text-gray-600 animate-pulse">🎮</span>
          <div className="absolute inset-0 blur-lg bg-gaming-primary/10 scale-150" />
        </div>
        {/* Animated loading bar */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center">
          <div className="w-8 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-gaming-primary to-gaming-secondary rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Optimized Image with Modern Format Support */}
      {isInView && !hasError && (
        <picture className="absolute inset-0 w-full h-full">
          {/* AVIF format - best compression */}
          {avifSrc && supportsAVIF && (
            <source
              srcSet={generateSrcSet(avifSrc)}
              sizes={sizes}
              type="image/avif"
            />
          )}

          {/* WebP format - good compression */}
          {webpSrc && supportsWebP && (
            <source
              srcSet={generateSrcSet(webpSrc)}
              sizes={sizes}
              type="image/webp"
            />
          )}

          {/* Fallback to original format */}
          <img
            src={src}
            srcSet={generateSrcSet(src)}
            sizes={sizes}
            alt={alt}
            className={`
              absolute inset-0 w-full h-full object-center transition-opacity duration-500 optimized-image
              ${isLoaded ? 'opacity-100' : 'opacity-0'}
            `}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
          />
        </picture>
      )}

      {/* Enhanced Error Fallback */}
      {hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 via-red-800/20 to-red-900/30 flex flex-col items-center justify-center">
          <div className="relative">
            <span className="text-3xl text-red-500">🚫</span>
            <div className="absolute inset-0 blur-lg bg-red-500/10 scale-150" />
          </div>
          <span className="text-xs text-red-400 mt-2 font-medium">Failed to load</span>
        </div>
      )}

      {/* Subtle hover overlay for loaded images */}
      {isLoaded && !hasError && (
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        </div>
      )}
    </div>
  )
}

// Browser support detection hooks
function useWebPSupport(): boolean {
  const [supportsWebP, setSupportsWebP] = useState(false)

  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(0, 0, 1, 1)
      canvas.toBlob((blob) => {
        setSupportsWebP(blob?.type === 'image/webp')
      }, 'image/webp')
    }
  }, [])

  return supportsWebP
}

function useAVIFSupport(): boolean {
  const [supportsAVIF, setSupportsAVIF] = useState(false)

  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(0, 0, 1, 1)
      canvas.toBlob((blob) => {
        setSupportsAVIF(blob?.type === 'image/avif')
      }, 'image/avif')
    }
  }, [])

  return supportsAVIF
}
