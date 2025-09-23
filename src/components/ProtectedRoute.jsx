import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      console.log('[ProtectedRoute] Initial session check:', !!data.session);
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log('[ProtectedRoute] Auth state change:', event, !!newSession);
      if (!mounted) return;
      setSession(newSession);
      if (loading) setLoading(false);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-app text-app-text flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) return <Navigate to="/auth" replace />;
  return children;
}