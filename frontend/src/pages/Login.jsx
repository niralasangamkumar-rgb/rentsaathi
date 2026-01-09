import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, sendOTP, verifyOTP, createUserProfile, fetchUserProfile } = useAuth();
  
  // Auth mode: 'phone' or 'email'
  const [authMode, setAuthMode] = useState('phone');
  
  // Phone auth states
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  
  // Email auth states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
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
        // New user - redirect to complete profile
        navigate('/complete-profile', { state: { phone, userId: result.user.uid } });
      } else {
        navigate('/');
      }
    } else {
      setError(result.error || 'Invalid OTP. Please try again.');
    }
    setLoading(false);
  };

  // Handle email login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else {
        setError('Failed to login. Please try again.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4" data-testid="login-page">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <span className="text-3xl">🏠</span>
            <span className="text-2xl font-bold text-blue-600">RentSaathi</span>
          </Link>
          <h2 className="mt-6 text-2xl font-bold text-gray-800">Welcome back</h2>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-8">
          {/* Auth Mode Toggle */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => { setAuthMode('phone'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
                authMode === 'phone' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              📱 Phone
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('email'); setError(''); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
                authMode === 'email' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              ✉️ Email
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm" data-testid="error-message">
              {error}
            </div>
          )}

          {/* Phone Auth */}
          {authMode === 'phone' && (
            <>
              {!otpSent ? (
                <form onSubmit={handleSendOTP} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 border border-r-0 border-gray-200 bg-gray-50 text-gray-500 rounded-l-lg">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="9876543210"
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        data-testid="phone-input"
                      />
                    </div>
                  </div>

                  <div id="recaptcha-container"></div>

                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                    data-testid="send-otp-btn"
                  >
                    {otpLoading ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit OTP"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
                      maxLength={6}
                      required
                      data-testid="otp-input"
                    />
                    <p className="text-sm text-gray-500 mt-2">OTP sent to +91{phone}</p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
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
            <form onSubmit={handleEmailLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  data-testid="email-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  data-testid="password-input"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                data-testid="login-btn"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:underline font-medium" data-testid="register-link">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
