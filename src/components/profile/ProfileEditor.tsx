import React, { useState } from 'react'
import { useProfileStore } from '../../stores/profileStore'

export const ProfileEditor: React.FC = () => {
  const { profile, updateProfile, isEditing, setEditing, getGamingLevel } = useProfileStore()
  const [editForm, setEditForm] = useState({
    displayName: profile?.displayName || '',
    bio: profile?.bio || '',
    favoriteMoods: profile?.favoriteMoods || []
  })

  const handleSave = () => {
    updateProfile(editForm)
    setEditing(false)
  }

  const handleCancel = () => {
    setEditForm({
      displayName: profile?.displayName || '',
      bio: profile?.bio || '',
      favoriteMoods: profile?.favoriteMoods || []
    })
    setEditing(false)
  }

  const handleMoodToggle = (moodId: string) => {
    setEditForm(prev => ({
      ...prev,
      favoriteMoods: prev.favoriteMoods.includes(moodId)
        ? prev.favoriteMoods.filter(m => m !== moodId)
        : [...prev.favoriteMoods, moodId]
    }))
  }

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gaming-text">Edit Profile</h3>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-gaming-primary hover:bg-gaming-primary/80 text-white rounded-lg text-sm"
            >
              Save
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gaming-text mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={editForm.displayName}
              onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
              className="w-full p-2 bg-gaming-surface border border-gaming-border rounded text-gaming-text"
              maxLength={30}
              placeholder="Enter your display name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gaming-text mb-2">
              Bio
            </label>
            <textarea
              value={editForm.bio}
              onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
              className="w-full p-2 bg-gaming-surface border border-gaming-border rounded text-gaming-text resize-none"
              rows={3}
              maxLength={200}
              placeholder="Tell us about your gaming style..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gaming-text mb-2">
              Favorite Moods
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['adrenaline', 'brain-power', 'zen', 'story', 'social', 'creative', 'nostalgic', 'scary'].map(mood => (
                <button
                  key={mood}
                  onClick={() => handleMoodToggle(mood)}
                  className={`px-3 py-2 rounded-lg text-sm capitalize transition-all ${
                    editForm.favoriteMoods.includes(mood)
                      ? 'bg-gaming-primary text-white'
                      : 'bg-gaming-surface text-gaming-text hover:bg-gaming-surface/80'
                  }`}
                >
                  {mood.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gaming-text">Your Profile</h3>
        <button
          onClick={() => setEditing(true)}
          className="px-3 py-1 bg-gaming-primary hover:bg-gaming-primary/80 text-white rounded-lg text-sm"
        >
          Edit
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gaming-surface border-2 border-gaming-border flex items-center justify-center">
            <span className="text-2xl">
              {profile?.avatar.type === 'preset' && '👤'}
              {profile?.avatar.type === 'upload' && '📷'}
            </span>
          </div>
          <div>
            <h4 className="text-xl font-semibold text-gaming-text">{profile?.displayName}</h4>
            <p className="text-sm text-gaming-text-muted">{getGamingLevel()}</p>
          </div>
        </div>

        {profile?.bio && (
          <p className="text-gaming-text">{profile.bio}</p>
        )}

        {profile?.favoriteMoods && profile.favoriteMoods.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-gaming-text mb-2">Favorite Moods</h5>
            <div className="flex flex-wrap gap-2">
              {profile.favoriteMoods.map(mood => (
                <span key={mood} className="px-2 py-1 bg-gaming-surface text-gaming-text rounded text-sm capitalize">
                  {mood.replace('-', ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gaming-text-muted">Hours Played:</span>
            <span className="ml-2 text-gaming-text font-medium">{profile?.totalHoursPlayed || 0}h</span>
          </div>
          <div>
            <span className="text-gaming-text-muted">Games Completed:</span>
            <span className="ml-2 text-gaming-text font-medium">{profile?.gamesCompleted || 0}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
