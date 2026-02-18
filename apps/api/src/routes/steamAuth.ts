import { Router, Request, Response } from 'express'
import { generateSteamAuthUrl, verifySteamResponse, fetchSteamUserProfile, createOrUpdateSteamUser } from '../auth/steam'
import { generateToken } from '../auth/authService'

const router = Router()

/**
 * GET /auth/steam
 * Initiate Steam authentication
 */
router.get('/steam', (req: Request, res: Response) => {
  try {
    console.log('🎮 GET /auth/steam - Initiating Steam authentication')
    
    // Generate Steam OpenID authentication URL
    const authUrl = generateSteamAuthUrl()
    
    console.log('🔗 Redirecting to Steam authentication:', authUrl)
    res.redirect(authUrl)
  } catch (error) {
    console.error('❌ Steam authentication initiation failed:', error)
    
    // Redirect to frontend with error
    const frontendUrl = process.env.NODE_ENV === 'production'
      ? 'https://gamepilot.com'
      : 'http://localhost:3002'
    
    res.redirect(`${frontendUrl}/auth/callback/steam?loginError=steam_auth_failed`)
  }
})

/**
 * GET /auth/callback/steam
 * Handle Steam authentication callback
 */
router.get('/callback/steam', async (req: Request, res: Response) => {
  try {
    console.log('🔄 GET /auth/callback/steam - Steam callback received')
    console.log('📋 Query params:', req.query)
    
    // Verify Steam OpenID response
    const verification = await verifySteamResponse(req.query)
    
    if (!verification.valid || !verification.steamId) {
      console.error('❌ Steam verification failed')
      
      // Redirect to frontend with error
      const frontendUrl = process.env.NODE_ENV === 'production'
        ? 'https://gamepilot.com'
        : 'http://localhost:3002'
      
      return res.redirect(`${frontendUrl}/auth/callback/steam?loginError=steam_verification_failed`)
    }
    
    const steamId = verification.steamId
    console.log('✅ Steam ID verified:', steamId)
    
    // Fetch Steam user profile
    const profileData = await fetchSteamUserProfile(steamId)
    
    if (!profileData) {
      console.error('❌ Failed to fetch Steam profile')
      
      // Redirect to frontend with error
      const frontendUrl = process.env.NODE_ENV === 'production'
        ? 'https://gamepilot.com'
        : 'http://localhost:3002'
      
      return res.redirect(`${frontendUrl}/auth/callback/steam?loginError=steam_profile_fetch_failed`)
    }
    
    console.log('👤 Steam profile fetched:', profileData.personaName)
    
    // Create or update user with Steam data
    const user = await createOrUpdateSteamUser(steamId, profileData)
    
    console.log('✅ User created/updated:', user.id)
    
    // Generate JWT session token
    const sessionToken = generateToken(user)
    
    console.log('🔑 Session token generated')
    
    // Build frontend redirect URL with all required parameters
    const frontendUrl = process.env.NODE_ENV === 'production'
      ? 'https://gamepilot.com'
      : 'http://localhost:3002' // Redirect to WEB port
    
    const callbackUrl = new URL(`${frontendUrl}/auth/callback/steam`)
    callbackUrl.searchParams.set('sessionToken', sessionToken)
    callbackUrl.searchParams.set('userId', user.id)
    callbackUrl.searchParams.set('steamId', steamId)
    callbackUrl.searchParams.set('displayName', profileData.personaName)
    callbackUrl.searchParams.set('avatar', profileData.avatar)
    
    console.log('🚀 Redirecting to frontend with params:', {
      userId: user.id,
      steamId: steamId,
      displayName: profileData.personaName,
      hasToken: !!sessionToken,
      hasAvatar: !!profileData.avatar
    })
    
    res.redirect(callbackUrl.toString())
  } catch (error) {
    console.error('❌ Steam callback error:', error)
    
    // Redirect to frontend with error
    const frontendUrl = process.env.NODE_ENV === 'production'
      ? 'https://gamepilot.com'
      : 'http://localhost:3002' // Redirect to WEB port
    
    res.redirect(`${frontendUrl}/auth/callback/steam?loginError=steam_callback_error`)
  }
})

export default router
