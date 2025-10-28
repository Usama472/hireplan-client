import type React from "react";
import { Button } from "@components/ui/button";
import { useNavigate } from "react-router";
import { Users, Zap } from "lucide-react";

interface LoginLayoutProps {
  children: React.ReactNode;
}

export const LoginLayout = ({ children }: LoginLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-y-auto pt-16">
      {/* Main Content - Compact */}
      <div className="relative z-10 flex items-start justify-center min-h-[calc(100vh-64px)] px-4 py-8">
        <div className="w-full max-w-md">
          {/* Login Card - More Compact */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            {/* Header - Compact */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back
              </h1>
              <p className="text-gray-600 text-base">
                Sign in to your account to continue
              </p>
            </div>

            {/* Form Content */}
            <div className="space-y-5">{children}</div>
            
            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Button
                  variant="link"
                  onClick={() => navigate("/signup")}
                  className="font-medium text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline px-0 h-auto p-0 text-sm"
                >
                  Sign up
                </Button>
              </p>
            </div>
          </div>

          {/* Bottom Features - Compact */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-1.5">
                <Users className="h-4 w-4" />
                <span>Secure</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Zap className="h-4 w-4" />
                <span>Fast</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-0 w-24 h-24 bg-purple-600/10 rounded-full blur-2xl pointer-events-none"></div>
    </div>
  );
};
