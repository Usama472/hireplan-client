import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { defaultAvailabilitySettings } from '@/constants/availability-constants'
import type { AvailabilitySettings, TimeSlot } from '@/interfaces'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Calendar, Clock, Plus, Save, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'

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

const dayAvailabilitySchema = z.object({
  id: z.string(),
  day: z.enum([
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ]),
  isAvailable: z.boolean(),
  timeSlots: z.array(timeSlotSchema),
})

const weeklyAvailabilitySchema = z.object({
  daysAvailability: z.array(dayAvailabilitySchema),
})

type WeeklyAvailabilityFormData = z.infer<typeof weeklyAvailabilitySchema>

interface WeeklyAvailabilityFormProps {
  initialData?: AvailabilitySettings
  onSave?: (data: AvailabilitySettings) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
}

export function WeeklyAvailabilityForm({
  initialData = defaultAvailabilitySettings,
  onSave,
  onCancel,
  isLoading = false,
}: WeeklyAvailabilityFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<WeeklyAvailabilityFormData>({
    resolver: zodResolver(weeklyAvailabilitySchema),
    defaultValues: {
      daysAvailability: initialData.daysAvailability,
    },
  })

  const { fields: daysFields } = useFieldArray({
    control,
    name: 'daysAvailability',
  })

  const watchedValues = watch()

  useEffect(() => {
    setHasChanges(isDirty)
  }, [isDirty])

  const getOverlappingSlots = (dayIndex: number) => {
    const day = watchedValues.daysAvailability[dayIndex]
    if (!day || !day.isAvailable) return {}

    const overlaps: { [key: string]: string[] } = {}

    day.timeSlots.forEach((slot, index) => {
      const slotStart = convertTimeToMinutes(slot.startTime)
      const slotEnd = convertTimeToMinutes(slot.endTime)

      day.timeSlots.forEach((otherSlot, otherIndex) => {
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

  const handleAddTimeSlot = (dayIndex: number) => {
    const day = watchedValues.daysAvailability[dayIndex]
    if (!day) return

    const lastSlot = day.timeSlots[day.timeSlots.length - 1]
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

    const newSlot: TimeSlot = {
      id: uuidv4(),
      startTime,
      endTime,
    }

    const currentSlots = watchedValues.daysAvailability[dayIndex].timeSlots
    setValue(`daysAvailability.${dayIndex}.timeSlots`, [
      ...currentSlots,
      newSlot,
    ])
  }

  const handleDeleteTimeSlot = (dayIndex: number, slotIndex: number) => {
    const currentSlots = watchedValues.daysAvailability[dayIndex].timeSlots
    const updatedSlots = currentSlots.filter((_, index) => index !== slotIndex)
    setValue(`daysAvailability.${dayIndex}.timeSlots`, updatedSlots)
  }

  const onSubmit = async (data: WeeklyAvailabilityFormData) => {
    setIsSubmitting(true)
    try {
      if (onSave) {
        await onSave({
          ...initialData,
          daysAvailability: data.daysAvailability,
        })
      }
      setHasChanges(false)
    } catch (error) {
      console.error('Error saving availability:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDayName = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1)
  }

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':')
    const hourInt = parseInt(hour)
    const period = hourInt >= 12 ? 'PM' : 'AM'
    const hour12 = hourInt % 12 || 12
    return `${hour12}:${minute} ${period}`
  }

  const getAvailableDaysCount = () => {
    return watchedValues.daysAvailability.filter((day) => day.isAvailable)
      .length
  }

  const getTotalTimeSlots = () => {
    return watchedValues.daysAvailability.reduce(
      (total, day) => total + day.timeSlots.length,
      0
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <div className='bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4'>
        <div className='flex items-center gap-2 mb-1'>
          <Calendar className='w-4 h-4 text-blue-600' />
          <h3 className='text-sm font-medium text-blue-900'>
            Schedule Overview
          </h3>
        </div>
        <div className='flex gap-4 text-xs'>
          <div>
            <span className='text-blue-700 font-medium'>
              {getAvailableDaysCount()}
            </span>
            <span className='text-blue-600 ml-1'>days available</span>
          </div>
          <div>
            <span className='text-blue-700 font-medium'>
              {getTotalTimeSlots()}
            </span>
            <span className='text-blue-600 ml-1'>time slots</span>
          </div>
        </div>
      </div>

      <div className='space-y-3'>
        {daysFields.map((dayField, dayIndex) => {
          const day = watchedValues.daysAvailability[dayIndex]
          const overlappingSlots = getOverlappingSlots(dayIndex)
          const hasOverlaps = Object.keys(overlappingSlots).length > 0

          return (
            <Card key={dayField.id} className='overflow-hidden'>
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div
                      className={`w-1.5 h-6 rounded-full transition-colors ${
                        day?.isAvailable ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    />
                    <div>
                      <CardTitle className='text-base font-semibold'>
                        {formatDayName(day?.day || '')}
                      </CardTitle>
                      <p className='text-xs text-gray-600'>
                        {day?.isAvailable
                          ? day.timeSlots.length === 0
                            ? 'Available - add time slots'
                            : `${day.timeSlots.length} slot(s)`
                          : 'Not available'}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-3'>
                    <Controller
                      name={`daysAvailability.${dayIndex}.isAvailable`}
                      control={control}
                      render={({ field }) => (
                        <div className='flex items-center space-x-2'>
                          <Switch
                            id={`available-${dayIndex}`}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isSubmitting}
                          />
                          <Label
                            htmlFor={`available-${dayIndex}`}
                            className='text-xs'
                          >
                            Available
                          </Label>
                        </div>
                      )}
                    />

                    {day?.isAvailable && (
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => handleAddTimeSlot(dayIndex)}
                        disabled={isSubmitting}
                        className='text-xs h-7 px-2'
                      >
                        <Plus className='h-3 w-3 mr-1' />
                        Add
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              {day?.isAvailable && (
                <CardContent className='pt-0 pb-3'>
                  {hasOverlaps && (
                    <Alert className='mb-3 border-red-200 bg-red-50 py-2'>
                      <AlertCircle className='h-3 w-3 text-red-600' />
                      <AlertDescription className='text-red-700 text-xs'>
                        Overlapping time slots detected. Please adjust to avoid
                        conflicts.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className='space-y-2'>
                    {day.timeSlots.length === 0 ? (
                      <div className='text-center py-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50'>
                        <Clock className='w-6 h-6 text-gray-400 mx-auto mb-2' />
                        <p className='text-gray-600 text-sm font-medium mb-1'>
                          No time slots
                        </p>
                        <p className='text-gray-500 text-xs mb-3'>
                          Add time slots to make this day bookable
                        </p>
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() => handleAddTimeSlot(dayIndex)}
                          disabled={isSubmitting}
                          className='text-xs h-7'
                        >
                          <Plus className='h-3 w-3 mr-1' />
                          Add First Slot
                        </Button>
                      </div>
                    ) : (
                      day.timeSlots.map((slot, slotIndex) => (
                        <div key={slot.id} className='relative'>
                          <div className='flex items-center gap-2 p-2 border border-gray-200 rounded-lg bg-gray-50'>
                            <div className='flex-1 grid grid-cols-2 gap-2'>
                              <div>
                                <Label className='text-xs text-gray-600 mb-1 block'>
                                  Start
                                </Label>
                                <Controller
                                  name={`daysAvailability.${dayIndex}.timeSlots.${slotIndex}.startTime`}
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      type='time'
                                      {...field}
                                      className='h-7 text-xs'
                                      disabled={isSubmitting}
                                    />
                                  )}
                                />
                                {errors.daysAvailability?.[dayIndex]
                                  ?.timeSlots?.[slotIndex]?.startTime && (
                                  <p className='text-xs text-red-600 mt-1'>
                                    {
                                      errors.daysAvailability[dayIndex]
                                        .timeSlots[slotIndex].startTime?.message
                                    }
                                  </p>
                                )}
                              </div>

                              <div>
                                <Label className='text-xs text-gray-600 mb-1 block'>
                                  End
                                </Label>
                                <Controller
                                  name={`daysAvailability.${dayIndex}.timeSlots.${slotIndex}.endTime`}
                                  control={control}
                                  render={({ field }) => (
                                    <Input
                                      type='time'
                                      {...field}
                                      className='h-7 text-xs'
                                      disabled={isSubmitting}
                                    />
                                  )}
                                />
                                {errors.daysAvailability?.[dayIndex]
                                  ?.timeSlots?.[slotIndex]?.endTime && (
                                  <p className='text-xs text-red-600 mt-1'>
                                    {
                                      errors.daysAvailability[dayIndex]
                                        .timeSlots[slotIndex].endTime?.message
                                    }
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className='flex items-center gap-2'>
                              <Badge variant='outline' className='text-xs'>
                                {formatTime(slot.startTime)} -{' '}
                                {formatTime(slot.endTime)}
                              </Badge>

                              <Button
                                type='button'
                                variant='ghost'
                                size='sm'
                                onClick={() =>
                                  handleDeleteTimeSlot(dayIndex, slotIndex)
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

      <div className='flex items-center justify-between pt-4 border-t border-gray-200'>
        <div className='text-xs text-gray-600'>
          {hasChanges && (
            <span className='flex items-center gap-2 text-blue-600'>
              <AlertCircle className='w-3 h-3' />
              Unsaved changes
            </span>
          )}
        </div>

        <div className='flex items-center gap-2'>
          {onCancel && (
            <Button
              type='button'
              variant='outline'
              onClick={onCancel}
              disabled={isSubmitting}
              size='sm'
            >
              Cancel
            </Button>
          )}
          <Button
            type='submit'
            disabled={isSubmitting || isLoading}
            className='min-w-[100px]'
            size='sm'
          >
            {isSubmitting ? (
              <div className='flex items-center'>
                <div className='animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2' />
                Saving...
              </div>
            ) : (
              <>
                <Save className='w-3 h-3 mr-2' />
                Save
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
