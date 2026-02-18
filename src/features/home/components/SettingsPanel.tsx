import React from 'react'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-morphism rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Theme Settings */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Appearance</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
                <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Privacy</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Profile Visibility</span>
                <select className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white">
                  <option value="public">Public</option>
                  <option value="friends">Friends</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications Settings */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Notifications</h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" />
                <span className="text-gray-300">Email Notifications</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" />
                <span className="text-gray-300">Push Notifications</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" />
                <span className="text-gray-300">Achievement Notifications</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" />
                <span className="text-gray-300">Friend Activity</span>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-gradient-to-r from-gaming-primary to-gaming-secondary text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
