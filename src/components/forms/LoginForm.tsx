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
      if (user.status === "active") {
        mutateSession({ shouldBroadcast: true, accessToken: token });
        // Navigate to dashboard after successful login
        navigate("/dashboard/jobs");
      }
    } catch (err) {
      const errMessage = errorResolver(err);
      setError(errMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">{error}</div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 transition-colors duration-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Email Field */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email address
          </label>
          <InputField
            name="email"
            type={INPUT_TYPES.EMAIL}
            placeholder="Enter your email"
            className="h-12 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 border-gray-200 focus:border-primary transition-all duration-200 rounded-xl"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <InputField
            name="password"
            type={INPUT_TYPES.PASSWORD}
            placeholder="Enter your password"
            className="h-12 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 border-gray-200 focus:border-primary transition-all duration-200 rounded-xl"
          />
        </div>

        {/* Forgot Password */}
        <div className="flex justify-end">
          <Button
            variant="link"
            className="text-sm font-medium text-primary hover:text-primary/80 underline-offset-4 hover:underline px-0 h-auto p-0"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot password?
          </Button>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-600/25 transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Signing in...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Sign in</span>
            </div>
          )}
        </Button>
      </form>
    </FormProvider>
  );
};
