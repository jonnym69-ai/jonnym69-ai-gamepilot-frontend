import { useState, useRef, useCallback } from 'react'

interface DragItem {
  id: string
  index: number
}

interface UseDragAndDropProps {
  items: any[]
  onReorder: (fromIndex: number, toIndex: number) => void
  disabled?: boolean
}

export function useDragAndDrop({ items, onReorder, disabled = false }: UseDragAndDropProps) {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const dragCounter = useRef(0)

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    if (disabled) return
    
    const item = items[index]
    if (!item) return

    setDraggedItem({ id: item.id, index })
    
    // Set drag data
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', JSON.stringify({ id: item.id, index }))
    
    // Add visual feedback
    const target = e.target as HTMLElement
    target.classList.add('opacity-50')
    
    // Set drag image (optional - creates custom drag preview)
    const dragImage = target
    e.dataTransfer.setDragImage(dragImage, 0, 0)
  }, [items, disabled])

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    // Remove visual feedback
    const target = e.target as HTMLElement
    target.classList.remove('opacity-50')
    setDraggedItem(null)
    setDragOverIndex(null)
    dragCounter.current = 0
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    if (disabled || !draggedItem) return
    
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    
    // Only update if this is a different index
    if (dragOverIndex !== index) {
      setDragOverIndex(index)
    }
  }, [draggedItem, dragOverIndex, disabled])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    if (disabled || !draggedItem) return
    
    e.preventDefault()
    dragCounter.current++
  }, [draggedItem, disabled])

  const handleDragLeave = useCallback(() => {
    if (disabled || !draggedItem) return
    
    dragCounter.current--
    if (dragCounter.current === 0) {
      setDragOverIndex(null)
    }
  }, [draggedItem, disabled])

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    if (disabled || !draggedItem) return
    
    e.preventDefault()
    e.stopPropagation()
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'))
      const fromIndex = data.index
      
      // Don't do anything if dropping on same position
      if (fromIndex === dropIndex) return
      
      // Perform the reorder
      onReorder(fromIndex, dropIndex)
    } catch (error) {
      console.error('Failed to parse drag data:', error)
    }
    
    // Reset state
    setDragOverIndex(null)
    dragCounter.current = 0
  }, [draggedItem, onReorder, disabled])

  const isDraggedOver = useCallback((index: number) => {
    return dragOverIndex === index
  }, [dragOverIndex])

  const isDragging = useCallback((index: number) => {
    return draggedItem?.index === index
  }, [draggedItem])

  return {
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    isDraggedOver,
    isDragging,
    draggedItem
  }
}

// Helper hook for drag styles
export function useDragStyles(isDraggedOver: boolean, isDraggingFlag: boolean) {
  const dragStyles = {
    opacity: isDraggingFlag ? 0.5 : 1,
    transform: isDraggedOver ? 'scale(1.02)' : 'scale(1)',
    transition: 'all 0.2s ease',
    cursor: isDraggingFlag ? 'grabbing' : 'grab',
    border: isDraggedOver ? '2px solid rgb(168 85 247)' : 'none',
    borderRadius: isDraggedOver ? '0.5rem' : '0',
    boxShadow: isDraggedOver ? '0 0 20px rgba(168, 85, 247, 0.3)' : 'none'
  }

  return dragStyles
}
