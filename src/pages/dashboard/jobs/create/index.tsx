import CreateJob from "@/components/dashboard/jobs/create";
import { SubscriptionGuard } from "@/components/common/SubscriptionGuard";

export default function CreateJobPage() {
  return (
    <div className=" flex flex-col">
      <SubscriptionGuard requiredPlan="starter">
        <CreateJob />
      </SubscriptionGuard>
    </div>
  );
}
