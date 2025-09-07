import React from "react"
import { Switch } from "@/components/ui/switch"

/**
 * Toggle component wrapper around Switch for consistent API
 * @param {Object} props
 * @param {boolean} props.checked - Toggle state
 * @param {(checked: boolean) => void} props.onChange - Change handler
 * @param {string} [props.label] - Toggle label
 * @param {string} [props.id] - HTML id attribute
 */
export function Toggle({ checked, onChange, label, id, ...props }) {
  return (
    <label htmlFor={id} className="flex items-center gap-3 cursor-pointer select-none">
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        {...props}
      />
      {label && <span className="text-sm text-foreground">{label}</span>}
    </label>
  )
}
