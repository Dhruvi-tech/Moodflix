import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WatchlistProvider } from './context/WatchlistContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Explore from './pages/Explore';
import Moods from './pages/Moods';
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

function App() {
  return (
    <Router>
      <AuthProvider>
        <WatchlistProvider>
          <div className="app-layout">
            <Navbar />
            <main className="main-content">
              <Routes>
                {/* Public Discovery Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/moods" element={<Moods />} />
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
          </div>
        </WatchlistProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
