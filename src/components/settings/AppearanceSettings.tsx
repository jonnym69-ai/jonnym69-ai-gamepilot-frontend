import React, { useState } from 'react'
import { ThemeToggle } from '../ThemeToggle'

export const AppearanceSettings: React.FC = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gaming-text">Appearance</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gaming-text">Dark Mode</span>
          <ThemeToggle />
        </div>
        
        <div className="space-y-2">
          <label className="text-gaming-text">Theme Color</label>
          <select 
            className="w-full p-2 bg-gaming-surface border border-gaming-border rounded-lg text-gaming-text"
            title="Select theme color"
            aria-label="Select theme color"
          >
            <option value="blue">Gaming Blue</option>
            <option value="green">Matrix Green</option>
            <option value="purple">Cyber Purple</option>
            <option value="red">Neon Red</option>
          </select>
        </div>
      </div>
    </div>
  )
}
