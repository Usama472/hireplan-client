import AutomationBuilder from "@/components/dashboard/automations/automation-builder";
import { Button } from "@/components/ui/button";
import type { AutomationType } from "@/interfaces/automations";
import { useToast } from "@/lib/hooks/use-toast";
import API from "@/http";
// Removed global DataLoadingManager import
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
    const fetchAutomation = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const response = await API.automation.getAutomationById(id);
            
            if (response?.success && response?.automation) {
              setAutomation(response.automation);
            } else {
              toast({
                title: "Automation not found",
                description: "The automation you're trying to edit doesn't exist.",
                type: "error",
              });
              navigate("/dashboard/automations");
            }
          } catch (error) {
            console.error("Error fetching automation:", error);
            toast({
              title: "Error loading automation",
              description: "Failed to load the automation. Please try again.",
              type: "error",
            });
            navigate("/dashboard/automations");
          } finally {
            setIsLoading(false);
          }
    };

    fetchAutomation();
  }, [id, navigate, toast]);

  // Handle save automation
  const handleSaveAutomation = async (updatedAutomation: AutomationType) => {
    if (!id) return;

    try {
      setIsLoading(true);
      const response = await API.automation.updateAutomation(id, updatedAutomation);
      
      if (response?.success) {
        toast({
          title: "Automation updated",
          description: `${updatedAutomation.name} has been updated successfully.`,
          type: "success",
        });
        navigate("/dashboard/automations");
      } else {
        toast({
          title: "Update failed",
          description: "Failed to update the automation. Please try again.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error updating automation:", error);
      toast({
        title: "Update failed",
        description: "An error occurred while updating the automation.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
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
