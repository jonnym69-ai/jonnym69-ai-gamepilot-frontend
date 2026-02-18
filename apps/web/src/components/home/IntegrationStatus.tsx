import React from 'react'

interface IntegrationStatusProps {
  steamConnected?: boolean
  discordPending?: boolean
  youtubePending?: boolean
}

export const IntegrationStatus: React.FC<IntegrationStatusProps> = ({
  steamConnected = false,
  discordPending = true,
  youtubePending = true
}) => {
  return (
    <div className="glass-morphism rounded-xl p-8">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <span className="text-2xl">🔗</span>
        Integration Status
      </h2>
      
      <div className="space-y-4">
        {/* Steam Integration */}
        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${steamConnected ? 'bg-green-500' : 'bg-gray-500'}`} />
            <div>
              <h3 className="text-white font-semibold">Steam</h3>
              <p className="text-gray-400 text-sm">
                {steamConnected ? 'Connected' : 'Not Connected'}
              </p>
            </div>
          </div>
          {steamConnected ? (
            <span className="text-green-400 text-sm font-medium">✅ Active</span>
          ) : (
            <button className="px-3 py-1 bg-gaming-accent hover:bg-gaming-primary text-white rounded text-sm font-medium transition-colors">
              Connect
            </button>
          )}
        </div>

        {/* Discord Integration */}
        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${discordPending ? 'bg-yellow-500' : 'bg-gray-500'}`} />
            <div>
              <h3 className="text-white font-semibold">Discord</h3>
              <p className="text-gray-400 text-sm">
                {discordPending ? 'Pending Setup' : 'Not Connected'}
              </p>
            </div>
          </div>
          {discordPending ? (
            <span className="text-yellow-400 text-sm font-medium">⏳ Pending</span>
          ) : (
            <button className="px-3 py-1 bg-gaming-accent hover:bg-gaming-primary text-white rounded text-sm font-medium transition-colors">
              Connect
            </button>
          )}
        </div>

        {/* YouTube Integration */}
        <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${youtubePending ? 'bg-yellow-500' : 'bg-gray-500'}`} />
            <div>
              <h3 className="text-white font-semibold">YouTube</h3>
              <p className="text-gray-400 text-sm">
                {youtubePending ? 'Pending Setup' : 'Not Connected'}
              </p>
            </div>
          </div>
          {youtubePending ? (
            <span className="text-yellow-400 text-sm font-medium">⏳ Pending</span>
          ) : (
            <button className="px-3 py-1 bg-gaming-accent hover:bg-gaming-primary text-white rounded text-sm font-medium transition-colors">
              Connect
            </button>
          )}
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-gaming-accent/10 rounded-lg border border-gaming-accent/30">
        <p className="text-gaming-accent text-sm">
          💡 <strong>Pro Tip:</strong> Connect your gaming accounts to unlock personalized recommendations and activity tracking across all platforms.
        </p>
      </div>
    </div>
  )
}
