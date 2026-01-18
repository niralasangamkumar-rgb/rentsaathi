import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logoImage from '../assets/rentsaathi-logo.png';

export default function Register() {
  const navigate = useNavigate();
  const { signup, sendOTP, verifyOTP, createUserProfile, fetchUserProfile } = useAuth();
  
  // Auth mode
  const [authMode, setAuthMode] = useState('phone');
  
  // Phone auth states
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  
  // Profile completion states
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('renter');
  
  // Email auth states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'renter'
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle sending OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    
    setOtpLoading(true);
    const result = await sendOTP(phone, 'recaptcha-container');
    setOtpLoading(false);
    
    if (result.success) {
      setOtpSent(true);
    } else {
      setError(result.error || 'Failed to send OTP. Please try again.');
    }
  };

  // Handle verifying OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    
    setLoading(true);
    const result = await verifyOTP(otp);
    
    if (result.success) {
      // Check if user profile exists
      const profile = await fetchUserProfile(result.user.uid);
      if (!profile) {
        // New user - show profile form
        setUserId(result.user.uid);
        setShowProfileForm(true);
      } else {
        navigate('/');
      }
    } else {
      setError(result.error || 'Invalid OTP. Please try again.');
    }
    setLoading(false);
  };

  // Handle profile completion
  const handleCompleteProfile = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    setLoading(true);
    const result = await createUserProfile(userId, phone, role, name);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Failed to create profile. Please try again.');
    }
    setLoading(false);
  };

  // Handle email form change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle email signup
  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await signup(formData.email, formData.password, formData.name, formData.phone, formData.role);
      navigate('/');
    } catch (error) {
      console.error('Signup error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak');
      } else {
        setError('Failed to create account. Please try again.');
      }
    }
    setLoading(false);
  };

  // Profile completion form
  if (showProfileForm) {
    return (
      <div className="h-screen max-h-screen overflow-hidden bg-gray-50 flex flex-col items-center justify-center px-3 py-0">
        <div className="max-w-md w-full flex flex-col" style={{ maxHeight: 'calc(100vh - 20px)' }}>
          <div className="text-center mb-2">
            <img src={logoImage} alt="RentSaathi Logo" className="h-10 w-auto object-contain sm:h-12 mx-auto" />
            <h2 className="mt-2 text-xl sm:text-2xl font-bold text-gray-800">Complete Your Profile</h2>
            <p className="mt-0.5 text-xs sm:text-sm text-gray-600">Just a few more details</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleCompleteProfile} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  data-testid="name-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">I am a</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('renter')}
                    className={`p-4 border-2 rounded-xl text-center transition ${
                      role === 'renter' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    data-testid="role-renter"
                  >
                    <span className="text-2xl block mb-2">👤</span>
                    <span className="font-medium text-gray-800">Renter</span>
                    <p className="text-xs text-gray-500 mt-1">Looking for rentals</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('owner')}
                    className={`p-4 border-2 rounded-xl text-center transition ${
                      role === 'owner' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    data-testid="role-owner"
                  >
                    <span className="text-2xl block mb-2">🏠</span>
                    <span className="font-medium text-gray-800">Owner</span>
                    <p className="text-xs text-gray-500 mt-1">I have properties</p>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                data-testid="complete-profile-btn"
              >
                {loading ? 'Creating Profile...' : 'Get Started'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-gray-50 flex flex-col items-center justify-center px-3 py-0" data-testid="register-page">
      <div className="max-w-md w-full flex flex-col" style={{ maxHeight: 'calc(100vh - 20px)' }}>
        <div className="text-center mb-2">
          <Link to="/" className="inline-flex items-center justify-center">
            <img src={logoImage} alt="RentSaathi Logo" className="h-10 w-auto object-contain sm:h-12" />
          </Link>
          <h2 className="mt-2 text-xl sm:text-2xl font-bold text-gray-800">Create an account</h2>
          <p className="mt-0.5 text-xs sm:text-sm text-gray-600">Join RentSaathi today</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
          {/* Auth Mode Toggle */}
          <div className="flex mb-2 bg-gray-100 rounded-lg p-0.5 gap-1">
            <button
              type="button"
              onClick={() => { setAuthMode('phone'); setError(''); }}
              className={`flex-1 py-1 text-xs sm:text-sm font-medium rounded-md transition ${
                authMode === 'phone' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              📱 Phone
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('email'); setError(''); }}
              className={`flex-1 py-1 text-xs sm:text-sm font-medium rounded-md transition ${
                authMode === 'email' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              ✉️ Email
            </button>
          </div>

          {error && (
            <div className="mb-2 p-2 bg-red-50 text-red-600 rounded-lg text-xs" data-testid="error-message">
              {error}
            </div>
          )}

          {/* Phone Auth */}
          {authMode === 'phone' && (
            <>
              {!otpSent ? (
                <form onSubmit={handleSendOTP} className="space-y-2">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-2 border border-r-0 border-gray-200 bg-gray-50 text-gray-500 rounded-l-lg text-sm">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="9876543210"
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        required
                        data-testid="phone-input"
                      />
                    </div>
                  </div>

                  <div id="recaptcha-container"></div>

                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition disabled:opacity-50"
                    data-testid="send-otp-btn"
                  >
                    {otpLoading ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-2">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit OTP"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest"
                      maxLength={6}
                      required
                      data-testid="otp-input"
                    />
                    <p className="text-xs text-gray-500 mt-1">OTP sent to +91{phone}</p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition disabled:opacity-50"
                    data-testid="verify-otp-btn"
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtp(''); }}
                    className="w-full py-2 text-sm text-gray-600 hover:text-blue-600"
                  >
                    Change phone number
                  </button>
                </form>
              )}
            </>
          )}

          {/* Email Auth */}
          {authMode === 'email' && (
            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">I am a</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="renter">Renter - Looking for rentals</option>
                  <option value="owner">Owner - I have properties</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
