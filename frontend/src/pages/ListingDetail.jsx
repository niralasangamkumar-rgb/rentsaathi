import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getListing, deleteListing } from '../services/listingService';
import { addFavorite, removeFavorite, isFavorite as checkFavorite } from '../services/favoriteService';
import { useAuth } from '../contexts/AuthContext';
import MapComponent from '../components/MapComponent';

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadListing();
  }, [id]);

  useEffect(() => {
    if (currentUser && listing) {
      checkIfFavorite();
    }
  }, [currentUser, listing]);

  const loadListing = async () => {
    setLoading(true);
    try {
      const data = await getListing(id);
      setListing(data);
    } catch (error) {
      console.error('Error loading listing:', error);
    }
    setLoading(false);
  };

  const checkIfFavorite = async () => {
    const result = await checkFavorite(currentUser.uid, listing.id);
    setIsFavorite(result);
  };

  const handleFavoriteToggle = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    try {
      if (isFavorite) {
        await removeFavorite(currentUser.uid, listing.id);
      } else {
        await addFavorite(currentUser.uid, listing.id);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteListing(listing.id);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting listing:', error);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Listing not found</h2>
        <Link to="/browse" className="text-blue-600 hover:underline">Browse all listings</Link>
      </div>
    );
  }

  const isOwner = currentUser?.uid === listing.ownerId;

  return (
    <div className="min-h-screen bg-gray-50" data-testid="listing-detail-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
          data-testid="back-btn"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="aspect-video bg-gray-100 relative">
                {listing.images && listing.images.length > 0 ? (
                  <img
                    src={listing.images[activeImage]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">
                    {getCategoryIcon(listing.category)}
                  </div>
                )}
              </div>
              {listing.images && listing.images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {listing.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 ${
                        activeImage === index ? 'border-blue-500' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full mb-3">
                    {getCategoryIcon(listing.category)} {listing.category?.charAt(0).toUpperCase() + listing.category?.slice(1)}
                  </span>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800" data-testid="listing-title">
                    {listing.title}
                  </h1>
                  <p className="text-gray-500 mt-2 flex items-center">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {listing.location?.address || 'Location not specified'}
                  </p>
                </div>
                <button
                  onClick={handleFavoriteToggle}
                  className="p-3 rounded-full hover:bg-gray-100 transition"
                  data-testid="favorite-btn"
                >
                  {isFavorite ? (
                    <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-gray-800 mb-3">Description</h3>
                <p className="text-gray-600 whitespace-pre-wrap" data-testid="listing-description">
                  {listing.description || 'No description provided'}
                </p>
              </div>

              {/* Amenities */}
              {listing.amenities && listing.amenities.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {listing.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Map */}
            {listing.location?.lat && listing.location?.lng && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4">Location</h3>
                <MapComponent
                  center={[listing.location.lat, listing.location.lng]}
                  zoom={15}
                  markers={[{
                    lat: listing.location.lat,
                    lng: listing.location.lng,
                    title: listing.title,
                    price: listing.price,
                    popup: true
                  }]}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <div className="text-3xl font-bold text-blue-600" data-testid="listing-price">
                ₹{listing.price?.toLocaleString()}
                <span className="text-base font-normal text-gray-500">/month</span>
              </div>

              {/* Contact Button */}
              {!isOwner && (
                <button
                  onClick={() => setShowContact(!showContact)}
                  className="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                  data-testid="contact-btn"
                >
                  Contact Owner
                </button>
              )}

              {/* Contact Info */}
              {showContact && listing.contact && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3" data-testid="contact-info">
                  {listing.contact.phone && (
                    <a
                      href={`tel:${listing.contact.phone}`}
                      className="flex items-center text-gray-700 hover:text-blue-600"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {listing.contact.phone}
                    </a>
                  )}
                  {listing.contact.email && (
                    <a
                      href={`mailto:${listing.contact.email}`}
                      className="flex items-center text-gray-700 hover:text-blue-600"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {listing.contact.email}
                    </a>
                  )}
                </div>
              )}

              {/* Owner Actions */}
              {isOwner && (
                <div className="mt-4 space-y-3">
                  <Link
                    to={`/edit-listing/${listing.id}`}
                    className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium text-center hover:bg-blue-700 transition"
                    data-testid="edit-listing-btn"
                  >
                    Edit Listing
                  </Link>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full px-6 py-3 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition"
                    data-testid="delete-listing-btn"
                  >
                    Delete Listing
                  </button>
                </div>
              )}

              {/* Posted Date */}
              <p className="text-sm text-gray-400 mt-4 text-center">
                Posted on {new Date(listing.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="delete-modal">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Delete Listing?</h3>
            <p className="text-gray-600 mb-6">This action cannot be undone. Are you sure you want to delete this listing?</p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
                data-testid="confirm-delete-btn"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
