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
    setSelectedCategory(null);
    setSearchParams({});
    loadListings(true);
    setShowFilters(false);
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="browse-page">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* City Info */}
            {selectedCity && (
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
              className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
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

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b border-gray-100 shadow-sm" data-testid="filters-panel">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    data-testid="min-price-input"
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    data-testid="max-price-input"
                  />
                </div>
              </div>

              {/* Area Filter */}
              <div>
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

              {/* Filter Actions */}
              <div className="flex items-end gap-2">
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition text-sm"
                  data-testid="apply-filters-btn"
                >
                  Apply Filters
                </button>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition text-sm"
                  data-testid="clear-filters-btn"
                >
                  Clear
                </button>
              </div>
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
            {selectedCity && <span className="text-gray-500 font-normal text-base ml-2">in {selectedCity.name}</span>}
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
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings.map((listing) => (
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
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No listings found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your filters or check back later</p>
          </div>
        )}
      </div>
    </div>
  );
}
