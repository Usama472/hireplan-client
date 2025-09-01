import type { FC } from "react";
import { AuthLayout } from "@/components/common/AuthLayout";
import SignupComponent from "@/components/main/signup";
import { useState } from "react";

const Register: FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <AuthLayout
      title="Create your account"
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkHref="/login"
      showSocial={false}
      currentStep={currentStep}
      totalSteps={totalSteps}
      progressPercentage={progressPercentage}
    >
      <SignupComponent onStepChange={setCurrentStep} />
    </AuthLayout>
  );
};

export default Register;
