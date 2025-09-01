import { useState, useCallback, useEffect, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, Bell, CheckCircle2, AlertCircle, X } from "lucide-react";
import { GlobalEmailTemplateSettings } from "@/components/dashboard/global-setting/GlobalEmailTemplateSettings";
import { EmailTemplatesList } from "@/components/dashboard/email-templates";
import { JobTemplatesList } from "@/components/dashboard/job-templates/JobTemplatesList";
import { PersonalInfoForm } from "@/components/dashboard/profile/personal-info-form";
import { CompanyInfoForm } from "@/components/dashboard/profile/company-info-form";
import { AccountSettingsForm } from "@/components/dashboard/profile/account-settings-form";
import { SaveChangesBar } from "@/components/dashboard/profile/save-changes-bar";
import { ProfileTabs } from "@/components/dashboard/profile/tabs";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileFormSchema } from "@/lib/validations";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import API from "@/http";
import type { z } from "zod";

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const GlobalSettingPage = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [initialFormData, setInitialFormData] =
    useState<ProfileFormValues | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showCancelAlert, setShowCancelAlert] = useState(false);

  const {
    data: authSession,
    updateUser,
    subscription: verifiedSubscription,
    refreshSubscription,
  } = useAuthSessionContext();
  const [searchParams, setSearchParams] = useSearchParams();

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
    }
  }, [authSession, reset, getUserFormData]);

  useEffect(() => {
    if (isSaved) {
      setLastSaved(new Date());
      const timer = setTimeout(() => setIsSaved(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isSaved]);

  // Handle URL parameters for subscription flow redirects
  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    const tab = searchParams.get("tab");

    if (success === "true") {
      setShowSuccessAlert(true);
      toast.success("Payment successful! Your subscription has been updated.");
      if (refreshSubscription) {
        refreshSubscription();
      }
      if (tab) {
        setActiveTab(tab);
      }
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("success");
      setSearchParams(newSearchParams, { replace: true });
    }

    if (canceled === "true") {
      setShowCancelAlert(true);
      toast.info("Payment was canceled. You can try again anytime.");
      if (tab) {
        setActiveTab(tab);
      }
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete("canceled");
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, refreshSubscription]);

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

      setIsLoading(true);
      try {
        const response = await API.user.updateProfile(payload);
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

  if (!authSession || !initialFormData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-primary border-b border-primary/20">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="animate-pulse">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-white/20 rounded-xl"></div>
                <div>
                  <div className="h-8 bg-white/20 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-white/20 rounded w-64"></div>
                </div>
              </div>
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

  const paymentPlan =
    verifiedSubscription?.planId ||
    watch("paymentPlan") ||
    user.paymentPlan ||
    "starter";
  const subscriptionStatus = verifiedSubscription?.subscriptionStatus || "none";

  return (
    <div className="min-h-screen">
      {/* Enhanced Header - Matching Job Page Style */}
      <div className="bg-primary border-b border-primary/20 px-6 py-4 relative overflow-hidden max-h-[80px]">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-white">
                  Account Settings
                </h1>
                <p className="text-sm text-white/80 flex items-center gap-3">
                  Manage your profile, company, and application preferences
                  <Badge
                    variant="secondary"
                    className="bg-white/20 text-white border-white/20 text-xs"
                  >
                    {isDirty ? `${dirtyFieldsCount} unsaved` : "All saved"}
                  </Badge>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {lastSaved && (
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
                  <CheckCircle2 className="h-4 w-4 text-green-300" />
                  <span className="text-sm text-white/90 font-medium">
                    Saved {lastSaved.toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Compact Professional Profile Summary */}
      <div className="px-6 pt-7 max-w-7xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between">
            {/* Left Side - Profile Info */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20 ring-2 ring-primary/20 shadow-none">
                  <AvatarImage src={profileImg || "/placeholder.svg"} />
                  <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-primary to-primary/80 text-white shadow-sm border-2 border-white">
                    {firstName.charAt(0)}
                    {lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {/* Active Indicator */}
                <div className="absolute -bottom-0 -right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="space-y-1.5">
                <h2 className="text-xl font-semibold text-gray-900">
                  {firstName} {lastName}
                </h2>
                <p className="text-gray-600 text-sm">{email}</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded-full">
                    <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                    <span className="text-xs font-medium text-emerald-700">
                      Verified
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Compact Plan Info */}
            <div className="flex items-center gap-4">
              {/* Plan Badge */}
              <div className="text-center">
                <div
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-lg border font-semibold text-sm capitalize",
                    getPlanColor(paymentPlan)
                  )}
                >
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      paymentPlan === "starter"
                        ? "bg-blue-500"
                        : paymentPlan === "professional"
                        ? "bg-purple-500"
                        : paymentPlan === "enterprise"
                        ? "bg-amber-500"
                        : "bg-gray-500"
                    )}
                  ></div>
                  {paymentPlan}
                </div>
              </div>

              {/* Status */}
              <div className="flex flex-col items-end">
                <div
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium",
                    subscriptionStatus === "active"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : subscriptionStatus === "none"
                      ? "bg-gray-50 text-gray-600 border border-gray-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  )}
                >
                  <div
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      subscriptionStatus === "active"
                        ? "bg-emerald-500"
                        : subscriptionStatus === "none"
                        ? "bg-gray-400"
                        : "bg-amber-500"
                    )}
                  ></div>
                  {subscriptionStatus === "none"
                    ? "No subscription"
                    : subscriptionStatus}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        {/* Success/Cancel Alerts */}
        {showSuccessAlert && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="flex items-center justify-between">
                <span>
                  Payment successful! Your subscription has been updated.
                </span>
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
                <span>
                  Payment was canceled. You can try again anytime from the
                  Billing tab.
                </span>
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
          <ProfileTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            variant="global-settings"
          >
            {activeTab === "general" && (
              <div className="space-y-6">
                <PersonalInfoForm />
              </div>
            )}

            {activeTab === "company" && (
              <div className="space-y-6">
                <CompanyInfoForm />
              </div>
            )}

            {activeTab === "billing" && (
              <div className="space-y-6">
                <AccountSettingsForm />
              </div>
            )}

            {activeTab === "job-templates" && (
              <div className="space-y-6">
                <JobTemplatesList />
              </div>
            )}

            {activeTab === "email-templates" && (
              <div className="space-y-8">
                {/* Email Template Configuration */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Global Template Settings
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Configure default email templates for system-generated
                      communications
                    </p>
                  </div>
                  <GlobalEmailTemplateSettings />
                </div>

                {/* Email Templates Management */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Template Library
                    </h3>
                    <p className="text-sm text-gray-600">
                      Create and manage custom email templates
                    </p>
                  </div>
                  <EmailTemplatesList />
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Notification Preferences
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Configure how and when you receive notifications
                  </p>
                </div>

                <div className="text-center py-12 text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Notification settings coming soon</p>
                </div>
              </div>
            )}
          </ProfileTabs>

          <SaveChangesBar
            isDirty={isDirty}
            isLoading={isLoading}
            isSaved={isSaved}
            onSubmit={() => handleFormSubmit(getValues())}
            changedFieldsCount={dirtyFieldsCount}
            onDiscard={() => reset(initialFormData || undefined)}
          />
        </FormProvider>
      </div>
    </div>
  );
};

export default GlobalSettingPage;
