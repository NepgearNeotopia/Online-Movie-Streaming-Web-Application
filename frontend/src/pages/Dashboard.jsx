import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard({ admin = false }) {
  const { user } = useAuth();
  const [movies, setMovies] = useState([]);
  const [formData, setFormData] = useState({
    title: '', description: '', genre: '', duration: '', release_year: '', poster_url: '', video_url: '', rating: ''
  });
  const [message, setMessage] = useState('');
  const [editingMovie, setEditingMovie] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '', description: '', genre: '', duration: '', release_year: '', poster_url: '', video_url: '', rating: ''
  });
  const [editError, setEditError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchMovies = async () => {
    try {
      const res = await api.get('/api/movies');
      setMovies(res.data.data);
    } catch (err) {
      console.error('Failed to load movies');
    }
  };

  useEffect(() => { fetchMovies(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/movies', formData);
      if (res.data.success) {
        setMessage('Movie created successfully');
        setFormData({ title: '', description: '', genre: '', duration: '', release_year: '', poster_url: '', video_url: '', rating: '' });
        fetchMovies();
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create movie');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this movie?')) return;
    try {
      await api.delete(`/api/movies/${id}`);
      setMessage('Movie deleted');
      fetchMovies();
    } catch (err) {
      setMessage('Failed to delete movie');
    }
  };

  const openEdit = (movie) => {
    setEditingMovie(movie);
    setEditForm({
      title: movie.title || '',
      description: movie.description || '',
      genre: movie.genre || '',
      duration: movie.duration ?? '',
      release_year: movie.release_year ?? '',
      poster_url: movie.poster_url || '',
      video_url: movie.video_url || '',
      rating: movie.rating ?? '',
    });
    setEditError('');
  };

  const closeEdit = () => {
    setEditingMovie(null);
    setEditForm({
      title: '', description: '', genre: '', duration: '', release_year: '', poster_url: '', video_url: '', rating: ''
    });
    setEditError('');
    setSaving(false);
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingMovie) return;

    setSaving(true);
    setEditError('');

    const payload = { title: editForm.title.trim() };
    const textFields = ['description', 'genre', 'poster_url', 'video_url'];
    textFields.forEach((field) => {
      const value = editForm[field].trim();
      if (value !== '') payload[field] = value;
    });
    if (editForm.duration !== '') payload.duration = Number(editForm.duration);
    if (editForm.release_year !== '') payload.release_year = Number(editForm.release_year);
    if (editForm.rating !== '') payload.rating = Number(editForm.rating);

    try {
      const res = await api.put(`/api/movies/${editingMovie.id}`, payload);
      if (res.data.success) {
        setMessage('Movie updated successfully');
        await fetchMovies();
        closeEdit();
      } else {
        setEditError(res.data.message || 'Failed to update movie');
      }
    } catch (err) {
      const data = err.response?.data;
      let msg = data?.message || 'Failed to update movie';
      if (Array.isArray(data?.errors) && data.errors.length > 0) {
        msg += `: ${data.errors.join(', ')}`;
      }
      setEditError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!admin) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p className="text-gray-400">Welcome, {user?.email}!</p>
        <p className="text-sm text-gray-500 mt-1">Role: {user?.role}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {message && (
        <div className={`px-4 py-2 rounded mb-4 text-sm ${
          message.includes('success') ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
        }`}>
          {message}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold mb-3">Add Movie</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <input
              type="text" placeholder="Title *" value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm"
              required
            />
            <textarea
              placeholder="Description" value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm"
              rows="2"
            />
            <input
              type="text" placeholder="Genre" value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm"
            />
            <input
              type="number" placeholder="Duration (min)" value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm"
            />
            <input
              type="number" placeholder="Release Year" value={formData.release_year}
              onChange={(e) => setFormData({ ...formData, release_year: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm"
            />
            <input
              type="url" placeholder="Poster URL" value={formData.poster_url}
              onChange={(e) => setFormData({ ...formData, poster_url: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm"
            />
            <input
              type="url" placeholder="Video URL" value={formData.video_url}
              onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm"
            />
            <input
              type="number" step="0.1" placeholder="Rating (0-10)" value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm"
            />
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded text-sm"
            >
              Add Movie
            </button>
          </form>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-3">Movies ({movies.length})</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {movies.map((movie) => (
              <div key={movie.id} className="flex items-center justify-between bg-gray-800 p-3 rounded">
                <div>
                  <span className="font-medium">{movie.title}</span>
                  <span className="text-sm text-gray-400 ml-2">{movie.genre}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => openEdit(movie)}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(movie.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {editingMovie && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
          onClick={closeEdit}
        >
          <div
            className="bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Edit Movie</h2>
              <button
                type="button"
                onClick={closeEdit}
                className="text-gray-400 hover:text-white text-2xl leading-none"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            {editError && (
              <div className="mb-4 px-4 py-2 rounded bg-red-900 text-red-200 text-sm">
                {editError}
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => handleEditChange('title', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={editForm.description}
                  onChange={(e) => handleEditChange('description', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Genre</label>
                  <input
                    type="text"
                    value={editForm.genre}
                    onChange={(e) => handleEditChange('genre', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Duration (min)</label>
                  <input
                    type="number"
                    min="1"
                    value={editForm.duration}
                    onChange={(e) => handleEditChange('duration', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Release Year</label>
                  <input
                    type="number"
                    min="1900"
                    max="2099"
                    value={editForm.release_year}
                    onChange={(e) => handleEditChange('release_year', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Rating (0-10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={editForm.rating}
                    onChange={(e) => handleEditChange('rating', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Poster URL</label>
                <input
                  type="url"
                  value={editForm.poster_url}
                  onChange={(e) => handleEditChange('poster_url', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Video URL</label>
                <input
                  type="url"
                  value={editForm.video_url}
                  onChange={(e) => handleEditChange('video_url', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-5 rounded text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-5 rounded text-sm disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}