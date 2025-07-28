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
import type { Job } from '@/interfaces'
import type { ICity, IState } from 'country-state-city'
import { City, State } from 'country-state-city'
import { Building, Calendar, ChevronLeft, MapPin, Upload } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

interface CustomField {
  field: string
  value: string
  required: boolean
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

    setSubmitting(true)
    setError(null)

    try {
      const filteredCustomFields = formData.customFields.filter(
        (field) => field.value.trim() !== ''
      )

      const resumeUrl = await API.attachment.uploadAttachment(formData.resume)

      const applicantPayload = {
        ...formData,
        customFields: filteredCustomFields,
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
      <div className='container mx-auto px-4 max-w-3xl'>
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

        {/* Header with company info */}
        <div className='mb-6 bg-white p-5 rounded-lg shadow-sm border border-gray-100'>
          <div className='flex items-start'>
            <div className='flex-shrink-0 mr-4'>
              {companyLogo ? (
                <img
                  src={companyLogo}
                  alt={`${companyName} logo`}
                  className='h-14 w-14 object-contain rounded border border-gray-200 p-1 bg-white'
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23888'%3E%3Cpath d='M21 13v10h-6v-6h-6v6h-6v-10h-3l12-12 12 12h-3z'/%3E%3C/svg%3E"
                  }}
                />
              ) : (
                <div className='h-14 w-14 flex items-center justify-center bg-blue-50 rounded border border-blue-100'>
                  <Building className='h-7 w-7 text-blue-400' />
                </div>
              )}
            </div>
            <div>
              <p className='text-sm font-medium text-blue-600 mb-0.5'>
                {companyName}
              </p>
              <h1 className='text-xl font-semibold text-gray-900 mb-2.5'>
                {job.jobBoardTitle}
              </h1>
              <div className='flex flex-wrap gap-2 mt-1.5'>
                <span className='inline-flex items-center px-2.5 py-0.75 bg-blue-50 text-blue-800 text-xs font-medium rounded-full border border-blue-100'>
                  {job.employmentType.replace('-', ' ')}
                </span>
                <span className='inline-flex items-center px-2.5 py-0.75 bg-green-50 text-green-800 text-xs font-medium rounded-full border border-green-100'>
                  {job.workplaceType}
                </span>
                {location && (
                  <span className='inline-flex items-center px-2.5 py-0.75 bg-gray-50 text-gray-800 text-xs font-medium rounded-full border border-gray-200'>
                    <MapPin className='h-3 w-3 mr-1' />
                    {location}
                  </span>
                )}
                {formattedDate && (
                  <span className='inline-flex items-center px-2.5 py-0.75 bg-amber-50 text-amber-800 text-xs font-medium rounded-full border border-amber-100'>
                    <Calendar className='h-3 w-3 mr-1' />
                    Apply by {formattedDate}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <Card className='shadow-md border-0 rounded-lg mb-7 overflow-hidden'>
          <div className='bg-blue-600 text-white px-5 py-3'>
            <h2 className='text-base font-medium'>Application Form</h2>
            <p className='text-sm text-blue-100'>
              Complete the form below to apply for this position
            </p>
          </div>

          <form onSubmit={handleSubmit} className='p-5 space-y-7'>
            {/* Personal Information */}
            <div className='bg-white rounded-lg p-5 border border-gray-100 shadow-sm'>
              <h3 className='text-base font-medium text-gray-900 pb-2 mb-4 border-b border-gray-200 flex items-center'>
                <span className='bg-blue-100 text-blue-800 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm mr-2.5'>
                  1
                </span>
                Personal Information
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label
                    htmlFor='firstName'
                    className='text-sm font-medium text-gray-700 mb-1 flex items-center'
                  >
                    First Name <span className='text-red-500 ml-0.5'>*</span>
                  </Label>
                  <Input
                    id='firstName'
                    name='firstName'
                    value={formData.firstName}
                    onChange={handleChange}
                    className='h-10 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all'
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
                    className='h-10 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all'
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor='email'
                    className='text-sm font-medium text-gray-700 mb-1 flex items-center'
                  >
                    Email Address <span className='text-red-500 ml-0.5'>*</span>
                  </Label>
                  <Input
                    id='email'
                    name='email'
                    type='email'
                    value={formData.email}
                    onChange={handleChange}
                    className='h-10 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all'
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor='phone'
                    className='text-sm font-medium text-gray-700 mb-1 flex items-center'
                  >
                    Phone Number <span className='text-red-500 ml-0.5'>*</span>
                  </Label>
                  <Input
                    id='phone'
                    name='phone'
                    type='tel'
                    value={formData.phone}
                    onChange={handleChange}
                    className='h-10 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all'
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
                        <SelectItem key={state.isoCode} value={state.isoCode}>
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
            <div className='bg-white rounded-lg p-5 border border-gray-100 shadow-sm'>
              <h3 className='text-base font-medium text-gray-900 pb-2 mb-4 border-b border-gray-200 flex items-center'>
                <span className='bg-blue-100 text-blue-800 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm mr-2.5'>
                  2
                </span>
                Professional Information
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
                    className='h-10 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all'
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
                    className='h-10 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all'
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
                    className='h-10 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all'
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
                    className='h-10 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all'
                    required
                  />
                </div>
              </div>
              <div className='mt-4'>
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
                  className='h-10 text-sm w-full md:w-1/2 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all'
                  required
                />
              </div>
            </div>

            {/* Custom Fields */}
            {formData.customFields.length > 0 && (
              <div className='bg-white rounded-lg p-5 border border-gray-100 shadow-sm'>
                <h3 className='text-base font-medium text-gray-900 pb-2 mb-4 border-b border-gray-200 flex items-center'>
                  <span className='bg-blue-100 text-blue-800 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm mr-2.5'>
                    3
                  </span>
                  Additional Information{' '}
                  <span className='text-xs text-gray-500 ml-2'>(Optional)</span>
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
                        className='h-10 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all'
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resume Upload */}
            <div className='bg-white rounded-lg p-5 border border-gray-100 shadow-sm'>
              <h3 className='text-base font-medium text-gray-900 pb-2 mb-4 border-b border-gray-200 flex items-center'>
                <span className='bg-blue-100 text-blue-800 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm mr-2.5'>
                  {formData.customFields.length > 0 ? '4' : '3'}
                </span>
                Resume
              </h3>
              <div className='border-2 border-dashed border-blue-200 rounded-lg p-6 bg-blue-50 flex flex-col items-center justify-center'>
                <div className='relative mb-3'>
                  <Button
                    type='button'
                    variant='outline'
                    className={`w-full md:w-auto flex items-center justify-center h-10 px-5 ${
                      resumeName
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-white hover:bg-blue-50 hover:border-blue-300 transition-colors'
                    }`}
                  >
                    {resumeName ? (
                      <>
                        <svg
                          className='h-4 w-4 mr-2 text-green-500'
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
                        <span className='text-sm font-medium'>
                          {resumeName}
                        </span>
                      </>
                    ) : (
                      <>
                        <Upload className='h-4 w-4 mr-2 text-blue-500' />
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
                <p className='text-sm text-gray-500 text-center max-w-md'>
                  {resumeName ? (
                    <span className='text-green-600'>
                      File selected: {resumeName}
                    </span>
                  ) : (
                    <>
                      <span className='font-medium block mb-0.5'>
                        Accepted formats: PDF, DOC, DOCX
                      </span>
                      <span className='text-xs'>Maximum file size: 5MB</span>
                    </>
                  )}
                </p>
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
                    submitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                  } text-white px-7 py-2.5 h-auto rounded-md transition-all shadow-sm hover:shadow`}
                  disabled={submitting}
                >
                  {submitting ? (
                    <div className='flex items-center justify-center'>
                      <svg
                        className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
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

        {/* Job Description */}
        <Card className='p-5 shadow-md border border-gray-100 mb-6 rounded-lg'>
          <div className='border-b pb-2.5 mb-4'>
            <h3 className='text-base font-medium text-gray-900'>
              Job Description
            </h3>
          </div>
          <div
            className='prose prose-sm max-w-none text-gray-600'
            dangerouslySetInnerHTML={{ __html: job.jobDescription }}
          />

          {job.jobRequirements && job.jobRequirements.length > 0 && (
            <div className='mt-5 pt-4 border-t border-gray-200'>
              <h4 className='text-sm font-medium text-gray-900 mb-2.5'>
                Requirements
              </h4>
              <ul className='list-disc pl-5 space-y-1.5 text-sm text-gray-600'>
                {job.jobRequirements.map((req: string, index: number) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default JobApplicationPage
