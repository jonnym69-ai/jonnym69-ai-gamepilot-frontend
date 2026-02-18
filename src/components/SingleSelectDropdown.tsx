import React, { useState, useRef, useEffect } from 'react'

interface SingleSelectDropdownProps {
  options: string[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export const SingleSelectDropdown: React.FC<SingleSelectDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectOption = (option: string) => {
    onChange(option)
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Selected Value Display */}
      <div
        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white cursor-pointer focus:outline-none focus:border-gaming-primary"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {value || <span className="text-gray-400">{placeholder}</span>}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.map((option) => (
            <div
              key={option}
              onClick={() => handleSelectOption(option)}
              className={`px-3 py-2 cursor-pointer text-white transition-colors ${
                option === value ? 'bg-gaming-primary/20 text-gaming-primary' : 'hover:bg-gray-700'
              }`}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
