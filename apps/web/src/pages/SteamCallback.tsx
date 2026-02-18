import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/authStore'
import { useLibraryStore } from '../stores/useLibraryStore'

export default function SteamCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setUser, setAuthenticated } = useAuth()
  const { actions } = useLibraryStore()

  useEffect(() => {
    const sessionToken = searchParams.get('sessionToken')
    const userId = searchParams.get('userId')
    const steamId = searchParams.get('steamId') // Get real Steam ID!
    const displayName = searchParams.get('displayName')
    const avatar = searchParams.get('avatar')
    const error = searchParams.get('loginError')

    console.log('🔄 Steam callback params:', { sessionToken, userId, steamId, displayName, avatar, error })
    console.log('🔍 Full URL params object:', searchParams)
    console.log('🔍 All available params:', Array.from(searchParams.entries()))

    if (sessionToken && userId && displayName) {
      // Store session token
      localStorage.setItem('sessionToken', sessionToken)
      console.log('💾 Stored session token:', sessionToken.substring(0, 10) + '...')
      
      // Store basic user info for display
      const userData = {
        id: userId,
        username: displayName,
        displayName: displayName,
        avatar: avatar || '',
        steamId: steamId || userId, // Use real Steam ID if available
        personaName: displayName
      }
      
      localStorage.setItem('user', JSON.stringify(userData))
      console.log('💾 Stored user data:', userData)
      
      // Update auth store - THIS IS THE CRITICAL FIX
      setUser(userData)
      setAuthenticated(true)
      console.log('✅ Updated auth store with user data')
      
      // AUTO-IMPORT STEAM GAMES - THE MAIN EVENT!
      const autoImportSteamGames = async () => {
        try {
          console.log('🎮 Auto-importing Steam library for user:', userId)
          const apiKey = import.meta.env.VITE_STEAM_API_KEY || '52A301EC230E81BA57BA5155BEB2F6E8'
      const result = await actions.importSteamLibrary(userId, apiKey)
          
          if (result.success && result.gameCount > 0) {
            console.log(`✅ Auto-imported ${result.gameCount} Steam games!`)
            
            // Convert to proper Game format and add to library
            const gamesWithIds = result.games.map((game: any) => ({
              ...game,
              id: game.steamAppId || game.id,
              platforms: game.platforms || ['Steam'],
              genres: game.genres || [],
              coverImage: game.coverImage || game.header_image,
              playStatus: game.playStatus || 'backlog',
              isFavorite: false,
              addedAt: new Date(),
              hoursPlayed: game.hoursPlayed || 0,
              userRating: game.userRating,
              globalRating: game.globalRating,
              releaseYear: game.releaseYear
            }))
            
            actions.setGames(gamesWithIds)
            console.log('🎯 Steam games added to library:', gamesWithIds.length)
          } else {
            console.log('ℹ️ No Steam games found to import')
          }
        } catch (error) {
          console.error('❌ Auto-import failed:', error)
          // Still navigate to library even if import fails
          console.log('⚠️ Navigating to library despite import error')
        }
      }
      
      // Trigger auto-import
      autoImportSteamGames()
      
      console.log('✅ Steam callback processed successfully')
      
      // Navigate to library after a short delay to allow import
      setTimeout(() => {
        console.log('🚀 Navigating to /library')
        navigate('/library')
      }, 1000) // Reduced delay from 2000ms to 1000ms
    } else {
      // Handle error case
      console.error('❌ Steam login failed:', error)
      navigate('/login?error=' + (error || 'unknown'))
    }
  }, [searchParams, navigate, setUser, setAuthenticated, actions])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gaming-dark via-gray-900 to-gaming-darker flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-white text-lg">Processing Steam authentication...</p>
      </div>
    </div>
  )
}
