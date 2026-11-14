import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../contexts/FavoritesContext';

export default function Favorites() {
  const { favorites, loading, error, removeFavorite } = useFavorites();
  const [removingId, setRemovingId] = useState(null);
  const [actionError, setActionError] = useState('');

  const handleRemove = async (favoriteId) => {
    setRemovingId(favoriteId);
    const result = await removeFavorite(favoriteId);
    setActionError(result.success ? '' : result.message || 'Failed to remove favorite');
    setRemovingId(null);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Favorites</h1>
        <span className="text-sm text-gray-400">
          {favorites.length} {favorites.length === 1 ? 'movie' : 'movies'}
        </span>
      </div>

      {actionError && (
        <div className="mb-4 px-4 py-2 rounded bg-red-900 text-red-200 text-sm">
          {actionError}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading favorites...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-400">{error}</div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-5xl mb-4">☆</div>
          <p className="text-gray-400 mb-6">You have no favorite movies yet.</p>
          <Link
            to="/"
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded transition"
          >
            Browse Movies
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map((fav) => (
            <div
              key={fav.id}
              className="relative bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl hover:ring-2 hover:ring-red-500 transition-all duration-200"
            >
              <Link to={`/movies/${fav.movie_id}`} className="block">
                <div className="h-48 bg-gray-700 flex items-center justify-center">
                  {fav.poster_url ? (
                    <img
                      src={fav.poster_url}
                      alt={fav.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500 text-4xl">🎬</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg truncate">{fav.title}</h3>
                  <div className="flex justify-between text-sm text-gray-400 mt-1">
                    <span>{fav.genre}</span>
                    <span>★ {fav.rating}</span>
                  </div>
                </div>
              </Link>
              <button
                onClick={() => handleRemove(fav.id)}
                disabled={removingId === fav.id}
                className="absolute top-2 right-2 bg-gray-900/80 hover:bg-red-600 text-white text-xs font-medium px-3 py-1 rounded-full shadow transition disabled:opacity-50"
              >
                {removingId === fav.id ? 'Removing...' : 'Remove'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}