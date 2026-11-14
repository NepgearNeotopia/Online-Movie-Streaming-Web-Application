import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MovieList from './pages/MovieList';
import MovieDetail from './pages/MovieDetail';
import MoviePlayer from './pages/MoviePlayer';
import Favorites from './pages/Favorites';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<MovieList />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
              <Route path="admin" element={<AdminRoute><Dashboard admin /></AdminRoute>} />
              <Route path="movies/:id" element={<MovieDetail />} />
              <Route path="movies/:id/watch" element={<MoviePlayer />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </FavoritesProvider>
    </AuthProvider>
  );
}

export default App;