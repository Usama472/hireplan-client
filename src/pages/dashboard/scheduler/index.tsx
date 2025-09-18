import { SubscriptionGuard } from "@/components/common/SubscriptionGuard";
import AvailabilityManager from "@/components/dashboard/availability";

export default function SchedulerPage() {
  return (
    <SubscriptionGuard requiredPlan="professional" showUpgradePrompt={true}>
      <div className="flex flex-col h-full min-h-screen bg-gray-50">
        <div className="flex-1 w-full max-w-none">
          <AvailabilityManager />
        </div>
      </div>
    </SubscriptionGuard>
  );
}
