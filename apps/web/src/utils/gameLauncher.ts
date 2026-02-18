import type { Game } from '@gamepilot/types'
import { PlatformCode } from '@gamepilot/types'

export function launchGame(game: Game): void {
  // Try appId first (Steam games), then launcherId
  const gameId = game.appId || game.launcherId;
  
  if (!gameId) {
    showTooltip('No game ID set (appId or launcherId)')
    return
  }

  if (!game.platforms || game.platforms.length === 0) {
    showTooltip('No platforms configured')
    return
  }

  // Try to launch on the first available platform
  const platform = game.platforms[0]
  const url = generateLauncherUrl(platform.code, String(gameId));
  
  if (url) {
    // Show success message before launching
    showTooltip(`Launching ${game.title} on ${platform.name}...`);
    
    // Simple window.location.href - just let it work
    window.location.href = url;
  } else {
    showTooltip(`Unsupported platform: ${platform.name}`)
  }
}

export function generateLauncherUrl(platform: PlatformCode, launcherId: string): string | null {
  switch (platform) {
    case PlatformCode.STEAM:
      return `steam://rungameid/${launcherId}` 
    
    case PlatformCode.EPIC:
      return `com.epicgames.launcher://apps/${launcherId}?action=launch` 
    
    case PlatformCode.GOG:
      return `goggalaxy://openGame/${launcherId}` 
    
    case PlatformCode.XBOX:
      return `xbox://launch/${launcherId}` 
    
    case PlatformCode.PLAYSTATION:
      return `psn://launch/${launcherId}`
    
    case PlatformCode.NINTENDO:
      return `nintendo://launch/${launcherId}`
    
    default:
      console.warn(`Unsupported platform for launching: ${platform}`)
      return null
  }
}

const showTooltip = (message: string) => {
  console.log(' Game Launcher:', message);
  
  // Create a simple toast notification
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-weight: bold;
    font-size: 14px;
    z-index: 9999;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    animation: slideIn 0.3s ease-out;
  `;
  
  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(toast);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 3000);
};

export function getLauncherIcon(platform: PlatformCode): string {
  switch (platform) {
    case PlatformCode.STEAM:
      return '🎮'
    case PlatformCode.EPIC:
      return '🚀'
    case PlatformCode.GOG:
      return '🎯'
    case PlatformCode.XBOX:
      return '🎪'
    case PlatformCode.PLAYSTATION:
      return '🎯'
    case PlatformCode.NINTENDO:
      return '🎮'
    default:
      return '🎮'
  }
}

export function getPlatformName(platform: PlatformCode): string {
  switch (platform) {
    case PlatformCode.STEAM:
      return 'Steam'
    case PlatformCode.EPIC:
      return 'Epic Games'
    case PlatformCode.GOG:
      return 'GOG'
    case PlatformCode.XBOX:
      return 'Xbox'
    case PlatformCode.PLAYSTATION:
      return 'PlayStation'
    case PlatformCode.NINTENDO:
      return 'Nintendo'
    default:
      return 'Unknown Platform'
  }
}
