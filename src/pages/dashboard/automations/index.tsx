import { Button } from "@/components/ui/button";
import { Filter, Plus } from "lucide-react";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export default function AutomationsDashboard() {
  const navigate = useNavigate();

  const handleCreateAutomation = useCallback(() => {
    navigate("/dashboard/automations/create");
  }, [navigate]);

  return (
    <div className="min-h-full">
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 relative overflow-hidden max-h-[80px]">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 rounded-xl">
                  <Filter className="h-6 w-6 text-gray-600" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Automations
                  </h1>
                  <p className="text-gray-600 flex items-center gap-2">
                    Create and manage recruitment workflow automations
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  onClick={handleCreateAutomation}
                  className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg hover:shadow-xl hover:shadow-blue-600/25 transition-all duration-300 gap-2 px-5 font-medium"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Automation
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
