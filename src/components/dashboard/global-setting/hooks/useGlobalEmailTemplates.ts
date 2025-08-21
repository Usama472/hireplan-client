import API from "@/http";
import { getEmailTemplates } from "@/http/email-template/api";
import { usePaginationQuery } from "@/lib/hooks/usePaginateQuery";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export interface GlobalEmailTemplate {
  id: string;
  label: string;
  enabled: boolean;
  category: string;
  customTemplateId?: string | null;
  customTemplateName?: string | null;
  templateId: string;
}

export interface GlobalEmailTemplateSettings {
  interviewSchedule: GlobalEmailTemplate;
  interviewConfirmation: GlobalEmailTemplate;
  interviewRejection: GlobalEmailTemplate;
}

export interface EmailTemplate {
  id?: string;
  name: string;
  category: string;
  subject: string;
  body: string;
  isActive: boolean;
  description?: string;
}

interface EmailTemplatesResponse {
  emailTemplates: {
    results: EmailTemplate[];
    limit: number;
    page: number;
    totalPages: number;
    totalResults: number;
  };
}

const DEFAULT_SETTINGS: GlobalEmailTemplateSettings = {
  interviewSchedule: {
    id: "default-schedule",
    label: "Interview Schedule",
    enabled: true,
    category: "interview-schedule",
    customTemplateId: null,
    customTemplateName: null,
    templateId: "default",
  },
  interviewConfirmation: {
    id: "default-confirmation",
    label: "Interview Confirmation",
    enabled: true,
    category: "interview-confirmation",
    customTemplateId: null,
    customTemplateName: null,
    templateId: "default",
  },
  interviewRejection: {
    id: "default-rejection",
    label: "Interview Rejection",
    enabled: true,
    category: "interview-rejection",
    customTemplateId: null,
    customTemplateName: null,
    templateId: "default",
  },
};

// Normalize API/global object into our settings shape
function normalizeSettings(input: any): GlobalEmailTemplateSettings {
  console.log("🔍 Normalizing input:", input);

  // If already in full object shape
  if (
    input?.interviewSchedule?.templateId !== undefined &&
    input?.interviewConfirmation?.templateId !== undefined &&
    input?.interviewRejection?.templateId !== undefined
  ) {
    const s = input as GlobalEmailTemplateSettings;
    return {
      interviewSchedule: {
        ...DEFAULT_SETTINGS.interviewSchedule,
        ...s.interviewSchedule,
        templateId: s.interviewSchedule.templateId || "default",
      },
      interviewConfirmation: {
        ...DEFAULT_SETTINGS.interviewConfirmation,
        ...s.interviewConfirmation,
        templateId: s.interviewConfirmation.templateId || "default",
      },
      interviewRejection: {
        ...DEFAULT_SETTINGS.interviewRejection,
        ...s.interviewRejection,
        templateId: s.interviewRejection.templateId || "default",
      },
    };
  }

  // If simplified id-only shape
  const scheduleId = input?.interviewScheduleId ?? "default";
  const confirmationId = input?.interviewConfirmationId ?? "default";
  const rejectionId = input?.interviewRejectionId ?? "default";

  console.log("📌 Extracted template IDs:", {
    scheduleId,
    confirmationId,
    rejectionId,
  });

  return {
    interviewSchedule: {
      ...DEFAULT_SETTINGS.interviewSchedule,
      customTemplateId: scheduleId !== "default" ? scheduleId : null,
      customTemplateName:
        scheduleId !== "default" ? `Template ${scheduleId}` : null,
      templateId: scheduleId,
    },
    interviewConfirmation: {
      ...DEFAULT_SETTINGS.interviewConfirmation,
      customTemplateId: confirmationId !== "default" ? confirmationId : null,
      customTemplateName:
        confirmationId !== "default" ? `Template ${confirmationId}` : null,
      templateId: confirmationId,
    },
    interviewRejection: {
      ...DEFAULT_SETTINGS.interviewRejection,
      customTemplateId: rejectionId !== "default" ? rejectionId : null,
      customTemplateName:
        rejectionId !== "default" ? `Template ${rejectionId}` : null,
      templateId: rejectionId,
    },
  };
}

