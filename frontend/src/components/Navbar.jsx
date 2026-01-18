import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CitySelector from './CitySelector';
import logoImage from '../assets/rentsaathi-logo.png';

export default function Navbar({ onFilterClick }) {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setMobileMenuOpen(false);
      setDesktopDropdownOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path) => location.pathname === path;
  const isOwner = userProfile?.role === 'owner';
  const userName = userProfile?.name || currentUser?.displayName || currentUser?.email || 'User';
  const userInitial = userName?.charAt(0).toUpperCase();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 sm:h-20 lg:h-16">
          {/* Left: Logo and City Selector */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <Link to="/" className="flex-shrink-0 hover:opacity-85 transition duration-200 -ml-2 sm:-ml-4" data-testid="logo">
              <img 
                src={logoImage} 
                alt="RentSaathi Logo" 
                className="h-28 sm:h-38 lg:h-34 w-auto object-contain object-left"
                style={{
                  imageRendering: 'crisp-edges',
                  backfaceVisibility: 'hidden',
                  WebkitFontSmoothing: 'antialiased',
                  WebkitBackfaceVisibility: 'hidden',
                  filter: 'contrast(1.05)'
                }}
              />
            </Link>
            <div className="hidden sm:block">
              <CitySelector compact />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-6">
            <Link 
              to="/browse" 
              className={`text-sm font-medium transition ${isActive('/browse') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              data-testid="nav-browse"
            >
              Browse
            </Link>
            {currentUser && (
              <>
                <Link 
                  to="/favorites" 
                  className={`text-sm font-medium transition ${isActive('/favorites') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
                  data-testid="nav-favorites"
                >
                  ❤️ Saved
                </Link>
                {isOwner && (
                  <Link 
                    to="/create-listing" 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                    data-testid="nav-create-listing"
                  >
                    + Post
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right: Filter Icon + Hamburger Menu */}
          <div className="flex items-center justify-end space-x-2">
            {/* Filter Button */}
            {onFilterClick && (
              <button
                onClick={onFilterClick}
                className="p-2.5 lg:p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                title="Filters"
                aria-label="Open filters"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
            )}

            {/* Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 lg:p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
              data-testid="mobile-menu-btn"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile City Selector */}
        {mobileMenuOpen && (
          <div className="lg:hidden px-4 py-2 border-t border-gray-100">
            <CitySelector />
          </div>
        )}
      </div>

      {/* Hamburger Menu - Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-40 z-40" onClick={() => setMobileMenuOpen(false)} data-testid="mobile-menu-backdrop" />
      )}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-lg z-50 max-h-[85vh] overflow-y-auto" data-testid="mobile-menu">
          <div className="px-4 py-6">
            {/* TOP SECTION: Profile Block */}
            {currentUser ? (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-lg">{userInitial}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                    <p className="text-xs text-gray-500">
                      {isOwner ? '🏠 Property Owner' : '👤 Renter'}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* MIDDLE SECTION: Navigation Items */}
            <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
              <Link
                to="/browse"
                className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-lg mr-3">🔍</span>
                Browse Listings
              </Link>

              {currentUser && (
                <>
                  <Link
                    to="/favorites"
                    className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
                    onClick={() => setMobileMenuOpen(false)
                    }
                  >
                    <span className="text-lg mr-3">❤️</span>
                    My Likes
                  </Link>

                  <Link
                    to="/dashboard"
                    className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="nav-dashboard"
                  >
                    <span className="text-lg mr-3">📋</span>
                    My Listings
                  </Link>

                  {isOwner && (
                    <Link
                      to="/create-listing"
                      className="flex items-center px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="nav-create-listing"
                    >
                      <span className="text-lg mr-3">➕</span>
                      Post New Listing
                    </Link>
                  )}
                </>
              )}
            </div>

            {/* BOTTOM SECTION: Auth Items */}
            <div className="space-y-2">
              {currentUser ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="nav-profile"
                  >
                    <span className="text-lg mr-3">⚙️</span>
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 font-medium transition"
                    data-testid="logout-btn"
                  >
                    <span className="text-lg mr-3">🚪</span>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="nav-login"
                  >
                    <span className="text-lg mr-3">👤</span>
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="nav-register"
                  >
                    <span className="text-lg mr-3">📝</span>
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Dropdown Menu */}
      {desktopDropdownOpen && (
        <div className="hidden lg:block absolute right-8 top-16 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50" data-testid="desktop-dropdown">
          {/* TOP SECTION: Profile Block */}
          {currentUser ? (
            <div className="px-4 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-lg">{userInitial}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                  <p className="text-xs text-gray-500">
                    {isOwner ? '🏠 Property Owner' : '👤 Renter'}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {/* MIDDLE SECTION: Navigation Items */}
          <div className="py-2">
            {currentUser && (
              <>
                <Link
                  to="/dashboard"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 text-sm font-medium"
                  onClick={() => setDesktopDropdownOpen(false)}
                  data-testid="dropdown-dashboard"
                >
                  My Listings
                </Link>
                <Link
                  to="/favorites"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 text-sm font-medium"
                  onClick={() => setDesktopDropdownOpen(false)}
                >
                  My Likes
                </Link>
              </>
            )}
          </div>

          {/* BOTTOM SECTION: Auth Items */}
          <div className="py-2 border-t border-gray-200">
            {currentUser ? (
              <>
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 text-sm font-medium"
                  onClick={() => setDesktopDropdownOpen(false)}
                  data-testid="dropdown-profile"
                >
                  Profile Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 text-sm font-medium"
                  data-testid="dropdown-logout"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 text-sm font-medium"
                  onClick={() => setDesktopDropdownOpen(false)}
                  data-testid="dropdown-login"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-2 text-blue-600 hover:bg-blue-50 text-sm font-medium"
                  onClick={() => setDesktopDropdownOpen(false)}
                  data-testid="dropdown-register"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
