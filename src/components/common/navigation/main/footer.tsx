"use client";

import { Zap } from "lucide-react";
import { useNavigate } from "react-router";

export function Footer() {
  const navigate = useNavigate();

  const handleNavigation = (href: string) => {
    navigate(href);
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          {/* Brand */}
          <button
            onClick={() => handleNavigation("/")}
            className="flex items-center justify-center space-x-2 mb-4 mx-auto"
          >
            <div className="bg-blue-600 p-2 rounded-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">HirePlan</span>
          </button>

          <p className="text-gray-400 text-sm max-w-md mx-auto mb-8">
            Transform your hiring process with AI-powered candidate matching.
            Find the perfect talent faster and more efficiently than ever
            before.
          </p>

          {/* Copyright */}
          <div className="border-t border-gray-800 pt-8">
            <p className="text-gray-400 text-sm">
              © 2025 HirePlan. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
