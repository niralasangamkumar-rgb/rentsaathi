import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ListingCard from '../components/ListingCard';
import CategoryFilter from '../components/CategoryFilter';
import SearchBar from '../components/SearchBar';
import { getRegularListings, getFeaturedListings, categories } from '../services/listingService';
import { useAuth } from '../contexts/AuthContext';
import { useCity } from '../contexts/CityContext';
import { getUserFavorites } from '../services/favoriteService';

export default function Home() {
  const { currentUser, userProfile } = useAuth();
  const { selectedCity } = useCity();
  const [featuredListings, setFeaturedListings] = useState([]);
  const [regularListings, setRegularListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [displayCity, setDisplayCity] = useState('Mumbai');

  useEffect(() => {
    loadListings();
    if (currentUser) {
      loadFavorites();
    }
  }, [selectedCategory, currentUser, selectedCity]);

  const loadListings = async () => {
    setLoading(true);
    try {
      // Load featured listings
      const featured = await getFeaturedListings(selectedCity?.id, 4);
      setFeaturedListings(featured);

      // Load regular listings
      const filters = {};
      if (selectedCategory) filters.category = selectedCategory;
      if (selectedCity) filters.cityId = selectedCity.id;
      const { listings } = await getRegularListings(filters, null, 8);
      setRegularListings(listings);
    } catch (error) {
      console.error('Error loading listings:', error);
    }
    setLoading(false);
  };

  const loadFavorites = async () => {
    try {
      const favs = await getUserFavorites(currentUser.uid);
      setFavorites(favs);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const handleCitySearch = (term) => {
    if (term.trim()) {
      const capitalizedCity = term
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      setDisplayCity(capitalizedCity);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="home-page">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-1" data-testid="hero-title">
              Find Your Perfect
              <span className="text-blue-200"> Rental</span>
            </h1>
            <p className="text-base md:text-lg text-blue-100 mb-3">
              Discover hostels, PGs, rooms, flats, commercial spaces, and vehicle rentals all in one place.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <SearchBar onSearch={handleCitySearch} />
            </div>

            {/* Selected City Badge */}
            <p className="mt-4 text-blue-200 text-sm">
              📍 Showing listings in <span className="font-semibold text-white">{displayCity}</span>
            </p>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      {featuredListings.length > 0 && (
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

          {/* Listings Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-xl h-72 animate-pulse" />
              ))}
            </div>
          ) : regularListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {regularListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  isFavorited={favorites.includes(listing.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No listings found in {selectedCity?.name || 'your area'}.</p>
              {currentUser && userProfile?.role === 'owner' && (
                <Link
                  to="/create-listing"
                  className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Post Your First Listing
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/browse?category=${category.id}`}
                className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition"
                data-testid={`category-card-${category.id}`}
              >
                <span className="text-2xl block mb-2">{category.icon}</span>
                <span className="text-xs font-medium text-gray-700">{category.name}</span>
              </Link>
            ))}
          </div>
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
