import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
}