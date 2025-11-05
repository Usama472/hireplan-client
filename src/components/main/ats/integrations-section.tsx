import { motion } from "framer-motion";
import { 
  ExternalLink, 
  CheckCircle, 
  Shield, 
  Zap, 
  Database, 
  Settings,
  Globe,
  BarChart3,
  Users,
  FileText
} from "lucide-react";

export function IntegrationsSection() {
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

  const integrations = [
    {
      icon: ExternalLink,
      title: "Job Board Integrations",
      description: "Seamless application flow from major job boards directly into HirePlan ATS",
      features: [
        "Direct application import from job boards",
        "Automatic candidate profile creation",
        "Real-time application status sync",
        "Custom screening questions support"
      ],
      status: "Active",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: BarChart3,
      title: "Automated Reporting",
      description: "Comprehensive reporting of hiring outcomes and candidate status updates",
      features: [
        "Real-time status updates",
        "Hiring outcome tracking",
        "Performance metrics analysis",
        "Compliance reporting automation"
      ],
      status: "Active",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Shield,
      title: "EEO Compliance System",
      description: "Built-in Equal Employment Opportunity reporting and compliance tracking",
      features: [
        "Automated EEO-1 reporting",
        "Adverse impact analysis",
        "OFCCP compliance tracking",
        "Diversity metrics dashboard"
      ],
      status: "Required for US Clients",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Users,
      title: "Custom Screening Questions",
      description: "Advanced screening questions integrated with job application workflow",
      features: [
        "Dynamic question routing",
        "Conditional logic support",
        "Automatic disqualification rules",
        "Custom scoring algorithms"
      ],
      status: "Active",
      color: "from-orange-500 to-orange-600"
    }
  ];

  const technicalSpecs = [
    {
      icon: Database,
      title: "RESTful API",
      description: "Complete API access for custom integrations and third-party connections",
      details: "OAuth 2.0 authentication, rate limiting, webhook support"
    },
    {
      icon: Settings,
      title: "Webhook System",
      description: "Real-time event notifications for application status changes and updates",
      details: "Configurable endpoints, retry logic, failure handling"
    },
    {
      icon: Globe,
      title: "Multi-Tenant Architecture",
      description: "Secure, scalable platform with complete data isolation between clients",
      details: "Dedicated databases, role-based access, enterprise security"
    },
    {
      icon: Zap,
      title: "Enterprise SSO",
      description: "Single Sign-On integration with major identity providers",
      details: "SAML 2.0, Azure AD, Okta, Google Workspace compatibility"
    }
  ];

  return (
    <section id="integrations" className="py-20 bg-gray-50">
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
            className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-200"
          >
            <ExternalLink className="h-4 w-4" />
            <span>External Platform Integrations</span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 tracking-tight"
          >
            Comprehensive{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Platform Integrations
            </span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            HirePlan ATS provides comprehensive job board integrations, compliance features, 
            and enterprise-grade capabilities for seamless recruitment workflows.
          </motion.p>
        </motion.div>

        {/* Platform Integrations */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20"
        >
          {integrations.map((integration, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-lg"
              style={{ 
                transition: 'box-shadow 0.2s ease',
                willChange: 'auto'
              }}
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`w-12 h-12 bg-gradient-to-r ${integration.color} rounded-lg flex items-center justify-center`}>
                  <integration.icon className="h-6 w-6 text-white" />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  integration.status === 'Active' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-purple-100 text-purple-700'
                }`}>
                  {integration.status}
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {integration.title}
              </h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {integration.description}
              </p>

              <div className="space-y-2">
                {integration.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Technical Specifications */}
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
            Enterprise Technical Specifications
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {technicalSpecs.map((spec, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white rounded-lg p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md"
                style={{ 
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  willChange: 'auto'
                }}
              >
                <div className="flex items-center mb-4">
                  <spec.icon className="h-6 w-6 text-blue-600 mr-3" />
                  <h4 className="text-lg font-semibold text-gray-900">{spec.title}</h4>
                </div>
                
                <p className="text-gray-600 mb-3 leading-relaxed">
                  {spec.description}
                </p>
                
                <p className="text-sm text-blue-600 font-medium">
                  {spec.details}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Integration CTA */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready for Job Board Integration?
            </h3>
            <p className="text-xl mb-6 text-white/90">
              HirePlan ATS provides comprehensive integration capabilities for major job boards and platforms.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-bold text-lg"
                style={{ 
                  transition: 'background-color 0.2s ease',
                  willChange: 'auto'
                }}
              >
                Learn More About Integrations
              </button>
              <button 
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-bold text-lg"
                style={{ 
                  transition: 'background-color 0.2s ease, color 0.2s ease',
                  willChange: 'auto'
                }}
              >
                Contact Sales Team
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
