import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CitySelector from './CitySelector';

export default function Navbar() {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path) => location.pathname === path;
  const isOwner = userProfile?.role === 'owner';

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          {/* Logo and City Selector */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2" data-testid="logo">
              <span className="text-xl">🏠</span>
              <span className="text-lg font-bold text-blue-600">RentSaathi</span>
            </Link>
            <div className="hidden sm:block">
              <CitySelector compact />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link 
              to="/browse" 
              className={`px-3 py-2 text-sm font-medium transition ${isActive('/browse') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
              data-testid="nav-browse"
            >
              Browse
            </Link>
            {currentUser && (
              <>
                <Link 
                  to="/favorites" 
                  className={`px-3 py-2 text-sm font-medium transition ${isActive('/favorites') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
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

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center space-x-2 focus:outline-none"
                  data-testid="profile-dropdown-btn"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">
                      {(userProfile?.name || currentUser?.displayName || currentUser?.email)?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <svg className="w-4 h-4 text-gray-500 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {profileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1" data-testid="profile-dropdown">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {userProfile?.name || currentUser?.displayName || 'User'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {userProfile?.role === 'owner' ? '🏠 Owner' : '👤 Renter'}
                      </p>
                    </div>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setProfileDropdown(false)}
                      data-testid="nav-dashboard"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/favorites"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setProfileDropdown(false)}
                    >
                      Saved Listings
                    </Link>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setProfileDropdown(false)}
                      data-testid="nav-profile"
                    >
                      Profile
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                      data-testid="logout-btn"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 transition"
                  data-testid="nav-login"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                  data-testid="nav-register"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              data-testid="mobile-menu-btn"
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
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100" data-testid="mobile-menu">
          <div className="px-4 py-3 space-y-2">
            {/* City Selector for Mobile */}
            <div className="pb-2 border-b border-gray-100">
              <CitySelector />
            </div>
            
            <Link
              to="/browse"
              className="block px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Listings
            </Link>
            {currentUser && (
              <>
                <Link
                  to="/favorites"
                  className="block px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ❤️ Saved Listings
                </Link>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {isOwner && (
                  <Link
                    to="/create-listing"
                    className="block px-3 py-2 rounded-lg bg-blue-600 text-white text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    + Post Listing
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