export const useGlobalEmailTemplates = () => {
  const [settings, setSettings] =
    useState<GlobalEmailTemplateSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Use pagination system for available templates
  const {
    data: emailTemplatesData,
    loading: isLoading,
    error,
    filters: { setSearchQuery, searchQuery },
    pageParams: { currentPage, totalPages, setPage, pageSize },
  } = usePaginationQuery({
    key: "queryGlobalEmailTemplates",
    limit: 100,
    fetchFun: getEmailTemplates,
    parseResponse: (data: EmailTemplatesResponse) => data.emailTemplates,
  });

  // Load settings from localStorage or use API, else defaults
  // const loadSettings = useCallback(async () => {
  //   try {
  //     setLoading(true);

  //     const savedSettings = localStorage.getItem("globalEmailTemplateSettings");

  //     if (savedSettings) {
  //       const parsed = JSON.parse(savedSettings);

  //       // Detect simplified shape and reconstruct to full objects
  //       const hasSimplifiedKeys =
  //         typeof parsed === "object" &&
  //         ("interviewScheduleId" in parsed ||
  //           "interviewConfirmationId" in parsed ||
  //           "interviewRejectionId" in parsed);

  //       const hasFullObjects =
  //         parsed?.interviewSchedule &&
  //         parsed?.interviewConfirmation &&
  //         parsed?.interviewRejection;

  //       if (hasFullObjects && !hasSimplifiedKeys) {
  //         setSettings(parsed);
  //       } else {
  //         const reconstructed = normalizeSettings(parsed);
  //         setSettings(reconstructed);
  //         localStorage.setItem(
  //           "globalEmailTemplateSettings",
  //           JSON.stringify(reconstructed)
  //         );
  //       }
  //     } else {
  //       const apiData = await API.globalSetting.getGlobalSettings();
  //       console.log("apiData", apiData);
  //       if (apiData) {
  //         const normalized = normalizeSettings(apiData);
  //         setSettings(normalized);
  //         localStorage.setItem(
  //           "globalEmailTemplateSettings",
  //           JSON.stringify(normalized)
  //         );
  //       } else {
  //         setSettings(DEFAULT_SETTINGS);
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error loading settings:", error);
  //     setSettings(DEFAULT_SETTINGS);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, []);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const apiResponse = await API.globalSetting.getGlobalSettings();
      console.log("🔄 API Settings Response:", apiResponse);

      if (apiResponse?.data?.globalSettings) {
        const apiData = apiResponse.data.globalSettings;
        console.log("🔄 Raw API data:", apiData);

        // Get the normalized settings
        const normalized = normalizeSettings(apiData);
        console.log("🔄 Normalized settings:", normalized);

        // Try to fetch template names if we have template IDs
        if (emailTemplatesData && emailTemplatesData.length > 0) {
          // For each category that has a custom template ID, try to find its name
          for (const category of [
            "interviewSchedule",
            "interviewConfirmation",
            "interviewRejection",
          ] as const) {
            const templateId = normalized[category].customTemplateId;
            if (templateId) {
              // Find the template in our available templates
              const template = emailTemplatesData.find(
                (t) => t.id === templateId
              );
              if (template) {
                console.log(
                  `🔍 Found template for ${category}:`,
                  template.name
                );
                normalized[category].customTemplateName = template.name;
              }
            }
          }
        }

        setSettings(normalized);
      } else {
        console.log("🔄 No settings found, using defaults");
        setSettings(DEFAULT_SETTINGS);
      }
    } catch (error) {
      console.error("❌ Error loading settings:", error);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, [emailTemplatesData]);

  // Save settings to localStorage
  // const saveSettings = useCallback(
  //   async (newSettings: GlobalEmailTemplateSettings) => {
  //     try {
  //       setSaving(true);
  //       console.log("New Settings", newSettings);
  //       let
  //       // localStorage.setItem(
  //       //   "globalEmailTemplateSettings",
  //       //   JSON.stringify(newSettings)
  //       // );
  //       const res = await API.globalSetting.updateGlobalSetting(newSettings);
  //       console.log("API update Response", res);
  //       setSettings(newSettings);

  //       toast.success("Email template settings saved successfully!");
  //       return true;
  //     } catch (error) {
  //       console.error("Error saving settings:", error);
  //       toast.error("Failed to save email template settings");
  //       return false;
  //     } finally {
  //       setSaving(false);
  //     }
  //   },
  //   []
  // );

  const saveSettings = useCallback(
    async (newSettings: GlobalEmailTemplateSettings) => {
      try {
        setSaving(true);

        // Create a simplified data structure to send to the API
        const apiData = {
          interviewScheduleId:
            newSettings.interviewSchedule.customTemplateId || null,
          interviewConfirmationId:
            newSettings.interviewConfirmation.customTemplateId || null,
          interviewRejectionId:
            newSettings.interviewRejection.customTemplateId || null,
        };
        // Make the API call with the simplified data
        const response = await API.globalSetting.updateGlobalSetting(apiData);
        console.log("📥 API Response:", response);

        setSettings(newSettings);
        toast.success("Email template settings saved successfully!");

        return true;
      } catch (error) {
        console.error("❌ Error saving settings:", error);
        toast.error("Failed to save email template settings");
        return false;
      } finally {
        setSaving(false);
      }
    },
    []
  );

  // Set custom template for a specific type
  const setCustomTemplate = useCallback(
    (
      type: keyof GlobalEmailTemplateSettings,
      templateId: string | null,
      templateName: string | null
    ) => {
      console.log(`Setting custom template for ${type}:`, {
        templateId,
        templateName,
      });

      if (templateId === "custom") {
        templateId = null;
      }

      // Make a deep clone of the current settings to ensure React detects the change
      setSettings((prev) => {
        const newSettings = JSON.parse(JSON.stringify(prev));
        newSettings[type] = {
          ...newSettings[type],
          customTemplateId: templateId,
          customTemplateName: templateName,
          templateId: templateId || "default",
        };
        console.log("Updated settings object:", newSettings);
        return newSettings;
      });
    },
    []
  );

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem("globalEmailTemplateSettings");
    toast.info("Settings reset to defaults");
  }, []);

  // Refresh available templates
  const refreshTemplates = useCallback(() => {
    setPage(1);
  }, [setPage]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading: loading || isLoading,
    saving,
    // Available templates data
    availableTemplates: Array.isArray(emailTemplatesData)
      ? emailTemplatesData
      : [],
    templatesLoading: isLoading,
    // Pagination data
    currentPage,
    totalPages,
    setPage,
    pageSize,
    totalResults: emailTemplatesData?.length || 0,
    // Search functionality
    searchQuery,
    setSearchQuery,
    error,
    // Template management functions
    setCustomTemplate,
    saveSettings,
    resetToDefaults,
    loadSettings,
    refreshTemplates,
  };
};
