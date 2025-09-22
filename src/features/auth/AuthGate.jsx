import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import AuthForm from "../../components/AuthForm";

export default function AuthGate() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        nav("/app", { replace: true });
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        nav("/app", { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [nav]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] text-white flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen grid place-items-center bg-[#0b0b0b] text-white px-6">
      <div className="w-full max-w-md bg-black/40 border border-white/10 p-6 rounded-2xl">
        <AuthForm />
      </div>
    </main>
  );
}