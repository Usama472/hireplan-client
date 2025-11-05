import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import API from '@/http'
// Removed global DataLoadingManager import
import {
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  MapPin,
  User,
  X,
  Briefcase,
  Building,
  DollarSign,
  Calendar,
  GraduationCap,
  Users,
  FileText,
  Shield,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  EEO_RACE_ETHNICITY_OPTIONS,
  EEO_GENDER_OPTIONS,
  EEO_VETERAN_STATUS_OPTIONS,
  EEO_DISABILITY_STATUS_OPTIONS,
  EEO_DISCLAIMER_TEXT,
  EEO_VETERAN_DISCLAIMER_TEXT,
  EEO_DISABILITY_DISCLAIMER_TEXT,
} from '@/constants/eeo-constants'

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
  payType?: string
  jobRequirements?: string[]
  qualifications?: Array<{
    text: string
    title?: string
    isRequired?: boolean
    aiCategory?: 'need' | 'should' | 'nice'
  }>
  customQuestions?: CustomQuestion[]
  // Additional job info that's actually useful to candidates
  educationRequirement?: string
  positionsToHire?: number
}

interface CustomQuestion {
  id: string
  question: string
  type: 'string' | 'textarea' | 'select' | 'boolean'
  required: boolean
  options?: string[]
}

interface CustomQuestionAnswer {
  questionId: string
  answer: string | boolean | number
}

interface CustomField {
  field: string
  value: string
  required: boolean
}

interface EEOData {
  raceEthnicity: string
  gender: string
  veteranStatus: string
  disabilityStatus: string
  completedEEO: boolean
}

interface JobApplicationFormData {
  firstName: string
  lastName: string
  city: string
  state: string
  resume: File | null
  email: string
  phone: string
  smsConsent: boolean
  customQuestionAnswers: CustomQuestionAnswer[]
  customFields: CustomField[]
  eeoData: EEOData
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
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [isDuplicateApplication, setIsDuplicateApplication] = useState<boolean>(false)
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([])
  
  // Multi-step application state
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [applicationId, setApplicationId] = useState<string | null>(null)

  const [formData, setFormData] = useState<JobApplicationFormData>({
    firstName: '',
    lastName: '',
    city: '',
    state: '',
    resume: null,
    email: '',
    phone: '',
    smsConsent: true,
    customQuestionAnswers: [],
    customFields: [],
    eeoData: {
      raceEthnicity: '',
      gender: '',
      veteranStatus: '',
      disabilityStatus: '',
      completedEEO: false,
    }
  })

  // Track if user has made significant progress to determine if we should save draft
  const [hasSignificantProgress, setHasSignificantProgress] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Application steps
  const steps = [
    { id: 1, title: 'Basic Information', description: 'Tell us about yourself' },
    { id: 2, title: 'Location & Contact', description: 'Where are you located?' },
    { id: 3, title: 'Resume & Experience', description: 'Share your experience' },
    { id: 4, title: 'Additional Questions', description: 'Complete your application' },
    { id: 5, title: 'EEO Self-Identification', description: 'Voluntary information (US only)' },
    { id: 6, title: 'Review & Submit', description: 'Review and submit' }
  ]

  // Calculate completion percentage
  const getCompletionPercentage = () => {
    let completedFields = 0
    let totalFields = 0

    // Basic info (step 1) - now includes email
    totalFields += 3
    if (formData.firstName.trim()) completedFields++
    if (formData.lastName.trim()) completedFields++
    if (formData.email.trim()) completedFields++

    // Contact info (step 2)
    totalFields += 3
    if (formData.phone.trim()) completedFields++
    if (formData.city.trim()) completedFields++
    if (formData.state.trim()) completedFields++

    // Resume (step 3)
    totalFields += 1
    if (formData.resume) completedFields++

    // Custom questions (step 4)
    if (customQuestions.length > 0) {
      totalFields += customQuestions.length
      completedFields += formData.customQuestionAnswers.filter(answer => 
        typeof answer.answer === 'string' ? answer.answer.trim() : !!answer.answer
      ).length
    }

    return Math.round((completedFields / totalFields) * 100)
  }


