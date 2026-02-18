import React from 'react'
import { useAuth } from '../store/authStore'

export const SteamLoginButton: React.FC = () => {
  const { user, loginWithSteam } = useAuth()

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <img 
          src={user.avatar} 
          alt={user.displayName}
          className="w-8 h-8 rounded-full"
        />
        <span className="text-white font-medium">
          {user.displayName}
        </span>
        <button
          onClick={() => window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/logout`}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={loginWithSteam}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
    >
      Sign in with Steam
    </button>
  )
}
