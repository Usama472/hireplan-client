'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { defaultAvailabilitySettings } from '@/constants/availability-constants'
import API from '@/http'
import type { AvailabilitySettings } from '@/interfaces'
import { useToast } from '@/lib/hooks/use-toast'
import { AlertCircle, Database, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { WeeklyAvailabilityForm } from './weekly-availability-form'

export function WeeklyAvailabilityContainer() {
  const [availabilityData, setAvailabilityData] =
    useState<AvailabilitySettings | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    errors: string[]
    warnings: string[]
  } | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadAvailabilityData()
  }, [])

  const loadAvailabilityData = async () => {
    setIsLoading(true)
    try {
      const response = await API.availability.getAvailability()

      if (response.status && response.availability) {
        const weekDayItems = response.availability.availabilities.filter(
          (item: any) => item.type === 'weekDay'
        )

        const updatedDaysAvailability =
          defaultAvailabilitySettings.daysAvailability.map((day) => {
            const backendDay = weekDayItems.find(
              (item: any) => item.day === day.day
            )
            if (backendDay) {
              return {
                ...day,
                isAvailable: true,
                timeSlots: backendDay.slots.map((slot: any) => ({
                  id: crypto.randomUUID(),
                  startTime: slot.from,
                  endTime: slot.to,
                })),
              }
            }
            return {
              ...day,
              isAvailable: false,
              timeSlots: [],
            }
          })

        const transformedData = {
          timezone:
            response.availability.timezone ||
            defaultAvailabilitySettings.timezone,
          daysAvailability: updatedDaysAvailability,
        }

        setAvailabilityData(transformedData)
        validateData(transformedData)
      } else {
        setAvailabilityData({ ...defaultAvailabilitySettings })
        validateData(defaultAvailabilitySettings)
      }
    } catch (error) {
      console.error('Error loading availability data:', error)
      setAvailabilityData({ ...defaultAvailabilitySettings })
      validateData(defaultAvailabilitySettings)
    } finally {
      setIsLoading(false)
    }
  }

  const loadTestData = () => {
    setIsLoading(true)
    setTimeout(() => {
      setAvailabilityData({ ...defaultAvailabilitySettings })
      validateData(defaultAvailabilitySettings)
      setIsLoading(false)
    }, 500)
  }

  const validateData = (data: AvailabilitySettings) => {
    const errors: string[] = []
    const warnings: string[] = []

    data.daysAvailability.forEach((day) => {
      if (day.isAvailable && day.timeSlots.length > 1) {
        for (let i = 0; i < day.timeSlots.length; i++) {
          for (let j = i + 1; j < day.timeSlots.length; j++) {
            const slot1 = day.timeSlots[i]
            const slot2 = day.timeSlots[j]

            const start1 = new Date(`2000-01-01T${slot1.startTime}:00`)
            const end1 = new Date(`2000-01-01T${slot1.endTime}:00`)
            const start2 = new Date(`2000-01-01T${slot2.startTime}:00`)
            const end2 = new Date(`2000-01-01T${slot2.endTime}:00`)

            if (start1 < end2 && start2 < end1) {
              errors.push(
                `Overlapping time slots on ${day.day}: ${slot1.startTime}-${slot1.endTime} and ${slot2.startTime}-${slot2.endTime}`
              )
            }
          }
        }
      }
    })

    data.daysAvailability.forEach((day) => {
      day.timeSlots.forEach((slot) => {
        const start = new Date(`2000-01-01T${slot.startTime}:00`)
        const end = new Date(`2000-01-01T${slot.endTime}:00`)
        const duration = (end.getTime() - start.getTime()) / (1000 * 60)

        if (duration < 15) {
          warnings.push(
            `Very short time slot on ${day.day}: ${slot.startTime}-${slot.endTime} (${duration} minutes)`
          )
        }
      })
    })

    data.daysAvailability.forEach((day) => {
      if (day.isAvailable && day.timeSlots.length > 1) {
        const sortedSlots = [...day.timeSlots].sort((a, b) =>
          a.startTime.localeCompare(b.startTime)
        )

        for (let i = 0; i < sortedSlots.length - 1; i++) {
          const currentEnd = new Date(`2000-01-01T${sortedSlots[i].endTime}:00`)
          const nextStart = new Date(
            `2000-01-01T${sortedSlots[i + 1].startTime}:00`
          )
          const gap = (nextStart.getTime() - currentEnd.getTime()) / (1000 * 60)

          if (gap > 120) {
            warnings.push(
              `Large gap on ${day.day}: ${gap} minutes between ${
                sortedSlots[i].endTime
              } and ${sortedSlots[i + 1].startTime}`
            )
          }
        }
      }
    })

    setValidationResult({
      isValid: errors.length === 0,
      errors,
      warnings,
    })
  }

  const handleSave = async (data: AvailabilitySettings) => {
    try {
      setIsSaving(true)

      validateData(data)

      const backendFormat = data.daysAvailability
        .filter((day) => day.isAvailable && day.timeSlots.length > 0)
        .map((day) => ({
          type: 'weekDay' as const,
          day: day.day,
          slots: day.timeSlots.map((slot) => ({
            from: slot.startTime,
            to: slot.endTime,
          })),
        }))

      const response = await API.availability.saveAvailability(backendFormat)

      if (response.availability) {
        const weekDayItems = response.availability.availabilities.filter(
          (item: any) => item.type === 'weekDay'
        )

        const updatedDaysAvailability =
          defaultAvailabilitySettings.daysAvailability.map((day) => {
            const backendDay = weekDayItems.find(
              (item: any) => item.day === day.day
            )
            if (backendDay) {
              return {
                ...day,
                isAvailable: true,
                timeSlots: backendDay.slots.map((slot: any) => ({
                  id: crypto.randomUUID(),
                  startTime: slot.from,
                  endTime: slot.to,
                })),
              }
            }
            return {
              ...day,
              isAvailable: false,
              timeSlots: [],
            }
          })

        const transformedData = {
          timezone:
            response.availability.timezone ||
            defaultAvailabilitySettings.timezone,
          daysAvailability: updatedDaysAvailability,
        }

        setAvailabilityData(transformedData)
      } else {
        setAvailabilityData(data)
      }

      toast({
        title: 'Success',
        description: 'Weekly availability settings saved successfully!',
      })

      await loadAvailabilityData()
    } catch (error) {
      console.error('Error saving availability:', error)
      toast({
        title: 'Error',
        description: 'Failed to save availability settings.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    try {
      setIsSaving(true)

      await new Promise((resolve) => setTimeout(resolve, 500))

      const resetData = { ...defaultAvailabilitySettings }

      setAvailabilityData(resetData)
      validateData(resetData)

      toast({
        title: 'Success',
        description: 'Availability settings have been reset to defaults.',
      })
    } catch (error) {
      console.error('Error resetting availability:', error)
      toast({
        title: 'Error',
        description: 'Failed to reset availability settings.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h2 className='text-lg font-semibold text-gray-800 flex items-center gap-3 mb-1'>
            <div className='w-1 h-6 bg-blue-600 rounded-full'></div>
            <span>Weekly Availability</span>
          </h2>
          <p className='text-xs text-gray-600 ml-4'>
            Configure recurring weekly schedules
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className='flex items-center justify-center py-8'>
          <div className='text-center'>
            <RefreshCw className='w-6 h-6 animate-spin text-blue-600 mx-auto mb-2' />
            <p className='text-sm text-gray-600'>
              Loading availability data...
            </p>
          </div>
        </div>
      ) : !availabilityData ? (
        <div className='text-center py-6'>
          <Database className='w-10 h-10 text-gray-400 mx-auto mb-3' />
          <h3 className='text-base font-semibold text-gray-900 mb-1'>
            No Data Found
          </h3>
          <p className='text-sm text-gray-600 mb-3'>
            Click the button below to load default availability data.
          </p>
          <Button onClick={loadTestData} size='sm'>
            <Database className='w-4 h-4 mr-2' />
            Load Default Data
          </Button>
        </div>
      ) : (
        <>
          {validationResult && (
            <div className='space-y-2'>
              {validationResult.errors.length > 0 && (
                <Alert variant='destructive' className='py-2'>
                  <AlertCircle className='h-3 w-3' />
                  <AlertDescription className='text-xs'>
                    <div className='font-medium mb-1'>Validation Errors:</div>
                    <ul className='list-disc list-inside space-y-0.5'>
                      {validationResult.errors.map((error, index) => (
                        <li key={index} className='text-xs'>
                          {error}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {validationResult.warnings.length > 0 && (
                <Alert className='py-2'>
                  <AlertCircle className='h-3 w-3' />
                  <AlertDescription className='text-xs'>
                    <div className='font-medium mb-1'>Validation Warnings:</div>
                    <ul className='list-disc list-inside space-y-0.5'>
                      {validationResult.warnings.map((warning, index) => (
                        <li key={index} className='text-xs'>
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <WeeklyAvailabilityForm
            initialData={availabilityData}
            onSave={handleSave}
            onCancel={handleReset}
            isLoading={isSaving}
          />
        </>
      )}
    </div>
  )
}
