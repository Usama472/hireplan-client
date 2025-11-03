import TriggerSection from "./trigger-section";
import { useAutomation } from "@/contexts/AutomationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import API from "@/http";

export default function AutomationBuilder() {
  const { 
    isEditMode, 
    automation, 
    automationName, 
    setAutomationName,
    selectedTriggerType 
  } = useAutomation();
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const handleSave = async () => {
    if (!automationName.trim()) {
      toast.error("Please enter an automation name");
      return;
    }

    if (!selectedTriggerType) {
      toast.error("Please select a trigger type");
      return;
    }

    try {
      setIsSaving(true);

      const automationData = {
        name: automationName.trim(),
        triggerType: selectedTriggerType,
        status: isEditMode ? automation?.status || 'active' : 'active',
      };

      let response;
      if (isEditMode && automation?.id) {
        response = await API.automation.updateAutomation(automation.id, automationData);
      } else {
        response = await API.automation.createAutomation(automationData);
      }

      if (response?.success) {
        toast.success(`Automation ${isEditMode ? 'updated' : 'created'} successfully!`);
        navigate("/dashboard/automations");
      } else {
        toast.error(`Failed to ${isEditMode ? 'update' : 'create'} automation`);
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} automation:`, error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} automation`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-lg p-2.5 sm:p-3 min-h-[400px] space-y-6">
      {/* Automation Name Input */}
      <div className="space-y-2">
        <Label htmlFor="automation-name" className="text-base font-semibold">
          Automation Name
        </Label>
        <Input
          id="automation-name"
          value={automationName}
          onChange={(e) => setAutomationName(e.target.value)}
          placeholder="Enter automation name..."
          className="max-w-md"
        />
        {isEditMode && (
          <p className="text-xs text-gray-500">
            Editing: {automation?.name || "Unnamed Automation"}
          </p>
        )}
      </div>

      {/* Trigger Selection */}
      <div>
        <h3 className="text-base font-semibold mb-2.5">
          When should this automation run?
        </h3>
        <TriggerSection />
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button 
          onClick={handleSave}
          disabled={isSaving || !automationName.trim() || !selectedTriggerType}
          className="min-w-[120px]"
        >
          {isSaving ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {isEditMode ? 'Updating...' : 'Creating...'}
            </div>
          ) : (
            isEditMode ? 'Update Automation' : 'Create Automation'
          )}
        </Button>
      </div>
    </div>
  );
}
