import { useState, useEffect } from 'react'
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

// Existing components
import Nav from './components/Nav'
import { TrackCard } from './components/TrackCard'
import { Player } from './components/Player'
import YouTubePlayer from './components/YouTubePlayer'
import { PageFade } from './components/PageFade'
import { Toast } from './components/Toast'
import { PromptPill, PromptPillKeyboardHandler } from './components/PromptPill'
import { PromptDrawer } from './components/PromptDrawer'
import { usePrompts } from './hooks/usePrompts'
import { usePlayerStore } from './store/playerStore'
import { listParent } from './lib/variants'
import { dur, ease } from './lib/motion'

// New Pomodoro components
import { Header } from './components/ui/Header'
import { PomodoroPanel } from './components/ui/PomodoroTimer'
import Account from './pages/Account'

import './App.css'

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
  const [selectedMood, setSelectedMood] = useState(null)
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [sessionDuration, setSessionDuration] = useState(25)
  const [currentTrack, setCurrentTrack] = useState(null)
  const [activeTab, setActiveTab] = useState('Focus')
  const [showToastLocal, setShowToastLocal] = useState(false)
  const [toastMessageLocal, setToastMessageLocal] = useState('')

  // Initialize YouTube player store
  const playerStore = usePlayerStore()

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

  const handleMoodSelect = async (mood) => {
    setSelectedMood(mood)
    setSessionDuration(mood.default_session_duration)
    setTimeRemaining(mood.default_session_duration * 60)
    
    // Load YouTube playlist for selected mood
    try {
      await playerStore.loadMood(mood.name)
    } catch (error) {
      showNotification('Failed to load music playlist')
    }
  }

  const handleStartSession = async () => {
    if (!selectedMood) return
    
    setIsSessionActive(true)
    setIsPlaying(true)
    if (timeRemaining === 0) {
      setTimeRemaining(sessionDuration * 60)
    }
    
    // Update current track info from YouTube player
    const currentYTTrack = playerStore.current
    setCurrentTrack(currentYTTrack ? {
      title: currentYTTrack.title,
      artist: currentYTTrack.channel,
      duration: 'YouTube'
    } : {
      title: `${selectedMood.name} Focus Music`,
      artist: 'TuneIn Curated',
      duration: '1:23:45'
    })

    // Start YouTube playback
    playerStore.start()
    showNotification(`${selectedMood.name} session started`)
  }

  const handleTogglePlay = () => {
    if (isPlaying) {
      playerStore.pause()
    } else {
      playerStore.resume()
    }
    setIsPlaying(!isPlaying)
    showNotification(isPlaying ? 'Paused' : 'Playing')
  }

  const handleStopSession = () => {
    playerStore.stop()
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

  const TimerDisplay = () => (
    <motion.div 
      className="timer-circle"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, transition: { duration: dur.l, ease: ease.out } }}
    >
      <div 
        className="timer-circle-progress"
        style={{ '--progress-angle': `${getProgressPercentage() * 3.6}deg` }}
      />
      <div className="timer-circle-inner backdrop-blur-md bg-black/20 border border-white/10">
        <div className="text-center">
          <div className="text-4xl font-bold font-mono text-white">
            {formatTime(timeRemaining)}
          </div>
          {selectedMood && (
            <div className="text-sm text-zinc-400 mt-2">
              {selectedMood.name}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )

  if (isSessionActive) {
    return (
      <PageFade>
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Timer Section */}
            <div className="lg:col-span-2 flex flex-col items-center justify-center space-y-8">
              <TimerDisplay />
              
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

              {/* YouTube Player */}
              <YouTubePlayer
                videoId={playerStore.current?.videoId}
                onReady={(player) => playerStore.attach(player)}
                onEnded={playerStore.onEnded}
              />
              
              {/* Player Controls */}
              <Player 
                playing={isPlaying}
                onTogglePlay={handleTogglePlay}
                onPrevious={() => {
                  playerStore.prev()
                  showNotification('Previous track')
                }}
                onNext={() => {
                  playerStore.next()
                  showNotification('Next track')
                }}
              />
              
              <motion.button
                onClick={handleStopSession}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
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
                <div className="rounded-2xl bg-white/6 border border-white/10 backdrop-blur-md p-6">
                  <h3 className="text-lg font-medium mb-4 text-white">Now Playing</h3>
                  <div className="space-y-4">
                    <div className="w-full h-24 bg-white/10 rounded-xl flex items-center justify-center">
                      <div className="text-zinc-400 text-sm">Album Art</div>
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{currentTrack.title}</h4>
                      <p className="text-sm text-zinc-400">{currentTrack.artist}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Volume2 size={16} className="text-zinc-400" />
                      <Progress value={75} className="flex-1" />
                    </div>
                  </div>
                </div>
              )}

              {/* Session Settings */}
              <div className="rounded-2xl bg-white/6 border border-white/10 backdrop-blur-md p-6">
                <h3 className="text-lg font-medium mb-4 text-white">Session Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Session Type</span>
                    <Badge variant="outline" className="border-white/20 text-white">Mood-based</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Duration</span>
                    <span className="text-sm font-medium text-white">{sessionDuration} min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Progress</span>
                    <span className="text-sm font-medium text-white">{Math.round(getProgressPercentage())}%</span>
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
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto grid gap-8">
          
          {/* Pomodoro Timer Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <PomodoroPanel 
                showToast={showNotification}
                onToggleTheme={onToggleTheme}
                onShowHelp={onShowHelp}
              />
            </div>
            <div className="space-y-6">
              {/* Additional controls or info can go here */}
            </div>
          </div>

          {/* Mood Selection */}
          <motion.div 
            className="text-center mb-12"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: { duration: dur.m, ease: ease.out } }}
          >
            <h2 className="text-4xl font-bold mb-4 text-text-onGradient">Select a mood</h2>
            <p className="text-text-onGradient/70 text-lg">
              Choose your focus state to get started with curated music
            </p>
          </motion.div>

          <motion.div 
            variants={listParent}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
          >
            {MOODS.map((mood) => (
              <TrackCard
                key={mood.id}
                title={mood.name}
                desc={mood.description}
                icon={mood.icon}
                isSelected={selectedMood?.id === mood.id}
                onClick={() => handleMoodSelect(mood)}
              />
            ))}
          </motion.div>

          {/* Start Session */}
          <AnimatePresence>
            {selectedMood && (
              <motion.div 
                className="text-center"
                initial={{ y: 20, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -20, opacity: 0, scale: 0.95 }}
                transition={{ duration: dur.m, ease: ease.out }}
              >
                <div className="max-w-md mx-auto rounded-2xl bg-white/6 border border-white/10 backdrop-blur-md p-8">
                  <h3 className="text-xl font-semibold text-white mb-2">Ready to Focus?</h3>
                  <p className="text-zinc-400 mb-6">
                    Start a {sessionDuration}-minute {selectedMood.name.toLowerCase()} session
                  </p>
                  <motion.button
                    onClick={handleStartSession}
                    whileTap={{ scale: 0.95 }}
                    className="w-full py-3 px-6 rounded-full bg-white text-black font-medium flex items-center justify-center gap-2 hover:bg-white/90 transition-colors shadow-[var(--shadow)]"
                  >
                    <Play size={20} />
                    Start Focus Session
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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

  return (
    <div 
      className="min-h-screen text-foreground"
      style={{
        background: 'linear-gradient(135deg, var(--hero-from) 0%, var(--hero-to) 100%)'
      }}
    >
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
    </div>
  )
}

export default App
