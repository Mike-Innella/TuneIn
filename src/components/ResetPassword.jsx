import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a valid session (user clicked reset link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setErr('Invalid or expired reset link. Please request a new one.');
      }
    });
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErr('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setErr('Password must be at least 6 characters');
      return;
    }

    setBusy(true);
    setErr('');
    setMsg('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setMsg('Password updated successfully! Redirecting...');
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      setErr(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-app">
      <div className="w-full max-w-md bg-app-surface/95 rounded-2xl p-6 shadow-lg border border-app-border">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-app-text mb-2">Reset Password</h1>
          <p className="text-app-muted">Enter your new password below</p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-app-text">New Password</label>
            <input
              type="password"
              className="w-full border border-app-border bg-app-surface2 text-app-text rounded-lg px-4 py-3 placeholder-app-muted focus:outline-none focus:ring-2 focus:ring-app-primary focus:border-transparent"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={busy}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-app-text">Confirm Password</label>
            <input
              type="password"
              className="w-full border border-app-border bg-app-surface2 text-app-text rounded-lg px-4 py-3 placeholder-app-muted focus:outline-none focus:ring-2 focus:ring-app-primary focus:border-transparent"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              disabled={busy}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-app-primary hover:bg-app-primary/90 disabled:bg-app-primary/50 text-app-primary-fg rounded-lg px-4 py-3 font-medium transition-colors"
            disabled={busy}
          >
            {busy ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        {err && (
          <div className="mt-4 p-3 rounded-lg text-sm bg-red-900/20 text-red-400 border border-red-800">
            {err}
          </div>
        )}

        {msg && (
          <div className="mt-4 p-3 rounded-lg text-sm bg-green-900/20 text-green-400 border border-green-800">
            {msg}
          </div>
        )}

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-app-primary hover:text-app-primary/80 hover:underline"
          >
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
}