'use client'

import { DeleteJobModal } from '@/components/dashboard/jobs/delete-job-modal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getApplicants } from '@/http/applicant/api'
import type { IApplicant, Job } from '@/interfaces'
import { cn } from '@/lib/utils'
import { City, State } from 'country-state-city'
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  Edit,
  Eye,
  File,
  Flag,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Trash2,
  TrendingUp,
  User,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'

// Mock data for demonstration - in real app, this would come from API
const mockJobData: Job & {
  company: string
  companyLogo?: string
  companyWebsite?: string
  companyEmail?: string
  companyPhone?: string
  benefits?: string[]
  requirements?: string[]
  responsibilities?: string[]
  applicationDeadline?: string
  postedDate: string
  lastUpdated: string
} = {
  id: '1',
  jobTitle: 'Senior Frontend Developer',
  jobBoardTitle: 'Senior Frontend Developer - React/Next.js',
  status: 'active',
  jobStatus: 'high',
  workplaceType: 'remote',
  company: 'TechCorp Inc.',
  companyWebsite: 'https://techcorp.com',
  companyEmail: 'hr@techcorp.com',
  companyPhone: '+1 (555) 123-4567',
  payType: 'salary',
  employmentType: 'full-time',
  positionsToHire: 2,
  educationRequirement: 'bachelors-degree',
  jobDescription: `We are looking for an experienced Frontend Developer to join our dynamic team. You will be responsible for building modern, responsive web applications using React, Next.js, and TypeScript.

Key Responsibilities:
• Develop and maintain high-quality frontend applications
• Collaborate with designers and backend developers
• Implement responsive designs and ensure cross-browser compatibility
• Optimize applications for maximum speed and scalability
• Participate in code reviews and maintain coding standards

What We Offer:
• Competitive salary and equity package
• Comprehensive health, dental, and vision insurance
• Flexible work arrangements and remote-first culture
• Professional development opportunities
• Modern tech stack and tools`,
  requirements: [
    '5+ years of experience with React and modern JavaScript',
    'Strong proficiency in TypeScript and Next.js',
    'Experience with state management (Redux, Zustand, etc.)',
    'Knowledge of CSS frameworks (Tailwind CSS preferred)',
    'Experience with testing frameworks (Jest, Cypress)',
    'Understanding of web performance optimization',
    "Bachelor's degree in Computer Science or related field",
  ],
  responsibilities: [
    'Build and maintain responsive web applications',
    'Collaborate with cross-functional teams',
    'Write clean, maintainable, and well-documented code',
    'Participate in agile development processes',
    'Mentor junior developers',
    'Stay up-to-date with latest frontend technologies',
  ],
  benefits: [
    'Health, Dental & Vision Insurance',
    '401(k) with company matching',
    'Unlimited PTO policy',
    'Remote work flexibility',
    'Professional development budget',
    'Latest MacBook Pro and equipment',
    'Team building events and retreats',
  ],
  applicants: 47,
  views: 324,
  createdAt: '2024-01-15T10:00:00Z',
  postedDate: '2024-01-15T10:00:00Z',
  lastUpdated: '2024-01-20T14:30:00Z',
  endDate: '2024-02-15T23:59:59Z',
  applicationDeadline: '2024-02-15T23:59:59Z',
  // Add missing required properties
  jobLocation: {
    address: '123 Tech Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
  },
  department: 'Engineering',
  payRate: {
    type: 'range',
    min: 120000,
    max: 160000,
  },
  jobRequirements: [
    '5+ years of experience with React and modern JavaScript',
    'Strong proficiency in TypeScript and Next.js',
    'Experience with state management (Redux, Zustand, etc.)',
  ],
  startDate: '2024-02-01T00:00:00Z',
  updatedAt: '2024-01-20T14:30:00Z',
  matches: 15,
}

