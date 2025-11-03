import type { JobFormStepFields, SelectOption } from "@/interfaces";

export const FORM_STEPS = [
  {
    id: 1,
    title: "Personal Information",
    description: "Tell us about yourself",
  },
  { id: 2, title: "Company Information", description: "Your company details" },
  { id: 3, title: "Review & Submit", description: "Confirm your information" },
];

export const COMPANY_SIGNUP_STEPS = [
  {
    id: 1,
    title: "Account Setup",
    description: "Create your admin password",
  },
  { id: 2, title: "Company Details", description: "Review and update company information" },
  { id: 3, title: "Review & Complete", description: "Confirm and finish setup" },
];

export const COMPANY_SIZES: SelectOption[] = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "501-1000", label: "501-1000 employees" },
  { value: "1000+", label: "1000+ employees" },
];

export const INDUSTRIES: SelectOption[] = [
  { value: "technology", label: "Technology" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance" },
  { value: "education", label: "Education" },
  { value: "retail", label: "Retail" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "consulting", label: "Consulting" },
  { value: "other", label: "Other" },
];

export const PLANS = [
  {
    id: "starter",
    stripeId: import.meta.env.VITE_STRIPE_STARTER_PRICE_ID,
    name: "Starter",
    price: "Starting at $149",
    period: "/month",
    description: "Perfect for small teams getting started",
    features: [
      "Up to 50 candidate profiles",
      "Manual candidate review",
      "Email support",
      "5 job postings",
      "Candidate communication",
      "Basic job templates",
      "Standard reporting",
    ],
    popular: false,
  },
  {
    id: "professional",
    stripeId: import.meta.env.VITE_STRIPE_PROFESSIONAL_PRICE_ID,
    name: "Professional",
    price: "Starting at $249",
    period: "/month",
    description: "Complete solution for growing companies",
    features: [
      "Unlimited candidate profiles",
      "AI ranking & scoring displays",
      "Full AI automation & evaluation",
      "Auto-shortlisting & rejection",
      "Priority support",
      "Unlimited job postings",
      "Custom workflows",
      "Interview scheduler & links",
      "SMS/Text messaging",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    stripeId: import.meta.env.VITE_STRIPE_ENTERPRISE_PRICE_ID,
    name: "Enterprise",
    price: "Custom Pricing",
    period: "",
    description: "For large organizations with custom requirements",
    features: [
      "Everything in Professional",
      "AI chat conversation ranking",
      "API access",
      "White-label options",
      "Dedicated account manager",
      "Custom integrations",
      "Advanced analytics & reporting",
      "On-premise deployment options",
      "Custom training & onboarding",
      "SLA guarantees",
      "24/7 phone support",
    ],
    popular: false,
  },
];

export const stepFields: JobFormStepFields = {
  1: [
    "jobTitle",
    "jobBoardTitle", 
    "jobDescription"
  ],
  2: [
    "jobStatus",
    "workplaceType",
    "jobLocation",
    "employmentType",
    "educationRequirement",
    "department",
    "customDepartment",
    "payType",
    "payRate",
    "positionsToHire",
    "jobRequirements",
    "exemptStatus",
    "eeoJobCategory"
  ],
  3: [
    "startDate", 
    "endDate", 
    "externalApplicationSetup", 
    "automation"
  ],
  4: [],
  5: [],
  6: ["availabilityId"]
};
