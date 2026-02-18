import { useEffect, useState } from 'react'
import { useAuth } from '../store/authStore'

export function useSession() {
  const { user, isAuthenticated, setUser, setAuthenticated, fetchCurrentUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      // Check localStorage backup for authentication state
      const storedAuth = localStorage.getItem('isAuthenticated')
      const token = localStorage.getItem('sessionToken')
      
      console.log('🔍 Session check:', { isAuthenticated, storedAuth, hasToken: !!token })
      
      // If we have a token and stored auth state, ensure we're authenticated
      if (token && storedAuth === 'true' && !isAuthenticated) {
        console.log('🔄 Restoring authentication from localStorage')
        setAuthenticated(true)
        return
      }
      
      // Skip validation if user is already authenticated (set by SteamCallback)
      if (isAuthenticated) {
        console.log('✅ Already authenticated, skipping validation')
        return
      }
      
      if (token && !user) {
        // We have a token but no user in memory, fetch user
        setIsLoading(true)
        try {
          await fetchCurrentUser()
        } catch (error) {
          console.error('❌ Failed to fetch user with session token:', error)
          // Clear invalid token
          localStorage.removeItem('sessionToken')
          localStorage.removeItem('isAuthenticated')
          setUser(null)
          setAuthenticated(false)
        }
        setIsLoading(false)
      }
    }

    checkSession()
  }, [user, isAuthenticated, setUser, setAuthenticated, fetchCurrentUser])

  const logout = () => {
    localStorage.removeItem('sessionToken')
    localStorage.removeItem('isAuthenticated')
    setUser(null)
    setAuthenticated(false)
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    logout
  }
}
