import React, { useState, useRef, useEffect } from 'react'

interface MultiSelectDropdownProps {
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  options,
  selected,
  onChange,
  placeholder = 'Select options...',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selected.includes(option)
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectOption = (option: string) => {
    onChange([...selected, option])
    setSearchTerm('')
  }

  const handleRemoveOption = (optionToRemove: string) => {
    onChange(selected.filter(option => option !== optionToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isOpen && filteredOptions.length > 0) {
      handleSelectOption(filteredOptions[0])
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setSearchTerm('')
    }
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Selected Items Display */}
      <div
        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white cursor-pointer min-h-[42px] focus:outline-none focus:border-gaming-primary"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected.length === 0 ? (
          <span className="text-gray-400">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selected.map((option) => (
              <span
                key={option}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gaming-primary/20 text-gaming-primary rounded text-sm"
              >
                {option}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveOption(option)
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
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-gaming-primary"
              autoFocus
            />
          </div>

          {/* Options */}
          {filteredOptions.length === 0 ? (
            <div className="p-3 text-gray-400 text-sm text-center">
              {searchTerm ? 'No options found' : 'All options selected'}
            </div>
          ) : (
            filteredOptions.map((option) => (
              <div
                key={option}
                onClick={() => handleSelectOption(option)}
                className="px-3 py-2 hover:bg-gray-700 cursor-pointer text-white transition-colors"
              >
                {option}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
