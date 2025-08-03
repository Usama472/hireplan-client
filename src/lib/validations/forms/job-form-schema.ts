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

// AI Scoring Weights schema
const scoringWeightsSchema = z.object({
  skillsMatch: z.number().min(0).max(100),
  experienceRelevance: z.number().min(0).max(100),
  educationQualifications: z.number().min(0).max(100),
  culturalJobFit: z.number().min(0).max(100),
});

// Automation schema with AI scoring
const automationSchema = z
  .object({
    enabledRules: z.array(z.string()),
    acceptanceThreshold: z.number().min(0).max(100),
    scoringWeights: scoringWeightsSchema,
  })
  .superRefine((data, ctx) => {
    // Validate that scoring weights don't exceed 100% total
    const totalWeight = Object.values(data.scoringWeights).reduce(
      (sum, weight) => sum + weight,
      0
    );

    if (totalWeight > 100) {
      ctx.addIssue({
        path: ["scoringWeights"],
        code: z.ZodIssueCode.custom,
        message: "Total scoring weights cannot exceed 100%",
      });
    }
  });

// Complete job form schema
export const jobFormSchema = z
  .object({
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
    startDate: z.preprocess(
      (val) =>
        typeof val === "string" || val instanceof Date ? new Date(val) : val,
      z.date()
    ),
    endDate: z.preprocess(
      (val) =>
        typeof val === "string" || val instanceof Date ? new Date(val) : val,
      z.date()
    ),
    customApplicationUrl: z.string().optional(),
    externalApplicationSetup: externalApplicationSetupSchema,
    automation: automationSchema,
  })
  .superRefine((data, ctx) => {
    // Validate date range
    if (data.endDate <= data.startDate) {
      ctx.addIssue({
        path: ["endDate"],
        code: z.ZodIssueCode.custom,
        message: "End date must be after start date",
      });
    }

    // Validate custom questions for select type
    if (data.customQuestions) {
      data.customQuestions.forEach((question, index) => {
        if (question.type === "select") {
          if (!question.options || question.options.length < 2) {
            ctx.addIssue({
              path: ["customQuestions", index, "options"],
              code: z.ZodIssueCode.custom,
              message: "Select questions must have at least 2 options",
            });
          }
        }
      });
    }
  });

// Individual validation schemas for specific features
export const scoringWeightsValidationSchema = scoringWeightsSchema.superRefine(
  (data, ctx) => {
    const totalWeight = Object.values(data).reduce(
      (sum, weight) => sum + weight,
      0
    );

    if (totalWeight > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Total weights (${totalWeight}%) cannot exceed 100%`,
      });
    }
  }
);

export const acceptanceThresholdSchema = z
  .number()
  .min(0, "Acceptance threshold cannot be negative")
  .max(100, "Acceptance threshold cannot exceed 100%");

// Type inference
export type JobFormSchema = z.infer<typeof jobFormSchema>;
export type ScoringWeights = z.infer<typeof scoringWeightsSchema>;
export type AutomationSchema = z.infer<typeof automationSchema>;

// Helper validation functions
export const validateScoringWeights = (weights: ScoringWeights) => {
  const result = scoringWeightsValidationSchema.safeParse(weights);
  return {
    isValid: result.success,
    errors: result.success ? [] : result.error.issues,
    totalWeight: Object.values(weights).reduce(
      (sum, weight) => sum + weight,
      0
    ),
  };
};

export const validateAcceptanceThreshold = (threshold: number) => {
  const result = acceptanceThresholdSchema.safeParse(threshold);
  return {
    isValid: result.success,
    errors: result.success ? [] : result.error.issues,
  };
};
