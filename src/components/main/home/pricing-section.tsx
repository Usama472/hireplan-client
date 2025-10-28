import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Zap, Sparkles, Star, ArrowRight } from "lucide-react";
import { PLANS } from "@/constants/form-constants";
import { motion } from "framer-motion";

export function PricingSection() {
  const navigate = useNavigate();

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
    <section
      id="pricing"
      className="py-24 bg-gradient-to-b from-white via-gray-50 to-white relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="text-center mb-16"
        >
          {/* Trust Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 px-5 py-2.5 rounded-full text-sm font-semibold mb-6 border border-blue-100 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Simple & Transparent Pricing</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h2
            variants={itemVariants}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
          >
            <span className="text-gray-900">Plans that grow </span>
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              with your business
            </span>
          </motion.h2>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Choose the perfect plan for your needs. All plans include our core
            AI matching technology and 24/7 support.
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16"
        >
          {PLANS.map((plan) => (
            <motion.div
              key={plan.id}
              variants={itemVariants}
              className="h-full"
            >
              <Card
                className={`relative transition-all duration-300 group h-full flex flex-col shadow-none ${
                  plan.popular
                    ? "border-2 border-blue-200 bg-gradient-to-br from-blue-50/50 to-purple-50/50 scale-105"
                    : "border border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-bold">
                      <Star className="inline h-4 w-4 mr-1 fill-current" />
                      Most Popular
                    </span>
                  </div>
                )}

                <CardHeader className="text-center pb-6 pt-8">
                  <CardTitle className="text-xl font-bold mb-4 text-gray-900">
                    {plan.name}
                  </CardTitle>
                  <div className="flex items-baseline justify-center mb-4">
                    <span className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      {plan.price}
                    </span>
                    <span className="text-gray-500 ml-2 text-sm">
                      {plan.period}
                    </span>
                  </div>
                  <CardDescription className="text-sm text-gray-600 leading-relaxed">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 flex-1 flex flex-col px-6 pb-8">
                  <ul className="space-y-3 mb-6 flex-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center mr-3 mt-0.5">
                          <Check
                            className="h-3 w-3 text-white"
                            strokeWidth={3}
                          />
                        </div>
                        <span className="text-sm text-gray-700 leading-relaxed">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto">
                    <Button
                      variant="secondary"
                      className={`w-full py-3 text-sm font-semibold transition-all duration-300 ${
                        plan.popular
                          ? "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white"
                          : "bg-blue-500 hover:bg-blue-600 text-white"
                      }`}
                      onClick={() =>
                        navigate("/contact", {
                          state: { planId: plan.id },
                        })
                      }
                    >
                      {plan.id === "enterprise"
                        ? "Contact Sales"
                        : "Get Started"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA Section */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="text-center"
        >
          <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl p-12 border border-gray-200">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 px-5 py-2.5 rounded-full text-sm font-semibold mb-6 border border-blue-100">
              <Zap className="w-4 h-4" />
              <span>Enterprise Solutions</span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="text-gray-900">Need a </span>
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                custom solution
              </span>
              <span className="text-gray-900">?</span>
            </h3>

            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              We offer enterprise packages with dedicated support, custom
              integrations, and advanced features for large organizations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                variant="outline"
                className="border-2 border-gray-300 hover:border-gray-900 text-gray-700 hover:text-gray-900 bg-white"
                onClick={() => navigate("/demo")}
              >
                Schedule a Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button onClick={() => navigate("/contact")}>
                Contact Sales
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
