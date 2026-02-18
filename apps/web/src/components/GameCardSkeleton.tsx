export function GameCardSkeleton() {
  return (
    <div className="relative group cursor-pointer transition-all duration-300 transform animate-pulse">
      <div className="glass-morphism rounded-2xl overflow-hidden border border-gray-700/30 transition-all duration-300">
        {/* Skeleton Cover Image */}
        <div className="relative w-full h-52 overflow-hidden bg-gradient-to-br from-gray-700 to-gray-800">
          <div className="absolute inset-0 skeleton-shimmer" />
        </div>
        
        {/* Skeleton Content */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-5 flex flex-col justify-end">
          {/* Skeleton Title */}
          <div className="h-6 bg-gray-600 rounded mb-3 w-3/4 animate-pulse" />
          
          {/* Skeleton Platforms */}
          <div className="flex gap-1.5 mb-3">
            <div className="h-5 bg-gray-700 rounded px-2.5 w-16 animate-pulse" />
            <div className="h-5 bg-gray-700 rounded px-2.5 w-12 animate-pulse" />
          </div>

          {/* Skeleton Tags */}
          <div className="flex gap-1.5 mb-3">
            <div className="h-5 bg-gray-700 rounded px-2.5 w-14 animate-pulse" />
            <div className="h-5 bg-gray-700 rounded px-2.5 w-12 animate-pulse" />
            <div className="h-5 bg-gray-700 rounded px-2.5 w-10 animate-pulse" />
          </div>

          {/* Skeleton Status and Playtime */}
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-700/30">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse" />
              <div className="h-4 bg-gray-600 rounded w-16 animate-pulse" />
            </div>
            <div className="h-4 bg-gray-600 rounded w-8 animate-pulse" />
          </div>

          {/* Skeleton Action Buttons */}
          <div className="flex gap-2">
            <div className="flex-1 h-8 bg-gray-700 rounded-lg animate-pulse" />
            <div className="w-12 h-8 bg-gray-700 rounded-lg animate-pulse" />
            <div className="w-12 h-8 bg-gray-700 rounded-lg animate-pulse" />
            <div className="w-20 h-8 bg-gray-700 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function GameGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 lg:gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <GameCardSkeleton key={index} />
      ))}
    </div>
  )
}

export function VirtualGridSkeleton({ count = 20 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 lg:gap-8">
          {Array.from({ length: 4 }).map((_, cardIndex) => (
            <GameCardSkeleton key={`${index}-${cardIndex}`} />
          ))}
        </div>
      ))}
    </div>
  )
}
