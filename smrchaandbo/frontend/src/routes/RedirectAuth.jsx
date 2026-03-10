import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RedirectAuth({ children }) {
  const { isAuthenticated, user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return <div className='py-20 text-center text-slate-500'>Loading…</div>;
  }

  if (isAuthenticated) {
    const dest = user?.role === 'admin' ? '/admin' : '/';
    return <Navigate to={dest} replace state={{ from: location }} />;
  }

  return children;
}
