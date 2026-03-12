import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading, error, setError } = useAuth();
  const [form, setForm] = useState({
    email: '',
    password: '',
    remember: false,
  });

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    const { ok } = await login({
      email: form.email,
      password: form.password,
      remember: form.remember,
    });
    if (ok) navigate('/');
  }

  return (
    <section className='space-y-4'>
      <h1 className='text-3xl font-semibold tracking-tight'>
        <span className='text-fuchsia-700'>Login</span>
      </h1>
      <p className='text-slate-600'>Welcome back.</p>

      <div className='mt-6'>
        {error && (
          <div className='mb-4 px-4 py-3 bg-fuchsia-600/10 text-fuchsia-800'>
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className='space-y-5'>
          <div>
            <label className='block text-sm text-slate-700 mb-1'>Email</label>
            <input
              type='email'
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className='w-full bg-slate-50 px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500'
              placeholder='Email address'
              autoComplete='email'
            />
          </div>

          <div>
            <label className='block text-sm text-slate-700 mb-1'>
              Password
            </label>
            <input
              type='password'
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className='w-full bg-slate-50 px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500'
              placeholder='Password'
              autoComplete='current-password'
            />
          </div>

          <div className='flex items-center justify-between'>
            <label className='inline-flex items-center gap-2 text-sm text-slate-600'>
              <input
                type='checkbox'
                checked={form.remember}
                onChange={(e) =>
                  setForm({ ...form, remember: e.target.checked })
                }
                className='h-4 w-4 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-fuchsia-500'
              />
              Remember me
            </label>
            <span className='text-xs text-slate-500'>
              Forgot password? (later)
            </span>
          </div>

          <div className='pt-1 flex flex-col sm:flex-row gap-3'>
            <button
              type='submit'
              disabled={loading}
              className='inline-flex items-center justify-center bg-fuchsia-600 px-5 py-3 text-white hover:bg-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 disabled:opacity-60'
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
            <Link
              to='/register'
              className='inline-flex items-center justify-center bg-white px-5 py-3 text-fuchsia-700 hover:bg-fuchsia-50 focus:outline-none focus:ring-2 focus:ring-fuchsia-500'
            >
              Create an account
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
