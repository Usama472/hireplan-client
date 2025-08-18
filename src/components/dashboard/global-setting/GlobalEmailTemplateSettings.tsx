import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save } from "lucide-react";
import { GlobalTemplateSelector } from "./GlobalTemplateSelector";
import { useGlobalEmailTemplates } from "./hooks/useGlobalEmailTemplates";

export const GlobalEmailTemplateSettings: React.FC = () => {
  const { settings, loading, saving, saveSettings, setCustomTemplate } =
    useGlobalEmailTemplates();

  // Track template mode for each template type
  const [templateModes, setTemplateModes] = useState<
    Record<string, "default" | "custom">
  >({
    interviewSchedule: "default",
    interviewConfirmation: "default",
    interviewRejection: "default",
  });

  // Synchronize templateModes with actual settings when they load
  React.useEffect(() => {
    if (!loading && settings) {
      const newModes: Record<string, "default" | "custom"> = {};
      Object.entries(settings).forEach(([key, template]) => {
        newModes[key] = template.customTemplateId ? "custom" : "default";
      });
      setTemplateModes(newModes);
    }
  }, [loading, settings]);

  const handleSave = async () => {
    await saveSettings(settings);
  };

  const handleTemplateModeChange = (
    templateKey: string,
    mode: "default" | "custom"
  ) => {
    setTemplateModes((prev) => ({ ...prev, [templateKey]: mode }));

    if (mode === "default") {
      setCustomTemplate(templateKey as keyof typeof settings, null, null);
    }
    // Don't change templateId when switching to custom mode
    // It should remain as the actual template ID or "default"
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-2xl mb-4">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
          <p className="text-gray-600 font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Compact Header */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-slate-900 mb-2">
              Email Templates
            </h1>
            <p className="text-base text-slate-600">
              Configure global email templates for your organization's interview
              communications
            </p>
          </div>
          <div>
            <Button
              onClick={handleSave}
              disabled={saving}
              variant="outline"
              size="sm"
              className="px-4 py-1.5 text-sm font-medium"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5 mr-1.5" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="space-y-6">
          {Object.entries(settings).map(([key, template]) => {
            const config = {
              label: template.label,
              category: template.category,
            };

            return (
              <Card
                key={key}
                className="group border border-slate-200/60 hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow-lg bg-white/50 backdrop-blur-sm"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div>
                          <CardTitle className="text-lg font-semibold text-slate-900 mb-1">
                            {config.label}
                          </CardTitle>
                          <CardDescription className="text-sm text-slate-500">
                            Choose your preferred template option
                          </CardDescription>
                        </div>
                      </div>
                    </div>

                    {/* Template Mode Switch */}
                    <div className="flex flex-col items-end gap-4">
                      <div className="flex items-center space-x-4 bg-slate-50/80 p-3 rounded-xl border border-slate-200/50">
                        <Label
                          htmlFor={`${key}-mode-switch`}
                          className="text-sm font-semibold text-slate-700 cursor-pointer"
                        >
                          Default
                        </Label>
                        <Switch
                          id={`${key}-mode-switch`}
                          checked={templateModes[key] === "custom"}
                          onCheckedChange={(checked) =>
                            handleTemplateModeChange(
                              key,
                              checked ? "custom" : "default"
                            )
                          }
                          className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-primary data-[state=checked]:to-primary/90"
                        />
                        <Label
                          htmlFor={`${key}-mode-switch`}
                          className="text-sm font-semibold text-slate-700 cursor-pointer"
                        >
                          Custom
                        </Label>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                {/* Template Selector (only shown when custom mode is active) */}
                {templateModes[key] === "custom" && (
                  <CardContent className="pt-0 pb-6">
                    <GlobalTemplateSelector
                      category={config.category}
                      selectedTemplateId={template.customTemplateId}
                      onTemplateSelection={(templateId, templateName) =>
                        setCustomTemplate(
                          key as keyof typeof settings,
                          templateId,
                          templateName
                        )
                      }
                    />
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
