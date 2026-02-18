import React from 'react'

export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="flex items-center gap-4 mb-6">
      {/* Avatar Skeleton */}
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-2 border-gray-600 bg-gray-700 animate-pulse"></div>
        {/* Online Status Indicator Skeleton */}
        <div className="absolute bottom-2 right-2 w-6 h-6 bg-gray-600 rounded-full border-2 border-gray-700 animate-pulse">
          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
        </div>
      </div>
      
      {/* Profile Info Skeleton */}
      <div className="flex-1">
        <div className="h-8 bg-gray-700 rounded mb-2 animate-pulse"></div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-600 rounded-full animate-pulse"></div>
          <div className="h-4 w-24 bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}
