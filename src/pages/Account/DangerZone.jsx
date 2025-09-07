import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { clearSettings, exportSettings, importSettings } from "./SettingsStore"

/**
 * Danger zone component for data management and dangerous operations
 */
export default function DangerZone() {
  async function handleImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    
    try {
      const parsed = await importSettings(file)
      localStorage.setItem("tunein_settings_v1", JSON.stringify(parsed))
      alert("Settings imported. Reloading…")
      window.location.reload()
    } catch {
      alert("Import failed. Invalid file.")
    }
    
    // Reset file input
    e.target.value = ""
  }

  function handleExport() {
    exportSettings()
  }

  function handleClearSettings() {
    if (confirm("Clear all local settings? This will reset everything to defaults.")) {
      clearSettings()
      window.location.reload()
    }
  }

  function handleDeleteAccount() {
    if (confirm("Permanently delete account? This will sign you out and remove your data on the server (once wired).")) {
      alert("TODO: call DELETE /api/account")
    }
  }

  return (
    <Card className="border-destructive/20">
      <CardHeader>
        <CardTitle className="text-destructive">Data & Danger Zone</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div>
          <h4 className="font-medium text-sm mb-3">Data Management</h4>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={handleExport}>
              Export Settings
            </Button>
            <div className="relative">
              <Button variant="secondary" onClick={() => document.getElementById('import-file')?.click()}>
                Import Settings
              </Button>
              <input
                id="import-file"
                type="file"
                accept="application/json"
                onChange={handleImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-sm mb-3 text-destructive">Danger Zone</h4>
          <div className="flex flex-wrap gap-3">
            <Button variant="destructive" onClick={handleClearSettings}>
              Clear Local Settings
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            These actions cannot be undone. Please proceed with caution.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
