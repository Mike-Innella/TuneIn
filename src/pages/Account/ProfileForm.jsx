import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useUser } from "@/hooks/useUser"

/**
 * Profile form component for editing user profile
 * @param {Object} props
 * @param {import('./SettingsStore').Settings} props.settings - Current settings
 * @param {(settings: Partial<import('./SettingsStore').Settings>) => void} props.onChange - Settings change handler
 */
export default function ProfileForm({ settings, onChange }) {
  const { user } = useUser()
  const [name, setName] = useState(settings.displayName || user.name)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-[120px_1fr] items-start">
        <img 
          src={user.avatarUrl} 
          alt={`${user.name} avatar`} 
          className="h-28 w-28 rounded-full object-cover border border-border" 
        />
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-muted-foreground">
              Display Name
            </label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Your name" 
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-muted-foreground">
              Email
            </label>
            <Input value={user.email} readOnly className="bg-muted" />
          </div>
          <div className="flex gap-3">
            <Button onClick={() => onChange({ displayName: name })}>
              Save
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
