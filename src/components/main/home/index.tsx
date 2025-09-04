import { HeroSection } from "./hero-section";
import { FeaturesSection } from "./features-section";
import { HowItWorksSection } from "./how-it-works-section";
import { PricingSection } from "./pricing-section";
import { SMSOptIn } from "./sms-opt-in";
import { MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const badgeVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const titleVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const subtitleVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export default function Home() {
  return (
    <main>
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <PricingSection />

      {/* SMS Opt-in Section - Professional Design */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="w-full py-20 bg-primary relative overflow-hidden"
      >
        {/* Floating Elements */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute top-20 right-10 w-64 h-64 bg-white/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
        ></motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
          className="absolute bottom-20 left-10 w-80 h-80 bg-white/10 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"
        ></motion.div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div variants={headerVariants} className="text-center mb-12">
            {/* Trust Badge */}
            <motion.div
              variants={badgeVariants}
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-medium mb-8 border border-white/30 cursor-pointer"
            >
              <motion.div
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <MessageSquare className="h-4 w-4 text-white" />
              </motion.div>
              <span>Stay Connected</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h2
              variants={titleVariants}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight leading-tight"
            >
              Get Hiring Tips & Updates{" "}
              <span className="bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent">
                Delivered to Your Phone
              </span>
            </motion.h2>

            {/* Subheadline */}
            <motion.p
              variants={subtitleVariants}
              className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed font-light"
            >
              Stay ahead of the competition with expert recruiting insights, job
              market trends, and platform updates delivered directly to your
              phone.
            </motion.p>
          </motion.div>

          <motion.div
            variants={contentVariants}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <SMSOptIn />
          </motion.div>
        </div>
      </motion.section>

      {/* <CTASection /> */}
    </main>
  );
}
