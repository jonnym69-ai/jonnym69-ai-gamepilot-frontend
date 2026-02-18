import React, { useState } from 'react';
import { useCustomisation, useCustomisationActions, BackgroundMode, AnimationLevel, Density, LightingMode } from './customisationStore';

interface EditModePanelProps {
  pageId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const EditModePanel: React.FC<EditModePanelProps> = ({ pageId, isOpen, onClose }) => {
  const currentPageSettings = useCustomisation(pageId);
  const { setPageSettings } = useCustomisationActions();
  
  // Local state for form inputs
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [customColor, setCustomColor] = useState(currentPageSettings.accentColor || '#3b82f6');

  const handleBackgroundModeChange = (mode: BackgroundMode) => {
    setPageSettings(pageId, { backgroundMode: mode });
  };

  const handleBackgroundImageSubmit = () => {
    if (tempImageUrl.trim()) {
      setPageSettings(pageId, { backgroundImageUrl: tempImageUrl.trim() });
      setTempImageUrl('');
    }
  };

  const handleAccentColorChange = (color: string) => {
    setCustomColor(color);
    setPageSettings(pageId, { accentColor: color });
  };

  const handleAnimationLevelChange = (level: AnimationLevel) => {
    setPageSettings(pageId, { animationLevel: level });
  };

  const handleDensityChange = (density: Density) => {
    setPageSettings(pageId, { density });
  };

  const handleLightingModeChange = (mode: LightingMode) => {
    setPageSettings(pageId, { lightingMode: mode });
  };

  const handleReset = () => {
    // Reset to global settings by clearing page overrides
    const { resetPageSettings } = useCustomisationActions();
    resetPageSettings(pageId);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Enhanced Side Panel */}
      <div className="fixed right-0 top-0 h-full w-96 bg-gray-900/95 backdrop-blur-md border-l border-white/10 z-50 overflow-y-auto shadow-2xl">
        <div className="p-6">
          {/* Enhanced Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-gaming-primary to-gaming-secondary rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">✨</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Customise Page</h3>
                <p className="text-xs text-gray-400">{pageId}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 hover:text-white transition-all duration-200"
              title="Close customisation panel"
              aria-label="Close customisation panel"
            >
              <span className="text-lg">×</span>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="text-center p-2 bg-gray-800/50 rounded-lg border border-white/5">
              <div className="text-xs text-gray-400">Theme</div>
              <div className="text-sm text-white capitalize">{currentPageSettings.backgroundMode || 'gradient'}</div>
            </div>
            <div className="text-center p-2 bg-gray-800/50 rounded-lg border border-white/5">
              <div className="text-xs text-gray-400">Density</div>
              <div className="text-sm text-white capitalize">{currentPageSettings.density || 'comfortable'}</div>
            </div>
            <div className="text-center p-2 bg-gray-800/50 rounded-lg border border-white/5">
              <div className="text-xs text-gray-400">Effects</div>
              <div className="text-sm text-white capitalize">{currentPageSettings.lightingMode || 'none'}</div>
            </div>
          </div>

          {/* Background Mode */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
              <h4 className="text-sm font-medium text-white">Background Theme</h4>
            </div>
            <div className="mb-3 p-3 bg-gray-800/50 rounded-lg border border-white/5">
              <p className="text-xs text-gray-400">Current: <span className="text-gaming-accent capitalize font-medium">{currentPageSettings.backgroundMode || 'gradient'}</span></p>
              <p className="text-xs text-gray-500 mt-2">
                {currentPageSettings.backgroundMode === 'solid' ? '🎨 Clean solid color background for minimal distraction' :
                 currentPageSettings.backgroundMode === 'gradient' ? '🌅 Beautiful static gradient background' :
                 '🖼️ Custom image background for personalization'}
              </p>
            </div>
            <div className="space-y-2">
              {(['solid', 'gradient', 'image'] as BackgroundMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => handleBackgroundModeChange(mode)}
                  className={`w-full p-3 rounded-lg border-2 transition-all duration-300 text-left ${
                    currentPageSettings.backgroundMode === mode
                      ? 'border-gaming-primary bg-gaming-primary/20 shadow-lg'
                      : 'border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${
                        mode === 'solid' ? 'bg-gray-600' : 
                        mode === 'gradient' ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 
                        'bg-gray-600'
                      }`} />
                      <div>
                        <span className="text-white text-sm capitalize font-medium">{mode}</span>
                        <div className="text-xs text-gray-400">
                          {mode === 'solid' ? 'Minimal & clean' : 
                           mode === 'gradient' ? 'Elegant & modern' : 
                           'Personal & unique'}
                        </div>
                      </div>
                    </div>
                    {currentPageSettings.backgroundMode === mode && (
                      <div className="w-5 h-5 bg-gaming-primary rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Background Image */}
          {currentPageSettings.backgroundMode === 'image' && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-white mb-3">Background Image</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  value={tempImageUrl}
                  onChange={(e) => setTempImageUrl(e.target.value)}
                  placeholder="Enter image URL..."
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm focus:border-gaming-primary focus:outline-none focus:ring-2 focus:ring-gaming-primary/20 transition-all duration-300"
                  aria-label="Enter background image URL"
                />
                <button
                  onClick={handleBackgroundImageSubmit}
                  className="w-full px-4 py-3 bg-gaming-primary text-white rounded-lg hover:bg-gaming-primary/80 transition-all duration-300 text-sm hover:scale-[1.02] shadow-lg shadow-gaming-primary/30"
                >
                  Set Image
                </button>
                {currentPageSettings.backgroundImageUrl && (
                  <div className="p-3 bg-gray-800/50 rounded-lg border border-white/5">
                    <p className="text-gray-400 text-xs truncate">{currentPageSettings.backgroundImageUrl}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Accent Color */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: currentPageSettings.accentColor || '#3b82f6' }}></div>
              <h4 className="text-sm font-medium text-white">Accent Color</h4>
            </div>
            <div className="mb-3 p-3 bg-gray-800/50 rounded-lg border border-white/5">
              <p className="text-xs text-gray-400">Current: <span className="text-gaming-accent font-medium">{currentPageSettings.accentColor || '#3b82f6'}</span></p>
              <p className="text-xs text-gray-500 mt-2">🎨 Choose the primary accent color for buttons, links, and highlights</p>
            </div>
            
            {/* Preset Colors */}
            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-2">Quick Presets</p>
              <div className="grid grid-cols-8 gap-2">
                {[
                  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b',
                  '#ef4444', '#ec4899', '#06b6d4', '#84cc16',
                  '#f97316', '#a855f7', '#14b8a6', '#eab308',
                  '#dc2626', '#db2777', '#0891b2', '#65a30d'
                ].map((color) => (
                  <button
                    key={color}
                    onClick={() => handleAccentColorChange(color)}
                    className={`w-full aspect-square rounded-lg border-2 transition-all duration-300 ${
                      currentPageSettings.accentColor === color
                        ? 'border-white scale-110 shadow-lg'
                        : 'border-gray-600 hover:border-gray-500 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    title={`Select ${color} as accent color`}
                    aria-label={`Select ${color} as accent color`}
                  />
                ))}
              </div>
            </div>
            
            {/* Custom Color Picker */}
            <div className="space-y-2">
              <p className="text-xs text-gray-400">Custom Color</p>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => handleAccentColorChange(e.target.value)}
                  className="w-16 h-10 bg-gray-800/50 border border-gray-600 rounded-lg cursor-pointer transition-all duration-300 hover:border-gaming-primary"
                  title="Choose custom accent color"
                  aria-label="Choose custom accent color"
                />
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => handleAccentColorChange(e.target.value)}
                  placeholder="#3b82f6"
                  className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white text-sm focus:border-gaming-primary focus:outline-none transition-all duration-300"
                  title="Enter hex color code"
                  aria-label="Enter hex color code"
                />
                <button
                  onClick={() => handleAccentColorChange(customColor)}
                  className="px-4 py-2 bg-gaming-primary text-white rounded-lg hover:bg-gaming-primary/80 transition-all duration-300 text-sm"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* Animation Level */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-white mb-3">Animation Level</h4>
            <div className="mb-3 p-3 bg-gray-800/50 rounded-lg border border-white/5">
              <p className="text-xs text-gray-400">Current: <span className="text-gaming-accent capitalize">{currentPageSettings.animationLevel || 'medium'}</span></p>
              <p className="text-xs text-gray-500 mt-1">
                {currentPageSettings.animationLevel === 'low' ? '• Minimal UI animations, no background effects' :
                 currentPageSettings.animationLevel === 'medium' ? '• Balanced UI animations, no background effects' :
                 '• Enhanced UI animations, no background effects'}
              </p>
            </div>
            <div className="space-y-2">
              {(['low', 'medium', 'high'] as AnimationLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => handleAnimationLevelChange(level)}
                  className={`w-full p-3 rounded-lg border-2 transition-all duration-300 text-left hover:scale-[1.02] ${
                    currentPageSettings.animationLevel === level
                      ? 'border-gaming-primary bg-gaming-primary/20 shadow-lg shadow-gaming-primary/30'
                      : 'border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm capitalize">{level}</span>
                    <span className="text-gray-400 text-xs">
                      {level === 'low' ? 'Minimal' : level === 'medium' ? 'Balanced' : 'Full'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Density */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-4 h-4 bg-gray-600 rounded"></div>
              <h4 className="text-sm font-medium text-white">Layout Density</h4>
            </div>
            <div className="mb-3 p-3 bg-gray-800/50 rounded-lg border border-white/5">
              <p className="text-xs text-gray-400">Current: <span className="text-gaming-accent capitalize font-medium">{currentPageSettings.density || 'comfortable'}</span></p>
              <p className="text-xs text-gray-500 mt-2">
                {currentPageSettings.density === 'compact' ? '📱 Tighter spacing, more content visible' :
                 '☁️ Comfortable spacing for better readability'}
              </p>
            </div>
            <div className="space-y-2">
              {(['compact', 'comfortable'] as Density[]).map((density) => (
                <button
                  key={density}
                  onClick={() => handleDensityChange(density)}
                  className={`w-full p-3 rounded-lg border-2 transition-all duration-300 text-left ${
                    currentPageSettings.density === density
                      ? 'border-gaming-primary bg-gaming-primary/20 shadow-lg'
                      : 'border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded ${
                        density === 'compact' ? 'bg-gray-700' : 'bg-gray-600'
                      }`} />
                      <div>
                        <span className="text-white text-sm capitalize font-medium">{density}</span>
                        <div className="text-xs text-gray-400">
                          {density === 'compact' ? 'More content, less space' : 'Balanced layout'}
                        </div>
                      </div>
                    </div>
                    {currentPageSettings.density === density && (
                      <div className="w-5 h-5 bg-gaming-primary rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Lighting Mode */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-4 h-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded"></div>
              <h4 className="text-sm font-medium text-white">Lighting Effects</h4>
            </div>
            <div className="mb-3 p-3 bg-gray-800/50 rounded-lg border border-white/5">
              <p className="text-xs text-gray-400">Current: <span className="text-gaming-accent capitalize font-medium">{currentPageSettings.lightingMode || 'none'}</span></p>
              <p className="text-xs text-gray-500 mt-2">
                {currentPageSettings.lightingMode === 'none' ? '🚫 No lighting effects - eye-friendly' :
                 currentPageSettings.lightingMode === 'mood' ? '🎭 Mood-based lighting effects' :
                 '🌈 RGB synchronized lighting'}
              </p>
            </div>
            <div className="space-y-2">
              {(['none', 'mood', 'rgb-sync'] as LightingMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => handleLightingModeChange(mode)}
                  className={`w-full p-3 rounded-lg border-2 transition-all duration-300 text-left ${
                    currentPageSettings.lightingMode === mode
                      ? 'border-gaming-primary bg-gaming-primary/20 shadow-lg'
                      : 'border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${
                        mode === 'none' ? 'bg-gray-600' : 
                        mode === 'mood' ? 'bg-purple-500' : 
                        'bg-gradient-to-r from-red-500 to-green-500'
                      }`} />
                      <div>
                        <span className="text-white text-sm capitalize font-medium">{mode.replace('-', ' ')}</span>
                        <div className="text-xs text-gray-400">
                          {mode === 'none' ? 'Safe & comfortable' : 
                           mode === 'mood' ? 'Dynamic mood lighting' : 
                           'RGB effects'}
                        </div>
                      </div>
                    </div>
                    {currentPageSettings.lightingMode === mode && (
                      <div className="w-5 h-5 bg-gaming-primary rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Actions */}
          <div className="space-y-3 pt-4 border-t border-gray-700">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleReset}
                className="px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-300 text-sm flex items-center justify-center gap-2"
              >
                <span>↺</span>
                Reset
              </button>
              <button
                onClick={() => {
                  // Save current settings as global defaults
                  const { setGlobalSettings } = useCustomisationActions();
                  setGlobalSettings(currentPageSettings);
                }}
                className="px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-300 text-sm flex items-center justify-center gap-2"
              >
                <span>★</span>
                Save as Default
              </button>
            </div>
            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-gradient-to-r from-gaming-primary to-gaming-secondary text-white rounded-lg hover:opacity-90 transition-all duration-300 text-sm font-medium shadow-lg flex items-center justify-center gap-2"
            >
              <span>✓</span>
              Done - Apply Changes
            </button>
          </div>
          
          {/* Help Section */}
          <div className="mt-4 p-3 bg-gray-800/30 rounded-lg border border-gray-700">
            <p className="text-xs text-gray-400 mb-2">💡 <strong>Tip:</strong> Changes are applied instantly. Use "Save as Default" to make these settings apply to all pages.</p>
          </div>
        </div>
      </div>
    </>
  );
};
