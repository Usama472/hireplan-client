import { CreateSMSTemplate } from "@/components/dashboard/sms/create";
import { SubscriptionGuard } from '@/components/common/SubscriptionGuard';

const CreateSMSTemplatePage = () => {
  return (
    <div>
      <SubscriptionGuard requiredPlan="professional">
        <CreateSMSTemplate />
      </SubscriptionGuard>
    </div>
  );
};

export default CreateSMSTemplatePage;
