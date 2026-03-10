import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PrivateRoute({ children }) {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return <div className='py-20 text-center text-slate-500'>Loading…</div>;
  }

  return isAuthenticated ? (
    children
  ) : (
    <Navigate to='/login' replace state={{ from: location }} />
  );
}
