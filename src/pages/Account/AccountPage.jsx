import React from "react"
import ProfileForm from "./ProfileForm"
import PreferencesForm from "./PreferencesForm"
import IntegrationsCard from "./IntegrationsCard"
import DangerZone from "./DangerZone"
import { loadSettings, saveSettings } from "./SettingsStore"

/** @type {import('./SettingsStore').Settings} */
const DEFAULTS = {
  displayName: "",
  theme: "system",
  enableShortcuts: true,
  defaultFocus: "Deep Work",
  youtubeApiKey: ""
}

/**
 * Main Account page component
 */
export default function AccountPage() {
  const settings = loadSettings(DEFAULTS)

  /**
   * Update settings and apply theme changes immediately
   * @param {Partial<import('./SettingsStore').Settings>} partial - Partial settings to update
   */
  function updateSettings(partial) {
    const merged = { ...settings, ...partial }
    saveSettings(merged)
    
    // Apply theme changes immediately
    if (partial.theme) {
      const root = document.documentElement
      const isDark = partial.theme === "dark" || 
        (partial.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
      root.classList.toggle("dark", isDark)
    }
    
    alert("Settings saved ✅")
    window.location.reload() // Refresh to reflect all changes consistently
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
          Account Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your profile, preferences, and integrations
        </p>
      </div>
      
      <div className="grid gap-8">
        <ProfileForm settings={settings} onChange={updateSettings} />
        <PreferencesForm settings={settings} onChange={updateSettings} />
        <IntegrationsCard settings={settings} onChange={updateSettings} />
        <DangerZone />
      </div>
    </div>
  )
}
