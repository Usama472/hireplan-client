import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useFormContext } from 'react-hook-form'

interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps {
  name: string
  label: string
  placeholder?: string
  options: SelectOption[]
  disabled?: boolean
  showIsRequired?: boolean
  onChange?: (value: string) => void
  className?: string
}

export function SelectField({
  name,
  label,
  placeholder,
  options,
  disabled = false,
  showIsRequired = false,
  onChange,
  className
}: SelectFieldProps) {
  const { setValue, watch, formState: { errors } } = useFormContext()
  const value = watch(name)
  const error = errors[name]

  const handleValueChange = (newValue: string) => {
    setValue(name, newValue)
    onChange?.(newValue)
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={name} className='text-sm font-medium'>
        {label}
        {showIsRequired && <span className='text-red-500 ml-1'>*</span>}
      </Label>
      <Select
        value={value || ''}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger className={cn(
          'w-full',
          error && 'border-red-500 focus-visible:ring-red-500'
        )}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className='text-sm text-red-500'>
          {error.message as string}
        </p>
      )}
    </div>
  )
} 