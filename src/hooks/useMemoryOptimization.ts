import { useEffect, useRef } from 'react'

/**
 * Hook for memory-optimized intersection observer with proper cleanup
 */
export function useIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
) {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const targetRef = useRef<Set<Element>>(new Set())

  useEffect(() => {
    // Create observer with optimized options
    observerRef.current = new IntersectionObserver(callback, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    })

    return () => {
      // Cleanup: disconnect observer and clear targets
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
      targetRef.current.clear()
    }
  }, [callback, options])

  const observe = (element: Element) => {
    if (observerRef.current && element) {
      observerRef.current.observe(element)
      targetRef.current.add(element)
    }
  }

  const unobserve = (element: Element) => {
    if (observerRef.current && element) {
      observerRef.current.unobserve(element)
      targetRef.current.delete(element)
    }
  }

  return { observe, unobserve }
}

/**
 * Hook for memory-optimized resize observer with proper cleanup
 */
export function useResizeObserver(
  callback: (entries: ResizeObserverEntry[]) => void
) {
  const observerRef = useRef<ResizeObserver | null>(null)
  const targetRef = useRef<Set<Element>>(new Set())

  useEffect(() => {
    // Create resize observer
    observerRef.current = new ResizeObserver(callback)

    return () => {
      // Cleanup: disconnect observer and clear targets
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
      targetRef.current.clear()
    }
  }, [callback])

  const observe = (element: Element) => {
    if (observerRef.current && element) {
      observerRef.current.observe(element)
      targetRef.current.add(element)
    }
  }

  const unobserve = (element: Element) => {
    if (observerRef.current && element) {
      observerRef.current.unobserve(element)
      targetRef.current.delete(element)
    }
  }

  return { observe, unobserve }
}

/**
 * Memory-optimized image cache with LRU eviction
 */
class ImageCache {
  private cache = new Map<string, HTMLImageElement>()
  private maxSize: number

  constructor(maxSize: number = 50) {
    this.maxSize = maxSize
  }

  get(url: string): HTMLImageElement | null {
    const image = this.cache.get(url)
    if (image) {
      // Move to end (LRU)
      this.cache.delete(url)
      this.cache.set(url, image)
      return image
    }
    return null
  }

  set(url: string, image: HTMLImageElement): void {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest item (LRU)
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }
    this.cache.set(url, image)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

// Global image cache instance
export const imageCache = new ImageCache()

/**
 * Memory-optimized image preloader with caching
 */
export function preloadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    // Check cache first
    const cached = imageCache.get(url)
    if (cached) {
      resolve(cached)
      return
    }

    const img = new Image()
    
    img.onload = () => {
      imageCache.set(url, img)
      resolve(img)
    }
    
    img.onerror = reject
    
    // Start loading
    img.src = url
  })
}

/**
 * Memory leak prevention for event listeners
 */
export function useEventListener<K extends keyof WindowEventMap>(
  target: Window | Document | HTMLElement,
  event: K,
  handler: (event: Event) => void,
  options?: AddEventListenerOptions
) {
  useEffect(() => {
    target.addEventListener(event, handler, options)
    
    return () => {
      target.removeEventListener(event, handler, options)
    }
  }, [target, event, handler, options])
}

/**
 * Memory-optimized scroll throttling
 */
export function useScrollThrottle(callback: () => void, delay: number = 16) {
  const lastCallRef = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout>()

  return () => {
    const now = Date.now()
    
    if (now - lastCallRef.current >= delay) {
      lastCallRef.current = now
      callback()
    } else {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        lastCallRef.current = Date.now()
        callback()
      }, delay - (now - lastCallRef.current))
    }
  }
}
