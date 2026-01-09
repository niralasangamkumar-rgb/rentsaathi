import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createListing, updateListing, getListing, categories } from '../services/listingService';
import ImageUploader from '../components/ImageUploader';
import MapComponent from '../components/MapComponent';

const amenitiesList = [
  'WiFi', 'AC', 'Parking', 'Power Backup', 'Security', 'CCTV',
  'Gym', 'Swimming Pool', 'Lift', 'Water Supply', 'Furnished',
  'Laundry', 'Kitchen', 'Balcony', 'Garden', 'Pet Friendly'
];

export default function CreateListing({ editMode = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    images: [],
    location: {
      address: '',
      city: '',
      lat: null,
      lng: null
    },
    amenities: [],
    contact: {
      phone: userProfile?.phone || '',
      email: currentUser?.email || ''
    }
  });

  useEffect(() => {
    if (editMode && id) {
      loadListing();
    }
  }, [editMode, id]);

  const loadListing = async () => {
    try {
      const listing = await getListing(id);
      if (listing && listing.ownerId === currentUser?.uid) {
        setFormData({
          title: listing.title || '',
          description: listing.description || '',
          category: listing.category || '',
          price: listing.price?.toString() || '',
          images: listing.images || [],
          location: listing.location || { address: '', city: '', lat: null, lng: null },
          amenities: listing.amenities || [],
          contact: listing.contact || { phone: '', email: '' }
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
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleLocationSelect = (coords) => {
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, lat: coords.lat, lng: coords.lng }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.category || !formData.price) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const listingData = {
        ...formData,
        price: parseFloat(formData.price),
        ownerId: currentUser.uid,
        ownerName: currentUser.displayName || 'Anonymous'
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

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="create-listing-page">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            {editMode ? 'Edit Listing' : 'Create New Listing'}
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg" data-testid="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                    <span className="text-xl block">{cat.icon}</span>
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

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (per month) *</label>
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

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
              <ImageUploader
                images={formData.images}
                onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
              />
            </div>

            {/* Location */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                name="location.address"
                value={formData.location.address}
                onChange={handleChange}
                placeholder="Full address"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="address-input"
              />
              <input
                type="text"
                name="location.city"
                value={formData.location.city}
                onChange={handleChange}
                placeholder="City"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="city-input"
              />
              <div>
                <p className="text-sm text-gray-500 mb-2">Click on the map to set location</p>
                <MapComponent
                  selectable={true}
                  onLocationSelect={handleLocationSelect}
                  center={formData.location.lat ? [formData.location.lat, formData.location.lng] : [20.5937, 78.9629]}
                  zoom={formData.location.lat ? 15 : 5}
                  markers={formData.location.lat ? [{ lat: formData.location.lat, lng: formData.location.lng }] : []}
                />
                {formData.location.lat && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ Location selected: {formData.location.lat.toFixed(4)}, {formData.location.lng.toFixed(4)}
                  </p>
                )}
              </div>
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

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  name="contact.phone"
                  value={formData.contact.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="phone-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="contact.email"
                  value={formData.contact.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  data-testid="email-input"
                />
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
                {loading ? 'Saving...' : editMode ? 'Update Listing' : 'Create Listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
