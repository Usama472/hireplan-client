import { StepNavigation } from '@/components/main/signup/stepNavigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { ROUTES } from '@/constants'
import API from '@/http'
import { errorResolver } from '@/lib/utils'
import { JobAdStep } from '@components/dashboard/jobs/create/job-ad-step'
import { PositionDetailsStep } from '@components/dashboard/jobs/create/position-details-step'
import { ReviewPublishStep } from '@components/dashboard/jobs/create/review-publish-step'
import { SettingsNotificationsStep } from '@components/dashboard/jobs/create/settings-notifications-step'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

const jobCreationSchema = z
  .object({
    jobTitle: z.string().min(1, 'Internal job title is required'),
    jobBoardTitle: z
      .string()
      .min(1, 'Job board title is required')
      .max(60, 'Job board title should be 60 characters or less'),
    jobDescription: z
      .string()
      .min(20, 'Description should be at least 20 characters')
      .max(2000, 'Description should be no more than 2000 characters'),
    backgroundScreeningDisclaimer: z.boolean().optional(),
  })
  .passthrough()

export default function CreateJob() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const form = useForm({
    resolver: zodResolver(jobCreationSchema),
    defaultValues: {
      jobTitle: '',
      jobBoardTitle: '',
      jobDescription: '',
      backgroundScreeningDisclaimer: false,
      jobStatus: 'medium',
      workplaceType: 'onsite',
      jobLocation: {
        address: '',
        city: '',
        state: '',
        zipCode: '',
      },
      employmentType: 'full-time',
      educationRequirement: '',
      department: '',
      payType: 'salary',
      payRate: {
        type: 'fixed',
      },
      positionsToHire: 1,
      jobRequirements: [],
      startDate: '',
      endDate: '',
      notifyOnApplication: {
        enabled: false,
        recipients: [],
      },
      dailyRoundup: {
        enabled: false,
        recipients: [],
        time: '09:00',
      },
      externalApplicationSetup: {
        customFields: [],
      },
    },
    mode: 'onChange',
  })

  const { trigger, handleSubmit, clearErrors, setValue } = form

  // Load test data function
  const loadTestData = () => {
    const testData = {
      jobTitle: 'Senior Full Stack Developer - Remote',
      jobBoardTitle: 'Senior Full Stack Developer (React/Node.js)',
      jobDescription: `We're seeking an experienced Full Stack Developer to join our growing tech team. You'll work on cutting-edge web applications using React, Node.js, and modern cloud technologies.

Key Responsibilities:
• Develop and maintain web applications using React and Node.js
• Collaborate with cross-functional teams to define and implement new features
• Optimize applications for maximum speed and scalability
• Participate in code reviews and technical discussions
• Mentor junior developers and contribute to best practices

Requirements:
• 5+ years of experience in full-stack development
• Strong proficiency in React, Node.js, and TypeScript
• Experience with PostgreSQL and MongoDB
• Familiarity with AWS or similar cloud platforms
• Strong problem-solving skills and attention to detail

We offer competitive compensation, comprehensive benefits, and a collaborative remote-first culture.`,
      backgroundScreeningDisclaimer: true,
      jobStatus: 'high',
      workplaceType: 'remote',
      jobLocation: {
        address: '123 Tech Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
      },
      employmentType: 'full-time',
      educationRequirement: 'Bachelor\'s degree in Computer Science or related field',
      department: 'Engineering',
      payType: 'salary',
      payRate: {
        type: 'range',
        minimum: 120000,
        maximum: 160000,
      },
      positionsToHire: 2,
      jobRequirements: [
        'React.js proficiency',
        'Node.js experience',
        'TypeScript knowledge',
        'Database design skills',
        'Cloud platform experience'
      ],
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week from now
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 months from now
      notifyOnApplication: {
        enabled: true,
        recipients: [
          { email: 'hr@company.com', name: 'HR Team' },
          { email: 'manager@company.com', name: 'Hiring Manager' }
        ],
      },
      dailyRoundup: {
        enabled: true,
        recipients: [
          { email: 'hr@company.com', name: 'HR Team' }
        ],
        time: '09:00',
      },
      externalApplicationSetup: {
        customFields: [
          { name: 'Portfolio URL', type: 'text', required: false },
          { name: 'GitHub Profile', type: 'text', required: false }
        ],
      },
    }

    // Set all form values
    Object.keys(testData).forEach((key) => {
      setValue(key as any, (testData as any)[key])
    })

    toast.success('Test data loaded successfully!')
  }

  const stepFields = {
    1: ['jobTitle', 'jobBoardTitle', 'jobDescription'],
    2: [
      'jobStatus',
      'workplaceType',
      'jobLocation',
      'employmentType',
      'educationRequirement',
      'department',
      'payType',
      'payRate',
      'positionsToHire',
    ],
    3: ['startDate', 'endDate'],
    4: [],
  }

  const handleNext = async () => {
    clearErrors()

    if (currentStep === 4) return

    const fieldsToValidate = stepFields[currentStep as keyof typeof stepFields]

    const isStepValid = await trigger(fieldsToValidate, {
      shouldFocus: true,
    })

    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 4))
      clearErrors()
    }
  }

  const handlePrevious = () => {
    clearErrors()
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const onSubmit = async (data: any) => {
    if (currentStep !== 4) {
      return
    }
    setIsSubmitting(true)
    try {
      await API.job.createJob(data)
      navigate(ROUTES.DASHBOARD.MAIN)
    } catch (err) {
      const errorMessage = errorResolver(err)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <JobAdStep />
      case 2:
        return <PositionDetailsStep />
      case 3:
        return <SettingsNotificationsStep />
      case 4:
        return <ReviewPublishStep />
      default:
        return <JobAdStep />
    }
  }

  return (
    <main className='pb-16'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Back to jobs link */}
        <div className='mb-8'>
          <Button
            variant='ghost'
            asChild
            className='text-gray-600 hover:text-gray-900 -ml-2'
          >
            <div
              onClick={() => navigate(ROUTES.DASHBOARD.MAIN)}
              className='flex items-center'
            >
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Jobs
            </div>
          </Button>
        </div>

        {/* Step Indicator */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                Create Job Posting
              </h1>
              <p className='text-gray-600 mt-1'>
                Create a comprehensive job posting to attract the right
                candidates
              </p>
            </div>
            <div className='flex gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={loadTestData}
                className='bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
              >
                🧪 Load Test Data
              </Button>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <Card className='shadow-sm border-0 bg-white'>
          <CardContent className='p-8 sm:p-12'>
            <FormProvider {...form}>
              <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
                  {renderCurrentStep()}

                  <StepNavigation
                    currentStep={currentStep}
                    totalSteps={4}
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    isFirstStep={currentStep === 1}
                    isLastStep={currentStep === 4}
                    isValid={true}
                    isSubmitting={isSubmitting}
                  />
                </form>
              </Form>
            </FormProvider>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
