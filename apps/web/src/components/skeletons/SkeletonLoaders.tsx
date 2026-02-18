import React from 'react'

export const GameCardSkeleton: React.FC = () => (
  <div className="bg-gray-800 rounded-lg overflow-hidden animate-pulse">
    <div className="aspect-[3/4] bg-gray-700"></div>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
      <div className="h-3 bg-gray-700 rounded w-1/2"></div>
      <div className="flex items-center space-x-2">
        <div className="h-6 w-6 bg-gray-700 rounded-full"></div>
        <div className="h-3 bg-gray-700 rounded w-16"></div>
      </div>
    </div>
  </div>
)

export const GameGridSkeleton: React.FC<{ count?: number }> = ({ count = 12 }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <GameCardSkeleton key={i} />
    ))}
  </div>
)

export const GameDetailsSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    <div className="flex flex-col md:flex-row gap-8">
      {/* Cover Image */}
      <div className="flex-shrink-0">
        <div className="w-64 h-96 bg-gray-700 rounded-lg"></div>
      </div>

      {/* Game Info */}
      <div className="flex-1 space-y-4">
        <div className="space-y-2">
          <div className="h-8 bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="h-6 w-20 bg-gray-700 rounded"></div>
          <div className="h-6 w-16 bg-gray-700 rounded"></div>
          <div className="h-6 w-24 bg-gray-700 rounded"></div>
        </div>

        <div className="space-y-2">
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded w-5/6"></div>
          <div className="h-4 bg-gray-700 rounded w-4/6"></div>
        </div>

        <div className="flex space-x-3">
          <div className="h-10 w-32 bg-gray-700 rounded-lg"></div>
          <div className="h-10 w-24 bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    </div>

    {/* Additional sections */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <div className="h-6 bg-gray-700 rounded w-32"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-6 bg-gray-700 rounded w-32"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  </div>
)

export const LibraryHeaderSkeleton: React.FC = () => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-pulse">
    <div className="space-y-2">
      <div className="h-8 bg-gray-700 rounded w-48"></div>
      <div className="h-4 bg-gray-700 rounded w-32"></div>
    </div>
    <div className="flex items-center space-x-3">
      <div className="h-10 w-24 bg-gray-700 rounded-lg"></div>
      <div className="h-10 w-32 bg-gray-700 rounded-lg"></div>
    </div>
  </div>
)

export const StatsCardSkeleton: React.FC = () => (
  <div className="bg-gray-800 rounded-lg p-6 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-4 bg-gray-700 rounded w-20"></div>
        <div className="h-8 bg-gray-700 rounded w-16"></div>
      </div>
      <div className="h-12 w-12 bg-gray-700 rounded-full"></div>
    </div>
  </div>
)

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4
}) => (
  <div className="space-y-4 animate-pulse">
    {/* Table Header */}
    <div className="flex space-x-4">
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-700 rounded flex-1"></div>
      ))}
    </div>

    {/* Table Rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, j) => (
          <div key={j} className="h-4 bg-gray-700 rounded flex-1"></div>
        ))}
      </div>
    ))}
  </div>
)

export const FormSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    <div className="space-y-4">
      <div className="h-4 bg-gray-700 rounded w-24"></div>
      <div className="h-10 bg-gray-700 rounded"></div>
    </div>
    <div className="space-y-4">
      <div className="h-4 bg-gray-700 rounded w-32"></div>
      <div className="h-10 bg-gray-700 rounded"></div>
    </div>
    <div className="space-y-4">
      <div className="h-4 bg-gray-700 rounded w-28"></div>
      <div className="h-24 bg-gray-700 rounded"></div>
    </div>
    <div className="h-10 bg-gray-700 rounded w-32"></div>
  </div>
)
