import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { companySignupService } from '../http/company-signup';
import { Loader2 } from 'lucide-react';
import { StepIndicator } from '../components/main/signup/StepIndicator';
import { StepNavigation } from '../components/main/signup/stepNavigation';
import { Form } from '../components/ui/form';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { InputField } from '../components/common/InputField';
import { INPUT_TYPES } from '../interfaces';
import { COMPANY_SIZES, INDUSTRIES, COMPANY_SIGNUP_STEPS } from '../constants/form-constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { mutateSession } from '../http/auth/mutateSession';
import { ROUTES } from '../constants';
import { errorResolver } from '../lib/utils';

// Define form schema
const companySignupSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string(),
  companyName: z.string().min(1, 'Company name is required'),
  websiteUrl: z.string().optional(),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().default('US'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof companySignupSchema>;

interface CompanyData {
  company: {
    id: string;
    companyName: string;
    websiteUrl?: string;
    industry?: string;
    companySize?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    planId?: string;
    customMonthlyPrice?: number | null;
    maxJobPostings?: number | null;
  };
  adminInfo: {
    adminEmail: string;
    adminFirstName: string;
    adminLastName: string;
  };
  expiresAt: Date;
}

// Account Setup Step Component
function AccountSetupStep() {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Your Admin Password</h3>
        <p className="text-gray-600">Set up your admin account to manage your company</p>
      </div>
      
      <InputField
        name="password"
        type={INPUT_TYPES.PASSWORD}
        placeholder="Password *"
      />
      
      <InputField
        name="confirmPassword"
        type={INPUT_TYPES.PASSWORD}
        placeholder="Confirm Password *"
      />
    </div>
  );
}

// Company Details Step Component
function CompanyDetailsStep() {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Company Information</h3>
        <p className="text-gray-600">Review and update your company details</p>
      </div>
      
      <InputField
        name="companyName"
        placeholder="Company Name *"
      />
      
      <InputField
        name="websiteUrl"
        placeholder="Website URL"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          name="industry"
          type={INPUT_TYPES.SELECT}
          placeholder="Industry"
          selectOptions={INDUSTRIES}
        />
        <InputField
          name="companySize"
          type={INPUT_TYPES.SELECT}
          placeholder="Company Size"
          selectOptions={COMPANY_SIZES}
        />
      </div>
      
      <InputField
        name="address"
        placeholder="Address"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField
          name="city"
          placeholder="City"
        />
        <InputField
          name="state"
          placeholder="State"
        />
        <InputField
          name="zipCode"
          placeholder="Zip Code"
        />
      </div>
    </div>
  );
}

// Review Step Component
function ReviewStep() {
  const { watch } = useFormContext<FormValues>();
  const formData = watch();
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Review Your Information</h3>
        <p className="text-gray-600">Confirm your details and complete setup</p>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Company Details</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <p><span className="font-medium">Company:</span> {formData?.companyName || 'Not specified'}</p>
            <p><span className="font-medium">Website:</span> {formData?.websiteUrl || 'Not specified'}</p>
            <p><span className="font-medium">Industry:</span> {formData?.industry || 'Not specified'}</p>
            <p><span className="font-medium">Size:</span> {formData?.companySize || 'Not specified'}</p>
          </div>
        </div>
        
        {formData?.address && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Address</h4>
            <div className="text-sm text-gray-600">
              <p>{formData.address}</p>
              <p>{formData.city}{formData.state ? `, ${formData.state}` : ''} {formData.zipCode}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Custom Step Indicator for Company Signup
function CompanySignupStepIndicator({ currentStep, completedSteps }: { currentStep: number; completedSteps: number[] }) {
  const currentStepData = COMPANY_SIGNUP_STEPS.find((step) => step.id === currentStep);

  return (
    <div className="mb-8">
      {/* Main heading */}
      <h2 className="text-2xl font-bold text-foreground mb-3">
        {currentStepData?.title}
      </h2>

      {/* Description */}
      <p className="text-muted-foreground text-base leading-relaxed max-w-2xl">
        {currentStepData?.description}
      </p>
    </div>
  );
}

const CompanySignup: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Initialize form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(companySignupSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
      companyName: '',
      websiteUrl: '',
      industry: '',
      companySize: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
    },
    mode: 'onChange',
  });

  const { trigger, handleSubmit, clearErrors, setValue } = form;

  // Define step fields for validation
  const stepFields = {
    1: ['password', 'confirmPassword'],
    2: ['companyName'],
    3: [], // Review step - no additional validation needed
  };

  useEffect(() => {
    if (!token) {
      setError('Invalid signup link. Please check your email for the correct link.');
      setLoading(false);
      return;
    }

    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      setLoading(true);
      const data = await companySignupService.verifySignupToken(token!);
      setCompanyData(data);
      
      // Pre-fill form with company data
      setValue('companyName', data.company.companyName || '');
      setValue('websiteUrl', data.company.websiteUrl || '');
      setValue('industry', data.company.industry || '');
      setValue('companySize', data.company.companySize || '');
      setValue('address', data.company.address || '');
      setValue('city', data.company.city || '');
      setValue('state', data.company.state || '');
      setValue('zipCode', data.company.zipCode || '');
      setValue('country', data.company.country || 'US');
      
    } catch (error: any) {
      setError(error.message || 'Invalid or expired signup link');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    clearErrors();

    if (currentStep === 3) {
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

      setCurrentStep((prev) => Math.min(prev + 1, 3));
      clearErrors();
    }
  };

  const handlePrevious = () => {
    clearErrors();
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (formData: FormValues) => {
    if (currentStep !== 3) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await companySignupService.completeSignup(token!, { 
        password: formData.password 
      });
      
      // Clear any old cached profile before setting new session
      localStorage.removeItem('cachedUserProfile');
      
      const authToken = result.tokens.accessToken.token;
      await mutateSession({ shouldBroadcast: true, accessToken: authToken });

      toast.success('Account created successfully! Welcome to HirePlan!');
      
      // Redirect based on whether checkout is required
      if (result.requiresCheckout) {
        // Store the fact that they just signed up for post-checkout redirect
        localStorage.setItem('justSignedUp', 'true');
        navigate('/checkout');
      } else {
        // Go directly to dashboard
        window.location.href = ROUTES.DASHBOARD.MAIN;
      }

    } catch (error) {
      const errorMessage = errorResolver(error);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <AccountSetupStep />;
      case 2:
        return <CompanyDetailsStep />;
      case 3:
        return <ReviewStep />;
      default:
        return <AccountSetupStep />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Verifying your signup link...</p>
        </div>
      </div>
    );
  }

  if (error && !companyData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Invalid Signup Link</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <CompanySignupStepIndicator
        currentStep={currentStep}
        completedSteps={completedSteps}
      />

      <FormProvider {...form}>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              if (currentStep !== 3) {
                e.preventDefault();
                return;
              }
              handleSubmit(onSubmit)(e);
            }}
            className="space-y-8"
          >
            {renderCurrentStep()}

            <StepNavigation
              currentStep={currentStep}
              totalSteps={3}
              onNext={handleNext}
              onPrevious={handlePrevious}
              isFirstStep={currentStep === 1}
              isLastStep={currentStep === 3}
              isValid={true}
              isSubmitting={isSubmitting}
              finalStepText="Complete Setup"
            />
          </form>
        </Form>
      </FormProvider>
    </div>
  );
};

export default CompanySignup;
