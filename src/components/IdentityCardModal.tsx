import React, { useRef, useState } from 'react';
import { IdentityShareCard } from './IdentityShareCard';
import { captureElementAsImage, downloadBlob, copyBlobToClipboard } from '../utils/captureElement';
import type { PersonaContext } from '../utils/contextualEngine';
import type { ContextualMatch } from '../utils/contextualEngine';

interface IdentityCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  personaContext?: PersonaContext;
  identityNarrative?: string;
  identityDefiningGames?: ContextualMatch[];
}

export const IdentityCardModal: React.FC<IdentityCardModalProps> = ({
  isOpen,
  onClose,
  personaContext,
  identityNarrative,
  identityDefiningGames
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateCard = async () => {
    if (!cardRef.current) return;

    setIsGenerating(true);
    setError(null);

    try {
      const blob = await captureElementAsImage(cardRef.current);
      const imageUrl = URL.createObjectURL(blob);
      setGeneratedImage(imageUrl);
    } catch (err) {
      console.error('Failed to generate card:', err);
      setError('Failed to generate card. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    fetch(generatedImage)
      .then(res => res.blob())
      .then(blob => {
        const filename = `gaming-identity-${new Date().toISOString().split('T')[0]}.png`;
        downloadBlob(blob, filename);
      })
      .catch(err => {
        console.error('Failed to download:', err);
        setError('Failed to download image.');
      });
  };

  const handleCopyToClipboard = async () => {
    if (!generatedImage) return;

    try {
      const blob = await fetch(generatedImage).then(res => res.blob());
      await copyBlobToClipboard(blob);
      // Show success feedback
      const button = document.getElementById('copy-to-clipboard-btn');
      if (button) {
        const originalText = button.textContent;
        button.textContent = '✓ Copied!';
        button.classList.add('bg-green-600');
        setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove('bg-green-600');
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      setError('Failed to copy to clipboard. Your browser may not support this feature.');
    }
  };

  const handleRegenerate = () => {
    setGeneratedImage(null);
    setError(null);
    setTimeout(handleGenerateCard, 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Your Gaming Identity Card</h2>
              <p className="text-gray-400">Share your unique gaming personality with the world</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!generatedImage ? (
            <div className="space-y-6">
              {/* Card Preview */}
              <div className="flex justify-center">
                <div 
                  ref={cardRef}
                  className="transform scale-75 origin-top"
                  style={{ transform: 'scale(0.75)', transformOrigin: 'top center' }}
                >
                  <IdentityShareCard
                    personaContext={personaContext}
                    identityNarrative={identityNarrative}
                    identityDefiningGames={identityDefiningGames}
                  />
                </div>
              </div>

              {/* Generate Button */}
              <div className="text-center">
                <button
                  onClick={handleGenerateCard}
                  disabled={isGenerating}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V8C0 5.79 5.79 0 12 0s12 5.79 12 12v4a8 8 0 01-8 8z" />
                      </svg>
                      Generating Card...
                    </span>
                  ) : (
                    'Generate Identity Card'
                  )}
                </button>
              </div>

              {error && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 text-red-400 text-sm bg-red-900/20 px-4 py-2 rounded-lg">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293-1.293a1 1 0 00-1.414 1.414L7.172 11.414l1.293 1.293a1 1 0 001.414 0l4-4a1 1 0 000-1.414l-2.293-2.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Generated Image */}
              <div className="flex justify-center">
                <img 
                  src={generatedImage} 
                  alt="Generated Identity Card" 
                  className="rounded-lg shadow-2xl max-w-full"
                  style={{ maxHeight: '500px' }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleDownload}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l4 4m-4-4h4m4 0v4" />
                  </svg>
                  Download
                </button>
                
                <button
                  id="copy-to-clipboard-btn"
                  onClick={handleCopyToClipboard}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Image
                </button>

                <button
                  onClick={handleRegenerate}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Regenerate
                </button>
              </div>

              {/* Share Tips */}
              <div className="text-center text-gray-400 text-sm">
                <p>Share your gaming identity on social media, with friends, or save it as a keepsake!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
