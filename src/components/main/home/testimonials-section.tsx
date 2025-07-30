import { Star, Quote } from 'lucide-react'

export function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Head of Talent',
      company: 'TechFlow Inc.',
      image: '👩‍💼',
      rating: 5,
      content: 'HirePlan transformed our hiring process completely. We went from spending weeks screening candidates to finding perfect matches in days. The AI accuracy is incredible.',
      results: '70% faster hiring'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'VP of People',
      company: 'GrowthLabs',
      image: '👨‍💼',
      rating: 5,
      content: 'The bias-free hiring feature has been a game-changer for building diverse teams. Our candidate quality has improved dramatically since switching to HirePlan.',
      results: '3x better retention'
    },
    {
      name: 'Emily Watson',
      role: 'Founder & CEO',
      company: 'StartupVibe',
      image: '👩‍💻',
      rating: 5,
      content: 'As a startup, we needed an efficient hiring solution that could scale with us. HirePlan delivered exactly that - powerful AI matching at an affordable price.',
      results: '50+ successful hires'
    }
  ]

  const companyLogos = [
    { name: 'TechFlow', logo: '🚀' },
    { name: 'GrowthLabs', logo: '📈' },
    { name: 'StartupVibe', logo: '⚡' },
    { name: 'InnovateCorp', logo: '💡' },
    { name: 'DataDriven', logo: '📊' },
    { name: 'CloudFirst', logo: '☁️' }
  ]

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-green-100">
            <Star className="h-4 w-4 fill-current" />
            <span>Customer Stories</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Loved by hiring teams everywhere
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how companies are transforming their recruitment with HirePlan's AI-powered platform
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 group">
              {/* Quote Icon */}
              <div className="flex items-center justify-between mb-6">
                <Quote className="h-8 w-8 text-blue-500 opacity-50" />
                <div className="flex items-center space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>

              {/* Content */}
              <blockquote className="text-gray-700 leading-relaxed mb-6 italic">
                "{testimonial.content}"
              </blockquote>

              {/* Results Badge */}
              <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-6">
                ✨ {testimonial.results}
              </div>

              {/* Author */}
              <div className="flex items-center space-x-4">
                <div className="text-3xl">{testimonial.image}</div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-sm font-medium text-blue-600">{testimonial.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Company Logos */}
        <div className="text-center">
          <p className="text-gray-500 text-sm font-medium mb-8 uppercase tracking-wide">
            Trusted by innovative companies
          </p>
          <div className="flex items-center justify-center space-x-8 opacity-60 hover:opacity-80 transition-opacity">
            {companyLogos.map((company, index) => (
              <div key={index} className="flex items-center space-x-2 text-gray-600">
                <span className="text-2xl">{company.logo}</span>
                <span className="font-medium hidden sm:block">{company.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
} 