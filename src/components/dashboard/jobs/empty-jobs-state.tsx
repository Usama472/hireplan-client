import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Briefcase } from 'lucide-react'

interface EmptyJobsStateProps {
  onClearFilters: () => void
  hasFilters: boolean
}

export function EmptyJobsState({
  onClearFilters,
  hasFilters,
}: EmptyJobsStateProps) {
  return (
    <Card className='border-0 shadow-sm'>
      <CardContent className='p-12 text-center'>
        <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
          <Briefcase className='w-8 h-8 text-gray-400' />
        </div>
        <h3 className='text-lg font-semibold text-gray-900 mb-2'>
          {hasFilters ? 'No jobs found' : 'No jobs created yet'}
        </h3>
        <p className='text-gray-600 mb-6'>
          {hasFilters
            ? 'Try adjusting your filters or search terms'
            : 'Create your first job posting to get started'}
        </p>
        {hasFilters ? (
          <Button onClick={onClearFilters}>Clear Filters</Button>
        ) : (
          <Button>Create Your First Job</Button>
        )}
      </CardContent>
    </Card>
  )
}
