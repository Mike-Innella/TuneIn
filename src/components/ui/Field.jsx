import React from "react"
import { cn } from "@/lib/utils"

/**
 * Field wrapper component for consistent form field styling
 * @param {Object} props
 * @param {string} [props.label] - Field label
 * @param {string} [props.description] - Field description/help text
 * @param {string} [props.error] - Error message
 * @param {React.ReactNode} props.children - Input component
 * @param {string} [props.className] - Additional CSS classes
 */
export function Field({ label, description, error, children, className, ...props }) {
  return (
    <div className={cn("grid gap-2", className)} {...props}>
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      {children}
      {description && (
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
      {error && (
        <p className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
