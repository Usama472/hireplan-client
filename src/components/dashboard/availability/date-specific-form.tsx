import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import {
  defaultDateSpecificData,
  type DateSpecificFormData,
} from '@/constants/date-specific-constants'
import { useToast } from '@/lib/hooks/use-toast'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import {
  AlertCircle,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Save,
  Trash2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

// Validation schema for time slots
const timeSlotSchema = z
  .object({
    id: z.string(),
    startTime: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    endTime: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  })
  .refine(
    (data) => {
      const start = new Date(`2000-01-01T${data.startTime}:00`)
      const end = new Date(`2000-01-01T${data.endTime}:00`)
      return start < end
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    }
  )

// Validation schema for date-specific settings
const dateSpecificSchema = z.object({
  date: z.date(),
  isAvailable: z.boolean(),
  timeSlots: z.array(timeSlotSchema),
})

// Validation schema for the entire form
const dateSpecificFormSchema = z.object({
  dates: z.array(dateSpecificSchema),
})

// Default values for date-specific settings
const getDefaultDateSettings = (date: Date) => ({
  date,
  isAvailable: true,
  timeSlots: [],
})

interface DateSpecificFormProps {
  initialData?: DateSpecificFormData
  onSave?: (data: DateSpecificFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export function DateSpecificForm({
  initialData = defaultDateSpecificData,
  onSave,
  onCancel,
  isLoading = false,
}: DateSpecificFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isDirty },
  } = useForm<DateSpecificFormData>({
    resolver: zodResolver(dateSpecificFormSchema),
    defaultValues: initialData,
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'dates',
  })

  const watchedDates = watch('dates')

  useEffect(() => {
    setHasChanges(isDirty)
  }, [isDirty])

  const getOverlappingSlots = (dateIndex: number) => {
    const date = watchedDates[dateIndex]
    if (!date || !date.isAvailable) return {}

    const overlaps: { [key: string]: string[] } = {}

    date.timeSlots.forEach((slot, index) => {
      const slotStart = convertTimeToMinutes(slot.startTime)
      const slotEnd = convertTimeToMinutes(slot.endTime)

      date.timeSlots.forEach((otherSlot, otherIndex) => {
        if (index !== otherIndex) {
          const otherStart = convertTimeToMinutes(otherSlot.startTime)
          const otherEnd = convertTimeToMinutes(otherSlot.endTime)

          if (slotStart <= otherEnd && slotEnd >= otherStart) {
            if (!overlaps[slot.id]) {
              overlaps[slot.id] = []
            }
            overlaps[slot.id].push(otherSlot.id)
          }
        }
      })
    })

    return overlaps
  }

  const convertTimeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  const handleAddDate = () => {
    if (!selectedDate) return

    // Check if date already exists
    const dateExists = watchedDates.some(
      (d) => format(d.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
    )

    if (dateExists) {
      toast({
        title: 'Date already added',
        description:
          'This date is already added. Please select a different date.',
        type: 'error',
      })
      return
    }

    const newDateSettings = getDefaultDateSettings(selectedDate)
    append(newDateSettings)
    setSelectedDate(undefined)
  }

  const handleRemoveDate = (dateIndex: number) => {
    remove(dateIndex)
  }

  const handleAddTimeSlot = (dateIndex: number) => {
    const date = watchedDates[dateIndex]
    if (!date) return

    const lastSlot = date.timeSlots[date.timeSlots.length - 1]
    let startTime = '09:00'
    let endTime = '10:00'

    if (lastSlot) {
      const lastEndHour = parseInt(lastSlot.endTime.split(':')[0])
      const lastEndMinute = parseInt(lastSlot.endTime.split(':')[1])

      let newStartHour = lastEndHour
      let newStartMinute = lastEndMinute + 30

      if (newStartMinute >= 60) {
        newStartHour += 1
        newStartMinute = newStartMinute - 60
      }

      const newStartHourStr = newStartHour.toString().padStart(2, '0')
      const newStartMinuteStr = newStartMinute.toString().padStart(2, '0')

      let newEndHour = newStartHour + 1
      if (newEndHour > 23) newEndHour = 23
      const newEndHourStr = newEndHour.toString().padStart(2, '0')

      startTime = `${newStartHourStr}:${newStartMinuteStr}`
      endTime = `${newEndHourStr}:${newStartMinuteStr}`
    }

    const newSlot = {
      id: uuidv4(),
      startTime,
      endTime,
    }

    const currentSlots = watchedDates[dateIndex].timeSlots
    const updatedSlots = [...currentSlots, newSlot]
    setValue(`dates.${dateIndex}.timeSlots`, updatedSlots)
  }

  const handleDeleteTimeSlot = (dateIndex: number, slotIndex: number) => {
    const date = watchedDates[dateIndex]
    if (!date) return

    const updatedSlots = date.timeSlots.filter(
      (_, index) => index !== slotIndex
    )
    setValue(`dates.${dateIndex}.timeSlots`, updatedSlots)
  }

  const onSubmit = async (data: DateSpecificFormData) => {
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      if (onSave) {
        await onSave(data)
      }
      setHasChanges(false)
    } catch (error) {
      console.error('Error saving date-specific settings:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (date: Date) => {
    return format(date, 'EEEE, MMMM d, yyyy')
  }

  const { toast } = useToast()

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div></div>
        <div className='flex gap-2'></div>
      </div>

      <Card className='border border-gray-200'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm'>Add New Date</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center gap-3'>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  className={cn(
                    'w-[240px] justify-start text-left font-normal h-8',
                    !selectedDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className='mr-2 h-3 w-3' />
                  {selectedDate ? formatDate(selectedDate) : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0'>
                <Calendar
                  mode='single'
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
            <Button
              type='button'
              onClick={handleAddDate}
              disabled={!selectedDate}
              size='sm'
              className='h-8'
            >
              <Plus className='h-3 w-3 mr-1' />
              Add Date
            </Button>
            {/* <Button
              type='button'
              variant='outline'
              onClick={handleLoadTestData}
              disabled={isSubmitting}
              size='sm'
              className='h-8'
            >
              <Clock className='h-3 w-3 mr-1' />
              Load Test Data
            </Button> */}
          </div>
        </CardContent>
      </Card>

      <div className='space-y-3'>
        {fields.map((field, dateIndex) => {
          const date = watchedDates[dateIndex]
          const overlappingSlots = getOverlappingSlots(dateIndex)
          const hasOverlappingSlots = Object.keys(overlappingSlots).length > 0

          return (
            <Card key={field.id} className='overflow-hidden'>
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div
                      className={`w-1.5 h-6 rounded-full transition-colors ${
                        date?.isAvailable ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    />
                    <div>
                      <CardTitle className='text-base font-semibold'>
                        {formatDate(date.date)}
                      </CardTitle>
                      <p className='text-xs text-gray-600'>
                        {date?.isAvailable
                          ? date.timeSlots.length === 0
                            ? 'Available - add time slots'
                            : `${date.timeSlots.length} slot(s)`
                          : 'Not available'}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-3'>
                    <Controller
                      control={control}
                      name={`dates.${dateIndex}.isAvailable`}
                      render={({ field }) => (
                        <div className='flex items-center space-x-2'>
                          <Switch
                            id={`available-${dateIndex}`}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isSubmitting}
                          />
                          <Label
                            htmlFor={`available-${dateIndex}`}
                            className='text-xs'
                          >
                            Available
                          </Label>
                        </div>
                      )}
                    />

                    {date?.isAvailable && (
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => handleAddTimeSlot(dateIndex)}
                        disabled={isSubmitting}
                        className='text-xs h-7 px-2'
                      >
                        <Plus className='h-3 w-3 mr-1' />
                        Add
                      </Button>
                    )}

                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => handleRemoveDate(dateIndex)}
                      disabled={isSubmitting}
                      className='text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0'
                    >
                      <Trash2 className='w-3 h-3' />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {date?.isAvailable && (
                <CardContent className='pt-0 pb-3'>
                  {hasOverlappingSlots && (
                    <Alert className='mb-3 border-red-200 bg-red-50 py-2'>
                      <AlertCircle className='h-3 w-3 text-red-600' />
                      <AlertDescription className='text-red-700 text-xs'>
                        Overlapping time slots detected. Please adjust to avoid
                        conflicts.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className='space-y-2'>
                    {date.timeSlots.length === 0 ? (
                      <div className='text-center py-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50'>
                        <Clock className='w-6 h-6 text-gray-400 mx-auto mb-2' />
                        <p className='text-gray-600 text-sm font-medium mb-1'>
                          No time slots
                        </p>
                        <p className='text-gray-500 text-xs mb-3'>
                          Add time slots to make this date bookable
                        </p>
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() => handleAddTimeSlot(dateIndex)}
                          disabled={isSubmitting}
                          className='text-xs h-7'
                        >
                          <Plus className='h-3 w-3 mr-1' />
                          Add First Slot
                        </Button>
                      </div>
                    ) : (
                      date.timeSlots.map((slot, slotIndex) => (
                        <div key={slot.id} className='relative'>
                          <div className='flex items-center gap-2 p-2 border border-gray-200 rounded-lg bg-gray-50'>
                            <div className='flex-1 grid grid-cols-2 gap-2'>
                              <div>
                                <Label className='text-xs text-gray-600 mb-1 block'>
                                  Start
                                </Label>
                                <Controller
                                  control={control}
                                  name={`dates.${dateIndex}.timeSlots.${slotIndex}.startTime`}
                                  render={({ field }) => (
                                    <Input
                                      type='time'
                                      {...field}
                                      className='h-7 text-xs'
                                      disabled={isSubmitting}
                                    />
                                  )}
                                />
                              </div>
                              <div>
                                <Label className='text-xs text-gray-600 mb-1 block'>
                                  End
                                </Label>
                                <Controller
                                  control={control}
                                  name={`dates.${dateIndex}.timeSlots.${slotIndex}.endTime`}
                                  render={({ field }) => (
                                    <Input
                                      type='time'
                                      {...field}
                                      className='h-7 text-xs'
                                      disabled={isSubmitting}
                                    />
                                  )}
                                />
                              </div>
                            </div>

                            <div className='flex items-center gap-2'>
                              <Badge variant='outline' className='text-xs'>
                                {slot.startTime} - {slot.endTime}
                              </Badge>

                              <Button
                                type='button'
                                variant='ghost'
                                size='sm'
                                onClick={() =>
                                  handleDeleteTimeSlot(dateIndex, slotIndex)
                                }
                                disabled={isSubmitting}
                                className='text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0'
                              >
                                <Trash2 className='w-3 h-3' />
                              </Button>
                            </div>
                          </div>

                          {overlappingSlots[slot.id] && (
                            <div className='mt-1 ml-3 p-1 bg-red-50 border-l-2 border-red-200 rounded-r'>
                              <div className='flex items-center gap-1 text-red-600'>
                                <AlertCircle className='w-2 h-2' />
                                <span className='text-xs'>
                                  Overlaps with{' '}
                                  {overlappingSlots[slot.id].length} other
                                  slot(s)
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {fields.length === 0 && (
        <div className='text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200'>
          <CalendarIcon className='h-10 w-10 text-gray-400 mx-auto mb-3' />
          <h3 className='text-base font-medium text-gray-900 mb-1'>
            No dates configured
          </h3>
          <p className='text-sm text-gray-500 mb-3'>
            Select a date above to start configuring time slots
          </p>
        </div>
      )}

      <div className='flex items-center justify-between pt-4 border-t border-gray-200'>
        <div className='flex items-center gap-2'>
          {hasChanges && (
            <div className='text-xs text-yellow-600 flex items-center gap-1'>
              <AlertCircle className='h-3 w-3' />
              Unsaved Changes
            </div>
          )}
        </div>
        <div className='flex gap-2'>
          {onCancel && (
            <Button
              type='button'
              variant='outline'
              onClick={onCancel}
              size='sm'
            >
              Cancel
            </Button>
          )}
          <Button type='submit' disabled={isSubmitting || isLoading} size='sm'>
            <Save className='h-3 w-3 mr-2' />
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </form>
  )
}
