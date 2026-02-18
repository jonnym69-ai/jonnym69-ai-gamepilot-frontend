import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect, lazy, Suspense } from 'react'

// Import components
import { ErrorBoundary } from './components/ErrorBoundary'
import { LoadingProvider, GlobalLoadingOverlay } from './components/LoadingManager'
import { ToastProvider, useToast } from './components/ui/ToastProvider'
import { SplashScreen } from './components/SplashScreen'
import { BetaOnboarding } from './components/onboarding/BetaOnboarding'
import { TourManager } from './components/TourManager'
import { BetaFeedback } from './components/feedback/BetaFeedback'
import { Navigation } from './components/Navigation'
import ProtectedRoute from './components/ProtectedRoute'
import { MobileLayout } from './components/MobileLayout'
import HelpButton from './components/HelpButton'

// Import stores
import { useAuth } from './store/authStore'
// import { useLibraryStore } from './store/libraryStore'

// Import feature components with lazy loading for better performance
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })))
const Library = lazy(() => import('./features/library/LibraryEnhanced').then(module => ({ default: module.Library })))
const GameDetailsPage = lazy(() => import('./features/library/pages/GameDetailsPage').then(module => ({ default: module.GameDetailsPage })))
const Identity = lazy(() => import('./features/identity/Identity').then(module => ({ default: module.Identity })))
const Integrations = lazy(() => import('./features/integrations/Integrations').then(module => ({ default: module.Integrations })))
const Analytics = lazy(() => import('./pages/Analytics').then(module => ({ default: module.Analytics })))
const Donate = lazy(() => import('./pages/Donate').then(module => ({ default: module.default })))
const SteamCallback = lazy(() => import('./pages/SteamCallback').then(module => ({ default: module.default })))
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.default })))
const Settings = lazy(() => import('./pages/SettingsNew').then(module => ({ default: module.SettingsPage })))
const Register = lazy(() => import('./pages/Register').then(module => ({ default: module.default })))
const CustomisationPage = lazy(() => import('./features/customisation/CustomisationPage').then(module => ({ default: module.CustomisationPage })))
const HelpDocumentation = lazy(() => import('./features/help/HelpDocumentation').then(module => ({ default: module.default })))

// Premium Gaming Coach - lazy loaded for performance
const PremiumCoachingDashboard = lazy(() => import('./components/premium/PremiumCoachingDashboard').then(module => ({ default: module.default })))

// Toast Provider Wrapper to set up launcher service
const ToastProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showSuccess, showError, showWarning, showInfo } = useToast()
  
  useEffect(() => {
    // Toast provider is now handled by ToastProvider component
  }, [showSuccess, showError, showWarning, showInfo])
  
  return <>{children}</>
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  const { isAuthenticated, user, isLoading, initializeAuth } = useAuth()
  const [showSplash, setShowSplash] = useState(true)
  const [showBetaOnboarding, setShowBetaOnboarding] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

  // Initialize authentication on app load
  useEffect(() => {
    // Initialize authentication (will use mock user in development)
    initializeAuth()

    // Check if user has completed beta onboarding
    const hasCompletedOnboarding = localStorage.getItem('beta_onboarding_completed')
    // TEMPORARILY FORCE ONBOARDING - REMOVE TO USE NORMAL LOGIC
    if (!hasCompletedOnboarding) { 
      setShowBetaOnboarding(true)
    }
  }, [])

  const handleSplashComplete = () => {
    setShowSplash(false)
    // Removed localStorage setting
  }

  const handleBetaOnboardingComplete = () => {
    setShowBetaOnboarding(false)
    localStorage.setItem('beta_onboarding_completed', 'true')
  }

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Global App Error:', error, errorInfo)
        // In production, this would send to error tracking service
      }}
    >
      <QueryClientProvider client={queryClient}>
        <LoadingProvider>
          <ToastProvider>
            <ToastProviderWrapper>
              <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              {/* Show splash screen on first load */}
              {showSplash ? (
                <SplashScreen onComplete={handleSplashComplete} />
              ) : showBetaOnboarding ? (
                <BetaOnboarding 
                  onComplete={handleBetaOnboardingComplete}
                  skipOnboarding={false}
                />
              ) : (
                <>
                  <AppContent 
                    isAuthenticated={isAuthenticated} 
                    user={user} 
                    isLoading={isLoading} 
                    initializeAuth={initializeAuth} 
                  />
                  <TourManager />
                  <GlobalLoadingOverlay />
                  {/* Beta Feedback System */}
                  {/* <FeedbackButton onClick={() => setShowFeedback(true)} /> */}
                  <BetaFeedback 
                    isOpen={showFeedback} 
                    onClose={() => setShowFeedback(false)}
                    userId={user?.id}
                  />
                </>
              )} 
            </Router>
            </ToastProviderWrapper>
          </ToastProvider>
        </LoadingProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

