import type React from "react";

import { Button } from "@components/ui/button";
import { Separator } from "@components/ui/separator";
import { GithubIcon, GoogleIcon, ROUTES } from "@constants/index";
import { cn } from "@lib/utils";
import { useNavigate } from "react-router";

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
  showSocial = true,
  isLoading = false,
  currentStep = 1,
  totalSteps = 1,
}: AuthWrapperProps) => {
  const navigate = useNavigate();
  return (
    <>
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-y-auto">
        <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-164px)] px-3 sm:px-4 mb-20 mt-10">
          <div className="w-full max-w-4xl">
            {totalSteps > 1 && (
              <div className="mb-4 bg-white border border-gray-200 rounded-md p-4">
                <div className="flex items-center justify-between gap-4">
                  {/* Left Side: Title and Step */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold">
                      {currentStep}
                    </div>
                    <div>
                      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
                        Create Your Account
                      </h2>
                      <p className="text-xs text-gray-400">
                        Step {currentStep} of {totalSteps}
                      </p>
                    </div>
                  </div>

                  {/* Right Side: Already have account */}
                  <div className="hidden sm:flex flex-col items-end gap-1">
                    <span className="text-xs text-gray-500">
                      Already have an account?
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(ROUTES.LOGIN)}
                      className="h-8 px-4 text-xs border border-gray-300 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600 transition-all font-medium rounded-md"
                    >
                      Sign in
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {/* Auth Card - More Compact */}
            <div className="bg-white border border-gray-200 rounded-md p-6">
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
            </div>
          </div>
        </div>
      </div>
    </>
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
