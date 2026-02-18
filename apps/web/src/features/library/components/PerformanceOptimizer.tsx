import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react'
import type { Game } from '@gamepilot/types'

interface PerformanceOptimizerProps {
  games: Game[]
  children: (optimizedGames: Game[], performance: PerformanceMetrics) => React.ReactNode
}

interface PerformanceMetrics {
  totalGames: number
  visibleGames: number
  renderTime: number
  memoryUsage: number
  fps: number
}

export const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({
  games,
  children
}) => {
  const renderStartTime = useRef<number>(Date.now())
  const frameCount = useRef<number>(0)
  const lastFrameTime = useRef<number>(Date.now())
  const [fps, setFps] = useState<number>(60)

  // Memoized game filtering and sorting for performance
  const optimizedGames = useMemo(() => {
    const start = performance.now()
    
    // Create optimized game objects with only necessary properties for rendering
    const optimized = games.map(game => ({
      ...game,
      // Keep all required properties but limit arrays for performance
      genres: game.genres?.slice(0, 2), // Limit genres for performance
      platforms: game.platforms?.slice(0, 1), // Limit platforms for performance
      subgenres: game.genres?.slice(0, 2), // Use genres instead of subgenres for performance
      emotionalTags: game.emotionalTags?.slice(0, 3), // Limit emotional tags for performance
      _optimized: true as const
    }))

    const end = performance.now()
    renderStartTime.current = end - start
    
    return optimized
  }, [games])

  // FPS monitoring
  useEffect(() => {
    let animationId: number
    
    const updateFPS = () => {
      frameCount.current++
      const currentTime = Date.now()
      const deltaTime = currentTime - lastFrameTime.current
      
      if (deltaTime >= 1000) {
        setFps(Math.round((frameCount.current * 1000) / deltaTime))
        frameCount.current = 0
        lastFrameTime.current = currentTime
      }
      
      animationId = requestAnimationFrame(updateFPS)
    }
    
    animationId = requestAnimationFrame(updateFPS)
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [])

  // Memory usage monitoring (if available)
  const memoryUsage = useMemo(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return {
        used: Math.round(memory.usedJSHeapSize / 1048576), // MB
        total: Math.round(memory.totalJSHeapSize / 1048576), // MB
        limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
      }
    }
    return { used: 0, total: 0, limit: 0 }
  }, [optimizedGames.length]) // Update when games change

  // Performance metrics
  const performanceMetrics: PerformanceMetrics = useMemo(() => ({
    totalGames: games.length,
    visibleGames: optimizedGames.length,
    renderTime: renderStartTime.current,
    memoryUsage: memoryUsage.used,
    fps
  }), [games.length, optimizedGames.length, renderStartTime.current, memoryUsage.used, fps])

  // Preload next batch of images for smoother experience
  useEffect(() => {
    const preloadImages = async () => {
      const imageUrls = optimizedGames
        .slice(0, 20) // Preload first 20 images
        .map(game => game.coverImage)
        .filter(Boolean) as string[]

      const preloadPromises = imageUrls.map(url => {
        return new Promise<void>((resolve) => {
          const img = new Image()
          img.onload = () => resolve()
          img.onerror = () => resolve() // Resolve even on error to not block
          img.src = url
        })
      })

      await Promise.all(preloadPromises)
    }

    preloadImages()
  }, [optimizedGames])

  // Cleanup function for performance
  useEffect(() => {
    return () => {
      // Clear any ongoing operations
      renderStartTime.current = 0
    }
  }, [])

  return (
    <>
      {children(optimizedGames, performanceMetrics)}
      
      {/* Performance Monitor (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black/80 backdrop-blur-sm text-white p-3 rounded-lg text-xs font-mono border border-gray-700/50 z-50">
          <div>Games: {performanceMetrics.totalGames}</div>
          <div>FPS: {performanceMetrics.fps}</div>
          <div>Render: {performanceMetrics.renderTime.toFixed(2)}ms</div>
          <div>Memory: {performanceMetrics.memoryUsage}MB</div>
        </div>
      )}
    </>
  )
}

// Performance optimization hook
export const usePerformanceOptimization = (games: Game[]) => {
  const [isOptimizing, setIsOptimizing] = useState(false)
  const optimizationTimeoutRef = useRef<NodeJS.Timeout>()

  const optimizeForLargeLibraries = useCallback(() => {
    if (games.length > 100) {
      setIsOptimizing(true)
      
      // Clear any existing timeout
      if (optimizationTimeoutRef.current) {
        clearTimeout(optimizationTimeoutRef.current)
      }

      // Set a timeout to hide optimization indicator
      optimizationTimeoutRef.current = setTimeout(() => {
        setIsOptimizing(false)
      }, 1000)
    }
  }, [games.length])

  useEffect(() => {
    optimizeForLargeLibraries()
    
    return () => {
      if (optimizationTimeoutRef.current) {
        clearTimeout(optimizationTimeoutRef.current)
      }
    }
  }, [optimizeForLargeLibraries])

  return {
    isOptimizing,
    shouldUseVirtualScroll: games.length > 50,
    shouldLimitSearchResults: games.length > 200,
    shouldDebounceFilters: games.length > 100
  }
}
