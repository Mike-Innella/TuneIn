import { useSession } from '../hooks/useSession';
import AuthForm from './AuthForm';

export default function AuthGate({ children }) {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <div className="min-h-screen bg-app text-app-text flex items-center justify-center">
        <div className="text-lg">Loading…</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-app grid place-items-center">
        <AuthForm />
      </div>
    );
  }

  return children;
}