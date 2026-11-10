import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WatchlistProvider } from './context/WatchlistContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PlatformPreferenceModal from './components/PlatformPreferenceModal';
import SurpriseModal from './components/SurpriseModal';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Explore from './pages/Explore';
import Moods from './pages/Moods';
import Compare from './pages/Compare';
import MovieDetails from './pages/MovieDetails';
import Search from './pages/Search';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Watchlist from './pages/Watchlist';
import Favourites from './pages/Favourites';
import History from './pages/History';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

function AppContent() {
  const [isPrefModalOpen, setIsPrefModalOpen] = useState(false);
  const [isSurpriseModalOpen, setIsSurpriseModalOpen] = useState(false);

  useEffect(() => {
    // Ask platform preference at first place on first visit
    const answered = localStorage.getItem('moodflix_pref_answered');
    if (!answered) {
      setIsPrefModalOpen(true);
    }
  }, []);

  useEffect(() => {
    const handleOpen = () => setIsPrefModalOpen(true);
    const handleSurpriseOpen = () => setIsSurpriseModalOpen(true);

    window.addEventListener('open-platform-preferences', handleOpen);
    window.addEventListener('open-surprise-modal', handleSurpriseOpen);

    return () => {
      window.removeEventListener('open-platform-preferences', handleOpen);
      window.removeEventListener('open-surprise-modal', handleSurpriseOpen);
    };
  }, []);

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public Discovery Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/moods" element={<Moods />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/movies/:id" element={<MovieDetails />} />
          <Route path="/search" element={<Search />} />

          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected User Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/watchlist"
            element={
              <ProtectedRoute>
                <Watchlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favourites"
            element={
              <ProtectedRoute>
                <Favourites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Route */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* 404 Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />

      {/* Global First-Time & Accessible Platform Preference Modal */}
      <PlatformPreferenceModal
        isOpen={isPrefModalOpen}
        onClose={() => setIsPrefModalOpen(false)}
        onSave={() => window.dispatchEvent(new CustomEvent('platform-preferences-updated'))}
      />

      {/* Global Surprise Me Roulette Modal */}
      <SurpriseModal
        isOpen={isSurpriseModalOpen}
        onClose={() => setIsSurpriseModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <WatchlistProvider>
          <AppContent />
        </WatchlistProvider>
      </AuthProvider>
    </Router>
  );
}
