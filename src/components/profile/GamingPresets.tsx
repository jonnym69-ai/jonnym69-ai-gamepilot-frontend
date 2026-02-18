import React, { useState } from 'react'
import { useProfileStore } from '../../stores/profileStore'
import { useCustomisationStore } from '../../features/customisation/customisationStore'
import { GAMING_PRESETS, getUnlockedPresets } from '../../constants/presets'

export const GamingPresets: React.FC = () => {
  const { profile, stats } = useProfileStore()
  const customisationStore = useCustomisationStore()
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  
  const unlockedPresets = getUnlockedPresets(stats)
  const allPresets = GAMING_PRESETS

  const handlePresetApply = (presetId: string) => {
    const preset = allPresets.find(p => p.id === presetId)
    if (!preset) return
    
    customisationStore.setGlobalSettings({
      theme: preset.theme,
      accentColor: preset.accentColor,
      animationLevel: preset.animationLevel,
      soundTheme: preset.soundTheme,
      backgroundMode: preset.backgroundMode,
      defaultComponentStyle: preset.componentStyle
    })
    
    setSelectedPreset(presetId)
    
    // Auto-hide selection after 2 seconds
    setTimeout(() => setSelectedPreset(null), 2000)
  }

  const isPresetSelected = (presetId: string) => {
    const preset = allPresets.find(p => p.id === presetId)
    if (!preset) return false
    
    // Check if current settings match the preset
    const globalSettings = customisationStore.global
    return (
      globalSettings.theme === preset.theme &&
      globalSettings.accentColor === preset.accentColor &&
      globalSettings.animationLevel === preset.animationLevel &&
      globalSettings.soundTheme === preset.soundTheme &&
      globalSettings.backgroundMode === preset.backgroundMode &&
      globalSettings.defaultComponentStyle === preset.componentStyle
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gaming-text">Gaming Presets</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gaming-text-muted">
            {unlockedPresets.length}/{allPresets.length} Unlocked
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allPresets.map((preset) => {
          const isUnlocked = unlockedPresets.includes(preset)
          const isSelected = isPresetSelected(preset.id)
          const isCurrentlySelected = selectedPreset === preset.id
          
          return (
            <div
              key={preset.id}
              className={`relative p-4 bg-gaming-surface border rounded-lg transition-all cursor-pointer ${
                isUnlocked 
                  ? 'border-gaming-border hover:border-gaming-primary hover:shadow-lg hover:shadow-gaming-primary/20'
                  : 'border-gray-700 opacity-50'
              } ${isSelected ? 'ring-2 ring-gaming-primary' : ''} ${isCurrentlySelected ? 'animate-pulse' : ''}`}
              onClick={() => isUnlocked && handlePresetApply(preset.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{preset.icon}</span>
                  <div>
                    <h4 className="font-medium text-gaming-text">{preset.name}</h4>
                    {preset.isDefault && (
                      <span className="text-xs text-gaming-primary">Default</span>
                    )}
                  </div>
                </div>
                
                {isUnlocked && (
                  <button
                    className={`px-2 py-1 rounded text-xs transition-all ${
                      isSelected
                        ? 'bg-gaming-primary text-white'
                        : 'bg-gaming-surface text-gaming-text hover:bg-gaming-surface/80'
                    }`}
                  >
                    {isSelected ? 'Active' : 'Apply'}
                  </button>
                )}
              </div>

              <p className="text-sm text-gaming-text-muted mb-3">
                {preset.description}
              </p>

              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 bg-gaming-surface rounded text-gaming-text">
                  {preset.theme}
                </span>
                <span className="text-xs px-2 py-1 bg-gaming-surface rounded text-gaming-text">
                  {preset.animationLevel}
                </span>
                <span className="text-xs px-2 py-1 bg-gaming-surface rounded text-gaming-text">
                  {preset.soundTheme}
                </span>
              </div>

              {!isUnlocked && preset.unlockRequirement && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg">
                  <div className="text-center p-4">
                    <span className="text-2xl mb-2">🔒</span>
                    <p className="text-white font-medium">Locked</p>
                    <p className="text-xs text-gray-300 mt-1">
                      {preset.unlockRequirement.type === 'hours' && `Play ${preset.unlockRequirement.value} hours`}
                      {preset.unlockRequirement.type === 'games' && `Complete ${preset.unlockRequirement.value} games`}
                      {preset.unlockRequirement.type === 'mood' && `Love ${preset.unlockRequirement.value} mood`}
                    </p>
                  </div>
                </div>
              )}

              {isCurrentlySelected && (
                <div className="absolute top-2 right-2">
                  <span className="w-3 h-3 bg-gaming-primary rounded-full animate-ping"></span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="p-3 bg-gaming-surface/50 border border-gaming-border rounded-lg">
        <p className="text-sm text-gaming-text-muted">
          💡 <strong>Tip:</strong> Gaming presets instantly change your entire GamePilot experience! 
          Unlock more presets by playing games and discovering your favorite moods.
        </p>
      </div>
    </div>
  )
}
