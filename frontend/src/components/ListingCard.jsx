import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addFavorite, removeFavorite } from '../services/favoriteService';

export default function ListingCard({ listing, isFavorited = false, onFavoriteToggle, featured = false }) {
  const { currentUser } = useAuth();
  const [favorited, setFavorited] = useState(isFavorited);
  const [loading, setLoading] = useState(false);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentUser) return;
    
    setLoading(true);
    try {
      if (favorited) {
        await removeFavorite(currentUser.uid, listing.id);
        setFavorited(false);
      } else {
        await addFavorite(currentUser.uid, listing.id);
        setFavorited(true);
      }
      if (onFavoriteToggle) onFavoriteToggle(listing.id, !favorited);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
    setLoading(false);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      hostel: '🏨',
      pg: '🏠',
      room: '🚪',
      flat: '🏢',
      commercial: '🏪',
      bike: '🏍️',
      car: '🚗'
    };
    return icons[category] || '🏠';
  };

  return (
    <Link to={`/listing/${listing.id}`} data-testid={`listing-card-${listing.id}`}>
      <div className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow duration-200 ${
        featured ? 'border-amber-200 ring-1 ring-amber-100' : 'border-gray-100'
      }`}>
        {/* Image */}
        <div className="relative aspect-[4/3] bg-gray-100">
          {listing.images && listing.images.length > 0 ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl bg-gray-50">
              {getCategoryIcon(listing.category)}
            </div>
          )}
          
          {/* Featured Badge */}
          {featured && (
            <span className="absolute top-3 left-3 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full flex items-center">
              ⭐ Featured
            </span>
          )}
          
          {/* Category Badge */}
          {!featured && (
            <span className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
              {getCategoryIcon(listing.category)} {listing.category?.charAt(0).toUpperCase() + listing.category?.slice(1)}
            </span>
          )}

          {/* Favorite Button */}
          {currentUser && (
            <button
              onClick={handleFavoriteClick}
              disabled={loading}
              className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition"
              data-testid={`favorite-btn-${listing.id}`}
            >
              {favorited ? (
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 truncate" data-testid="listing-title">{listing.title}</h3>
          
          {/* Area/Location */}
          <p className="text-sm text-gray-500 mt-1 flex items-center">
            <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{listing.area || listing.location?.address || 'Location not specified'}</span>
          </p>
          
          {/* Price */}
          <div className="flex items-center justify-between mt-3">
            <span className="text-lg font-bold text-blue-600" data-testid="listing-price">
              ₹{listing.price?.toLocaleString()}
              <span className="text-xs font-normal text-gray-500">/month</span>
            </span>
            {listing.amenities && listing.amenities.length > 0 && (
              <span className="text-xs text-gray-400">
                {listing.amenities.length} amenities
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
