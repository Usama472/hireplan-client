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
      } catch (err) {
        console.error('Error fetching job data:', err)
        setError('Failed to load job details')
      } finally {
        setLoading(false)
      }
    }

    fetchJobData()
  }, [slug, jobId])

  useEffect(() => {
    const states = State.getStatesOfCountry('US')
    setUSStates(states)
  }, [])

  useEffect(() => {
    if (selectedState) {
      const cities = City.getCitiesOfState('US', selectedState)
      setStateCities(cities)

      const stateName =
        usStates.find((state) => state.isoCode === selectedState)?.name || ''
      setFormData((prev) => ({
        ...prev,
        state: stateName,
      }))

      if (formData.city && selectedCity) {
        setSelectedCity('')
        setFormData((prev) => ({
          ...prev,
          city: '',
        }))
      }
    }
  }, [selectedState, usStates])

  const handleStateChange = (value: string) => {
    setSelectedState(value)
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

    setSubmitting(true)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

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
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='container mx-auto px-4 max-w-4xl'>
        <div className='mb-6'>
          <Button
            variant='ghost'
            className='text-gray-600 hover:text-gray-800 text-sm flex items-center mb-2'
            onClick={() => navigate(`/company/${slug}`)}
            size='sm'
          >
            <ChevronLeft className='h-4 w-4 mr-1' />
            Back to jobs
          </Button>
          <div className='flex text-xs text-gray-500'>
            <span>Companies</span>
            <span className='mx-2'>/</span>
            <span>{companyName}</span>
            <span className='mx-2'>/</span>
            <span className='text-blue-600'>{job.jobBoardTitle}</span>
          </div>
        </div>

        {/* Header with company info */}
        <div className='mb-6'>
          <div className='flex items-start mb-4'>
            <div className='flex-shrink-0 mr-4'>
              {companyLogo ? (
                <img
                  src={companyLogo}
                  alt={`${companyName} logo`}
                  className='h-12 w-12 object-contain rounded'
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23888'%3E%3Cpath d='M21 13v10h-6v-6h-6v6h-6v-10h-3l12-12 12 12h-3z'/%3E%3C/svg%3E"
                  }}
                />
              ) : (
                <Building className='h-12 w-12 text-gray-400' />
              )}
            </div>
            <div>
              <p className='text-sm font-medium text-gray-500'>{companyName}</p>
              <h1 className='text-xl font-bold text-gray-900'>
                {job.jobBoardTitle}
              </h1>
              <div className='flex flex-wrap gap-2 mt-2'>
                <span className='inline-flex items-center px-2 py-1 bg-blue-50 text-blue-800 text-xs font-medium rounded-md'>
                  {job.employmentType.replace('-', ' ')}
                </span>
                <span className='inline-flex items-center px-2 py-1 bg-green-50 text-green-800 text-xs font-medium rounded-md'>
                  {job.workplaceType}
                </span>
                {location && (
                  <span className='inline-flex items-center px-2 py-1 bg-gray-50 text-gray-800 text-xs font-medium rounded-md'>
                    <MapPin className='h-3 w-3 mr-1' />
                    {location}
                  </span>
                )}
                {formattedDate && (
                  <span className='inline-flex items-center px-2 py-1 bg-amber-50 text-amber-800 text-xs font-medium rounded-md'>
                    <Calendar className='h-3 w-3 mr-1' />
                    Apply by {formattedDate}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <Card className='p-6 shadow-md border border-gray-200 mb-6 rounded-lg'>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Personal Information */}
            <div>
              <h3 className='text-base font-medium text-gray-900 pb-2 mb-4 border-b border-gray-200'>
                Personal Information
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label
                    htmlFor='firstName'
                    className='text-sm font-medium text-gray-700 mb-1'
                  >
                    First Name
                  </Label>
                  <Input
                    id='firstName'
                    name='firstName'
                    value={formData.firstName}
                    onChange={handleChange}
                    className='h-10 text-sm'
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor='lastName'
                    className='text-sm font-medium text-gray-700 mb-1'
                  >
                    Last Name
                  </Label>
                  <Input
                    id='lastName'
                    name='lastName'
                    value={formData.lastName}
                    onChange={handleChange}
                    className='h-10 text-sm'
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor='email'
                    className='text-sm font-medium text-gray-700 mb-1'
                  >
                    Email Address
                  </Label>
                  <Input
                    id='email'
                    name='email'
                    type='email'
                    value={formData.email}
                    onChange={handleChange}
                    className='h-10 text-sm'
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor='phone'
                    className='text-sm font-medium text-gray-700 mb-1'
                  >
                    Phone Number
                  </Label>
                  <Input
                    id='phone'
                    name='phone'
                    type='tel'
                    value={formData.phone}
                    onChange={handleChange}
                    className='h-10 text-sm'
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor='state'
                    className='text-sm font-medium text-gray-700 mb-1'
                  >
                    State
                  </Label>
                  <Select
                    value={selectedState}
                    onValueChange={handleStateChange}
                  >
                    <SelectTrigger id='state' className='h-10 text-sm'>
                      <SelectValue placeholder='Select a state' />
                    </SelectTrigger>
                    <SelectContent className='max-h-[240px]'>
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
                    className='text-sm font-medium text-gray-700 mb-1'
                  >
                    City
                  </Label>
                  <Select
                    value={selectedCity}
                    onValueChange={handleCityChange}
                    disabled={!selectedState}
                  >
                    <SelectTrigger id='city' className='h-10 text-sm'>
                      <SelectValue
                        placeholder={
                          selectedState
                            ? 'Select a city'
                            : 'Select a state first'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className='max-h-[240px]'>
                      {stateCities.map((city) => (
                        <SelectItem key={city.name} value={city.name}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!selectedState && (
                    <p className='text-xs text-amber-600 mt-1'>
                      Please select a state first
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h3 className='text-base font-medium text-gray-900 pb-2 mb-4 border-b border-gray-200'>
                Professional Information
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label
                    htmlFor='currentJobTitle'
                    className='text-sm font-medium text-gray-700 mb-1'
                  >
                    Current/Previous Job Title
                  </Label>
                  <Input
                    id='currentJobTitle'
                    name='currentJobTitle'
                    value={formData.currentJobTitle}
                    onChange={handleChange}
                    placeholder='e.g. Software Engineer'
                    className='h-10 text-sm'
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor='experienceYears'
                    className='text-sm font-medium text-gray-700 mb-1'
                  >
                    Years of Experience
                  </Label>
                  <Input
                    id='experienceYears'
                    name='experienceYears'
                    type='text'
                    placeholder='e.g. 3.5'
                    value={formData.experienceYears}
                    onChange={handleChange}
                    className='h-10 text-sm'
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
                    placeholder='e.g. 75000'
                    value={formData.currentSalary}
                    onChange={handleChange}
                    className='h-10 text-sm'
                  />
                  <p className='text-xs text-gray-500 mt-1'>Optional</p>
                </div>
                <div>
                  <Label
                    htmlFor='expectedSalary'
                    className='text-sm font-medium text-gray-700 mb-1'
                  >
                    Expected Salary (USD)
                  </Label>
                  <Input
                    id='expectedSalary'
                    name='expectedSalary'
                    placeholder='e.g. 85000'
                    value={formData.expectedSalary}
                    onChange={handleChange}
                    className='h-10 text-sm'
                    required
                  />
                </div>
              </div>
              <div className='mt-4'>
                <Label
                  htmlFor='availabilityDate'
                  className='text-sm font-medium text-gray-700 mb-1'
                >
                  Earliest Available Start Date
                </Label>
                <Input
                  id='availabilityDate'
                  name='availabilityDate'
                  type='date'
                  value={formData.availabilityDate}
                  onChange={handleChange}
                  className='h-10 text-sm w-full md:w-1/2'
                  required
                />
              </div>
            </div>

            {/* Resume Upload */}
            <div>
              <h3 className='text-base font-medium text-gray-900 pb-2 mb-4 border-b border-gray-200'>
                Resume
              </h3>
              <div className='border border-dashed border-gray-300 rounded-md p-4 bg-gray-50'>
                <div className='relative'>
                  <Button
                    type='button'
                    variant='outline'
                    className='w-full md:w-auto flex items-center justify-center h-10'
                    size='sm'
                  >
                    <Upload className='h-4 w-4 mr-2' />
                    <span className='text-sm'>
                      {resumeName || 'Upload Resume'}
                    </span>
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
                <p className='mt-2 text-xs text-gray-500 text-center'>
                  {resumeName
                    ? resumeName
                    : 'Accepted formats: PDF, DOC, DOCX (Max 5MB)'}
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className='pt-4 border-t border-gray-200'>
              <Button
                type='submit'
                className='bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto'
                disabled={submitting}
                size='sm'
              >
                {submitting ? (
                  <>
                    <span className='animate-spin mr-2'>⏳</span>
                    <span className='text-sm'>Submitting...</span>
                  </>
                ) : (
                  <span className='text-sm'>Submit Application</span>
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* Job Description */}
        <Card className='p-6 shadow-md border border-gray-200 mb-8 rounded-lg'>
          <h3 className='text-base font-medium text-gray-900 mb-4'>
            Job Description
          </h3>
          <div
            className='prose prose-sm max-w-none text-gray-600'
            dangerouslySetInnerHTML={{ __html: job.jobDescription }}
          />

          {job.jobRequirements && job.jobRequirements.length > 0 && (
            <div className='mt-5'>
              <h4 className='text-sm font-medium text-gray-900 mb-2'>
                Requirements
              </h4>
              <ul className='list-disc pl-5 space-y-1 text-sm text-gray-600'>
                {job.jobRequirements.map((req, index) => (
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
