import { ArrowRight, Zap, Clock, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useAuthSessionContext from '@/lib/context/AuthSessionContext'

export function CTASection() {
  const navigate = useNavigate()
  const { status } = useAuthSessionContext()

  const benefits = [
    { icon: Clock, text: 'Setup in 5 minutes' },
    { icon: Shield, text: 'No credit card required' },
    { icon: Zap, text: 'AI-powered matching' }
  ]

  return (
    <section className="py-12 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Main Content */}
          <div className="max-w-3xl mx-auto mb-12">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Ready to revolutionize
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                your hiring process?
              </span>
            </h2>
            <p className="text-xl text-blue-100 leading-relaxed mb-8">
              Join thousands of companies already using HirePlan to find better candidates faster with AI-powered matching.
            </p>
          </div>

          {/* Benefits */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 mb-12">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-2 text-blue-100">
                <benefit.icon className="h-5 w-5" />
                <span className="font-medium">{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          {status !== 'authenticated' ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate('/signup')}
                className="group bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="group border-2 border-white text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-blue-600 transition-all duration-200 flex items-center space-x-2"
              >
                <span>Schedule Demo</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/dashboard')}
              className="group bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center space-x-2 mx-auto"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          )}


        </div>
      </div>
    </section>
  )
} 