  // Handle step navigation
  const goToNextStep = async () => {
    // Don't save partial applications during step navigation
    // Only save to localStorage for session persistence
    if (formData.firstName.trim() && formData.lastName.trim() && formData.email.trim()) {
      // Save progress to localStorage instead of database
      localStorage.setItem(`application_progress_${jobId}`, JSON.stringify({
        ...formData,
        currentStep: currentStep + 1,
        lastUpdated: new Date().toISOString()
      }));
    }
    
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Check for existing partial applications
  const checkForExistingPartialApplications = async (jobId: string) => {
    try {
      // Check if there's a stored token in localStorage for this job
      const storedToken = localStorage.getItem(`partial_application_token_${jobId}`)
      if (storedToken) {
        console.log('🔍 Found stored token for this job')
        const response = await API.applicant.getPartialApplicationByToken(storedToken)
        if (response.application) {
          console.log('📋 Loading existing partial application:', response.application)
          const existingApp = response.application
          setApplicationId(existingApp.id || existingApp._id)
          setCurrentStep(existingApp.currentStep || 1)
          
          // Update form data with existing values
          setFormData({
            firstName: existingApp.firstName || '',
            lastName: existingApp.lastName || '',
            email: existingApp.email || '',
            phone: existingApp.phone || '',
            smsConsent: existingApp.smsConsent || false,
            city: existingApp.city || '',
            state: existingApp.state || '',
            resume: null, // Can't restore file from backend
            customQuestionAnswers: existingApp.customQuestionAnswers || [],
            customFields: existingApp.customFields || [],
            eeoData: existingApp.eeoData || {
              raceEthnicity: '',
              gender: '',
              veteranStatus: '',
              disabilityStatus: '',
              completedEEO: false,
            }
          })
        }
      }
    } catch (error) {
      console.log('🔍 No existing partial application found:', error)
    }
  }

  // Validate current step
  const isCurrentStepValid = () => {
    switch (currentStep) {
      case 1: // Basic Information
        return formData.firstName.trim() && formData.lastName.trim() && formData.email.trim()
      case 2: // Location & Contact
        return formData.phone.trim() && formData.city.trim() && formData.state.trim()
      case 3: // Resume
        return formData.resume !== null
      case 4: // Additional Questions
        if (customQuestions.length === 0) return true
        return formData.customQuestionAnswers.length >= customQuestions.filter(q => q.required).length
      case 5: // Review
        return true
      default:
        return false
    }
  }

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        setLoading(true)
        if (!slug || !jobId) {
          setError('Invalid job information')
          return
        }

        const response = await API.job.getPublicJobDetails(jobId)
        const jobData = response.job

        setJob(jobData)
        setCompanyName(jobData?.company?.name || jobData?.companyName || 'Company')
        setCompanyLogo(jobData?.company?.logo || jobData?.companyLogo || null)

        // Check for existing partial application for this job
        await checkForExistingPartialApplications(jobId)
        
        // Check if there's progress saved in localStorage (session-based)
        const savedProgress = localStorage.getItem(`application_progress_${jobId}`)
        const urlParams = new URLSearchParams(window.location.search)
        const tokenParam = urlParams.get('token')
        
        if (savedProgress && !tokenParam) {
          try {
            const progressData = JSON.parse(savedProgress)
            const lastUpdated = new Date(progressData.lastUpdated)
            const hoursSinceUpdate = (new Date().getTime() - lastUpdated.getTime()) / (1000 * 60 * 60)
            
            // Only restore if it's recent (within 24 hours) and has meaningful data
            if (hoursSinceUpdate < 24 && progressData.firstName && progressData.lastName && progressData.email) {
              console.log('📱 Restoring progress from localStorage')
              setFormData({
                firstName: progressData.firstName || '',
                lastName: progressData.lastName || '',
                email: progressData.email || '',
                phone: progressData.phone || '',
                smsConsent: progressData.smsConsent || false,
                city: progressData.city || '',
                state: progressData.state || '',
                resume: null, // Can't restore file from localStorage
                customQuestionAnswers: progressData.customQuestionAnswers || [],
                customFields: progressData.customFields || [],
                eeoData: progressData.eeoData || {
                  raceEthnicity: '',
                  gender: '',
                  veteranStatus: '',
                  disabilityStatus: '',
                  completedEEO: false,
                }
              })
              setCurrentStep(progressData.currentStep || 1)
              setHasSignificantProgress(true)
            }
          } catch (error) {
            console.log('Failed to restore localStorage progress:', error)
          }
        }
        
        // Check if token is provided in URL params (from continue button)
        if (tokenParam) {
          console.log('🔑 Token from URL parameter:', tokenParam)
          try {
            const response = await API.applicant.getPartialApplicationByToken(tokenParam)
            if (response.application) {
              console.log('📋 Loading partial application from token:', response.application)
              const existingApp = response.application
              setApplicationId(existingApp.id || existingApp._id)
              setCurrentStep(existingApp.currentStep || 1)
              
              // Update form data with existing values
              setFormData({
                firstName: existingApp.firstName || '',
                lastName: existingApp.lastName || '',
                email: existingApp.email || '',
                phone: existingApp.phone || '',
                smsConsent: existingApp.smsConsent || false,
                city: existingApp.city || '',
                state: existingApp.state || '',
                resume: null, // Can't restore file from backend
                customQuestionAnswers: existingApp.customQuestionAnswers || [],
                customFields: existingApp.customFields || [],
                eeoData: existingApp.eeoData || {
                  raceEthnicity: '',
                  gender: '',
                  veteranStatus: '',
                  disabilityStatus: '',
                  completedEEO: false,
                }
              })
              
              // Store token for future detection
              localStorage.setItem(`partial_application_token_${jobId}`, tokenParam)
            }
          } catch (error) {
            console.log('🔍 No partial application found for token:', error)
          }
        }

        // Handle custom questions if present
        if (jobData?.customQuestions?.length > 0) {
          setCustomQuestions(jobData.customQuestions)

          // Initialize answers for custom questions
          const initialAnswers = jobData.customQuestions.map(
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

        // Handle custom fields if present
        if (jobData?.externalApplicationSetup?.customFields?.length > 0) {
          const initialCustomFields = jobData.externalApplicationSetup.customFields.map(
            (field: string) => ({
              field,
              value: '',
              required: false,
            })
          )

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
  }, [slug, jobId])

  // Check for existing partial application when form data changes
  useEffect(() => {
    const checkExistingApplication = async () => {
      if (formData.email.trim() && jobId && !applicationId) {
        try {
          console.log('🔍 Checking for existing partial application...')
          const response = await API.applicant.getPartialApplication(formData.email, jobId)
          if (response.application) {
            console.log('📋 Found existing partial application:', response.application)
            // Load existing data
            const existingApp = response.application
            setApplicationId(existingApp.id || existingApp._id)
            setCurrentStep(existingApp.currentStep || 1)
            
            // Update form data with existing values
            setFormData(prev => ({
              ...prev,
              firstName: existingApp.firstName || prev.firstName,
              lastName: existingApp.lastName || prev.lastName,
              email: existingApp.email || prev.email,
              phone: existingApp.phone || prev.phone,
              smsConsent: existingApp.smsConsent || prev.smsConsent,
              city: existingApp.city || prev.city,
              state: existingApp.state || prev.state,
              customQuestionAnswers: existingApp.customQuestionAnswers || prev.customQuestionAnswers,
              customFields: existingApp.customFields || prev.customFields,
            }))
          }
        } catch (error) {
          console.log('🔍 No existing partial application found or error:', error)
        }
      }
    }

    const timeoutId = setTimeout(checkExistingApplication, 1000) // Debounce
    return () => clearTimeout(timeoutId)
  }, [formData.email, jobId, applicationId])

  // Save draft only when user leaves page without completing application
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Only save draft if user has made significant progress and isn't submitting
      if (hasSignificantProgress && !isSubmitting && formData.firstName.trim() && formData.lastName.trim() && formData.email.trim()) {
        console.log('💾 Auto-saving draft on page unload')
        // Use navigator.sendBeacon for reliable saving when page unloads
        const partialData = {
          ...formData,
          jobId,
          companyName,
          jobTitle: job?.jobTitle || '',
          status: 'draft',
          completionPercentage: getCompletionPercentage(),
          currentStep,
          isPartial: true,
        }
        
        const blob = new Blob([JSON.stringify(partialData)], { type: 'application/json' })
        const apiUrl = import.meta.env.VITE_API_URL || 'https://hireplan.co/api/v1'
        navigator.sendBeacon(`${apiUrl}/applicants/partial${applicationId ? `/${applicationId}` : ''}`, blob)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [formData, currentStep, applicationId, jobId, companyName, job?.jobTitle, hasSignificantProgress, isSubmitting])

  // Track when user has made significant progress
  useEffect(() => {
    const progress = getCompletionPercentage()
    if (progress >= 25 || currentStep >= 2) { // Consider 25% completion or step 2+ as significant
      setHasSignificantProgress(true)
    }
  }, [formData, currentStep])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setIsSubmitting(true) // Prevent draft saving during submission
    setError(null)

    try {
      let resumeUrl = ''

      if (formData.resume) {
        resumeUrl = await API.attachment.uploadAttachment(formData.resume)
      }

      const applicationData = {
        ...formData,
        resume: resumeUrl,
        jobId,
        companyName,
        jobTitle: job?.jobTitle || '',
      }

      await API.applicant.applyJob(applicationData)

      // Clear localStorage and draft data on successful submission
      localStorage.removeItem(`application_progress_${jobId}`)
      localStorage.removeItem(`partial_application_token_${jobId}`)
      console.log('✅ Application submitted successfully, cleared draft data')

      setSuccessMessage('Application submitted successfully!')
    } catch (err: any) {
      console.error('Application submission error:', err)
      
      // Handle duplicate application error specifically
      if (err?.response?.status === 409) { // CONFLICT status
        const responseData = err?.response?.data;
        
        // Check if email was sent for duplicate application
        if (responseData?.emailSent || responseData?.message?.includes('email')) {
          setIsDuplicateApplication(true);
          setSuccessMessage(
            responseData?.message || 
            'You have already submitted an application for this job. We\'ve sent you an email with a link to check your application status.'
          );
          // Don't set error for email sent scenario
          setError(null);
        } else {
          // Regular duplicate error (no email sent)
          setError(
            responseData?.message || 
            'You have already submitted an application for this job with this email address. Please check your email for confirmation or contact support if you need assistance.'
          );
        }
      } else {
        setError(
          err?.response?.data?.message ||
            'Failed to submit application. Please try again.'
        )
      }
      setIsSubmitting(false) // Allow draft saving again if submission failed
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    )
  }

  if (error && !job) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center p-8'>
          <h1 className='text-2xl font-bold text-red-600 mb-4'>Error</h1>
          <p className='text-gray-600 mb-4'>{error}</p>
          <Button onClick={() => navigate('/')} variant='outline'>
            Go Back Home
          </Button>
        </div>
      </div>
    )
  }

  if (successMessage) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full mx-4'>
          {isDuplicateApplication ? (
            <>
              <AlertTriangle className='h-16 w-16 text-amber-500 mx-auto mb-4' />
              <h1 className='text-2xl font-bold text-gray-900 mb-4'>
                Application Already Submitted
              </h1>
            </>
          ) : (
            <>
              <CheckCircle className='h-16 w-16 text-green-500 mx-auto mb-4' />
              <h1 className='text-2xl font-bold text-gray-900 mb-4'>
                Application Submitted!
              </h1>
            </>
          )}
          <p className='text-gray-600 mb-6'>{successMessage}</p>
          <div className='space-y-3'>
            <Button
              onClick={() => navigate('/')}
              className='w-full bg-blue-600 hover:bg-blue-700'
            >
              Return to Homepage
            </Button>
            <Button
              variant='outline'
              onClick={() => navigate(-1)}
              className='w-full'
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow-sm border-b'>
        <div className='max-w-6xl mx-auto px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              {companyLogo && (
                <img
                  src={companyLogo}
                  alt={`${companyName} logo`}
                  className='h-12 w-12 rounded-lg object-cover'
                />
              )}
              <div>
                <h1 className='text-xl font-bold text-gray-900'>
                  {job?.jobTitle}
                </h1>
                <p className='text-gray-600'>{companyName}</p>
              </div>
            </div>
            <Button
              variant='outline'
              onClick={() => navigate(-1)}
              className='flex items-center gap-2'
            >
              <ChevronLeft className='h-4 w-4' />
              Back
            </Button>
          </div>
        </div>
      </div>

      <div className='max-w-6xl mx-auto px-6 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Job Details - Left Column */}
        <div className='lg:col-span-1'>
          <div className='space-y-4'>
            {/* Main Job Info Card */}
            <div className='bg-white rounded-lg shadow-sm border p-4'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center'>
                  <Briefcase className='h-5 w-5 text-gray-600' />
                </div>
                <div>
                  <h2 className='text-lg font-semibold text-gray-900'>{job?.jobTitle || 'Software Engineer'}</h2>
                  <p className='text-sm text-gray-600'>{companyName || 'Tech Company'}</p>
                </div>
              </div>

              {/* Key Details Grid */}
              <div className='grid grid-cols-2 gap-3'>
                <div className='flex items-center gap-2 p-2 bg-gray-50 rounded'>
                  <Building className='h-4 w-4 text-gray-500' />
                  <div>
                    <p className='text-xs text-gray-500 uppercase tracking-wide'>Type</p>
                    <p className='text-sm font-medium text-gray-900'>{job?.employmentType || 'Full-time'}</p>
                  </div>
                </div>
                
                <div className='flex items-center gap-2 p-2 bg-gray-50 rounded'>
                  <MapPin className='h-4 w-4 text-gray-500' />
                  <div>
                    <p className='text-xs text-gray-500 uppercase tracking-wide'>Location</p>
                    <p className='text-sm font-medium text-gray-900'>
                      {job?.jobLocation?.city && job?.jobLocation?.state 
                        ? `${job.jobLocation.city}, ${job.jobLocation.state}`
                        : 'Remote'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Salary Card */}
            <div className='bg-white rounded-lg shadow-sm border p-4'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center'>
                  <DollarSign className='h-4 w-4 text-green-600' />
                </div>
                <div>
                  <p className='text-xs text-gray-500 uppercase tracking-wide'>Annual Salary</p>
                  <p className='text-lg font-semibold text-gray-900'>
                    {job?.payRate?.min && job?.payRate?.max
                      ? `$${job.payRate.min.toLocaleString()} - $${job.payRate.max.toLocaleString()}`
                      : '$120,000 - $160,000'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className='bg-white rounded-lg shadow-sm border p-4 space-y-3'>
              {/* Education Requirement */}
              {job?.educationRequirement && 
               !['none', 'n/a', 'na', 'not required'].includes(job.educationRequirement.toLowerCase()) && (
                <div className='flex items-center gap-3'>
                  <GraduationCap className='h-4 w-4 text-blue-600' />
                  <div>
                    <p className='text-xs text-gray-500 uppercase tracking-wide'>Education</p>
                    <p className='text-sm font-medium text-gray-900'>{job.educationRequirement}</p>
                  </div>
                </div>
              )}

              {/* Positions Available */}
              {job?.positionsToHire && job.positionsToHire > 1 && (
                <div className='flex items-center gap-3'>
                  <Users className='h-4 w-4 text-purple-600' />
                  <div>
                    <p className='text-xs text-gray-500 uppercase tracking-wide'>Openings</p>
                    <p className='text-sm font-medium text-gray-900'>{job.positionsToHire} positions</p>
                  </div>
                </div>
              )}
            </div>

            {/* Job Description */}
            {job?.jobDescription && (
              <div className='bg-white rounded-lg shadow-sm border p-4'>
                <div className='flex items-center gap-2 mb-3'>
                  <FileText className='h-4 w-4 text-gray-600' />
                  <h3 className='text-sm font-semibold text-gray-900'>About This Role</h3>
                </div>
                <div 
                  className='text-sm text-gray-700 leading-relaxed'
                  dangerouslySetInnerHTML={{ 
                    __html: job.jobDescription.length > 400 
                      ? job.jobDescription.substring(0, 400) + '...' 
                      : job.jobDescription 
                  }}
                />
              </div>
            )}

            {/* Requirements */}
            {((job?.qualifications && job.qualifications.length > 0) || (job?.jobRequirements && job.jobRequirements.length > 0)) && (
              <div className='bg-white rounded-lg shadow-sm border p-4'>
                <div className='flex items-center gap-2 mb-3'>
                  <CheckCircle className='h-4 w-4 text-green-600' />
                  <h3 className='text-sm font-semibold text-gray-900'>Requirements</h3>
                </div>
                <div className='space-y-2'>
                  {job?.qualifications && job.qualifications.length > 0 ? (
                    <>
                      {job.qualifications.slice(0, 5).map((qual, index) => (
                        <div key={index} className='flex items-start gap-2'>
                          <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${
                            qual.isRequired ? 'bg-red-500' : 'bg-green-500'
                          }`}></div>
                          <span className='text-sm text-gray-700 leading-relaxed'>{qual.text}</span>
                        </div>
                      ))}
                      {job.qualifications.length > 5 && (
                        <p className='text-xs text-gray-500 ml-4'>+{job.qualifications.length - 5} more</p>
                      )}
                    </>
                  ) : (
                    job?.jobRequirements && job.jobRequirements.slice(0, 5).map((req, index) => (
                      <div key={index} className='flex items-start gap-2'>
                        <div className='w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0'></div>
                        <span className='text-sm text-gray-700 leading-relaxed'>{req}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

          {/* Application Form - Right Column */}
          <div className='lg:col-span-2'>
            <Card className='shadow-md border-0 rounded-lg mb-7 overflow-hidden'>
              <div className='bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-5 py-3'>
                <h2 className='text-lg font-medium'>Application Form</h2>
                <p className='text-sm text-white/90'>
                  Complete the form below to apply for this position
                </p>
              </div>

              {/* Progress Bar */}
              <div className="px-5 py-4 bg-gray-50 border-b">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    Step {currentStep} of {steps.length}
                  </span>
                  <span className="text-sm text-gray-500">
                    {getCompletionPercentage()}% Complete
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(currentStep / steps.length) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2">
                  {steps.map((step) => (
                    <div key={step.id} className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${currentStep >= step.id ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                      <span className="text-xs mt-1 text-gray-600 hidden sm:block">{step.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className='p-5 space-y-5'>
                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                        <X className="h-3 w-3 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-red-800">Application Error</h4>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <div className='space-y-6'>
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Let's start with the basics</h3>
                      <p className="text-gray-600">Tell us your name and email so we can save your progress</p>
                    </div>
                    
                    <div className='bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-lg p-6 border border-purple-200 shadow-sm backdrop-blur-sm'>
                      <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
                        <span className='bg-gradient-to-r from-blue-500 to-purple-600 text-white w-8 h-8 rounded-full inline-flex items-center justify-center text-sm mr-3 shadow-sm'>
                          <User className='h-4 w-4' />
                        </span>
                        Basic Information
                      </h3>
                      <div className='space-y-4'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          <div>
                            <Label htmlFor='firstName' className='text-sm font-medium text-gray-700 mb-1 flex items-center'>
                              First Name <span className='text-red-500 ml-0.5'>*</span>
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
                            <Label htmlFor='lastName' className='text-sm font-medium text-gray-700 mb-1 flex items-center'>
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
                        </div>
                        
                        {/* Email field */}
                        <div>
                          <Label htmlFor='email' className='text-sm font-medium text-gray-700 mb-1 flex items-center'>
                            Email Address <span className='text-red-500 ml-0.5'>*</span>
                          </Label>
                          <Input
                            id='email'
                            name='email'
                            type='email'
                            value={formData.email}
                            onChange={handleChange}
                            placeholder='your.email@example.com'
                            className='h-10 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all bg-white'
                            required
                          />
                          <p className='text-xs text-gray-500 mt-1'>
                            We'll use this to save your progress and contact you about your application
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Location & Contact */}
                {currentStep === 2 && (
                  <div className='space-y-6'>
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Where are you located?</h3>
                      <p className="text-gray-600">Help us understand your location and contact preferences</p>
                    </div>
                    
                    <div className='bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-lg p-6 border border-purple-200 shadow-sm backdrop-blur-sm'>
                      <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
                        <span className='bg-gradient-to-r from-purple-500 to-pink-500 text-white w-8 h-8 rounded-full inline-flex items-center justify-center text-sm mr-3 shadow-sm'>
                          <MapPin className='h-4 w-4' />
                        </span>
                        Location & Contact
                      </h3>
                      <div className='space-y-4'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          <div>
                            <Label htmlFor='city' className='text-sm font-medium text-gray-700 mb-1 flex items-center'>
                              City <span className='text-red-500 ml-0.5'>*</span>
                            </Label>
                            <Input
                              id='city'
                              name='city'
                              value={formData.city}
                              onChange={handleChange}
                              placeholder='San Francisco'
                              className='h-10 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all bg-white'
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor='state' className='text-sm font-medium text-gray-700 mb-1 flex items-center'>
                              State <span className='text-red-500 ml-0.5'>*</span>
                            </Label>
                            <Input
                              id='state'
                              name='state'
                              value={formData.state}
                              onChange={handleChange}
                              placeholder='California'
                              className='h-10 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all bg-white'
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor='phone' className='text-sm font-medium text-gray-700 mb-1 flex items-center'>
                              Phone Number <span className='text-red-500 ml-0.5'>*</span>
                            </Label>
                            <Input
                              id='phone'
                              name='phone'
                              type='tel'
                              value={formData.phone}
                              onChange={handleChange}
                              placeholder='(302) 500-4435'
                              className='h-10 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all bg-white'
                              required
                            />
                          </div>
                          
                          {/* SMS Consent Checkbox - 10DLC Compliance */}
                          <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <input
                              type="checkbox"
                              id="smsConsent"
                              checked={formData.smsConsent}
                              onChange={(e) => setFormData(prev => ({ ...prev, smsConsent: e.target.checked }))}
                              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div className="flex-1">
                              <Label htmlFor="smsConsent" className="text-sm font-medium text-blue-900 cursor-pointer">
                                SMS Communications (Optional)
                              </Label>
                              <p className="text-xs text-blue-800 mt-1 leading-relaxed">
                                By providing your phone number and checking this box, you consent to receive SMS messages from {companyName || 'this company'} regarding your application and potential chat invitations. Message frequency may vary. Reply STOP to opt-out. Reply HELP for assistance. Message and data rates may apply.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Resume */}
                {currentStep === 3 && (
                  <div className='space-y-6'>
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Share your experience</h3>
                      <p className="text-gray-600">Upload your resume to showcase your background</p>
                    </div>
                    
                    <div className='bg-gradient-to-r from-pink-50/50 to-purple-50/50 rounded-lg p-6 border border-pink-200 shadow-sm backdrop-blur-sm'>
                      <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
                        <span className='bg-gradient-to-r from-pink-500 to-purple-600 text-white w-8 h-8 rounded-full inline-flex items-center justify-center text-sm mr-3 shadow-sm'>
                          📄
                        </span>
                        Resume Upload
                      </h3>
                      <div className='space-y-4'>
                        <div>
                          <Label htmlFor='resume' className='text-sm font-medium text-gray-700 mb-1 flex items-center'>
                            Resume <span className='text-red-500 ml-0.5'>*</span>
                          </Label>
                          <Input
                            id='resume'
                            name='resume'
                            type='file'
                            accept='.pdf,.doc,.docx'
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                setFormData(prev => ({ ...prev, resume: file }))
                              }
                            }}
                            className='h-10 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all bg-white'
                            required
                          />
                          <p className='text-xs text-gray-500 mt-1'>
                            Accepted formats: PDF, DOC, DOCX (Max 5MB)
                          </p>
                        </div>
                        {formData.resume && (
                          <div className='p-3 bg-green-50 border border-green-200 rounded-lg'>
                            <p className='text-sm text-green-700 font-medium'>
                              ✓ File selected: {formData.resume.name}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Additional Questions */}
                {currentStep === 4 && (
                  <div className='space-y-6'>
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">A few more questions</h3>
                      <p className="text-gray-600">Help us understand your fit for this role</p>
                    </div>
                    
                    {customQuestions.length > 0 ? (
                      <div className='space-y-4'>
                        {customQuestions.map((question) => (
                          <div key={question.id} className='bg-gradient-to-r from-orange-50/50 to-pink-50/50 rounded-lg p-6 border border-orange-200 shadow-sm backdrop-blur-sm'>
                            <Label className='text-sm font-medium text-gray-700 mb-2 flex items-center'>
                              {question.question}
                              {question.required && <span className='text-red-500 ml-1'>*</span>}
                            </Label>
                            
                            {/* Text Input */}
                            {question.type === 'string' && (
                              <Input
                                value={formData.customQuestionAnswers.find(a => a.questionId === question.id)?.answer as string || ''}
                                onChange={(e) => {
                                  const newAnswers = [...formData.customQuestionAnswers]
                                  const existingIndex = newAnswers.findIndex(a => a.questionId === question.id)
                                  if (existingIndex >= 0) {
                                    newAnswers[existingIndex].answer = e.target.value
                                  } else {
                                    newAnswers.push({ questionId: question.id, answer: e.target.value })
                                  }
                                  setFormData(prev => ({ ...prev, customQuestionAnswers: newAnswers }))
                                }}
                                placeholder='Your answer...'
                                className='h-10 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all bg-white'
                                required={question.required}
                              />
                            )}
                            
                            {/* Textarea */}
                            {question.type === 'textarea' && (
                              <textarea
                                value={formData.customQuestionAnswers.find(a => a.questionId === question.id)?.answer as string || ''}
                                onChange={(e) => {
                                  const newAnswers = [...formData.customQuestionAnswers]
                                  const existingIndex = newAnswers.findIndex(a => a.questionId === question.id)
                                  if (existingIndex >= 0) {
                                    newAnswers[existingIndex].answer = e.target.value
                                  } else {
                                    newAnswers.push({ questionId: question.id, answer: e.target.value })
                                  }
                                  setFormData(prev => ({ ...prev, customQuestionAnswers: newAnswers }))
                                }}
                                rows={4}
                                placeholder='Your detailed answer...'
                                className='w-full p-3 text-sm rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white'
                                required={question.required}
                              />
                            )}
                            
                            {/* Boolean/Yes-No */}
                            {question.type === 'boolean' && (
                              <div className='space-y-2'>
                                <div className='flex gap-4'>
                                  <label className='flex items-center'>
                                    <input
                                      type='radio'
                                      name={`question_${question.id}`}
                                      checked={formData.customQuestionAnswers.find(a => a.questionId === question.id)?.answer === true}
                                      onChange={() => {
                                        const newAnswers = [...formData.customQuestionAnswers]
                                        const existingIndex = newAnswers.findIndex(a => a.questionId === question.id)
                                        if (existingIndex >= 0) {
                                          newAnswers[existingIndex].answer = true
                                        } else {
                                          newAnswers.push({ questionId: question.id, answer: true })
                                        }
                                        setFormData(prev => ({ ...prev, customQuestionAnswers: newAnswers }))
                                      }}
                                      className='mr-2'
                                    />
                                    <span className='text-sm text-gray-700'>Yes</span>
                                  </label>
                                  <label className='flex items-center'>
                                    <input
                                      type='radio'
                                      name={`question_${question.id}`}
                                      checked={formData.customQuestionAnswers.find(a => a.questionId === question.id)?.answer === false}
                                      onChange={() => {
                                        const newAnswers = [...formData.customQuestionAnswers]
                                        const existingIndex = newAnswers.findIndex(a => a.questionId === question.id)
                                        if (existingIndex >= 0) {
                                          newAnswers[existingIndex].answer = false
                                        } else {
                                          newAnswers.push({ questionId: question.id, answer: false })
                                        }
                                        setFormData(prev => ({ ...prev, customQuestionAnswers: newAnswers }))
                                      }}
                                      className='mr-2'
                                    />
                                    <span className='text-sm text-gray-700'>No</span>
                                  </label>
                                </div>
                              </div>
                            )}
                            
                            {/* Select Dropdown */}
                            {question.type === 'select' && question.options && (
                              <select
                                value={formData.customQuestionAnswers.find(a => a.questionId === question.id)?.answer as string || ''}
                                onChange={(e) => {
                                  const newAnswers = [...formData.customQuestionAnswers]
                                  const existingIndex = newAnswers.findIndex(a => a.questionId === question.id)
                                  if (existingIndex >= 0) {
                                    newAnswers[existingIndex].answer = e.target.value
                                  } else {
                                    newAnswers.push({ questionId: question.id, answer: e.target.value })
                                  }
                                  setFormData(prev => ({ ...prev, customQuestionAnswers: newAnswers }))
                                }}
                                className='w-full p-3 text-sm rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white'
                                required={question.required}
                              >
                                <option value=''>Select an option...</option>
                                {question.options.map((option, optIndex) => (
                                  <option key={optIndex} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className='text-center p-8'>
                        <CheckCircle className='h-12 w-12 text-green-500 mx-auto mb-4' />
                        <p className='text-gray-600'>No additional questions for this position</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 5: EEO Self-Identification (US Only) */}
                {currentStep === 5 && (
                  <div className='space-y-6'>
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Voluntary Self-Identification</h3>
                      <p className="text-gray-600">Help us ensure equal employment opportunities</p>
                    </div>
                    
                    <div className='bg-gradient-to-r from-green-50/50 to-blue-50/50 rounded-lg p-6 border border-green-200 shadow-sm backdrop-blur-sm'>
                      <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
                        <span className='bg-gradient-to-r from-green-500 to-blue-600 text-white w-8 h-8 rounded-full inline-flex items-center justify-center text-sm mr-3 shadow-sm'>
                          <Shield className='h-4 w-4' />
                        </span>
                        Equal Employment Opportunity
                      </h3>

                      {/* EEO Disclaimer */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <h4 className="font-semibold text-blue-900 mb-2">Important Information</h4>
                        <p className="text-sm text-blue-800 leading-relaxed">
                          {EEO_DISCLAIMER_TEXT}
                        </p>
                      </div>

                      <div className='space-y-6'>
                        {/* Race/Ethnicity */}
                        <div>
                          <Label className='text-sm font-medium text-gray-700 mb-2 block'>
                            Race/Ethnicity (Voluntary)
                          </Label>
                          <Select 
                            value={formData.eeoData.raceEthnicity} 
                            onValueChange={(value) => setFormData(prev => ({
                              ...prev,
                              eeoData: { ...prev.eeoData, raceEthnicity: value }
                            }))}
                          >
                            <SelectTrigger className="h-10 text-sm">
                              <SelectValue placeholder="Select race/ethnicity (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                              {EEO_RACE_ETHNICITY_OPTIONS.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Gender */}
                        <div>
                          <Label className='text-sm font-medium text-gray-700 mb-2 block'>
                            Gender (Voluntary)
                          </Label>
                          <Select 
                            value={formData.eeoData.gender} 
                            onValueChange={(value) => setFormData(prev => ({
                              ...prev,
                              eeoData: { ...prev.eeoData, gender: value }
                            }))}
                          >
                            <SelectTrigger className="h-10 text-sm">
                              <SelectValue placeholder="Select gender (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                              {EEO_GENDER_OPTIONS.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Veteran Status */}
                        <div>
                          <Label className='text-sm font-medium text-gray-700 mb-2 block'>
                            Veteran Status (Voluntary)
                          </Label>
                          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
                            <p className="text-xs text-yellow-800">
                              {EEO_VETERAN_DISCLAIMER_TEXT}
                            </p>
                          </div>
                          <Select 
                            value={formData.eeoData.veteranStatus} 
                            onValueChange={(value) => setFormData(prev => ({
                              ...prev,
                              eeoData: { ...prev.eeoData, veteranStatus: value }
                            }))}
                          >
                            <SelectTrigger className="h-10 text-sm">
                              <SelectValue placeholder="Select veteran status (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                              {EEO_VETERAN_STATUS_OPTIONS.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Disability Status */}
                        <div>
                          <Label className='text-sm font-medium text-gray-700 mb-2 block'>
                            Disability Status (Voluntary)
                          </Label>
                          <div className="bg-purple-50 border border-purple-200 rounded p-3 mb-3">
                            <p className="text-xs text-purple-800">
                              {EEO_DISABILITY_DISCLAIMER_TEXT}
                            </p>
                          </div>
                          <Select 
                            value={formData.eeoData.disabilityStatus} 
                            onValueChange={(value) => setFormData(prev => ({
                              ...prev,
                              eeoData: { ...prev.eeoData, disabilityStatus: value, completedEEO: true }
                            }))}
                          >
                            <SelectTrigger className="h-10 text-sm">
                              <SelectValue placeholder="Select disability status (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                              {EEO_DISABILITY_STATUS_OPTIONS.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Privacy Notice */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 mb-2">Your Privacy is Protected</h5>
                          <div className="text-xs text-gray-600 space-y-1">
                            <p>✓ This information is completely voluntary</p>
                            <p>✓ Your responses will be kept confidential</p>
                            <p>✓ This data will not affect hiring decisions</p>
                            <p>✓ Used only for federal reporting compliance</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 6: Review & Submit */}
                {currentStep === 6 && (
                  <div className='space-y-6'>
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Review your application</h3>
                      <p className="text-gray-600">Please review your information before submitting</p>
                    </div>
                    
                    <div className='bg-gradient-to-r from-green-50/50 to-blue-50/50 rounded-lg p-6 border border-green-200 shadow-sm backdrop-blur-sm'>
                      <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
                        <span className='bg-gradient-to-r from-green-500 to-blue-600 text-white w-8 h-8 rounded-full inline-flex items-center justify-center text-sm mr-3 shadow-sm'>
                          <CheckCircle className='h-4 w-4' />
                        </span>
                        Application Summary
                      </h3>
                      
                      <div className='space-y-4'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          <div>
                            <h4 className='font-medium text-gray-700'>Name</h4>
                            <p className='text-gray-900'>{formData.firstName} {formData.lastName}</p>
                          </div>
                          <div>
                            <h4 className='font-medium text-gray-700'>Email</h4>
                            <p className='text-gray-900'>{formData.email}</p>
                          </div>
                          <div>
                            <h4 className='font-medium text-gray-700'>Phone</h4>
                            <p className='text-gray-900'>{formData.phone}</p>
                          </div>
                          <div>
                            <h4 className='font-medium text-gray-700'>Location</h4>
                            <p className='text-gray-900'>{formData.city}, {formData.state}</p>
                          </div>
                        </div>
                        
                        {formData.resume && (
                          <div>
                            <h4 className='font-medium text-gray-700'>Resume</h4>
                            <p className='text-gray-900'>📄 {formData.resume.name}</p>
                          </div>
                        )}
                        
                          {formData.customQuestionAnswers.length > 0 && (
                          <div>
                            <h4 className='font-medium text-gray-700'>Additional Questions</h4>
                            <div className='space-y-2'>
                              {formData.customQuestionAnswers.map((answer, index) => {
                                const question = customQuestions.find(q => q.id === answer.questionId)
                                return (
                                  <div key={index} className='text-sm'>
                                    <p className='font-medium text-gray-600'>{question?.question}</p>
                                    <p className='text-gray-900'>{answer.answer?.toString()}</p>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* EEO Information */}
                        {formData.eeoData.completedEEO && (
                          <div>
                            <h4 className='font-medium text-gray-700'>EEO Self-Identification</h4>
                            <p className='text-sm text-gray-600 mb-2'>Voluntary demographic information (confidential)</p>
                            <div className='space-y-1 text-sm'>
                              {formData.eeoData.raceEthnicity && (
                                <p><span className='font-medium'>Race/Ethnicity:</span> {EEO_RACE_ETHNICITY_OPTIONS.find(opt => opt.value === formData.eeoData.raceEthnicity)?.label}</p>
                              )}
                              {formData.eeoData.gender && (
                                <p><span className='font-medium'>Gender:</span> {EEO_GENDER_OPTIONS.find(opt => opt.value === formData.eeoData.gender)?.label}</p>
                              )}
                              {formData.eeoData.veteranStatus && (
                                <p><span className='font-medium'>Veteran Status:</span> {EEO_VETERAN_STATUS_OPTIONS.find(opt => opt.value === formData.eeoData.veteranStatus)?.label}</p>
                              )}
                              {formData.eeoData.disabilityStatus && (
                                <p><span className='font-medium'>Disability Status:</span> {EEO_DISABILITY_STATUS_OPTIONS.find(opt => opt.value === formData.eeoData.disabilityStatus)?.label}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step Navigation */}
                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={goToPreviousStep}
                    disabled={currentStep === 1}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">
                      {steps.find(s => s.id === currentStep)?.description}
                    </p>
                  </div>

                  {currentStep < steps.length ? (
                    <Button 
                      type="button"
                      onClick={goToNextStep}
                      disabled={!isCurrentStepValid()}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                      Next
                      <ChevronLeft className="w-4 h-4 rotate-180" />
                    </Button>
                  ) : (
                    <Button 
                      type="submit"
                      disabled={submitting || !isCurrentStepValid()}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Application
                          <CheckCircle className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  )}
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