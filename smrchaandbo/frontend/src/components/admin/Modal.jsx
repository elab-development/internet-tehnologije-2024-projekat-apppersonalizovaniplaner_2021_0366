import { X } from 'lucide-react';

export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className='fixed inset-0 z-[1100]'>
      <div
        className='absolute inset-0 bg-black/30 backdrop-blur-[2px]'
        onClick={onClose}
      />
      <div className='relative z-[1110] mx-auto my-8 w-full max-w-lg px-4'>
        <div className='bg-white rounded-xl shadow-2xl'>
          <div className='flex items-center justify-between px-5 py-4'>
            <h4 className='text-lg font-semibold'>{title}</h4>
            <button
              aria-label='Close'
              onClick={onClose}
              className='p-1 text-slate-500 hover:text-slate-800'
            >
              <X className='h-5 w-5' />
            </button>
          </div>
          <div className='px-5 pb-5'>{children}</div>
        </div>
      </div>
    </div>
  );
}
