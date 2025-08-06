import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { JobFormData } from '@/interfaces'
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useState } from 'react'

interface JobAdReviewProps {
  formData: JobFormData
}

export function JobAdReview({ formData }: JobAdReviewProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

  const getDescriptionPreview = (description: string) => {
    if (!description) return 'No description provided'
    return description
  }

  const getTitleStatus = (title: string) => {
    if (!title) return { status: 'error', message: 'Missing' }
    if (title.length > 60) return { status: 'warning', message: 'Too long' }
    return { status: 'success', message: 'Good length' }
  }

  const getDescriptionStatus = (description: string) => {
    if (!description) return { status: 'error', message: 'Missing' }
    if (description.length < 100)
      return { status: 'warning', message: 'Too short' }
    if (description.length > 3500)
      return { status: 'warning', message: 'Too long' }
    return { status: 'success', message: 'Good length' }
  }

  const titleStatus = getTitleStatus(formData.jobBoardTitle || '')
  const descriptionStatus = getDescriptionStatus(formData.jobDescription || '')
  const description = getDescriptionPreview(formData.jobDescription || '')
  const shouldShowReadMore = description.length > 300
  const displayText = isDescriptionExpanded
    ? description
    : description.substring(0, 300) + (shouldShowReadMore ? '...' : '')

  return (
    <div className='space-y-6'>
      {/* Job Titles */}
      <Card className='border-gray-200 shadow-sm'>
        <CardContent className='p-6'>
          <div className='space-y-6'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <label className='text-sm font-semibold text-gray-700'>
                    Internal Title
                  </label>
                  <Badge
                    variant={formData.jobTitle ? 'default' : 'destructive'}
                  >
                    {formData.jobTitle ? 'Set' : 'Missing'}
                  </Badge>
                </div>
                <div className='p-4 bg-gray-50 rounded-lg border border-gray-200'>
                  <p className='text-gray-900 font-medium'>
                    {formData.jobTitle || 'Not provided'}
                  </p>
                </div>
              </div>

              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <label className='text-sm font-semibold text-gray-700'>
                    Job Board Title
                  </label>
                  <Badge
                    variant={
                      titleStatus.status === 'error'
                        ? 'destructive'
                        : titleStatus.status === 'warning'
                        ? 'secondary'
                        : 'default'
                    }
                  >
                    {titleStatus.message}
                  </Badge>
                </div>
                <div className='p-4 bg-gray-50 rounded-lg border border-gray-200'>
                  <p className='text-gray-900 font-medium'>
                    {formData.jobBoardTitle || 'Not provided'}
                  </p>
                  {formData.jobBoardTitle && (
                    <p className='text-xs text-gray-500 mt-2'>
                      {formData.jobBoardTitle.length}/60 characters
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Description */}
      <Card className='border-gray-200 shadow-sm'>
        <CardContent className='p-6'>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <label className='text-sm font-semibold text-gray-700'>
                Description Preview
              </label>
              <Badge
                variant={
                  descriptionStatus.status === 'error'
                    ? 'destructive'
                    : descriptionStatus.status === 'warning'
                    ? 'secondary'
                    : 'default'
                }
              >
                {descriptionStatus.message}
              </Badge>
            </div>

            <div className='relative'>
              <div className='p-6 bg-gray-50 rounded-lg border border-gray-200'>
                <div className='prose prose-sm max-w-none'>
                  <div
                    className='text-gray-900 leading-relaxed whitespace-pre-wrap'
                    dangerouslySetInnerHTML={{ __html: displayText }}
                  />
                </div>
                {shouldShowReadMore && (
                  <div className='mt-4 pt-4 border-t border-gray-200'>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setIsDescriptionExpanded(!isDescriptionExpanded)
                      }}
                      className='text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                    >
                      {isDescriptionExpanded ? (
                        <>
                          <ChevronUp className='h-4 w-4 mr-1' />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className='h-4 w-4 mr-1' />
                          Read More
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
              {formData.jobDescription && (
                <div className='flex items-center justify-between mt-3 text-xs text-gray-500'>
                  <span>
                    Character count: {formData.jobDescription.length}/2000
                  </span>
                  <span>
                    Word count:{' '}
                    {
                      formData.jobDescription.split(/\s+/).filter(Boolean)
                        .length
                    }
                  </span>
                </div>
              )}
            </div>

            {formData.jobDescription &&
              formData.jobDescription.length < 100 && (
                <div className='flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
                  <AlertTriangle className='h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0' />
                  <div>
                    <p className='text-sm font-medium text-yellow-800'>
                      Consider adding more detail
                    </p>
                    <p className='text-xs text-yellow-700 mt-1'>
                      Longer job descriptions (100+ characters) typically
                      receive better candidate engagement and more qualified
                      applications.
                    </p>
                  </div>
                </div>
              )}
          </div>
        </CardContent>
      </Card>

      {/* Background Screening */}
      {formData.backgroundScreeningDisclaimer && (
        <Card className='border-gray-200 shadow-sm'>
          <CardContent className='p-6'>
            <div className='flex items-start gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg'>
              <CheckCircle className='h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0' />
              <div>
                <p className='text-sm font-medium text-purple-800'>
                  Background screening disclaimer enabled
                </p>
                <p className='text-xs text-purple-700 mt-1'>
                  A background screening disclaimer will be included in the job
                  posting to inform candidates about the screening process.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
