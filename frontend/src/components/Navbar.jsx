import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
// import CitySelector from './CitySelector';
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
            {/* ...existing code... */}
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
                  <>
                    <Link
                      to="/create-listing"
                      className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      data-testid="nav-list-property"
                    >
                      List Property
                    </Link>
                    <Link
                      to="/my-listings"
                      className="ml-2 px-4 py-2 bg-gray-100 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-100 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      data-testid="nav-my-listings"
                    >
                      My Listings
                    </Link>
                  </>
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

            {/* Intent Dropdown */}
            <IntentDropdown currentUser={currentUser} userProfile={userProfile} />

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

        {/* ...existing code... */}
      </div>

      {/* Hamburger Menu - Mobile Drawer */}
      {mobileMenuOpen && (
        <>
          {/* Invisible click-blocking layer */}
          <div
            className="fixed inset-0 z-40 cursor-pointer"
            style={{ background: 'transparent' }}
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          />
          {/* Prevent background scroll */}
          <style>{`body { overflow: hidden !important; }`}</style>
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-lg z-50 max-h-[85vh] overflow-y-auto" data-testid="mobile-menu">
            <div className="px-4 pt-4 pb-6">
              {/* TOP SECTION: Profile Card */}
              {currentUser ? (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    {currentUser.photoURL ? (
                      <img src={currentUser.photoURL} alt="avatar" className="w-12 h-12 rounded-full object-cover bg-gray-200 flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-bold text-lg">{userInitial}</span>
                      </div>
                    )}
                    {/* Name and role */}
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-gray-900 truncate">{userName}</p>
                      <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-xs font-medium ${isOwner ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                        {isOwner ? 'Owner' : 'Renter'}
                      </span>
                      <Link
                        to="/profile"
                        className="block text-xs text-blue-600 hover:underline mt-1"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Profile Settings
                      </Link>
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

                    {isOwner ? (
                      <>
                        <Link
                          to="/my-listings"
                          className="flex items-center px-4 py-3 rounded-lg bg-gray-100 text-blue-700 font-semibold hover:bg-blue-100 transition shadow-sm"
                          onClick={() => setMobileMenuOpen(false)}
                          data-testid="nav-my-listings-mobile"
                        >
                          <span className="text-lg mr-3">📋</span>
                          My Listings
                        </Link>
                        <Link
                          to="/create-listing"
                          className="flex items-center px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-sm"
                          onClick={() => setMobileMenuOpen(false)}
                          data-testid="nav-list-property-mobile"
                        >
                          <span className="text-lg mr-3">➕</span>
                          List Property
                        </Link>
                      </>
                    ) : null}
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
        </>
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

function IntentDropdown({ currentUser, userProfile }) {
  const options = [
    { value: 'rent', label: 'looking for Rent' },
    { value: 'list', label: 'List my property' }
  ];
  let initialIntent = '';
  if (currentUser && userProfile?.intent) {
    initialIntent = userProfile.intent;
  } else if (typeof window !== 'undefined') {
    initialIntent = localStorage.getItem('intent') || '';
  }
  const [intent, setIntent] = useState(initialIntent);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Save intent to userProfile or localStorage
  const handleSelect = (value) => {
    setIntent(value);
    setOpen(false);
    if (currentUser && userProfile) {
      userProfile.intent = value;
    } else if (typeof window !== 'undefined') {
      localStorage.setItem('intent', value);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Chevron icon
  const Chevron = (
    <svg className={`w-6 h-6 text-gray-600 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </svg>
  );

  return (
    <div ref={dropdownRef} className="relative mx-1">
      <button
        className={`flex items-center justify-center p-2 rounded-full border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${open ? 'ring-2 ring-blue-500' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        type="button"
        title={intent ? options.find(o => o.value === intent)?.label : 'Choose intent'}
      >
        {Chevron}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {options.map(opt => (
            <button
              key={opt.value}
              className={`block w-full text-left px-4 py-3 text-sm hover:bg-blue-50 ${intent === opt.value ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}
              onClick={() => handleSelect(opt.value)}
              type="button"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
