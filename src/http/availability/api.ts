import { get, post } from '../apiHelper'

interface BackendAvailabilitySlot {
  from: string
  to: string
}

interface BackendAvailabilityItem {
  type: 'weekDay' | 'date'
  slots: BackendAvailabilitySlot[]
  day?: string
  date?: string
}

interface GetAvailabilityResponse {
  status: boolean
  availability: {
    user: {
      firstName: string
      lastName: string
      email: string
      id: string
    }
    availabilities: BackendAvailabilityItem[]
    timezone: string
    isActive: boolean
    createdAt: string
    updatedAt: string
    id: string
  }
}

export const saveAvailability = async (
  availability: BackendAvailabilityItem[]
) => {
  return await post('/availabilities/save', { availabilities: availability })
}

export const getAvailability = async (): Promise<GetAvailabilityResponse> => {
  return await get('/availabilities/my')
}
