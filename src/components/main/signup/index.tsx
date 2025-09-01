import RecruiterOnboardingForm from "@/components/forms/onboardingForm";

interface SignupProps {
  onStepChange: (step: number) => void;
}

export default function Signup({ onStepChange }: SignupProps) {
  return (
    <div className="w-full">
      <RecruiterOnboardingForm onStepChange={onStepChange} />
    </div>
  );
}
