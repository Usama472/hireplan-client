import { TrendingUp, Users, Clock, Target } from 'lucide-react'

export function StatsSection() {
  const stats = [
    {
      icon: TrendingUp,
      value: '95%',
      label: 'Match Accuracy',
      description: 'AI-powered candidate matching precision'
    },
    {
      icon: Clock,
      value: '70%',
      label: 'Faster Hiring',
      description: 'Reduce time-to-hire with automation'
    },
    {
      icon: Users,
      value: '10K+',
      label: 'Successful Hires',
      description: 'Candidates placed through our platform'
    },
    {
      icon: Target,
      value: '500+',
      label: 'Companies Trust Us',
      description: 'From startups to Fortune 500s'
    }
  ]

  return (
    <section className="py-8 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Trusted by leading companies worldwide
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See why thousands of recruiters choose HirePlan to transform their hiring process
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <stat.icon className="h-8 w-8" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <div className="text-lg font-semibold text-gray-700 mb-1">{stat.label}</div>
              <div className="text-sm text-gray-500">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 