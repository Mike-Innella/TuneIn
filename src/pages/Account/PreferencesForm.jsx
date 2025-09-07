import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Toggle } from "@/components/ui/Toggle"
import { Button } from "@/components/ui/button"

/**
 * Preferences form component for user settings
 * @param {Object} props
 * @param {import('./SettingsStore').Settings} props.settings - Current settings
 * @param {(settings: Partial<import('./SettingsStore').Settings>) => void} props.onChange - Settings change handler
 */
export default function PreferencesForm({ settings, onChange }) {
  const [theme, setTheme] = useState(settings.theme)
  const [shortcuts, setShortcuts] = useState(settings.enableShortcuts)
  const [focus, setFocus] = useState(settings.defaultFocus)

  const focusModes = ["Deep Work", "Creative Flow", "Light Focus", "Learning", "Meditation", "Energy Boost"]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-muted-foreground">
              Theme
            </label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-muted-foreground">
              Default Focus Mode
            </label>
            <Select value={focus} onValueChange={setFocus}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {focusModes.map(mode => (
                  <SelectItem key={mode} value={mode}>
                    {mode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4">
          <Toggle 
            checked={shortcuts} 
            onChange={setShortcuts} 
            label="Enable keyboard shortcuts" 
            id="shortcuts-toggle" 
          />
          <p className="text-sm text-muted-foreground">
            Tip: press <kbd className="rounded bg-muted px-2 py-1 text-xs">"/help"</kbd> to view shortcuts, <kbd className="rounded bg-muted px-2 py-1 text-xs">"?"</kbd> for help.
          </p>
        </div>

        <div className="md:col-span-2">
          <Button onClick={() => onChange({ theme, enableShortcuts: shortcuts, defaultFocus: focus })}>
            Save Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
