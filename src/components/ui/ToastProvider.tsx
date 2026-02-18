import React, { createContext, useContext, useCallback } from 'react';
import { ToastContainer, toast as toastify, ToastPosition } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  type?: ToastType;
  position?: ToastPosition;
  autoClose?: number | false;
  hideProgressBar?: boolean;
  closeOnClick?: boolean;
  pauseOnHover?: boolean;
  draggable?: boolean;
  theme?: 'light' | 'dark' | 'colored';
}

interface ToastContextType {
  showToast: (message: string, options?: ToastOptions) => void;
  showSuccess: (message: string, options?: Omit<ToastOptions, 'type'>) => void;
  showError: (message: string, options?: Omit<ToastOptions, 'type'>) => void;
  showWarning: (message: string, options?: Omit<ToastOptions, 'type'>) => void;
  showInfo: (message: string, options?: Omit<ToastOptions, 'type'>) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
  defaultPosition?: ToastPosition;
  defaultTheme?: 'light' | 'dark' | 'colored';
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children, 
  defaultPosition = 'top-right',
  defaultTheme = 'dark'
}) => {
  const showToast = useCallback((message: string, options: ToastOptions = {}) => {
    const {
      type = 'info',
      position = defaultPosition,
      autoClose = 5000,
      hideProgressBar = false,
      closeOnClick = true,
      pauseOnHover = true,
      draggable = true,
      theme = defaultTheme
    } = options;

    const toastMethods = {
      success: toastify.success,
      error: toastify.error,
      warning: toastify.warning,
      info: toastify.info
    };

    const toastMethod = toastMethods[type];
    
    const id = toastMethod(message, {
      position,
      autoClose,
      hideProgressBar,
      closeOnClick,
      pauseOnHover,
      draggable,
      theme
    });

    return id;
  }, [defaultPosition, defaultTheme]);

  const showSuccess = useCallback((message: string, options: Omit<ToastOptions, 'type'> = {}) => {
    return showToast(message, { ...options, type: 'success' });
  }, [showToast]);

  const showError = useCallback((message: string, options: Omit<ToastOptions, 'type'> = {}) => {
    return showToast(message, { ...options, type: 'error', autoClose: false });
  }, [showToast]);

  const showWarning = useCallback((message: string, options: Omit<ToastOptions, 'type'> = {}) => {
    return showToast(message, { ...options, type: 'warning' });
  }, [showToast]);

  const showInfo = useCallback((message: string, options: Omit<ToastOptions, 'type'> = {}) => {
    return showToast(message, { ...options, type: 'info' });
  }, [showToast]);

  const clearToasts = useCallback(() => {
    toastify.dismiss();
  }, []);

  const value: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearToasts
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer
        position={defaultPosition}
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={defaultTheme}
        limit={3}
      />
    </ToastContext.Provider>
  );
};

// Utility functions for common toast messages
export const toastMessages = {
  // Game Management
  gameAdded: (title: string) => `✅ "${title}" added to your library`,
  gameUpdated: (title: string) => `✅ "${title}" updated successfully`,
  gameDeleted: (title: string) => `🗑️ "${title}" removed from your library`,
  gamesBulkDeleted: (count: number) => `🗑️ ${count} games removed from your library`,
  
  // Error Messages
  gameAddFailed: (title: string) => `❌ Failed to add "${title}" to library`,
  gameUpdateFailed: (title: string) => `❌ Failed to update "${title}"`,
  gameDeleteFailed: (title: string) => `❌ Failed to remove "${title}"`,
  loadFailed: (operation: string) => `❌ Failed to load ${operation}`,
  saveFailed: (operation: string) => `❌ Failed to save ${operation}`,
  
  // Success Messages
  saveSuccess: (operation: string) => `✅ ${operation} saved successfully`,
  loadSuccess: (operation: string) => `✅ ${operation} loaded successfully`,
  operationComplete: (operation: string) => `✅ ${operation} completed`,
  
  // Info Messages
  loading: (operation: string) => `⏳ Loading ${operation}...`,
  processing: (operation: string) => `⚙️ Processing ${operation}...`,
  noResults: (search: string) => `🔍 No results found for "${search}"`,
  
  // Warning Messages
  unsavedChanges: '⚠️ You have unsaved changes',
  confirmDelete: '⚠️ Are you sure you want to delete this item?',
  networkError: '⚠️ Network connection issue',
  
  // Recommendations
  recommendationGenerated: '🎯 New recommendations generated',
  recommendationFailed: '❌ Failed to generate recommendations',
  noRecommendations: '📭 No recommendations available'
};
