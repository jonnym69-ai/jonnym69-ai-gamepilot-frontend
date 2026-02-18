import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../store/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  // TEMPORARY BYPASS: Skip authentication for development
  const isDevelopmentBypass = true; // Set to false to re-enable auth

  // Show loading while checking authentication
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
    </div>;
  }

  // Redirect to login if not authenticated (and not bypassed)
  if (!isAuthenticated && !isDevelopmentBypass) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render children if authenticated or bypassed
  return <>{children}</>;
}
