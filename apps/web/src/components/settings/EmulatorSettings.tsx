import React, { useState } from 'react'
import type { EmulatorConfig } from '../../services/emulatorService'

export const EmulatorSettings: React.FC = () => {
  const [emulators, setEmulators] = useState<EmulatorConfig[]>([])

  const handleEmulatorConfig = (config: EmulatorConfig) => {
    setEmulators(prev => {
      const existing = prev.findIndex(e => e.name === config.name && e.platform === config.platform)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = config
        return updated
      }
      return [...prev, config]
    })
  }

  const launchEmulator = async (emulatorName: string, platform: string) => {
    const emulator = emulators.find(e => e.name === emulatorName && e.platform === platform)
    if (emulator && emulator.executablePath) {
      // TODO: Implement emulator launching
      console.log('Launching emulator:', emulator.name, emulator.executablePath)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gaming-text">Emulators</h3>
      
      <div className="space-y-4">
        <div className="p-4 bg-gaming-surface border border-gaming-border rounded-lg">
          <h4 className="font-medium text-gaming-text mb-2">Add Emulator</h4>
          <p className="text-sm text-gaming-text-muted">
            Emulator configuration coming soon. This feature is under development.
          </p>
        </div>
        
        {emulators.map((emulator, index) => (
          <div key={`${emulator.platform}-${emulator.name}-${index}`} className="p-3 bg-gaming-surface border border-gaming-border rounded-lg">
            <h4 className="font-medium text-gaming-text">{emulator.name}</h4>
            <p className="text-sm text-gaming-text-muted">
              Platform: {emulator.platform}
              {emulator.executablePath && ` | Path: ${emulator.executablePath}`}
            </p>
            <button
              onClick={() => launchEmulator(emulator.name, emulator.platform)}
              className="mt-2 px-3 py-1 bg-gaming-primary hover:bg-gaming-primary/80 text-white rounded-lg text-sm"
              disabled={!emulator.executablePath}
            >
              Launch
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
