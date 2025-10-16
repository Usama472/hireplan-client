"use client";

import { Zap } from "lucide-react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";

export function Footer() {
  const navigate = useNavigate();

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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const brandVariants = {
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

  const handleNavigation = (href: string) => {
    navigate(href);
  };

  return (
    <motion.footer
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className="bg-gray-900 text-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          {/* Brand */}
          <motion.button
            variants={brandVariants}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={() => handleNavigation("/")}
            className="flex items-center justify-center space-x-2 mb-4 mx-auto cursor-pointer"
          >
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="bg-blue-600 p-2 rounded-lg"
            >
              <Zap className="h-6 w-6 text-white" />
            </motion.div>
            <motion.span
              whileHover={{ color: "#60a5fa" }}
              transition={{ duration: 0.2 }}
              className="text-xl font-bold"
            >
              HirePlan
            </motion.span>
          </motion.button>

          <motion.p
            variants={itemVariants}
            className="text-gray-400 text-sm max-w-md mx-auto mb-8"
          >
            Transform your hiring process with AI-powered candidate matching.
            Find the perfect talent faster and more efficiently than ever
            before.
          </motion.p>

          {/* Links */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-6 mb-8"
          >
            <button
              onClick={() => handleNavigation("/contact")}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Contact
            </button>
            <button
              onClick={() => handleNavigation("/faq")}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              FAQ
            </button>
            <button
              onClick={() => handleNavigation("/privacy")}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Privacy
            </button>
            <button
              onClick={() => handleNavigation("/terms")}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Terms
            </button>
          </motion.div>

          {/* Copyright */}
          <motion.div
            variants={itemVariants}
            className="border-t border-gray-800 pt-8"
          >
            <p className="text-gray-400 text-sm">
              © 2025 HirePlan. All rights reserved.
            </p>
          </motion.div>
        </div>
      </div>
    </motion.footer>
  );
}
