import type React from "react";
import { Button } from "@components/ui/button";
import { APP_NAME, ROUTES } from "@constants/index";
import { useNavigate } from "react-router";
import { Users, Zap, Shield } from "lucide-react";

interface LoginLayoutProps {
  children: React.ReactNode;
}

export const LoginLayout = ({ children }: LoginLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      {/* Logo */}
      <div
        className="absolute top-8 left-8 text-2xl font-bold tracking-tight cursor-pointer z-10 group"
        onClick={() => navigate(ROUTES.HOME)}
      >
        <div className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-200">
          {APP_NAME}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 pt-20 pb-8">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-2xl shadow-lg mb-4 mx-auto">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back
              </h1>
              <p className="text-gray-600 text-sm">
                Sign in to your account to continue
              </p>
            </div>

            {/* Form Content */}
            <div className="space-y-6">{children}</div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Button
                variant="link"
                onClick={() => navigate("/signup")}
                className="font-medium text-primary hover:text-primary/80 underline-offset-4 hover:underline px-0 h-auto p-0 text-sm"
              >
                Sign up
              </Button>
            </p>
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

      {/* Decorative Elements */}
      <div className="absolute top-1/4 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 left-0 w-24 h-24 bg-gradient-to-br from-secondary/10 to-primary/10 rounded-full blur-2xl"></div>
    </div>
  );
};
