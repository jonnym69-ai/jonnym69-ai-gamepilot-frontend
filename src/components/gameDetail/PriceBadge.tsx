import React from 'react'
import type { PriceInfo } from '../../services/steamStore'

interface PriceBadgeProps {
  priceInfo?: PriceInfo
}

export const PriceBadge: React.FC<PriceBadgeProps> = ({ priceInfo }) => {
  if (!priceInfo) {
    return (
      <div className="inline-flex items-center px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg">
        <span className="text-gray-400">Price not available</span>
      </div>
    )
  }

  if (priceInfo.isFree) {
    return (
      <div className="inline-flex items-center px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg">
        <span className="text-green-400 font-bold text-lg">Free to Play</span>
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-3 px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg">
      {priceInfo.discount_percent > 0 ? (
        <>
          <div className="flex flex-col">
            <span className="text-gray-400 line-through text-sm">
              {priceInfo.currency} {(priceInfo.initial / 100).toFixed(2)}
            </span>
            <span className="text-white font-bold text-lg">
              {priceInfo.currency} {(priceInfo.final / 100).toFixed(2)}
            </span>
          </div>
          <div className="px-2 py-1 bg-red-500 rounded text-white font-bold text-sm">
            -{priceInfo.discount_percent}%
          </div>
        </>
      ) : (
        <span className="text-white font-bold text-lg">
          {priceInfo.currency} {(priceInfo.final / 100).toFixed(2)}
        </span>
      )}
    </div>
  )
}
