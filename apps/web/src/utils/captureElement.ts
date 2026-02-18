/**
 * Simple utility to capture an HTML element as an image
 * Uses native browser APIs without external dependencies
 */

export const captureElementAsImage = async (element: HTMLElement): Promise<Blob> => {
  // Create a canvas element
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get 2D context from canvas');
  }

  // Get the computed styles of the element
  const styles = window.getComputedStyle(element);
  
  // Set canvas dimensions
  const rect = element.getBoundingClientRect();
  const scale = 2; // For higher quality
  canvas.width = rect.width * scale;
  canvas.height = rect.height * scale;
  
  // Scale the context for higher quality
  ctx.scale(scale, scale);

  // Create a temporary container for rendering
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.width = `${rect.width}px`;
  tempContainer.style.height = `${rect.height}px`;
  tempContainer.style.overflow = 'hidden';
  
  // Clone the element to avoid affecting the original
  const clonedElement = element.cloneNode(true) as HTMLElement;
  clonedElement.style.width = `${rect.width}px`;
  clonedElement.style.height = `${rect.height}px`;
  clonedElement.style.transform = 'scale(1)';
  clonedElement.style.transformOrigin = 'top left';
  
  tempContainer.appendChild(clonedElement);
  document.body.appendChild(tempContainer);

  try {
    // Wait for any images to load
    await waitForImages(clonedElement);
    
    // Use html2canvas-like approach with basic rendering
    await renderElementToCanvas(ctx, clonedElement, rect.width, rect.height);
    
  } finally {
    // Clean up
    document.body.removeChild(tempContainer);
  }

  // Convert canvas to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to create blob from canvas'));
      }
    }, 'image/png', 0.9);
  });
};

/**
 * Wait for all images in the element to load
 */
const waitForImages = (element: HTMLElement): Promise<void> => {
  const images = element.querySelectorAll('img');
  const promises = Array.from(images).map(img => {
    if (img.complete) {
      return Promise.resolve();
    }
    return new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => resolve(); // Continue even if image fails to load
      setTimeout(reject, 5000); // Timeout after 5 seconds
    });
  });
  
  return Promise.all(promises).then(() => {});
};

/**
 * Render element to canvas (simplified version)
 */
const renderElementToCanvas = async (
  ctx: CanvasRenderingContext2D, 
  element: HTMLElement, 
  width: number, 
  height: number
): Promise<void> => {
  // This is a simplified version - for production use, you'd want html2canvas
  // For now, we'll create a basic representation
  
  // Get background
  const styles = window.getComputedStyle(element);
  const background = styles.background || styles.backgroundColor;
  
  // Draw background
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);
  } else {
    // Default gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  // Draw text content (simplified)
  const textElements = element.querySelectorAll('h1, h2, h3, p, div, span');
  let yOffset = 20;

  Array.from(textElements).forEach(textEl => {
    const text = textEl.textContent?.trim();
    if (!text) return;

    const textStyles = window.getComputedStyle(textEl);
    const fontSize = parseFloat(textStyles.fontSize) || 16;
    const fontWeight = textStyles.fontWeight || 'normal';
    const color = textStyles.color || '#ffffff';
    const textAlign = textStyles.textAlign || 'left';
    
    ctx.font = `${fontWeight} ${fontSize}px system-ui, -apple-system, sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = textAlign as CanvasTextAlign;

    const x = textAlign === 'center' ? width / 2 : 20;
    ctx.fillText(text, x, yOffset);
    
    yOffset += fontSize + 10;
  });

  // Add GamePilot branding
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = '10px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('Generated with GamePilot', width - 16, height - 16);
  ctx.fillText('gamepilot.app', width - 16, height - 4);
};

/**
 * Download blob as file
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Copy blob to clipboard
 */
export const copyBlobToClipboard = async (blob: Blob): Promise<void> => {
  try {
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ]);
  } catch (error) {
    console.warn('Failed to copy to clipboard:', error);
    throw new Error('Clipboard API not available or failed');
  }
};
