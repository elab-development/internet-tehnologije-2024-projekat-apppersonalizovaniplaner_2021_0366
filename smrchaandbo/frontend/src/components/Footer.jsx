export default function Footer() {
  return (
    <footer className='border-t border-slate-100'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6'>
        <div className='flex flex-col md:flex-row items-center justify-between gap-3'>
          <p className='text-sm text-slate-600'>
            © {new Date().getFullYear()} Smrcha&Bo — Custom planners &
            notebooks.
          </p>
          <div className='text-sm'>
            <span className='text-slate-500'>Built with </span>
            <span className='text-fuchsia-700 font-medium'>React</span>
            <span className='text-slate-500'> & Tailwind</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
