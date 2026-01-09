import { useState, useRef, useEffect } from 'react';
import { useCity } from '../contexts/CityContext';

export default function CitySelector({ compact = false }) {
  const { selectedCity, cities, loading, selectCity } = useCity();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    city.state?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (city) => {
    selectCity(city);
    setIsOpen(false);
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 rounded-lg h-10 w-32"></div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef} data-testid="city-selector">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition ${
          compact 
            ? 'bg-white border-gray-200 hover:border-blue-300' 
            : 'bg-white border-gray-200 hover:border-blue-300 shadow-sm'
        }`}
        data-testid="city-selector-btn"
      >
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className={`font-medium ${selectedCity ? 'text-gray-800' : 'text-gray-500'}`}>
          {selectedCity ? selectedCity.name : 'Select City'}
        </span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden" data-testid="city-dropdown">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-100">
            <input
              type="text"
              placeholder="Search city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              data-testid="city-search-input"
            />
          </div>

          {/* Cities List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredCities.length > 0 ? (
              filteredCities.map((city) => (
                <button
                  key={city.id}
                  onClick={() => handleSelect(city)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition flex items-center justify-between ${
                    selectedCity?.id === city.id ? 'bg-blue-50' : ''
                  }`}
                  data-testid={`city-option-${city.id}`}
                >
                  <div>
                    <p className="font-medium text-gray-800">{city.name}</p>
                    {city.state && (
                      <p className="text-xs text-gray-500">{city.state}</p>
                    )}
                  </div>
                  {selectedCity?.id === city.id && (
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-gray-500 text-sm">
                No cities found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
