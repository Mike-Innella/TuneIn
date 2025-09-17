import { useState, useEffect, useMemo, useCallback } from 'react'
import { Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import {
  Play,
  Pause,
  SkipForward,
  Volume2,
  Settings,
  Brain,
  Lightbulb,
  CheckCircle,
  BookOpen,
  Heart,
  Zap,
  User
} from 'lucide-react'

// Auth components
import AuthGate from './components/AuthGate'
import AccountPanel from './components/AccountPanel'
import ResetPassword from './components/ResetPassword'

// Audio System
import { PlayerProvider } from './player/PlayerContext'
import { GlobalAudioProvider } from './audio/GlobalAudioProvider'
import PlayerBar from './components/PlayerBar'
import MoodPicker from './components/MoodPicker'
import MobileCommandBar from './components/MobileCommandBar'
import * as yt from './player/ytController'

// Existing components
import Nav from './components/Nav'
import { TrackCard } from './components/TrackCard'
// import YouTubePlayer from './components/YouTubePlayer' - using new PlayerProvider system
import { PageFade } from './components/PageFade'
import { Toast } from './components/Toast'
import { PromptPill, PromptPillKeyboardHandler } from './components/PromptPill'
import { PromptDrawer } from './components/PromptDrawer'
import { usePrompts } from './hooks/usePrompts'
// import { usePlayerStore } from './store/playerStore'
import { listParent } from './lib/variants'
import { dur, ease } from './lib/motion'

// New Pomodoro components
import { Header } from './components/ui/Header'
import { Footer } from './components/ui/Footer'
import { PomodoroPanel } from './components/ui/PomodoroTimer'
import Account from './pages/Account'
import { ErrorBoundary } from './components/ErrorBoundary'

// Mobile components
import { MobileNav } from './components/MobileNav'
import { PlayerSheet } from './components/PlayerSheet'
import { MoodSheet } from './components/MoodSheet'
import { MoreSheet } from './components/MoreSheet'
import { useIsMobile } from './hooks/use-mobile'
import { useUIState } from './state/ui'
import { ThemeProvider } from './components/ThemeProvider'


// Mock data for moods
const MOODS = [
  {
    id: 1,
    name: 'Deep Work',
    slug: 'deep-work',
    description: 'Intense concentration for complex cognitive tasks',
    icon: Brain,
    default_session_duration: 50,
    promptMood: 'DeepWork'
  },
  {
    id: 2,
    name: 'Creative Flow',
    slug: 'creative-flow',
    description: 'Inspiration and ideation for creative work',
    icon: Lightbulb,
    default_session_duration: 45,
    promptMood: 'CreativeFlow'
  },
  {
    id: 3,
    name: 'Light Focus',
    slug: 'light-focus',
    description: 'Moderate concentration for routine tasks',
    icon: CheckCircle,
    default_session_duration: 25,
    promptMood: 'LightFocus'
  },
  {
    id: 4,
    name: 'Learning',
    slug: 'learning',
    description: 'Enhanced retention and comprehension',
    icon: BookOpen,
    default_session_duration: 30,
    promptMood: 'Learning'
  },
  {
    id: 5,
    name: 'Meditation',
    slug: 'meditation',
    description: 'Mindfulness and stress reduction',
    icon: Heart,
    default_session_duration: 20,
    promptMood: 'Meditation'
  },
  {
    id: 6,
    name: 'Energy Boost',
    slug: 'energy-boost',
    description: 'Motivation and drive for challenging tasks',
    icon: Zap,
    default_session_duration: 35,
    promptMood: 'EnergyBoost'
  }
]

function HomePage({ showToast, onToggleTheme, onShowHelp }) {
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [sessionDuration, setSessionDuration] = useState(25)
  const [currentTrack, setCurrentTrack] = useState(null)
  const [activeTab, setActiveTab] = useState('Focus')
  const [showToastLocal, setShowToastLocal] = useState(false)
  const [toastMessageLocal, setToastMessageLocal] = useState('')
  const [selectedMood, setSelectedMood] = useState(null) // Keep for session management
  const isMobile = useIsMobile()

  // Initialize YouTube player store
  // const playerStore = usePlayerStore()

  // Initialize prompts system
  const prompts = usePrompts({
    mood: selectedMood?.promptMood || 'DeepWork',
    sessionDuration,
    isSessionActive,
    isPlaying,
    timeRemaining
  })

  // Timer effect
  useEffect(() => {
    let interval = null
    if (isSessionActive && isPlaying && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => {
          if (time <= 1) {
            setIsSessionActive(false)
            setIsPlaying(false)
            showNotification('Focus session completed!')
            return 0
          }
          return time - 1
        })
      }, 1000)
    } else if (!isPlaying) {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isSessionActive, isPlaying, timeRemaining])

  const showNotification = (message) => {
    if (showToast) {
      showToast(message)
    } else {
      setToastMessageLocal(message)
      setShowToastLocal(true)
      setTimeout(() => setShowToastLocal(false), 3000)
    }
  }

  const handleMoodSelect = useCallback(async (mood) => {
    setSelectedMood(mood)
    setSessionDuration(mood.default_session_duration)
    setTimeRemaining(mood.default_session_duration * 60)

    // Load YouTube playlist for selected mood - handled by new MoodPicker system
    // try {
    //   await playerStore.loadMood(mood.name)
    // } catch (error) {
    //   showNotification('Failed to load music playlist')
    // }
  }, [showNotification])

  const handleStartSession = useCallback(async () => {
    if (!selectedMood) return
    
    setIsSessionActive(true)
    setIsPlaying(true)
    if (timeRemaining === 0) {
      setTimeRemaining(sessionDuration * 60)
    }
    
    // Update current track info from YouTube player - handled by new system
    // const currentYTTrack = playerStore.current
    setCurrentTrack({
      title: `${selectedMood.name} Focus Music`,
      artist: 'TuneIn Curated',
      duration: 'YouTube'
    })

    // Start YouTube playback - handled by PlayerBar
    // playerStore.start()
    showNotification(`${selectedMood.name} session started`)
  }, [selectedMood, timeRemaining, sessionDuration, showNotification])

  // Listen for mood selection events from MoodPicker
  useEffect(() => {
    const handleMoodSelected = (event) => {
      const { mood, duration } = event.detail

      // Find the corresponding mood object from MOODS array
      const moodObj = MOODS.find(m => m.name === mood)
      if (moodObj) {
        handleMoodSelect(moodObj)
      }
    }

    const handleSessionStart = () => {
      // Only start session if we have a selected mood and aren't already in a session
      if (selectedMood && !isSessionActive) {
        handleStartSession()
      }
    }

    const handleSessionStop = () => {
      // Stop any active session and reset states
      // playerStore.stop() - handled by PlayerBar
      setIsSessionActive(false)
      setIsPlaying(false)
      setCurrentTrack(null)
      setSelectedMood(null)
      setTimeRemaining(0)
      showNotification('Session ended')
    }

    window.addEventListener('mood:selected', handleMoodSelected)
    window.addEventListener('session:start', handleSessionStart)
    window.addEventListener('session:stop', handleSessionStop)
    return () => {
      window.removeEventListener('mood:selected', handleMoodSelected)
      window.removeEventListener('session:start', handleSessionStart)
      window.removeEventListener('session:stop', handleSessionStop)
    }
  }, [handleMoodSelect, selectedMood, isSessionActive, handleStartSession, showNotification])

  const handleHomeClick = () => {
    if (isSessionActive) {
      setIsSessionActive(false)
      setIsPlaying(false)
      setCurrentTrack(null)
      showNotification('Session ended - returned to home')
    }
    setSelectedMood(null)
    setTimeRemaining(0)
    setActiveTab('Focus')
  }

  const handleTogglePlay = () => {
    // Handled by PlayerBar now
    // if (isPlaying) {
    //   playerStore.pause()
    // } else {
    //   playerStore.resume()
    // }
    setIsPlaying(!isPlaying)
    showNotification(isPlaying ? 'Paused' : 'Playing')
  }

  const handleStopSession = () => {
    // playerStore.stop() - handled by PlayerBar
    setIsSessionActive(false)
    setIsPlaying(false)
    setTimeRemaining(sessionDuration * 60)
    setCurrentTrack(null)
    showNotification('Session ended')
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getProgressPercentage = () => {
    const totalSeconds = sessionDuration * 60
    return ((totalSeconds - timeRemaining) / totalSeconds) * 100
  }

  const TimerDisplay = useMemo(() => (
    <div className="timer-circle">
      <div 
        className="timer-circle-progress"
        style={{ '--progress-angle': `${getProgressPercentage() * 3.6}deg` }}
      />
      <div className="timer-circle-inner bg-app-surface2/80 border border-app-border">
        <div className="text-center">
          <div className="text-4xl font-bold font-mono text-app-text">
            {formatTime(timeRemaining)}
          </div>
          {selectedMood && (
            <div className="text-sm text-app-muted mt-2">
              {selectedMood.name}
            </div>
          )}
        </div>
      </div>
    </div>
  ), [timeRemaining, selectedMood, sessionDuration])

  if (isSessionActive) {
    return (
      <PageFade>
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Timer Section */}
            <div className="lg:col-span-2 flex flex-col items-center justify-center space-y-8">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                {TimerDisplay}
              </motion.div>
              
              {/* Prompt Components */}
              {!prompts.isExpanded && (
                <PromptPill
                  prompt={prompts.currentPrompt}
                  isVisible={prompts.isVisible}
                  onExpand={prompts.expand}
                  onHide={prompts.hide}
                  className="mb-6"
                />
              )}

              {prompts.isExpanded && (
                <PromptDrawer
                  prompt={prompts.currentPrompt}
                  isVisible={prompts.isVisible}
                  isExpanded={prompts.isExpanded}
                  settings={prompts.settings}
                  onCollapse={prompts.collapse}
                  onHide={prompts.hide}
                  onNext={prompts.next}
                  onSnooze={prompts.snooze}
                  onCopy={prompts.copy}
                  onSpeak={prompts.speakPrompt}
                  className="mb-6"
                />
              )}

              
              <motion.button
                onClick={handleStopSession}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 rounded-lg btn-secondary"
              >
                End Session
              </motion.button>
            </div>

            {/* Sidebar */}
            <motion.div 
              className="space-y-6"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1, transition: { duration: dur.m, delay: 0.2 } }}
            >
              {/* Current Track */}
              {currentTrack && (
                <div className="rounded-2xl surface border border-app-border p-6">
                  <h3 className="text-lg font-medium mb-4 text-app-text">Now Playing</h3>
                  <div className="space-y-4">
                    <div className="w-full h-24 bg-app-surface2/50 rounded-xl flex items-center justify-center">
                      <div className="text-app-muted text-sm">Album Art</div>
                    </div>
                    <div>
                      <h4 className="font-medium text-app-text">{currentTrack.title}</h4>
                      <p className="text-sm text-app-muted">{currentTrack.artist}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Volume2 size={16} className="text-app-muted" />
                      <Progress
                        value={70}
                        className="flex-1 cursor-pointer"
                        onClick={(e) => {
                          // Volume control handled by PlayerBar
                          console.log('Volume control moved to PlayerBar')
                        }}
                      />
                      <span className="text-xs text-app-muted min-w-[3ch]">70</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Session Settings */}
              <div className="rounded-2xl surface border border-app-border p-6">
                <h3 className="text-lg font-medium mb-4 text-app-text">Session Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-app-muted">Session Type</span>
                    <Badge variant="outline" className="border-app-border text-app-text">Mood-based</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-app-muted">Duration</span>
                    <span className="text-sm font-medium text-app-text">{sessionDuration} min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-app-muted">Progress</span>
                    <span className="text-sm font-medium text-app-text">{Math.round(getProgressPercentage())}%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </main>
        
        {/* Keyboard navigation for prompts */}
        <PromptPillKeyboardHandler
          isVisible={prompts.isVisible}
          onExpand={prompts.expand}
          onHide={prompts.hide}
          onNext={prompts.next}
        />
        
        <Toast show={showToastLocal} text={toastMessageLocal} />
      </PageFade>
    )
  }

  return (
    <PageFade>
      <main className={`container mx-auto px-4 py-8 ${isMobile ? 'pb-24' : ''}`}>
        <div className="max-w-6xl mx-auto grid gap-8">
          
          {/* Pomodoro Timer Section */}
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'} gap-8`}>
            <div className={isMobile ? 'col-span-1' : 'lg:col-span-2'}>
              <PomodoroPanel 
                showToast={showNotification}
                onToggleTheme={onToggleTheme}
                onShowHelp={onShowHelp}
              />
            </div>
            {!isMobile && (
              <div className="space-y-6">
                {/* Additional controls or info can go here */}
              </div>
            )}
          </div>

          {/* YouTube Music System */}
          <motion.div
            className="text-center mb-12"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: { duration: dur.m, ease: ease.out } }}
          >
            <h2 className="text-4xl font-bold mb-4 text-app-text drop-shadow-sm">Select a mood</h2>
            <p className="text-app-muted text-lg">
              Choose your focus state to get started with curated music
            </p>
          </motion.div>

          <MoodPicker />

        </div>
      </main>
      
      <Toast show={showToastLocal} text={toastMessageLocal} />
    </PageFade>
  )
}

