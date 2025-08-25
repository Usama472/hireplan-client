import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle, Link } from 'lucide-react'

export function CTASection() {
  return (
    <section className='py-24 relative overflow-hidden'>
      {/* Background */}
      <div className='absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700'></div>
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=1200')] opacity-10"></div>

      <div className='relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
        <h2 className='text-4xl sm:text-5xl font-bold text-white mb-6'>
          Ready to transform your hiring?
        </h2>
        <p className='text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed'>
          Join thousands of companies using HirePlan to find better candidates
          faster. Get started today and see the difference AI can make.
        </p>

        {/* Benefits */}
        <div className='flex flex-col sm:flex-row gap-6 justify-center items-center mb-10 text-blue-100'>
          <div className='flex items-center'>
            <CheckCircle className='h-5 w-5 mr-2' />
            <span>AI-powered matching</span>
          </div>
          <div className='flex items-center'>
            <CheckCircle className='h-5 w-5 mr-2' />
            <span>No credit card required</span>
          </div>
          <div className='flex items-center'>
            <CheckCircle className='h-5 w-5 mr-2' />
            <span>Setup in 5 minutes</span>
          </div>
        </div>

        <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
          <Button
            size='lg'
            className='text-lg px-8 py-4 bg-white text-blue-600 hover:bg-gray-50 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 font-semibold'
            asChild
          >
            <Link href='/onboarding'>
              Get Started
              <ArrowRight className='ml-2 h-5 w-5' />
            </Link>
          </Button>
          <Button
            size='lg'
            variant='outline'
            className='text-lg px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-200 bg-transparent font-semibold'
          >
            Schedule Demo
          </Button>
        </div>
      </div>
    </section>
  )
}
