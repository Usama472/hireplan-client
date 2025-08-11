import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import type { BookedSlot } from '@/interfaces'
import { format, parseISO } from 'date-fns'
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  Mail,
  User,
} from 'lucide-react'
import { useState } from 'react'

interface BookedSlotsProps {
  bookedSlots?: BookedSlot[]
  className?: string
}

export function BookedSlots({ bookedSlots = [], className }: BookedSlotsProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())

  const nextDay = () => {
    const next = new Date(currentDate)
    next.setDate(next.getDate() + 1)
    setCurrentDate(next)
  }

  const previousDay = () => {
    const prev = new Date(currentDate)
    prev.setDate(prev.getDate() - 1)
    setCurrentDate(prev)
  }

  const currentDateFormatted = format(currentDate, 'EEEE, MMMM d, yyyy')

  // Filter slots for the current date
  const slotsForCurrentDate = bookedSlots.filter((slot) => {
    const slotDate = parseISO(slot.date)
    return (
      slotDate.getDate() === currentDate.getDate() &&
      slotDate.getMonth() === currentDate.getMonth() &&
      slotDate.getFullYear() === currentDate.getFullYear()
    )
  })

  return (
    <Card className={className}>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg font-medium flex items-center gap-2'>
            <CalendarCheck className='h-5 w-5' />
            Booked Appointments
          </CardTitle>
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='icon' onClick={previousDay}>
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <span className='text-sm font-medium'>{currentDateFormatted}</span>
            <Button variant='outline' size='icon' onClick={nextDay}>
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
        <CardDescription>
          Manage your upcoming interviews and appointments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className='h-[300px] pr-4'>
          {slotsForCurrentDate.length > 0 ? (
            <div className='space-y-4'>
              {slotsForCurrentDate.map((slot) => (
                <div key={slot.id} className='bg-gray-50 rounded-md p-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <h3 className='font-medium'>{slot.title}</h3>
                    <Badge
                      variant='outline'
                      className='bg-blue-50 text-blue-700 border-blue-200'
                    >
                      <Clock className='mr-1 h-3 w-3' />
                      {slot.startTime} - {slot.endTime}
                    </Badge>
                  </div>
                  {slot.description && (
                    <p className='text-sm text-gray-600 mb-3'>
                      {slot.description}
                    </p>
                  )}
                  <Separator className='my-2' />
                  <div className='flex items-center text-sm text-gray-500 mt-2'>
                    <div className='flex items-center mr-4'>
                      <User className='mr-1 h-3.5 w-3.5' />
                      {slot.attendeeName}
                    </div>
                    <div className='flex items-center'>
                      <Mail className='mr-1 h-3.5 w-3.5' />
                      {slot.attendeeEmail}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center h-full text-center py-8'>
              <CalendarCheck className='h-12 w-12 text-gray-300 mb-2' />
              <p className='text-gray-500'>
                No appointments scheduled for this day.
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
