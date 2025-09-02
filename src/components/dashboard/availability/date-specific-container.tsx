'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  defaultDateSpecificData,
  type DateSpecificFormData,
} from '@/constants/date-specific-constants'
import API from '@/http'
import { AlertCircle, Database, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { DateSpecificForm } from './date-specific-form'

export function DateSpecificContainer() {
  const [dateSpecificData, setDateSpecificData] =
    useState<DateSpecificFormData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    errors: string[]
    warnings: string[]
  } | null>(null)

  useEffect(() => {
    loadAvailabilityData()
  }, [])

  const loadAvailabilityData = async () => {
    setIsLoading(true)
    try {
      const response = await API.availability.getAvailability()

      if (response.status && response.availability) {
        const dateItems = response.availability.availabilities.filter(
          (item: any) => item.type === 'date'
        )

        const dates = dateItems.map((item: any) => ({
          date: new Date(item.date),
          isAvailable: true,
          timeSlots: item.slots.map((slot: any) => ({
            id: crypto.randomUUID(),
            startTime: slot.from,
            endTime: slot.to,
          })),
        }))

        const transformedData = { dates }
        setDateSpecificData(transformedData)
      } else {
        setDateSpecificData({ ...defaultDateSpecificData })
      }
    } catch (error) {
      console.error('Error loading availability data:', error)
      setDateSpecificData({ ...defaultDateSpecificData })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (data: DateSpecificFormData) => {
    setIsSaving(true)
    try {
      const backendFormat = data.dates
        .filter((date) => date.isAvailable && date.timeSlots.length > 0)
        .map((date) => ({
          type: 'date' as const,
          date: date.date.toISOString().split('T')[0],
          slots: date.timeSlots.map((slot) => ({
            from: slot.startTime,
            to: slot.endTime,
          })),
        }))

      const response = await API.availability.saveAvailability(backendFormat)

      if (response.availability) {
        const dateItems = response.availability.availabilities.filter(
          (item: any) => item.type === 'date'
        )

        const dates = dateItems.map((item: any) => ({
          date: new Date(item.date),
          isAvailable: true,
          timeSlots: item.slots.map((slot: any) => ({
            id: crypto.randomUUID(),
            startTime: slot.from,
            endTime: slot.to,
          })),
        }))

        const transformedData = { dates }
        setDateSpecificData(transformedData)
        console.log('Transformed from backend:', transformedData)
      }

      setValidationResult({
        isValid: true,
        errors: [],
        warnings: [],
      })

      await loadAvailabilityData()
    } catch (error) {
      console.error('Error saving date-specific availability:', error)
      setValidationResult({
        isValid: false,
        errors: ['Failed to save availability settings'],
        warnings: [],
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
            <span>Date-Specific Availability</span>
          </h2>
          <p className='text-xs text-gray-600 ml-4'>
            Configure time slots for specific calendar dates
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
      ) : !dateSpecificData ? (
        <div className='text-center py-6'>
          <Database className='w-10 h-10 text-gray-400 mx-auto mb-3' />
          <h3 className='text-base font-semibold text-gray-900 mb-1'>
            No Data Found
          </h3>
          <p className='text-sm text-gray-600 mb-3'>
            No date-specific availability data available.
          </p>
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

          <DateSpecificForm
            initialData={dateSpecificData}
            onSave={handleSave}
            isLoading={isSaving}
          />
        </>
      )}
    </div>
  )
}
