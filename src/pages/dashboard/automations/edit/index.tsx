import AutomationBuilder from "@/components/dashboard/automations/automation-builder";
import { Button } from "@/components/ui/button";
import type { AutomationType } from "@/interfaces/automations";
import { useToast } from "@/lib/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function EditAutomationPage() {
  const [automation, setAutomation] = useState<AutomationType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();

  // Fetch automation data
  useEffect(() => {
    // In a real implementation, this would be an API call
    // Mock data for this example
    const mockAutomations = [
      {
        id: "1",
        name: "Send rejection email after 10 days",
        description:
          "Automatically sends a rejection email 10 days after an application is rejected",
        trigger: {
          type: "application_status_changed",
          config: {
            from: null,
            to: "rejected",
          },
        },
        conditions: [
          {
            field: "resumeScore",
            operator: "<",
            value: "50",
          },
        ],
        actions: [
          {
            type: "send_email",
            config: {
              templateId: "rejection-standard",
              delay: {
                value: 10,
                unit: "days",
              },
              timezone: "Asia/Karachi",
            },
          },
        ],
        enabled: true,
        lastRunAt: "2023-10-15T14:30:00Z",
        nextRunAt: "2023-10-25T14:30:00Z",
        createdAt: "2023-10-15T14:30:00Z",
        updatedAt: "2023-10-15T14:30:00Z",
      },
      {
        id: "2",
        name: "Send follow-up to qualified candidates",
        description:
          "Sends a follow-up email to candidates with high resume scores",
        trigger: {
          type: "resume_score_updated",
          config: {},
        },
        conditions: [
          {
            field: "resumeScore",
            operator: ">",
            value: "75",
          },
        ],
        actions: [
          {
            type: "send_email",
            config: {
              templateId: "qualified-followup",
              delay: {
                value: 1,
                unit: "days",
              },
              timezone: "America/New_York",
            },
          },
        ],
        enabled: true,
        lastRunAt: "2023-10-18T09:45:00Z",
        nextRunAt: "2023-10-19T09:45:00Z",
        createdAt: "2023-10-10T11:20:00Z",
        updatedAt: "2023-10-10T11:20:00Z",
      },
    ];

    setTimeout(() => {
      const found = mockAutomations.find((a) => a.id === id);
      if (found) {
        setAutomation(found);
      } else {
        toast({
          title: "Automation not found",
          description: "The automation you're trying to edit doesn't exist.",
          type: "error",
        });
        navigate("/dashboard/automations");
      }
      setIsLoading(false);
    }, 500);
  }, [id, navigate, toast]);

  // Handle save automation
  const handleSaveAutomation = (updatedAutomation: AutomationType) => {
    setIsLoading(true);

    // In a real implementation, this would be an API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Automation updated",
        description: `${updatedAutomation.name} has been updated successfully.`,
        type: "success",
      });
      navigate("/dashboard/automations");
    }, 800);
  };

  // Handle cancel/back
  const handleCancel = () => {
    if (
      confirm(
        "Are you sure you want to cancel? Any unsaved changes will be lost."
      )
    ) {
      navigate("/dashboard/automations");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-full bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!automation) {
    return null;
  }

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 max-w-[1600px] mx-auto">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700 h-7 w-7"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-base sm:text-lg font-bold text-gray-900">Edit Automation</h1>
          </div>
          <div>
            <Button variant="ghost" onClick={handleCancel} size="sm" className="mr-1.5">
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto py-3 px-2.5 sm:px-3">
        <AutomationBuilder
          mode="standalone"
          onSave={handleSaveAutomation}
          automation={automation}
          isPageLayout={true}
        />
      </div>
    </div>
  );
}
