import { useState, useCallback } from 'react'

export const useMicroInteractions = () => {
  const [activeEffects, setActiveEffects] = useState<Set<string>>(new Set())

  const triggerInteraction = useCallback((effect: string) => {
    setActiveEffects(prev => new Set(prev).add(effect))
    setTimeout(() => {
      setActiveEffects(prev => {
        const next = new Set(prev)
        next.delete(effect)
        return next
      })
    }, 300)
  }, [])

  const playHoverEffect = useCallback((element: string) => {
    triggerInteraction(`hover-${element}`)
  }, [triggerInteraction])

  const playClickEffect = useCallback((element: string) => {
    triggerInteraction(`click-${element}`)
  }, [triggerInteraction])

  return {
    activeEffects,
    triggerInteraction,
    playHoverEffect,
    playClickEffect
  }
}
