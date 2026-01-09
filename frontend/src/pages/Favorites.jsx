import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserFavorites } from '../services/favoriteService';
import { getListing } from '../services/listingService';
import ListingCard from '../components/ListingCard';

export default function Favorites() {
  const { currentUser } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadFavorites();
    }
  }, [currentUser]);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const favIds = await getUserFavorites(currentUser.uid);
      
      // Fetch all favorite listings
      const listingPromises = favIds.map(id => getListing(id));
      const listings = await Promise.all(listingPromises);
      
      // Filter out null results (deleted listings)
      setFavorites(listings.filter(Boolean));
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
    setLoading(false);
  };

  const handleFavoriteToggle = (listingId, isFavorited) => {
    if (!isFavorited) {
      setFavorites(favorites.filter(f => f.id !== listingId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="favorites-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Saved Listings</h1>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-72 animate-pulse" />
            ))}
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isFavorited={true}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">❤️</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No saved listings</h3>
            <p className="text-gray-500 mb-6 text-sm">Start browsing and save listings you like</p>
            <Link
              to="/browse"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Browse Listings
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
