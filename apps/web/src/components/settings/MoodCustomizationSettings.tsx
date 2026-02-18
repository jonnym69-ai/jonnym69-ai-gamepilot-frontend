import React, { useState } from 'react'
import { getAllMoodDisplays, getMoodDisplay } from '../../utils/moodDisplay'
import { saveMoodCustomization, removeMoodCustomization } from '../../utils/preferences'
import { MASTER_MOODS } from '../../constants/masterMoods'

export const MoodCustomizationSettings: React.FC = () => {
  const [editingMood, setEditingMood] = useState<string | null>(null)
  const [customNames, setCustomNames] = useState<Record<string, string>>({})
  const [customEmojis, setCustomEmojis] = useState<Record<string, string>>({})
  const [customDescriptions, setCustomDescriptions] = useState<Record<string, string>>({})

  const moodDisplays = getAllMoodDisplays()

  const startEditing = (moodId: string) => {
    const display = getMoodDisplay(moodId)
    setCustomNames(prev => ({ ...prev, [moodId]: display.name }))
    setCustomEmojis(prev => ({ ...prev, [moodId]: display.emoji }))
    setCustomDescriptions(prev => ({ ...prev, [moodId]: display.description }))
    setEditingMood(moodId)
  }

  const saveCustomization = (moodId: string) => {
    const customName = customNames[moodId]?.trim()
    const customEmoji = customEmojis[moodId]?.trim()
    const customDescription = customDescriptions[moodId]?.trim()

    if (customName || customEmoji || customDescription) {
      saveMoodCustomization(moodId, {
        ...(customName && { name: customName }),
        ...(customEmoji && { emoji: customEmoji }),
        ...(customDescription && { description: customDescription })
      })
    }
    setEditingMood(null)
  }

  const cancelEditing = (moodId: string) => {
    setCustomNames(prev => {
      const { [moodId]: removed, ...rest } = prev
      return rest
    })
    setCustomEmojis(prev => {
      const { [moodId]: removed, ...rest } = prev
      return rest
    })
    setCustomDescriptions(prev => {
      const { [moodId]: removed, ...rest } = prev
      return rest
    })
    setEditingMood(null)
  }

  const resetToDefault = (moodId: string) => {
    removeMoodCustomization(moodId)
    cancelEditing(moodId)
  }

  const resetAll = () => {
    if (confirm('Are you sure you want to reset all mood customizations to defaults?')) {
      MASTER_MOODS.forEach(mood => {
        removeMoodCustomization(mood.id)
      })
      setCustomNames({})
      setCustomEmojis({})
      setCustomDescriptions({})
      setEditingMood(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gaming-text">Mood Customization</h3>
        <button
          onClick={resetAll}
          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
        >
          Reset All
        </button>
      </div>

      <div className="space-y-4">
        {moodDisplays.map((mood) => (
          <div key={mood.id} className="p-4 bg-gaming-surface border border-gaming-border rounded-lg">
            {editingMood === mood.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gaming-text mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={customNames[mood.id] || ''}
                      onChange={(e) => setCustomNames(prev => ({ ...prev, [mood.id]: e.target.value }))}
                      placeholder={MASTER_MOODS.find(m => m.id === mood.id)?.name}
                      className="w-full p-2 bg-gaming-surface border border-gaming-border rounded text-gaming-text"
                      maxLength={30}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gaming-text mb-1">
                      Emoji
                    </label>
                    <input
                      type="text"
                      value={customEmojis[mood.id] || ''}
                      onChange={(e) => setCustomEmojis(prev => ({ ...prev, [mood.id]: e.target.value }))}
                      placeholder={MASTER_MOODS.find(m => m.id === mood.id)?.emoji}
                      className="w-full p-2 bg-gaming-surface border border-gaming-border rounded text-gaming-text"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gaming-text mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={customDescriptions[mood.id] || ''}
                      onChange={(e) => setCustomDescriptions(prev => ({ ...prev, [mood.id]: e.target.value }))}
                      placeholder={MASTER_MOODS.find(m => m.id === mood.id)?.description}
                      className="w-full p-2 bg-gaming-surface border border-gaming-border rounded text-gaming-text"
                      maxLength={100}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => saveCustomization(mood.id)}
                    className="px-3 py-1 bg-gaming-primary hover:bg-gaming-primary/80 text-white rounded-lg text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => cancelEditing(mood.id)}
                    className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => resetToDefault(mood.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                  >
                    Reset to Default
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{mood.emoji}</span>
                  <div>
                    <div className="font-medium text-gaming-text">
                      {mood.name}
                      {mood.isCustom && <span className="ml-2 text-xs text-gaming-primary">(Custom)</span>}
                    </div>
                    <div className="text-sm text-gaming-text-muted">{mood.description}</div>
                  </div>
                </div>
                <button
                  onClick={() => startEditing(mood.id)}
                  className="px-3 py-1 bg-gaming-primary hover:bg-gaming-primary/80 text-white rounded-lg text-sm"
                >
                  Customize
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-3 bg-gaming-surface/50 border border-gaming-border rounded-lg">
        <p className="text-sm text-gaming-text-muted">
          💡 <strong>Tip:</strong> Customize mood names and emojis to make them more personal to you! 
          The underlying mood categories and recommendations remain the same - only the display changes.
        </p>
      </div>
    </div>
  )
}
