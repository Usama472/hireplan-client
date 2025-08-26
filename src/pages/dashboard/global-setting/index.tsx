import { useState, useCallback, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Settings, 
  Mail, 
  User, 
  Building, 
  Bell, 
  CreditCard,
  CheckCircle2,
  AlertCircle,
  X,
  Briefcase
} from "lucide-react";
import { GlobalEmailTemplateSettings } from "@/components/dashboard/global-setting/GlobalEmailTemplateSettings";
import { EmailTemplatesList } from "@/components/dashboard/email-templates";
import { JobTemplatesList } from "@/components/dashboard/job-templates/JobTemplatesList";
import { PersonalInfoForm } from "@/components/dashboard/profile/personal-info-form";
import { CompanyInfoForm } from "@/components/dashboard/profile/company-info-form";
import { AccountSettingsForm } from "@/components/dashboard/profile/account-settings-form";
import { SaveChangesBar } from "@/components/dashboard/profile/save-changes-bar";
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
  const [initialFormData, setInitialFormData] = useState<ProfileFormValues | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showCancelAlert, setShowCancelAlert] = useState(false);

  const { data: authSession, updateUser, subscription: verifiedSubscription, refreshSubscription } = useAuthSessionContext();
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
      paymentPlan: (user.paymentPlan as "starter" | "professional" | "enterprise") || "starter",
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
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const tab = searchParams.get('tab');

    if (success === 'true') {
      setShowSuccessAlert(true);
      toast.success('Payment successful! Your subscription has been updated.');
      if (refreshSubscription) {
        refreshSubscription();
      }
      if (tab) {
        setActiveTab(tab);
      }
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('success');
      setSearchParams(newSearchParams, { replace: true });
    }

    if (canceled === 'true') {
      setShowCancelAlert(true);
      toast.info('Payment was canceled. You can try again anytime.');
      if (tab) {
        setActiveTab(tab);
      }
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('canceled');
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
      <div className="min-h-screen bg-white">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="animate-pulse">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
                <div>
                  <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-64"></div>
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
  
  const paymentPlan = verifiedSubscription?.planId || watch("paymentPlan") || user.paymentPlan || "starter";
  const subscriptionStatus = verifiedSubscription?.subscriptionStatus || 'none';

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-600 shadow-md">
                <Settings className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600 mt-1">Manage your account and application preferences</p>
                {lastSaved && (
                  <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    Last saved {lastSaved.toLocaleTimeString()}
                  </p>
                )}
              </div>
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

          {/* Profile Summary Card */}
          <Card className="bg-gradient-to-r from-white to-blue-50/30 border-0 shadow-lg shadow-blue-100/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-16 w-16 ring-4 ring-white shadow-lg">
                    <AvatarImage src={profileImg || "/placeholder.svg"} />
                    <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                      {firstName.charAt(0)}
                      {lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 space-y-2">
                  <h2 className="text-xl font-bold text-gray-900">
                    {firstName} {lastName}
                  </h2>
                  <p className="text-gray-600">{email}</p>
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
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
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
                <span>Payment was canceled. You can try again anytime from the Billing tab.</span>
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-6 lg:w-fit lg:grid-cols-6 bg-gray-100 p-1 rounded-xl h-12">
              <TabsTrigger 
                value="general" 
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger 
                value="company" 
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Building className="h-4 w-4" />
                <span className="hidden sm:inline">Company</span>
              </TabsTrigger>
              <TabsTrigger 
                value="billing" 
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Billing</span>
              </TabsTrigger>
              <TabsTrigger 
                value="job-templates" 
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Briefcase className="h-4 w-4" />
                <span className="hidden sm:inline">Jobs</span>
              </TabsTrigger>
              <TabsTrigger 
                value="email-templates" 
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">Email</span>
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <PersonalInfoForm />
            </TabsContent>

            <TabsContent value="company" className="space-y-6">
              <CompanyInfoForm />
            </TabsContent>

            <TabsContent value="billing" className="space-y-6">
              <AccountSettingsForm />
            </TabsContent>

            <TabsContent value="job-templates" className="space-y-6">
              <Card className="rounded-xl border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <JobTemplatesList />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="email-templates" className="space-y-6">
              <div className="space-y-8">
                {/* Email Template Configuration */}
                <Card className="rounded-xl border-gray-200 shadow-sm">
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Global Template Settings</h3>
                        <p className="text-gray-600 text-sm">Configure default email templates for system-generated communications</p>
                      </div>
                      <GlobalEmailTemplateSettings />
                    </div>
                  </CardContent>
                </Card>

                {/* Email Templates Management */}
                <Card className="rounded-xl border-gray-200 shadow-sm">
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Template Library</h3>
                        <p className="text-gray-600 text-sm">Create and manage custom email templates</p>
                      </div>
                      <EmailTemplatesList />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card className="rounded-xl border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Notification Preferences</h3>
                      <p className="text-gray-600 text-sm">Configure how and when you receive notifications</p>
                    </div>
                    
                    <div className="text-center py-12 text-gray-500">
                      <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>Notification settings coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <SaveChangesBar
              isDirty={isDirty}
              isLoading={isLoading}
              isSaved={isSaved}
              onSubmit={() => handleFormSubmit(getValues())}
              changedFieldsCount={dirtyFieldsCount}
              onDiscard={() => reset(initialFormData || undefined)}
            />
          </Tabs>
        </FormProvider>
      </div>
    </div>
  );
};

export default GlobalSettingPage;