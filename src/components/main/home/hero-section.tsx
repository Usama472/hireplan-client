import BackgroundImage from "@/assets/home-bg.png";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Rocket,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

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
    <section className="relative overflow-hidden bg-[#ececec] min-h-[calc(100vh-65px)]">
      {/* Background Image */}
      <img
        src={BackgroundImage}
        alt="Professional business team meeting"
        className="absolute inset-0 w-full h-full object-cover brightness-75"
      />

      {/* Blackish Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 z-10"
      >
        <div className="text-center max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-65px)]">
          {/* Trust Badge */}
          <motion.div
            variants={trustBadgeVariants}
            whileHover={{
              scale: 1.05,
              y: -3,
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              borderColor: "rgba(59, 130, 246, 0.3)",
            }}
            whileTap={{ scale: 0.98 }}
            transition={{
              duration: 0.3,
              ease: "easeOut",
              backgroundColor: { duration: 0.2 },
              borderColor: { duration: 0.2 },
            }}
            className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-xs font-medium mb-6 cursor-pointer group hover:bg-white/20 transition-all duration-300"
          >
            <motion.div
              whileHover={{ rotate: 360, scale: 1.2 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Sparkles className="h-3 w-3 text-white" />
            </motion.div>
            <motion.span
              whileHover={{ color: "rgba(59, 130, 246, 1)" }}
              transition={{ duration: 0.2 }}
              className="font-semibold"
            >
              Trusted by 500+ companies worldwide
            </motion.span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            variants={headlineVariants}
            className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight mb-4 tracking-tight"
          >
            Your All-in-One{" "}
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Hiring Solution
            </span>{" "}
            Platform
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={subheadlineVariants}
            className="text-sm sm:text-base lg:text-lg text-white/90 max-w-3xl mx-auto leading-relaxed mb-8 font-light"
          >
            Streamline your entire recruitment process with our powerful
            dashboard. From job creation to final selection,{" "}
            <span className="text-white font-semibold">
              everything is simplified and efficient
            </span>{" "}
            with AI-powered tools.
          </motion.p>

          {/* Key Benefits Grid */}
          <motion.div
            variants={benefitsVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto"
          >
            <motion.div
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.05 }}
              className="relative group"
            >
              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:border-white/30 transition-all duration-500 h-full flex flex-col">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Briefcase className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-white font-bold text-sm mb-2">
                  Job Creation & Management
                </h3>
                <p className="text-white/80 text-xs leading-relaxed flex-grow">
                  Easily create and manage job postings tailored to your hiring
                  needs with our intuitive dashboard
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.05 }}
              transition={{ delay: 0.1 }}
              className="relative group"
            >
              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:border-white/30 transition-all duration-500 h-full flex flex-col">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-white font-bold text-sm mb-2">
                  AI-Powered Screening
                </h3>
                <p className="text-white/80 text-xs leading-relaxed flex-grow">
                  Automatically evaluate resumes and highlight top candidates
                  with intelligent algorithms
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.05 }}
              transition={{ delay: 0.2 }}
              className="relative group"
            >
              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:border-white/30 transition-all duration-500 h-full flex flex-col">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-white font-bold text-sm mb-2">
                  Automated Communication
                </h3>
                <p className="text-white/80 text-xs leading-relaxed flex-grow">
                  Send AI-generated emails and manage responses efficiently with
                  smart templates
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Job Count and CTA Buttons */}
          <motion.div
            variants={ctaVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 max-w-3xl mx-auto"
          >
            <motion.div
              whileHover={{ y: -3, scale: 1.05 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 h-[44px] flex items-center rounded-sm cursor-pointer group hover:bg-white/20 transition-all duration-300"
            >
              <span className="text-lg font-bold text-white mr-2">500+</span>
              <span className="text-sm font-semibold">Companies Trust Us</span>
            </motion.div>

            <motion.div whileHover={{ y: -2 }}>
              <Button
                variant="secondary"
                className="h-[44px] px-8  text-white font-semibold group rounded-sm transition-all duration-500 flex items-center"
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
            className="flex flex-wrap justify-center items-center gap-4 text-sm text-white/80"
          >
            <motion.div
              whileHover={{ scale: 1.1, y: -2 }}
              className="flex items-center gap-2 group cursor-pointer hover:text-white transition-all duration-300 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10"
            >
              <div className="w-2 h-2 bg-secondary rounded-full group-hover:scale-125 transition-transform duration-200"></div>
              <span className="font-medium text-xs">Secure & Private</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1, y: -2 }}
              className="flex items-center gap-2 group cursor-pointer hover:text-white transition-all duration-300 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10"
            >
              <div className="w-2 h-2 bg-secondary rounded-full group-hover:scale-125 transition-transform duration-200"></div>
              <span className="font-medium text-xs">AI-Powered Screening</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1, y: -2 }}
              className="flex items-center gap-2 group cursor-pointer hover:text-white transition-all duration-300 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10"
            >
              <div className="w-2 h-2 bg-secondary rounded-full group-hover:scale-125 transition-transform duration-200"></div>
              <span className="font-medium text-xs">Streamlined Process</span>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
