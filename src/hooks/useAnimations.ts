// Animation Hooks for React Components - Micro-interactions & Polish
import { useEffect, useRef, useState, useCallback } from 'react'

// Intersection Observer Hook for scroll-triggered animations
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
        ...options
      }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [options.threshold, options.rootMargin, hasIntersected])

  return { ref, isIntersecting, hasIntersected }
}

// Staggered animation hook for lists
export const useStaggeredAnimation = (
  itemCount: number,
  delay: number = 100
) => {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set())

  const showItem = useCallback((index: number) => {
    setVisibleItems(prev => new Set(prev).add(index))
  }, [])

  const showAllItems = useCallback(() => {
        for (let i = 0; i < itemCount; i++) {
      setTimeout(() => {
        setVisibleItems(prev => new Set(prev).add(i))
      }, i * delay)
    }
  }, [itemCount, delay])

  const hideItem = useCallback((index: number) => {
    setVisibleItems(prev => {
      const newSet = new Set(prev)
      newSet.delete(index)
      return newSet
    })
  }, [])

  const hideAllItems = useCallback(() => {
    setVisibleItems(new Set())
  }, [])

  return {
    visibleItems,
    showItem,
    hideItem,
    showAllItems,
    hideAllItems
  }
}

// Hover animation hook with spring physics
export const useHoverAnimation = (
  ) => {
  const [isHovered, setIsHovered] = useState(false)
  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)

  useEffect(() => {
    if (isHovered) {
      setScale(1.05)
      setRotate(2)
    } else {
      setScale(1)
      setRotate(0)
    }
  }, [isHovered])

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
  }, [])

  return {
    isHovered,
    scale,
    rotate,
    handlers: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave
    }
  }
}

// Loading animation hook
export const useLoadingAnimation = (duration: number = 2000) => {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  const startLoading = useCallback(() => {
    setIsLoading(true)
    setProgress(0)
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsLoading(false)
          return 100
        }
        return prev + (100 / (duration / 100))
      })
    }, 100)

    return () => clearInterval(interval)
  }, [duration])

  const stopLoading = useCallback(() => {
    setIsLoading(false)
    setProgress(100)
  }, [])

  return {
    isLoading,
    progress,
    startLoading,
    stopLoading
  }
}

// Typing animation hook
export const useTypingAnimation = (
  text: string,
  speed: number = 50,
  delay: number = 0
) => {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    setDisplayedText('')
    setIsTyping(false)
    setIsComplete(false)

    const timeout = setTimeout(() => {
      setIsTyping(true)
      let currentIndex = 0

      const interval = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1))
          currentIndex++
        } else {
          setIsTyping(false)
          setIsComplete(true)
          clearInterval(interval)
        }
      }, speed)

      return () => clearInterval(interval)
    }, delay)

    return () => clearTimeout(timeout)
  }, [text, speed, delay])

  return {
    displayedText,
    isTyping,
    isComplete
  }
}

// Particle animation hook
export const useParticleAnimation = (
  particleCount: number = 20
) => {
  const [particles, setParticles] = useState<Array<{
    id: number
    x: number
    y: number
    vx: number
    vy: number
    size: number
    opacity: number
  }>>([])

  const generateParticles = useCallback((x: number, y: number) => {
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      size: Math.random() * 4 + 2,
      opacity: 1
    }))

    setParticles(newParticles)

    // Animate particles
    const interval = setInterval(() => {
      setParticles(prev => 
        prev.map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vy: particle.vy + 0.1, // gravity
          opacity: Math.max(0, particle.opacity - 0.02)
        })).filter(particle => particle.opacity > 0)
      )
    }, 16)

    setTimeout(() => clearInterval(interval), 2000)
  }, [particleCount])

  return {
    particles,
    generateParticles
  }
}

// Ripple effect hook
export const useRippleEffect = () => {
  const [ripples, setRipples] = useState<Array<{
    id: number
    x: number
    y: number
    size: number
  }>>([])

  const createRipple = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const size = Math.max(rect.width, rect.height)

    const newRipple = {
      id: Date.now(),
      x,
      y,
      size
    }

    setRipples(prev => [...prev, newRipple])

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
    }, 600)
  }, [])

  return {
    ripples,
    createRipple
  }
}

// Parallax scroll hook
export const useParallax = (
  speed: number = 0.5
) => {
  const [offset, setOffset] = useState(0)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const scrolled = window.scrollY
        const rate = scrolled * -speed
        setOffset(rate)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return {
    ref,
    offset,
    transform: `translateY(${offset}px)`
  }
}

// Magnetic effect hook
export const useMagneticEffect = (
  strength: number = 0.3
) => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const ref = useRef<HTMLElement>(null)

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const deltaX = (event.clientX - centerX) * strength
    const deltaY = (event.clientY - centerY) * strength

    setPosition({ x: deltaX, y: deltaY })
  }, [strength])

  const handleMouseLeave = useCallback(() => {
    setPosition({ x: 0, y: 0 })
  }, [])

  return {
    ref,
    position,
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave
    },
    transform: `translate(${position.x}px, ${position.y}px)`
  }
}

