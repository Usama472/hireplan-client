import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import API from '@/http'
import type { ICity, IState } from 'country-state-city'
import { City, State } from 'country-state-city'
import {
  Briefcase,
  Building,
  Calendar,
  CheckCircle,
  ChevronLeft,
  DollarSign,
  FileText,
  MapPin,
  Upload,
  User,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
// Temporary interface until it's properly exported from @/interfaces
interface Job {
  jobId: string
  jobTitle: string
  jobBoardTitle: string
  jobDescription: string
  jobLocation?: {
    city: string
    state: string
  }
  employmentType: string
  workplaceType: string
  endDate?: string
  payRate?: {
    type: 'fixed' | 'range'
    amount?: number
    min?: number
    max?: number
  }
  payType?:
    | 'hourly'
    | 'salary'
    | 'base-commission'
    | 'base-tips'
    | 'base-bonus'
    | 'commission-only'
  jobRequirements?: string[]
  externalApplicationSetup?: {
    customFields?: string[]
  }
  customQuestions?: CustomQuestion[]
}

interface CustomField {
  field: string
  value: string
  required: boolean
}

interface CustomQuestion {
  id: string
  question: string
  type: 'boolean' | 'select' | 'string'
  required: boolean
  options: string[]
  placeholder?: string
}

interface CustomQuestionAnswer {
  questionId: string
  answer: string | boolean
}

interface JobApplicationFormData {
  firstName: string
  lastName: string
  city: string
  state: string
  currentSalary: string
  expectedSalary: string
  experienceYears: string
  currentJobTitle: string
  availabilityDate: string
  resume: File | null
  email: string
  phone: string
  customFields: CustomField[]
  customQuestionAnswers: CustomQuestionAnswer[]
}

const JobApplicationPage: React.FC = () => {
  const { slug, jobId } = useParams<{ slug: string; jobId: string }>()
  const navigate = useNavigate()

  const [job, setJob] = useState<Job | null>(null)
  const [companyName, setCompanyName] = useState<string>('')
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [resumeName, setResumeName] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [usStates, setUSStates] = useState<IState[]>([])
  const [stateCities, setStateCities] = useState<ICity[]>([])
  const [selectedState, setSelectedState] = useState<string>('')
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [isDescriptionExpanded, setIsDescriptionExpanded] =
    useState<boolean>(false)
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([])

  const [formData, setFormData] = useState<JobApplicationFormData>({
    firstName: '',
    lastName: '',
    city: '',
    state: '',
    currentSalary: '',
    expectedSalary: '',
    experienceYears: '',
    currentJobTitle: '',
    availabilityDate: '',
    resume: null,
    email: '',
    phone: '',
    customFields: [],
    customQuestionAnswers: [],
  })

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        setLoading(true)
        if (!slug || !jobId) {
          setError('Invalid job information')
          return
        }

        const company = await API.company.getPublicCompany(slug)
        if (!company) {
          setError('Company not found')
          return
        }

        setCompanyName(company.companyName || '')
        setCompanyLogo(company.logoUrl || null)

        const { job } = await API.job.getPublicJobDetails(jobId)

        if (!job) {
          setError('Job not found')
          return
        }

        setJob(job)

        // Initialize custom fields from job data as optional
        if (job.externalApplicationSetup?.customFields?.length > 0) {
          const initialCustomFields =
            job.externalApplicationSetup.customFields.map((field: string) => ({
              field,
              value: '',
              required: false,
            }))
          setFormData((prev) => ({
            ...prev,
            customFields: initialCustomFields,
          }))
        }

        // Handle custom questions if present
        if (job.customQuestions?.length > 0) {
          setCustomQuestions(job.customQuestions)

          // Initialize answers for custom questions
          const initialAnswers = job.customQuestions.map(
            (question: CustomQuestion) => ({
              questionId: question.id,
              answer: question.type === 'boolean' ? false : '',
            })
          )

          setFormData((prev) => ({
            ...prev,
            customQuestionAnswers: initialAnswers,
          }))
        }
      } catch (err) {
        console.error('Error fetching job data:', err)
        setError('Failed to load job details')
      } finally {
        setLoading(false)
      }
    }

    fetchJobData()

    const states = State.getStatesOfCountry('US')
    setUSStates(states)
  }, [slug, jobId])

  const handleStateChange = (value: string) => {
    setSelectedState(value)

    const cities = City.getCitiesOfState('US', value)
    setStateCities(cities)

    const stateName = usStates.find((state) => state.isoCode === value)?.name
    if (stateName) {
      setFormData((prev) => ({
        ...prev,
        state: stateName,
        city: '',
      }))
      setSelectedCity('')
    }
  }

  const handleCityChange = (value: string) => {
    setSelectedCity(value)
    setFormData((prev) => ({
      ...prev,
      city: value,
    }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCustomFieldChange = (index: number, value: string) => {
    setFormData((prev) => {
      const updatedFields = [...prev.customFields]
      updatedFields[index] = {
        ...updatedFields[index],
        value,
      }
      return {
        ...prev,
        customFields: updatedFields,
      }
    })
  }

  const handleCustomQuestionChange = (
    questionId: string,
    answer: string | boolean
  ) => {
    setFormData((prev) => {
      const updatedAnswers = prev.customQuestionAnswers.map((item) =>
        item.questionId === questionId ? { ...item, answer } : item
      )
      return {
        ...prev,
        customQuestionAnswers: updatedAnswers,
      }
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        resume: file,
      }))
      setResumeName(file.name)
    }
  }

  const formatJobDescription = (text: string) => {
    return (
      text
        // Replace line breaks with HTML breaks
        .replace(/\n/g, '<br>')
        // Format section headers
        .replace(
          /(Key Responsibilities:|Requirements:|Benefits:|What We Offer:|Qualifications:)/gi,
          '<br><strong>$1</strong><br>'
        )
        // Format bullet points
        .replace(/•\s*/g, '<br>• ')
        // Remove multiple consecutive breaks
        .replace(/(<br>\s*){3,}/g, '<br><br>')
        // Clean up leading breaks
        .replace(/^(<br>\s*)+/, '')
        // Add proper spacing after periods that end sentences
        .replace(/\.\s+([A-Z])/g, '.<br><br>$1')
        // Clean up any remaining issues
        .trim()
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!job) {
      setError('Job information is missing')
      return
    }

    const requiredFields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'state',
      'city',
      'currentJobTitle',
      'experienceYears',
      'expectedSalary',
      'availabilityDate',
    ]

    const missingFields = requiredFields.filter(
      (field) => !formData[field as keyof JobApplicationFormData]
    )

    if (missingFields.length > 0) {
      setError(
        `Please fill in all required fields: ${missingFields.join(', ')}`
      )
      return
    }

    if (!formData.resume) {
      setError('Please upload your resume')
      return
    }

    // Validate required custom questions
    const missingRequiredQuestions = customQuestions
      .filter((q) => q.required)
      .filter((q) => {
        const answer = formData.customQuestionAnswers.find(
          (a) => a.questionId === q.id
        )?.answer
        // Check if answer is empty string or undefined
        if (typeof answer === 'string') {
          return answer.trim() === ''
        }
        return answer === undefined
      })
      .map((q) => q.question)

    if (missingRequiredQuestions.length > 0) {
      setError(
        `Please answer all required questions: ${missingRequiredQuestions.join(
          ', '
        )}`
      )
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const filteredCustomFields = formData.customFields.filter(
        (field) => field.value.trim() !== ''
      )

      const resumeUrl = await API.attachment.uploadAttachment(formData.resume)

      // Filter out any empty custom question answers (for non-required fields)
      const filteredCustomQuestionAnswers =
        formData.customQuestionAnswers.filter((answer) => {
          if (typeof answer.answer === 'string') {
            return answer.answer.trim() !== ''
          }
          return answer.answer !== undefined
        })

      const applicantPayload = {
        ...formData,
        customFields: filteredCustomFields,
        customQuestionAnswers: filteredCustomQuestionAnswers,
        jobId,
        companyName,
        jobTitle: job.jobTitle,
        resume: resumeUrl,
      }

      await API.applicant.applyJob(applicantPayload)

      setSuccessMessage(
        `Your application for ${job.jobBoardTitle} has been successfully submitted.`
      )

      setTimeout(() => {
        navigate(`/company/${slug}`)
      }, 3000)
    } catch (err) {
      console.error('Error submitting application:', err)
      setError('Failed to submit application. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50'>
        <div className='animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500'></div>
        <p className='mt-4 text-gray-600 text-sm'>Loading job details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4'>
        <div className='bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-md max-w-md w-full text-center shadow-sm'>
          <p className='text-base font-semibold mb-2'>Error</p>
          <p className='text-sm'>{error}</p>
          <Button
            className='mt-4 bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded'
            onClick={() => navigate(-1)}
            size='sm'
          >
            <ChevronLeft className='w-4 h-4 mr-1' />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  if (successMessage) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4'>
        <div className='bg-green-50 border border-green-200 text-green-700 px-6 py-8 rounded-md max-w-md w-full text-center shadow-sm'>
          <div className='flex justify-center mb-4'>
            <div className='h-12 w-12 rounded-full bg-green-100 flex items-center justify-center'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-6 w-6 text-green-600'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M5 13l4 4L19 7'
                />
              </svg>
            </div>
          </div>
          <p className='text-xl font-semibold mb-3'>Application Submitted!</p>
          <p className='mb-5 text-sm'>{successMessage}</p>
          <p className='text-xs text-gray-500 mb-4'>
            You will be redirected back to the company page shortly.
          </p>
          <Button
            className='bg-green-600 hover:bg-green-700 text-white text-sm'
            onClick={() => navigate(`/company/${slug}`)}
            size='sm'
          >
            Return to Company Page
          </Button>
        </div>
      </div>
    )
  }

  if (!job) {
    return null
  }

  const location = job.jobLocation
    ? `${job.jobLocation.city}, ${job.jobLocation.state}`
    : 'Location not specified'

  const formattedDate = job.endDate
    ? new Date(job.endDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-7'>
      {/* Back button and breadcrumbs */}
      <div className='container mx-auto px-4 max-w-7xl'>
        <div className='mb-6'>
          <Button
            variant='ghost'
            className='text-gray-600 hover:text-gray-800 text-sm flex items-center mb-2.5 transition-all hover:bg-gray-100'
            onClick={() => navigate(`/company/${slug}`)}
            size='sm'
          >
            <ChevronLeft className='h-4 w-4 mr-1' />
            Back to jobs
          </Button>
          <div className='flex text-xs text-gray-500 bg-white px-3 py-2 rounded shadow-sm'>
            <span>Companies</span>
            <span className='mx-2'>/</span>
            <span>{companyName}</span>
            <span className='mx-2'>/</span>
            <span className='text-blue-600 font-medium'>
              {job.jobBoardTitle}
            </span>
          </div>
        </div>

        {/* Two-column layout */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
          {/* Job Details Sidebar - Left Column */}
          <div className='lg:col-span-3 space-y-4'>
            {/* Header with company info */}
            <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-100 lg:sticky lg:top-6'>
              <div className='flex items-start'>
                <div className='flex-shrink-0 mr-3'>
                  {companyLogo ? (
                    <img
                      src={companyLogo}
                      alt={`${companyName} logo`}
                      className='h-12 w-12 object-contain rounded border border-gray-200 p-1 bg-white'
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23888'%3E%3Cpath d='M21 13v10h-6v-6h-6v6h-6v-10h-3l12-12 12 12h-3z'/%3E%3C/svg%3E"
                      }}
                    />
                  ) : (
                    <div className='h-12 w-12 flex items-center justify-center bg-blue-50 rounded border border-blue-100'>
                      <Building className='h-6 w-6 text-blue-400' />
                    </div>
                  )}
                </div>
                <div className='flex-1'>
                  <p className='text-xs font-medium text-blue-600 mb-0.5'>
                    {companyName}
                  </p>
                  <h1 className='text-base font-semibold text-gray-900 mb-2 leading-tight'>
                    {job.jobBoardTitle}
                  </h1>
                  <div className='flex flex-wrap gap-1.5 mt-1'>
                    <span className='inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-800 text-xs font-medium rounded-full border border-blue-100'>
                      {job.employmentType.replace('-', ' ')}
                    </span>
                    <span className='inline-flex items-center px-2 py-0.5 bg-green-50 text-green-800 text-xs font-medium rounded-full border border-green-100'>
                      {job.workplaceType}
                    </span>
                    {location && (
                      <span className='inline-flex items-center px-2 py-0.5 bg-gray-50 text-gray-800 text-xs font-medium rounded-full border border-gray-200'>
                        <MapPin className='h-3 w-3 mr-1' />
                        {location}
                      </span>
                    )}
                    {formattedDate && (
                      <span className='inline-flex items-center px-2 py-0.5 bg-amber-50 text-amber-800 text-xs font-medium rounded-full border border-amber-100'>
                        <Calendar className='h-3 w-3 mr-1' />
                        Apply by {formattedDate}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <Card className='p-3 shadow-md border border-gray-100 rounded-lg lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto'>
              <div className='border-b pb-1.5 mb-3'>
                <h3 className='text-xs font-medium text-gray-900 flex items-center gap-1.5'>
                  <Briefcase className='h-3 w-3 text-blue-600' />
                  Job Details
                </h3>
              </div>

              {/* Salary Information */}
              {job.payRate && (
                <div className='mb-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200'>
                  <h4 className='text-xs font-semibold text-gray-900 mb-2 flex items-center gap-1.5'>
                    <DollarSign className='h-3 w-3 text-blue-600' />
                    Compensation
                  </h4>
                  <div className='flex flex-col gap-0.5'>
                    <span className='text-lg font-bold text-blue-800'>
                      {job.payRate.type === 'fixed' && job.payRate.amount
                        ? `$${job.payRate.amount.toLocaleString()}`
                        : job.payRate.type === 'range' &&
                          job.payRate.min &&
                          job.payRate.max
                        ? `$${job.payRate.min.toLocaleString()} - $${job.payRate.max.toLocaleString()}`
                        : 'Competitive'}
                    </span>
                    <span className='text-xs font-medium text-blue-700'>
                      {job.payType === 'hourly'
                        ? 'per hour'
                        : job.payType === 'salary'
                        ? 'per year'
                        : job.payType === 'base-commission'
                        ? 'base + commission'
                        : job.payType === 'base-tips'
                        ? 'base + tips'
                        : job.payType === 'base-bonus'
                        ? 'base + bonus'
                        : job.payType === 'commission-only'
                        ? 'commission only'
                        : ''}
                    </span>
                  </div>
                </div>
              )}

              {/* Requirements - Made more prominent */}
              {job.jobRequirements && job.jobRequirements.length > 0 && (
                <div className='mb-3 p-3 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-slate-200'>
                  <h4 className='text-xs font-semibold text-gray-900 mb-2 flex items-center gap-1.5'>
                    <CheckCircle className='h-3 w-3 text-slate-600' />
                    Key Requirements
                  </h4>
                  <ul className='space-y-1'>
                    {job.jobRequirements
                      .slice(0, 5)
                      .map((req: string, index: number) => (
                        <li
                          key={index}
                          className='flex items-start gap-2 text-xs text-gray-700'
                        >
                          <span className='w-1 h-1 bg-slate-500 rounded-full mt-1.5 flex-shrink-0'></span>
                          <span>{req}</span>
                        </li>
                      ))}
                    {job.jobRequirements.length > 5 && (
                      <li className='text-xs text-gray-500 italic'>
                        +{job.jobRequirements.length - 5} more requirements
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Job Description - Compact */}
              <div className='mb-2'>
                <h4 className='text-xs font-semibold text-gray-900 mb-2 flex items-center gap-1.5'>
                  <FileText className='h-3 w-3 text-gray-600' />
                  About This Role
                </h4>
                <div
                  className='prose prose-xs max-w-none text-gray-600 space-y-2 [&>strong]:font-semibold [&>strong]:text-gray-800 [&>strong]:block [&>strong]:mt-3 [&>strong]:mb-1'
                  style={{
                    fontSize: '11px',
                    lineHeight: '1.5',
                  }}
                  dangerouslySetInnerHTML={{
                    __html:
                      !isDescriptionExpanded && job.jobDescription.length > 400
                        ? formatJobDescription(
                            job.jobDescription.substring(0, 400)
                          ) + '...'
                        : formatJobDescription(job.jobDescription),
                  }}
                />
                {job.jobDescription.length > 400 && (
                  <button
                    onClick={() =>
                      setIsDescriptionExpanded(!isDescriptionExpanded)
                    }
                    className='text-xs text-blue-600 hover:text-blue-800 mt-2 font-medium transition-colors'
                  >
                    {isDescriptionExpanded ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            </Card>
          </div>

          {/* Application Form - Right Column */}
          <div className='lg:col-span-9'>
            <Card className='shadow-md border-0 rounded-lg mb-7 overflow-hidden'>
              <div className='bg-blue-600 text-white px-5 py-3'>
                <h2 className='text-lg font-medium'>Application Form</h2>
                <p className='text-sm text-blue-100'>
                  Complete the form below to apply for this position
                </p>
              </div>

              <form onSubmit={handleSubmit} className='p-5 space-y-5'>
                {/* Personal Information */}
                <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 shadow-sm'>
                  <h3 className='text-base font-semibold text-gray-900 pb-2 mb-3 border-b border-blue-200 flex items-center'>
                    <span className='bg-blue-100 text-blue-800 w-7 h-7 rounded-full inline-flex items-center justify-center text-sm mr-3 shadow-sm'>
                      <User className='h-4 w-4' />
                    </span>
                    Personal Information
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div>
                      <Label
                        htmlFor='firstName'
                        className='text-sm font-medium text-gray-700 mb-1 flex items-center'
                      >
                        First Name{' '}
                        <span className='text-red-500 ml-0.5'>*</span>
                      </Label>
                      <Input
                        id='firstName'
                        name='firstName'
                        value={formData.firstName}
                        onChange={handleChange}
                        className='h-10 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all bg-white'
                        required
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor='lastName'
                        className='text-sm font-medium text-gray-700 mb-1 flex items-center'
                      >
                        Last Name <span className='text-red-500 ml-0.5'>*</span>
                      </Label>
                      <Input
                        id='lastName'
                        name='lastName'
                        value={formData.lastName}
                        onChange={handleChange}
                        className='h-10 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all bg-white'
                        required
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor='email'
                        className='text-sm font-medium text-gray-700 mb-1 flex items-center'
                      >
                        Email Address{' '}
                        <span className='text-red-500 ml-0.5'>*</span>
                      </Label>
                      <Input
                        id='email'
                        name='email'
                        type='email'
                        value={formData.email}
                        onChange={handleChange}
                        className='h-10 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all bg-white'
                        required
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor='phone'
                        className='text-sm font-medium text-gray-700 mb-1 flex items-center'
                      >
                        Phone Number{' '}
                        <span className='text-red-500 ml-0.5'>*</span>
                      </Label>
                      <Input
                        id='phone'
                        name='phone'
                        type='tel'
                        value={formData.phone}
                        onChange={handleChange}
                        className='h-10 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all bg-white'
                        required
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor='state'
                        className='text-sm font-medium text-gray-700 mb-1 flex items-center'
                      >
                        State <span className='text-red-500 ml-0.5'>*</span>
                      </Label>
                      <Select
                        value={selectedState}
                        onValueChange={handleStateChange}
                      >
                        <SelectTrigger
                          id='state'
                          className='h-10 text-sm bg-white focus:ring-blue-500 focus:border-blue-500 transition-all'
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className='max-h-[220px]'>
                          {usStates.map((state) => (
                            <SelectItem
                              key={state.isoCode}
                              value={state.isoCode}
                            >
                              {state.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label
                        htmlFor='city'
                        className='text-sm font-medium text-gray-700 mb-1 flex items-center'
                      >
                        City <span className='text-red-500 ml-0.5'>*</span>
                      </Label>
                      <Select
                        value={selectedCity}
                        onValueChange={handleCityChange}
                        disabled={!selectedState}
                      >
                        <SelectTrigger
                          id='city'
                          className='h-10 text-sm bg-white focus:ring-blue-500 focus:border-blue-500 transition-all'
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className='max-h-[220px]'>
                          {stateCities.map((city) => (
                            <SelectItem key={city.name} value={city.name}>
                              {city.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className='bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg p-4 border border-slate-200 shadow-sm'>
                  <h3 className='text-base font-semibold text-gray-900 pb-2 mb-3 border-b border-slate-200 flex items-center'>
                    <span className='bg-slate-100 text-slate-800 w-7 h-7 rounded-full inline-flex items-center justify-center text-sm mr-3 shadow-sm'>
                      <Briefcase className='h-4 w-4' />
                    </span>
                    Professional Information
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                    <div>
                      <Label
                        htmlFor='currentJobTitle'
                        className='text-sm font-medium text-gray-700 mb-1 flex items-center'
                      >
                        Current/Previous Job Title{' '}
                        <span className='text-red-500 ml-0.5'>*</span>
                      </Label>
                      <Input
                        id='currentJobTitle'
                        name='currentJobTitle'
                        value={formData.currentJobTitle}
                        onChange={handleChange}
                        className='h-10 text-sm rounded-md focus:ring-slate-500 focus:border-slate-500 transition-all bg-white'
                        required
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor='experienceYears'
                        className='text-sm font-medium text-gray-700 mb-1 flex items-center'
                      >
                        Years of Experience{' '}
                        <span className='text-red-500 ml-0.5'>*</span>
                      </Label>
                      <Input
                        id='experienceYears'
                        name='experienceYears'
                        type='text'
                        value={formData.experienceYears}
                        onChange={handleChange}
                        className='h-10 text-sm rounded-md focus:ring-slate-500 focus:border-slate-500 transition-all bg-white'
                        required
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor='currentSalary'
                        className='text-sm font-medium text-gray-700 mb-1'
                      >
                        Current Salary (USD)
                      </Label>
                      <Input
                        id='currentSalary'
                        name='currentSalary'
                        value={formData.currentSalary}
                        onChange={handleChange}
                        className='h-10 text-sm rounded-md focus:ring-slate-500 focus:border-slate-500 transition-all bg-white'
                      />
                      <p className='text-xs text-gray-500 mt-1'>Optional</p>
                    </div>
                    <div>
                      <Label
                        htmlFor='expectedSalary'
                        className='text-sm font-medium text-gray-700 mb-1 flex items-center'
                      >
                        Expected Salary (USD){' '}
                        <span className='text-red-500 ml-0.5'>*</span>
                      </Label>
                      <Input
                        id='expectedSalary'
                        name='expectedSalary'
                        value={formData.expectedSalary}
                        onChange={handleChange}
                        className='h-10 text-sm rounded-md focus:ring-slate-500 focus:border-slate-500 transition-all bg-white'
                        required
                      />
                    </div>
                  </div>
                  <div className='mt-4 max-w-xs'>
                    <Label
                      htmlFor='availabilityDate'
                      className='text-sm font-medium text-gray-700 mb-1 flex items-center'
                    >
                      Earliest Available Start Date{' '}
                      <span className='text-red-500 ml-0.5'>*</span>
                    </Label>
                    <Input
                      id='availabilityDate'
                      name='availabilityDate'
                      type='date'
                      value={formData.availabilityDate}
                      onChange={handleChange}
                      className='h-10 text-sm rounded-md focus:ring-slate-500 focus:border-slate-500 transition-all bg-white'
                      required
                    />
                  </div>
                </div>

                {/* Custom Fields */}
                {formData.customFields.length > 0 && (
                  <div className='bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-200 shadow-sm'>
                    <h3 className='text-base font-semibold text-gray-900 pb-2 mb-3 border-b border-indigo-200 flex items-center'>
                      <span className='bg-indigo-100 text-indigo-800 w-7 h-7 rounded-full inline-flex items-center justify-center text-sm mr-3 shadow-sm'>
                        <FileText className='h-4 w-4' />
                      </span>
                      Additional Information{' '}
                      <span className='text-xs text-gray-500 ml-2 font-normal'>
                        (Optional)
                      </span>
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {formData.customFields.map((customField, index) => (
                        <div key={index}>
                          <Label
                            htmlFor={`custom-${index}`}
                            className='text-sm font-medium text-gray-700 mb-1 flex items-center'
                          >
                            {customField.field}
                          </Label>
                          <Input
                            id={`custom-${index}`}
                            value={customField.value}
                            onChange={(e) =>
                              handleCustomFieldChange(index, e.target.value)
                            }
                            className='h-10 text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white'
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Questions */}
                {customQuestions.length > 0 && (
                  <div className='bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200 shadow-sm'>
                    <h3 className='text-base font-semibold text-gray-900 pb-2 mb-3 border-b border-purple-200 flex items-center'>
                      <span className='bg-purple-100 text-purple-800 w-7 h-7 rounded-full inline-flex items-center justify-center text-sm mr-3 shadow-sm'>
                        <FileText className='h-4 w-4' />
                      </span>
                      Additional Questions
                    </h3>
                    <div className='grid grid-cols-1 gap-5'>
                      {customQuestions.map((question) => (
                        <div
                          key={question.id}
                          className='bg-white p-4 rounded-md border border-purple-100 shadow-sm'
                        >
                          <Label
                            htmlFor={question.id}
                            className='text-sm font-medium text-gray-700 mb-2 flex items-start'
                          >
                            <div className='flex-grow'>
                              {question.question}
                              {question.required && (
                                <span className='text-red-500 ml-0.5'>*</span>
                              )}
                            </div>
                          </Label>

                          {/* Different input types based on question type */}
                          {question.type === 'string' && (
                            <Input
                              id={question.id}
                              value={
                                (formData.customQuestionAnswers.find(
                                  (a) => a.questionId === question.id
                                )?.answer as string) || ''
                              }
                              onChange={(e) =>
                                handleCustomQuestionChange(
                                  question.id,
                                  e.target.value
                                )
                              }
                              placeholder={question.placeholder}
                              className='h-10 text-sm rounded-md focus:ring-purple-500 focus:border-purple-500 transition-all bg-white'
                              required={question.required}
                            />
                          )}

                          {question.type === 'boolean' && (
                            <div className='flex gap-4'>
                              <label className='flex items-center gap-2 cursor-pointer'>
                                <input
                                  type='radio'
                                  name={question.id}
                                  checked={
                                    formData.customQuestionAnswers.find(
                                      (a) => a.questionId === question.id
                                    )?.answer === true
                                  }
                                  onChange={() =>
                                    handleCustomQuestionChange(
                                      question.id,
                                      true
                                    )
                                  }
                                  className='h-4 w-4 text-purple-600'
                                  required={question.required}
                                />
                                <span className='text-sm text-gray-700'>
                                  Yes
                                </span>
                              </label>
                              <label className='flex items-center gap-2 cursor-pointer'>
                                <input
                                  type='radio'
                                  name={question.id}
                                  checked={
                                    formData.customQuestionAnswers.find(
                                      (a) => a.questionId === question.id
                                    )?.answer === false
                                  }
                                  onChange={() =>
                                    handleCustomQuestionChange(
                                      question.id,
                                      false
                                    )
                                  }
                                  className='h-4 w-4 text-purple-600'
                                  required={question.required}
                                />
                                <span className='text-sm text-gray-700'>
                                  No
                                </span>
                              </label>
                            </div>
                          )}

                          {question.type === 'select' && (
                            <Select
                              value={
                                (formData.customQuestionAnswers.find(
                                  (a) => a.questionId === question.id
                                )?.answer as string) || ''
                              }
                              onValueChange={(value) =>
                                handleCustomQuestionChange(question.id, value)
                              }
                            >
                              <SelectTrigger
                                id={question.id}
                                className='h-10 text-sm bg-white focus:ring-purple-500 focus:border-purple-500 transition-all'
                              >
                                <SelectValue placeholder='Select an option' />
                              </SelectTrigger>
                              <SelectContent>
                                {question.options.map((option) => (
                                  <SelectItem key={option} value={option}>
                                    {option}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resume Upload */}
                <div className='bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-4 border border-gray-200 shadow-sm'>
                  <h3 className='text-base font-semibold text-gray-900 pb-2 mb-3 border-b border-gray-200 flex items-center'>
                    <span className='bg-gray-100 text-gray-800 w-7 h-7 rounded-full inline-flex items-center justify-center text-sm mr-3 shadow-sm'>
                      <Upload className='h-4 w-4' />
                    </span>
                    Resume Upload
                  </h3>
                  <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 bg-white/50 flex flex-col items-center justify-center hover:bg-white/70 transition-colors'>
                    <div className='relative mb-3'>
                      <Button
                        type='button'
                        variant='outline'
                        className={`w-full md:w-auto flex items-center justify-center h-12 px-6 font-medium transition-all ${
                          resumeName
                            ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
                            : 'bg-white hover:bg-gray-50 hover:border-gray-400 border-gray-300 text-gray-700'
                        }`}
                      >
                        {resumeName ? (
                          <>
                            <CheckCircle className='h-5 w-5 mr-2 text-green-500' />
                            <span className='text-sm font-medium'>
                              {resumeName}
                            </span>
                          </>
                        ) : (
                          <>
                            <Upload className='h-5 w-5 mr-2 text-gray-600' />
                            <span className='text-sm font-medium'>
                              Choose Resume File
                            </span>
                          </>
                        )}
                      </Button>
                      <input
                        id='resume'
                        type='file'
                        accept='.pdf,.doc,.docx'
                        onChange={handleFileChange}
                        className='absolute inset-0 opacity-0 w-full h-full cursor-pointer'
                        required
                      />
                    </div>
                    <div className='text-center max-w-md'>
                      {resumeName ? (
                        <p className='text-sm text-green-600 font-medium'>
                          ✓ File selected: {resumeName}
                        </p>
                      ) : (
                        <div className='space-y-1'>
                          <p className='text-sm font-medium text-gray-700'>
                            Accepted formats: PDF, DOC, DOCX
                          </p>
                          <p className='text-xs text-gray-500'>
                            Maximum file size: 5MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className='pt-4 border-t border-gray-200'>
                  <div className='flex flex-col md:flex-row md:items-center justify-between'>
                    <p className='text-sm text-gray-500 mb-3 md:mb-0'>
                      <span className='text-red-500'>*</span> indicates required
                      fields
                    </p>
                    <Button
                      type='submit'
                      className={`${
                        submitting
                          ? 'bg-blue-400'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                      } text-white px-8 py-3 h-auto rounded-lg transition-all shadow-lg hover:shadow-xl font-semibold`}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <div className='flex items-center justify-center'>
                          <svg
                            className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                            xmlns='http://www.w3.org/2000/svg'
                            fill='none'
                            viewBox='0 0 24 24'
                          >
                            <circle
                              className='opacity-25'
                              cx='12'
                              cy='12'
                              r='10'
                              stroke='currentColor'
                              strokeWidth='4'
                            ></circle>
                            <path
                              className='opacity-75'
                              fill='currentColor'
                              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                            ></path>
                          </svg>
                          <span className='text-sm font-medium'>
                            Submitting Application...
                          </span>
                        </div>
                      ) : (
                        <div className='flex items-center'>
                          <span className='text-sm font-medium'>
                            Submit Application
                          </span>
                          <svg
                            className='ml-2 h-4 w-4'
                            xmlns='http://www.w3.org/2000/svg'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M14 5l7 7m0 0l-7 7m7-7H3'
                            />
                          </svg>
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobApplicationPage
