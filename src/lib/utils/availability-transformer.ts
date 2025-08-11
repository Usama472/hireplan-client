import { defaultAvailabilitySettings } from '@/constants/availability-constants'
import type { DateSpecificFormData } from '@/constants/date-specific-constants'
import type { AvailabilitySettings } from '@/interfaces'

export interface BackendAvailabilitySlot {
  from: string
  to: string
}

export interface BackendAvailabilityItem {
  type: 'weekDay' | 'date'
  slots: BackendAvailabilitySlot[]
  day?: string
  date?: string
}

export class AvailabilityTransformer {
  static transformWeeklyToBackend(
    data: AvailabilitySettings
  ): BackendAvailabilityItem[] {
    return data.daysAvailability
      .filter((day) => day.isAvailable && day.timeSlots.length > 0)
      .map((day) => ({
        type: 'weekDay' as const,
        day: day.day,
        slots: day.timeSlots.map((slot) => ({
          from: slot.startTime,
          to: slot.endTime,
        })),
      }))
  }

  static transformDateSpecificToBackend(
    data: DateSpecificFormData
  ): BackendAvailabilityItem[] {
    return data.dates
      .filter((date) => date.isAvailable && date.timeSlots.length > 0)
      .map((date) => ({
        type: 'date' as const,
        date: date.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        slots: date.timeSlots.map((slot) => ({
          from: slot.startTime,
          to: slot.endTime,
        })),
      }))
  }

  static transformBackendToWeekly(
    backendData: BackendAvailabilityItem[]
  ): AvailabilitySettings {
    const weekDayItems = backendData.filter((item) => item.type === 'weekDay')

    const updatedDaysAvailability =
      defaultAvailabilitySettings.daysAvailability.map((day) => {
        const backendDay = weekDayItems.find((item) => item.day === day.day)
        if (backendDay) {
          return {
            ...day,
            isAvailable: true,
            timeSlots: backendDay.slots.map((slot) => ({
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

    return {
      ...defaultAvailabilitySettings,
      daysAvailability: updatedDaysAvailability,
    }
  }

  static transformBackendToDateSpecific(
    backendData: BackendAvailabilityItem[]
  ): DateSpecificFormData {
    const dateItems = backendData.filter((item) => item.type === 'date')

    const dates = dateItems.map((item) => ({
      date: new Date(item.date!),
      isAvailable: true,
      timeSlots: item.slots.map((slot) => ({
        id: crypto.randomUUID(),
        startTime: slot.from,
        endTime: slot.to,
      })),
    }))

    return {
      dates,
    }
  }

  static async saveToBackend(
    availability: BackendAvailabilityItem[]
  ): Promise<BackendAvailabilityItem[]> {
    const response = await fetch('/api/availability', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        availability,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const responseData = await response.json()
    return responseData.availability || availability
  }

  static async loadFromBackend(): Promise<BackendAvailabilityItem[]> {
    const response = await fetch('/api/availability', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const responseData = await response.json()
    return responseData.availability || []
  }
}
