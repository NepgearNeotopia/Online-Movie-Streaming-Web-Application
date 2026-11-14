import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext(null);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      setError('');
      return;
    }

    setLoading(true);
    try {
      const res = await api.get('/api/favorites');
      setFavorites(res.data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const isFavorite = useCallback(
    (movieId) => favorites.some((fav) => Number(fav.movie_id) === Number(movieId)),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (movieId) => {
      if (!isAuthenticated) {
        return { success: false, requiresAuth: true };
      }

      const existing = favorites.find((fav) => Number(fav.movie_id) === Number(movieId));

      try {
        if (existing) {
          await api.delete(`/api/favorites/${movieId}`);
          setFavorites((prev) => prev.filter((fav) => fav.id !== existing.id));
        } else {
          await api.post('/api/favorites', { movie_id: movieId });
          await fetchFavorites();
        }
        setError('');
        return { success: true, added: !existing };
      } catch (err) {
        return {
          success: false,
          message: err.response?.data?.message || 'Failed to update favorites',
        };
      }
    },
    [favorites, isAuthenticated, fetchFavorites]
  );

  const removeFavorite = useCallback(async (favoriteId) => {
    try {
      await api.delete(`/api/favorites/id/${favoriteId}`);
      setFavorites((prev) => prev.filter((fav) => fav.id !== favoriteId));
      setError('');
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to remove favorite',
      };
    }
  }, []);

  const value = {
    favorites,
    loading,
    error,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    refresh: fetchFavorites,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export default FavoritesContext;