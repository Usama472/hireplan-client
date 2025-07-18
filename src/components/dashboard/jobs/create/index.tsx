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

  const { trigger, handleSubmit, clearErrors } = form

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
