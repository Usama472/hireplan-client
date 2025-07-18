'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { JobCreationData } from '@/interfaces'
import {
  AlertTriangle,
  Building,
  Calendar,
  CheckCircle,
  DollarSign,
  Eye,
  MapPin,
} from 'lucide-react'
import { useFormContext } from 'react-hook-form'

export function ReviewPublishStep() {
  const { watch } = useFormContext<JobCreationData>()
  const formData = watch()

  const getValidationStatus = () => {
    const issues = []
    const warnings = []

    // Required field checks
    if (!formData.jobTitle) issues.push('Internal job title is required')
    if (!formData.jobBoardTitle) issues.push('Job board title is required')
    if (!formData.jobDescription) issues.push('Job description is required')
    if (!formData.jobLocation?.city) issues.push('Job location is required')
    if (!formData.payRate?.amount && !formData.payRate?.min)
      issues.push('Pay rate is required')

    // Content quality checks
    if (formData.jobBoardTitle && formData.jobBoardTitle.length > 60) {
      warnings.push('Job board title is longer than recommended (60 chars)')
    }
    if (
      formData.jobDescription &&
      (formData.jobDescription.length < 700 ||
        formData.jobDescription.length > 2000)
    ) {
      warnings.push(
        'Job description length is outside optimal range (700-2000 chars)'
      )
    }

    return { issues, warnings }
  }

  const { issues, warnings } = getValidationStatus()
  const canPublish = issues.length === 0

  const formatPayRate = () => {
    if (!formData.payRate) return 'Not specified'

    if (formData.payRate.type === 'fixed') {
      return `$${formData.payRate.amount} ${
        formData.payType === 'hourly' ? '/hour' : '/year'
      }`
    } else {
      return `$${formData.payRate.min} - $${formData.payRate.max} ${
        formData.payType === 'hourly' ? '/hour' : '/year'
      }`
    }
  }

  return (
    <div className='space-y-8'>
      <div>
        <h2 className='text-2xl font-bold text-gray-900'>Review & Publish</h2>
        <p className='text-gray-600 mt-1'>
          Review your job posting before publishing
        </p>
      </div>

      {/* Validation Status */}
      <Card
        className={`border-2 ${
          canPublish
            ? 'border-green-200 bg-green-50'
            : 'border-red-200 bg-red-50'
        }`}
      >
        <CardContent className='p-4'>
          <div className='flex items-center gap-3'>
            {canPublish ? (
              <CheckCircle className='w-6 h-6 text-green-600' />
            ) : (
              <AlertTriangle className='w-6 h-6 text-red-600' />
            )}
            <div>
              <h3
                className={`font-semibold ${
                  canPublish ? 'text-green-900' : 'text-red-900'
                }`}
              >
                {canPublish ? 'Ready to Publish' : 'Issues Found'}
              </h3>
              <p
                className={`text-sm ${
                  canPublish ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {canPublish
                  ? 'Your job posting meets all requirements and is ready to publish'
                  : `${issues.length} issue${
                      issues.length > 1 ? 's' : ''
                    } must be resolved before publishing`}
              </p>
            </div>
          </div>

          {issues.length > 0 && (
            <div className='mt-4 space-y-1'>
              <h4 className='font-medium text-red-900'>Issues to resolve:</h4>
              <ul className='text-sm text-red-700 space-y-1'>
                {issues.map((issue, index) => (
                  <li key={index}>• {issue}</li>
                ))}
              </ul>
            </div>
          )}

          {warnings.length > 0 && (
            <div className='mt-4 space-y-1'>
              <h4 className='font-medium text-yellow-900'>Recommendations:</h4>
              <ul className='text-sm text-yellow-700 space-y-1'>
                {warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Job Preview */}
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Eye className='w-5 h-5' />
                Job Posting Preview
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <h3 className='text-xl font-bold text-gray-900'>
                  {formData.jobBoardTitle || 'Job Title'}
                </h3>
                <div className='flex items-center gap-4 text-sm text-gray-600 mt-2'>
                  <div className='flex items-center gap-1'>
                    <Building className='w-4 h-4' />
                    <span>Your Company</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <MapPin className='w-4 h-4' />
                    <span>
                      {formData.jobLocation?.city},{' '}
                      {formData.jobLocation?.state}
                    </span>
                  </div>
                </div>
              </div>

              <div className='flex flex-wrap gap-2'>
                <Badge variant='outline'>
                  {formData.employmentType?.replace('-', ' ')}
                </Badge>
                <Badge variant='outline'>{formData.workplaceType}</Badge>
                {formData.jobStatus && (
                  <Badge variant='outline' className='capitalize'>
                    {formData.jobStatus} Priority
                  </Badge>
                )}
              </div>

              <div className='flex items-center gap-1 text-green-600'>
                <DollarSign className='w-4 h-4' />
                <span className='font-medium'>{formatPayRate()}</span>
              </div>

              <div className='prose prose-sm max-w-none'>
                <p className='text-gray-700 whitespace-pre-wrap'>
                  {formData.jobDescription ||
                    'Job description will appear here...'}
                </p>
              </div>

              {formData.jobRequirements &&
                formData.jobRequirements.length > 0 && (
                  <div>
                    <h4 className='font-medium text-gray-900 mb-2'>
                      Requirements:
                    </h4>
                    <ul className='text-sm text-gray-700 space-y-1'>
                      {formData.jobRequirements.map((req, index) => (
                        <li key={index}>• {req}</li>
                      ))}
                    </ul>
                  </div>
                )}
            </CardContent>
          </Card>
        </div>

        {/* Job Details Summary */}
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Job Details Summary</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <span className='text-gray-600'>Internal Title:</span>
                  <p className='font-medium'>
                    {formData.jobTitle || 'Not set'}
                  </p>
                </div>
                <div>
                  <span className='text-gray-600'>Department:</span>
                  <p className='font-medium'>
                    {formData.department || 'Not set'}
                  </p>
                </div>
                <div>
                  <span className='text-gray-600'>Employment Type:</span>
                  <p className='font-medium capitalize'>
                    {formData.employmentType?.replace('-', ' ') || 'Not set'}
                  </p>
                </div>
                <div>
                  <span className='text-gray-600'>Workplace:</span>
                  <p className='font-medium capitalize'>
                    {formData.workplaceType || 'Not set'}
                  </p>
                </div>
                <div>
                  <span className='text-gray-600'>Education:</span>
                  <p className='font-medium'>
                    {formData.educationRequirement || 'Not set'}
                  </p>
                </div>
                <div>
                  <span className='text-gray-600'>Positions:</span>
                  <p className='font-medium'>{formData.positionsToHire || 1}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Calendar className='w-5 h-5' />
                Schedule & Settings
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Start Date:</span>
                <span className='font-medium'>
                  {formData.startDate || 'Not set'}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>End Date:</span>
                <span className='font-medium'>
                  {formData.endDate || 'Not set'}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>
                  Application Notifications:
                </span>
                <Badge
                  variant={
                    formData.notifyOnApplication?.enabled
                      ? 'default'
                      : 'secondary'
                  }
                >
                  {formData.notifyOnApplication?.enabled
                    ? 'Enabled'
                    : 'Disabled'}
                </Badge>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Daily Roundup:</span>
                <Badge
                  variant={
                    formData.dailyRoundup?.enabled ? 'default' : 'secondary'
                  }
                >
                  {formData.dailyRoundup?.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content Statistics</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Job Board Title:</span>
                <Badge variant='outline'>
                  {formData.jobBoardTitle?.length || 0} chars
                </Badge>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Description:</span>
                <Badge variant='outline'>
                  {formData.jobDescription?.length || 0} chars
                </Badge>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-600'>Requirements:</span>
                <Badge variant='outline'>
                  {formData.jobRequirements?.length || 0} items
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      {/* <div className='flex justify-between items-center pt-6 border-t'>
        <Button variant='outline'>Save as Draft</Button>
        <div className='flex gap-3'>
          <Button variant='outline'>Preview on Job Board</Button>
          <Button
            disabled={!canPublish}
            className='bg-blue-600 hover:bg-blue-700'
          >
            {canPublish ? 'Publish Job' : 'Resolve Issues to Publish'}
          </Button>
        </div>
      </div> */}
    </div>
  )
}
