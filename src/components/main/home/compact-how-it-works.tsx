import { ArrowRight, CheckCircle, Upload, Brain, Users } from "lucide-react";
import { motion } from "framer-motion";

export function CompactHowItWorks() {
  const steps = [
    {
      icon: Upload,
      title: "Post Job & Distribute",
      description: "Create your job posting and we distribute it to all major job boards",
      color: "blue",
    },
    {
      icon: Brain,
      title: "AI Analysis",
      description: "Our AI analyzes incoming resumes and matches candidates with 95% accuracy",
      color: "purple",
    },
    {
      icon: Users,
      title: "Get Results",
      description: "Receive ranked candidates ready for interviews",
      color: "green",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "from-blue-500 to-blue-600",
      purple: "from-purple-500 to-purple-600", 
      green: "from-green-500 to-green-600",
    };
    return colors[color as keyof typeof colors] || "from-gray-500 to-gray-600";
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>How It Works</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Get started in{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              3 simple steps
            </span>
          </h2>
          
          <p className="text-gray-600 max-w-2xl mx-auto">
            Post once, reach everywhere. Our AI-powered platform distributes to all major job boards and finds the best candidates for you.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection Lines */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200 transform -translate-y-1/2"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative text-center group"
              >
                {/* Step Number */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-600 group-hover:border-blue-500 group-hover:text-blue-600 transition-colors duration-200">
                    {index + 1}
                  </div>
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-r ${getColorClasses(step.color)} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon className="h-8 w-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-8"
        >
          <div className="inline-flex items-center space-x-2 text-blue-600 font-medium">
            <span>Ready to get started?</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
