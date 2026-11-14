import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { useFavorites } from '../contexts/FavoritesContext';

export default function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favoriteMessage, setFavoriteMessage] = useState('');
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  const handleFavoriteClick = async () => {
    const result = await toggleFavorite(movie.id);
    if (result.requiresAuth) {
      navigate('/login');
      return;
    }
    setFavoriteMessage(result.success ? '' : result.message || 'Failed to update favorites');
  };

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/movies/${id}`);
        setMovie(res.data.data);
        setError('');
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Movie not found');
        } else {
          setError('Failed to load movie details');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400">Loading movie details...</div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-4">{error || 'Movie not found'}</div>
        <Link
          to="/"
          className="inline-block bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition"
        >
          Back to Movies
        </Link>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-sm text-gray-400 hover:text-red-400 transition flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3 flex-shrink-0">
          <div className="aspect-[2/3] bg-gray-700 rounded-lg overflow-hidden shadow-xl">
            {movie.poster_url ? (
              <img
                src={movie.poster_url}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-500 text-6xl">🎬</span>
              </div>
            )}
          </div>
        </div>

        <div className="md:w-2/3 flex flex-col">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{movie.title}</h1>

          <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-400">
            {movie.rating && (
              <span className="flex items-center gap-1">
                <span className="text-yellow-400">★</span>
                {movie.rating}
              </span>
            )}
            {movie.genre && <span className="bg-gray-700 px-3 py-1 rounded">{movie.genre}</span>}
            {movie.duration && <span>{movie.duration} min</span>}
            {movie.release_year && <span>{movie.release_year}</span>}
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Synopsis</h2>
            <p className="text-gray-300 leading-relaxed">
              {movie.description || 'No description available.'}
            </p>
          </div>

          <div className="mt-auto flex flex-wrap gap-3">
            <button
              onClick={handleFavoriteClick}
              className={`font-medium py-2 px-6 rounded transition flex items-center gap-2 ${
                isFavorite(movie.id)
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              <span className="text-lg leading-none">{isFavorite(movie.id) ? '★' : '☆'}</span>
              {isFavorite(movie.id) ? 'In Favorites' : 'Add to Favorites'}
            </button>
            {movie.video_url && (
              <Link
                to={`/movies/${id}/watch`}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Play Movie
              </Link>
            )}
            <Link
              to="/"
              className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded transition"
            >
              Back to List
            </Link>
          </div>
          {favoriteMessage && (
            <p className="mt-3 text-sm text-red-400">{favoriteMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
}