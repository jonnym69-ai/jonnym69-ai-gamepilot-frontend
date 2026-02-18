import { useEffect, useState, useRef } from 'react'

interface PerformanceMetrics {
  memoryUsage: number
  totalGames: number
  renderedGames: number
  scrollPosition: number
  fps: number
}

export function PerformanceMonitor({ 
  totalGames, 
  renderedGames 
}: { 
  totalGames: number
  renderedGames: number 
}) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memoryUsage: 0,
    totalGames,
    renderedGames,
    scrollPosition: 0,
    fps: 60
  })
  
  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(performance.now())
  const animationFrameRef = useRef<number>()

  // Monitor FPS
  useEffect(() => {
    const measureFPS = () => {
      frameCountRef.current++
      const currentTime = performance.now()
      
      if (currentTime >= lastTimeRef.current + 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / (currentTime - lastTimeRef.current))
        
        setMetrics(prev => ({
          ...prev,
          fps
        }))
        
        frameCountRef.current = 0
        lastTimeRef.current = currentTime
      }
      
      animationFrameRef.current = requestAnimationFrame(measureFPS)
    }
    
    animationFrameRef.current = requestAnimationFrame(measureFPS)
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  // Monitor memory usage
  useEffect(() => {
    const measureMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        const memoryUsage = Math.round(memory.usedJSHeapSize / 1048576) // Convert to MB
        
        setMetrics(prev => ({
          ...prev,
          memoryUsage
        }))
      }
    }

    const interval = setInterval(measureMemory, 2000)
    
    return () => clearInterval(interval)
  }, [])

  // Update game counts
  useEffect(() => {
    setMetrics(prev => ({
      ...prev,
      totalGames,
      renderedGames
    }))
  }, [totalGames, renderedGames])

  // Monitor scroll position
  useEffect(() => {
    const handleScroll = () => {
      setMetrics(prev => ({
        ...prev,
        scrollPosition: window.scrollY
      }))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Memory optimization warnings
  const getMemoryStatus = () => {
    if (metrics.memoryUsage > 150) return { status: 'critical', color: 'text-red-500' }
    if (metrics.memoryUsage > 100) return { status: 'warning', color: 'text-yellow-500' }
    return { status: 'good', color: 'text-green-500' }
  }

  const getFPSStatus = () => {
    if (metrics.fps < 30) return { status: 'poor', color: 'text-red-500' }
    if (metrics.fps < 45) return { status: 'fair', color: 'text-yellow-500' }
    return { status: 'good', color: 'text-green-500' }
  }

  const memoryStatus = getMemoryStatus()
  const fpsStatus = getFPSStatus()

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900/90 backdrop-blur-sm border border-gray-700/50 rounded-lg p-3 text-xs font-mono text-white z-50 min-w-[200px]">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-400">Memory:</span>
          <span className={memoryStatus.color}>{metrics.memoryUsage}MB</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">FPS:</span>
          <span className={fpsStatus.color}>{metrics.fps}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">Games:</span>
          <span>{metrics.renderedGames}/{metrics.totalGames}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">Scroll:</span>
          <span>{Math.round(metrics.scrollPosition)}px</span>
        </div>
        
        {/* Performance indicators */}
        <div className="pt-2 border-t border-gray-700/50">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${memoryStatus.color}`} />
            <span className="text-gray-400">Memory {memoryStatus.status}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${fpsStatus.color}`} />
            <span className="text-gray-400">FPS {fpsStatus.status}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Hook for memory-optimized virtual scrolling metrics
 */
export function useVirtualScrollMetrics(totalItems: number, itemHeight: number, containerHeight: number) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 })
  const [scrollTop, setScrollTop] = useState(0)

  // Calculate visible range based on scroll position
  const calculateVisibleRange = (scrollPosition: number) => {
    const start = Math.max(0, Math.floor(scrollPosition / itemHeight))
    const end = Math.min(totalItems - 1, Math.ceil((scrollPosition + containerHeight) / itemHeight))
    
    return { start, end }
  }

  const handleScroll = (position: number) => {
    setScrollTop(position)
    const range = calculateVisibleRange(position)
    setVisibleRange(range)
  }

  const renderedItems = visibleRange.end - visibleRange.start + 1
  const renderEfficiency = totalItems > 0 ? (renderedItems / totalItems) * 100 : 0

  return {
    visibleRange,
    scrollTop,
    renderedItems,
    renderEfficiency,
    handleScroll
  }
}
