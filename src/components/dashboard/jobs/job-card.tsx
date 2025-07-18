'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Star,
  Building,
  MapPin,
  DollarSign,
  Users,
  Target,
  Eye,
  Calendar,
  Clock,
  MoreVertical,
  Edit,
  Copy,
  Archive,
  Trash2,
  Briefcase,
  GraduationCap,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  // getStatusIcon,
  // getStatusColor,
  getPriorityColor,
  getWorkplaceTypeColor,
  getPayTypeColor,
  formatSalary,
  formatLocation,
  formatDate,
  getDaysUntilDeadline,
  getJobDisplayTitle,
  getJobInternalTitle,
  getEmploymentTypeLabel,
  getWorkplaceTypeLabel,
  getPayTypeLabel,
} from '@/lib/utils'
import type { Job } from '@/interfaces'

interface JobCardProps {
  job: Job
  onEdit?: (job: Job) => void
  onDuplicate?: (job: Job) => void
  onArchive?: (job: Job) => void
  onDelete?: (job: Job) => void
}

export function JobCard({
  job,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
}: JobCardProps) {
  const displayTitle = getJobDisplayTitle(job)
  const internalTitle = getJobInternalTitle(job)
  const location = formatLocation(job)
  const salary = formatSalary(job)
  const daysLeft = job.endDate ? getDaysUntilDeadline(job.endDate) : null

  return (
    <Card
      className={cn(
        'border-0 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer group relative overflow-hidden',
        job.featured &&
          'ring-2 ring-blue-200 bg-gradient-to-br from-blue-50/50 to-white'
      )}
    >
      {job.featured && (
        <div className='absolute top-0 right-0 bg-gradient-to-l from-blue-600 to-blue-500 text-white px-3 py-1 text-xs font-medium'>
          <Star className='w-3 h-3 inline mr-1' />
          Featured
        </div>
      )}

      <CardHeader className='pb-4'>
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <div className='flex items-center gap-2 mb-2'>
              {/* <Badge
                className={cn('text-xs border', getStatusColor(job.status))}
              >
                {getStatusIcon(job.status)}
                <span className='ml-1 capitalize'>{job.status}</span>
              </Badge> */}
              <Badge
                className={cn(
                  'text-xs border',
                  getPriorityColor(job.jobStatus || job.priority || 'medium')
                )}
              >
                <span className='capitalize'>
                  {job.jobStatus || job.priority || 'medium'} Priority
                </span>
              </Badge>
            </div>

            <h3 className='font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1'>
              {displayTitle}
            </h3>

            {internalTitle !== displayTitle && (
              <p className='text-sm text-gray-500 mb-2'>
                Internal: {internalTitle}
              </p>
            )}

            <div className='flex items-center text-sm text-gray-600'>
              <Building className='w-4 h-4 mr-1' />
              {job.company || job.department}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                className='opacity-0 group-hover:opacity-100 transition-opacity'
              >
                <MoreVertical className='w-4 h-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuCheckboxItem onClick={() => onEdit?.(job)}>
                <Edit className='w-4 h-4 mr-2' />
                Edit Job
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem onClick={() => onDuplicate?.(job)}>
                <Copy className='w-4 h-4 mr-2' />
                Duplicate
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem onClick={() => onArchive?.(job)}>
                <Archive className='w-4 h-4 mr-2' />
                Archive
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                className='text-red-600'
                onClick={() => onDelete?.(job)}
              >
                <Trash2 className='w-4 h-4 mr-2' />
                Delete
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className='pt-0'>
        <div className='space-y-4'>
          {/* Location and Workplace Type */}
          <div className='flex items-center justify-between text-sm'>
            <div className='flex items-center text-gray-600'>
              <MapPin className='w-4 h-4 mr-1' />
              {location}
            </div>
            <div className='flex items-center gap-2'>
              <Badge
                className={cn(
                  'text-xs border',
                  getWorkplaceTypeColor(job.workplaceType || 'onsite')
                )}
              >
                {getWorkplaceTypeLabel(job.workplaceType || 'onsite')}
              </Badge>
            </div>
          </div>

          {/* Employment Type and Pay */}
          <div className='flex items-center justify-between text-sm'>
            <Badge variant='outline' className='text-xs'>
              {getEmploymentTypeLabel(
                job.employmentType || job.type || 'full-time'
              )}
            </Badge>
            <div className='flex items-center text-green-600'>
              <DollarSign className='w-4 h-4 mr-1' />
              <span className='font-medium'>{salary}</span>
            </div>
          </div>

          {/* Pay Type and Positions */}
          <div className='flex items-center justify-between text-sm'>
            <Badge
              className={cn(
                'text-xs border',
                getPayTypeColor(job.payType || 'salary')
              )}
            >
              {getPayTypeLabel(job.payType || 'salary')}
            </Badge>
            <div className='flex items-center text-gray-600'>
              <Briefcase className='w-4 h-4 mr-1' />
              <span>
                {job.positionsToHire || 1} position
                {(job.positionsToHire || 1) > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Education and Department */}
          <div className='flex items-center justify-between text-sm text-gray-600'>
            <div className='flex items-center'>
              <GraduationCap className='w-4 h-4 mr-1' />
              <span className='text-xs'>
                {job.educationRequirement || 'Not specified'}
              </span>
            </div>
            <span className='text-xs'>{job.department}</span>
          </div>

          {/* Requirements Preview */}
          {job.jobRequirements && job.jobRequirements.length > 0 && (
            <div className='flex flex-wrap gap-1'>
              {job.jobRequirements.slice(0, 2).map((req, index) => (
                <Badge key={index} variant='secondary' className='text-xs'>
                  {req.length > 20 ? req.substring(0, 20) + '...' : req}
                </Badge>
              ))}
              {job.jobRequirements.length > 2 && (
                <Badge variant='secondary' className='text-xs'>
                  +{job.jobRequirements.length - 2} more
                </Badge>
              )}
            </div>
          )}

          {/* Stats */}
          <div className='grid grid-cols-3 gap-4 pt-4 border-t border-gray-100'>
            <div className='text-center'>
              <div className='flex items-center justify-center text-blue-600 mb-1'>
                <Users className='w-4 h-4 mr-1' />
                <span className='font-semibold'>{job.applicants}</span>
              </div>
              <p className='text-xs text-gray-500'>Applicants</p>
            </div>
            <div className='text-center'>
              <div className='flex items-center justify-center text-green-600 mb-1'>
                <Target className='w-4 h-4 mr-1' />
                <span className='font-semibold'>{job.matches}</span>
              </div>
              <p className='text-xs text-gray-500'>Matches</p>
            </div>
            <div className='text-center'>
              <div className='flex items-center justify-center text-purple-600 mb-1'>
                <Eye className='w-4 h-4 mr-1' />
                <span className='font-semibold'>{job.views}</span>
              </div>
              <p className='text-xs text-gray-500'>Views</p>
            </div>
          </div>

          {/* Deadline and Notifications */}
          <div className='flex items-center justify-between text-xs text-gray-500 pt-2'>
            <div className='flex items-center'>
              <Calendar className='w-3 h-3 mr-1' />
              Created {formatDate(job.createdAt)}
            </div>
            <div className='flex items-center'>
              {daysLeft !== null && (
                <>
                  <Clock className='w-3 h-3 mr-1' />
                  <span
                    className={cn(
                      daysLeft <= 7 && daysLeft > 0 && 'text-orange-600',
                      daysLeft <= 0 && 'text-red-600'
                    )}
                  >
                    {daysLeft > 0
                      ? `${daysLeft} days left`
                      : daysLeft === 0
                      ? 'Expires today'
                      : 'Expired'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Notifications Status */}
          {(job.notifyOnApplication?.enabled || job.dailyRoundup?.enabled) && (
            <div className='flex items-center gap-2 pt-2 border-t border-gray-100'>
              {job.notifyOnApplication?.enabled && (
                <Badge variant='outline' className='text-xs'>
                  <AlertCircle className='w-3 h-3 mr-1' />
                  Instant Alerts
                </Badge>
              )}
              {job.dailyRoundup?.enabled && (
                <Badge variant='outline' className='text-xs'>
                  <Clock className='w-3 h-3 mr-1' />
                  Daily Roundup
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
