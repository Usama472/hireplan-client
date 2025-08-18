"use client";

import { CompanyInfoStep } from "@/components/forms/onboardingForm/companyInfoStep";
import { PersonalInfoStep } from "@/components/forms/onboardingForm/personalInfoStep";
import { PlanSelectionStep } from "@/components/forms/onboardingForm/planSelectionStep";
import { ReviewSubmitStep } from "@/components/forms/onboardingForm/reviewSubmitStep";
import { StepIndicator } from "@/components/main/signup/StepIndicator";
import { StepNavigation } from "@/components/main/signup/stepNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { ROUTES } from "@/constants";
import API from "@/http";
import { mutateSession } from "@/http/auth/mutateSession";
import { getErrorMessage } from "@/lib/utils";
import { fullFormSchema } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

type FormValues = z.infer<typeof fullFormSchema>;

export default function RecruiterOnboardingForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(fullFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      jobCategory: "",
      jobTitle: "",
      companyName: "",
      websiteDomain: "",
      industry: "",
      companySize: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      plan: "starter" as const,
    },
    mode: "onChange",
    criteriaMode: "all",
  });

  const { trigger, handleSubmit, clearErrors } = form;

  const stepFields = {
    1: [
      "firstName",
      "lastName",
      "email",
      "password",
      "jobCategory",
      "jobTitle",
    ],
    2: [
      "companyName",
      "industry",
      "companySize",
      "address",
      "city",
      "state",
      "zipCode",
    ],
    3: ["plan"],
    4: [],
  };

  const handleNext = async () => {
    clearErrors();

    if (currentStep === 4) {
      return;
    }

    const fieldsToValidate = stepFields[currentStep as keyof typeof stepFields];

    const isStepValid = await trigger(
      fieldsToValidate as Array<keyof FormValues>,
      {
        shouldFocus: true,
      }
    );

    if (isStepValid) {
      setCompletedSteps((prev) => [
        ...prev.filter((step) => step !== currentStep),
        currentStep,
      ]);

      setCurrentStep((prev) => {
        const nextStep = Math.min(prev + 1, 5);
        return nextStep;
      });

      clearErrors();
    }
  };

  const handlePrevious = () => {
    clearErrors();
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (formData: FormValues) => {
    if (currentStep !== 4) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await API.auth.signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        paymentPlan: formData.plan,
        companyRole: formData.jobTitle,
        jobCategory: formData.jobCategory,
        companyName: formData.companyName,
        websiteUrl: formData.websiteDomain,
        industry: formData.industry,
        companySize: formData.companySize,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        // country: formData.
      });

      const token = response.tokens.accessToken.token
      mutateSession({ shouldBroadcast: true, accessToken: token })

      toast.success("Account created successfully");
      navigate(ROUTES.DASHBOARD.MAIN);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep />;
      case 2:
        return <CompanyInfoStep />;
      case 3:
        return <PlanSelectionStep />;
      case 4:
        return <ReviewSubmitStep />;
      default:
        return <PersonalInfoStep />;
    }
  };

  return (
    <Card className="shadow-lg">
      <CardContent className="p-8">
        <StepIndicator
          currentStep={currentStep}
          completedSteps={completedSteps}
        />

        <FormProvider {...form}>
          <Form {...form}>
            <form
              onSubmit={(e) => {
                console.log("Form submit event triggered");
                if (currentStep !== 4) {
                  e.preventDefault();
                  console.log("Prevented form submission on non-final step");
                  return;
                }
                handleSubmit(onSubmit)(e);
              }}
              className="space-y-6"
            >
              {renderCurrentStep()}

              <StepNavigation
                currentStep={currentStep}
                totalSteps={4}
                onNext={handleNext}
                onPrevious={handlePrevious}
                isFirstStep={currentStep === 1}
                isLastStep={currentStep === 4}
                isValid={true}
                isSubmitting={isSubmitting}
              />
            </form>
          </Form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
