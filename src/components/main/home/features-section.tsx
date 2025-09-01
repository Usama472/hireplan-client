import {
  BarChart3,
  Brain,
  Clock,
  Shield,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";

export function FeaturesSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const headerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const titleVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const subtitleVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut",
        delay: 0.3,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 60, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Matching",
      description:
        "Advanced machine learning algorithms analyze resumes, skills, and job requirements to find perfect matches with 95% accuracy.",
      color: "blue",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Clock,
      title: "Lightning Fast Screening",
      description:
        "Reduce screening time from hours to minutes. Our AI processes hundreds of candidates instantly.",
      color: "green",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Target,
      title: "Precision Filtering",
      description:
        "Set custom criteria and weights. Our AI understands nuanced requirements beyond keyword matching.",
      color: "purple",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: BarChart3,
      title: "Smart Analytics",
      description:
        "Get actionable insights on candidate quality, market trends, and hiring performance metrics.",
      color: "orange",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: Shield,
      title: "Bias-Free Hiring",
      description:
        "Eliminate unconscious bias with objective, data-driven evaluation that focuses on skills and qualifications.",
      color: "red",
      gradient: "from-red-500 to-pink-500",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description:
        "Seamless workflow for hiring teams with real-time collaboration, comments, and decision tracking.",
      color: "indigo",
      gradient: "from-indigo-500 to-blue-500",
    },
  ];

  return (
    <motion.section
      id="features"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className="py-16 bg-[#ececec] relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div variants={headerVariants} className="text-center mb-12">
          {/* Trust Badge */}
          <motion.div
            variants={badgeVariants}
            whileHover={{ scale: 1.05, y: -2 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 px-5 py-2.5 rounded-full text-sm font-medium mb-6 cursor-pointer"
          >
            <motion.div
              whileHover={{ rotate: 360, scale: 1.2 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Sparkles className="h-4 w-4 text-blue-600" />
            </motion.div>
            <span>Powerful Features</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h2
            variants={titleVariants}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 tracking-tight leading-tight"
          >
            Everything you need to hire{" "}
            <span className="bg-gradient-to-r from-secondary to-secondary/80 bg-clip-text text-transparent">
              smarter
            </span>
            , not harder
          </motion.h2>

          {/* Subheadline */}
          <motion.p
            variants={subtitleVariants}
            className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed font-light"
          >
            Our comprehensive AI platform streamlines every step of your hiring
            process, from candidate discovery to final selection. Transform
            weeks of work into days.
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{
                transition: { duration: 0.4, ease: "easeOut" },
              }}
              whileTap={{ scale: 0.98 }}
              className="group bg-white p-6 rounded-xl transition-all duration-500 relative overflow-hidden cursor-pointer"
            >
              {/* Hover Effect Background */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.08 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient}`}
              ></motion.div>

              {/* Icon Container */}
              <div className="relative">
                <motion.div
                  whileHover={{
                    rotate: 3,
                    transition: { duration: 0.4, ease: "easeOut" },
                  }}
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 bg-gradient-to-br ${feature.gradient} shadow-lg group-hover:shadow-xl transition-all duration-500`}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </motion.div>
                </motion.div>
              </div>

              {/* Content */}
              <div className="relative">
                <motion.h3
                  whileHover={{ color: "#1f2937" }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="text-lg font-semibold text-gray-900 mb-3 transition-colors duration-500"
                >
                  {feature.title}
                </motion.h3>
                <motion.p
                  whileHover={{ color: "#374151" }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="text-sm text-gray-600 leading-relaxed transition-colors duration-500"
                >
                  {feature.description}
                </motion.p>
              </div>

              {/* Hover Indicator */}
              <motion.div
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${feature.gradient}`}
              ></motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
