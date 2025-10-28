import AutomationBuilder from "@/components/dashboard/automations/automation-builder";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CreateAutomationPage() {
  const navigate = useNavigate();

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
              Create New Automation
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
        <AutomationBuilder />
      </div>
    </div>
  );
}
