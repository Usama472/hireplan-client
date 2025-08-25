import { Upload, Brain, CheckCircle, ArrowRight } from 'lucide-react'

export function HowItWorksSection() {
  const steps = [
    {
      icon: Upload,
      step: '01',
      title: 'Post Your Job',
      description: 'Create detailed job postings with requirements, skills, and company culture. Our platform guides you through best practices.',
      color: 'blue'
    },
    {
      icon: Brain,
      step: '02', 
      title: 'AI Matches Candidates',
      description: 'Our advanced AI analyzes resumes, skills, and experience to rank candidates by fit. Get instant shortlists of top prospects.',
      color: 'purple'
    },
    {
      icon: CheckCircle,
      step: '03',
      title: 'Hire with Confidence',
      description: 'Review AI insights, collaborate with your team, and make data-driven hiring decisions faster than ever.',
      color: 'green'
    }
  ]

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-100">
            <Brain className="h-4 w-4" />
            <span>How It Works</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Hiring made simple in 3 steps
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From job posting to hiring decision, HirePlan streamlines your entire recruitment process
          </p>
        </div>

        <div className="relative">
          {/* Steps */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-12 h-0.5 bg-gradient-to-r from-blue-300 to-purple-300 transform translate-x-0 z-0">
                    <ArrowRight className="absolute -right-2 -top-2 h-4 w-4 text-blue-500" />
                  </div>
                )}
                
                <div className="relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:-translate-y-2">
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 bg-gradient-to-br from-blue-600 to-purple-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg">
                    {step.step}
                  </div>
                  
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 ${
                    step.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                    step.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    <step.icon className="h-8 w-8" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-4 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="text-left">
              <p className="font-semibold text-gray-900">Ready to transform your hiring?</p>
              <p className="text-sm text-gray-600">Get started today - no credit card required</p>
            </div>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </section>
  )
} 