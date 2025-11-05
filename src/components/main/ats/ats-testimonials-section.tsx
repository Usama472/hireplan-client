import { motion } from "framer-motion";
import { Star, Quote, TrendingUp, Users, CheckCircle, Building2 } from "lucide-react";

export function ATSTestimonialsSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.1,
        ease: "easeOut",
      },
    },
  };

  const testimonials = [
    {
      quote: "HirePlan ATS completely transformed our recruitment process. The job board integrations increased our qualified applicant pool by 300%, and the AI-powered screening saves us 25+ hours per week.",
      author: "Sarah Chen",
      title: "VP of Talent Acquisition",
      company: "TechCorp Solutions",
      industry: "Technology",
      employees: "5,000+",
      metrics: {
        improvement: "300% more qualified applicants",
        timeSaved: "25 hours/week",
        satisfaction: 5
      },
      image: "SC"
    },
    {
      quote: "The comprehensive reporting and EEO compliance features are exactly what we needed for our enterprise operations. The automated reporting keeps our hiring metrics accurate and up-to-date automatically.",
      author: "Michael Rodriguez",
      title: "Head of HR Operations",
      company: "Global Manufacturing Inc",
      industry: "Manufacturing",
      employees: "12,000+",
      metrics: {
        improvement: "98% compliance accuracy",
        timeSaved: "40 hours/month",
        satisfaction: 5
      },
      image: "MR"
    },
    {
      quote: "Moving from our old ATS to HirePlan was seamless. The multi-tenant architecture gives us the security we need, while the API integrations connect perfectly with our existing HR stack.",
      author: "Emily Watson",
      title: "CHRO",
      company: "Healthcare Partners",
      industry: "Healthcare",
      employees: "620+",
      metrics: {
        improvement: "50% faster time-to-hire",
        timeSaved: "15 hours/week",
        satisfaction: 5
      },
      image: "EW"
    },
    {
      quote: "The candidate experience is outstanding. Our applicants love the streamlined application process, and our recruiters appreciate the automated communication workflows and AI-generated follow-ups.",
      author: "David Park",
      title: "Talent Acquisition Director",
      company: "Financial Services Group",
      industry: "Finance",
      employees: "6,200+",
      metrics: {
        improvement: "85% candidate satisfaction",
        timeSaved: "30 hours/week",
        satisfaction: 5
      },
      image: "DP"
    }
  ];

  const caseStudies = [
    {
      company: "TechCorp Solutions",
      challenge: "Manual resume screening taking 40+ hours per week",
      solution: "AI-powered candidate screening and job board integrations",
      results: [
        "300% increase in qualified applicants",
        "90% reduction in manual screening time", 
        "25 hours saved per week",
        "50% faster time-to-hire"
      ],
      industry: "Technology",
      employees: "5,000+"
    },
    {
      company: "Healthcare Partners", 
      challenge: "Complex EEO compliance reporting across multiple locations",
      solution: "Automated EEO reporting and compliance tracking system",
      results: [
        "100% automated compliance reporting",
        "Zero compliance violations in 18 months",
        "40 hours saved monthly on reporting",
        "98% audit accuracy rate"
      ],
      industry: "Healthcare",
      employees: "620+"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center space-x-2 bg-green-50 text-green-600 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-green-200"
          >
            <Star className="h-4 w-4" />
            <span>Client Success Stories</span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 tracking-tight"
          >
            Proven{" "}
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              ATS Results
            </span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            See how enterprise clients achieve measurable results with HirePlan ATS, 
            from growing companies to established enterprises.
          </motion.p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-lg relative"
              style={{ 
                transition: 'box-shadow 0.2s ease',
                willChange: 'auto'
              }}
            >
              <Quote className="absolute top-4 right-4 h-8 w-8 text-blue-200" />
              
              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.metrics.satisfaction)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              
              {/* Quote */}
              <blockquote className="text-gray-700 mb-6 italic leading-relaxed text-lg">
                "{testimonial.quote}"
              </blockquote>
              
              {/* Metrics */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                    <span className="font-semibold text-green-700">{testimonial.metrics.improvement}</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="font-semibold text-blue-700">{testimonial.metrics.timeSaved} saved</span>
                  </div>
                </div>
              </div>

              {/* Author */}
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">
                    {testimonial.image}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.author}</div>
                  <div className="text-sm text-gray-600">{testimonial.title}</div>
                  <div className="text-xs text-blue-600 font-medium">{testimonial.company}</div>
                  <div className="text-xs text-gray-500">
                    {testimonial.industry} • {testimonial.employees} employees
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Case Studies */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.h3
            variants={itemVariants}
            className="text-3xl font-bold text-gray-900 text-center mb-12"
          >
            Detailed Case Studies
          </motion.h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {caseStudies.map((study, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-lg"
                style={{ 
                  transition: 'box-shadow 0.2s ease',
                  willChange: 'auto'
                }}
              >
                <div className="flex items-center mb-6">
                  <Building2 className="h-6 w-6 text-blue-600 mr-3" />
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{study.company}</h4>
                    <p className="text-sm text-gray-600">{study.industry} • {study.employees} employees</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h5 className="font-semibold text-gray-900 mb-2">Challenge:</h5>
                  <p className="text-gray-600 text-sm leading-relaxed">{study.challenge}</p>
                </div>

                <div className="mb-6">
                  <h5 className="font-semibold text-gray-900 mb-2">HirePlan Solution:</h5>
                  <p className="text-gray-600 text-sm leading-relaxed">{study.solution}</p>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Measurable Results:</h5>
                  <div className="space-y-2">
                    {study.results.map((result, resultIndex) => (
                      <div key={resultIndex} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-gray-700">{result}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Success Metrics */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl sm:text-3xl font-bold mb-6">
              Join 200+ Successful Companies
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">98%</div>
                <div className="text-white/90 text-sm">Client Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">50%</div>
                <div className="text-white/90 text-sm">Faster Hiring</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">300%</div>
                <div className="text-white/90 text-sm">More Applicants</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">25+</div>
                <div className="text-white/90 text-sm">Hours Saved/Week</div>
              </div>
            </div>

            <button 
              className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-bold text-lg"
              style={{ 
                transition: 'background-color 0.2s ease',
                willChange: 'auto'
              }}
            >
              Get Your Success Story
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