const formatSalary = (job: typeof mockJobData) => {
  if (job.payRate?.amount) {
    const amount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(job.payRate.amount)
    return `${amount}${job.payType === 'hourly' ? '/hr' : '/year'}`
  }
  return 'Salary not specified'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

const getDaysUntilDeadline = (endDate: string) => {
  const today = new Date()
  const deadline = new Date(endDate)
  const diffTime = deadline.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'draft':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'paused':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'closed':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getPriorityColor = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export default function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [applicants, setApplicants] = useState<IApplicant[]>([])
  const [filteredApplicants, setFilteredApplicants] = useState<IApplicant[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedApplicant, setSelectedApplicant] = useState<IApplicant | null>(
    null
  )
  const [showReviewModal, setShowReviewModal] = useState(false)

  // Filter states
  const [stateFilter, setStateFilter] = useState<string>('all')
  const [cityFilter, setCityFilter] = useState<string>('all')
  const [stateOptions, setStateOptions] = useState<
    { value: string; label: string }[]
  >([])
  const [cityOptions, setCityOptions] = useState<
    { value: string; label: string }[]
  >([])
  const [uniqueStates, setUniqueStates] = useState<Set<string>>(new Set())
  const [uniqueCities, setUniqueCities] = useState<Set<string>>(new Set())

  // In real app, fetch job data based on ID
  const job = mockJobData

  // Fetch applicants data
  useEffect(() => {
    const fetchApplicants = async () => {
      if (id) {
        setIsLoading(true)
        try {
          const response = await getApplicants(id)
          setApplicants(response.applicants || [])
        } catch (error) {
          console.error('Error fetching applicants:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchApplicants()
  }, [id])

  // Initialize state options with all US states
  useEffect(() => {
    // Get all US states
    const statesList = State.getStatesOfCountry('US')
    const options = statesList.map((state) => ({
      value: state.name,
      label: state.name,
    }))

    options.sort((a, b) => a.label.localeCompare(b.label))
    setStateOptions(options)
  }, [])

  // Extract unique states and cities from applicants for highlighting
  useEffect(() => {
    if (!applicants.length) return

    const states = new Set<string>()
    const cities = new Set<string>()

    applicants.forEach((applicant) => {
      if (applicant.state) states.add(applicant.state)
      if (applicant.city) cities.add(applicant.city)
    })

    setUniqueStates(states)
    setUniqueCities(cities)
  }, [applicants])

  // Update city options when state filter changes
  useEffect(() => {
    if (stateFilter === 'all') {
      // If "All States" is selected, don't show any cities
      setCityOptions([])
      setCityFilter('all')
      return
    }

    const stateObj = State.getStatesOfCountry('US').find(
      (state) => state.name === stateFilter
    )

    if (stateObj) {
      const citiesList = City.getCitiesOfState('US', stateObj.isoCode)
      const options = citiesList.map((city) => ({
        value: city.name,
        label: city.name,
      }))

      options.sort((a, b) => a.label.localeCompare(b.label))
      setCityOptions(options)

      // Reset city filter if current city is not in the new state
      if (cityFilter !== 'all') {
        const cityExists = citiesList.some((city) => city.name === cityFilter)
        if (!cityExists) {
          setCityFilter('all')
        }
      }
    } else {
      setCityOptions([])
      setCityFilter('all')
    }
  }, [stateFilter, cityFilter])

  // Apply filters to applicants
  useEffect(() => {
    let result = [...applicants]

    if (stateFilter !== 'all') {
      result = result.filter((applicant) => applicant.state === stateFilter)
    }

    if (cityFilter !== 'all') {
      result = result.filter((applicant) => applicant.city === cityFilter)
    }

    setFilteredApplicants(result)
  }, [applicants, stateFilter, cityFilter])

  const salary = formatSalary(job)
  const daysLeft = job.endDate ? getDaysUntilDeadline(job.endDate) : null
  const applicationRate = ((job.applicants || 0) / (job.views || 1)) * 100

  const handleClearFilters = () => {
    setStateFilter('all')
    setCityFilter('all')
  }

  const handleEdit = () => {
    navigate(`/dashboard/jobs/${id}/edit`)
  }

  const handleDelete = async (jobToDelete: Job) => {
    setIsDeleting(true)
    try {
      // API call to delete job
      console.log('Deleting job:', jobToDelete.id)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      navigate('/dashboard/jobs')
    } catch (error) {
      console.error('Error deleting job:', error)
    } finally {
      setIsDeleting(false)
      setShowDeleteModal(false)
    }
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <main className='pt-6 pb-16'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Back Button */}
          <div className='mb-6'>
            <Button
              variant='ghost'
              onClick={() => navigate('/dashboard/jobs')}
              className='text-gray-600 hover:text-gray-900'
            >
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back to Jobs
            </Button>
          </div>

          {/* Header Section */}
          <div className='bg-white rounded-lg shadow-sm border mb-8'>
            <div className='p-6'>
              <div className='flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6'>
                <div className='flex-1'>
                  {/* Status and Priority Badges */}
                  <div className='flex items-center gap-2 mb-4'>
                    <Badge
                      className={cn(
                        'text-sm font-medium',
                        getStatusColor(job.status)
                      )}
                    >
                      {job.status?.charAt(0).toUpperCase() +
                        job.status?.slice(1)}
                    </Badge>
                    {job.jobStatus && (
                      <Badge
                        className={cn(
                          'text-sm font-medium',
                          getPriorityColor(job.jobStatus)
                        )}
                      >
                        {job.jobStatus.charAt(0).toUpperCase() +
                          job.jobStatus.slice(1)}{' '}
                        Priority
                      </Badge>
                    )}
                    {daysLeft !== null && (
                      <Badge
                        variant='outline'
                        className={cn(
                          'text-sm',
                          daysLeft <= 7 &&
                            daysLeft > 0 &&
                            'border-orange-300 text-orange-700',
                          daysLeft <= 0 && 'border-red-300 text-red-700'
                        )}
                      >
                        <Clock className='w-3 h-3 mr-1' />
                        {daysLeft > 0
                          ? `${daysLeft} days left`
                          : daysLeft === 0
                          ? 'Expires today'
                          : 'Expired'}
                      </Badge>
                    )}
                  </div>

                  {/* Job Title and Company */}
                  <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                    {job.jobTitle}
                  </h1>
                  <div className='flex items-center gap-6 text-lg text-gray-600 mb-4'>
                    <div className='flex items-center'>
                      <Building2 className='w-5 h-5 mr-2' />
                      <span className='font-medium'>{job.company}</span>
                    </div>
                    <div className='flex items-center'>
                      <MapPin className='w-5 h-5 mr-2' />
                      <span>
                        {job.jobLocation
                          ? `${job.jobLocation.city}, ${job.jobLocation.state}`
                          : 'Remote'}
                      </span>
                    </div>
                    <div className='flex items-center text-green-600 font-semibold'>
                      <DollarSign className='w-5 h-5 mr-2' />
                      <span>{salary}</span>
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className='flex flex-wrap items-center gap-4'>
                    <Badge variant='outline' className='text-sm'>
                      {job.employmentType
                        ?.replace('-', ' ')
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Badge>
                    <Badge variant='outline' className='text-sm'>
                      {job.workplaceType?.charAt(0).toUpperCase() +
                        job.workplaceType?.slice(1)}
                    </Badge>
                    {job.positionsToHire && job.positionsToHire > 1 && (
                      <Badge variant='outline' className='text-sm'>
                        <Briefcase className='w-3 h-3 mr-1' />
                        {job.positionsToHire} positions
                      </Badge>
                    )}
                    {job.educationRequirement && (
                      <Badge variant='outline' className='text-sm'>
                        <GraduationCap className='w-3 h-3 mr-1' />
                        {job.educationRequirement
                          .replace('-', ' ')
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className='flex items-center gap-3'>
                  <Button
                    onClick={handleEdit}
                    className='bg-blue-600 hover:bg-blue-700'
                  >
                    <Edit className='w-4 h-4 mr-2' />
                    Edit Job
                  </Button>

                  <Button
                    onClick={() => setShowDeleteModal(true)}
                    variant='outline'
                    className='border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 hover:text-red-700'
                  >
                    <Trash2 className='w-4 h-4 mr-2' />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Total Applications
                    </p>
                    <p className='text-3xl font-bold text-gray-900'>
                      {job.applicants || 0}
                    </p>
                  </div>
                  <div className='h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center'>
                    <Users className='h-6 w-6 text-blue-600' />
                  </div>
                </div>
                <div className='mt-4'>
                  <div className='flex items-center text-sm text-green-600'>
                    <TrendingUp className='w-4 h-4 mr-1' />
                    <span>+12% from last week</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Total Views
                    </p>
                    <p className='text-3xl font-bold text-gray-900'>
                      {job.views || 0}
                    </p>
                  </div>
                  <div className='h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center'>
                    <Eye className='h-6 w-6 text-purple-600' />
                  </div>
                </div>
                <div className='mt-4'>
                  <div className='flex items-center text-sm text-green-600'>
                    <TrendingUp className='w-4 h-4 mr-1' />
                    <span>+8% from last week</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Application Rate
                    </p>
                    <p className='text-3xl font-bold text-gray-900'>
                      {applicationRate.toFixed(1)}%
                    </p>
                  </div>
                  <div className='h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center'>
                    <TrendingUp className='h-6 w-6 text-green-600' />
                  </div>
                </div>
                <div className='mt-4'>
                  <Progress value={applicationRate} className='h-2' />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Days Active
                    </p>
                    <p className='text-3xl font-bold text-gray-900'>
                      {Math.ceil(
                        (Date.now() - new Date(job.createdAt).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}
                    </p>
                  </div>
                  <div className='h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center'>
                    <Calendar className='h-6 w-6 text-orange-600' />
                  </div>
                </div>
                <div className='mt-4'>
                  <div className='text-sm text-gray-600'>
                    Posted on {formatDate(job.createdAt)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='space-y-6'
          >
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='overview'>Overview</TabsTrigger>
              <TabsTrigger value='applications'>
                Applications ({applicants.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value='overview' className='space-y-6'>
              <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                {/* Job Description */}
                <div className='lg:col-span-2'>
                  <Card>
                    <CardHeader>
                      <CardTitle>Job Description</CardTitle>
                    </CardHeader>
                    <CardContent className='prose max-w-none'>
                      <div className='whitespace-pre-line text-gray-700'>
                        {job.jobDescription}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Requirements */}
                  {job.requirements && (
                    <Card className='mt-6'>
                      <CardHeader>
                        <CardTitle>Requirements</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className='space-y-2'>
                          {job.requirements.map((req, index) => (
                            <li key={index} className='flex items-start'>
                              <CheckCircle className='w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0' />
                              <span className='text-gray-700'>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Responsibilities */}
                  {job.responsibilities && (
                    <Card className='mt-6'>
                      <CardHeader>
                        <CardTitle>Key Responsibilities</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className='space-y-2'>
                          {job.responsibilities.map((resp, index) => (
                            <li key={index} className='flex items-start'>
                              <Briefcase className='w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0' />
                              <span className='text-gray-700'>{resp}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Sidebar */}
                <div className='space-y-6'>
                  {/* Job Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Job Details</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Employment Type</span>
                        <span className='font-medium'>
                          {job.employmentType
                            ?.replace('-', ' ')
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </div>
                      <Separator />
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Workplace Type</span>
                        <span className='font-medium'>
                          {job.workplaceType?.charAt(0).toUpperCase() +
                            job.workplaceType?.slice(1)}
                        </span>
                      </div>
                      <Separator />
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Positions</span>
                        <span className='font-medium'>
                          {job.positionsToHire || 1}
                        </span>
                      </div>
                      <Separator />
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>Education</span>
                        <span className='font-medium'>
                          {job.educationRequirement
                            ?.replace('-', ' ')
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </div>
                      <Separator />
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>
                          Application Deadline
                        </span>
                        <span className='font-medium'>
                          {job.applicationDeadline
                            ? formatDate(job.applicationDeadline)
                            : 'No deadline'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Benefits */}
                  {job.benefits && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Benefits & Perks</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className='space-y-2'>
                          {job.benefits.map((benefit, index) => (
                            <li key={index} className='flex items-start'>
                              <CheckCircle className='w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0' />
                              <span className='text-sm text-gray-700'>
                                {benefit}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value='applications' className='space-y-6'>
              <Card>
                <CardHeader>
                  <div className='flex flex-col md:flex-row md:justify-between md:items-center gap-4'>
                    <CardTitle>
                      Applications ({filteredApplicants.length})
                    </CardTitle>
                    <div className='flex flex-col md:flex-row gap-3'>
                      <div className='flex gap-2'>
                        <div className='w-40'>
                          <Select
                            value={stateFilter}
                            onValueChange={setStateFilter}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder='Filter by State' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='all'>All States</SelectItem>
                              {stateOptions.map((state) => (
                                <SelectItem
                                  key={state.value}
                                  value={state.value}
                                  className={
                                    uniqueStates.has(state.value)
                                      ? 'font-medium text-primary'
                                      : 'text-muted-foreground'
                                  }
                                >
                                  {state.label}
                                  {uniqueStates.has(state.value) && ' ✓'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className='w-40'>
                          <Select
                            value={cityFilter}
                            onValueChange={setCityFilter}
                            disabled={cityOptions.length === 0}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder='Filter by City' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='all'>All Cities</SelectItem>
                              {cityOptions.map((city) => (
                                <SelectItem
                                  key={city.value}
                                  value={city.value}
                                  className={
                                    uniqueCities.has(city.value)
                                      ? 'font-medium text-primary'
                                      : 'text-muted-foreground'
                                  }
                                >
                                  {city.label}
                                  {uniqueCities.has(city.value) && ' ✓'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {(stateFilter !== 'all' || cityFilter !== 'all') && (
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={handleClearFilters}
                            className='flex items-center'
                          >
                            <X className='h-4 w-4 mr-1' />
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className='text-center p-4'>Loading applicants...</div>
                  ) : filteredApplicants.length === 0 ? (
                    <div className='text-center p-4'>
                      {applicants.length === 0
                        ? 'No applications yet'
                        : 'No applications match your filters'}
                    </div>
                  ) : (
                    <div className='space-y-4'>
                      {filteredApplicants.map((applicant, index) => (
                        <div
                          key={index}
                          className='flex items-center justify-between p-4 border rounded-lg'
                        >
                          <div className='flex-1'>
                            <div className='flex items-center gap-3 mb-2'>
                              <h4 className='font-medium text-gray-900'>
                                {applicant.firstName} {applicant.lastName}
                              </h4>
                            </div>
                            <div className='flex items-center gap-4 text-sm text-gray-600'>
                              <span>{applicant.email}</span>
                              <span>•</span>
                              <span>
                                {applicant.experienceYears || 'N/A'} years
                                experience
                              </span>
                              <span>•</span>
                              <span>
                                {applicant.city}, {applicant.state}
                              </span>
                            </div>
                            <div className='flex flex-wrap gap-4 mt-2 text-sm'>
                              {applicant.currentJobTitle && (
                                <span className='text-blue-600'>
                                  <Briefcase className='w-3 h-3 inline mr-1' />
                                  {applicant.currentJobTitle}
                                </span>
                              )}
                              {applicant.currentSalary && (
                                <span className='text-green-600'>
                                  <DollarSign className='w-3 h-3 inline mr-1' />
                                  Current: {applicant.currentSalary}
                                </span>
                              )}
                              {applicant.expectedSalary && (
                                <span className='text-orange-600'>
                                  <DollarSign className='w-3 h-3 inline mr-1' />
                                  Expected: {applicant.expectedSalary}
                                </span>
                              )}
                            </div>
                            <div className='text-xs text-gray-500 mt-1'>
                              Applied on{' '}
                              {applicant.createdAt
                                ? new Date(
                                    applicant.createdAt
                                  ).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })
                                : 'Unknown date'}
                            </div>
                          </div>
                          <div className='flex items-center gap-2'>
                            {applicant.resume && (
                              <Button variant='outline' size='sm' asChild>
                                <a
                                  href={applicant.resume}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                >
                                  View Resume
                                </a>
                              </Button>
                            )}
                            <Button
                              size='sm'
                              onClick={() => {
                                setSelectedApplicant(applicant)
                                setShowReviewModal(true)
                              }}
                            >
                              Review
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <DeleteJobModal
        job={job}
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />

      {/* Applicant Review Modal */}
      <ApplicantReviewModal
        applicant={selectedApplicant}
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
      />
    </div>
  )
}

// Applicant Review Modal Component
interface ApplicantReviewModalProps {
  applicant: IApplicant | null
  isOpen: boolean
  onClose: () => void
}

function ApplicantReviewModal({
  applicant,
  isOpen,
  onClose,
}: ApplicantReviewModalProps) {
  if (!applicant) return null

  // Define sample statuses for the UI
  const statuses = [
    {
      value: 'new',
      label: 'New',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    {
      value: 'shortlisted',
      label: 'Shortlisted',
      color: 'bg-green-100 text-green-800 border-green-200',
    },
    {
      value: 'interview',
      label: 'Interview',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
    },
    {
      value: 'declined',
      label: 'Declined',
      color: 'bg-red-100 text-red-800 border-red-200',
    },
  ]

  // Default to new status
  const currentStatus = statuses[0]

  // Handle match score - mocked for now
  const matchScore = 87

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className='w-full md:max-w-xl lg:max-w-2xl overflow-y-auto p-6'>
        <SheetHeader className='pb-5 border-b mb-2'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-2'>
              <SheetTitle className='text-xl font-bold'>
                Applicant Profile
              </SheetTitle>
              <Badge className={cn(currentStatus.color)}>
                {currentStatus.label}
              </Badge>
            </div>
          </div>
        </SheetHeader>

        <div className='py-6 space-y-7'>
          {/* Header with applicant name and match score */}
          <div className='flex items-center justify-between px-1'>
            <div className='flex items-center gap-4'>
              <div className='h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center border border-blue-200 shadow-sm'>
                <User className='h-8 w-8 text-blue-600' />
              </div>
              <div>
                <h2 className='text-2xl font-bold text-gray-900'>
                  {applicant.firstName} {applicant.lastName}
                </h2>
                <p className='text-gray-600'>
                  {applicant.currentJobTitle || 'Job Seeker'}
                </p>
              </div>
            </div>

            {/* Match score indicator */}
            <div className='text-center'>
              <div className='inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-green-50 to-green-100 border border-green-200'>
                <span className='text-xl font-bold text-green-600'>
                  {matchScore}%
                </span>
              </div>
              <p className='text-xs font-medium text-gray-500 mt-1'>
                Match Score
              </p>
            </div>
          </div>

          {/* Quick action buttons */}
          <div className='flex gap-2 overflow-x-auto pb-2 px-1'>
            <Button variant='outline' size='sm' className='whitespace-nowrap'>
              <Phone className='h-3 w-3 mr-1' /> Call
            </Button>
            <Button variant='outline' size='sm' className='whitespace-nowrap'>
              <Mail className='h-3 w-3 mr-1' /> Email
            </Button>
            {applicant.resume && (
              <Button
                variant='outline'
                size='sm'
                className='whitespace-nowrap'
                asChild
              >
                <a
                  href={applicant.resume}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <Download className='h-3 w-3 mr-1' /> Resume
                </a>
              </Button>
            )}
            <Button
              variant='outline'
              size='sm'
              className='whitespace-nowrap text-blue-600'
            >
              <Calendar className='h-3 w-3 mr-1' /> Schedule
            </Button>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
            {/* Left column */}
            <div className='space-y-5'>
              {/* Contact Information */}
              <Card className='shadow-sm'>
                <CardHeader className='pb-2 px-5'>
                  <CardTitle className='text-base flex items-center gap-2'>
                    <Mail className='h-4 w-4 text-blue-500' />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3 pt-1 px-5 pb-5'>
                  <div className='flex items-center gap-3'>
                    <Mail className='h-4 w-4 text-gray-500' />
                    <a
                      href={`mailto:${applicant.email}`}
                      className='text-sm text-blue-600 hover:underline'
                    >
                      {applicant.email || ''}
                    </a>
                  </div>
                  <div className='flex items-center gap-3'>
                    <Phone className='h-4 w-4 text-gray-500' />
                    <a href={`tel:${applicant.phone}`} className='text-sm'>
                      {applicant.phone || 'Not provided'}
                    </a>
                  </div>
                  <div className='flex items-center gap-3'>
                    <MapPin className='h-4 w-4 text-gray-500' />
                    <span className='text-sm'>
                      {[applicant.city || '', applicant.state || '']
                        .filter(Boolean)
                        .join(', ') || 'Location not specified'}
                    </span>
                  </div>
                  {applicant.availabilityDate && (
                    <div className='flex items-center gap-3'>
                      <Calendar className='h-4 w-4 text-gray-500' />
                      <span className='text-sm'>
                        Available from:{' '}
                        {new Date(
                          applicant.availabilityDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Compensation */}
              <Card className='shadow-sm'>
                <CardHeader className='pb-2 px-5'>
                  <CardTitle className='text-base flex items-center gap-2'>
                    <DollarSign className='h-4 w-4 text-green-500' />
                    Compensation
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-3 pt-1 px-5 pb-5'>
                  <div className='grid grid-cols-2 items-center'>
                    <span className='text-gray-600 text-sm'>
                      Current Salary
                    </span>
                    <span className='font-medium text-green-600 text-right'>
                      {applicant.currentSalary || 'Not disclosed'}
                    </span>
                  </div>
                  <Separator />
                  <div className='grid grid-cols-2 items-center'>
                    <span className='text-gray-600 text-sm'>
                      Expected Salary
                    </span>
                    <span className='font-medium text-orange-600 text-right'>
                      {applicant.expectedSalary || 'Not specified'}
                    </span>
                  </div>
                  <Separator />
                  <div className='grid grid-cols-2 items-center'>
                    <span className='text-gray-600 text-sm'>Notice Period</span>
                    <span className='font-medium text-right'>
                      {applicant.noticePeriod || 'Not specified'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Skills & Qualifications */}
              <Card className='shadow-sm'>
                <CardHeader className='pb-2 px-5'>
                  <CardTitle className='text-base flex items-center gap-2'>
                    <CheckCircle className='h-4 w-4 text-blue-500' />
                    Skills & Qualifications
                  </CardTitle>
                </CardHeader>
                <CardContent className='pt-1 px-5 pb-5'>
                  {applicant.skills ? (
                    <div className='flex flex-wrap gap-2'>
                      {typeof applicant.skills === 'string'
                        ? applicant.skills.split(',').map((skill, index) => (
                            <Badge
                              key={index}
                              variant='secondary'
                              className='text-xs px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors'
                            >
                              {skill.trim()}
                            </Badge>
                          ))
                        : applicant.skills.map((skill, index) => (
                            <Badge
                              key={index}
                              variant='secondary'
                              className='text-xs px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors'
                            >
                              {skill}
                            </Badge>
                          ))}
                    </div>
                  ) : (
                    <p className='text-sm text-gray-500 italic'>
                      No skills listed
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Custom Fields */}
              {applicant.customFields && applicant.customFields.length > 0 && (
                <Card className='shadow-sm'>
                  <CardHeader className='pb-2 px-5'>
                    <CardTitle className='text-base'>
                      Additional Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='pt-1 px-5 pb-5 space-y-2'>
                    {applicant.customFields.map((field, index) => (
                      <div key={index} className='grid grid-cols-2'>
                        <span className='text-gray-600 text-sm'>
                          {field.field}
                        </span>
                        <span className='text-sm font-medium text-right'>
                          {field.value || 'Not provided'}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right column */}
            <div className='space-y-5'>
              {/* Experience */}
              <Card className='shadow-sm'>
                <CardHeader className='pb-2 px-5'>
                  <CardTitle className='text-base flex items-center gap-2'>
                    <Briefcase className='h-4 w-4 text-blue-500' />
                    Professional Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4 pt-1 px-5 pb-5'>
                  <div>
                    <div className='text-sm mb-1'>
                      <span className='font-semibold text-gray-900'>
                        {applicant.experienceYears || 'N/A'} years of experience
                      </span>
                    </div>
                    {applicant.currentJobTitle && (
                      <div className='text-sm bg-gray-50 p-3 rounded-md border border-gray-100'>
                        <div className='font-medium'>
                          {applicant.currentJobTitle}
                        </div>
                        {applicant.currentEmployer && (
                          <div className='text-gray-600'>
                            {applicant.currentEmployer}
                          </div>
                        )}
                      </div>
                    )}
                    {applicant.jobHistory && (
                      <div className='text-sm text-gray-700 mt-3'>
                        <p className='line-clamp-4'>{applicant.jobHistory}</p>
                        <button className='text-blue-600 hover:underline text-xs mt-2'>
                          Read more
                        </button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Education */}
              <Card className='shadow-sm'>
                <CardHeader className='pb-2 px-5'>
                  <CardTitle className='text-base flex items-center gap-2'>
                    <GraduationCap className='h-4 w-4 text-blue-500' />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent className='pt-1 px-5 pb-5'>
                  <div className='text-sm'>
                    {applicant.education ? (
                      <p className='bg-gray-50 p-3 rounded-md border border-gray-100'>
                        {applicant.education}
                      </p>
                    ) : (
                      <p className='text-gray-500 italic'>
                        No education information provided
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Cover Letter */}
              {applicant.coverLetter && (
                <Card className='shadow-sm'>
                  <CardHeader className='pb-2 px-5'>
                    <CardTitle className='text-base flex items-center gap-2'>
                      <File className='h-4 w-4 text-blue-500' />
                      Cover Letter
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='pt-1 px-5 pb-5'>
                    <div className='text-sm text-gray-700 whitespace-pre-line bg-gray-50 p-4 rounded-md border border-gray-100 max-h-48 overflow-y-auto'>
                      {applicant.coverLetter}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Resume Preview if available */}
              {applicant.resume && (
                <Card className='shadow-sm'>
                  <CardHeader className='pb-2 px-5'>
                    <CardTitle className='text-base'>Resume</CardTitle>
                  </CardHeader>
                  <CardContent className='pt-1 px-5 pb-5'>
                    <Button className='w-full' variant='default' asChild>
                      <a
                        href={applicant.resume}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        <Download className='h-4 w-4 mr-2' />
                        View Full Resume
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className='space-y-3 pt-2 px-1'>
            <Button className='w-full bg-blue-600 hover:bg-blue-700'>
              Schedule Interview
            </Button>
            <div className='grid grid-cols-3 gap-3'>
              <Button
                variant='outline'
                className='border-green-300 text-green-600 hover:bg-green-50 hover:text-green-700'
              >
                <CheckCircle className='h-4 w-4 mr-2' />
                Shortlist
              </Button>
              <Button
                variant='outline'
                className='border-yellow-300 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700'
              >
                <Flag className='h-4 w-4 mr-2' />
                Flag
              </Button>
              <Button
                variant='outline'
                className='border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700'
              >
                <X className='h-4 w-4 mr-2' />
                Decline
              </Button>
            </div>
            <Button variant='outline' className='w-full'>
              <Mail className='h-4 w-4 mr-2' />
              Send Message
            </Button>
          </div>

          {/* Application Date */}
          <div className='text-xs text-gray-500 text-center pt-3 pb-1'>
            Application submitted on{' '}
            {applicant.createdAt
              ? new Date(applicant.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Unknown date'}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
