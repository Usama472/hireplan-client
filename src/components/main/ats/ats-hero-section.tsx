import { Button } from "@/components/ui/button";
import { Building2, ArrowRight, Users, Database, Zap, CheckCircle, Trophy, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { ROUTES } from "@/constants/routes";
import { useNavigate } from "react-router-dom";

export function ATSHeroSection() {
  const navigate = useNavigate();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02,
        delayChildren: 0.02,
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

  return (
    <section className="relative pt-12 sm:pt-16 pb-8 sm:pb-12 overflow-hidden bg-primary min-h-[85vh] flex items-center">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10"></div>
      <div className="absolute top-10 sm:top-20 right-5 sm:right-10 w-32 sm:w-64 h-32 sm:h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        style={{ willChange: 'auto' }}
      >
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-medium mb-8 border border-white/30"
          >
            <Trophy className="w-4 h-4 text-yellow-300" />
            <span>Enterprise ATS Solution</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-tight"
          >
            Enterprise{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              ATS Platform
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8"
          >
            Complete applicant tracking system with job board integrations, AI-powered screening, and comprehensive recruitment management for enterprise clients.
          </motion.p>

          {/* Key Stats */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10 max-w-4xl mx-auto"
          >
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">200+</div>
              <div className="text-white/80 text-sm">Enterprise Clients</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">8K+</div>
              <div className="text-white/80 text-sm">Job Postings Annually</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">99.9%</div>
              <div className="text-white/80 text-sm">Uptime Guarantee</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">24/7</div>
              <div className="text-white/80 text-sm">Enterprise Support</div>
            </div>
          </motion.div>

          {/* Core ATS Features Grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 max-w-5xl mx-auto"
          >
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-left" style={{ willChange: 'auto' }}>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Database className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Application Tracking</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Comprehensive candidate pipeline management with automated status updates and disposition tracking.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-left" style={{ willChange: 'auto' }}>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Candidate Screening</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                AI-powered resume analysis, custom screening questions, and automated candidate scoring.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-left" style={{ willChange: 'auto' }}>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Career Page Hosting</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Branded career sites for clients with custom job applications and candidate portals.
              </p>
            </div>
          </motion.div>

          {/* Compliance & Integration Badges */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center items-center gap-4 mb-10"
          >
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-300" />
              <span className="text-white font-medium text-sm">Job Board Ready</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-300" />
              <span className="text-white font-medium text-sm">Disposition Sync</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-300" />
              <span className="text-white font-medium text-sm">EEO Compliant</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-300" />
              <span className="text-white font-medium text-sm">Automated Workflows</span>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={() => navigate(ROUTES.CONTACT)} 
              className="bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg font-bold shadow-xl"
            >
              <Building2 className="h-5 w-5 mr-2" />
              Request ATS Demo
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg"
              onClick={() => navigate(ROUTES.CONTACT)}
            >
              Learn More
            </Button>
          </motion.div>

          {/* Trust Indicator */}
          <motion.p
            variants={itemVariants}
            className="mt-8 text-white/70 text-sm max-w-2xl mx-auto"
          >
            Trusted by 200+ growing companies and enterprises worldwide. 
            Complete applicant tracking and recruitment management solution.
          </motion.p>
        </div>
      </motion.div>
    </section>
  );
}
