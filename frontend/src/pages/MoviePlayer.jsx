import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'www.youtu.be',
]);

const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.ogv', '.mov', '.m4v'];

const isValidYouTubeId = (value) =>
  typeof value === 'string' && /^[A-Za-z0-9_-]{11}$/.test(value);

const getYouTubeId = (rawUrl) => {
  if (typeof rawUrl !== 'string' || rawUrl.trim() === '') return null;

  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return null;
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;

  const host = parsed.hostname.toLowerCase();
  if (!YOUTUBE_HOSTS.has(host)) return null;

  if (host === 'youtu.be' || host === 'www.youtu.be') {
    const candidate = parsed.pathname.split('/').filter(Boolean)[0];
    return isValidYouTubeId(candidate) ? candidate : null;
  }

  if (parsed.pathname === '/watch' || parsed.pathname === '/watch/') {
    const candidate = parsed.searchParams.get('v');
    return isValidYouTubeId(candidate) ? candidate : null;
  }

  const match = parsed.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/);
  if (match) {
    return isValidYouTubeId(match[1]) ? match[1] : null;
  }

  return null;
};

const isDirectVideoUrl = (rawUrl) => {
  if (typeof rawUrl !== 'string' || rawUrl.trim() === '') return false;

  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return false;
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;

  const pathname = parsed.pathname.toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => pathname.endsWith(ext));
};

export default function MoviePlayer() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
          setError('Failed to load movie');
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
        <div className="text-gray-400">Loading player...</div>
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

  if (!movie.video_url) {
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

        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <div className="text-gray-500 text-6xl mb-4">🎬</div>
          <h2 className="text-2xl font-bold mb-2">{movie.title}</h2>
          <p className="text-red-400 mb-6">Video is not available for this movie.</p>
          <p className="text-gray-400 text-sm mb-6">
            The video file has not been added yet. Please contact the administrator.
          </p>
          <Link
            to={`/movies/${id}`}
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded transition"
          >
            Back to Details
          </Link>
        </div>
      </div>
    );
  }

  const youTubeId = getYouTubeId(movie.video_url);
  const directVideo = !youTubeId && isDirectVideoUrl(movie.video_url);

  return (
    <div className="max-w-5xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-sm text-gray-400 hover:text-red-400 transition flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <h1 className="text-2xl font-bold mb-4">{movie.title}</h1>

      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
        {youTubeId ? (
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${youTubeId}`}
            title={movie.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : directVideo ? (
          <video
            src={movie.video_url}
            controls
            className="w-full h-full"
            poster={movie.poster_url || undefined}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="text-gray-500 text-5xl mb-4">🎬</div>
            <p className="text-red-400 font-medium mb-2">Unsupported video URL</p>
            <p className="text-gray-400 text-sm max-w-md">
              Only direct video files (e.g. .mp4, .webm) and YouTube links are supported.
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          to={`/movies/${id}`}
          className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded transition"
        >
          Back to Details
        </Link>
      </div>
    </div>
  );
}