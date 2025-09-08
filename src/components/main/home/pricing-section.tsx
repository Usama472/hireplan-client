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
      className="py-8 bg-[#ececec]/70 relative"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="text-center mb-6"
        >
          {/* Trust Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-200"
          >
            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            <span>Simple & Transparent Pricing</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h2
            variants={itemVariants}
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
          >
            Plans that grow{" "}
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">with your business</span>
          </motion.h2>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="text-gray-600 max-w-xl mx-auto"
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto mb-6"
        >
          {PLANS.map((plan) => (
            <motion.div
              key={plan.id}
              variants={itemVariants}
              className="h-full"
            >
              <Card
                className={`relative transition-all duration-300 group h-full flex flex-col ${
                  plan.popular
                    ? "border-2 border-secondary bg-white shadow-lg"
                    : "border border-gray-200 bg-white"
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-4 py-1.5 rounded-full text-xs font-semibold">
                      <Star className="inline h-3 w-3 mr-1 fill-current" />
                      Most Popular
                    </span>
                  </div>
                )}

                <CardHeader className="text-center pb-3 pt-6">
                  <CardTitle className="text-base font-bold mb-1 text-gray-900">
                    {plan.name}
                  </CardTitle>
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-gray-500 ml-1 text-xs">
                      {plan.period}
                    </span>
                  </div>
                  <CardDescription className="text-xs text-gray-600">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 flex-1 flex flex-col">
                  <ul className="space-y-1.5 mb-4 flex-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <Check className="h-3 w-3 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto">
                    <Button
                      variant="secondary"
                      className={`w-full py-2 text-xs font-semibold rounded-lg h-8 ${
                        plan.popular
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
                          : "bg-gray-900 hover:bg-gray-800 text-white"
                      }`}
                      onClick={() =>
                        navigate("/signup", {
                          state: { planId: plan.id },
                        })
                      }
                    >
                      {plan.id === "enterprise"
                        ? "Contact Sales"
                        : "Get Started"}
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA Section - Ultra Compact */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="text-center"
        >
          <div className="bg-white rounded-lg p-4">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary/10 to-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <div className="w-2 h-2 bg-secondary rounded-full"></div>
              <span>Enterprise Solutions</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Need a{" "}
              <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                custom solution
              </span>
              ?
            </h3>

            <p className="text-gray-600 mb-4 max-w-lg mx-auto">
              We offer enterprise packages with dedicated support and custom
              integrations for large organizations.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
              <Button
                variant="outline"
                size="sm"
                className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 bg-white px-4 py-1.5 h-8 rounded-lg text-xs font-semibold"
                onClick={() => navigate("/demo")}
              >
                Schedule a Demo
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="px-4 py-1.5 h-8 rounded-lg text-xs font-semibold"
                onClick={() => navigate("/contact")}
              >
                Contact Sales
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}