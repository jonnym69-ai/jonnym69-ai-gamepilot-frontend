import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { useToast } from './ui/ToastProvider';

interface ErrorBoundaryWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export const ErrorBoundaryWrapper: React.FC<ErrorBoundaryWrapperProps> = ({ 
  children, 
  fallback,
  onError 
}) => {
  const { showError } = useToast();

  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Show toast notification for the error
    showError(`Component error: ${error.message}`);
    
    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }
  };

  return (
    <ErrorBoundary 
      fallback={fallback}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  );
};

// Specialized wrappers for different use cases
export const PageErrorBoundaryWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorBoundaryWrapper
    fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Page Error</h2>
          <p className="text-gray-400 mb-6">This page couldn't be loaded properly.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    }
  >
    {children}
  </ErrorBoundaryWrapper>
);

export const ComponentErrorBoundaryWrapper: React.FC<{ 
  children: React.ReactNode, 
  fallback?: React.ReactNode 
}> = ({ children, fallback }) => (
  <ErrorBoundaryWrapper
    fallback={fallback || (
      <div className="p-4 bg-red-900 border border-red-700 rounded-lg">
        <p className="text-red-200 text-sm">Component failed to load</p>
      </div>
    )}
  >
    {children}
  </ErrorBoundaryWrapper>
);

// Hook for functional components to handle errors
export const useErrorHandler = () => {
  const { showError, showWarning } = useToast();

  return React.useCallback((error: Error, context?: string, type: 'error' | 'warning' = 'error') => {
    console.error(`Error in ${context}:`, error);
    
    const message = `${context ? `${context}: ` : ''}${error.message}`;
    
    if (type === 'warning') {
      showWarning(message);
    } else {
      showError(message);
    }
  }, [showError, showWarning]);
};

// Higher-order component for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundaryWrapper fallback={fallback}>
      <Component {...props} />
    </ErrorBoundaryWrapper>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};
