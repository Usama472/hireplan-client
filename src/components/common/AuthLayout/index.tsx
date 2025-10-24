import type React from "react";

import { Button } from "@components/ui/button";
import { Separator } from "@components/ui/separator";
import { GithubIcon, GoogleIcon, ROUTES } from "@constants/index";
import { cn } from "@lib/utils";
import { useNavigate } from "react-router";
import { Users, Zap } from "lucide-react";

interface AuthWrapperProps {
  children: React.ReactNode;
  title: string;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
  showSocial?: boolean;
  isLoading?: boolean;
  currentStep?: number;
  totalSteps?: number;
  progressPercentage?: number;
}

export const AuthLayout = ({
  children,
  title,
  footerText,
  footerLinkText,
  footerLinkHref,
  showSocial = true,
  isLoading = false,
  currentStep = 1,
  totalSteps = 1,
  progressPercentage = 0,
}: AuthWrapperProps) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-y-auto pt-16">
      {/* Main Content - Compact */}
      <div className="relative z-10 flex items-start justify-center min-h-[calc(100vh-64px)] px-3 sm:px-4 py-6">
        <div className="w-full max-w-3xl">
          {/* Progress Bar - Above Card */}
          {totalSteps > 1 && (
            <div className="mb-4 bg-white border border-gray-200 rounded-xl shadow-sm p-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
                <div className="text-xs text-gray-600">
                  Step {currentStep} of {totalSteps}
                </div>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {/* Auth Card - More Compact */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 sm:p-7">
            {/* Form Content */}
            <div className="space-y-5">
              {children}

              {showSocial && (
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-3 text-gray-500 font-medium">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      type="button"
                      disabled={isLoading}
                      onClick={() => navigate(ROUTES.DASHBOARD.MAIN)}
                      className="h-10 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-sm"
                    >
                      <GoogleIcon />
                      <span className="ml-2">Google</span>
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      disabled={isLoading}
                      className="h-10 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-sm"
                    >
                      <GithubIcon />
                      <span className="ml-2">GitHub</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {footerText}{" "}
                <Button
                  variant="link"
                  onClick={() => navigate(footerLinkHref)}
                  className="font-medium text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline px-0 h-auto p-0 text-sm"
                >
                  {footerLinkText}
                </Button>
              </p>
            </div>
          </div>

          {/* Bottom Features - Compact */}
          <div className="mt-4 text-center">
            <div className="flex items-center justify-center space-x-5 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>Secure</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="h-3 w-3" />
                <span>Fast</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function CompanyLogo() {
  return (
    <div
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-full",
        "bg-primary text-primary-foreground"
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    </div>
  );
}
