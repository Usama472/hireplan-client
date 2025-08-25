import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { BookedSlot } from '@/interfaces'
import { format } from 'date-fns'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface CalendarViewProps {
  bookedSlots: BookedSlot[]
  className?: string
}

export function CalendarView({ bookedSlots, className }: CalendarViewProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')

  // Group booked slots by date
  const bookedSlotsByDate: Record<string, BookedSlot[]> = {}
  bookedSlots.forEach((slot) => {
    const dateKey = format(new Date(slot.date), 'yyyy-MM-dd')
    if (!bookedSlotsByDate[dateKey]) {
      bookedSlotsByDate[dateKey] = []
    }
    bookedSlotsByDate[dateKey].push(slot)
  })

  // Function to determine if a day has bookings
  const getDayHasBookings = (day: Date) => {
    const dateKey = format(day, 'yyyy-MM-dd')
    return !!bookedSlotsByDate[dateKey]?.length
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg font-medium'>Calendar View</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                className='flex items-center gap-2'
              >
                {view === 'month' ? 'Month' : view === 'week' ? 'Week' : 'Day'}
                <ChevronDown className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuRadioGroup
                value={view}
                onValueChange={(v) => setView(v as any)}
              >
                <DropdownMenuRadioItem value='month'>
                  Month
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value='week'>Week</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value='day'>Day</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription>
          View and manage your scheduled appointments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='rounded-md border'>
          <Calendar
            mode='single'
            selected={date}
            onSelect={setDate}
            className='p-0'
            modifiersStyles={{
              booked: {
                fontWeight: 'bold',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
              },
            }}
            modifiers={{
              booked: (date) => getDayHasBookings(date),
            }}
          />
        </div>

        {date && bookedSlotsByDate[format(date, 'yyyy-MM-dd')] && (
          <div className='mt-4'>
            <h3 className='font-medium mb-2'>
              Appointments on {format(date, 'MMMM d, yyyy')}
            </h3>
            <div className='space-y-2'>
              {bookedSlotsByDate[format(date, 'yyyy-MM-dd')].map((slot) => (
                <div
                  key={slot.id}
                  className='flex justify-between items-center border rounded-md p-2'
                >
                  <span>{slot.title}</span>
                  <Badge variant='outline'>
                    {slot.startTime} - {slot.endTime}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
