'use client'

import { JobAdStep } from '@/components/dashboard/jobs/common/job-ad-step'
import { PositionDetailsStep } from '@/components/dashboard/jobs/common/position-details-step'
import { ReviewPublishStep } from '@/components/dashboard/jobs/common/review-publish-step'
import { SettingsNotificationsStep } from '@/components/dashboard/jobs/common/settings-notifications-step'
import { StepNavigation } from '@/components/main/signup/stepNavigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { ROUTES } from '@/constants'
import { stepFields } from '@/constants/form-constants'
import {
  JOB_FORM_DEFAULT_VALUES,
  JOB_FORM_TEST_DATA,
} from '@/constants/job-form-defaults'
import API from '@/http'
import { errorResolver } from '@/lib/utils'
import {
  jobFormSchema,
  type JobFormSchema,
} from '@/lib/validations/forms/job-form-schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { data, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { CustomQuestionsBuilder } from '../common/custom-questions-builder'

export default function CreateJob() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  const form = useForm<JobFormSchema>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: JOB_FORM_DEFAULT_VALUES,
    mode: 'onChange',
  })

  const { trigger, handleSubmit, clearErrors, setValue } = form

  const loadTestData = () => {
    Object.keys(JOB_FORM_TEST_DATA).forEach((key) => {
      setValue(key as keyof JobFormSchema, (JOB_FORM_TEST_DATA as any)[key])
    })
    toast.success('Test data loaded successfully!')
  }

  const handleNext = async () => {
    clearErrors()

    if (currentStep === 4) {
      setCurrentStep((prev) => Math.min(prev + 1, 5))
      return
    }

    const fieldsToValidate = stepFields[currentStep as keyof typeof stepFields]
    const isStepValid = await trigger(fieldsToValidate as any, {
      shouldFocus: true,
    })

    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 5))
      clearErrors()
    }
  }

  const handlePrevious = () => {
    clearErrors()
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const onSubmit = async (data: JobFormSchema) => {
    if (currentStep !== 5) return

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
        return (
          <CustomQuestionsBuilder
            name='customQuestions'
            label='Custom Screening Questions'
            description='Add custom questions to screen applicants and gather specific information during the application process'
          />
        )
      case 5:
        return <ReviewPublishStep />
      default:
        return <JobAdStep />
    }
  }

  return (
    <main className='pb-16'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='mb-2'>
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

        <Card className='shadow-sm border-0 bg-white'>
          <CardContent className='p-8 sm:p-12'>
            <FormProvider {...form}>
              <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
                  {renderCurrentStep()}
                  <StepNavigation
                    currentStep={currentStep}
                    totalSteps={5}
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    isFirstStep={currentStep === 1}
                    isLastStep={currentStep === 5}
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
