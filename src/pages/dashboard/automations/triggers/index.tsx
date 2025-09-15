import ApplicationCreatedTrigger from "@/components/dashboard/automations/triggers/application-created-trigger";
import { Button } from "@/components/ui/button";
import { allTriggers } from "@/constants/automations-constants";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router";

function TriggersPage() {
  const { triggerId } = useParams();
  const navigate = useNavigate();

  const trigger = allTriggers.find((t) => t.type === triggerId);

  if (!trigger) {
    return <div>Trigger not found</div>;
  }

  const renderTriggerComponent = () => {
    switch (trigger.type) {
      case "application_created":
        return <ApplicationCreatedTrigger />;
      default:
        return (
          <div>
            <div>
              <h1>{trigger.label}</h1>
              <p>Component for this trigger type is not yet implemented.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      {renderTriggerComponent()}
    </div>
  );
}

export default TriggersPage;
