import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import LeftImage from "../../../../public/showcase-left.png";
import RightImage from "../../../../public/showcase-right.png";

export function HowItWorksSection() {
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

  const sectionVariants = {
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

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8, x: -50 },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const imageRightVariants = {
    hidden: { opacity: 0, scale: 0.8, x: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const contentLeftVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
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
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const titleVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const descriptionVariants = {
    hidden: { opacity: 0, y: 20 },
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

  const featureVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const features = [
    {
      title: "#1 Quality Job",
      description:
        "Access thousands of high-quality job postings from top-tier companies across all industries and experience levels.",
    },
    {
      title: "Top Companies",
      description:
        "Connect with Fortune 500 companies, innovative startups, and leading organizations actively seeking talent.",
    },
    {
      title: "International Jobs",
      description:
        "Explore global opportunities with remote positions and international companies looking for skilled professionals.",
    },
    {
      title: "No Extra Charges",
      description:
        "Complete access to all features with transparent pricing - no hidden fees or surprise charges ever.",
    },
  ];

  const platformFeatures = [
    {
      title: "Smart Job Matching",
      description:
        "AI-powered algorithms that understand your skills and preferences to find the perfect job opportunities.",
    },
    {
      title: "Resume Builder",
      description:
        "Professional resume templates and tools to showcase your experience and stand out to employers.",
    },
    {
      title: "Company Insights",
      description:
        "Detailed company profiles, reviews, and culture information to help you make informed decisions.",
    },
    {
      title: "Application Tracking",
      description:
        "Monitor your job applications, interview status, and follow-up reminders all in one place.",
    },
  ];

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-gray-50 to-blue-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-16 sm:gap-20 lg:gap-24">
        {/* Top Section: Image Left, Text Right */}
        <motion.div
          variants={sectionVariants}
          className="flex flex-col lg:flex-row items-center gap-16 sm:gap-20 lg:gap-24"
        >
          {/* Left Side: Illustration */}
          <motion.div
            variants={imageVariants}
            className="flex-1 flex justify-center mb-8 lg:mb-0 order-2 lg:order-1"
          >
            <motion.img
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              src={LeftImage}
              alt="Job Portal Illustration"
              className="w-full max-w-sm sm:max-w-md lg:max-w-lg h-auto"
            />
          </motion.div>
          {/* Right Side: Text Content */}
          <motion.div
            variants={contentVariants}
            className="flex-1 order-1 lg:order-2 text-center lg:text-left"
          >
            <motion.div variants={badgeVariants} className="mb-4 sm:mb-6">
              <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold mb-3 sm:mb-4 border border-yellow-200">
                Advanced Features
              </span>
            </motion.div>
            <motion.h2
              variants={titleVariants}
              className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 leading-tight"
            >
              Trusted &amp; Popular
            </motion.h2>
            <motion.h3
              variants={titleVariants}
              transition={{ delay: 0.1 }}
              className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6"
            >
              Job Portal
            </motion.h3>
            <motion.p
              variants={descriptionVariants}
              className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Join millions of job seekers who trust our platform to find their
              next career opportunity. Our AI-powered matching system and
              comprehensive job database make job hunting efficient and
              effective.
            </motion.p>
            <motion.div
              variants={containerVariants}
              className="space-y-4 sm:space-y-5 lg:space-y-6"
            >
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  variants={featureVariants}
                  whileHover={{ x: 10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="flex items-start gap-3 sm:gap-4 group cursor-pointer"
                >
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="mt-1 flex-shrink-0"
                  >
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                  </motion.div>
                  <div>
                    <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 sm:mb-2 group-hover:text-blue-600 transition-colors duration-200">
                      {feature.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Bottom Section: Text Left, Image Right */}
        <motion.div
          variants={sectionVariants}
          className="flex flex-col-reverse lg:flex-row items-center gap-16 sm:gap-20 lg:gap-24"
        >
          {/* Left Side: Text Content */}
          <motion.div
            variants={contentLeftVariants}
            className="flex-1 order-2 lg:order-1 text-center lg:text-left"
          >
            <motion.div variants={badgeVariants} className="mb-4 sm:mb-6">
              <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold mb-3 sm:mb-4 border border-yellow-200">
                Platform Features
              </span>
            </motion.div>
            <motion.h2
              variants={titleVariants}
              className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 leading-tight"
            >
              Advanced Job Search
            </motion.h2>
            <motion.h3
              variants={titleVariants}
              transition={{ delay: 0.1 }}
              className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6"
            >
              Platform
            </motion.h3>
            <motion.p
              variants={descriptionVariants}
              className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Experience the next generation of job searching with our
              intelligent platform. From AI-powered matching to comprehensive
              application tracking, we provide everything you need for a
              successful job search journey.
            </motion.p>
            <motion.div
              variants={containerVariants}
              className="space-y-4 sm:space-y-5 lg:space-y-6"
            >
              {platformFeatures.map((feature, idx) => (
                <motion.div
                  key={idx}
                  variants={featureVariants}
                  whileHover={{ x: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="flex items-start gap-3 sm:gap-4 group cursor-pointer"
                >
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="mt-1 flex-shrink-0"
                  >
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                  </motion.div>
                  <div>
                    <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 sm:mb-2 group-hover:text-blue-600 transition-colors duration-200">
                      {feature.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
          {/* Right Side: Illustration */}
          <motion.div
            variants={imageRightVariants}
            className="flex-1 flex justify-center mb-8 lg:mb-0 order-1 lg:order-2"
          >
            <motion.img
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              src={RightImage}
              alt="Platform Features Illustration"
              className="w-full max-w-sm sm:max-w-md lg:max-w-lg h-auto"
            />
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
