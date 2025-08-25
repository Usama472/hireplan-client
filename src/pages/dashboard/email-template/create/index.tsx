import { CreateEmailTemplate } from "@/components/dashboard/email-templates/create";
import { SubscriptionGuard } from '@/components/common/SubscriptionGuard';

const CreateEmailTemplatePage = () => {
  return (
    <div>
      <SubscriptionGuard requiredPlan="professional">
        <CreateEmailTemplate />
      </SubscriptionGuard>
    </div>
  );
};

export default CreateEmailTemplatePage;
