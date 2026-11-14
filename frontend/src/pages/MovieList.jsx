import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useFavorites } from '../contexts/FavoritesContext';

export default function MovieList() {
  const [movies, setMovies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.set('genre', selectedCategory);
      if (search) params.set('search', search);
      const res = await api.get(`/api/movies?${params}`);
      setMovies(res.data.data);
      setError('');
    } catch (err) {
      setError('Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/categories');
      setCategories(res.data.data);
    } catch (err) {
      console.error('Failed to load categories');
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchMovies();
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [selectedCategory, search]);

  const handleCardClick = (movieId) => {
    navigate(`/movies/${movieId}`);
  };

  const handleFavoriteClick = async (e, movieId) => {
    e.stopPropagation();
    const result = await toggleFavorite(movieId);
    if (result.requiresAuth) {
      navigate('/login');
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search movies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading movies...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-400">{error}</div>
      ) : movies.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No movies found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <div
              key={movie.id}
              onClick={() => handleCardClick(movie.id)}
              className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl hover:ring-2 hover:ring-red-500 cursor-pointer transition-all duration-200"
            >
              <div className="relative h-48 bg-gray-700 flex items-center justify-center">
                {movie.poster_url ? (
                  <img src={movie.poster_url} alt={movie.title} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-gray-500 text-4xl">🎬</span>
                )}
                <button
                  onClick={(e) => handleFavoriteClick(e, movie.id)}
                  className={`absolute top-2 right-2 w-9 h-9 flex items-center justify-center rounded-full text-lg leading-none shadow transition ${
                    isFavorite(movie.id)
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-900/70 text-gray-300 hover:text-red-400'
                  }`}
                  title={isFavorite(movie.id) ? 'Remove from favorites' : 'Add to favorites'}
                  aria-label={isFavorite(movie.id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {isFavorite(movie.id) ? '★' : '☆'}
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg truncate">{movie.title}</h3>
                <div className="flex justify-between text-sm text-gray-400 mt-1">
                  <span>{movie.genre}</span>
                  <span>★ {movie.rating}</span>
                </div>
                {movie.duration && (
                  <p className="text-xs text-gray-500 mt-2">{movie.duration} min</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}