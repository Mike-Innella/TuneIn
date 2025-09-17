import { useState } from 'react'
import { GlobalAudioProvider } from './audio/GlobalAudioProvider'
import { PlayerProvider } from './player/PlayerContext'
import PlayerBar from './components/PlayerBar'
import MoodPicker from './components/MoodPicker'
import { ThemeProvider } from './components/ThemeProvider'

function TestApp() {
  return (
    <ThemeProvider>
      <GlobalAudioProvider>
        <PlayerProvider>
          <div className="min-h-screen bg-app text-app-text">
            <div className="container mx-auto px-4 py-8">
              <h1 className="text-4xl font-bold mb-8 text-center">TuneIn Audio Test</h1>
              <p className="text-center text-app-muted mb-8">
                Testing audio playback functionality - no authentication required
              </p>
              
              {/* Mood Selection */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Select a Mood</h2>
                <MoodPicker />
              </div>
            </div>
            
            {/* Audio Player Bar */}
            <PlayerBar />
          </div>
        </PlayerProvider>
      </GlobalAudioProvider>
    </ThemeProvider>
  )
}

export default TestApp
