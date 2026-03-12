import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Palette,
  Ruler,
  Layers,
  BookOpen,
  CreditCard,
  Truck,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function Home() {
  const { isAuthenticated, user, initializing } = useAuth();

  return (
    <main className='space-y-16'>
      {/* HERO — takes (almost) full screen */}
      <section className='relative bg-gradient-to-b from-white to-slate-50 isolate'>
        {/* subtle blobs */}
        <div className='pointer-events-none absolute -top-24 -right-20 h-72 w-72 rounded-full bg-fuchsia-200/40 blur-3xl' />
        <div className='pointer-events-none absolute bottom-0 -left-10 h-48 w-48 rounded-full bg-fuchsia-300/30 blur-2xl' />

        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-10 items-center min-h-[70vh] py-16'>
            {/* Copy */}
            <div className='space-y-6'>
              <div className='inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full bg-fuchsia-50 text-fuchsia-700'>
                <Sparkles className='h-4 w-4' />
                Custom planners that fit your life
              </div>

              <h1 className='text-4xl sm:text-5xl font-semibold leading-tight'>
                Build your{' '}
                <span className='text-fuchsia-700'>perfect planner</span>
                <br className='hidden sm:block' /> in minutes.
              </h1>

              <p className='text-slate-600 max-w-xl'>
                Choose size, paper, binding, colors and covers. Add modular
                components like monthly, weekly, habit & project pages. Save,
                order, and get it shipped.
              </p>

              {/* CTAs */}
              {!initializing && (
                <div className='flex flex-col sm:flex-row gap-3 pt-2'>
                  {isAuthenticated ? (
                    <>
                      <Link
                        to='/planners/new'
                        className='inline-flex items-center justify-center bg-fuchsia-600 px-6 py-3 text-white rounded-lg hover:bg-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-500'
                      >
                        Create your planner
                      </Link>
                      <Link
                        to='/account'
                        className='inline-flex items-center justify-center bg-white px-6 py-3 text-slate-800 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-fuchsia-500'
                      >
                        Go to Account
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to='/register'
                        className='inline-flex items-center justify-center bg-fuchsia-600 px-6 py-3 text-white rounded-lg hover:bg-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-500'
                      >
                        Get started
                      </Link>
                      <Link
                        to='/login'
                        className='inline-flex items-center justify-center bg-white px-6 py-3 text-fuchsia-700 rounded-lg hover:bg-fuchsia-50 focus:outline-none focus:ring-2 focus:ring-fuchsia-500'
                      >
                        I already have an account
                      </Link>
                    </>
                  )}
                </div>
              )}

              {!initializing && (
                <div className='pt-2'>
                  <span
                    className={`text-xs px-3 py-1 font-medium rounded-full ${
                      isAuthenticated
                        ? 'bg-fuchsia-600 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {isAuthenticated
                      ? `Signed in as ${user?.name ?? 'Account'}`
                      : 'Guest'}
                  </span>
                </div>
              )}
            </div>

            {/* Visual / mock preview */}
            <div className='relative'>
              <div className='mx-auto max-w-md lg:max-w-none'>
                <div className='aspect-[4/3] rounded-2xl bg-white shadow-xl ring-1 ring-slate-100 p-6 flex flex-col'>
                  <div className='flex items-center justify-between'>
                    <div className='h-7 w-24 rounded-full bg-slate-100' />
                    <div className='h-7 w-7 rounded-full bg-fuchsia-600' />
                  </div>

                  <div className='mt-6 grid grid-cols-3 gap-3'>
                    <div className='h-28 rounded-xl bg-slate-50 ring-1 ring-slate-100 flex items-center justify-center'>
                      <Ruler className='h-6 w-6 text-slate-400' />
                    </div>
                    <div className='h-28 rounded-xl bg-slate-50 ring-1 ring-slate-100 flex items-center justify-center'>
                      <Palette className='h-6 w-6 text-slate-400' />
                    </div>
                    <div className='h-28 rounded-xl bg-slate-50 ring-1 ring-slate-100 flex items-center justify-center'>
                      <Layers className='h-6 w-6 text-slate-400' />
                    </div>
                  </div>

                  <div className='mt-6 flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <BookOpen className='h-5 w-5 text-fuchsia-700' />
                      <p className='text-sm font-medium text-slate-800'>
                        Weekly + Habits
                      </p>
                    </div>
                    <p className='text-sm text-slate-500'>€24.90</p>
                  </div>

                  <div className='mt-4'>
                    <div className='h-10 w-full rounded-lg bg-fuchsia-600/90 text-white flex items-center justify-center text-sm'>
                      Preview
                    </div>
                  </div>
                </div>
              </div>

              {/* floating card */}
              <div className='hidden lg:block absolute -bottom-6 -right-6 bg-white shadow-lg ring-1 ring-slate-100 rounded-xl px-4 py-3'>
                <div className='flex items-center gap-3'>
                  <ShieldCheck className='h-5 w-5 text-fuchsia-700' />
                  <p className='text-sm text-slate-700'>
                    Quality paper & binding
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-6'>
          <Feature
            icon={<Ruler className='h-5 w-5' />}
            title='Sizes & paper'
            text='A5, A6, B5 and more. Smooth, bleed-resistant paper weights.'
          />
          <Feature
            icon={<Layers className='h-5 w-5' />}
            title='Modular components'
            text='Mix monthly, weekly, habit trackers, project pages, dot/blank.'
          />
          <Feature
            icon={<Palette className='h-5 w-5' />}
            title='Colors & covers'
            text='Vibrant covers, refined colorways and clean typography.'
          />
          <Feature
            icon={<ShieldCheck className='h-5 w-5' />}
            title='Built to last'
            text='Premium binding and careful production—daily-use ready.'
          />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 p-6 sm:p-8'>
          <h2 className='text-xl font-semibold text-slate-900'>How it works</h2>
          <ol className='mt-5 grid md:grid-cols-3 gap-6'>
            <Step
              index={1}
              title='Customize'
              text='Pick template, size, paper, binding and add components that match your workflow.'
            />
            <Step
              index={2}
              title='Checkout'
              text='Secure checkout with clear pricing. Save multiple builds to compare.'
              icon={<CreditCard className='h-5 w-5 text-fuchsia-700' />}
            />
            <Step
              index={3}
              title='Ship'
              text='We produce and ship quickly. Track your delivery to your door.'
              icon={<Truck className='h-5 w-5 text-fuchsia-700' />}
            />
          </ol>

          <div className='mt-6 flex flex-col sm:flex-row gap-3'>
            {isAuthenticated ? (
              <Link
                to='/planners/new'
                className='inline-flex items-center justify-center bg-fuchsia-600 px-6 py-3 text-white rounded-lg hover:bg-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-500'
              >
                Start building
              </Link>
            ) : (
              <>
                <Link
                  to='/register'
                  className='inline-flex items-center justify-center bg-fuchsia-600 px-6 py-3 text-white rounded-lg hover:bg-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-500'
                >
                  Create account
                </Link>
                <Link
                  to='/login'
                  className='inline-flex items-center justify-center bg-white px-6 py-3 text-fuchsia-700 rounded-lg hover:bg-fuchsia-50 focus:outline-none focus:ring-2 focus:ring-fuchsia-500'
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

/* ---------------- small atoms ---------------- */

function Feature({ icon, title, text }) {
  return (
    <div className='bg-white rounded-xl shadow-sm ring-1 ring-slate-100 p-5'>
      <div className='inline-flex h-9 w-9 items-center justify-center rounded-lg bg-fuchsia-50 text-fuchsia-700'>
        {icon}
      </div>
      <h3 className='mt-3 text-base font-semibold text-slate-900'>{title}</h3>
      <p className='mt-1 text-sm text-slate-600'>{text}</p>
    </div>
  );
}

function Step({ index, title, text, icon }) {
  return (
    <li className='flex gap-4'>
      <div className='flex-shrink-0'>
        <div className='h-8 w-8 rounded-full bg-fuchsia-600 text-white flex items-center justify-center text-sm font-semibold'>
          {icon ?? index}
        </div>
      </div>
      <div>
        <h4 className='text-slate-900 font-medium'>{title}</h4>
        <p className='text-slate-600 text-sm mt-1'>{text}</p>
      </div>
    </li>
  );
}
