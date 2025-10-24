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
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

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
      if (user.status === "active") {
        mutateSession({ shouldBroadcast: true, accessToken: token });
        // Navigate to dashboard after successful login
        navigate("/dashboard/jobs");
      }
    } catch (err: any) {
      const errMessage = errorResolver(err);
      // Enhanced error messages
      if (err?.response?.status === 401 || errMessage.toLowerCase().includes('credential')) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (err?.response?.status === 429) {
        setError('Too many login attempts. Please try again later or contact support.');
      } else {
        setError(errMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-xs leading-relaxed">{error}</div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Email Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email address
          </label>
          <InputField
            name="email"
            type={INPUT_TYPES.EMAIL}
            placeholder="you@example.com"
            className="h-10 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 border-gray-200 focus:border-blue-500 transition-all duration-200 rounded-lg text-sm"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <InputField
            name="password"
            type={INPUT_TYPES.PASSWORD}
            placeholder="••••••••"
            className="h-10 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 border-gray-200 focus:border-blue-500 transition-all duration-200 rounded-lg text-sm"
          />
        </div>

        {/* Forgot Password & Support */}
        <div className="flex items-center justify-between text-xs">
          <Button
            variant="link"
            type="button"
            className="text-xs font-medium text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline px-0 h-auto p-0"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot password?
          </Button>
          <a
            href="mailto:support@hireplan.co"
            className="text-xs text-gray-600 hover:text-gray-800 underline-offset-4 hover:underline"
          >
            Tech Support
          </a>
        </div>

        {/* CAPTCHA Placeholder - Ready for integration */}
        <div className="pt-1">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-center">
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <Shield className="h-3.5 w-3.5" />
              <span>Protected by reCAPTCHA</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1 text-center">
            This site is protected by reCAPTCHA and Google{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Privacy Policy</a> and{' '}
            <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">Terms</a> apply.
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none disabled:opacity-70 text-sm"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Signing in...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Sign in</span>
            </div>
          )}
        </Button>
      </form>
    </FormProvider>
  );
};
