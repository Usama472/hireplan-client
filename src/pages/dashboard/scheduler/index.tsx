import { SubscriptionGuard } from "@/components/common/SubscriptionGuard";
import AvailabilityManager from "@/components/dashboard/availability";

export default function SchedulerPage() {
  return (
    <SubscriptionGuard requiredPlan="professional" showUpgradePrompt={true}>
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <AvailabilityManager />
        </div>
      </div>
    </SubscriptionGuard>
  );
}
