import { Button } from '@/components/ui/button'
import useAuthSessionContext from '@/lib/context/AuthSessionContext'
import { ArrowRight, Star, TrendingUp, Users, Zap } from 'lucide-react'
import { useNavigate } from 'react-router'


export function HeroSection() {
  const navigate = useNavigate()
  const { status } = useAuthSessionContext()
  return (
    <section className='relative pt-20 pb-12 overflow-hidden'>
      {/* Background Elements */}
      <div className='absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/30'></div>
      <div className='absolute top-20 left-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse'></div>
      <div className='absolute top-40 right-10 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000'></div>

      <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center max-w-4xl mx-auto'>
          {/* Trust Badge */}
          <div className='inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8 border border-blue-100'>
            <Star className='h-4 w-4 fill-current' />
            <span>Trusted by 500+ companies worldwide</span>
          </div>

          {/* Main Headline */}
          <h1 className='text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6'>
            Hire the right talent{' '}
            <span className='bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent'>
              10x faster
            </span>
          </h1>

          {/* Subheadline */}
          <p className='text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-10'>
            AI-powered candidate matching that eliminates 90% of manual
            screening. Find perfect candidates in minutes, not weeks.
          </p>

          {/* CTA Buttons */}
          {status !== 'authenticated' ? (
            <div className='flex flex-col sm:flex-row gap-4 justify-center items-center mb-12'>
              <Button 
                size='lg' 
                className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 text-lg px-8 py-4 h-auto'
                onClick={() => navigate('/signup')}
              >
                Start Free Trial
                <ArrowRight className='ml-2 h-5 w-5' />
              </Button>
              <Button 
                variant='outline' 
                size='lg'
                className='border-2 border-gray-300 hover:border-gray-400 text-lg px-8 py-4 h-auto'
                onClick={() => navigate('/contact')}
              >
                Watch Demo
              </Button>
            </div>
          ) : (
            <div className='flex justify-center items-center mb-12'>
              <Button 
                size='lg' 
                className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 text-lg px-8 py-4 h-auto'
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
                <ArrowRight className='ml-2 h-5 w-5' />
              </Button>
            </div>
          )}

          {/* Trust Indicators */}
          <p className='text-sm text-gray-500 mb-16'>
            ✓ No credit card required ✓ 14-day free trial ✓ Setup in 5 minutes
          </p>
        </div>

        {/* Stats Section */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto'>
          <div className='text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-lg'>
            <div className='inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4'>
              <TrendingUp className='h-6 w-6 text-blue-600' />
            </div>
            <div className='text-3xl font-bold text-gray-900 mb-2'>70%</div>
            <div className='text-gray-600'>Faster hiring process</div>
          </div>
          <div className='text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-lg'>
            <div className='inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-4'>
              <Zap className='h-6 w-6 text-green-600' />
            </div>
            <div className='text-3xl font-bold text-gray-900 mb-2'>95%</div>
            <div className='text-gray-600'>Match accuracy rate</div>
          </div>
          <div className='text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-lg'>
            <div className='inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-4'>
              <Users className='h-6 w-6 text-purple-600' />
            </div>
            <div className='text-3xl font-bold text-gray-900 mb-2'>10K+</div>
            <div className='text-gray-600'>Successful hires</div>
          </div>
        </div>


      </div>
    </section>
  )
}
