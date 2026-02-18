import { useEffect, useState } from 'react'
import { personaEngineService } from '../services/personaEngineService'

/**
 * Hook for real-time persona updates
 * Listens to personaEngineService changes and provides real-time persona data
 */
export function usePersonaRealtime() {
  const [persona, setPersona] = useState<any>(null)
  const [isListening, setIsListening] = useState(false)

  useEffect(() => {
    // Get initial persona data
    const initialPersona = personaEngineService.getCurrentPersona()
    setPersona(initialPersona)

    // Set up polling for real-time updates
    const pollInterval = setInterval(() => {
      const currentPersona = personaEngineService.getCurrentPersona()
      if (JSON.stringify(currentPersona) !== JSON.stringify(persona)) {
        setPersona(currentPersona)
      }
    }, 1000) // Poll every second for changes

    setIsListening(true)

    return () => {
      clearInterval(pollInterval)
      setIsListening(false)
    }
  }, [])

  const refreshPersona = async () => {
    try {
      // Force refresh from auth store
      const currentPersona = personaEngineService.getCurrentPersona()
      setPersona(currentPersona)
    } catch (error) {
      console.error('Failed to refresh persona:', error)
    }
  }

  return {
    persona,
    isListening,
    refreshPersona,
    isPersonaInitialized: personaEngineService.isPersonaInitialized()
  }
}
