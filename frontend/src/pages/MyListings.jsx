import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import ListingCard from '../components/ListingCard';

export default function MyListings() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!currentUser || userProfile?.role !== 'owner') {
      navigate('/browse');
      return;
    }
    fetchListings();
    // eslint-disable-next-line
  }, [currentUser, userProfile]);

  const fetchListings = async () => {
    setLoading(true);
    setError('');
    try {
      const q = query(
        collection(db, 'listings'),
        where('ownerId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      setListings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      setError('Failed to load listings.');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'listings', id));
      setListings(listings => listings.filter(l => l.id !== id));
    } catch (err) {
      setError('Failed to delete listing.');
    }
    setDeletingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6" data-testid="my-listings-page">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Listings</h1>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
        {loading ? (
          <div className="text-center text-gray-500 py-12">Loading...</div>
        ) : listings.length === 0 ? (
          <div className="text-center text-gray-500 py-12">You have not listed any property yet</div>
        ) : (
          <div className="grid gap-6">
            {listings.map(listing => (
              <div key={listing.id} className="relative group border rounded-xl bg-white shadow-sm hover:shadow-md transition">
                <ListingCard listing={listing} />
                <div className="absolute top-4 right-4 flex gap-2 opacity-100 group-hover:opacity-100">
                  <button
                    className="px-3 py-1.5 rounded bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200 transition"
                    onClick={() => navigate(`/edit-listing/${listing.id}`)}
                    disabled={deletingId === listing.id}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1.5 rounded bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition"
                    onClick={() => handleDelete(listing.id)}
                    disabled={deletingId === listing.id}
                  >
                    {deletingId === listing.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${listing.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                    {listing.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
