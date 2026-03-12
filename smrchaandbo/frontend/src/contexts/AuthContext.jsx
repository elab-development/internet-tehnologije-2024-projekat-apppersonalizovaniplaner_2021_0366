import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchMe, loginUser, logoutUser, registerUser } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await fetchMe();
        if (mounted) setUser(data?.data ?? data);
      } catch {
      } finally {
        if (mounted) setInitializing(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function register(payload) {
    setLoading(true);
    setError(null);
    try {
      const { data } = await registerUser(payload);
      setUser(data?.user ?? null);
      return { ok: true };
    } catch (e) {
      setError(extractError(e));
      return { ok: false, error: extractError(e) };
    } finally {
      setLoading(false);
    }
  }

  async function login(payload) {
    setLoading(true);
    setError(null);
    try {
      await loginUser(payload);
      const { data } = await fetchMe();
      setUser(data?.data ?? data);
      return { ok: true };
    } catch (e) {
      setError(extractError(e));
      return { ok: false, error: extractError(e) };
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setLoading(true);
    setError(null);
    try {
      await logoutUser();
      setUser(null);
      return { ok: true };
    } catch (e) {
      setError(extractError(e));
      return { ok: false, error: extractError(e) };
    } finally {
      setLoading(false);
    }
  }

  const value = useMemo(
    () => ({
      user,
      initializing,
      loading,
      error,
      register,
      login,
      logout,
      setError,
      isAuthenticated: !!user,
    }),
    [user, initializing, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

function extractError(err) {
  if (err?.code === 'ERR_NETWORK')
    return 'Network error: check API URL / CORS / cookies.';
  const res = err?.response;
  if (!res) return 'Unexpected error.';

  if (res.status === 422 && res.data?.errors) {
    const first = Object.values(res.data.errors)[0];
    return Array.isArray(first) ? first[0] : 'Validation error.';
  }

  if (res.status === 419)
    return 'CSRF token mismatch: ensure /sanctum/csrf-cookie works and cookies are enabled.';

  if (res.status === 401) return 'Unauthorized. Session not set.';

  if (res.data?.message) return res.data.message;

  return `Error ${res.status || ''}`.trim();
}