function App() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showHotkeys, setShowHotkeys] = useState(false);
  const isMobile = useIsMobile();
  const [uiState, updateUIState] = useUIState();

  useEffect(() => {
    yt.mount('yt-root-iframe'); // don't await; controller will set ready
  }, []);

  const handleShowToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleToggleTheme = () => {
    // Get current theme toggle button and simulate click
    const themeButton = document.querySelector('[aria-label*="Switch to"]');
    if (themeButton) {
      themeButton.click();
      handleShowToast('Theme toggled');
    }
  };

  const handleShowHelp = () => {
    setShowHotkeys(true);
  };

  const handleMobileNavigate = (section) => {
    // Handle mobile navigation
    switch (section) {
      case 'home':
        // Navigate to home - could scroll to top or change route
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'timer':
        // Scroll to timer section
        const timerSection = document.querySelector('section');
        if (timerSection) {
          timerSection.scrollIntoView({ behavior: 'smooth' });
        }
        break;
      default:
        break;
    }
  };

  const handleMoodSelect = (moodName) => {
    // Find the mood object by name
    const mood = MOODS.find(m => m.name === moodName);
    if (mood) {
      // Trigger existing mood selection logic
      const moodSelectEvent = new CustomEvent('mood:selected', {
        detail: { mood: mood.name, duration: mood.default_session_duration }
      });
      window.dispatchEvent(moodSelectEvent);
      handleShowToast(`${mood.name} mood selected`);
    }
  };

  const handleDurationSet = (minutes) => {
    // Dispatch timer duration event
    window.dispatchEvent(new CustomEvent('timer:duration-set', {
      detail: { duration: minutes }
    }));
    handleShowToast(`Timer set to ${minutes} minutes`);
  };

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <GlobalAudioProvider>
          <PlayerProvider>
            <div className="min-h-screen bg-app text-app-text">
            {/* Keep the YT mount node parked offscreen, never duplicate this ID */}
            <div id="yt-root-iframe" style={{position:'absolute', left:-99999, top:-99999, width:1, height:1}} />

            <Routes>
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/*"
                element={
                  <AuthGate>
                    <Header showHotkeys={showHotkeys} onCloseHotkeys={() => setShowHotkeys(false)} />
                    <Routes>
                      <Route
                        path="/"
                        element={
                          <HomePage
                            showToast={handleShowToast}
                            onToggleTheme={handleToggleTheme}
                            onShowHelp={handleShowHelp}
                          />
                        }
                      />
                      <Route path="/account" element={<Account />} />
                    </Routes>
                    <Toast show={showToast} text={toastMessage} />

                    {/* YouTube Player Bar - Keep for existing functionality */}
                    <PlayerBar />

                    {/* Mobile Command Bar */}
                    {isMobile && (
                      <MobileCommandBar
                        onSetMood={handleMoodSelect}
                        onSetDuration={handleDurationSet}
                        onOpenProfile={() => {
                          // Use React Router navigation instead of window.location
                          const event = new CustomEvent('navigate:account');
                          window.dispatchEvent(event);
                          handleShowToast('Opening profile...');
                        }}
                      />
                    )}

                    {/* Footer */}
                    <Footer />
                  </AuthGate>
                }
              />
            </Routes>
            </div>
          </PlayerProvider>
        </GlobalAudioProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
