import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Building,
  MapPin,
  DollarSign,
  Users,
  Target,
  Eye,
  Clock,
  Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  //   getStatusIcon,
  getStatusColor,
  getPriorityColor,
  formatSalary,
  getDaysUntilDeadline,
} from '@/lib/utils'
import type { Job } from '@/interfaces'

interface JobListItemProps {
  job: Job
}

export function JobListItem({ job }: JobListItemProps) {
  return (
    <Card className='border-0 shadow-sm hover:shadow-md transition-all duration-200'>
      <CardContent className='p-6'>
        <div className='flex items-center justify-between'>
          <div className='flex-1'>
            <div className='flex items-start justify-between mb-3'>
              <div>
                <div className='flex items-center gap-2 mb-2'>
                  <h3 className='font-semibold text-lg text-gray-900'>
                    {job.title}
                  </h3>
                  {job.featured && (
                    <Badge className='bg-blue-100 text-blue-800 border-blue-200'>
                      <Star className='w-3 h-3 mr-1' />
                      Featured
                    </Badge>
                  )}
                </div>
                <div className='flex items-center gap-4 text-sm text-gray-600'>
                  <div className='flex items-center'>
                    <Building className='w-4 h-4 mr-1' />
                    {job.company}
                  </div>
                  <div className='flex items-center'>
                    <MapPin className='w-4 h-4 mr-1' />
                    {job.location}
                  </div>
                  <div className='flex items-center'>
                    <DollarSign className='w-4 h-4 mr-1' />
                    {formatSalary(job)}
                  </div>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <Badge
                  className={cn('text-xs border', getStatusColor(job.status))}
                >
                  {/* {getStatusIcon(job.status)} */}
                  <span className='ml-1 capitalize'>{job.status}</span>
                </Badge>
                <Badge
                  className={cn(
                    'text-xs border',
                    getPriorityColor(job.priority)
                  )}
                >
                  <span className='capitalize'>{job.priority}</span>
                </Badge>
              </div>
            </div>

            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-6 text-sm'>
                <div className='flex items-center text-blue-600'>
                  <Users className='w-4 h-4 mr-1' />
                  <span className='font-medium'>{job.applicants}</span>
                  <span className='text-gray-500 ml-1'>applicants</span>
                </div>
                <div className='flex items-center text-green-600'>
                  <Target className='w-4 h-4 mr-1' />
                  <span className='font-medium'>{job.matches}</span>
                  <span className='text-gray-500 ml-1'>matches</span>
                </div>
                <div className='flex items-center text-purple-600'>
                  <Eye className='w-4 h-4 mr-1' />
                  <span className='font-medium'>{job.views}</span>
                  <span className='text-gray-500 ml-1'>views</span>
                </div>
              </div>
              <div className='flex items-center gap-2 text-xs text-gray-500'>
                <Clock className='w-3 h-3' />
                {getDaysUntilDeadline(job.deadline)} days left
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
