import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AuthForm() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setBusy(true); setErr(''); setMsg('');
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMsg('Check your email to confirm (if required), then log in.');
        setMode('login');
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/reset-password'
        });
        if (error) throw error;
        setMsg('Check your email for a password reset link.');
        setMode('login');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e) {
      const m = String(e.message || e);
      if (m.toLowerCase().includes('already')) {
        setErr('Email already registered — try logging in.');
        setMode('login');
      } else {
        setErr(m);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setBusy(true); setErr('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/' },
      });
      if (error) throw error;
    } catch (e) {
      setErr(String(e.message || e));
      setBusy(false);
    }
  };

  const getTitle = () => {
    if (mode === 'signup') return 'Create account';
    if (mode === 'reset') return 'Reset password';
    return 'Hello!';
  };

  const getButtonText = () => {
    if (mode === 'signup') return 'Sign up';
    if (mode === 'reset') return 'Send reset link';
    return 'Log in';
  };

  return (
    <div className="mx-auto max-w-sm rounded-2xl p-6 shadow bg-app-surface/95 border border-app-border">
      <h2 className="text-xl font-semibold mb-4 text-app-text">{getTitle()}</h2>
      <form onSubmit={handleEmailAuth} className="space-y-3">
        <input type="email" className="w-full rounded border border-app-border bg-app-surface2 text-app-text px-3 py-2 placeholder-app-muted focus:border-app-primary focus:outline-none" placeholder="you@example.com"
               value={email} onChange={(e)=>setEmail(e.target.value)} required />
        {mode !== 'reset' && (
          <input type="password" className="w-full rounded border border-app-border bg-app-surface2 text-app-text px-3 py-2 placeholder-app-muted focus:border-app-primary focus:outline-none" placeholder="••••••••"
                 value={password} onChange={(e)=>setPassword(e.target.value)} minLength={6} required />
        )}
        <button type="submit" disabled={busy}
                className="w-full rounded py-2 font-medium bg-app-primary hover:bg-app-primary/90 text-app-primary-fg disabled:opacity-50 transition-colors">
          {getButtonText()}
        </button>
      </form>

      {mode !== 'reset' && (
        <>
          <div className="my-4 flex items-center gap-2">
            <div className="h-px flex-1 bg-app-border" />
            <span className="text-xs text-app-muted">or</span>
            <div className="h-px flex-1 bg-app-border" />
          </div>

          <button onClick={handleGoogle} disabled={busy}
                  className="w-full rounded py-2 font-medium border border-app-border bg-app-surface2 text-app-text hover:bg-app-surface transition-colors">
            Continue with Google
          </button>
        </>
      )}

      <div className="mt-3 space-y-2">
        {mode === 'login' && (
          <p className="text-sm text-center">
            <button className="text-app-primary hover:text-app-primary/80 underline" onClick={() => setMode('reset')}>
              Forgot password?
            </button>
          </p>
        )}

        <p className="text-sm text-center text-app-muted">
          {mode === 'signup' && (
            <>
              Already have an account?{' '}
              <button className="text-app-primary hover:text-app-primary/80 underline" onClick={() => setMode('login')}>
                Log in
              </button>
            </>
          )}
          {mode === 'login' && (
            <>
              Don't have an account?{' '}
              <button className="text-app-primary hover:text-app-primary/80 underline" onClick={() => setMode('signup')}>
                Sign up
              </button>
            </>
          )}
          {mode === 'reset' && (
            <>
              Remember your password?{' '}
              <button className="text-app-primary hover:text-app-primary/80 underline" onClick={() => setMode('login')}>
                Back to login
              </button>
            </>
          )}
        </p>
      </div>

      {err && <p className="mt-3 text-sm text-red-400 bg-red-900/20 border border-red-800 rounded p-2">{err}</p>}
      {msg && <p className="mt-3 text-sm text-green-400 bg-green-900/20 border border-green-800 rounded p-2">{msg}</p>}
    </div>
  );
}