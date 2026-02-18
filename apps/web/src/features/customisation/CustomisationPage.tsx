import React, { useState, useEffect } from 'react';
import { useCustomisation, useCustomisationActions, Theme, BackgroundMode } from './customisationStore';
import { GamingPresets } from '../../components/profile/GamingPresets';
import '../../styles/alternative-themes.css';

export const CustomisationPage: React.FC = () => {
  const globalSettings = useCustomisation();
  const { setGlobalSettings } = useCustomisationActions();
  
  // Tab state
  const [activeTab, setActiveTab] = useState('presets');

  const tabs = [
    { id: 'presets', label: '🎮 Gaming Presets', icon: '🎮' },
    { id: 'themes', label: '🎨 Themes & Colors', icon: '🎨' },
  ];

  // Initialize custom properties on load
  useEffect(() => {
    const root = document.documentElement;

    // Apply current accent color
    if (globalSettings.accentColor) {
      root.style.setProperty('--custom-accent-color', globalSettings.accentColor);
      const rgb = hexToRgb(globalSettings.accentColor);
      if (rgb) {
        root.style.setProperty('--custom-accent-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
      }
    }

    // Apply current background mode
    if (globalSettings.backgroundMode) {
      root.style.setProperty('--custom-bg-mode', globalSettings.backgroundMode);
      // Apply background mode class to body
      document.body.className = document.body.className.replace(/bg-mode-\w+/g, '');
      document.body.classList.add(`bg-mode-${globalSettings.backgroundMode}`);
    }
  }, [globalSettings.accentColor, globalSettings.backgroundMode]);

  // Handlers
  const handleThemeChange = (theme: Theme) => {
    setGlobalSettings({ theme });
    // Apply theme immediately
    const root = document.documentElement;
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.setAttribute('data-theme', systemTheme);
    } else {
      root.setAttribute('data-theme', theme);
    }
  };

  const handleAlternativeThemeChange = (theme: string) => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    setGlobalSettings({ theme: theme as Theme });
  };

  const handleBackgroundModeChange = (mode: BackgroundMode) => {
    setGlobalSettings({ backgroundMode: mode });
    // Apply background mode immediately
    const root = document.documentElement;
    root.style.setProperty('--custom-bg-mode', mode);
    
    // Apply background mode class to body
    document.body.className = document.body.className.replace(/bg-mode-\w+/g, '');
    document.body.classList.add(`bg-mode-${mode}`);
  };

  const handleAccentColorChange = (color: string) => {
    setGlobalSettings({ accentColor: color });
    // Apply accent color immediately to CSS custom properties
    const root = document.documentElement;
    root.style.setProperty('--custom-accent-color', color);

    // Also update RGB values for rgba() usage
    const rgb = hexToRgb(color);
    if (rgb) {
      root.style.setProperty('--custom-accent-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    }
  };

  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gaming-dark via-gray-900 to-gaming-darker">
      <div className="container mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-gaming-primary to-gaming-secondary bg-clip-text text-transparent">Customisation</h1>
              <p className="text-gray-400 text-lg">Personalise your GamePilot themes and gaming presets</p>
              <p className="text-sm text-gray-500 mt-2">💡 Manage your profile and gaming identity in the <a href="/identity" className="text-gaming-primary hover:underline">Identity section</a></p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gaming-primary text-white shadow-lg shadow-gaming-primary/30'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Gaming Presets Tab */}
          {activeTab === 'presets' && (
            <GamingPresets />
          )}

          {/* Themes Tab */}
          {activeTab === 'themes' && (
            <div className="space-y-6">
              <div className="glass-morphism rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1 h-6 bg-gradient-to-b from-gaming-primary to-gaming-secondary rounded-full"></div>
                  <h2 className="text-xl font-semibold text-white">Theme & Colors</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Theme Mode</h3>
                    <div className="space-y-2">
                      {(['dark', 'light', 'system'] as Theme[]).map((theme) => (
                        <button
                          key={theme}
                          onClick={() => handleThemeChange(theme)}
                          className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                            globalSettings.theme === theme
                              ? 'border-gaming-primary bg-gaming-primary/10 text-white'
                              : 'border-gray-600 text-gray-300 hover:border-gray-500'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="capitalize">{theme}</span>
                            {globalSettings.theme === theme && (
                              <span className="text-gaming-primary">✓</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Alternative Themes</h3>
                    <div className="space-y-2">
                      {[
                        { id: 'retro-arcade', name: '🕹️ Retro Arcade', desc: 'Neon colors & 80s vibe' },
                        { id: 'cyberpunk', name: '🌃 Cyberpunk', desc: 'Tech noir & neon glow' },
                        { id: 'nature-gaming', name: '🌲 Nature Gaming', desc: 'Earth tones & organic' },
                        { id: 'solarpunk', name: '☀️ Solarpunk', desc: 'Bright & optimistic' },
                        { id: 'monochrome', name: '⚫ Monochrome', desc: 'Minimalist grayscale' },
                        { id: 'pastel', name: '🎨 Pastel', desc: 'Soft & gentle colors' }
                      ].map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => handleAlternativeThemeChange(theme.id)}
                          className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                            globalSettings.theme === theme.id
                              ? 'border-gaming-primary bg-gaming-primary/10 text-white'
                              : 'border-gray-600 text-gray-300 hover:border-gray-500'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span>{theme.name}</span>
                              {globalSettings.theme === theme.id && (
                                <span className="text-gaming-primary">✓</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">{theme.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Accent Color</h3>
                    <div className="grid grid-cols-4 gap-2">
                      {[
  { color: '#3b82f6', class: 'accent-blue' },
  { color: '#ef4444', class: 'accent-red' },
  { color: '#10b981', class: 'accent-green' },
  { color: '#f59e0b', class: 'accent-amber' },
  { color: '#8b5cf6', class: 'accent-purple' },
  { color: '#ec4899', class: 'accent-pink' },
  { color: '#06b6d4', class: 'accent-cyan' },
  { color: '#84cc16', class: 'accent-lime' }
].map((colorOption) => (
  <button
    key={colorOption.color}
    onClick={() => handleAccentColorChange(colorOption.color)}
    className={`w-full h-12 rounded-lg border-2 transition-all ${
      globalSettings.accentColor === colorOption.color
        ? 'border-white scale-110'
        : 'border-gray-600 hover:border-gray-400'
    } ${colorOption.class}`}
    title={`Select ${colorOption.color} as accent color`}
    aria-label={`Select ${colorOption.color} as accent color`}
  />
))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-morphism rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1 h-6 bg-gradient-to-b from-gaming-primary to-gaming-secondary rounded-full"></div>
                  <h2 className="text-xl font-semibold text-white">Background Style</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['solid', 'gradient'] as BackgroundMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => handleBackgroundModeChange(mode)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        globalSettings.backgroundMode === mode
                          ? 'border-gaming-primary bg-gaming-primary/20'
                          : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                      }`}
                    >
                      <span className="text-white capitalize">{mode}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
