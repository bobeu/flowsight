/**
 * Badge Component using Radix UI
 * 
 * Accessible badge component for labels and tags
 */

'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-electric-cyan focus:ring-offset-2",
        {
          "bg-electric-cyan/20 text-electric-cyan": variant === "default",
          "bg-light-gray/20 text-light-gray": variant === "secondary",
          "border border-electric-cyan/50 text-electric-cyan": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }

