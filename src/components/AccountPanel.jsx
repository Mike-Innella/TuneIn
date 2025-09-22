import { supabase } from '../lib/supabaseClient';
import { useSession } from '../hooks/useSession';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';

export default function AccountPanel() {
  const { session } = useSession();
  const navigate = useNavigate();
  const user = session?.user;
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        // Try the auth-schema.sql structure first (id column)
        let { data, error } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single();

        // If that fails, try the schema.sql structure (user_id column)
        if (error && error.code === 'PGRST116') {
          const result = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
          data = result.data;
          error = result.error;
        }

        if (!error && data) {
          setFullName(data.full_name ?? '');
          setAvatarUrl(data.avatar_url ?? '');
        } else if (error) {
          console.warn('Profile load failed:', error);
        }
      } catch (err) {
        console.warn('Profile load error:', err);
      }
    };
    load();
  }, [user?.id]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth', { replace: true });
  };


  const saveProfile = async () => {
    setSaving(true);
    try {
      // Try updating with auth-schema.sql structure first (id column)
      let { error } = await supabase.from('profiles').update({
        full_name: fullName || null,
        avatar_url: avatarUrl || null,
      }).eq('id', user.id);

      // If that fails, try schema.sql structure (user_id column)
      if (error && error.code === 'PGRST116') {
        const result = await supabase.from('profiles').update({
          full_name: fullName || null,
          avatar_url: avatarUrl || null,
        }).eq('user_id', user.id);
        error = result.error;
      }

      if (error) {
        alert(error.message);
      } else {
        setShowProfile(false);
      }
    } catch (err) {
      console.warn('Profile save error:', err);
      alert('Failed to save profile');
    }
    setSaving(false);
  };

  const profileModal = showProfile ? createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="bg-app-surface border border-app-border rounded-lg p-6 max-w-md w-full shadow-2xl">
          <h3 className="text-lg font-semibold mb-4 text-app-text">Edit Profile</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-app-text">Full Name</label>
              <input
                type="text"
                className="w-full rounded border border-app-border bg-app-surface2 text-app-text px-3 py-2 placeholder-app-muted focus:outline-none focus:ring-2 focus:ring-app-primary"
                value={fullName}
                onChange={e=>setFullName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-app-text">Avatar URL</label>
              <input
                type="url"
                className="w-full rounded border border-app-border bg-app-surface2 text-app-text px-3 py-2 placeholder-app-muted focus:outline-none focus:ring-2 focus:ring-app-primary"
                value={avatarUrl}
                onChange={e=>setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowProfile(false)}
                className="px-4 py-2 rounded border border-app-border bg-app-surface2 text-app-text hover:bg-app-surface hover:scale-105 transition-all duration-300 transform-gpu"
              >
                Cancel
              </button>
              <button
                disabled={saving}
                onClick={saveProfile}
                className="px-4 py-2 rounded bg-app-primary text-app-primary-fg disabled:opacity-50 hover:bg-app-primary/90 hover:scale-105 hover:shadow-lg transition-all duration-300 transform-gpu"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowProfile(true)}
          className="h-9 px-3 rounded-full border border-app-border bg-app-surface2/80 flex items-center gap-2 text-sm hover:bg-app-surface2 hover:scale-110 hover:shadow-lg hover:border-app-primary/50 transition-all duration-300 transform-gpu"
          aria-label="Edit Profile"
          title="Edit Profile"
        >
          <User className="h-4 w-4 text-app-muted hover:text-app-primary transition-colors duration-300" />
          <span className="hidden sm:inline text-app-text">Profile</span>
        </button>
        <button
          onClick={signOut}
          className="h-9 px-3 rounded-full border border-app-border bg-app-surface2/80 flex items-center gap-2 text-sm hover:bg-app-surface2 hover:scale-110 hover:shadow-lg hover:border-red-400/50 transition-all duration-300 transform-gpu"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut className="h-4 w-4 text-app-muted hover:text-red-400 transition-colors duration-300" />
          <span className="hidden sm:inline text-app-text">Sign out</span>
        </button>
      </div>
      {profileModal}
    </>
  );
}