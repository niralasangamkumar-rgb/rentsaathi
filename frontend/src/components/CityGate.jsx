import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useCity } from '../contexts/CityContext';
import { CITIES } from '../config/cities';

export default function CityGate({ children }) {
  const { selectedCity, loading, selectCity } = useCity();
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  
  // Allow auth pages without city selection
  const authPages = ['/login', '/register', '/complete-profile'];
  const isAuthPage = authPages.some(page => location.pathname.startsWith(page));

  // Defensive filtering to prevent crash
  const filteredCities = (CITIES || []).filter(city => {
    const cityName = city?.name || '';
    const cityState = city?.state || '';
    const searchLower = (searchTerm || '').toLowerCase();
    return (
      cityName.toLowerCase().includes(searchLower) ||
      cityState.toLowerCase().includes(searchLower)
    );
  });

  const handleSelect = (city) => {
    selectCity(city);
  };

  // If city is already selected OR on auth pages, show the app
  if (selectedCity || isAuthPage) {
    return children;
  }

  // Show city selection screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4" data-testid="city-gate">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-4xl">🏠</span>
            <span className="text-3xl font-bold text-blue-600">RentSaathi</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-800">Welcome!</h1>
          <p className="text-gray-500 mt-2">Select your city to get started</p>
        </div>

        {/* Search Input */}
        <div className="mb-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-testid="city-gate-search"
            />
          </div>
        </div>

        {/* Cities Grid */}
        {/* Always show CITIES, loading only affects skeleton */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredCities.map((city) => (
              <button
                key={city.id}
                onClick={() => handleSelect(city)}
                className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition text-left group"
                data-testid={`city-gate-option-${city.id}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{city.name}</p>
                    {city.state && (
                      <p className="text-xs text-gray-500">{city.state}</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {filteredCities.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            <p>No cities found</p>
          </div>
        )}

        {/* Info */}
        <p className="text-center text-xs text-gray-400 mt-6">
          More cities coming soon!
        </p>
      </div>
    </div>
  );
}
