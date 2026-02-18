import React, { useState } from 'react'

interface Screenshot {
  id: number
  path_thumbnail: string
  path_full: string
}

interface ScreenshotCarouselProps {
  screenshots: Screenshot[]
}

export const ScreenshotCarousel: React.FC<ScreenshotCarouselProps> = ({ screenshots }) => {
  const [currentImage, setCurrentImage] = useState(0)

  if (!screenshots || screenshots.length === 0) {
    return null
  }

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % screenshots.length)
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + screenshots.length) % screenshots.length)
  }

  return (
    <div className="relative w-full h-96 bg-gray-900 rounded-xl overflow-hidden group">
      {/* Main Image */}
      <img
        src={screenshots[currentImage].path_full}
        alt={`Screenshot ${currentImage + 1}`}
        className="w-full h-full object-cover"
      />

      {/* Navigation Buttons */}
      {screenshots.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Image Counter */}
      {screenshots.length > 1 && (
        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {currentImage + 1} / {screenshots.length}
        </div>
      )}

      {/* Thumbnail Strip */}
      {screenshots.length > 1 && (
        <div className="absolute bottom-4 left-4 flex gap-2">
          {screenshots.slice(0, 5).map((screenshot, index) => (
            <button
              key={screenshot.id}
              onClick={() => setCurrentImage(index)}
              className={`w-12 h-12 rounded border-2 transition-all ${
                index === currentImage
                  ? 'border-gaming-accent scale-110'
                  : 'border-transparent hover:border-gray-400'
              }`}
            >
              <img
                src={screenshot.path_thumbnail}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover rounded"
              />
            </button>
          ))}
          {screenshots.length > 5 && (
            <div className="w-12 h-12 rounded border-2 border-gray-600 flex items-center justify-center text-gray-400 text-xs">
              +{screenshots.length - 5}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
