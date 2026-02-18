import React, { useState, useRef } from 'react';
import { useCustomisation, useCustomisationActions, Theme, BackgroundMode, AnimationLevel, Density, LightingMode, BoxShape, ComponentStyle, FontFamily, FontSize, SoundTheme, AnimationStyle } from './customisationStore';

export const CustomisationPage: React.FC = () => {
  const globalSettings = useCustomisation();
  const { setGlobalSettings } = useCustomisationActions();
  
  // Tab state
  const [activeTab, setActiveTab] = useState('global');
  
  const tabs = [
    { id: 'global', label: '🌍 Global Settings', icon: '🌍' },
    { id: 'pages', label: '📄 Page Specific', icon: '📄' },
    { id: 'presets', label: '🎮 Gaming Presets', icon: '🎮' },
    { id: 'themes', label: '🎨 Themes & Backgrounds', icon: '🎨' },
    { id: 'advanced', label: '🔧 Advanced', icon: '🔧' },
  ];

  // Handlers (simplified for brevity)
  const handleFontFamilyChange = (fontFamily: FontFamily) => setGlobalSettings({ fontFamily });
  const handleFontSizeChange = (fontSize: FontSize) => setGlobalSettings({ fontSize });
  const handleFontWeightChange = (value: number) => setGlobalSettings({ fontWeight: value });
  const handleAnimationStyleChange = (style: AnimationStyle) => setGlobalSettings({ animationStyle: style });
  const handleHoverEffectsToggle = (enabled: boolean) => setGlobalSettings({ hoverEffects: enabled });
  const handleLoadingAnimationsToggle = (enabled: boolean) => setGlobalSettings({ loadingAnimations: enabled });
  const handleSoundThemeChange = (theme: SoundTheme) => setGlobalSettings({ soundTheme: theme });
  const handleSoundEnabledToggle = (enabled: boolean) => setGlobalSettings({ soundEnabled: enabled });
  const handleVolumeChange = (value: number) => setGlobalSettings({ volume: value });
  const handleThemeChange = (theme: Theme) => setGlobalSettings({ theme });
  const handleBackgroundModeChange = (mode: BackgroundMode) => setGlobalSettings({ backgroundMode: mode });
  const handleAccentColorChange = (color: string) => setGlobalSettings({ accentColor: color });
  const handleBoxShapeChange = (shape: BoxShape) => setGlobalSettings({ defaultBoxShape: shape });
  const handleComponentStyleChange = (style: ComponentStyle) => setGlobalSettings({ defaultComponentStyle: style });
  const handleBorderRadiusChange = (value: number) => setGlobalSettings({ borderRadius: value });
  const handleBorderWidthChange = (value: number) => setGlobalSettings({ borderWidth: value });
  const handleShadowIntensityChange = (value: number) => setGlobalSettings({ shadowIntensity: value });
  const handleGlassOpacityChange = (value: number) => setGlobalSettings({ glassOpacity: value });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gaming-dark via-gray-900 to-gaming-darker">
      <div className="container mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-gaming-primary to-gaming-secondary bg-clip-text text-transparent">Customisation</h1>
              <p className="text-gray-400 text-lg">Personalise your GamePilot experience</p>
            </div>
            
            {/* Page Editor Button */}
            <button
              onClick={() => alert('Page editor coming soon! This will allow you to customize the customisation page layout itself.')}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium flex items-center gap-2 shadow-lg"
              title="Edit page layout"
              aria-label="Edit page layout"
            >
              <span>🎨</span>
              <span>Edit Page</span>
            </button>
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
              title={`Switch to ${tab.label} tab`}
              aria-label={`Switch to ${tab.label} tab`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Global Settings Tab */}
          {activeTab === 'global' && (
            <>
              {/* Typography Section */}
              <div className="glass-morphism rounded-xl p-6 border border-white/10 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1 h-6 bg-gradient-to-b from-gaming-primary to-gaming-secondary rounded-full"></div>
                  <h2 className="text-xl font-semibold text-white">Typography</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Font Family</h3>
                    <div className="space-y-2">
                      {(['inter', 'jetbrains-mono', 'space-mono', 'roboto', 'open-sans', 'poppins'] as FontFamily[]).map((font) => (
                        <button
                          key={font}
                          onClick={() => handleFontFamilyChange(font)}
                          className={`w-full p-3 rounded-lg border-2 transition-all duration-300 text-left hover:scale-[1.02] ${
                            globalSettings.fontFamily === font
                              ? 'border-gaming-primary bg-gaming-primary/20 shadow-lg shadow-gaming-primary/30'
                              : 'border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-700/50'
                          }`}
                          title={`Set font family to ${font}`}
                          aria-label={`Set font family to ${font}`}
                        >
                          <span className="text-white capitalize" style={{ fontFamily: font === 'jetbrains-mono' ? 'monospace' : font === 'space-mono' ? 'monospace' : 'sans-serif' }}>
                            {font.replace('-', ' ')}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Font Size</h3>
                    <div className="space-y-2">
                      {(['xs', 'sm', 'base', 'lg', 'xl', '2xl'] as FontSize[]).map((size) => (
                        <button
                          key={size}
                          onClick={() => handleFontSizeChange(size)}
                          className={`w-full p-3 rounded-lg border-2 transition-all duration-300 text-left hover:scale-[1.02] ${
                            globalSettings.fontSize === size
                              ? 'border-gaming-primary bg-gaming-primary/20 shadow-lg shadow-gaming-primary/30'
                              : 'border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-700/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-white capitalize">{size}</span>
                            <span className="text-gray-400 text-xs">
                              {size === 'xs' ? '12px' : size === 'sm' ? '14px' : size === 'base' ? '16px' : size === 'lg' ? '18px' : size === 'xl' ? '20px' : '24px'}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Font Weight</h3>
                    <div className="space-y-4">
                      <input
                        type="range"
                        min="100"
                        max="900"
                        step="100"
                        value={globalSettings.fontWeight}
                        onChange={(e) => handleFontWeightChange(Number(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-center text-gray-400 text-sm">{globalSettings.fontWeight}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Animations Section */}
              <div className="glass-morphism rounded-xl p-6 border border-white/10 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1 h-6 bg-gradient-to-b from-gaming-primary to-gaming-secondary rounded-full"></div>
                  <h2 className="text-xl font-semibold text-white">Enhanced Animations</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Animation Style</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {(['smooth', 'bounce', 'slide', 'fade', 'glow'] as AnimationStyle[]).map((style) => (
                        <button
                          key={style}
                          onClick={() => handleAnimationStyleChange(style)}
                          className={`p-3 rounded-lg border-2 transition-all duration-300 hover:scale-[1.02] ${
                            globalSettings.animationStyle === style
                              ? 'border-gaming-primary bg-gaming-primary/20 shadow-lg shadow-gaming-primary/30'
                              : 'border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-700/50'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <div className={`w-4 h-4 ${
                              style === 'smooth' ? 'rounded-full bg-gaming-primary/20' :
                              style === 'bounce' ? 'rounded-full bg-gaming-primary/40 animate-bounce' :
                              style === 'slide' ? 'rounded bg-gaming-primary/20' :
                              style === 'fade' ? 'rounded bg-gaming-primary/10' :
                              'rounded-full bg-gaming-primary/30 shadow-lg shadow-gaming-primary/50'
                            }`}></div>
                            <span className="text-xs text-white capitalize">{style}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Animation Effects</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                        <div>
                          <p className="text-white font-medium">Hover Effects</p>
                          <p className="text-gray-400 text-sm">Interactive hover animations</p>
                        </div>
                        <button
                          onClick={() => handleHoverEffectsToggle(!globalSettings.hoverEffects)}
                          className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                            globalSettings.hoverEffects ? 'bg-gaming-primary' : 'bg-gray-600'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                            globalSettings.hoverEffects ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                        <div>
                          <p className="text-white font-medium">Loading Animations</p>
                          <p className="text-gray-400 text-sm">Spinners and loading effects</p>
                        </div>
                        <button
                          onClick={() => handleLoadingAnimationsToggle(!globalSettings.loadingAnimations)}
                          className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                            globalSettings.loadingAnimations ? 'bg-gaming-primary' : 'bg-gray-600'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                            globalSettings.loadingAnimations ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sound Themes Section */}
              <div className="glass-morphism rounded-xl p-6 border border-white/10 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1 h-6 bg-gradient-to-b from-gaming-primary to-gaming-secondary rounded-full"></div>
                  <h2 className="text-xl font-semibold text-white">Sound Themes</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Sound Theme</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {(['cyberpunk', 'retro', 'minimal', 'epic', 'nature'] as SoundTheme[]).map((theme) => (
                        <button
                          key={theme}
                          onClick={() => handleSoundThemeChange(theme)}
                          className={`p-3 rounded-lg border-2 transition-all duration-300 hover:scale-[1.02] ${
                            globalSettings.soundTheme === theme
                              ? 'border-gaming-primary bg-gaming-primary/20 shadow-lg shadow-gaming-primary/30'
                              : 'border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-700/50'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <div className={`w-4 h-4 rounded-full ${
                              theme === 'cyberpunk' ? 'bg-pink-500' :
                              theme === 'retro' ? 'bg-amber-500' :
                              theme === 'minimal' ? 'bg-gray-500' :
                              theme === 'epic' ? 'bg-purple-500' :
                              'bg-green-500'
                            }`}></div>
                            <span className="text-xs text-white capitalize">{theme}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Sound Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                        <div>
                          <p className="text-white font-medium">Enable Sounds</p>
                          <p className="text-gray-400 text-sm">UI interaction sounds</p>
                        </div>
                        <button
                          onClick={() => handleSoundEnabledToggle(!globalSettings.soundEnabled)}
                          className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                            globalSettings.soundEnabled ? 'bg-gaming-primary' : 'bg-gray-600'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                            globalSettings.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </div>
                      
                      <div>
                        <label className="text-white text-sm font-medium mb-2 block">Volume</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={globalSettings.volume}
                          onChange={(e) => handleVolumeChange(Number(e.target.value))}
                          className="w-full"
                        />
                        <div className="text-center text-gray-400 text-xs mt-1">{globalSettings.volume}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Gaming Presets Tab */}
          {activeTab === 'presets' && (
            <div className="glass-morphism rounded-xl p-6 border border-white/10 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-6 bg-gradient-to-b from-gaming-primary to-gaming-secondary rounded-full"></div>
                <h2 className="text-xl font-semibold text-white">Gaming Presets</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => {
                    setGlobalSettings({
                      accentColor: '#ec4899',
                      backgroundMode: 'gradient',
                      animationLevel: 'high',
                      lightingMode: 'mood',
                      animationStyle: 'glow',
                      hoverEffects: true,
                      soundTheme: 'cyberpunk'
                    });
                  }}
                  className="p-4 rounded-lg border-2 transition-all duration-300 hover:scale-[1.02] border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-700/50"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
                    <span className="text-white font-medium">Cyberpunk</span>
                    <span className="text-gray-400 text-xs">Neon pink & purple</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setGlobalSettings({
                      accentColor: '#f59e0b',
                      backgroundMode: 'solid',
                      animationLevel: 'low',
                      lightingMode: 'none',
                      animationStyle: 'bounce',
                      hoverEffects: false,
                      soundTheme: 'retro'
                    });
                  }}
                  className="p-4 rounded-lg border-2 transition-all duration-300 hover:scale-[1.02] border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-700/50"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></div>
                    <span className="text-white font-medium">Retro</span>
                    <span className="text-gray-400 text-xs">Classic amber tones</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setGlobalSettings({
                      accentColor: '#6b7280',
                      backgroundMode: 'solid',
                      animationLevel: 'low',
                      lightingMode: 'none',
                      animationStyle: 'smooth',
                      hoverEffects: false,
                      soundTheme: 'minimal'
                    });
                  }}
                  className="p-4 rounded-lg border-2 transition-all duration-300 hover:scale-[1.02] border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-700/50"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full"></div>
                    <span className="text-white font-medium">Minimal</span>
                    <span className="text-gray-400 text-xs">Clean & simple</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setGlobalSettings({
                      accentColor: '#10b981',
                      backgroundMode: 'gradient',
                      animationLevel: 'medium',
                      lightingMode: 'mood',
                      animationStyle: 'fade',
                      hoverEffects: true,
                      soundTheme: 'nature'
                    });
                  }}
                  className="p-4 rounded-lg border-2 transition-all duration-300 hover:scale-[1.02] border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-700/50"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"></div>
                    <span className="text-white font-medium">Nature</span>
                    <span className="text-gray-400 text-xs">Calming greens</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Page Specific Tab */}
          {activeTab === 'pages' && (
            <div className="glass-morphism rounded-xl p-6 border border-white/10 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-6 bg-gradient-to-b from-gaming-primary to-gaming-secondary rounded-full"></div>
                <h2 className="text-xl font-semibold text-white">Page-Specific Overrides</h2>
              </div>
              
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">📄</div>
                <p className="text-xl text-white mb-2">Page-Specific Customisation</p>
                <p className="text-gray-400">Override global settings for specific pages</p>
                <p className="text-gray-500 text-sm mt-4">This feature allows you to customize individual pages differently from your global settings.</p>
              </div>
            </div>
          )}

          {/* Themes & Backgrounds Tab */}
          {activeTab === 'themes' && (
            <div className="glass-morphism rounded-xl p-6 border border-white/10 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-6 bg-gradient-to-b from-gaming-primary to-gaming-secondary rounded-full"></div>
                <h2 className="text-xl font-semibold text-white">Themes & Backgrounds</h2>
              </div>
              
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">🎨</div>
                <p className="text-xl text-white mb-2">Theme & Background Settings</p>
                <p className="text-gray-400">Theme selection and background customization</p>
                <p className="text-gray-500 text-sm mt-4">Choose your theme and customize backgrounds with images or colors.</p>
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className="glass-morphism rounded-xl p-6 border border-white/10 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-6 bg-gradient-to-b from-gaming-primary to-gaming-secondary rounded-full"></div>
                <h2 className="text-xl font-semibold text-white">Advanced Settings</h2>
              </div>
              
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">🔧</div>
                <p className="text-xl text-white mb-2">Advanced Customisation</p>
                <p className="text-gray-400">Fine-tune borders, shadows, opacity, and shapes</p>
                <p className="text-gray-500 text-sm mt-4">Advanced controls for precise customization of UI elements.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
