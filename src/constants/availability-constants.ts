import type {
  AvailabilitySettings,
  BookedSlot,
  DayAvailability,
} from '@/interfaces'
import { v4 as uuidv4 } from 'uuid'

export const timeZones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Australia/Sydney',
]

export const daysOfWeek = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const

export const mockBookedSlots: BookedSlot[] = [
  {
    id: uuidv4(),
    date: new Date().toISOString(),
    startTime: '10:00',
    endTime: '11:00',
    title: 'Interview with John Doe',
    description: 'Frontend Developer position interview',
    attendeeName: 'John Doe',
    attendeeEmail: 'john.doe@example.com',
  },
  {
    id: uuidv4(),
    date: new Date().toISOString(),
    startTime: '14:00',
    endTime: '15:00',
    title: 'Interview with Jane Smith',
    description: 'UI/UX Designer position interview',
    attendeeName: 'Jane Smith',
    attendeeEmail: 'jane.smith@example.com',
  },
  {
    id: uuidv4(),
    date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
    startTime: '11:00',
    endTime: '12:00',
    title: 'Interview with Mike Johnson',
    description: 'Backend Developer position interview',
    attendeeName: 'Mike Johnson',
    attendeeEmail: 'mike.johnson@example.com',
  },
]

export const defaultDaysAvailability: DayAvailability[] = [
  {
    id: uuidv4(),
    day: 'monday',
    isAvailable: false,
    timeSlots: [],
  },
  {
    id: uuidv4(),
    day: 'tuesday',
    isAvailable: false,
    timeSlots: [],
  },
  {
    id: uuidv4(),
    day: 'wednesday',
    isAvailable: false,
    timeSlots: [],
  },
  {
    id: uuidv4(),
    day: 'thursday',
    isAvailable: false,
    timeSlots: [],
  },
  {
    id: uuidv4(),
    day: 'friday',
    isAvailable: false,
    timeSlots: [],
  },
  {
    id: uuidv4(),
    day: 'saturday',
    isAvailable: false,
    timeSlots: [],
  },
  {
    id: uuidv4(),
    day: 'sunday',
    isAvailable: false,
    timeSlots: [],
  },
]

export const defaultAvailabilitySettings: AvailabilitySettings = {
  timezone: 'America/New_York',
  daysAvailability: defaultDaysAvailability,
}

export const timeSlotTemplates = {
  fullDay: { startTime: '09:00', endTime: '17:00' },
  morning: { startTime: '09:00', endTime: '12:00' },
  afternoon: { startTime: '13:00', endTime: '17:00' },
  evening: { startTime: '18:00', endTime: '21:00' },
  custom: { startTime: '10:00', endTime: '11:00' },
}

export const businessHoursPresets = {
  standard: '09:00-17:00',
  early: '08:00-16:00',
  late: '10:00-18:00',
  flexible: 'Flexible',
  custom: 'Custom',
}