function AppContent({ isAuthenticated, user, isLoading, initializeAuth }: any) {
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false)
  // const { actions: libraryActions } = useLibraryStore()

  useEffect(() => {
    // Only fetch once on initial load if not loading and no user
    if (!isLoading && !user && !hasAttemptedFetch) {
      setHasAttemptedFetch(true)
      initializeAuth()
    }
  }, [isLoading, user, hasAttemptedFetch, initializeAuth])

  // Load library when user is authenticated
  useEffect(() => {
    // Load games for development (with or without authentication)
    console.log('🎮 Loading library...')
    // libraryActions.loadGames()
  }, [/* libraryActions */])

  return (
    <div className="min-h-screen">
      {/* Navigation - Always show since it handles both auth states */}
      <Navigation 
        isAuthenticated={isAuthenticated}
        user={user}
      />
    
      {/* Main Content with Mobile Layout */}
      <Routes>
        {/* Public routes - no MobileLayout wrapper */}
        <Route path="/login" element={
          <ErrorBoundary>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gaming-primary"></div></div>}>
              <Login />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="/register" element={
          <ErrorBoundary>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gaming-primary"></div></div>}>
              <Register />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="/auth/callback/steam" element={
          <ErrorBoundary>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gaming-primary"></div></div>}>
              <SteamCallback />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="/donate" element={
          <ErrorBoundary>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gaming-primary"></div></div>}>
              <Donate />
            </Suspense>
          </ErrorBoundary>
        } />
        
        {/* Protected routes - wrapped with MobileLayout */}
        <Route path="/" element={
          <ProtectedRoute>
            <ErrorBoundary>
              <MobileLayout showNavigation={true}>
                                  <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gaming-primary"></div></div>}>
                    <Home />
                  </Suspense>
                              </MobileLayout>
            </ErrorBoundary>
          </ProtectedRoute>
        } />
        <Route path="/library" element={
          <ProtectedRoute>
            <ErrorBoundary>
              <MobileLayout showNavigation={true}>
                                  <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gaming-primary"></div></div>}>
                    <Library />
                  </Suspense>
                              </MobileLayout>
            </ErrorBoundary>
          </ProtectedRoute>
        } />
        <Route path="/library/add" element={
          <ProtectedRoute>
            <ErrorBoundary>
              <MobileLayout showNavigation={false}>
                                  <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gaming-primary"></div></div>}>
                    <Library />
                  </Suspense>
                              </MobileLayout>
            </ErrorBoundary>
          </ProtectedRoute>
        } />
        <Route path="/library/game/:gameId" element={
          <ProtectedRoute>
            <ErrorBoundary>
              <MobileLayout showNavigation={false}>
                                  <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gaming-primary"></div></div>}>
                    <GameDetailsPage />
                  </Suspense>
                              </MobileLayout>
            </ErrorBoundary>
          </ProtectedRoute>
        } />
        <Route path="/identity" element={
          <ProtectedRoute>
            <ErrorBoundary>
              <MobileLayout showNavigation={false}>
                                  <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gaming-primary"></div></div>}>
                    <Identity />
                  </Suspense>
                              </MobileLayout>
            </ErrorBoundary>
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute>
            <ErrorBoundary>
              <MobileLayout showNavigation={false}>
                                  <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gaming-primary"></div></div>}>
                    <Analytics />
                  </Suspense>
                              </MobileLayout>
            </ErrorBoundary>
          </ProtectedRoute>
        } />
        <Route path="/insights" element={<Navigate to="/analytics" replace />} />
        <Route path="/integrations" element={
          <ProtectedRoute>
            <ErrorBoundary>
              <MobileLayout showNavigation={false}>
                                  <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gaming-primary"></div></div>}>
                    <Integrations />
                  </Suspense>
                              </MobileLayout>
            </ErrorBoundary>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <ErrorBoundary>
              <MobileLayout showNavigation={false}>
                                  <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gaming-primary"></div></div>}>
                    <Settings />
                  </Suspense>
                              </MobileLayout>
            </ErrorBoundary>
          </ProtectedRoute>
        } />
        <Route path="/customisation" element={
          <ProtectedRoute>
            <ErrorBoundary>
              <MobileLayout showNavigation={false}>
                                  <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gaming-primary"></div></div>}>
                    <CustomisationPage />
                  </Suspense>
                              </MobileLayout>
            </ErrorBoundary>
          </ProtectedRoute>
        } />
        <Route path="/help" element={
          <ProtectedRoute>
            <ErrorBoundary>
              <MobileLayout showNavigation={false}>
                                  <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gaming-primary"></div></div>}>
                    <HelpDocumentation />
                  </Suspense>
                              </MobileLayout>
            </ErrorBoundary>
          </ProtectedRoute>
        } />
        <Route path="/coach" element={
          <ProtectedRoute>
            <ErrorBoundary>
              <MobileLayout showNavigation={false}>
                                  <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gaming-primary"></div></div>}>
                    <PremiumCoachingDashboard />
                  </Suspense>
                              </MobileLayout>
            </ErrorBoundary>
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Help Button - Always visible */}
      <HelpButton />
    </div>
  )
}

export default App
