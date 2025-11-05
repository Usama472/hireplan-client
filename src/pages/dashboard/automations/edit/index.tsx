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
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { id } = useParams();

  // Load automation data
  useEffect(() => {
    const loadAutomation = async () => {
      if (!id) {
        console.error("❌ No automation ID provided");
        toast.error("No automation ID provided");
        navigate("/dashboard/automations");
        return;
      }

      console.log("🔍 Loading automation with ID:", id);

      try {
        setIsLoading(true);
        setError(null);
        
        const response = await API.automation.getAutomationById(id);
        console.log("📋 API Response:", response);
        
        if (response?.success && response?.automation) {
          console.log("✅ Automation loaded successfully:", response.automation);
          setAutomationData(response.automation);
        } else {
          console.error("❌ Invalid response structure:", response);
          setError("Automation not found");
          toast.error("Automation not found");
          // Don't navigate immediately, show error state
        }
      } catch (error: any) {
        console.error("❌ Error loading automation:", error);
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        
        if (error.response?.status === 404) {
          setError("Automation not found");
          toast.error("Automation not found");
        } else if (error.response?.status === 403) {
          setError("Access denied - you don't have permission to edit this automation");
          toast.error("Access denied - you don't have permission to edit this automation");
        } else if (error.response?.status === 400) {
          setError("Invalid automation ID");
          toast.error("Invalid automation ID");
        } else {
          setError("Failed to load automation. Please try again.");
          toast.error("Failed to load automation. Please try again.");
        }
        
        // Don't navigate immediately for errors, show error state
      } finally {
        setIsLoading(false);
      }
    };

    loadAutomation();
  }, [id]); // Removed navigate from dependencies to prevent infinite loops

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

  // If there's an error or no automation data, show error state
  if (error || (!isLoading && !automationData)) {
    return (
      <div className="min-h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Automation</h2>
          <p className="text-gray-600 mb-6">
            {error || "The automation could not be found or loaded."}
          </p>
          <div className="space-x-3">
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Try Again
            </Button>
            <Button 
              onClick={() => navigate("/dashboard/automations")}
            >
              Back to Automations
            </Button>
          </div>
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