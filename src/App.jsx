import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ThemeProvider } from './components/ThemeProvider'
import { PlayerProvider } from './player/PlayerContext'
import { GlobalAudioProvider } from './audio/GlobalAudioProvider'
import YouTubeMount from './player/YouTubeMount'
import PlayerBar from './components/PlayerBar'
import Hero from './features/landing/Hero'
import AuthGate from './features/auth/AuthGate'
import MainApp from './features/app/MainApp'
import ProtectedRoute from './components/ProtectedRoute'
import ResetPassword from './components/ResetPassword'



export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <GlobalAudioProvider>
          <PlayerProvider>
            <BrowserRouter>
              <div className="min-h-screen bg-app text-app-text">
                <YouTubeMount />

                <Routes>
                  {/* 1) Hero/Landing Page */}
                  <Route path="/" element={<Hero />} />

                  {/* 2) Auth Gate */}
                  <Route path="/auth" element={<AuthGate />} />

                  {/* 3) Protected App Routes */}
                  <Route
                    path="/app/*"
                    element={
                      <ProtectedRoute>
                        <MainApp />
                      </ProtectedRoute>
                    }
                  />

                  {/* Reset Password Route */}
                  <Route path="/reset-password" element={<ResetPassword />} />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>

                <PlayerBar />
              </div>
            </BrowserRouter>
          </PlayerProvider>
        </GlobalAudioProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

