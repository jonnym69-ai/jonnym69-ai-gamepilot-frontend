import React from 'react'
import { useAuth } from '../../store/authStore'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'

export const PlatformAuth: React.FC = () => {
  const { 
    user,
    isAuthenticated,
    isLoading,
    error,
    loginWithSteam,
    logout
  } = useAuth()

  const handleSteamAuth = async () => {
    try {
      loginWithSteam()
    } catch (error) {
      console.error('Steam auth error:', error)
    }
  }

  const handleLogout = async () => {
    try {
      logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Platform Authentication</h3>
        
        {/* Steam Authentication */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Steam</h4>
              <p className="text-sm text-gray-600">Connect your Steam account</p>
            </div>
            <div className="flex items-center gap-2">
              {user?.integrations?.find((i: any) => i.platform === 'steam') ? (
                <>
                  <Badge variant="success">Connected</Badge>
                  <Button 
                    variant="secondary" 
                    onClick={handleLogout}
                    disabled={isLoading}
                  >
                    Disconnect
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={handleSteamAuth}
                  disabled={isLoading}
                >
                  {isLoading ? 'Connecting...' : 'Connect Steam'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* User Status */}
        {isAuthenticated && user && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800">Authenticated</h4>
            <p className="text-sm text-green-600">Welcome, {user.displayName || user.username}!</p>
            <p className="text-xs text-green-500 mt-1">
              {user.integrations.length} platform(s) connected
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
