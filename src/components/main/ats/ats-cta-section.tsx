import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Building2, 
  Calendar, 
  Phone, 
  Mail, 
  FileText, 
  CheckCircle,
  Zap,
  Shield,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useNavigate } from "react-router-dom";

export function ATSCTASection() {
  const navigate = useNavigate();

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

  const contactOptions = [
    {
      icon: Calendar,
      title: "Schedule ATS Demo",
      description: "Live demonstration of HirePlan ATS features and integrations",
      action: "Book Demo Call",
      color: "from-blue-500 to-blue-600",
      recommended: true
    },
    {
      icon: FileText,
      title: "Request Proposal",
      description: "Detailed proposal with pricing and implementation timeline",
      action: "Get Proposal",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Phone,
      title: "Technical Consultation",
      description: "Discuss API integrations and technical requirements",
      action: "Talk to Engineers",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Mail,
      title: "Partnership Inquiry",
      description: "Explore partnership opportunities and enterprise solutions",
      action: "Contact Sales",
      color: "from-orange-500 to-orange-600"
    }
  ];

  const benefits = [
    "Multi-platform job board ready",
    "EEO compliance built-in",
    "Enterprise API with 99.9% uptime",
    "24/7 dedicated support",
    "Custom implementation included",
    "Multi-tenant secure architecture"
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-medium mb-8 border border-white/30"
          >
            <Building2 className="h-4 w-4" />
            <span>Ready for Enterprise ATS?</span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight"
          >
            Start Your{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              ATS Journey
            </span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8"
          >
            Join 200+ companies using HirePlan ATS for comprehensive recruitment management. 
            Get started with comprehensive job board integrations and enterprise-grade features.
          </motion.p>

          {/* Key Benefits */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12"
          >
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center justify-center sm:justify-start bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                <span className="text-white text-sm font-medium">{benefit}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Contact Options */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16"
        >
          {contactOptions.map((option, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className={`bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 hover:bg-white/15 relative ${
                option.recommended ? 'ring-2 ring-yellow-400/50' : ''
              }`}
            >
              {option.recommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">
                    RECOMMENDED
                  </span>
                </div>
              )}
              
              <div className={`w-12 h-12 bg-gradient-to-r ${option.color} rounded-lg flex items-center justify-center mb-6`}>
                <option.icon className="h-6 w-6 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3">
                {option.title}
              </h3>
              
              <p className="text-white/80 mb-6 leading-relaxed">
                {option.description}
              </p>
              
              <Button 
                className="w-full bg-white text-gray-900 hover:bg-gray-100 font-semibold"
                onClick={() => navigate(ROUTES.CONTACT)}
              >
                {option.action}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </motion.div>
          ))}
        </motion.div>

        {/* Enterprise Features Highlight */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6">
              Enterprise-Ready ATS Platform
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <Zap className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
                <h4 className="text-white font-semibold mb-2">Lightning Fast</h4>
                <p className="text-white/80 text-sm">
                  &lt; 200ms API response times with 99.9% uptime guarantee
                </p>
              </div>
              
              <div className="text-center">
                <Shield className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                <h4 className="text-white font-semibold mb-2">Enterprise Security</h4>
                <p className="text-white/80 text-sm">
                  SOC 2 compliant with multi-tenant architecture
                </p>
              </div>
              
              <div className="text-center">
                <Globe className="h-8 w-8 text-green-400 mx-auto mb-3" />
                <h4 className="text-white font-semibold mb-2">Global Scale</h4>
                <p className="text-white/80 text-sm">
                  Supporting 200+ companies with 8K+ annual job postings
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold px-8 py-4 text-lg"
                onClick={() => navigate(ROUTES.CONTACT)}
              >
                <Building2 className="h-5 w-5 mr-2" />
                Get Started Today
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg"
                onClick={() => navigate(ROUTES.CONTACT)}
              >
                Learn More
              </Button>
            </div>

            <p className="mt-6 text-white/70 text-sm">
              No setup fees • Custom implementation included • 30-day trial available
            </p>
          </div>
        </motion.div>

        {/* Final Trust Indicators */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-flex flex-wrap justify-center items-center gap-4 text-sm text-white/80">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Enterprise ATS Platform</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
              <Shield className="w-4 h-4 text-blue-400" />
              <span>SOC 2 Compliant</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
              <Globe className="w-4 h-4 text-purple-400" />
              <span>Fortune 500 Trusted</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
