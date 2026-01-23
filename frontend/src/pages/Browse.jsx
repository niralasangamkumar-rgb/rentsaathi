import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ListingCard from '../components/ListingCard';
import CategoryFilter from '../components/CategoryFilter';
import { getRegularListings, getAreas } from '../services/listingService';
import { useAuth } from '../contexts/AuthContext';
import { useCity } from '../contexts/CityContext';
import { getUserFavorites } from '../services/favoriteService';

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const { selectedCity } = useCity();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || null);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedArea, setSelectedArea] = useState('');
  const [areas, setAreas] = useState([]);
  const [selectedPropertyType, setSelectedPropertyType] = useState('');
  const [selectedTenantPref, setSelectedTenantPref] = useState('');
  const [selectedFurnishing, setSelectedFurnishing] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadListings(true);
    loadAreas();
    if (currentUser) {
      loadFavorites();
    }
  }, [selectedCategory, currentUser, selectedCity]);

  const loadListings = async (reset = false) => {
    setLoading(true);
    try {
      const filters = {};
      if (selectedCity) filters.cityId = selectedCity.id;
      if (selectedCategory) filters.category = selectedCategory;
      if (priceRange.min) filters.minPrice = parseInt(priceRange.min);
      if (priceRange.max) filters.maxPrice = parseInt(priceRange.max);
      if (selectedArea) filters.area = selectedArea;
      if (selectedPropertyType) filters.propertyType = selectedPropertyType;
      if (selectedTenantPref) filters.tenantPreference = selectedTenantPref;
      if (selectedFurnishing) filters.furnishingStatus = selectedFurnishing;
      if (selectedAvailability) filters.availability = selectedAvailability;

      const { listings: newListings, lastDoc: newLastDoc } = await getRegularListings(
        filters,
        reset ? null : lastDoc,
        12
      );

      if (reset) {
        setListings(newListings);
      } else {
        setListings((prev) => [...prev, ...newListings]);
      }

      setLastDoc(newLastDoc);
      setHasMore(newListings.length === 12);
    } catch (error) {
      console.error('Error loading listings:', error);
    }
    setLoading(false);
  };

  const loadAreas = async () => {
    try {
      const areaList = await getAreas(selectedCity?.id);
      setAreas(areaList);
    } catch (error) {
      console.error('Error loading areas:', error);
    }
  };

  const loadFavorites = async () => {
    try {
      const favs = await getUserFavorites(currentUser.uid);
      setFavorites(favs);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category) {
      setSearchParams({ category });
    } else {
      setSearchParams({});
    }
  };

  const handleApplyFilters = () => {
    loadListings(true);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setPriceRange({ min: '', max: '' });
    setSelectedArea('');
    setSelectedPropertyType('');
    setSelectedTenantPref('');
    setSelectedFurnishing('');
    setSelectedAvailability('');
    setSelectedCategory(null);
    setSearchParams({});
    loadListings(true);
    setShowFilters(false);
  };

  return (
    <>
      <style>{`
        input[type='range'] {
          -webkit-appearance: none;
          appearance: none;
        }
        
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        input[type='range']::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        input[type='range']::-webkit-slider-thumb:hover {
          background: #1d4ed8;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        
        input[type='range']::-moz-range-thumb:hover {
          background: #1d4ed8;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
      `}</style>
      <div className="min-h-screen bg-gray-50" data-testid="browse-page">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* City Info */}
            {/* City Info: Show only if city is selected and not Mumbai */}
            {selectedCity?.name && selectedCity.name.toLowerCase() !== 'mumbai' && (
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {selectedCity.name}
              </div>
            )}
            
            <div className="flex-1" />
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition pointer-events-auto z-50"
              data-testid="filter-btn"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>Filters</span>
            </button>
          </div>

          {/* Category Filter */}
          <div className="mt-4">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategoryChange}
            />
          </div>
        </div>
      </div>

      {/* Filters Panel - Desktop */}
      {showFilters && (
        <div className="hidden lg:block bg-white border-b border-gray-100 shadow-sm sticky top-32 z-40" data-testid="filters-panel-desktop">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Filters Grid - Desktop: 3 cols */}
            <div className="grid lg:grid-cols-3 gap-4 mb-6">
              {/* Price Range Slider */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <div className="mb-3">
                  <div className="text-sm text-gray-600 mb-3">
                    ₹{priceRange.min || 0} – ₹{priceRange.max || 100000}
                  </div>
                  
                  {/* Slider Container */}
                  <div className="relative h-8 flex items-center">
                    {/* Track Background */}
                    <div className="absolute w-full h-1 bg-gray-200 rounded-lg" />
                    
                    {/* Track Fill */}
                    <div 
                      className="absolute h-1 bg-blue-600 rounded-lg"
                      style={{
                        left: `${((priceRange.min || 0) / 100000) * 100}%`,
                        right: `${100 - ((priceRange.max || 100000) / 100000) * 100}%`
                      }}
                    />
                    
                    {/* Min Range Input */}
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      step="500"
                      value={priceRange.min || 0}
                      onChange={(e) => {
                        const newMin = Math.min(parseInt(e.target.value), parseInt(priceRange.max || 100000));
                        setPriceRange({ ...priceRange, min: newMin });
                      }}
                      className="absolute w-full h-1 bg-transparent rounded-lg appearance-none cursor-pointer pointer-events-auto"
                      style={{
                        zIndex: (priceRange.min || 0) > 50000 ? 5 : 3,
                      }}
                      data-testid="min-price-input"
                    />
                    
                    {/* Max Range Input */}
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      step="500"
                      value={priceRange.max || 100000}
                      onChange={(e) => {
                        const newMax = Math.max(parseInt(e.target.value), parseInt(priceRange.min || 0));
                        setPriceRange({ ...priceRange, max: newMax });
                      }}
                      className="absolute w-full h-1 bg-transparent rounded-lg appearance-none cursor-pointer pointer-events-auto"
                      style={{
                        zIndex: (priceRange.max || 100000) < 50000 ? 3 : 5,
                      }}
                      data-testid="max-price-input"
                    />
                  </div>
                </div>
              </div>

              {/* Area Filter */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">Area / Locality</label>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  data-testid="area-filter"
                >
                  <option value="">All Areas</option>
                  {areas.map((area) => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>

              {/* Property Type Filter */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                <select
                  value={selectedPropertyType}
                  onChange={(e) => setSelectedPropertyType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  data-testid="property-type-filter"
                >
                  <option value="">All Types</option>
                  <option value="room">Room</option>
                  <option value="pg_hostel">PG/Hostel</option>
                  <option value="flat">Flat</option>
                  <option value="commercial">Commercial</option>
                  <option value="bike_rent">Bike Rent</option>
                  <option value="car_rent">Car Rent</option>
                </select>
              </div>

              {/* Tenant Preference Filter */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tenant Preference</label>
                <select
                  value={selectedTenantPref}
                  onChange={(e) => setSelectedTenantPref(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  data-testid="tenant-pref-filter"
                >
                  <option value="">Any</option>
                  <option value="boys">Boys</option>
                  <option value="girls">Girls</option>
                </select>
              </div>

              {/* Furnishing Status Filter */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">Furnishing</label>
                <select
                  value={selectedFurnishing}
                  onChange={(e) => setSelectedFurnishing(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  data-testid="furnishing-filter"
                >
                  <option value="">All</option>
                  <option value="fully_furnished">Fully Furnished</option>
                  <option value="semi_furnished">Semi Furnished</option>
                  <option value="unfurnished">Unfurnished</option>
                </select>
              </div>

              {/* Availability Filter */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                <select
                  value={selectedAvailability}
                  onChange={(e) => setSelectedAvailability(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  data-testid="availability-filter"
                >
                  <option value="">Any</option>
                  <option value="available">Available Now</option>
                  <option value="soon">Coming Soon</option>
                </select>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleApplyFilters}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition text-sm"
                data-testid="apply-filters-btn"
              >
                Apply Filters
              </button>
              <button
                onClick={handleClearFilters}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition text-sm"
                data-testid="clear-filters-btn"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Filter Drawer Backdrop */}
      {showFilters && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-40 z-40 top-16"
          onClick={() => setShowFilters(false)}
          data-testid="filter-backdrop"
        />
      )}

      {/* Filters Panel - Mobile */}
      {showFilters && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-lg shadow-lg z-50 max-h-[85vh] overflow-y-auto" data-testid="filters-panel-mobile">
          <div className="px-4 sm:px-6 py-6">
            {/* Mobile Filter Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                aria-label="Close filters"
              >
                ×
              </button>
            </div>

            {/* Filters Grid - Mobile: 1 col */}
            <div className="grid grid-cols-1 gap-4 mb-6">
              {/* Price Range Slider */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <div className="mb-3">
                  <div className="text-sm text-gray-600 mb-3">
                    ₹{priceRange.min || 0} – ₹{priceRange.max || 100000}
                  </div>
                  
                  {/* Slider Container */}
                  <div className="relative h-8 flex items-center">
                    {/* Track Background */}
                    <div className="absolute w-full h-1 bg-gray-200 rounded-lg" />
                    
                    {/* Track Fill */}
                    <div 
                      className="absolute h-1 bg-blue-600 rounded-lg"
                      style={{
                        left: `${((priceRange.min || 0) / 100000) * 100}%`,
                        right: `${100 - ((priceRange.max || 100000) / 100000) * 100}%`
                      }}
                    />
                    
                    {/* Min Range Input */}
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      step="500"
                      value={priceRange.min || 0}
                      onChange={(e) => {
                        const newMin = Math.min(parseInt(e.target.value), parseInt(priceRange.max || 100000));
                        setPriceRange({ ...priceRange, min: newMin });
                      }}
                      className="absolute w-full h-1 bg-transparent rounded-lg appearance-none cursor-pointer pointer-events-auto"
                      style={{
                        zIndex: (priceRange.min || 0) > 50000 ? 5 : 3,
                      }}
                      data-testid="min-price-input"
                    />
                    
                    {/* Max Range Input */}
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      step="500"
                      value={priceRange.max || 100000}
                      onChange={(e) => {
                        const newMax = Math.max(parseInt(e.target.value), parseInt(priceRange.min || 0));
                        setPriceRange({ ...priceRange, max: newMax });
                      }}
                      className="absolute w-full h-1 bg-transparent rounded-lg appearance-none cursor-pointer pointer-events-auto"
                      style={{
                        zIndex: (priceRange.max || 100000) < 50000 ? 3 : 5,
                      }}
                      data-testid="max-price-input"
                    />
                  </div>
                </div>
              </div>

              {/* Area Filter */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">Area / Locality</label>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  data-testid="area-filter"
                >
                  <option value="">All Areas</option>
                  {areas.map((area) => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>

              {/* Property Type Filter */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                <select
                  value={selectedPropertyType}
                  onChange={(e) => setSelectedPropertyType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  data-testid="property-type-filter"
                >
                  <option value="">All Types</option>
                  <option value="room">Room</option>
                  <option value="pg_hostel">PG/Hostel</option>
                  <option value="flat">Flat</option>
                  <option value="commercial">Commercial</option>
                  <option value="bike_rent">Bike Rent</option>
                  <option value="car_rent">Car Rent</option>
                </select>
              </div>

              {/* Tenant Preference Filter */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">Tenant Preference</label>
                <select
                  value={selectedTenantPref}
                  onChange={(e) => setSelectedTenantPref(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  data-testid="tenant-pref-filter"
                >
                  <option value="">Any</option>
                  <option value="boys">Boys</option>
                  <option value="girls">Girls</option>
                </select>
              </div>

              {/* Furnishing Status Filter */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">Furnishing</label>
                <select
                  value={selectedFurnishing}
                  onChange={(e) => setSelectedFurnishing(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  data-testid="furnishing-filter"
                >
                  <option value="">All</option>
                  <option value="fully_furnished">Fully Furnished</option>
                  <option value="semi_furnished">Semi Furnished</option>
                  <option value="unfurnished">Unfurnished</option>
                </select>
              </div>

              {/* Availability Filter */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                <select
                  value={selectedAvailability}
                  onChange={(e) => setSelectedAvailability(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  data-testid="availability-filter"
                >
                  <option value="">Any</option>
                  <option value="available">Available Now</option>
                  <option value="soon">Coming Soon</option>
                </select>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="grid grid-cols-1 gap-2 pt-4 border-t border-gray-100">
              <button
                onClick={handleApplyFilters}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition text-sm"
                data-testid="apply-filters-btn"
              >
                Apply Filters
              </button>
              <button
                onClick={handleClearFilters}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition text-sm"
                data-testid="clear-filters-btn"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Listings Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-800">
            {selectedCategory
              ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Rentals`
              : 'All Listings'}
            {selectedCity?.name && selectedCity.name.toLowerCase() !== 'mumbai' && (
              <span className="text-gray-500 font-normal text-base ml-2">in {selectedCity.name}</span>
            )}
          </h1>
          <span className="text-sm text-gray-500">{listings.length} results</span>
        </div>

        {loading && listings.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-72 animate-pulse" />
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings
                .filter((listing) => {
                  if (!selectedCategory) return true;
                  return listing.category === selectedCategory;
                })
                .map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    isFavorited={favorites.includes(listing.id)}
                  />
                ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={() => loadListings(false)}
                  disabled={loading}
                  className="px-6 py-3 bg-white border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                  data-testid="load-more-btn"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No listings found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your filters or check back later</p>
          </div>
        )}
      </div>
      </div>
    </>
  );
}
