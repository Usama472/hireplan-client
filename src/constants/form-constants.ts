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
    name: "Starter",
    price: "$149",
    period: "/month",
    description: "Perfect for small teams getting started",
    features: [
      "Up to 50 candidate profiles",
      "Basic AI matching",
      "Email support",
      "5 job postings",
    ],
    popular: false,
  },
  {
    id: "professional",
    name: "Professional",
    price: "$249",
    period: "/month",
    description: "Ideal for growing companies",
    features: [
      "Up to 500 candidate profiles",
      "Advanced AI matching",
      "Priority support",
      "Unlimited job postings",
      "Custom workflows",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$299",
    period: "/month",
    description: "For large organizations with advanced needs",
    features: [
      "Unlimited candidate profiles",
      "Advanced AI matching",
      "Dedicated support",
      "Unlimited job postings",
      "Custom workflows",
      "API access",
      "White-label options",
    ],
    popular: false,
  },
];

export const stepFields: JobFormStepFields = {
  1: ["jobTitle", "jobBoardTitle", "jobDescription"],
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
    "eeoJobCategory",
  ],
  3: ["startDate", "endDate", "externalApplicationSetup", "automation"],
  4: [],
  5: [],
  6: ["availabilityId"], // Add validation for the availability step
};
