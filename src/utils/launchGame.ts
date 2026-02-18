/**
 * Enhanced game launcher supporting multiple platforms with better error handling
 * @param appId - The game ID to launch
 * @param platform - Optional platform override (steam, epic, etc.)
 */
export function launchGame(appId: number, platform?: string): void {
  if (!appId || typeof appId !== 'number' || appId <= 0) {
    console.warn('Invalid appId provided for game launch:', appId);
    return;
  }

  // Changed variable name to targetPlatform to avoid "already declared" error
  const targetPlatform = platform?.toLowerCase() || 'steam';
  
  try {
    let launchUrl: string;
    
    switch (targetPlatform) {
      case 'steam':
        launchUrl = `steam://run/${appId}`;
        break;
      case 'epic':
        launchUrl = `com.epicgames://launch/app/${appId}`;
        break;
      case 'xbox':
        launchUrl = `xbox://${appId}`;
        break;
      case 'playstation':
        launchUrl = `playstation://${appId}`;
        break;
      default:
        launchUrl = `steam://run/${appId}`; // fallback to Steam
        break;
    }

    // Create a temporary notification element for better UX
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300';
    notification.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-2xl">🎮</span>
        <span class="font-bold">Launching ${targetPlatform} game...</span>
      </div>
    `;
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);

    // Platform-specific launch methods
    switch (targetPlatform) {
      case 'steam':
        if (typeof window !== 'undefined' && (window as any).steam) {
          (window as any).steam.openGame(appId.toString());
        } else {
          window.location.href = launchUrl;
        }
        break;
        
      case 'epic':
        if (typeof window !== 'undefined' && window.open) {
          window.open(launchUrl, '_blank');
        } else {
          window.location.href = launchUrl;
        }
        break;
        
      case 'xbox':
        if (typeof window !== 'undefined' && (window as any).xbox) {
          console.warn('Xbox launch not implemented');
        } else {
          window.location.href = `xbox://${appId}`;
        }
        break;
        
      case 'playstation':
        if (typeof window !== 'undefined' && (window as any).playstation) {
          console.warn('PlayStation launch not implemented');
        } else {
          window.location.href = `playstation://${appId}`;
        }
        break;
        
      default:
        window.location.href = launchUrl;
        break;
    }
    
  } catch (error) {
    console.error(`Failed to launch ${targetPlatform} game:`, error);
    
    // Show user-friendly error message
    const errorMessage = `Failed to launch ${targetPlatform} game. Please ensure ${targetPlatform} is installed and available.`;
    if (typeof window !== 'undefined') {
      alert(errorMessage);
    } else {
      console.error(errorMessage);
    }
  }
}