import AuthGate from './components/AuthGate';
import AccountPanel from './components/AccountPanel';
import { useSession } from './hooks/useSession';

function Home() {
  const { session } = useSession();
  const user = session?.user;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">TuneIn - Auth Test</h1>
        <AccountPanel />
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">🎉 Authentication Working!</h2>
        <div className="space-y-4">
          <div>
            <strong>User Email:</strong> {user?.email}
          </div>
          <div>
            <strong>User ID:</strong> {user?.id}
          </div>
          <div>
            <strong>Created:</strong> {new Date(user?.created_at).toLocaleString()}
          </div>
          <div>
            <strong>Providers:</strong> {user?.identities?.map(id => id.provider).join(', ') || 'Email only'}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-medium mb-2">Auth System Features:</h3>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>✅ Email/password signup and login</li>
            <li>✅ Google OAuth integration</li>
            <li>✅ Duplicate email prevention</li>
            <li>✅ Profile auto-creation</li>
            <li>✅ Profile editing (full name + avatar)</li>
            <li>✅ Provider linking capability</li>
            <li>✅ Row Level Security (RLS)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthGate>
      <Home />
    </AuthGate>
  );
}