import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/authStore'

interface NavigationProps {
  isAuthenticated: boolean
  user?: any
}

export const Navigation: React.FC<NavigationProps> = ({ 
  isAuthenticated, 
  user
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Handle scroll effect for mobile navigation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  const navigationItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/library', label: 'Library', icon: '📚' },
    { path: '/coach', label: 'Coach', icon: '🧠' },
    { path: '/analytics', label: 'Analytics', icon: '📊' },
    { path: '/identity', label: 'Identity', icon: '👤' },
    { path: '/integrations', label: 'Integrations', icon: '🔗' },
    { path: '/customisation', label: 'Customisation', icon: '🎨' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
    { path: '/donate', label: 'Support', icon: '💝' },
  ]

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true
    return location.pathname.startsWith(path) && path !== '/'
  }

  // Mock user for development mode
  const displayUser = user

  return (
    <>
      {/* Desktop Navigation */}
      <nav className={`
        hidden md:block glass-morphism border-b border-white/10 fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${isScrolled ? 'py-2' : 'py-4'}
      `}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-8">
              <Link 
                to="/" 
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
              >
                <img 
                  src="/logo/a 3_4 angled disc lo.png" 
                  alt="GamePilot" 
                  className="h-8 w-auto object-contain"
                />
                <span className="text-2xl font-gaming bg-gradient-to-r from-gaming-primary to-gaming-secondary bg-clip-text text-transparent">
                  GamePilot
                </span>
              </Link>
              
              {/* Navigation Links */}
              <div className="hidden lg:flex items-center space-x-6">
                {navigationItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200
                      ${isActive(item.path) 
                        ? 'bg-gaming-primary/20 text-gaming-primary border border-gaming-primary/30' 
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }
                    `}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* User Section */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <div className="hidden sm:block">
                    <span className="text-white/70 text-sm">
                      Welcome, {displayUser?.username}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium bg-gaming-primary text-white hover:bg-gaming-primary/80 rounded-lg transition-all"
                  >
                    Register
                  </Link>
                </div>
              )}
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Toggle menu"
              >
                <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                  <span className={`block h-0.5 w-6 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                  <span className={`block h-0.5 w-6 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
                  <span className={`block h-0.5 w-6 bg-current transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Mobile Menu */}
          <div className="fixed top-0 left-0 right-0 z-50 lg:hidden">
            <div className="glass-morphism border-b border-white/10">
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between mb-6">
                  <Link 
                    to="/" 
                    className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                  >
                    <img 
                      src="/logo/a 3_4 angled disc lo.png" 
                      alt="GamePilot" 
                      className="h-8 w-auto object-contain"
                    />
                    <span className="text-xl font-gaming bg-gradient-to-r from-gaming-primary to-gaming-secondary bg-clip-text text-transparent">
                      GamePilot
                    </span>
                  </Link>
                  
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Close menu"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Mobile User Info */}
                <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                  {isAuthenticated ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gaming-primary rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {displayUser?.username?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <div className="text-white font-medium">{displayUser?.username}</div>
                          <div className="text-gray-400 text-sm">Welcome back!</div>
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="px-3 py-1 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-white font-medium mb-2">Welcome to GamePilot</div>
                      <div className="flex flex-col space-y-2">
                        <Link
                          to="/login"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="w-full px-4 py-2 text-center text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                        >
                          Login
                        </Link>
                        <Link
                          to="/register"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="w-full px-4 py-2 text-center text-sm font-medium bg-gaming-primary text-white hover:bg-gaming-primary/80 rounded-lg transition-all"
                        >
                          Register
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile Navigation Links */}
                <div className="space-y-2">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        flex items-center space-x-3 w-full px-4 py-3 rounded-lg font-medium transition-all duration-200
                        ${isActive(item.path) 
                          ? 'bg-gaming-primary/20 text-gaming-primary border border-gaming-primary/30' 
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                        }
                      `}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-lg">{item.label}</span>
                      {isActive(item.path) && (
                        <span className="ml-auto">
                          <svg className="w-5 h-5 text-gaming-primary" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Spacer for fixed navigation */}
      <div className="h-16 md:h-20" />
    </>
  )
}
