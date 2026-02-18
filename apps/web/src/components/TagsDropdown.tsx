import React, { useState, useRef, useEffect } from 'react'
import { TAGS } from '@gamepilot/static-data'

interface TagsDropdownProps {
  selected: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  className?: string
}

export const TagsDropdown: React.FC<TagsDropdownProps> = ({
  selected,
  onChange,
  placeholder = 'Select tags...',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [customTag, setCustomTag] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filter available tags based on search
  const filteredTags = TAGS.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selected.includes(tag.name)
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
        setCustomTag('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectTag = (tagName: string) => {
    onChange([...selected, tagName])
    setSearchTerm('')
  }

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(selected.filter(tag => tag !== tagToRemove))
  }

  const handleAddCustomTag = () => {
    const trimmedTag = customTag.trim()
    if (trimmedTag && !selected.includes(trimmedTag)) {
      onChange([...selected, trimmedTag])
      setCustomTag('')
      setSearchTerm('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredTags.length === 0 && customTag.trim()) {
        handleAddCustomTag()
      } else if (filteredTags.length > 0) {
        handleSelectTag(filteredTags[0].name)
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setSearchTerm('')
      setCustomTag('')
    }
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Selected Tags Display */}
      <div
        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white cursor-pointer min-h-[42px] focus:outline-none focus:border-gaming-primary"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected.length === 0 ? (
          <span className="text-gray-400">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selected.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gaming-primary/20 text-gaming-primary rounded text-sm"
              >
                {tag}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveTag(tag)
                  }}
                  className="hover:text-gaming-secondary transition-colors"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-700">
            <input
              type="text"
              placeholder="Search or add custom tag..."
              value={customTag || searchTerm}
              onChange={(e) => {
                const value = e.target.value
                if (value.startsWith('+') || value.startsWith('#')) {
                  setCustomTag(value)
                  setSearchTerm('')
                } else {
                  setSearchTerm(value)
                  setCustomTag('')
                }
              }}
              onKeyDown={handleKeyDown}
              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-gaming-primary"
              autoFocus
            />
          </div>

          {/* Custom Tag Hint */}
          {customTag && (
            <div className="px-3 py-2 text-xs text-gray-400 border-b border-gray-700">
              Press Enter to add custom tag: "{customTag}"
            </div>
          )}

          {/* Available Tags */}
          {filteredTags.length === 0 && !customTag ? (
            <div className="p-3 text-gray-400 text-sm text-center">
              {searchTerm ? 'No tags found' : 'All tags selected'}
            </div>
          ) : (
            filteredTags.map((tag) => (
              <div
                key={tag.id}
                onClick={() => handleSelectTag(tag.name)}
                className="px-3 py-2 hover:bg-gray-700 cursor-pointer text-white transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span>{tag.name}</span>
                  <span className={`text-xs px-2 py-1 rounded ${tag.color} bg-gray-900`}>
                    {tag.category.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {tag.description}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
