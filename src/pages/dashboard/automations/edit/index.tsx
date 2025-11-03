import AutomationBuilder from "@/components/dashboard/automations/automation-builder";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import API from "@/http";
import { AutomationProvider } from "@/contexts/AutomationContext";

export default function EditAutomationPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [automationData, setAutomationData] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  // Load automation data
  useEffect(() => {
    const loadAutomation = async () => {
      if (!id) {
        toast.error("No automation ID provided");
        navigate("/dashboard/automations");
        return;
      }

      try {
        setIsLoading(true);
        const response = await API.automation.getAutomationById(id);
        
        if (response?.success && response?.automation) {
          setAutomationData(response.automation);
        } else {
          toast.error("Automation not found");
          navigate("/dashboard/automations");
        }
      } catch (error) {
        console.error("Error loading automation:", error);
        toast.error("Failed to load automation");
        navigate("/dashboard/automations");
      } finally {
        setIsLoading(false);
      }
    };

    loadAutomation();
  }, [id, navigate]);

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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-gray-600">Loading automation...</p>
        </div>
      </div>
    );
  }

  // If no automation data loaded, show error
  if (!automationData) {
    return (
      <div className="min-h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Automation not found</p>
          <Button 
            onClick={() => navigate("/dashboard/automations")}
            className="mt-4"
          >
            Back to Automations
          </Button>
        </div>
      </div>
    );
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
            <h1 className="text-base sm:text-lg font-bold text-gray-900">
              Edit Automation
            </h1>
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
        <AutomationProvider initialAutomation={automationData}>
          <AutomationBuilder />
        </AutomationProvider>
      </div>
    </div>
  );
}