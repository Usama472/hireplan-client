import { z } from "zod";

const customQuestionSchema = z.object({
  id: z.string(),
  type: z.enum(["boolean", "string", "select"]),
  question: z.string().min(1, "Question text is required"),
  required: z.boolean(),
  options: z.array(z.string().min(1, "Option cannot be empty")).optional(),
  placeholder: z.string().optional(),
});

// Location schema
const jobLocationSchema = z.object({
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
});

// Fixed and Range pay schemas
const fixedPaySchema = z.object({
  type: z.literal("fixed"),
  amount: z.number().min(0, "Amount must be greater than 0"),
  min: z.number().optional(),
  max: z.number().optional(),
});

const rangePaySchema = z.object({
  type: z.literal("range"),
  min: z.number().min(0, "Minimum salary must be greater than 0"),
  max: z.number().min(0, "Maximum salary must be greater than 0"),
  amount: z.number().optional(),
});

// Base union schema without refinement
const rawPayRateSchema = z.discriminatedUnion("type", [
  fixedPaySchema,
  rangePaySchema,
]);

// Add cross-field validation with superRefine
const payRateSchema = rawPayRateSchema.superRefine((data, ctx) => {
  if (data.type === "range" && data.max <= data.min) {
    ctx.addIssue({
      path: ["max"],
      code: z.ZodIssueCode.custom,
      message: "Maximum salary must be greater than minimum salary",
    });
  }
});

// External application setup schema
const externalApplicationSetupSchema = z.object({
  customFields: z.array(z.string()),
  redirectUrl: z.string().optional(),
});

// AI rule schema
const aiRuleSchema = z.object({
  id: z.string(),
  text: z.string(),
});

// Automation schema
const automationSchema = z.object({
  enabledRules: z.array(z.string()),
  aiRules: z.array(aiRuleSchema),
});

// Complete job form schema
export const jobFormSchema = z.object({
  // Step 1: Job Ad
  jobTitle: z.string().min(1, "Internal job title is required"),
  jobBoardTitle: z
    .string()
    .min(1, "Job board title is required")
    .max(60, "Job board title should be 60 characters or less"),
  jobDescription: z
    .string()
    .min(20, "Description should be at least 20 characters")
    .max(2000, "Description should be no more than 2000 characters"),
  backgroundScreeningDisclaimer: z.boolean().optional(),

  // Step 2: Position Details
  jobStatus: z.enum(["low", "medium", "high"]),
  workplaceType: z.enum(["onsite", "remote", "hybrid"]),
  jobLocation: jobLocationSchema,
  employmentType: z.enum([
    "full-time",
    "part-time",
    "contract",
    "temporary",
    "internship",
  ]),
  educationRequirement: z.string().optional(),
  department: z.string().min(1, "Department is required"),
  customDepartment: z.string().optional(),
  payType: z.enum(["salary", "hourly", "commission", "contract"]),
  payRate: payRateSchema,
  positionsToHire: z.number().min(1, "At least 1 position is required"),
  jobRequirements: z.array(z.string()),
  exemptStatus: z.string().optional(),
  eeoJobCategory: z.string().optional(),
  customQuestions: z.array(customQuestionSchema).optional(),

  // Step 3: Settings & Automation
  startDate: z.date(),
  endDate: z.date(),
  customApplicationUrl: z.string().optional(),
  externalApplicationSetup: externalApplicationSetupSchema,
  automation: automationSchema,
});

// Partial schemas for step validation
export const step1Schema = jobFormSchema.pick({
  jobTitle: true,
  jobBoardTitle: true,
  jobDescription: true,
  backgroundScreeningDisclaimer: true,
});

export const step2Schema = jobFormSchema.pick({
  jobStatus: true,
  workplaceType: true,
  jobLocation: true,
  employmentType: true,
  educationRequirement: true,
  department: true,
  customDepartment: true,
  payType: true,
  payRate: true,
  positionsToHire: true,
  jobRequirements: true,
  exemptStatus: true,
  eeoJobCategory: true,
});

export const step3Schema = jobFormSchema.pick({
  startDate: true,
  endDate: true,
  customApplicationUrl: true,
  externalApplicationSetup: true,
  automation: true,
});

// Type inference
export type JobFormSchema = z.infer<typeof jobFormSchema>;
