import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { log } from '../lib/logger'
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

// Audio System
import { PlayerProvider } from '../player/PlayerContext'
import { GlobalAudioProvider, useGlobalAudio } from '../audio/GlobalAudioProvider'
import PlayerBar from './PlayerBar'
import * as yt from '../player/ytController'
import MoodPicker from './MoodPicker'
import YouTubeMount from '../player/YouTubeMount'

// Existing components
import Nav from './Nav'
import { TrackCard } from './TrackCard'
import { PageFade } from './PageFade'
import { Toast } from './Toast'
import { PromptPill, PromptPillKeyboardHandler } from './PromptPill'
import { PromptDrawer } from './PromptDrawer'
import { usePrompts } from '../hooks/usePrompts'
import { listParent } from '../lib/variants'
import { dur, ease } from '../lib/motion'

// New Pomodoro components
import { PomodoroPanel } from './ui/PomodoroTimer'

// Mobile components
import { MoodSheet } from './MoodSheet'
import { MoreSheet } from './MoreSheet'
import { useIsMobile } from '../hooks/use-mobile'
import { useUIState } from '../state/ui'

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

export default function HomePage({ showToast, onToggleTheme, onShowHelp }) {
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [sessionDuration, setSessionDuration] = useState(25)
  const [currentTrack, setCurrentTrack] = useState(null)
  const [activeTab, setActiveTab] = useState('Focus')
  const [showToastLocal, setShowToastLocal] = useState(false)
  const [toastMessageLocal, setToastMessageLocal] = useState('')
  const [selectedMood, setSelectedMood] = useState(null)
  const isMobile = useIsMobile()

  const prompts = usePrompts({
    mood: selectedMood?.promptMood || 'DeepWork',
    sessionDuration,
    isSessionActive,
    isPlaying,
    timeRemaining
  })

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
  }, [showNotification])

  const handleStartSession = useCallback(async () => {
    if (!selectedMood) return

    setIsSessionActive(true)
    setIsPlaying(true)
    if (timeRemaining === 0) {
      setTimeRemaining(sessionDuration * 60)
    }

    setCurrentTrack({
      title: `${selectedMood.name} Focus Music`,
      artist: 'TuneIn Curated',
      duration: 'YouTube'
    })

    showNotification(`${selectedMood.name} session started`)
  }, [selectedMood, timeRemaining, sessionDuration, showNotification])

  useEffect(() => {
    const handleMoodSelected = (event) => {
      const { mood, duration } = event.detail
      const moodObj = MOODS.find(m => m.name === mood)
      if (moodObj) {
        handleMoodSelect(moodObj)
      }
    }

    const handleSessionStart = () => {
      if (selectedMood && !isSessionActive) {
        handleStartSession()
      }
    }

    const handleSessionStop = () => {
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
    setIsPlaying(!isPlaying)
    showNotification(isPlaying ? 'Paused' : 'Playing')
  }

  const handleStopSession = () => {
    try {
      yt.stop();
      const audioEl = document.querySelector('audio');
      if (audioEl) {
        audioEl.pause();
        audioEl.currentTime = 0;
      }
      window.dispatchEvent(new CustomEvent('audio:set_source', {
        detail: 'none'
      }));
      window.dispatchEvent(new CustomEvent('audio:control', {
        detail: { action: 'stop' }
      }));
      window.dispatchEvent(new Event('player:close'));
    } catch (error) {
      console.warn('Error stopping audio during session end:', error);
    }

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
            <div className="lg:col-span-2 flex flex-col items-center justify-center space-y-8">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                {TimerDisplay}
              </motion.div>

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

            <motion.div
              className="space-y-6"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1, transition: { duration: dur.m, delay: 0.2 } }}
            >
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
              </div>
            )}
          </div>

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