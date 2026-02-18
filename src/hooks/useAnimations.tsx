import React, { useState, useEffect, useRef } from 'react'

// Animation utilities for React components
export const useAnimation = (animationName: string, duration: number = 300) => {
  const [isAnimating, setIsAnimating] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  const startAnimation = () => {
    if (elementRef.current) {
      setIsAnimating(true)
      elementRef.current.style.animation = `${animationName} ${duration}ms ease-in-out`
      
      setTimeout(() => {
        setIsAnimating(false)
      }, duration)
    }
  }

  return { elementRef, isAnimating, startAnimation }
}

// Staggered animation hook
export const useStaggeredAnimation = (items: any[], delay: number = 100) => {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set())

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0')
            setTimeout(() => {
              setVisibleItems(prev => new Set(prev).add(index))
            }, index * delay)
          }
        })
      },
      { threshold: 0.1 }
    )

    const elements = document.querySelectorAll('.stagger-item')
    elements.forEach(element => observer.observe(element))

    return () => observer.disconnect()
  }, [delay])

  return visibleItems
}

// Scroll reveal animation hook
export const useScrollReveal = () => {
  const [revealedElements, setRevealedElements] = useState<Set<string>>(new Set())

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-reveal-id') || ''
            setRevealedElements(prev => new Set(prev).add(id))
          }
        })
      },
      { threshold: 0.1 }
    )

    const elements = document.querySelectorAll('.scroll-reveal')
    elements.forEach(element => observer.observe(element))

    return () => observer.disconnect()
  }, [])

  return revealedElements
}

// Parallax effect hook
export const useParallax = (speed: number = 0.5) => {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.pageYOffset * speed)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return offset
}

// Typewriter effect hook
export const useTypewriter = (text: string, speed: number = 50) => {
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    if (!isTyping) return

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, speed)
      return () => clearTimeout(timeout)
    } else {
      setIsTyping(false)
    }
  }, [text, currentIndex, isTyping, speed])

  const startTyping = () => {
    setDisplayText('')
    setCurrentIndex(0)
    setIsTyping(true)
  }

  return { displayText, startTyping, isTyping }
}

// Counter animation hook
export const useCounter = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const startCounter = () => {
    setIsAnimating(true)
    const startTime = Date.now()
    const endTime = startTime + duration

    const updateCounter = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / (endTime - startTime), 1)
      const currentCount = Math.floor(progress * end)
      
      setCount(currentCount)
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter)
      } else {
        setIsAnimating(false)
      }
    }

    requestAnimationFrame(updateCounter)
  }

  return { count, startCounter, isAnimating }
}

// Hover animation hook
export const useHoverAnimation = (animationClass: string) => {
  const [isHovered, setIsHovered] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (elementRef.current) {
      elementRef.current.classList.add(animationClass)
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    if (elementRef.current) {
      elementRef.current.classList.remove(animationClass)
    }
  }

  return { elementRef, isHovered, handleMouseEnter, handleMouseLeave }
}

// Loading animation hook
export const useLoading = () => {
  const [isLoading, setIsLoading] = useState(false)

  const startLoading = () => setIsLoading(true)
  const stopLoading = () => setIsLoading(false)

  return { isLoading, startLoading, stopLoading }
}

// Pulse animation hook
export const usePulse = (intensity: number = 1) => {
  const [isPulsing, setIsPulsing] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  const startPulse = () => {
    setIsPulsing(true)
    if (elementRef.current) {
      elementRef.current.style.animation = `pulse ${2 / intensity}s ease-in-out infinite`
    }
  }

  const stopPulse = () => {
    setIsPulsing(false)
    if (elementRef.current) {
      elementRef.current.style.animation = ''
    }
  }

  return { elementRef, isPulsing, startPulse, stopPulse }
}

// Shake animation hook
export const useShake = () => {
  const [isShaking, setIsShaking] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  const startShake = () => {
    setIsShaking(true)
    if (elementRef.current) {
      elementRef.current.style.animation = 'shake 0.5s ease-in-out'
    }
    
    setTimeout(() => {
      setIsShaking(false)
      if (elementRef.current) {
        elementRef.current.style.animation = ''
      }
    }, 500)
  }

  return { elementRef, isShaking, startShake }
}

// Bounce animation hook
export const useBounce = () => {
  const [isBouncing, setIsBouncing] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  const startBounce = () => {
    setIsBouncing(true)
    if (elementRef.current) {
      elementRef.current.style.animation = 'bounce 1s ease-in-out'
    }
    
    setTimeout(() => {
      setIsBouncing(false)
      if (elementRef.current) {
        elementRef.current.style.animation = ''
      }
    }, 1000)
  }

  return { elementRef, isBouncing, startBounce }
}

// Glow animation hook
export const useGlow = (color: string = '#8b5cf6') => {
  const [isGlowing, setIsGlowing] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  const startGlow = () => {
    setIsGlowing(true)
    if (elementRef.current) {
      elementRef.current.style.boxShadow = `0 0 20px ${color}80`
    }
  }

  const stopGlow = () => {
    setIsGlowing(false)
    if (elementRef.current) {
      elementRef.current.style.boxShadow = ''
    }
  }

  return { elementRef, isGlowing, startGlow, stopGlow }
}

