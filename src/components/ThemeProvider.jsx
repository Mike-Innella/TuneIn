import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {}
})

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    // Check localStorage first
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme')
      if (saved && (saved === 'light' || saved === 'dark')) {
        return saved
      }
      // Check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark'
      }
    }
    return 'light'
  })

  const setTheme = (newTheme) => {
    console.log('ThemeProvider: Setting theme to', newTheme)
    setThemeState(newTheme)
    localStorage.setItem('theme', newTheme)
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
      console.log('ThemeProvider: Added dark class, current classes:', document.documentElement.className)
    } else {
      document.documentElement.classList.remove('dark')
      console.log('ThemeProvider: Removed dark class, current classes:', document.documentElement.className)
    }
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  // Apply theme on mount and changes
  useEffect(() => {
    console.log('ThemeProvider: useEffect triggered with theme:', theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      console.log('ThemeProvider: useEffect added dark class, current classes:', document.documentElement.className)
    } else {
      document.documentElement.classList.remove('dark')
      console.log('ThemeProvider: useEffect removed dark class, current classes:', document.documentElement.className)
    }
  }, [theme])

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      // Only auto-switch if no manual preference is saved
      if (!localStorage.getItem('theme')) {
        setTheme(mediaQuery.matches ? 'dark' : 'light')
      }
    }
    
    mediaQuery.addListener?.(handleChange) // Legacy
    mediaQuery.addEventListener?.('change', handleChange) // Modern
    
    return () => {
      mediaQuery.removeListener?.(handleChange) // Legacy
      mediaQuery.removeEventListener?.('change', handleChange) // Modern
    }
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}