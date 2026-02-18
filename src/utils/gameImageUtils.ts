/**
 * High-Quality Game Image Utility
 * Provides Steam official game images with smart fallbacks
 */

export function getHighQualityGameImage(game: any, size: 'square' | 'portrait' | 'landscape' | '616x353' | '800x800' | '1200x900' = '616x353'): string {
  // Map size names to actual dimensions
  const sizeMap = {
    'square': '800x800',
    'portrait': '600x900', 
    'landscape': '1200x900',
    '616x353': '616x353',
    '800x800': '800x800',
    '1200x900': '1200x900'
  };
  
  const dimensions = sizeMap[size] || sizeMap['616x353'];
  
  const sources = [
    // Try Steam's official game images first (highest quality)
    `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appId || game.id}/capsule_616x353.jpg`,
    `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appId || game.id}/header.jpg`,
    `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appId || game.id}/library_600x900.jpg`,
    // Then fallback to game data properties
    game.coverImage,
    game.headerImage,
    game.imageUrl,
    game.steamHeaderImage,
    game.steamCapsuleImage,
    (game as any).capsuleImage,
    (game as any).headerImage,
    (game as any).smallHeaderImage,
    // Finally fallback to high-quality placeholder with correct dimensions
    `https://picsum.photos/seed/${game.title.replace(/\s+/g, '-')}-${game.id}/${dimensions}.jpg`
  ].filter(Boolean);
  
  return sources[0] || `https://picsum.photos/seed/${game.title.replace(/\s+/g, '-')}-${game.id}/${dimensions}.jpg`;
}

export function getHighQualityGameImageSources(game: any): string[] {
  return [
    // Try Steam's official game images first (highest quality)
    `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appId || game.id}/capsule_616x353.jpg`,
    `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appId || game.id}/header.jpg`,
    `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appId || game.id}/library_600x900.jpg`,
    // Then fallback to game data properties
    game.coverImage,
    game.headerImage,
    game.imageUrl,
    game.steamHeaderImage,
    game.steamCapsuleImage,
    (game as any).capsuleImage,
    (game as any).headerImage,
    (game as any).smallHeaderImage,
    // Finally fallback to high-quality placeholder
    `https://picsum.photos/seed/${game.title.replace(/\s+/g, '-')}-${game.id}/616x353.jpg`
  ].filter(Boolean);
}