// Morph animation hook
export const useMorph = () => {
  const [isMorphing, setIsMorphing] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  const startMorph = () => {
    setIsMorphing(true)
    if (elementRef.current) {
      elementRef.current.style.transform = 'scale(1.1) rotate(5deg)'
    }
  }

  const stopMorph = () => {
    setIsMorphing(false)
    if (elementRef.current) {
      elementRef.current.style.transform = 'scale(1) rotate(0deg)'
    }
  }

  return { elementRef, isMorphing, startMorph, stopMorph }
}

// Fade animation hook
export const useFade = (direction: 'in' | 'out' = 'in') => {
  const [isFaded, setIsFaded] = useState(direction === 'out')
  const elementRef = useRef<HTMLElement>(null)

  const startFade = () => {
    setIsFaded(true)
    if (elementRef.current) {
      elementRef.current.style.opacity = direction === 'in' ? '1' : '0'
      elementRef.current.style.transform = direction === 'in' ? 'translateY(0)' : 'translateY(-10px)'
    }
  }

  const resetFade = () => {
    setIsFaded(false)
    if (elementRef.current) {
      elementRef.current.style.opacity = '0'
      elementRef.current.style.transform = 'translateY(10px)'
    }
  }

  return { elementRef, isFaded, startFade, resetFade }
}

// Slide animation hook
export const useSlide = (direction: 'up' | 'down' | 'left' | 'right' = 'up') => {
  const [isSliding, setIsSliding] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  const startSlide = () => {
    setIsSliding(true)
    if (elementRef.current) {
      const transforms = {
        up: 'translateY(-20px)',
        down: 'translateY(20px)',
        left: 'translateX(-20px)',
        right: 'translateX(20px)'
      }
      elementRef.current.style.transform = transforms[direction]
    }
  }

  const resetSlide = () => {
    setIsSliding(false)
    if (elementRef.current) {
      elementRef.current.style.transform = 'translate(0)'
    }
  }

  return { elementRef, isSliding, startSlide, resetSlide }
}

// Scale animation hook
export const useScale = () => {
  const [isScaling, setIsScaling] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  const startScale = () => {
    setIsScaling(true)
    if (elementRef.current) {
      elementRef.current.style.transform = 'scale(1.1)'
    }
  }

  const resetScale = () => {
    setIsScaling(false)
    if (elementRef.current) {
      elementRef.current.style.transform = 'scale(1)'
    }
  }

  return { elementRef, isScaling, startScale, resetScale }
}

// Rotate animation hook
export const useRotate = () => {
  const [isRotating, setIsRotating] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  const startRotate = () => {
    setIsRotating(true)
    if (elementRef.current) {
      elementRef.current.style.animation = 'rotate 1s linear infinite'
    }
  }

  const stopRotate = () => {
    setIsRotating(false)
    if (elementRef.current) {
      elementRef.current.style.animation = ''
    }
  }

  return { elementRef, isRotating, startRotate, stopRotate }
}

// Animation utility functions
export const createAnimation = (element: HTMLElement, keyframes: Keyframe[], options: KeyframeAnimationOptions = {}) => {
  const animation = element.animate(keyframes, {
    duration: 300,
    easing: 'ease-in-out',
    fill: 'forwards',
    ...options
  })
  
  return animation
}

export const createStaggeredAnimation = (elements: HTMLElement[], keyframes: Keyframe[], delay: number = 100) => {
  const animations = elements.map((element, index) => {
    const delayedKeyframes = keyframes.map(keyframe => ({
      ...keyframe,
      offset: keyframe.offset ? keyframe.offset + (index * delay / 1000) : undefined
    }))
    
    return element.animate(delayedKeyframes, {
      duration: 300,
      easing: 'ease-in-out',
      fill: 'forwards'
    })
  })
  
  return animations
}

export const createScrollAnimation = (element: HTMLElement, trigger: HTMLElement) => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          element.style.opacity = '1'
          element.style.transform = 'translateY(0)'
        }
      })
    },
    { threshold: 0.1 }
  )

  observer.observe(element)
  return observer
}

export const createHoverAnimation = (element: HTMLElement, hoverKeyframes: Keyframe[], normalKeyframes: Keyframe[]) => {
  let animation: Animation | null = null

  const handleMouseEnter = () => {
    if (animation) animation.cancel()
    animation = element.animate(hoverKeyframes, {
      duration: 300,
      easing: 'ease-out',
      fill: 'forwards'
    })
  }

  const handleMouseLeave = () => {
    if (animation) animation.cancel()
    animation = element.animate(normalKeyframes, {
      duration: 300,
      easing: 'ease-in-out',
      fill: 'forwards'
    })
  }

  element.addEventListener('mouseenter', handleMouseEnter)
  element.addEventListener('mouseleave', handleMouseLeave)

  return () => {
    element.removeEventListener('mouseenter', handleMouseEnter)
    element.removeEventListener('mouseleave', handleMouseLeave)
    if (animation) animation.cancel()
  }
}

