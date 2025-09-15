import AuthGate from './components/AuthGate';
import AccountPanel from './components/AccountPanel';

function Home() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">TuneIn</h1>
        <AccountPanel />
      </div>
      <div className="mt-8">
        <h2 className="text-lg font-medium mb-4">🎉 Authentication Working!</h2>
        <p className="text-gray-600">
          You're successfully logged in. The auth system is now configured with:
        </p>
        <ul className="mt-4 space-y-2 list-disc list-inside text-sm text-gray-600">
          <li>Email/password signup and login</li>
          <li>Google OAuth integration</li>
          <li>Duplicate email prevention</li>
          <li>Profile auto-creation</li>
          <li>Provider linking capability</li>
        </ul>
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