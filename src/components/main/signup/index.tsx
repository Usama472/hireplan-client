import RecruiterOnboardingForm from '@/components/forms/onboardingForm'

export default function Signup() {
  return (
    <div className='min-h-screen bg-gray-50 py-8 flex justify-center items-center'>
      <div className='max-w-4xl mx-auto px-4 w-full'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>
            Welcome to HirePlan
          </h1>
          <p className='text-gray-600 mt-2'>
            Let's set up your account to get started
          </p>
        </div>
        <RecruiterOnboardingForm />
      </div>
    </div>
  )
}
