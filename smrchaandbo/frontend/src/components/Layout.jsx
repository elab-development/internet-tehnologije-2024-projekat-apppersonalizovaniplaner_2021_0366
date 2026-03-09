import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

export default function Layout() {
  return (
    <div className='min-h-dvh bg-white text-slate-900'>
      <Navbar />
      <main className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10'>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