// Morph animation hook
export const useMorphAnimation = (
  shapes: string[],
  duration: number = 2000
) => {
  const [currentShapeIndex, setCurrentShapeIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const morphToShape = useCallback((index: number) => {
    if (index === currentShapeIndex || isAnimating) return

    setIsAnimating(true)
    setCurrentShapeIndex(index)

    setTimeout(() => {
      setIsAnimating(false)
    }, duration)
  }, [currentShapeIndex, isAnimating, duration])

  const nextShape = useCallback(() => {
    const nextIndex = (currentShapeIndex + 1) % shapes.length
    morphToShape(nextIndex)
  }, [currentShapeIndex, shapes.length, morphToShape])

  const prevShape = useCallback(() => {
    const prevIndex = currentShapeIndex === 0 ? shapes.length - 1 : currentShapeIndex - 1
    morphToShape(prevIndex)
  }, [currentShapeIndex, shapes.length, morphToShape])

  useEffect(() => {
    const interval = setInterval(nextShape, duration * 2)
    return () => clearInterval(interval)
  }, [nextShape, duration])

  return {
    currentShape: shapes[currentShapeIndex],
    currentShapeIndex,
    isAnimating,
    morphToShape,
    nextShape,
    prevShape
  }
}

// Gesture animation hook
export const useGestureAnimation = () => {
  const [gesture, setGesture] = useState<{
    type: 'swipe' | 'pinch' | 'rotate' | null
    direction?: 'up' | 'down' | 'left' | 'right'
    scale?: number
    rotation?: number
  }>({ type: null })

  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 })
  const [currentPoint, setCurrentPoint] = useState({ x: 0, y: 0 })

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0]
    setStartPoint({ x: touch.clientX, y: touch.clientY })
    setCurrentPoint({ x: touch.clientX, y: touch.clientY })
  }, [])

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0]
    setCurrentPoint({ x: touch.clientX, y: touch.clientY })
  }, [])

  const handleTouchEnd = useCallback(() => {
    const deltaX = currentPoint.x - startPoint.x
    const deltaY = currentPoint.y - startPoint.y
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    if (distance > 50) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        setGesture({
          type: 'swipe',
          direction: deltaX > 0 ? 'right' : 'left'
        })
      } else {
        setGesture({
          type: 'swipe',
          direction: deltaY > 0 ? 'down' : 'up'
        })
      }

      setTimeout(() => setGesture({ type: null }), 300)
    }
  }, [currentPoint, startPoint])

  return {
    gesture,
    startPoint,
    currentPoint,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    }
  }
}

// Spring animation hook
export const useSpringAnimation = (
  to: number,
  config: { tension: number; friction: number } = { tension: 300, friction: 20 }
) => {
  const [value, setValue] = useState(0)
  const [velocity, setVelocity] = useState(0)

  useEffect(() => {
    let animationId: number
    let currentValue = value
    let currentVelocity = velocity

    const animate = () => {
      const displacement = to - currentValue
      const springForce = displacement * config.tension
      const dampingForce = currentVelocity * config.friction
      const acceleration = springForce - dampingForce

      currentVelocity += acceleration * 0.016 // 60fps
      currentValue += currentVelocity * 0.016

      setValue(currentValue)
      setVelocity(currentVelocity)

      if (Math.abs(displacement) > 0.01 || Math.abs(currentVelocity) > 0.01) {
        animationId = requestAnimationFrame(animate)
      }
    }

    animate()

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [to, config.tension, config.friction])

  return value
}

// Timeline animation hook
export const useTimeline = () => {
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(1000)
  const animations = useRef<Array<{
    start: number
    duration: number
    callback: (progress: number) => void
  }>>([])

  const addAnimation = useCallback((
    start: number,
    duration: number,
    callback: (progress: number) => void
  ) => {
    animations.current.push({ start, duration, callback })
  }, [])

  const play = useCallback(() => {
    setIsPlaying(true)
    setCurrentTime(0)

    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      setCurrentTime(elapsed)

      animations.current.forEach(animation => {
        if (elapsed >= animation.start) {
          const animProgress = Math.min(
            (elapsed - animation.start) / animation.duration,
            1
          )
          animation.callback(animProgress)
        }
      })

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setIsPlaying(false)
      }
    }

    requestAnimationFrame(animate)
  }, [duration])

  const pause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const reset = useCallback(() => {
    setCurrentTime(0)
    setIsPlaying(false)
  }, [])

  return {
    currentTime,
    isPlaying,
    duration,
    addAnimation,
    play,
    pause,
    reset,
    setDuration
  }
}

// Performance monitoring hook
export const useAnimationPerformance = () => {
  const [fps, setFps] = useState(60)
  const [frameTime, setFrameTime] = useState(16.67)
  const frameCount = useRef(0)
  const lastTime = useRef(performance.now())

  useEffect(() => {
    let animationId: number

    const measurePerformance = () => {
      frameCount.current++
      const currentTime = performance.now()
      const deltaTime = currentTime - lastTime.current

      if (deltaTime >= 1000) {
        const currentFps = (frameCount.current * 1000) / deltaTime
        const currentFrameTime = deltaTime / frameCount.current

        setFps(Math.round(currentFps))
        setFrameTime(currentFrameTime)

        frameCount.current = 0
        lastTime.current = currentTime
      }

      animationId = requestAnimationFrame(measurePerformance)
    }

    animationId = requestAnimationFrame(measurePerformance)

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [])

  return {
    fps,
    frameTime,
    isOptimal: fps >= 55 && frameTime <= 18
  }
}

export default {
  useIntersectionObserver,
  useStaggeredAnimation,
  useHoverAnimation,
  useLoadingAnimation,
  useTypingAnimation,
  useParticleAnimation,
  useRippleEffect,
  useParallax,
  useMagneticEffect,
  useMorphAnimation,
  useGestureAnimation,
  useSpringAnimation,
  useTimeline,
  useAnimationPerformance
}
