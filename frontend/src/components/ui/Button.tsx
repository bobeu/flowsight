/**
 * Button Component using Radix UI Slot
 * 
 * Accessible button component with proper styling
 */

'use client'

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "outline" | "ghost"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", asChild = false, type = "button", ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        type={type}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-cyan disabled:pointer-events-none disabled:opacity-50 px-6 py-3",
          {
            "bg-electric-cyan text-midnight-blue hover:bg-electric-cyan/80": variant === "default",
            "border border-electric-cyan/50 bg-transparent text-electric-cyan hover:bg-electric-cyan/10": variant === "outline",
            "text-light-gray hover:bg-midnight-blue/50": variant === "ghost",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }

