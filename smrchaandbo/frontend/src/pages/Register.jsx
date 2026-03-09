import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register, loading, error, setError } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    const { ok } = await register(form);
    if (ok) navigate('/');
  }

  return (
    <section className='space-y-4'>
      <h1 className='text-3xl font-semibold tracking-tight'>
        <span className='text-fuchsia-700'>Register</span>
      </h1>
      <p className='text-slate-600'>Create your Smrcha&Bo account.</p>

      <div className='mt-6'>
        {error && (
          <div className='mb-4 px-4 py-3 bg-fuchsia-600/10 text-fuchsia-800'>
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className='space-y-5'>
          <div>
            <label className='block text-sm text-slate-700 mb-1'>Name</label>
            <input
              type='text'
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className='w-full bg-slate-50 px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500'
              placeholder='Name'
            />
          </div>

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
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className='w-full bg-slate-50 px-4 py-3 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500'
              placeholder='Password'
              autoComplete='new-password'
            />
            <p className='mt-1 text-xs text-slate-500'>
              Minimum 8 characters, include numbers & symbols.
            </p>
          </div>

          <div className='pt-1 flex flex-col sm:flex-row gap-3'>
            <button
              type='submit'
              disabled={loading}
              className='inline-flex items-center justify-center bg-fuchsia-600 px-5 py-3 text-white hover:bg-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 disabled:opacity-60'
            >
              {loading ? 'Creating…' : 'Create account'}
            </button>
            <Link
              to='/login'
              className='inline-flex items-center justify-center bg-white px-5 py-3 text-fuchsia-700 hover:bg-fuchsia-50 focus:outline-none focus:ring-2 focus:ring-fuchsia-500'
            >
              I already have an account
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}
