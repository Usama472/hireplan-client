import CreateJob from "@/components/dashboard/jobs/create";
import { SubscriptionGuard } from "@/components/common/SubscriptionGuard";

export default function CreateJobPage() {
  return (
    <div className="min-h-full bg-gray-50/30 flex flex-col">
      <SubscriptionGuard requiredPlan="starter">
        <CreateJob />
      </SubscriptionGuard>
    </div>
  );
}
