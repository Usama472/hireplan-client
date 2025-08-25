"use client";

import { TabContent } from "@/components/common/tabs/tab-content";
import { CompanyInfoForm } from "@/components/dashboard/profile/company-info-form";
import { PersonalInfoForm } from "@/components/dashboard/profile/personal-info-form";
import { SaveChangesBar } from "@/components/dashboard/profile/save-changes-bar";
import { AccountSettingsForm } from "@/components/dashboard/profile/account-settings-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import API from "@/http";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";
import { cn } from "@/lib/utils";
import { profileFormSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { ProfileTabs } from "./tabs";
import { useSearchParams } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import subscriptionAPI from "@/http/subscription/api";

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [initialFormData, setInitialFormData] =
    useState<ProfileFormValues | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showCancelAlert, setShowCancelAlert] = useState(false);
  const [verifiedSubscription, setVerifiedSubscription] = useState<{
    hasActiveSubscription: boolean;
    planId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  } | null>(null);

  const { data: authSession, updateUser } = useAuthSessionContext();
  const [searchParams, setSearchParams] = useSearchParams();

  // Fetch verified subscription status from Stripe
  const fetchVerifiedSubscription = useCallback(async () => {
    if (!authSession?.user) return;
    
    try {
      const status = await subscriptionAPI.getVerifiedSubscriptionStatus();
      setVerifiedSubscription(status);
    } catch (error) {
      console.error('Failed to fetch verified subscription status:', error);
      // Set fallback state
      setVerifiedSubscription({
        hasActiveSubscription: false,
        planId: null,
        planName: null,
        subscriptionStatus: 'error'
      });
    }
  }, [authSession?.user]);

  const getUserFormData = useCallback((): ProfileFormValues => {
    if (!authSession?.user) {
      return {
        firstName: "",
        lastName: "",
        email: "",
        profileImg: "",
        companyRole: "",
        company: {
          companyName: "",
          websiteUrl: "",
          industry: "",
          companySize: "",
          address: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
        },
        paymentPlan: "starter",
        allowNotify: true,
      };
    }

    const user = authSession.user;

    return {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      profileImg: user.profileImg || "",
      companyRole: user.companyRole || "",
      company: {
        companyName: user.company?.companyName || "",
        websiteUrl: user.company?.websiteUrl || "",
        industry: user.company?.industry || "",
        companySize: user.company?.companySize || "",
        address: user.company?.address || "",
        city: user.company?.city || "",
        state: user.company?.state || "",
        zipCode: user.company?.zipCode || "",
        country: user.company?.country || "",
      },

      paymentPlan:
        (user.paymentPlan as "starter" | "professional" | "enterprise") ||
        "starter",
      allowNotify: user.allowNotify ?? true,
    };
  }, [authSession]);

  const formData = useMemo(() => getUserFormData(), [getUserFormData]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: formData,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const {
    formState: { isDirty, dirtyFields },
    reset,
    getValues,
    watch,
  } = form;

  const dirtyFieldsCount = Object.keys(dirtyFields).length;

  useEffect(() => {
    if (authSession?.user) {
      const userData = getUserFormData();
      setInitialFormData(userData);
      reset(userData);
      // Fetch verified subscription status
      fetchVerifiedSubscription();
    }
  }, [authSession, reset, getUserFormData, fetchVerifiedSubscription]);

  useEffect(() => {
    if (isSaved) {
      setLastSaved(new Date());
      const timer = setTimeout(() => setIsSaved(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isSaved]);

  // Handle URL parameters for subscription flow redirects
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const tab = searchParams.get('tab');

    if (success === 'true') {
      setShowSuccessAlert(true);
      toast.success('Payment successful! Your subscription has been updated.');
      // Refresh subscription status after successful payment
      fetchVerifiedSubscription();
      // Set the active tab if specified
      if (tab) {
        setActiveTab(tab);
      }
      // Clean up URL parameters
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('success');
      setSearchParams(newSearchParams, { replace: true });
    }

    if (canceled === 'true') {
      setShowCancelAlert(true);
      toast.info('Payment was canceled. You can try again anytime.');
      // Set the active tab if specified
      if (tab) {
        setActiveTab(tab);
      }
      // Clean up URL parameters
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('canceled');
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, fetchVerifiedSubscription]);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  const handleFormSubmit = useCallback(
    async (data: ProfileFormValues) => {
      if (!isDirty) {
        toast.info("No changes to save");
        return;
      }

      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        companyRole: data.companyRole,
        //profileImg: data.profileImg,
        // NOTE: paymentPlan changes must go through Stripe checkout, not direct profile update
        company: {
          address: data.company.address,
          city: data.company.city,
          state: data.company.state,
          zipCode: data.company.zipCode,
          country: data.company.country,
          companyName: data.company.companyName,
          websiteUrl: data.company.websiteUrl,
          companySize: data.company.companySize,
          industry: data.company.industry,
        },
      };
      const response = await API.user.updateProfile(payload);

      setIsLoading(true);
      try {
        if (updateUser) {
          updateUser({
            ...authSession?.user,
            ...response.user,
          });
        }
        setIsSaved(true);
        setInitialFormData(data);
        const newData = { ...data };
        reset(newData, {
          keepDirty: false,
          keepTouched: false,
        });

        toast.success("Profile updated successfully");
      } catch (error) {
        console.error("Error updating profile:", error);
        toast.error("Failed to update profile. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [authSession, isDirty, reset, updateUser]
  );

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "starter":
        return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-200";
      case "professional":
        return "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-50 hover:text-purple-800 hover:border-purple-200";
      case "enterprise":
        return "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-800 hover:border-gray-200";
    }
  };

  const getStatusBadgeColor = (status?: string) => {
    switch (status) {
      case "active":
        return "bg-green-50 text-green-700 border-green-200";
      case "trialing":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "pending":
      case "past_due":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "canceled":
      case "suspended":
      case "incomplete":
      case "incomplete_expired":
        return "bg-red-50 text-red-700 border-red-200";
      case "inactive":
      case "none":
        return "bg-gray-50 text-gray-700 border-gray-200";
      case "error":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  if (!authSession || !initialFormData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
        <div className="container mx-auto py-8 px-4 max-w-5xl">
          <div className="animate-pulse">
            <div className="mb-10">
              <div className="flex items-start justify-between mb-6">
                <div className="space-y-3">
                  <div className="h-10 bg-gray-200 rounded w-64"></div>
                  <div className="h-6 bg-gray-200 rounded w-96"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded w-32"></div>
              </div>
              <Card className="shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center gap-6">
                    <div className="h-20 w-20 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-8 bg-gray-200 rounded w-48"></div>
                      <div className="h-6 bg-gray-200 rounded w-64"></div>
                      <div className="flex gap-3">
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                        <div className="h-6 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const user = authSession.user;
  const firstName = watch("firstName") || user.firstName || "";
  const lastName = watch("lastName") || user.lastName || "";
  const email = watch("email") || user.email || "";
  const profileImg = watch("profileImg") || user.profileImg || "";
  
  // Use verified subscription data if available, otherwise fall back to user data
  const paymentPlan = verifiedSubscription?.planId || watch("paymentPlan") || user.paymentPlan || "starter";
  const subscriptionStatus = verifiedSubscription?.hasActiveSubscription ? 
    verifiedSubscription.subscriptionStatus : 
    'inactive';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        {/* Enhanced Header */}
        <div className="mb-10">
          <div className="flex items-start justify-between mb-6">
            <div className="space-y-1">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                Profile Settings
              </h1>
              <p className="text-lg text-gray-600">
                Manage your account information and preferences
              </p>
              {lastSaved && (
                <p className="text-sm text-gray-500 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  Last saved {lastSaved.toLocaleTimeString()}
                </p>
              )}
            </div>

            {/* Status Indicator */}
            <div
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                isSaved
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : isDirty
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-gray-50 text-gray-600 border border-gray-200"
              )}
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  All changes saved
                </>
              ) : isDirty ? (
                <>
                  <AlertCircle className="h-4 w-4" />
                  {dirtyFieldsCount} unsaved{" "}
                  {dirtyFieldsCount === 1 ? "change" : "changes"}
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Up to date
                </>
              )}
            </div>
          </div>

          {/* Enhanced Profile Summary Card */}
          <Card className="bg-gradient-to-r from-white to-blue-50/30 border-0 shadow-lg shadow-blue-100/50">
            <CardContent className="p-8">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-20 w-20 ring-4 ring-white shadow-xl">
                    <AvatarImage src={profileImg || "/placeholder.svg"} />
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                      {firstName.charAt(0)}
                      {lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {firstName} {lastName}
                  </h2>
                  <p className="text-gray-600 text-lg">{email}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge
                      className={cn(
                        "px-3 py-1 text-sm font-medium capitalize border",
                        getPlanColor(paymentPlan)
                      )}
                    >
                      {paymentPlan} Plan
                    </Badge>
                    <Badge
                      className={cn(
                        "px-3 py-1 text-sm font-medium capitalize border",
                        getStatusBadgeColor(subscriptionStatus)
                      )}
                    >
                      {subscriptionStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Success/Cancel Alerts */}
        {showSuccessAlert && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="flex items-center justify-between">
                <span>Payment successful! Your subscription has been updated.</span>
                <button
                  onClick={() => setShowSuccessAlert(false)}
                  className="text-green-600 hover:text-green-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {showCancelAlert && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="flex items-center justify-between">
                <span>Payment was canceled. You can try again anytime from the Settings tab.</span>
                <button
                  onClick={() => setShowCancelAlert(false)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <FormProvider {...form}>
          <div className="space-y-8">
            <ProfileTabs activeTab={activeTab} onTabChange={handleTabChange}>
              <TabContent value="personal" activeTab={activeTab}>
                <div className="space-y-6">
                  <PersonalInfoForm />
                </div>
              </TabContent>

              <TabContent value="company" activeTab={activeTab}>
                <CompanyInfoForm />
              </TabContent>

              <TabContent value='settings' activeTab={activeTab}>
                <AccountSettingsForm />
              </TabContent>
            </ProfileTabs>

            <SaveChangesBar
              isDirty={isDirty}
              isLoading={isLoading}
              isSaved={isSaved}
              onSubmit={() => handleFormSubmit(getValues())}
              changedFieldsCount={dirtyFieldsCount}
              onDiscard={() => reset(initialFormData || undefined)}
            />
          </div>
        </FormProvider>
      </div>
    </div>
  );
}