// Animation presets
export const animationPresets = {
  fadeIn: [
    { opacity: 0, transform: 'translateY(20px)' },
    { opacity: 1, transform: 'translateY(0)' }
  ],
  fadeOut: [
    { opacity: 1, transform: 'translateY(0)' },
    { opacity: 0, transform: 'translateY(-20px)' }
  ],
  slideUp: [
    { opacity: 0, transform: 'translateY(20px)' },
    { opacity: 1, transform: 'translateY(0)' }
  ],
  slideDown: [
    { opacity: 0, transform: 'translateY(-20px)' },
    { opacity: 1, transform: 'translateY(0)' }
  ],
  slideLeft: [
    { opacity: 0, transform: 'translateX(20px)' },
    { opacity: 1, transform: 'translateX(0)' }
  ],
  slideRight: [
    { opacity: 0, transform: 'translateX(-20px)' },
    { opacity: 1, transform: 'translateX(0)' }
  ],
  scaleUp: [
    { opacity: 0, transform: 'scale(0.8)' },
    { opacity: 1, transform: 'scale(1)' }
  ],
  scaleDown: [
    { opacity: 0, transform: 'scale(1.2)' },
    { opacity: 1, transform: 'scale(1)' }
  ],
  bounce: [
    { transform: 'translateY(0)' },
    { transform: 'translateY(-10px)' },
    { transform: 'translateY(0)' }
  ],
  pulse: [
    { transform: 'scale(1)', opacity: 1 },
    { transform: 'scale(1.05)', opacity: 0.8 },
    { transform: 'scale(1)', opacity: 1 }
  ],
  shake: [
    { transform: 'translateX(0)' },
    { transform: 'translateX(-5px)' },
    { transform: 'translateX(5px)' },
    { transform: 'translateX(0)' }
  ],
  glow: [
    { boxShadow: '0 0 5px rgba(139, 92, 246, 0.5)' },
    { boxShadow: '0 0 20px rgba(139, 92, 246, 0.8)' }
  ]
}

// Animation utility functions
export const animateElement = (element: HTMLElement, animationName: keyof typeof animationPresets) => {
  return createAnimation(element, animationPresets[animationName])
}

export const animateStaggered = (elements: HTMLElement[], animationName: keyof typeof animationPresets, delay: number = 100) => {
  return createStaggeredAnimation(elements, animationPresets[animationName], delay)
}

export const animateOnScroll = (element: HTMLElement, trigger?: HTMLElement) => {
  return createScrollAnimation(element, trigger || element)
}

export const animateOnHover = (element: HTMLElement, hoverAnimation: keyof typeof animationPresets, normalAnimation: keyof typeof animationPresets) => {
  return createHoverAnimation(element, animationPresets[hoverAnimation], animationPresets[normalAnimation])
}

// React component for animations
interface AnimatedProps {
  children: React.ReactNode
  animation?: keyof typeof animationPresets
  delay?: number
  duration?: number
  className?: string
  onAnimationEnd?: () => void
}

export const Animated: React.FC<AnimatedProps> = ({
  children,
  animation,
  delay = 0,
  duration = 300,
  className = '',
  onAnimationEnd
}) => {
  const elementRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (elementRef.current && animation && isVisible) {
      const timeout = setTimeout(() => {
        if (elementRef.current) {
          const anim = animateElement(elementRef.current, animation)
          if (onAnimationEnd) {
            anim.addEventListener('finish', onAnimationEnd)
          }
        }
      }, delay)

      return () => clearTimeout(timeout)
    }
  }, [animation, delay, isVisible, onAnimationEnd])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        })
      },
      { threshold: 0.1 }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current)
      }
    }
  }, [])

  return (
    <div
      ref={elementRef}
      className={className}
      style={{ animationDuration: `${duration}ms` }}
    >
      {children}
    </div>
  )
}

// Staggered animation component
interface StaggeredProps {
  children: React.ReactNode
  animation?: keyof typeof animationPresets
  delay?: number
  className?: string
}

export const Staggered: React.FC<StaggeredProps> = ({
  children,
  animation = 'fadeIn',
  delay = 100,
  className = ''
}) => {
  const [elements, setElements] = useState<React.ReactNode[]>([])

  useEffect(() => {
    const childrenArray = React.Children.toArray(children)
    setElements(childrenArray)
  }, [children])

  return (
    <div className={className}>
      {elements.map((child, index) => (
        <Animated
          key={React.isValidElement(child) ? child.key : index}
          animation={animation}
          delay={index * delay}
        >
          {child}
        </Animated>
      ))}
    </div>
  )
}

export default {
  useAnimation,
  useStaggeredAnimation,
  useScrollReveal,
  useParallax,
  useTypewriter,
  useCounter,
  useHoverAnimation,
  useLoading,
  usePulse,
  useShake,
  useBounce,
  useGlow,
  useMorph,
  useFade,
  useSlide,
  useScale,
  useRotate,
  createAnimation,
  createStaggeredAnimation,
  createScrollAnimation,
  createHoverAnimation,
  animationPresets,
  animateElement,
  animateStaggered,
  animateOnScroll,
  animateOnHover,
  Animated,
  Staggered
}
