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

  // Animation variants
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

  const headerVariants = {
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
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
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
        duration: 0.6,
        ease: "easeOut",
        delay: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const bottomCTAVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        delay: 0.4,
      },
    },
  };

  return (
    <motion.section
      id="pricing"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className="py-20 bg-[#ececec]/70 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div variants={headerVariants} className="text-center mb-16">
          {/* Trust Badge */}
          <motion.div
            variants={badgeVariants}
            whileHover={{ scale: 1.05, y: -2 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 px-6 py-3 rounded-full text-sm font-medium mb-8 cursor-pointer"
          >
            <motion.div
              whileHover={{ rotate: 360, scale: 1.2 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Sparkles className="h-4 w-4 text-blue-600" />
            </motion.div>
            <span>Simple & Transparent Pricing</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h2
            variants={titleVariants}
            className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 tracking-tight leading-tight"
          >
            Plans that grow{" "}
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              with your business
            </span>
          </motion.h2>

          {/* Subheadline */}
          <motion.p
            variants={subtitleVariants}
            className="text-base text-gray-600 max-w-3xl mx-auto leading-relaxed font-light"
          >
            Choose the perfect plan for your needs. All plans include our core
            AI matching technology, bias-free hiring, and 24/7 expert support.
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16"
        >
          {PLANS.map((plan) => (
            <motion.div
              key={plan.id}
              variants={cardVariants}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Card
                className={`relative transition-all shadow-none duration-300 group h-full flex flex-col cursor-pointer ${
                  plan.popular
                    ? "border-2 border-secondary bg-white"
                    : "border border-gray-100 bg-white"
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
                  >
                    <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold border border-white/20">
                      <Star className="inline h-4 w-4 mr-2 fill-current" />
                      Most Popular
                    </span>
                  </motion.div>
                )}

                <CardHeader className="text-center pb-6 pt-12 relative flex-shrink-0">
                  <CardTitle className="text-xl font-bold mb-3 text-gray-900">
                    {plan.name}
                  </CardTitle>
                  <div className="flex items-baseline justify-center mb-4">
                    <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-gray-500 ml-2 text-base">
                      {plan.period}
                    </span>
                  </div>
                  <CardDescription className="text-sm text-gray-600 leading-relaxed">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0 flex-1 flex flex-col">
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 + idx * 0.1 }}
                        className="flex items-start"
                      >
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 360 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="flex-shrink-0 mr-3 mt-1"
                        >
                          <Check className="h-4 w-4 text-purple-500" />
                        </motion.div>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      <Button
                        variant="secondary"
                        className={`w-full py-3 text-sm font-semibold transition-all duration-200 rounded-xl h-12 ${
                          plan.popular
                            ? " text-white"
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
                        <ArrowRight className="ml-2 h-3 w-3" />
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA Section */}
        <motion.div
          variants={bottomCTAVariants}
          className="text-center relative"
        >
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white rounded-2xl p-8 sm:p-12 cursor-pointer"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 text-purple-700 px-5 py-2.5 rounded-full text-sm font-medium mb-6 border border-purple-200/60 cursor-pointer"
            >
              <motion.div
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <Zap className="h-4 w-4 text-purple-600" />
              </motion.div>
              <span>Enterprise Solutions</span>
            </motion.div>

            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Need a custom solution?
            </h3>

            <p className="text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              We offer enterprise packages with dedicated support, custom
              integrations, and tailored solutions for large organizations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 bg-white px-8 py-4 h-12 rounded-xl font-semibold transition-all duration-300"
                  onClick={() => navigate("/demo")}
                >
                  Schedule a Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <Button
                  variant="secondary"
                  onClick={() => navigate("/contact")}
                >
                  Contact Sales
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
