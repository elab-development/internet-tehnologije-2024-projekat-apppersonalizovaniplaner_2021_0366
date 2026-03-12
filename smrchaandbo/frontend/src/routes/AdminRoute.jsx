import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminRoute({ children }) {
  const { isAuthenticated, user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return <div className='py-20 text-center text-slate-500'>Loading…</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to='/login' replace state={{ from: location }} />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to='/' replace />;
  }

  return children;
}
