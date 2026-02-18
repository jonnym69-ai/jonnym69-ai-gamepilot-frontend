import React from 'react'

export const SectionSkeleton: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Section Header Skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 bg-gray-700 rounded w-32 animate-pulse"></div>
        <div className="h-8 bg-gray-700 rounded w-20 animate-pulse"></div>
      </div>
      
      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="relative group cursor-pointer transition-all duration-300 transform scale-100 translate-y-0">
            <div className="glass-morphism rounded-xl overflow-hidden cinematic-shadow">
              {/* Game Cover Skeleton */}
              <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-700 to-gray-800">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-4xl text-gray-500">🎮</div>
                </div>
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse opacity-20"></div>
              </div>
              
              {/* Game Info Overlay Skeleton */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent p-4 flex flex-col justify-end">
                {/* Title Skeleton */}
                <div className="h-6 bg-gray-700 rounded mb-2 animate-pulse"></div>
                
                {/* Platforms Skeleton */}
                <div className="flex gap-2 mb-2">
                  <div className="h-4 w-16 bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 w-16 bg-gray-700 rounded animate-pulse"></div>
                </div>

                {/* Tags Skeleton */}
                <div className="flex flex-wrap gap-1 mb-2">
                  <div className="h-4 w-12 bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 w-12 bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 w-12 bg-gray-700 rounded animate-pulse"></div>
                </div>

                {/* Status and Playtime Skeleton */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse"></div>
                    <div className="h-4 w-16 bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  <div className="h-4 w-16 bg-gray-700 rounded animate-pulse"></div>
                </div>

                {/* Action Buttons Skeleton */}
                <div className="flex gap-2">
                  <div className="h-8 w-20 bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-8 w-16 bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
            
            {/* Glow effect skeleton */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-600/20 to-gray-700/20 blur-xl -z-10"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
