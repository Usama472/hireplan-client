import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Check, Zap } from 'lucide-react'
import { PLANS } from '@/constants/form-constants'

export function PricingSection() {
  const navigate = useNavigate()

  return (
    <section id='pricing' className='py-12 bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-12'>
          <div className='inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-100'>
            <Zap className='h-4 w-4' />
            <span>Simple Pricing</span>
          </div>
          <h2 className='text-4xl sm:text-5xl font-bold text-gray-900 mb-6'>
            Plans that grow
            <span className='block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
              with your business
            </span>
          </h2>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            Start free, scale as you grow. All plans include our core AI
            matching technology, bias-free hiring, and 24/7 expert support.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto'>
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`relative transition-all duration-300 hover:shadow-2xl ${
                plan.popular
                  ? 'border-blue-500 shadow-xl scale-105 bg-white'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              {plan.popular && (
                <div className='absolute -top-4 left-1/2 transform -translate-x-1/2'>
                  <span className='bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg'>
                    Most Popular
                  </span>
                </div>
              )}

              <CardHeader className='text-center pb-8 pt-8'>
                <CardTitle className='text-2xl font-bold mb-2'>
                  {plan.name}
                </CardTitle>
                <div className='flex items-baseline justify-center mb-4'>
                  <span className='text-5xl font-bold text-gray-900'>
                    {plan.price}
                  </span>
                  <span className='text-gray-500 ml-2'>{plan.period}</span>
                </div>
                <CardDescription className='text-base text-gray-600'>
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className='pt-0'>
                <ul className='space-y-4 mb-8'>
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className='flex items-start'>
                      <Check className='h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0' />
                      <span className='text-gray-700'>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full py-3 text-base font-semibold transition-all duration-200 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                  onClick={() =>
                    navigate('/signup', {
                      state: { planId: plan.id },
                    })
                  }
                >
                  {plan.id === 'enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className='text-center mt-16'>
          <p className='text-gray-600 mb-6'>
            Need a custom solution? We offer enterprise packages with dedicated
            support.
          </p>
          <Button
            variant='outline'
            size='lg'
            className='border-2 bg-transparent'
            onClick={() => navigate('/demo')}
          >
            Schedule a Demo
          </Button>
        </div>
      </div>
    </section>
  )
}
