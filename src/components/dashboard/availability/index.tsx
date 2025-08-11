'use client' // This directive declares an entry point for client-side components [^2].

import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  defaultDaysAvailability,
  mockBookedSlots,
  timeZones,
} from '@/constants/availability-constants'
import API from '@/http'
import type { AvailabilitySettings, BookedSlot } from '@/interfaces'
import useAuthSessionContext from '@/lib/context/AuthSessionContext'
import { useToast } from '@/lib/hooks/use-toast'
import { errorResolver } from '@/lib/utils'
import { Calendar, CalendarClock, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AvailabilityOverview } from './availability-overview'
import { BookedSlots } from './booked-slots'
import { DateSpecificContainer } from './date-specific-container'
import { WeeklyAvailabilityContainer } from './weekly-availability-container'

export default function AvailabilityManager() {
  const { toast } = useToast()
  const { data, updateUser } = useAuthSessionContext()
  const [activeMainTab, setActiveMainTab] = useState<string>('schedule')
  const [activeScheduleTab, setActiveScheduleTab] = useState<string>('weekly')
  const [settings, setSettings] = useState<AvailabilitySettings>(() => {
    const defaultSettings: AvailabilitySettings = {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      daysAvailability: defaultDaysAvailability,
    }
    const savedSettings =
      typeof window !== 'undefined'
        ? localStorage.getItem('availability-settings')
        : null
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings
  })

  const [bookedSlots] = useState<BookedSlot[]>(mockBookedSlots)

  const handleTimezoneChange = async (timezone: string) => {
    setSettings((prev) => ({
      ...prev,
      timezone,
    }))
    try {
      await API.user.updateProfile({
        defaultTimezone: timezone,
      })
      if (updateUser) {
        updateUser({
          ...data?.user,
          defaultTimezone: timezone,
        })
      }
      toast({
        type: 'success',
        title: 'Timezone updated',
        description: 'Your timezone has been updated successfully',
      })
    } catch (err) {
      toast({
        type: 'error',
        title: 'Error updating timezone',
        description: errorResolver(err),
      })
    }
  }

  const totalAvailableDays = settings.daysAvailability.filter(
    (day) => day.isAvailable
  ).length
  const totalTimeSlots = settings.daysAvailability.reduce(
    (total, day) => total + day.timeSlots.length,
    0
  )
  const totalAvailableHours = settings.daysAvailability.reduce((total, day) => {
    return (
      total +
      day.timeSlots.reduce((dayTotal, slot) => {
        const startHour = Number.parseInt(slot.startTime.split(':')[0])
        const startMinute = Number.parseInt(slot.startTime.split(':')[1])
        const endHour = Number.parseInt(slot.endTime.split(':')[0])
        const endMinute = Number.parseInt(slot.endTime.split(':')[1])
        const hoursDiff = endHour - startHour
        const minutesDiff = endMinute - startMinute
        return dayTotal + hoursDiff + minutesDiff / 60
      }, 0)
    )
  }, 0)

  useEffect(() => {
    if (data?.user?.defaultTimezone) {
      setSettings((prev) => ({
        ...prev,
        timezone: data.user.defaultTimezone,
      }))
    }
  }, [data?.user?.defaultTimezone])

  return (
    <div className='max-w-6xl mx-auto px-4 py-4'>
      <AvailabilityOverview
        title='Availability'
        description='Manage your interview and meeting schedules'
        totalAvailableDays={totalAvailableDays}
        totalTimeSlots={totalTimeSlots}
        totalAvailableHours={totalAvailableHours}
        currentTimezone={settings.timezone}
        onTimezoneChange={handleTimezoneChange}
        timeZones={timeZones}
      />

      <Tabs
        value={activeMainTab}
        onValueChange={setActiveMainTab}
        className='w-full'
      >
        <div className='bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden'>
          <div className='border-b border-gray-100'>
            <TabsList className='flex w-full h-12 bg-transparent border-0 p-0 m-0'>
              <TabsTrigger
                value='schedule'
                className='flex-1 flex items-center justify-center gap-2 h-full px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=active]:font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 relative rounded-tl-xl'
              >
                <CalendarClock className='h-4 w-4' />
                <span className='text-sm'>Schedule</span>
                <div className='absolute bottom-0 left-0 w-full h-0.5 bg-gray-100'></div>
              </TabsTrigger>
              <TabsTrigger
                value='booked-slots'
                className='flex-1 flex items-center justify-center gap-2 h-full px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=active]:font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 relative rounded-tr-xl'
              >
                <Users className='h-4 w-4' />
                <span className='text-sm'>Booked Slots</span>
                {bookedSlots.length > 0 && (
                  <Badge
                    variant='secondary'
                    className='ml-1 h-5 px-2 text-xs bg-blue-50 text-blue-600 border border-blue-200'
                  >
                    {bookedSlots.length}
                  </Badge>
                )}
                <div className='absolute bottom-0 left-0 w-full h-0.5 bg-gray-100'></div>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className='p-6'>
            <TabsContent value='schedule' className='mt-0'>
              <Tabs
                value={activeScheduleTab}
                onValueChange={setActiveScheduleTab}
                className='w-full'
              >
                <div className='bg-white border border-gray-200 rounded-lg'>
                  <div className='p-4 border-b border-gray-200'>
                    <div className='flex justify-center'>
                      <TabsList className='inline-flex bg-gray-100 p-1 rounded-lg'>
                        <TabsTrigger
                          value='weekly'
                          className='relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900'
                        >
                          <CalendarClock className='h-4 w-4 mr-2' />
                          Weekly
                        </TabsTrigger>
                        <TabsTrigger
                          value='date-specific'
                          className='relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900'
                        >
                          <Calendar className='h-4 w-4 mr-2' />
                          Date Specific
                        </TabsTrigger>
                      </TabsList>
                    </div>
                  </div>

                  <div className='p-4'>
                    <TabsContent value='weekly' className='mt-0'>
                      <WeeklyAvailabilityContainer />
                    </TabsContent>
                    <TabsContent value='date-specific' className='mt-0'>
                      <DateSpecificContainer />
                    </TabsContent>
                  </div>
                </div>
              </Tabs>
            </TabsContent>

            <TabsContent value='booked-slots' className='mt-0'>
              <BookedSlots bookedSlots={bookedSlots} />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  )
}
