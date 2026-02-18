import React, { useState, useRef, useEffect } from 'react'
import YouTube from 'react-youtube'
import { useToast } from '../../components/ui/ToastProvider'

interface GameTrailerProps {
  game: {
    id: string
    title: string
    trailerUrl?: string
  }
  onTrailerUpdate?: (trailerUrl: string) => void
  onAutoDetect?: () => void
  isDetecting?: boolean
}

export const GameTrailer: React.FC<GameTrailerProps> = ({ game, onTrailerUpdate, onAutoDetect, isDetecting }) => {
  const { showSuccess, showError } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [customUrl, setCustomUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [youtubeError, setYoutubeError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Extract YouTube video ID from URL
  const extractVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  // Get current video ID
  const getVideoId = (): string | null => {
    if (game.trailerUrl) {
      return extractVideoId(game.trailerUrl)
    }
    return null
  }

  const handleUrlSubmit = () => {
    const videoId = extractVideoId(customUrl)
    if (!videoId) {
      showError('Invalid YouTube URL. Please enter a valid YouTube video URL.')
      return
    }

    setIsLoading(true)
    
    // Simulate validation (in real app, you'd validate with YouTube API)
    setTimeout(() => {
      onTrailerUpdate?.(customUrl)
      setCustomUrl('')
      setIsEditing(false)
      setIsLoading(false)
      showSuccess('Trailer added successfully!')
    }, 1000)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'text/plain') {
      const reader = new FileReader()
      reader.onload = (e) => {
        const url = e.target?.result as string
        setCustomUrl(url.trim())
      }
      reader.readAsText(file)
    }
  }

  // Handle YouTube player errors
  const handleYouTubeError = (error: any) => {
    console.warn('YouTube player error:', error)
    setYoutubeError(true)
    showError('YouTube player failed to load. You can still add a trailer URL manually.')
  }

  const videoId = getVideoId()

  return (
    <div className="space-y-4">
      {/* Trailer Display */}
      <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
        {videoId && !youtubeError ? (
          <YouTube
            videoId={videoId}
            opts={{
              playerVars: {
                autoplay: 0,
                controls: 1,
                modestbranding: 1,
                rel: 0,
                showinfo: 0,
                fs: 1,
                cc_load_policy: 1,
                iv_load_policy: 3,
              },
              width: '100%',
              height: '100%',
            }}
            onReady={(event) => {
              event.target.pauseVideo()
            }}
            onError={handleYouTubeError}
            className="w-full h-full"
            containerClassName="w-full h-full"
          />
        ) : youtubeError ? (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-gaming-dark to-gaming-darker">
            <div className="text-center p-8">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-white mb-2">YouTube Player Error</h3>
              <p className="text-gray-400 mb-6">The YouTube player failed to load. This might be due to network restrictions or browser settings.</p>
              <button
                onClick={() => setYoutubeError(false)}
                className="px-6 py-3 bg-gaming-primary hover:bg-gaming-primary/80 text-white rounded-lg font-medium transition-all"
              >
                Retry Loading
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-gaming-dark to-gaming-darker">
            <div className="text-center p-8">
              <div className="text-6xl mb-4">🎬</div>
              <h3 className="text-xl font-semibold text-white mb-2">No Trailer Available</h3>
              <p className="text-gray-400 mb-6">Add a YouTube trailer to enhance this game's presentation</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-gaming-primary hover:bg-gaming-primary/80 text-white rounded-lg font-medium transition-all"
                >
                  Add Trailer
                </button>
                {onAutoDetect && (
                  <button
                    onClick={onAutoDetect}
                    disabled={isDetecting}
                    className="px-6 py-3 bg-gaming-secondary hover:bg-gaming-secondary/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all"
                  >
                    {isDetecting ? '🔍 Detecting...' : '🔍 Auto-Detect'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit Overlay */}
        {isEditing && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8">
            <div className="bg-gaming-surface border border-gaming-border rounded-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-white mb-4">Add Game Trailer</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gaming-text mb-2">
                    YouTube URL
                  </label>
                  <input
                    type="text"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full p-3 bg-gaming-surface border border-gaming-border rounded text-gaming-text placeholder-gray-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-gaming-border"></div>
                  <span className="text-xs text-gaming-text-muted">OR</span>
                  <div className="flex-1 h-px bg-gaming-border"></div>
                </div>

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    title="Upload trailer URL file"
                    aria-label="Upload trailer URL file (.txt)"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-3 bg-gaming-surface border border-gaming-border rounded text-gaming-text hover:bg-gaming-surface/80 transition-all"
                  >
                    📄 Import from File
                  </button>
                  <p className="text-xs text-gaming-text-muted mt-1">
                    Upload a .txt file containing the YouTube URL
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleUrlSubmit}
                  disabled={!customUrl.trim() || isLoading}
                  className="flex-1 px-4 py-2 bg-gaming-primary hover:bg-gaming-primary/80 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all"
                >
                  {isLoading ? 'Adding...' : 'Add Trailer'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setCustomUrl('')
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-all"
                >
                  Cancel
                </button>
              </div>

              <div className="mt-4 p-3 bg-gaming-surface/50 rounded-lg">
                <p className="text-xs text-gaming-text-muted">
                  💡 <strong>Tip:</strong> Find official trailers on YouTube or game developer websites. 
                  Smaller indie games often have trailers that aren't automatically detected.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Trailer Actions */}
      {videoId && !isEditing && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gaming-text-muted">
            🎬 Trailer from YouTube
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 bg-gaming-surface hover:bg-gaming-surface/80 border border-gaming-border text-gaming-text rounded-lg text-sm transition-all"
          >
            Change Trailer
          </button>
        </div>
      )}
    </div>
  )
}
