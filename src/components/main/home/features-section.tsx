import { BarChart3, Brain, Clock, Shield, Target, Users } from "lucide-react";
import { motion } from "framer-motion";

export function FeaturesSection() {
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

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Matching",
      description:
        "Advanced algorithms find perfect matches with 95% accuracy.",
      color: "blue",
    },
    {
      icon: Clock,
      title: "Lightning Fast",
      description: "Reduce screening time from hours to minutes.",
      color: "purple",
    },
    {
      icon: Target,
      title: "Precision Filtering",
      description: "Set custom criteria for nuanced requirements.",
      color: "purple",
    },
    {
      icon: BarChart3,
      title: "Smart Analytics",
      description: "Get actionable insights on hiring performance.",
      color: "orange",
    },
    {
      icon: Shield,
      title: "Bias-Free Hiring",
      description: "Eliminate bias with objective evaluation.",
      color: "red",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Share insights and collaborate seamlessly.",
      color: "green",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "from-blue-500 to-cyan-500",
      purple: "from-purple-500 to-pink-500",
      orange: "from-orange-500 to-red-500",
      red: "from-red-500 to-pink-500",
      green: "from-green-500 to-emerald-500",
    };
    return colors[color as keyof typeof colors] || "from-gray-500 to-gray-600";
  };

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="text-center mb-12"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-200"
          >
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span>Features</span>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4"
          >
            Everything you need to hire{" "}
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              faster and smarter
            </span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Powerful AI tools that streamline your entire hiring process
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 group"
            >
              <div
                className={`w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-r ${getColorClasses(
                  feature.color
                )} rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className="h-5 sm:h-6 w-5 sm:w-6 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
