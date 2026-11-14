import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen app-background text-white">
      <nav className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold text-red-500">
              MovieStream
            </Link>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-300">
                    {user?.email} ({user?.role})
                  </span>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="text-sm bg-red-600 px-3 py-1 rounded">
                      Admin
                    </Link>
                  )}
                  <Link
                    to="/favorites"
                    className={`text-sm hover:text-red-400 ${
                      location.pathname === '/favorites' ? 'text-red-400' : ''
                    }`}
                  >
                    Favorites
                  </Link>
                  <Link to="/dashboard" className="text-sm hover:text-red-400">
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="text-sm bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`text-sm hover:text-red-400 ${
                      location.pathname === '/login' ? 'text-red-400' : ''
                    }`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className={`text-sm hover:text-red-400 ${
                      location.pathname === '/register' ? 'text-red-400' : ''
                    }`}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}