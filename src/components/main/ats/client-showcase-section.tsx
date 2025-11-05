import { motion } from "framer-motion";
import { Building2, Users, Star, CheckCircle } from "lucide-react";

export function ClientShowcaseSection() {
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

  // Client logos and information (using placeholder company names)
  const clients = [
    { name: "TechCorp Solutions", employees: "450+", industry: "Technology" },
    { name: "Global Manufacturing Inc", employees: "680+", industry: "Manufacturing" },
    { name: "Healthcare Partners", employees: "320+", industry: "Healthcare" },
    { name: "Financial Services Group", employees: "520+", industry: "Finance" },
    { name: "Retail Excellence Co", employees: "890+", industry: "Retail" },
    { name: "Energy Solutions Ltd", employees: "410+", industry: "Energy" },
    { name: "Education Network", employees: "280+", industry: "Education" },
    { name: "Logistics Masters", employees: "560+", industry: "Logistics" },
    { name: "Construction Leaders", employees: "190+", industry: "Construction" },
    { name: "Media & Entertainment", employees: "160+", industry: "Media" },
    { name: "Automotive Dynamics", employees: "640+", industry: "Automotive" },
    { name: "Pharma Innovations", employees: "380+", industry: "Pharmaceutical" },
    { name: "Real Estate Ventures", employees: "125+", industry: "Real Estate" },
    { name: "Insurance Providers", employees: "490+", industry: "Insurance" },
    { name: "Software Systems", employees: "240+", industry: "Software" },
    { name: "Consulting Excellence", employees: "290+", industry: "Consulting" },
    { name: "Aerospace Technologies", employees: "420+", industry: "Aerospace" },
    { name: "Food & Beverage Corp", employees: "610+", industry: "Food & Beverage" },
    { name: "Telecommunications Inc", employees: "530+", industry: "Telecom" },
    { name: "Chemical Industries", employees: "270+", industry: "Chemical" },
    { name: "Transportation Group", employees: "350+", industry: "Transportation" },
    { name: "Hospitality Partners", employees: "310+", industry: "Hospitality" },
    { name: "Legal Services Network", employees: "95+", industry: "Legal" },
    { name: "Agricultural Solutions", employees: "2,700+", industry: "Agriculture" }
  ];

  const testimonials = [
    {
      quote: "HirePlan ATS transformed our recruitment process. The job board integrations have increased our qualified applicant pool by 300%.",
      author: "Sarah Johnson",
      title: "VP of Talent Acquisition",
      company: "TechCorp Solutions",
      rating: 5
    },
    {
      quote: "The AI-powered screening saves our team 20+ hours per week. We can focus on engaging with top candidates instead of manual resume reviews.",
      author: "Michael Chen",
      title: "Head of HR",
      company: "Global Manufacturing Inc",
      rating: 5
    },
    {
      quote: "EEO compliance reporting is seamless, and the automated disposition sync keeps our hiring metrics accurate and up-to-date.",
      author: "Emma Rodriguez",
      title: "Recruitment Director",
      company: "Healthcare Partners",
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-white">
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
            <Building2 className="h-4 w-4" />
            <span>Trusted by Enterprise Clients</span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 tracking-tight"
          >
            Trusted by{" "}
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              200+ Companies
            </span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12"
          >
            From Fortune 500 enterprises to growing businesses, organizations worldwide 
            trust HirePlan ATS for their complete recruitment and talent management needs.
          </motion.p>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-16"
          >
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">200+</div>
              <div className="text-gray-600">Enterprise Clients</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">8K+</div>
              <div className="text-gray-600">Annual Job Postings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-purple-600 mb-2">50K+</div>
              <div className="text-gray-600">Successful Hires</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-orange-600 mb-2">98%</div>
              <div className="text-gray-600">Client Satisfaction</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Client Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="mb-20"
        >
          <motion.h3
            variants={itemVariants}
            className="text-2xl font-bold text-gray-900 text-center mb-12"
          >
            Our Enterprise ATS Clients Include:
          </motion.h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {clients.map((client, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-blue-300 hover:shadow-md group"
                style={{ 
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  willChange: 'auto'
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <Building2 className="h-5 w-5 text-blue-600 group-hover:text-blue-700" />
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <h4 
                  className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600"
                  style={{ 
                    transition: 'color 0.2s ease',
                    willChange: 'auto'
                  }}
                >
                  {client.name}
                </h4>
                <div className="text-sm text-gray-600 mb-1">
                  <Users className="h-3 w-3 inline mr-1" />
                  {client.employees} employees
                </div>
                <div className="text-xs text-blue-600 font-medium">
                  {client.industry}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials */}
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
            What Our ATS Clients Say
          </motion.h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl"
                style={{ 
                  transition: 'box-shadow 0.2s ease',
                  willChange: 'auto'
                }}
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <blockquote className="text-gray-700 mb-6 italic leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold text-sm">
                      {testimonial.author.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-600">{testimonial.title}</div>
                    <div className="text-xs text-blue-600 font-medium">{testimonial.company}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
