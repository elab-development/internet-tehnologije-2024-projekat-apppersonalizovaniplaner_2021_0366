import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { NotebookPen, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-2 py-1 text-sm font-medium transition-colors ${
          isActive
            ? 'text-fuchsia-700'
            : 'text-slate-700 hover:text-fuchsia-700'
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, loading } = useAuth();

  async function handleLogout() {
    const { ok } = await logout();
    if (ok) navigate('/');
  }

  const isAdmin = isAuthenticated && user?.role === 'admin';

  return (
    <header className='sticky top-0 z-40 bg-white border-b border-slate-100'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex h-16 items-center justify-between'>
          {/* Brand */}
          <Link to='/' className='flex items-center gap-2'>
            <div className='flex h-9 w-9 items-center justify-center bg-fuchsia-600 text-white'>
              <NotebookPen className='h-5 w-5' />
            </div>
            <span className='font-semibold tracking-tight'>
              <span className='text-fuchsia-700'>Smrcha</span>
              <span className='text-slate-900'>&amp;</span>
              <span className='text-fuchsia-700'>Bo</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className='hidden md:flex items-center gap-6'>
            <NavItem to='/'>Home</NavItem>

            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  <NavItem to='/admin'>Admin Dashboard</NavItem>
                ) : (
                  <NavItem to='/account'>Account</NavItem>
                )}
                <span className='text-sm text-slate-500'>
                  {user?.name ?? 'Account'}
                </span>
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className='inline-flex items-center gap-2 text-sm font-medium text-fuchsia-700 hover:text-fuchsia-800 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 px-2 py-1'
                >
                  <LogOut className='h-4 w-4' /> Logout
                </button>
              </>
            ) : (
              <>
                <NavItem to='/login'>Login</NavItem>
                <NavItem to='/register'>Register</NavItem>
              </>
            )}
          </nav>

          {/* Mobile toggle */}
          <button
            className='md:hidden p-2 focus:outline-none focus:ring-2 focus:ring-fuchsia-500'
            aria-label='Toggle menu'
            onClick={() => setOpen(!open)}
          >
            {open ? (
              <X className='h-5 w-5 text-slate-900' />
            ) : (
              <Menu className='h-5 w-5 text-slate-900' />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className='md:hidden border-t border-slate-100'>
          <div className='mx-4 py-2 flex flex-col text-sm'>
            <NavLink
              to='/'
              className='px-2 py-2 hover:text-fuchsia-700'
              onClick={() => setOpen(false)}
            >
              Home
            </NavLink>

            {isAuthenticated ? (
              <>
                {isAdmin ? (
                  <NavLink
                    to='/admin'
                    className='px-2 py-2 hover:text-fuchsia-700'
                    onClick={() => setOpen(false)}
                  >
                    Admin Dashboard
                  </NavLink>
                ) : (
                  <NavLink
                    to='/account'
                    className='px-2 py-2 hover:text-fuchsia-700'
                    onClick={() => setOpen(false)}
                  >
                    Account
                  </NavLink>
                )}
                <button
                  onClick={async () => {
                    await handleLogout();
                    setOpen(false);
                  }}
                  className='text-left px-2 py-2 hover:text-fuchsia-700'
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink
                  to='/login'
                  className='px-2 py-2 hover:text-fuchsia-700'
                  onClick={() => setOpen(false)}
                >
                  Login
                </NavLink>
                <NavLink
                  to='/register'
                  className='px-2 py-2 hover:text-fuchsia-700'
                  onClick={() => setOpen(false)}
                >
                  Register
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
