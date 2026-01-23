import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ListingCard from '../components/ListingCard';
import CategoryFilter from '../components/CategoryFilter';
import SearchBar from '../components/SearchBar';
import { getRegularListings, getFeaturedListings, getUserListings, categories } from '../services/listingService';
import { useAuth } from '../contexts/AuthContext';
import { useCity } from '../contexts/CityContext';
import { getUserFavorites } from '../services/favoriteService';
import { CITIES } from '../config/cities';

export default function Home() {
  const { currentUser, userProfile } = useAuth();
  const { selectedCity } = useCity();
  const [featuredListings, setFeaturedListings] = useState([]);
  const [regularListings, setRegularListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const observer = useRef();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [favorites, setFavorites] = useState([]);
  // displayCity state: null by default, set only after user search/select
  const [displayCity, setDisplayCity] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredListings, setFilteredListings] = useState([]);
  const [ownerListingCount, setOwnerListingCount] = useState(0);


  // Reset listings and pagination on category/search/city change
  useEffect(() => {
    setRegularListings([]);
    setLastDoc(null);
    setHasMore(true);
    fetchListings(true);
    // eslint-disable-next-line
  }, [selectedCategory, searchQuery, selectedCity]);

  // Load favorites on user change
  useEffect(() => {
    if (currentUser) {
      loadFavorites();
    }
  }, [currentUser]);

  // Fetch listings (initial or next batch)
  const fetchListings = useCallback(async (reset = false) => {
    if (listingsLoading || (!hasMore && !reset)) return;
    setListingsLoading(true);
    const filters = {};
    if (selectedCategory) filters.category = selectedCategory;
    if (selectedCity?.id) filters.cityId = selectedCity.id;
    let startAfterDoc = reset ? null : lastDoc;
    const { listings, lastDoc: newLastDoc } = await getRegularListings(filters, startAfterDoc, 25);
    let newListings = reset ? listings : [...regularListings, ...listings];
    setRegularListings(newListings);
    setLastDoc(newLastDoc);
    setHasMore(!!newLastDoc && listings.length === 25);
    setListingsLoading(false);
    setLoading(false);
  }, [selectedCity, selectedCategory, lastDoc, hasMore, listingsLoading, regularListings]);

  // Infinite scroll observer
  const lastListingRef = useCallback(node => {
    if (listingsLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new window.IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchListings();
      }
    });
    if (node) observer.current.observe(node);
  }, [listingsLoading, hasMore, fetchListings]);

  const loadFavorites = async () => {
    try {
      const favs = await getUserFavorites(currentUser.uid);
      setFavorites(favs || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    }
  };

  const handleCitySearch = (term) => {
    if (term.trim()) {
      const lower = term.toLowerCase();
      const found = CITIES.find(c => lower.includes(c.name.toLowerCase()));
      setDisplayCity(found ? found.name : null);
    } else {
      setDisplayCity(null);
    }
  };

  // Helper: extract keywords from search
  function parseSearchKeywords(text) {
    const lower = text.toLowerCase();
    // Cities
    const city = CITIES.find(c => lower.includes(c.name.toLowerCase()));
    // Categories
    const categoryMap = {
      hostel: ['hostel'],
      pg: ['pg'],
      flat: ['flat'],
      room: ['room']
    };
    let category = null;
    for (const [cat, words] of Object.entries(categoryMap)) {
      if (words.some(w => lower.includes(w))) {
        category = cat;
        break;
      }
    }
    // Tenant preference
    let tenantPreference = null;
    if (/(boys?)/.test(lower)) tenantPreference = 'Boys';
    else if (/(girls?)/.test(lower)) tenantPreference = 'Girls';
    else if (/family/.test(lower)) tenantPreference = 'Family';
    // BHK
    let bhk = null;
    const bhkMatch = lower.match(/([1-9])\s*bhk/);
    if (bhkMatch) bhk = bhkMatch[1] + 'BHK';
    return { city, category, tenantPreference, bhk };
  }


  // Filter listings based on search (client-side for tenant/bhk)
  useEffect(() => {
    let filtered = regularListings;
    if (searchQuery.trim()) {
      const { city, category, tenantPreference, bhk } = parseSearchKeywords(searchQuery);
      if (city) filtered = filtered.filter(l => (l.city || l.cityName || '').toLowerCase() === city.name.toLowerCase());
      if (category) filtered = filtered.filter(l => (l.category || '').toLowerCase() === category);
      if (tenantPreference) filtered = filtered.filter(l => (l.tenantPreference || '').toLowerCase() === tenantPreference.toLowerCase());
      if (bhk) filtered = filtered.filter(l => (l.bhk || '').toLowerCase() === bhk.toLowerCase());
    }
    setFilteredListings(filtered);
  }, [searchQuery, regularListings]);

  // Fetch owner listing count
  useEffect(() => {
    async function fetchOwnerCount() {
      if (userProfile?.role === 'owner' && currentUser) {
        const listings = await getUserListings(currentUser.uid);
        setOwnerListingCount(listings.length);
      } else {
        setOwnerListingCount(0);
      }
    }
    fetchOwnerCount();
  }, [userProfile, currentUser]);

  return (
    <div className="min-h-screen bg-gray-50" data-testid="home-page">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1 sm:py-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-2xl md:text-4xl font-bold mb-1" data-testid="hero-title">
              Find Your Perfect
              <span className="text-blue-200"> Rental</span>
            </h1>
            <p className="text-sm md:text-lg text-blue-100 mb-2 md:mb-3">
              Discover hostels, PGs, rooms, flats, commercial spaces, and vehicle rentals all in one place.
            </p>
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <SearchBar 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onSearch={handleCitySearch} 
              />
            </div>
            {/* Selected City Badge */}
            <p className="mt-2 md:mt-4 text-blue-200 text-xs md:text-sm">
              {displayCity ? `📍 Showing listings in ${displayCity}` : '📍 Showing all listings'}
            </p>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      {loading ? (
        <section className="py-6 bg-gradient-to-b from-amber-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-2 mb-6">
              <span className="text-xl">⭐</span>
              <h2 className="text-xl font-bold text-gray-800">Featured Listings</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-xl h-72 animate-pulse" />
              ))}
            </div>
          </div>
        </section>
      ) : (
        featuredListings.length > 0 && (
          <section className="py-6 bg-gradient-to-b from-amber-50 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">⭐</span>
                  <h2 className="text-xl font-bold text-gray-800">Featured Listings</h2>
                </div>
                <Link to="/browse" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  View All →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    isFavorited={favorites.includes(listing.id)}
                    featured
                  />
                ))}
              </div>
            </div>
          </section>
        )
      )}

      {/* Regular Listings */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">All Listings</h2>
            <Link to="/browse" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              View All →
            </Link>
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>

          {/* Listings Grid with Infinite Scroll */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-xl h-72 animate-pulse" />
              ))}
            </div>
          ) : filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredListings.map((listing, idx) => {
                if (idx === filteredListings.length - 1) {
                  return (
                    <div ref={lastListingRef} key={listing.id}>
                      <ListingCard
                        listing={listing}
                        isFavorited={favorites.includes(listing.id)}
                      />
                    </div>
                  );
                }
                return (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    isFavorited={favorites.includes(listing.id)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              {userProfile?.role === 'owner' ? (
                <Link
                  to="/create-listing"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                  data-testid="empty-listing-cta"
                >
                  {ownerListingCount === 0 && 'Post Your First Listing'}
                  {ownerListingCount === 1 && 'Post Your Second Listing'}
                  {ownerListingCount === 2 && 'Post Your Third Listing'}
                  {ownerListingCount > 2 && `Post Your ${ordinal(ownerListingCount + 1)} Listing`}
                </Link>
              ) : (
                <span className="text-gray-500">No listings found.</span>
              )}
            </div>
          )}
          {/* Infinite scroll loading spinner */}
          {listingsLoading && !loading && (
            <div className="flex justify-center py-6">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </section>


      {/* How It Works */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-800 text-center mb-8">How RentSaathi Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">🔍</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Search</h3>
              <p className="text-gray-600 text-sm">Browse through rental listings</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">📞</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Contact</h3>
              <p className="text-gray-600 text-sm">Call or WhatsApp the owner</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">✅</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Rent</h3>
              <p className="text-gray-600 text-sm">Visit and finalize your rental</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!currentUser && (
        <section className="py-12 bg-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">Ready to find your rental?</h2>
            <p className="text-blue-100 mb-6">Join thousands of users on RentSaathi</p>
            <Link
              to="/register"
              className="inline-block px-6 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-100 transition"
              data-testid="cta-signup"
            >
              Get Started Free
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-xl">🏠</span>
                <span className="text-lg font-bold text-white">RentSaathi</span>
              </div>
              <p className="text-xs">Your trusted rental marketplace.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Properties</h4>
              <ul className="space-y-1 text-xs">
                <li><Link to="/browse?category=hostel" className="hover:text-white">Hostels</Link></li>
                <li><Link to="/browse?category=pg" className="hover:text-white">PG</Link></li>
                <li><Link to="/browse?category=flat" className="hover:text-white">Flats</Link></li>
                <li><Link to="/browse?category=room" className="hover:text-white">Rooms</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Vehicles</h4>
              <ul className="space-y-1 text-xs">
                <li><Link to="/browse?category=bike" className="hover:text-white">Bike Rent</Link></li>
                <li><Link to="/browse?category=car" className="hover:text-white">Car Rent</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Support</h4>
              <ul className="space-y-1 text-xs">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-6 pt-6 text-center text-xs">
            <p>© 2025 RentSaathi. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper function for ordinal numbers
function ordinal(n) {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
