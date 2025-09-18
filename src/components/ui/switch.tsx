import * as React from "react"
import { cn } from "@/lib/utils/index"

interface SwitchProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  id?: string
}

const Switch = React.forwardRef<HTMLLabelElement, SwitchProps>(
  ({ className, checked = false, onCheckedChange, disabled, id, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "relative inline-flex cursor-pointer items-center",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        disabled={disabled}
        className="sr-only"
        {...props}
      />
      <div
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors duration-300",
          checked ? "bg-primary" : "bg-gray-300"
        )}
      >
        <div
          className={cn(
            "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-lg transition-transform duration-300",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </div>
    </label>
  )
)
Switch.displayName = "Switch"

export { Switch }
