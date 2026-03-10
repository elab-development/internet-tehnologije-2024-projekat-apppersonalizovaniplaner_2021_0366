import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const LoadingContext = createContext(null);

export function LoadingProvider({ children }) {
  const [pending, setPending] = useState(0);
  const pendingRef = useRef(0);

  const start = () => {
    pendingRef.current += 1;
    setPending(pendingRef.current);
  };

  const stop = () => {
    pendingRef.current = Math.max(0, pendingRef.current - 1);
    setPending(pendingRef.current);
  };

  useEffect(() => {
    const onStart = () => start();
    const onStop = () => stop();

    window.addEventListener('app:loading-start', onStart);
    window.addEventListener('app:loading-stop', onStop);
    return () => {
      window.removeEventListener('app:loading-start', onStart);
      window.removeEventListener('app:loading-stop', onStop);
    };
  }, []);

  const value = useMemo(
    () => ({
      isLoading: pending > 0,
      start,
      stop,
      pending,
    }),
    [pending]
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <LoadingOverlay active={pending > 0} />
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error('useLoading must be used within <LoadingProvider>');
  return ctx;
}

function LoadingOverlay({ active }) {
  if (!active) return null;
  return (
    <div className='fixed inset-0 z-[1000] bg-white/70 backdrop-blur-sm flex items-center justify-center'>
      <div className='flex flex-col items-center gap-3'>
        <div className='h-10 w-10 rounded-full border-2 border-fuchsia-600 border-t-transparent animate-spin' />
        <p className='text-sm text-slate-700'>Loading…</p>
      </div>
    </div>
  );
}
