'use client'

import { InputField } from '@/components/common/InputField'
import { TiptapEditor } from '@/components/common/TiptapEditor'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle, Info } from 'lucide-react'
import { useFormContext } from 'react-hook-form'

export function JobAdStep() {
  const { watch, setValue, formState } = useFormContext()
  const { errors } = formState
  const jobTitle = watch('jobTitle') || ''
  const jobBoardTitle = watch('jobBoardTitle') || ''
  const jobDescription = watch('jobDescription') || ''
  const backgroundScreeningDisclaimer = watch('backgroundScreeningDisclaimer')

  const getTitleValidation = (title: string, isMobile = false) => {
    const maxLength = isMobile ? 35 : 60
    const length = title.length

    // Show validation error if it exists in the form state
    if (errors.jobTitle && !isMobile) {
      return { status: 'error', message: 'Job title is required' }
    }

    if (errors.jobBoardTitle && isMobile) {
      return { status: 'error', message: 'Job board title is required' }
    }

    if (length === 0) return { status: 'neutral', message: 'Enter a job title' }
    if (length > maxLength)
      return { status: 'error', message: `Too long (${length}/${maxLength})` }
    if (length <= maxLength * 0.8)
      return {
        status: 'success',
        message: `Good length (${length}/${maxLength})`,
      }
    return {
      status: 'warning',
      message: `Getting long (${length}/${maxLength})`,
    }
  }

  const getDescriptionValidation = (description: string) => {
    // Create a temporary div to parse HTML and get text content
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = description
    const textContent = tempDiv.textContent || ''
    const length = textContent.length

    // Show validation error if it exists in the form state
    if (errors.jobDescription) {
      return {
        status: 'error',
        message:
          errors.jobDescription.message?.toString() ||
          `Invalid description (${length}/700-3500)`,
      }
    }

    if (length === 0)
      return { status: 'neutral', message: 'Enter a job description' }
    if (length < 700)
      return { status: 'warning', message: `Too short (${length}/700-3500)` }
    if (length > 3500)
      return { status: 'error', message: `Too long (${length}/700-3500)` }
    return {
      status: 'success',
      message: `Optimal length (${length}/700-3500)`,
    }
  }

  const titleValidation = getTitleValidation(jobTitle)
  const boardTitleValidation = getTitleValidation(jobBoardTitle)
  const mobileValidation = getTitleValidation(jobBoardTitle, true)
  const descriptionValidation = getDescriptionValidation(jobDescription)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className='w-4 h-4 text-green-600' />
      case 'warning':
        return <AlertCircle className='w-4 h-4 text-yellow-600' />
      case 'error':
        return <AlertCircle className='w-4 h-4 text-red-600' />
      default:
        return <Info className='w-4 h-4 text-gray-400' />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600'
      case 'warning':
        return 'text-yellow-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <div className='space-y-8'>
      <div>
        <h2 className='text-2xl font-bold text-gray-900'>Job Advertisement</h2>
        <p className='text-gray-600 mt-1'>
          Create compelling job posting content that attracts the right
          candidates
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Main Form */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Internal Job Title */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Internal Job Title</CardTitle>
              <p className='text-sm text-gray-600'>
                For internal use - include location, department, or other
                identifiers <span className='text-red-500'>*</span>
              </p>
            </CardHeader>
            <CardContent>
              <div className='space-y-1'>
                <InputField
                  name='jobTitle'
                  placeholder='e.g., Senior Frontend Developer - SF Office'
                />
                <div className='flex items-center gap-2 text-sm'>
                  {getStatusIcon(titleValidation.status)}
                  <span className={getStatusColor(titleValidation.status)}>
                    {titleValidation.message}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* External Job Board Title */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Job Board Title</CardTitle>
              <p className='text-sm text-gray-600'>
                Public-facing title that appears on job boards{' '}
                <span className='text-red-500'>*</span>
              </p>
            </CardHeader>
            <CardContent>
              <div className='space-y-1'>
                <InputField
                  name='jobBoardTitle'
                  placeholder='e.g., Senior Frontend Developer'
                />
                <div className='space-y-2'>
                  <div className='hidden items-center gap-2 text-sm md:flex'>
                    {getStatusIcon(boardTitleValidation.status)}
                    <span
                      className={getStatusColor(boardTitleValidation.status)}
                    >
                      Desktop: {boardTitleValidation.message}
                    </span>
                  </div>
                  <div className='flex items-center gap-2 text-sm md:hidden'>
                    {getStatusIcon(mobileValidation.status)}
                    <span className={getStatusColor(mobileValidation.status)}>
                      Mobile: {mobileValidation.message}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Job Description</CardTitle>
              <p className='text-sm text-gray-600'>
                Detailed description of the role and requirements
              </p>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <TiptapEditor
                  name='jobDescription'
                  placeholder='Describe the role, responsibilities, work culture, benefits, growth opportunities, and hiring process expectations...'
                  validation={descriptionValidation}
                  minHeight={400}
                />
              </div>
            </CardContent>
          </Card>

          {/* Background Screening Disclaimer */}
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-start space-x-3'>
                <Checkbox
                  id='backgroundScreeningDisclaimer'
                  checked={backgroundScreeningDisclaimer}
                  onCheckedChange={(checked) =>
                    setValue('backgroundScreeningDisclaimer', checked)
                  }
                />
                <div className='space-y-1'>
                  <Label
                    htmlFor='backgroundScreeningDisclaimer'
                    className='text-sm font-medium'
                  >
                    Include Background & Drug Screening Disclaimer
                  </Label>
                  <p className='text-xs text-gray-600'>
                    Some job boards require this disclaimer to be included in
                    job postings
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Guidelines Sidebar */}
        <div className='space-y-6'>
          <Card className='bg-blue-50 border-blue-200'>
            <CardHeader>
              <CardTitle className='text-lg text-blue-900'>
                Job Title Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm'>
              <div className='space-y-2'>
                <h4 className='font-medium text-blue-900'>Best Practices:</h4>
                <ul className='space-y-1 text-blue-800'>
                  <li>• Keep titles short and simple</li>
                  <li>• Desktop: 60 characters or less</li>
                  <li>• Mobile: 35 characters or less</li>
                  <li>• Avoid internal jargon</li>
                  <li>• No emojis or unnecessary symbols</li>
                  <li>• Avoid clickbait and keyword stuffing</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-green-50 border-green-200'>
            <CardHeader>
              <CardTitle className='text-lg text-green-900'>
                Description Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm'>
              <div className='space-y-2'>
                <h4 className='font-medium text-green-900'>Optimal Length:</h4>
                <p className='text-green-800'>
                  700-2000 characters perform best on Indeed
                </p>
              </div>
              <div className='space-y-2'>
                <h4 className='font-medium text-green-900'>Include:</h4>
                <ul className='space-y-1 text-green-800'>
                  <li>• Work culture</li>
                  <li>• Benefits and perks</li>
                  <li>• Growth opportunities</li>
                  <li>• Hiring process expectations</li>
                </ul>
              </div>
              <div className='space-y-2'>
                <h4 className='font-medium text-green-900'>Avoid:</h4>
                <ul className='space-y-1 text-green-800'>
                  <li>• Unnecessary links</li>
                  <li>• Survey links</li>
                  <li>• External redirects</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Character Counters */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Character Counts</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span>Internal Title:</span>
                  <Badge
                    variant={
                      titleValidation.status === 'success'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {jobTitle.length}
                  </Badge>
                </div>
                <div className='flex justify-between text-sm'>
                  <span>Board Title:</span>
                  <Badge
                    variant={
                      boardTitleValidation.status === 'success'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {jobBoardTitle.length}
                  </Badge>
                </div>
                <div className='flex justify-between text-sm'>
                  <span>Description:</span>
                  <Badge
                    variant={
                      descriptionValidation.status === 'success'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {/* Calculate text content length without HTML tags */}
                    {(() => {
                      const tempDiv = document.createElement('div')
                      tempDiv.innerHTML = jobDescription
                      return tempDiv.textContent?.length || 0
                    })()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
