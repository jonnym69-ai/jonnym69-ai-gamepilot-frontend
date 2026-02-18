import React, { useState } from 'react'
import { useProfileStore } from '../../stores/profileStore'
import { AVATAR_PRESETS, getUnlockedAvatars } from '../../constants/presets'

export const AvatarSelector: React.FC = () => {
  const { profile, updateProfile, stats } = useProfileStore()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showUpload, setShowUpload] = useState(false)
  
  const unlockedAvatars = getUnlockedAvatars(stats)
  const categories = ['all', 'gamer', 'character', 'abstract', 'achievement']
  
  const filteredAvatars = unlockedAvatars.filter(avatar => 
    selectedCategory === 'all' || avatar.category === selectedCategory
  )

  const handleAvatarSelect = (presetId: string) => {
    updateProfile({
      avatar: {
        type: 'preset',
        presetId
      }
    })
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        updateProfile({
          avatar: {
            type: 'upload',
            url: e.target?.result as string
          }
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const currentAvatar = profile?.avatar.presetId || 'pro-gamer'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gaming-text">Your Avatar</h3>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="px-3 py-1 bg-gaming-primary hover:bg-gaming-primary/80 text-white rounded-lg text-sm"
        >
          {showUpload ? 'Cancel' : 'Upload Custom'}
        </button>
      </div>

      {showUpload && (
        <div className="p-4 bg-gaming-surface border border-gaming-border rounded-lg">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="w-full text-gaming-text file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gaming-primary file:text-white hover:file:bg-gaming-primary/80 cursor-pointer"
            title="Upload custom avatar image"
            aria-label="Upload custom avatar image"
          />
          <p className="text-xs text-gaming-text-muted mt-2">
            Upload a custom avatar (max 2MB, square recommended)
          </p>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded-lg text-sm capitalize transition-all ${
              selectedCategory === category
                ? 'bg-gaming-primary text-white'
                : 'bg-gaming-surface text-gaming-text hover:bg-gaming-surface/80'
            }`}
          >
            {category === 'all' ? 'All' : category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredAvatars.map((avatar) => {
          const isSelected = avatar.id === currentAvatar
          const isLocked = !unlockedAvatars.includes(avatar)
          
          return (
            <div
              key={avatar.id}
              className={`relative group cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-gaming-primary' : ''
              } ${isLocked ? 'opacity-50' : ''}`}
              onClick={() => !isLocked && handleAvatarSelect(avatar.id)}
            >
              <div className="aspect-square rounded-lg overflow-hidden bg-gaming-surface border-2 border-gaming-border group-hover:border-gaming-primary transition-all flex items-center justify-center">
                <div className="text-4xl">
                  {avatar.category === 'gamer' && '🎮'}
                  {avatar.category === 'character' && '🦸'}
                  {avatar.category === 'abstract' && '🎨'}
                  {avatar.category === 'achievement' && '🏆'}
                </div>
              </div>
              
              <div className="mt-2 text-center">
                <p className="text-sm font-medium text-gaming-text">{avatar.name}</p>
                {isLocked && avatar.unlockRequirement && (
                  <p className="text-xs text-gaming-text-muted">
                    {avatar.unlockRequirement.type === 'hours' && `${avatar.unlockRequirement.value}h`}
                    {avatar.unlockRequirement.type === 'games' && `${avatar.unlockRequirement.value} games`}
                  </p>
                )}
              </div>

              {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                  <div className="text-center">
                    <span className="text-2xl mb-1">🔒</span>
                    <p className="text-xs text-white">Locked</p>
                  </div>
                </div>
              )}

              {isSelected && (
                <div className="absolute top-2 right-2">
                  <span className="w-3 h-3 bg-gaming-primary rounded-full"></span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="p-3 bg-gaming-surface/50 border border-gaming-border rounded-lg">
        <p className="text-sm text-gaming-text-muted">
          💡 <strong>Tip:</strong> Unlock more avatars by playing games and completing challenges! 
          Some avatars require specific achievements or playtime.
        </p>
      </div>
    </div>
  )
}
