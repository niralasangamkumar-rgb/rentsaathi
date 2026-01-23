import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCity } from '../contexts/CityContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { categories } from '../services/listingService';
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
    securityDeposit: '',
    city: '',
    area: '',
    tenantPreference: '',
    furnishing: '',
    phone: userProfile?.phone || '',
    images: [],
    amenities: []
  });

  const isVehicle = formData.category === 'bike_rent' || formData.category === 'car_rent';

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

    // Validation
    if (!formData.title || !formData.description || !formData.category || !formData.price || !formData.securityDeposit || !formData.city || !formData.area || !formData.tenantPreference || !formData.furnishing) {
      setError('Please fill in all required fields');
      return;
    }
    if (!formData.phone) {
      setError('Please provide a phone number for contact');
      return;
    }
    if (!currentUser || userProfile?.role !== 'owner') {
      setError('Only owners can post listings.');
      return;
    }

    setLoading(true);
    try {
      const docData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        securityDeposit: parseFloat(formData.securityDeposit),
        city: formData.city,
        area: formData.area,
        tenantPreference: formData.tenantPreference,
        furnishing: formData.furnishing,
        phone: formData.phone,
        images: formData.images,
        amenities: formData.amenities,
        ownerId: currentUser.uid,
        ownerName: userProfile?.name || currentUser.displayName || currentUser.email || 'Anonymous',
        status: 'active',
        createdAt: serverTimestamp(),
        contact: {
          phone: formData.phone,
          email: currentUser.email || ''
        }
      };
      await addDoc(collection(db, 'listings'), docData);
      setLoading(false);
      setError('');
      navigate('/browse');
    } catch (err) {
      setLoading(false);
      setError('Failed to save listing. Please try again.');
    }
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

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Type *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                data-testid="property-type-select"
              >
                <option value="">Select type</option>
                <option value="pg">PG</option>
                <option value="hostel">Hostel</option>
                <option value="room">Room</option>
                <option value="flat">Flat</option>
                <option value="commercial_shop">Commercial Shop</option>
                <option value="commercial_office">Commercial Office</option>
                <option value="bike_rent">Bike Rent</option>
                <option value="car_rent">Car Rent</option>
              </select>
            </div>

            {/* Vehicle Name/Model (for vehicles only) */}
            {isVehicle && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Name / Model *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Honda Activa, Maruti Swift"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  data-testid="vehicle-title-input"
                />
              </div>
            )}

            {/* Rent Per Day (for vehicles only) */}
            {isVehicle && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rent (per day) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="500"
                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    data-testid="vehicle-price-input"
                  />
                </div>
              </div>
            )}

            {/* Security Deposit (always show) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Security Deposit *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  name="securityDeposit"
                  value={formData.securityDeposit}
                  onChange={handleChange}
                  placeholder="5000"
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  data-testid="security-deposit-input"
                />
              </div>
            </div>

            {/* City Dropdown (always show) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                data-testid="city-select"
              >
                <option value="">Select city</option>
                <option value="Patna">Patna</option>
                <option value="Delhi">Delhi</option>
                <option value="Noida">Noida</option>
                <option value="Lucknow">Lucknow</option>
                <option value="Gaya">Gaya</option>
                <option value="Muzaffarpur">Muzaffarpur</option>
                <option value="Bhagalpur">Bhagalpur</option>
              </select>
            </div>

            {/* Tenant Preference (hide for vehicles) */}
            {!isVehicle && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tenant Preference *</label>
                <select
                  name="tenantPreference"
                  value={formData.tenantPreference}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  data-testid="tenant-preference-select"
                >
                  <option value="">Select preference</option>
                  <option value="Boys">Boys</option>
                  <option value="Girls">Girls</option>
                  <option value="Family">Family</option>
                  <option value="Any">Any</option>
                </select>
              </div>
            )}

            {/* Furnishing (hide for vehicles) */}
            {!isVehicle && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Furnishing *</label>
                <select
                  name="furnishing"
                  value={formData.furnishing}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  data-testid="furnishing-select"
                >
                  <option value="">Select furnishing</option>
                  <option value="Furnished">Furnished</option>
                  <option value="Semi-Furnished">Semi-Furnished</option>
                  <option value="Unfurnished">Unfurnished</option>
                </select>
              </div>
            )}

            {/* Category (hide for vehicles) */}
            {!isVehicle && (
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
            )}

            {/* Title (hide for vehicles, already shown as Vehicle Name) */}
            {!isVehicle && (
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
            )}

            {/* Price (hide for vehicles, use Rent Per Day instead) */}
            {!isVehicle && (
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
            )}

            {/* Area/Locality (always show) */}
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

            {/* Description (always show) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={isVehicle ? 'Describe your vehicle...' : 'Describe your property...'}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                data-testid="description-input"
              />
            </div>

            {/* Phone Number (always show) */}
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

            {/* Images (always show) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>
              <ImageUploader
                images={formData.images}
                onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
                maxImages={5}
              />
            </div>

            {/* Amenities (hide for vehicles) */}
            {!isVehicle && (
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
            )}

            {/* Landmark (for property listings only) */}
            {!isVehicle && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nearby Landmark (Optional)
                </label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark || ''}
                  onChange={handleChange}
                  placeholder="Near AIIMS, Metro Station, Mall"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

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
