import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from './components/ThemeProvider';
import { PlayerProvider } from './player/PlayerContext';
import { GlobalAudioProvider } from './audio/GlobalAudioProvider';
import PlayerBar from './components/PlayerBar';
// import YouTubeMount from './player/YouTubeMount';
import Hero from './features/landing/Hero';
import AuthGate from './features/auth/AuthGate';
import MainApp from './features/app/MainApp';
import ProtectedRoute from './components/ProtectedRoute';
import ResetPassword from './components/ResetPassword';
import { useEffect } from 'react';
import { initializeSessionTimer } from './lib/sessionTimer';



export default function App() {
  // Initialize session timer on app start
  useEffect(() => {
    initializeSessionTimer();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <GlobalAudioProvider>
          <PlayerProvider>
            <BrowserRouter>
              <div className="min-h-screen bg-app text-app-text">
                <Routes>
                  {/* Landing */}
                  <Route path="/" element={<Hero />} />

                  {/* Auth */}
                  <Route path="/auth" element={<AuthGate />} />
                  <Route path="/reset" element={<ResetPassword />} />

                  {/* Protected App */}
                  <Route
                    path="/app/*"
                    element={
                      <ProtectedRoute>
                        <MainApp />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback → landing */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>

                {/* Global player (single instance) */}
                <PlayerBar />
              </div>
            </BrowserRouter>
          </PlayerProvider>
        </GlobalAudioProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

