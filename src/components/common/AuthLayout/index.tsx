import type React from "react";

import { Button } from "@components/ui/button";
import { Separator } from "@components/ui/separator";
import { APP_NAME, GithubIcon, GoogleIcon, ROUTES } from "@constants/index";
import { cn } from "@lib/utils";
import { useNavigate } from "react-router";
import { Building2, Users, Zap } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative">
      {/* Logo */}
      <div
        className="absolute top-6 left-8 text-2xl font-bold tracking-tight cursor-pointer z-10 group"
        onClick={() => navigate(ROUTES.HOME)}
      >
        <div className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-200">
          {APP_NAME}
        </div>
      </div>

      {/* Navbar Header */}
      <div className="fixed top-0 left-0 right-0 flex items-center justify-between p-3 sm:p-4 bg-background border-b border-border shadow-md z-20">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-xl shadow-md">
            <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent truncate">
              {title}
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm truncate">
              Welcome back! Please enter your details
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3 sm:space-x-6">
          <div className="hidden sm:flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">
                Step {currentStep} of {totalSteps}
              </div>
              <div className="text-xs text-muted-foreground/70">
                {Math.round(progressPercentage)}% complete
              </div>
            </div>
            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
          <div className="border-l border-border pl-3 sm:pl-6">
            <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">
              {footerText}{" "}
            </span>
            <Button
              variant="link"
              onClick={() => navigate(footerLinkHref)}
              className="font-bold underline-offset-4 hover:underline px-1 h-auto p-0 text-xs sm:text-sm text-secondary"
            >
              {footerLinkText}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-3 sm:px-4 pt-20 sm:pt-24 pb-8">
        <div className="w-full max-w-4xl">
          {/* Auth Card */}
          <div className="bg-white border-0 md:border md:border-gray-200 rounded-md shadow-sm p-6 md:p-10">
            {/* Form Content */}
            <div className="space-y-8">
              {children}

              {showSocial && (
                <div className="space-y-5">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-4 text-gray-500 font-medium">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      type="button"
                      disabled={isLoading}
                      onClick={() => navigate(ROUTES.DASHBOARD.MAIN)}
                      className="h-12 border-gray-200 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 text-sm"
                    >
                      <GoogleIcon />
                      <span className="ml-2">Google</span>
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      disabled={isLoading}
                      className="h-12 border-gray-200 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 text-sm"
                    >
                      <GithubIcon />
                      <span className="ml-2">GitHub</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Features */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>Secure Login</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="h-3 w-3" />
                <span>Fast Access</span>
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
