import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCity } from '../contexts/CityContext';
import { createListing, updateListing, getListing, categories } from '../services/listingService';
import ImageUploader from '../components/ImageUploader';

const amenitiesList = [
  'WiFi', 'AC', 'Parking', 'Power Backup', 'Security', 'CCTV',
  'Gym', 'Swimming Pool', 'Lift', 'Water Supply', 'Furnished',
  'Laundry', 'Kitchen', 'Balcony', 'Garden', 'Pet Friendly'
];

export default function CreateListing({ editMode = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile, isOwner } = useAuth();
  const { selectedCity } = useCity();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    area: '', // locality/area
    phone: userProfile?.phone || '',
    images: [],
    amenities: []
  });

  useEffect(() => {
    // Redirect if not owner
    if (userProfile && userProfile.role !== 'owner') {
      navigate('/');
      return;
    }
    
    if (editMode && id) {
      loadListing();
    }
  }, [editMode, id, userProfile]);

  const loadListing = async () => {
    try {
      const listing = await getListing(id);
      if (listing && listing.ownerId === currentUser?.uid) {
        setFormData({
          title: listing.title || '',
          description: listing.description || '',
          category: listing.category || '',
          price: listing.price?.toString() || '',
          area: listing.area || '',
          phone: listing.contact?.phone || listing.phone || '',
          images: listing.images || [],
          amenities: listing.amenities || []
        });
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error loading listing:', error);
      navigate('/dashboard');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.category || !formData.price || !formData.area) {
      setError('Please fill in all required fields');
      return;
    }

    if (!formData.phone) {
      setError('Please provide a phone number for contact');
      return;
    }

    setLoading(true);
    try {
      const listingData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        area: formData.area,
        phone: formData.phone,
        images: formData.images,
        amenities: formData.amenities,
        contact: {
          phone: formData.phone,
          email: currentUser?.email || ''
        },
        ownerId: currentUser.uid,
        ownerName: currentUser.displayName || userProfile?.name || 'Anonymous',
        cityId: selectedCity?.id || '',
        cityName: selectedCity?.name || '',
        featured: false // Default to non-featured
      };

      if (editMode && id) {
        await updateListing(id, listingData);
      } else {
        await createListing(listingData);
      }

      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving listing:', error);
      setError('Failed to save listing. Please try again.');
    }
    setLoading(false);
  };

  // Check if user is authenticated and is an owner
  if (!currentUser) {
    navigate('/login');
    return null;
  }

  if (userProfile && userProfile.role !== 'owner') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full text-center">
          <span className="text-5xl block mb-4">🔒</span>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Owner Access Only</h2>
          <p className="text-gray-600 mb-6">Only property owners can post listings.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6" data-testid="create-listing-page">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-xl font-bold text-gray-800 mb-6">
            {editMode ? 'Edit Listing' : 'Post New Listing'}
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm" data-testid="error-message">
              {error}
            </div>
          )}

          {/* City Info */}
          {selectedCity && (
            <div className="mb-6 p-3 bg-blue-50 rounded-lg flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span className="text-sm text-blue-700">Posting in <strong>{selectedCity.name}</strong></span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                    className={`p-3 rounded-lg border-2 text-center transition ${
                      formData.category === cat.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    data-testid={`category-btn-${cat.id}`}
                  >
                    <span className="text-lg block">{cat.icon}</span>
                    <span className="text-xs font-medium text-gray-700">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Spacious 2BHK Flat in Koramangala"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                data-testid="title-input"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rent (per month) *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="10000"
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  data-testid="price-input"
                />
              </div>
            </div>

            {/* Area/Locality */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Area / Locality *</label>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleChange}
                placeholder="e.g., Koramangala, Indiranagar, Boring Road"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                data-testid="area-input"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your property or vehicle..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                data-testid="description-input"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone *</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 border border-r-0 border-gray-200 bg-gray-50 text-gray-500 rounded-l-lg">
                  +91
                </span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                  placeholder="9876543210"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  data-testid="phone-input"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">This will be visible to users for contact</p>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>
              <ImageUploader
                images={formData.images}
                onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
                maxImages={5}
              />
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {amenitiesList.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => handleAmenityToggle(amenity)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                      formData.amenities.includes(amenity)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    data-testid={`amenity-${amenity}`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-3 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                data-testid="submit-btn"
              >
                {loading ? 'Saving...' : editMode ? 'Update Listing' : 'Post Listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
