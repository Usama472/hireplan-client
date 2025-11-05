import { motion } from "framer-motion";
import { 
  Database, 
  Users, 
  Calendar, 
  BarChart3, 
  Mail, 
  MessageSquare, 
  FileText, 
  Settings,
  Bot,
  Shield,
  Globe,
  Zap
} from "lucide-react";

export function ATSFeaturesSection() {
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

  const features = [
    {
      icon: Database,
      title: "Complete Application Management",
      description: "Track, sort, screen, and report on all job applications with comprehensive candidate pipeline management.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Users,
      title: "Advanced Candidate Screening",
      description: "AI-powered resume analysis, custom screening questions, and automated candidate scoring and ranking.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Calendar,
      title: "Interview Management",
      description: "Automated interview scheduling, calendar integrations, and interview feedback collection systems.",
      color: "from-green-500 to-green-600"
    },
    {
      icon: BarChart3,
      title: "Comprehensive Reporting",
      description: "Advanced analytics, hiring metrics, and customizable reports for data-driven recruitment decisions.",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: Mail,
      title: "Automated Communications",
      description: "Email templates, automated responses, and personalized candidate communication workflows.",
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: MessageSquare,
      title: "Candidate Chat Portal",
      description: "Built-in messaging system for real-time communication between recruiters and candidates.",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      icon: FileText,
      title: "Career Page Hosting",
      description: "Branded career sites for clients with custom job applications and candidate registration portals.",
      color: "from-teal-500 to-teal-600"
    },
    {
      icon: Settings,
      title: "Workflow Automation",
      description: "Custom automation rules, trigger-based actions, and streamlined recruitment processes.",
      color: "from-red-500 to-red-600"
    },
    {
      icon: Bot,
      title: "AI-Powered Analysis",
      description: "Intelligent resume parsing, candidate matching, and AI-generated follow-up responses.",
      color: "from-cyan-500 to-cyan-600"
    },
    {
      icon: Shield,
      title: "EEO Compliance",
      description: "Built-in Equal Employment Opportunity reporting and compliance tracking for US-based clients.",
      color: "from-violet-500 to-violet-600"
    },
    {
      icon: Globe,
      title: "Multi-Tenant Architecture",
      description: "Secure, scalable platform with complete data isolation between client organizations.",
      color: "from-emerald-500 to-emerald-600"
    },
    {
      icon: Zap,
      title: "Advanced Analytics",
      description: "Comprehensive reporting, hiring metrics, and data-driven insights for recruitment optimization.",
      color: "from-yellow-500 to-yellow-600"
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
            className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-200"
          >
            <Database className="h-4 w-4" />
            <span>Complete ATS Solution</span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 tracking-tight"
          >
            Everything You Need in an{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Enterprise ATS
            </span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            HirePlan ATS provides comprehensive applicant tracking and recruitment management 
            capabilities designed for enterprise clients and growing organizations.
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg group"
              style={{ 
                transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                willChange: 'auto'
              }}
            >
              <div 
                className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110`}
                style={{ 
                  transition: 'transform 0.2s ease',
                  willChange: 'auto'
                }}
              >
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              
              <h3 
                className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600"
                style={{ 
                  transition: 'color 0.2s ease',
                  willChange: 'auto'
                }}
              >
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to Streamline Your Recruitment Process?
            </h3>
            <p className="text-xl mb-6 text-white/90">
              Join 200+ companies using HirePlan ATS for comprehensive talent management.
            </p>
            <button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-bold text-lg transition-colors">
              Schedule ATS Demo
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
