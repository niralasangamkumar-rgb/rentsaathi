import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserListings, deleteListing } from '../services/listingService';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (currentUser) {
      loadListings();
    }
  }, [currentUser]);

  const loadListings = async () => {
    setLoading(true);
    try {
      const userListings = await getUserListings(currentUser.uid);
      setListings(userListings);
    } catch (error) {
      console.error('Error loading listings:', error);
    }
    setLoading(false);
  };

  const handleDelete = async (listingId) => {
    try {
      await deleteListing(listingId);
      setListings(listings.filter(l => l.id !== listingId));
      setDeleteId(null);
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

  return (
    <div className="min-h-screen bg-gray-50" data-testid="dashboard-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your listings and profile</p>
          </div>
          <Link
            to="/create-listing"
            className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            data-testid="create-listing-btn"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Listing
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Listings</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{listings.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Properties</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {listings.filter(l => ['hostel', 'pg', 'room', 'flat', 'commercial'].includes(l.category)).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-xl">🏠</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Vehicles</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {listings.filter(l => ['bike', 'car'].includes(l.category)).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-xl">🚗</span>
              </div>
            </div>
          </div>
        </div>

        {/* Listings */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">My Listings</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : listings.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {listings.map((listing) => (
                <div key={listing.id} className="p-6 flex flex-col md:flex-row md:items-center gap-4" data-testid={`listing-row-${listing.id}`}>
                  {/* Image */}
                  <div className="w-full md:w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {listing.images && listing.images.length > 0 ? (
                      <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        {getCategoryIcon(listing.category)}
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <Link to={`/listing/${listing.id}`} className="font-semibold text-gray-800 hover:text-blue-600">
                      {listing.title}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                      {getCategoryIcon(listing.category)} {listing.category?.charAt(0).toUpperCase() + listing.category?.slice(1)} • ₹{listing.price?.toLocaleString()}/month
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Created {new Date(listing.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/listing/${listing.id}`}
                      className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    >
                      View
                    </Link>
                    <Link
                      to={`/edit-listing/${listing.id}`}
                      className="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      data-testid={`edit-btn-${listing.id}`}
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => setDeleteId(listing.id)}
                      className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                      data-testid={`delete-btn-${listing.id}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No listings yet</h3>
              <p className="text-gray-500 mb-6">Create your first listing to get started</p>
              <Link
                to="/create-listing"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Create Listing
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="delete-modal">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Delete Listing?</h3>
            <p className="text-gray-600 mb-6">This action cannot be undone.</p>
            <div className="flex space-x-4">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
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
