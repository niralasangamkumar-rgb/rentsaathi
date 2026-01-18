import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CityProvider } from './contexts/CityContext';
import Navbar from './components/Navbar';
import CityGate from './components/CityGate';
import Home from './pages/Home';
import Browse from './pages/Browse';
import ListingDetail from './pages/ListingDetail';
import CreateListing from './pages/CreateListing';
import Dashboard from './pages/Dashboard';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

// Protected Route - requires login
function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }
  
  return currentUser ? children : <Navigate to="/login" />;
}

// Owner Route - requires login AND owner role
function OwnerRoute({ children }) {
  const { currentUser, userProfile, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  if (userProfile?.role !== 'owner') {
    return <Navigate to="/" />;
  }
  
  return children;
}

// Layout wrapper for protected pages with navbar
function ProtectedLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

// Layout wrapper for pages that need city gate
function ProtectedLayoutWithCityGate({ children }) {
  return (
    <>
      <Navbar />
      <CityGate>
        {children}
      </CityGate>
    </>
  );
}

function AppContent() {
  const { loading } = useAuth();
  
  // Show loading spinner while auth is loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading RentSaathi...</p>
        </div>
      </div>
    );
  }
  
  // Single Routes component - all routes in one place
  return (
    <Routes>
      {/* Auth routes - no navbar, no city gate */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Home - with navbar ONLY (no city gate needed, Home handles empty city) */}
      <Route path="/" element={<ProtectedLayout><Home /></ProtectedLayout>} />
      
      {/* Browse and details - with navbar and city gate */}
      <Route path="/browse" element={<ProtectedLayoutWithCityGate><Browse /></ProtectedLayoutWithCityGate>} />
      <Route path="/listing/:id" element={<ProtectedLayoutWithCityGate><ListingDetail /></ProtectedLayoutWithCityGate>} />
      
      {/* Create/Edit listing - owner only, with navbar and city gate */}
      <Route
        path="/create-listing"
        element={
          <ProtectedLayoutWithCityGate>
            <OwnerRoute>
              <CreateListing />
            </OwnerRoute>
          </ProtectedLayoutWithCityGate>
        }
      />
      <Route
        path="/edit-listing/:id"
        element={
          <ProtectedLayoutWithCityGate>
            <OwnerRoute>
              <CreateListing editMode={true} />
            </OwnerRoute>
          </ProtectedLayoutWithCityGate>
        }
      />
      
      {/* Dashboard - protected, with navbar and city gate */}
      <Route
        path="/dashboard"
        element={
          <ProtectedLayoutWithCityGate>
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </ProtectedLayoutWithCityGate>
        }
      />
      
      {/* Favorites - protected, with navbar and city gate */}
      <Route
        path="/favorites"
        element={
          <ProtectedLayoutWithCityGate>
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          </ProtectedLayoutWithCityGate>
        }
      />
      
      {/* Profile - protected, with navbar and city gate */}
      <Route
        path="/profile"
        element={
          <ProtectedLayoutWithCityGate>
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          </ProtectedLayoutWithCityGate>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CityProvider>
          <AppContent />
        </CityProvider>
      </AuthProvider>
    </Router>
  );
}
