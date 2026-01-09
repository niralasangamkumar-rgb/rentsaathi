import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ListingCard from '../components/ListingCard';
import CategoryFilter from '../components/CategoryFilter';
import SearchBar from '../components/SearchBar';
import { getListings, categories } from '../services/listingService';
import { useAuth } from '../contexts/AuthContext';
import { getUserFavorites } from '../services/favoriteService';

export default function Home() {
  const { currentUser } = useAuth();
  const [featuredListings, setFeaturedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadListings();
    if (currentUser) {
      loadFavorites();
    }
  }, [selectedCategory, currentUser]);

  const loadListings = async () => {
    setLoading(true);
    try {
      const filters = selectedCategory ? { category: selectedCategory } : {};
      const { listings } = await getListings(filters, null, 8);
      setFeaturedListings(listings);
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

  return (
    <div className="min-h-screen bg-gray-50" data-testid="home-page">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-4" data-testid="hero-title">
              Find Your Perfect
              <span className="text-blue-200"> Rental</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8">
              Discover hostels, PGs, rooms, flats, commercial spaces, and vehicle rentals all in one place.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <SearchBar onSearch={(term) => console.log('Search:', term)} />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Featured Listings</h2>
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
          ) : featuredListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  isFavorited={favorites.includes(listing.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No listings found. Be the first to post one!</p>
              {currentUser && (
                <Link
                  to="/create-listing"
                  className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Create Listing
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/browse?category=${category.id}`}
                className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition"
                data-testid={`category-card-${category.id}`}
              >
                <span className="text-3xl block mb-2">{category.icon}</span>
                <span className="text-sm font-medium text-gray-700">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-12">How RentSaathi Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Search</h3>
              <p className="text-gray-600 text-sm">Browse through thousands of rental listings across multiple categories</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📞</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Contact</h3>
              <p className="text-gray-600 text-sm">Connect directly with property owners via phone, email, or chat</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Rent</h3>
              <p className="text-gray-600 text-sm">Visit, verify, and finalize your perfect rental space or vehicle</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!currentUser && (
        <section className="py-16 bg-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to find your rental?</h2>
            <p className="text-blue-100 mb-8">Join thousands of users who found their perfect space with RentSaathi</p>
            <Link
              to="/register"
              className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-100 transition"
              data-testid="cta-signup"
            >
              Get Started Free
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">🏠</span>
                <span className="text-xl font-bold text-white">RentSaathi</span>
              </div>
              <p className="text-sm">Your trusted rental marketplace for hostels, PGs, rooms, flats, and vehicles.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Categories</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/browse?category=hostel" className="hover:text-white">Hostels</Link></li>
                <li><Link to="/browse?category=pg" className="hover:text-white">PG</Link></li>
                <li><Link to="/browse?category=flat" className="hover:text-white">Flats</Link></li>
                <li><Link to="/browse?category=room" className="hover:text-white">Rooms</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Vehicles</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/browse?category=bike" className="hover:text-white">Bike Rent</Link></li>
                <li><Link to="/browse?category=car" className="hover:text-white">Car Rent</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2025 RentSaathi. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
