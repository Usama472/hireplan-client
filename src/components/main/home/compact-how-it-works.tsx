import { Upload, Brain, Users } from "lucide-react";
import { motion } from "framer-motion";

export function CompactHowItWorks() {
  const steps = [
    {
      icon: Upload,
      number: "01",
      title: "Post Your Job",
      description:
        "Create your job posting and distribute it to all major job boards automatically",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      iconColor: "text-blue-600",
    },
    {
      icon: Brain,
      number: "02",
      title: "AI Screens Candidates",
      description:
        "Our AI analyzes and ranks applicants based on your requirements",
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
      iconColor: "text-purple-600",
    },
    {
      icon: Users,
      number: "03",
      title: "Interview Top Matches",
      description:
        "Get a shortlist of the best candidates ready for your review",
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-50 to-teal-50",
      iconColor: "text-emerald-600",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <p className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent uppercase tracking-wide mb-3">
            How It Works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              Three Simple Steps to{" "}
            </span>
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Better Hiring
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Streamline your recruitment process and find the right candidates
            faster
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative text-center"
            >
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200">
                  <div
                    className={`absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-gradient-to-r ${
                      steps[index + 1].gradient
                    } rounded-full`}
                  />
                </div>
              )}

              {/* Icon */}
              <div
                className={`relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br ${step.bgGradient} rounded-2xl mb-6`}
              >
                <step.icon
                  className={`w-10 h-10 ${step.iconColor}`}
                  strokeWidth={2.5}
                />
                <div
                  className={`absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r ${step.gradient} text-white text-xs font-bold rounded-lg flex items-center justify-center shadow-lg`}
                >
                  {step.number}
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
