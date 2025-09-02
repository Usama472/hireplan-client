import { Button } from "@/components/ui/button";
import {
  Rocket,
  Sparkles,
  ArrowRight,
  Users,
  Briefcase,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";

export function HeroSection() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const floatVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1,
        ease: "easeOut",
      },
    },
  };

  const trustBadgeVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const headlineVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const subheadlineVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: 0.2,
      },
    },
  };

  const benefitsVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: 0.4,
      },
    },
  };

  const ctaVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: 0.6,
      },
    },
  };

  const trustIndicatorsVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        delay: 0.8,
      },
    },
  };

  return (
    <section className="relative pt-16 pb-12 overflow-hidden bg-primary">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10"></div>

      {/* Floating Elements */}
      <motion.div
        variants={floatVariants}
        initial="hidden"
        animate="visible"
        className="absolute top-16 left-8 w-56 h-56 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
      ></motion.div>
      <motion.div
        variants={floatVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3 }}
        className="absolute top-32 right-8 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"
      ></motion.div>
      <motion.div
        variants={floatVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.6 }}
        className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-48 h-48 bg-gradient-to-r from-pink-400/20 to-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-500"
      ></motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center max-w-3xl mx-auto">
          {/* Trust Badge */}
          <motion.div
            variants={trustBadgeVariants}
            whileHover={{
              scale: 1.05,
              y: -3,
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              borderColor: "rgba(255, 255, 255, 0.3)",
            }}
            whileTap={{ scale: 0.98 }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
              backgroundColor: { duration: 0.2 },
              borderColor: { duration: 0.2 },
            }}
            className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm text-white/90 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/20 shadow-lg cursor-pointer group"
          >
            <motion.div
              whileHover={{ rotate: 360, scale: 1.2 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Sparkles className="h-4 w-4 text-yellow-400" />
            </motion.div>
            <motion.span
              whileHover={{ color: "rgba(255, 255, 255, 1)" }}
              transition={{ duration: 0.2 }}
              className="font-medium"
            >
              Trusted by 500+ companies worldwide
            </motion.span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            variants={headlineVariants}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4 tracking-tight"
          >
            Hire the right talent{" "}
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              10x faster
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={subheadlineVariants}
            className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed mb-8 font-light"
          >
            AI-powered candidate matching that eliminates 90% of manual screening. 
            Find perfect candidates in{" "}
            <span className="text-white font-medium">
              minutes, not weeks
            </span>.
          </motion.p>

          {/* Key Benefits Grid */}
          <motion.div
            variants={benefitsVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto"
          >
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -5 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Briefcase className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-white font-semibold text-sm mb-3">
                Smart Job Matching
              </h3>
              <p className="text-white/70 text-xs leading-relaxed">
                AI-powered algorithms match you with the perfect opportunities
              </p>
            </motion.div>

            <motion.div
              variants={cardVariants}
              whileHover={{ y: -5 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Users className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-white font-semibold text-sm mb-3">
                Global Reach
              </h3>
              <p className="text-white/70 text-xs leading-relaxed">
                Access opportunities from companies around the world
              </p>
            </motion.div>

            <motion.div
              variants={cardVariants}
              whileHover={{ y: -5 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-white font-semibold text-sm mb-3">
                Instant Results
              </h3>
              <p className="text-white/70 text-xs leading-relaxed">
                Get matched and apply to jobs in real-time
              </p>
            </motion.div>
          </motion.div>

          {/* Job Count and CTA Buttons */}
          <motion.div
            variants={ctaVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-10 max-w-3xl mx-auto"
          >
            <motion.div
              whileHover={{ y: -2 }}
              className="text-white/90 text-sm font-medium bg-white/10 backdrop-blur-sm py-5 px-8 rounded-md border border-white/20 shadow-lg hover:bg-white/15 hover:border-white/30 transition-all duration-300 cursor-pointer group"
            >
              <span className="text-xl font-bold text-white mr-2">10,000+</span>
              Available Jobs
            </motion.div>

            <motion.div whileHover={{ y: -2 }}>
              <Button
                size="lg"
                variant="secondary"
                className="h-[56px] px-8 bg-secondary hover:bg-secondary/90 text-white font-semibold group rounded-md shadow-lg hover:shadow-xl hover:shadow-secondary/25 transition-all duration-300"
              >
                <Rocket className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Get Started
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            variants={trustIndicatorsVariants}
            className="flex flex-wrap justify-center items-center gap-6 text-sm text-white/60"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-2 group cursor-pointer hover:text-white/80 transition-colors duration-200"
            >
              <div className="w-2 h-2 bg-purple-400 rounded-full group-hover:scale-125 transition-transform duration-200"></div>
              <span>Secure payment</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-2 group cursor-pointer hover:text-white/80 transition-colors duration-200"
            >
              <div className="w-2 h-2 bg-blue-400 rounded-full group-hover:scale-125 transition-transform duration-200"></div>
              <span>Cancel anytime</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-2 group cursor-pointer hover:text-white/80 transition-colors duration-200"
            >
              <div className="w-2 h-2 bg-purple-400 rounded-full group-hover:scale-125 transition-transform duration-200"></div>
              <span>Setup in 5 minutes</span>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
