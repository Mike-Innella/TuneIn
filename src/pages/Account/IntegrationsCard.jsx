import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

/**
 * Integrations card component for managing external API connections
 * @param {Object} props
 * @param {import('./SettingsStore').Settings} props.settings - Current settings
 * @param {(settings: Partial<import('./SettingsStore').Settings>) => void} props.onChange - Settings change handler
 */
export default function IntegrationsCard({ settings, onChange }) {
  const [apiKey, setApiKey] = useState(settings.youtubeApiKey || "")

  function testConnection() {
    // Mock success if key length > 10
    const success = apiKey && apiKey.length > 10
    alert(success ? "YouTube API connected ✅" : "Missing or invalid key.")
  }

  function maskApiKey(key) {
    if (!key || key.length < 8) return key
    return key.substring(0, 6) + "•".repeat(key.length - 8) + key.substring(key.length - 2)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrations</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-muted-foreground">
            YouTube API Key
          </label>
          <Input
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIza..."
            type="password"
          />
          {settings.youtubeApiKey && (
            <p className="text-xs text-muted-foreground">
              Current: {maskApiKey(settings.youtubeApiKey)}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={testConnection}>
            Test Connection
          </Button>
          <Button onClick={() => onChange({ youtubeApiKey: apiKey })}>
            Save
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Used to fetch and curate music via YouTube Data API. Stored locally until backend is wired.
        </p>
      </CardContent>
    </Card>
  )
}
