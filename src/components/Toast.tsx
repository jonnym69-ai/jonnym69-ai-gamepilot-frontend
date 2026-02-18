import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearAllToasts: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000
    }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, newToast.duration)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const clearAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  // Set global context reference for external calls
  const contextValue = { toasts, addToast, removeToast, clearAllToasts }
  useEffect(() => {
    setGlobalToastContext(contextValue)
  }, [contextValue])

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast, index) => (
        <ToastItem 
          key={toast.id} 
          toast={toast} 
          onRemove={removeToast}
          isVisible={index === 0}
        />
      ))}
    </div>
  )
}

interface ToastItemProps {
  toast: Toast
  onRemove: (id: string) => void
  isVisible: boolean
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove, isVisible }) => {
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    if (!isVisible && !isLeaving) {
      setIsLeaving(true)
      setTimeout(() => {
        onRemove(toast.id)
      }, 300)
    }
  }, [isVisible, isLeaving, onRemove, toast.id])

  const getToastStyles = (type: Toast['type']) => {
    const baseStyles = "border rounded-lg shadow-lg p-4 min-w-[300px] max-w-md backdrop-blur-sm bg-opacity-90"
    
    const typeStyles = {
      success: "bg-green-500 border-green-600 text-white",
      error: "bg-red-500 border-red-600 text-white", 
      warning: "bg-yellow-500 border-yellow-600 text-black",
      info: "bg-blue-500 border-blue-600 text-white"
    }
    
    return `${baseStyles} ${typeStyles[type]}`
  }

  const getIcon = (type: Toast['type']) => {
    const icons = {
      success: "✓",
      error: "✕",
      warning: "⚠",
      info: "ℹ"
    }
    return icons[type]
  }

  return (
    <div
      className={`
        ${getToastStyles(toast.type)}
        transform transition-all duration-300 ease-in-out
        ${isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="flex-shrink-0 text-lg font-bold">
            {getIcon(toast.type)}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm">{toast.title}</h4>
            {toast.message && (
              <p className="text-sm opacity-90 mt-1">{toast.message}</p>
            )}
            {toast.action && (
              <button
                onClick={toast.action.onClick}
                className="mt-2 text-xs underline hover:no-underline focus:outline-none"
              >
                {toast.action.label}
              </button>
            )}
          </div>
        </div>
        <button
          onClick={() => {
            setIsLeaving(true)
            setTimeout(() => onRemove(toast.id), 300)
          }}
          className="flex-shrink-0 ml-4 text-lg hover:opacity-70 transition-opacity focus:outline-none"
          aria-label="Close toast"
        >
          ×
        </button>
      </div>
    </div>
  )
}

// Global toast reference for external calls
let globalToastContext: ToastContextType | null = null

export const setGlobalToastContext = (context: ToastContextType) => {
  globalToastContext = context
}

// Global toast object that can be called outside React components
export const toast = {
  success: (title: string, message?: string, duration?: number) => {
    if (globalToastContext) {
      globalToastContext.addToast({ type: 'success', title, message, duration: duration ?? 5000 })
    } else {
      console.warn('Toast context not available:', { type: 'success', title, message, duration })
    }
  },
  error: (title: string, message?: string, duration?: number) => {
    if (globalToastContext) {
      globalToastContext.addToast({ type: 'error', title, message, duration: duration ?? 8000 })
    } else {
      console.warn('Toast context not available:', { type: 'error', title, message, duration })
    }
  },
  warning: (title: string, message?: string, duration?: number) => {
    if (globalToastContext) {
      globalToastContext.addToast({ type: 'warning', title, message, duration })
    } else {
      console.warn('Toast context not available:', { type: 'warning', title, message, duration })
    }
  },
  info: (title: string, message?: string, duration?: number) => {
    if (globalToastContext) {
      globalToastContext.addToast({ type: 'info', title, message, duration })
    } else {
      console.warn('Toast context not available:', { type: 'info', title, message, duration })
    }
  }
}

// Export ToastContainer for use in App.tsx
export { ToastContainer }
