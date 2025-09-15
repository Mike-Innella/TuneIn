import { supabase } from './supabaseClient';

export async function logInteraction({
  event,
  videoId,
  mood = null,
  sessionId = null
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('No authenticated user - skipping interaction log');
      return;
    }

    const { error } = await supabase.from('interactions').insert([{
      user_id: user.id,
      track_provider: 'youtube',
      track_provider_id: videoId,
      event: event,
      mood: mood,
      session_id: sessionId
    }]);

    if (error) {
      console.error('Failed to log interaction:', error);
    }
  } catch (err) {
    console.error('Error logging interaction:', err);
  }
}

// Helper to generate session IDs
export function generateSessionId() {
  return crypto.randomUUID();
}

// Get user's interaction history
export async function getUserInteractions(limit = 100) {
  try {
    const { data, error } = await supabase
      .from('interactions')
      .select('*')
      .order('at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching user interactions:', err);
    return [];
  }
}