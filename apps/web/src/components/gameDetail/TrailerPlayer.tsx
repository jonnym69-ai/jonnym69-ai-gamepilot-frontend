import React, { useState, useRef } from 'react'

interface Movie {
  id: number
  name: string
  thumbnail: string
  webm: {
    '480': string
    max: string
  }
  mp4: {
    '480': string
    max: string
  }
}

interface TrailerPlayerProps {
  movies: Movie[]
}

export const TrailerPlayer: React.FC<TrailerPlayerProps> = ({ movies }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentMovie, setCurrentMovie] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  if (!movies || movies.length === 0) {
    return null
  }

  const movie = movies[currentMovie]
  const videoSrc = videoRef.current?.canPlayType('video/webm') ? movie.webm.max : movie.mp4.max

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const nextMovie = () => {
    setCurrentMovie((prev) => (prev + 1) % movies.length)
    setIsPlaying(false)
  }

  const prevMovie = () => {
    setCurrentMovie((prev) => (prev - 1 + movies.length) % movies.length)
    setIsPlaying(false)
  }

  return (
    <div className="relative w-full h-96 bg-gray-900 rounded-xl overflow-hidden group">
      {!isPlaying ? (
        <div className="relative w-full h-full">
          <img
            src={movie.thumbnail}
            alt={movie.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <button
              onClick={handlePlay}
              className="w-20 h-20 bg-gaming-accent hover:bg-gaming-primary rounded-full flex items-center justify-center text-white transition-all transform hover:scale-110"
            >
              <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
          <div className="absolute bottom-4 left-4 text-white">
            <h3 className="text-lg font-semibold">{movie.name}</h3>
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          src={videoSrc}
          className="w-full h-full object-cover"
          controls
          onPause={handlePause}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Navigation Buttons */}
      {movies.length > 1 && (
        <>
          <button
            onClick={prevMovie}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextMovie}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Movie Counter */}
      {movies.length > 1 && (
        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {currentMovie + 1} / {movies.length}
        </div>
      )}
    </div>
  )
}
