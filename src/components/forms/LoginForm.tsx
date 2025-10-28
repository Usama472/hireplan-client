"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

import { InputField } from "@/components/common/InputField";
import { Button } from "@/components/ui/button";
import API from "@/http";
import { mutateSession } from "@/http/auth/mutateSession";
import { INPUT_TYPES } from "@/interfaces";
import { errorResolver } from "@/lib/utils";
import { AlertCircle, X, Shield } from "lucide-react";
import { useNavigate } from "react-router";

const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    setError(null);
    try {
      const response = await API.auth.signin(data.email, data.password);
      const user = response.user;
      const token = response.tokens.accessToken.token;
      
      console.log('✅ Login successful:', {
        user: user.email,
        status: user.status,
        hasToken: !!token
      });
      
      if (user.status === "active") {
        // Clear any old cached profile before setting new session
        localStorage.removeItem('cachedUserProfile');
        
        await mutateSession({ shouldBroadcast: true, accessToken: token });
        
        // Use window.location.href for a hard redirect to ensure fresh state
        window.location.href = "/dashboard/jobs";
      }
    } catch (err: any) {
      const errMessage = errorResolver(err);
      // Enhanced error messages
      if (
        err?.response?.status === 401 ||
        errMessage.toLowerCase().includes("credential")
      ) {
        setError(
          "Invalid email or password. Please check your credentials and try again."
        );
      } else if (err?.response?.status === 429) {
        setError(
          "Too many login attempts. Please try again later or contact support."
        );
      } else {
        setError(errMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-800 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm leading-relaxed">{error}</div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Email Field */}
        <div className="space-y-2.5">
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-gray-700"
          >
            Email address
          </label>
          <InputField
            name="email"
            type={INPUT_TYPES.EMAIL}
            placeholder="you@example.com"
            className="h-11 bg-white focus:bg-white focus:ring-2 focus:ring-blue-500/20 border-gray-300 focus:border-blue-500 transition-all duration-200 rounded-xl text-sm"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-2.5">
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-gray-700"
          >
            Password
          </label>
          <InputField
            name="password"
            type={INPUT_TYPES.PASSWORD}
            placeholder="••••••••"
            className="h-11 bg-white focus:bg-white focus:ring-2 focus:ring-blue-500/20 border-gray-300 focus:border-blue-500 transition-all duration-200 rounded-xl text-sm"
          />
        </div>

        {/* Forgot Password & Support */}
        <div className="flex items-center justify-between">
          <Button
            variant="link"
            type="button"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 underline-offset-4 px-0 h-auto p-0"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot password?
          </Button>
          <a
            href="mailto:support@hireplan.co"
            className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            Need help?
          </a>
        </div>

        {/* Submit Button */}
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Signing in...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span>Sign in</span>
            </div>
          )}
        </Button>

        {/* Security Badge */}
        <div className="pt-3">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Shield className="h-4 w-4" />
            <span>Secure login protected by encryption</span>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};
