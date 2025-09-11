import { Button } from "@/components/ui/button";
import {
  Rocket,
  ArrowRight,
  Users,
  Briefcase,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";

export function HeroSection() {
  // Simplified animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="relative pt-12 sm:pt-16 pb-8 sm:pb-12 overflow-hidden bg-primary min-h-[80vh] sm:min-h-[90vh] flex items-center">
      {/* Simplified background */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10"></div>

      {/* Single floating element for performance */}
      <div className="absolute top-10 sm:top-20 right-5 sm:right-10 w-32 sm:w-64 h-32 sm:h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center max-w-3xl mx-auto">
          {/* Trust Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/30"
          >
            <div className="w-2 h-2 bg-secondary rounded-full"></div>
            <span>Trusted by 500+ Companies</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 tracking-tight leading-tight"
          >
            Hire the right talent{" "}
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              10x faster
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed mb-6 sm:mb-8 px-2"
          >
            AI-powered candidate matching that eliminates 90% of manual screening. 
            Find perfect candidates in minutes, not weeks.
          </motion.p>

          {/* Key Benefits - Simplified */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8 max-w-3xl mx-auto px-2"
          >
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 sm:p-4 text-center">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Briefcase className="h-5 sm:h-6 w-5 sm:w-6 text-white" />
              </div>
              <h3 className="text-white font-semibold text-xs sm:text-sm mb-1 sm:mb-2">Job Management</h3>
              <p className="text-white/70 text-xs">Create and manage job postings</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 sm:p-4 text-center">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Users className="h-5 sm:h-6 w-5 sm:w-6 text-white" />
              </div>
              <h3 className="text-white font-semibold text-xs sm:text-sm mb-1 sm:mb-2">AI Screening</h3>
              <p className="text-white/70 text-xs">Automatically evaluate candidates</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 sm:p-4 text-center">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Zap className="h-5 sm:h-6 w-5 sm:w-6 text-white" />
              </div>
              <h3 className="text-white font-semibold text-xs sm:text-sm mb-1 sm:mb-2">Auto Communication</h3>
              <p className="text-white/70 text-xs">Send AI-generated messages</p>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div variants={itemVariants} className="mb-6 sm:mb-8 px-2">
            <Button
              size="lg"
              className="h-11 sm:h-12 px-6 sm:px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base w-full sm:w-auto"
            >
              <Rocket className="h-4 w-4 mr-2" />
              Get Started
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>

          {/* Trust Indicators - Simplified */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 text-sm text-white/80 px-2"
          >
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full border border-white/10">
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              <span className="font-medium text-xs">Secure & Private</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full border border-white/10">
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              <span className="font-medium text-xs">AI-Powered</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full border border-white/10">
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              <span className="font-medium text-xs">Fast & Easy</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}