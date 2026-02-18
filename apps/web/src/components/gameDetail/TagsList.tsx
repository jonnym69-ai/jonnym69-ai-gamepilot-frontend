import React from 'react'

interface TagsListProps {
  tags: Array<{
    id: number
    description: string
  }>
  className?: string
}

export const TagsList: React.FC<TagsListProps> = ({ tags, className = '' }) => {
  if (!tags || tags.length === 0) {
    return null
  }

  const getTagColor = (tag: string) => {
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-green-500 to-emerald-500',
      'from-yellow-500 to-amber-500',
      'from-red-500 to-orange-500',
      'from-indigo-500 to-purple-500',
      'from-gray-500 to-gray-600',
      'from-teal-500 to-cyan-500'
    ]
    
    const index = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[index % colors.length]
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag) => (
        <span
          key={tag.id}
          className={`px-3 py-1 bg-gradient-to-r ${getTagColor(tag.description)} rounded-full text-xs text-white font-medium`}
        >
          {tag.description}
        </span>
      ))}
    </div>
  )
}
