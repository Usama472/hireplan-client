import ApplicationCreatedTrigger from "@/components/dashboard/automations/triggers/application-created-trigger";
import ApplicationStatusChangeTrigger from "@/components/dashboard/automations/triggers/application-status-change";
import JobCreatedTrigger from "@/components/dashboard/automations/triggers/job-created";
import JobExpiredTrigger from "@/components/dashboard/automations/triggers/job-expired";
import JobPublishedTrigger from "@/components/dashboard/automations/triggers/job-published";
import ResumeScoreUpdatedTrigger from "@/components/dashboard/automations/triggers/resume-score-updated";
import ScheduledTimeTrigger from "@/components/dashboard/automations/triggers/scheduled-time";
import AIFollowupTrigger from "@/components/dashboard/automations/triggers/ai-followup-trigger";
import { allTriggers } from "@/constants/automations-constants";
import { useParams } from "react-router";

function TriggersPage() {
  const { triggerId } = useParams();

  const trigger = allTriggers.find((t) => t.type === triggerId);

  if (!trigger) {
    return <div>Trigger not found</div>;
  }

  const renderTriggerComponent = () => {
    switch (trigger.type) {
      case "application_created":
        return <ApplicationCreatedTrigger />;
      case "application_status_changed":
        return <ApplicationStatusChangeTrigger />;
      case "resume_score_updated":
        return <ResumeScoreUpdatedTrigger />;
      case "ai_followup_response_received":
        return <AIFollowupTrigger />;
      case "job_created":
        return <JobCreatedTrigger />;
      case "job_published":
        return <JobPublishedTrigger />;
      case "job_expired":
        return <JobExpiredTrigger />;
      case "cron":
        return <ScheduledTimeTrigger />;
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

  return <div className="p-6">{renderTriggerComponent()}</div>;
}

export default TriggersPage;
