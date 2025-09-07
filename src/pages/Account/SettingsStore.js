/**
 * @typedef {Object} Settings
 * @property {string} displayName - User display name
 * @property {"light" | "dark" | "system"} theme - Theme preference
 * @property {boolean} enableShortcuts - Keyboard shortcuts enabled
 * @property {"Deep Work"|"Creative Flow"|"Light Focus"|"Learning"|"Meditation"|"Energy Boost"} defaultFocus - Default focus mode
 * @property {string} [youtubeApiKey] - YouTube API key
 */

const KEY = "tunein_settings_v1"

/**
 * Load settings from localStorage with fallback to defaults
 * @param {Settings} defaults - Default settings object
 * @returns {Settings}
 */
export function loadSettings(defaults) {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults
  } catch {
    return defaults
  }
}

/**
 * Save settings to localStorage
 * @param {Settings} settings - Settings to save
 */
export function saveSettings(settings) {
  localStorage.setItem(KEY, JSON.stringify(settings))
}

/**
 * Export settings as JSON file download
 */
export function exportSettings() {
  const blob = new Blob([localStorage.getItem(KEY) ?? "{}"], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "tunein-settings.json"
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Import settings from JSON file
 * @param {File} file - JSON file to import
 * @returns {Promise<Settings>}
 */
export function importSettings(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        resolve(JSON.parse(String(reader.result)))
      } catch (e) {
        reject(e)
      }
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}

/**
 * Clear all settings from localStorage
 */
export function clearSettings() {
  localStorage.removeItem(KEY)
}
