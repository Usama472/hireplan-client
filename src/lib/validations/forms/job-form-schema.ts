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
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zipCode: z.string().optional(),
});

// Hours per week schema
const hoursPerWeekSchema = z.object({
  type: z.enum(["fixed-hours", "range", "minimum", "maximum"]),
  amount: z.number().min(1).max(168).optional(),
  min: z.number().min(1).max(168).optional(),
  max: z.number().min(1).max(168).optional(),
});

// Remote location requirement schema
const remoteLocationRequirementSchema = z.object({
  required: z.boolean().default(false),
  location: z.string().optional(),
});

// Qualification schema
const qualificationSchema = z.object({
  text: z.string().min(1, "Qualification text is required"),
  score: z.number().min(0).max(100).optional().default(0),
});

// AI ranking category schema
const aiRankingCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  weight: z.number().min(0).max(100).default(0),
  dataSource: z.object({
    qualifications: z.boolean().default(false),
    screeningQuestions: z.boolean().default(false),
    resume: z.boolean().default(false),
  }),
  customQuestions: z.array(z.string()).default([]),
});

// Custom rule schema
const customRuleSchema = z.object({
  condition: z.string().min(1, "Condition is required"),
  action: z.string().min(1, "Action is required"),
  template: z.string().min(1, "Template is required"),
});

// Pay rate schemas for different types
const rangePaySchema = z.object({
  type: z.literal("range"),
  min: z.number().min(0, "Minimum salary must be greater than 0"),
  max: z.number().min(0, "Maximum salary must be greater than 0"),
  amount: z.number().optional(),
  period: z.enum(["per-hour", "per-day", "per-week", "per-month", "per-year"]).optional(),
});

const startingAmountPaySchema = z.object({
  type: z.literal("starting-amount"),
  amount: z.number().min(0, "Amount must be greater than 0"),
  min: z.number().optional(),
  max: z.number().optional(),
  period: z.enum(["per-hour", "per-day", "per-week", "per-month", "per-year"]).optional(),
});

const maximumAmountPaySchema = z.object({
  type: z.literal("maximum-amount"),
  amount: z.number().min(0, "Amount must be greater than 0"),
  min: z.number().optional(),
  max: z.number().optional(),
  period: z.enum(["per-hour", "per-day", "per-week", "per-month", "per-year"]).optional(),
});

const exactAmountPaySchema = z.object({
  type: z.literal("exact-amount"),
  amount: z.number().min(0, "Amount must be greater than 0"),
  min: z.number().optional(),
  max: z.number().optional(),
  period: z.enum(["per-hour", "per-day", "per-week", "per-month", "per-year"]).optional(),
});

// Base union schema without refinement
const rawPayRateSchema = z.discriminatedUnion("type", [
  rangePaySchema,
  startingAmountPaySchema,
  maximumAmountPaySchema,
  exactAmountPaySchema,
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
    enabledRules: z.array(z.string()).default([]),
    acceptanceThreshold: z.number().min(0).max(100).default(76),
    manualReviewThreshold: z.number().min(0).max(100).default(41),
    autoRejectThreshold: z.number().min(0).max(100).default(40),
    scoringWeights: scoringWeightsSchema,
    aiRankingCategories: z.array(aiRankingCategorySchema).default([]),
    customRules: z.array(customRuleSchema).default([]),
    templateId: z.string().optional(),
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

    // Validate threshold ordering
    if (data.autoRejectThreshold >= data.manualReviewThreshold) {
      ctx.addIssue({
        path: ["manualReviewThreshold"],
        code: z.ZodIssueCode.custom,
        message: "Manual review threshold must be higher than auto reject threshold",
      });
    }

    if (data.manualReviewThreshold >= data.acceptanceThreshold) {
      ctx.addIssue({
        path: ["acceptanceThreshold"],
        code: z.ZodIssueCode.custom,
        message: "Acceptance threshold must be higher than manual review threshold",
      });
    }

    // Validate AI ranking categories weights
    if (data.aiRankingCategories.length > 0) {
      const totalCategoryWeight = data.aiRankingCategories.reduce(
        (sum, category) => sum + (category.weight || 0),
        0
      );

      if (totalCategoryWeight > 100) {
        ctx.addIssue({
          path: ["aiRankingCategories"],
          code: z.ZodIssueCode.custom,
          message: "Total AI ranking category weights cannot exceed 100%",
        });
      }
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

    // Step 2: Company & Position Details
    company: z.string().optional(),
    positionsToHire: z.number().min(1, "At least 1 position is required").max(10, "Maximum 10 positions allowed"),
    workSetting: z.string().optional(),
    hiringTimeline: z.enum(["1-3-days", "3-7-days", "1-2-weeks", "2-4-weeks", "more-than-4-weeks"]).optional(),
    payType: z.enum(["salary", "hourly", "commission"]).optional(),
    payRate: payRateSchema,
    employmentType: z.enum([
      "full-time",
      "part-time",
      "contract",
      "temporary",
      "internship",
    ]).optional(),

    // Step 3: Hours, Schedule & Benefits
    hoursPerWeek: hoursPerWeekSchema.optional(),
    schedule: z.array(z.string()).default([]),
    benefits: z.array(z.string()).default([]),
    country: z.string().default("United States"),
    language: z.string().default("English"),
    jobLocationWorkType: z.enum(["in-person", "fully-remote", "hybrid", "on-the-road"]).optional(),
    jobLocation: jobLocationSchema.optional(),
    remoteLocationRequirement: remoteLocationRequirementSchema.optional(),

    // Step 4: Compliance & Department
    exemptStatus: z.enum(["exempt", "non-exempt", "not-applicable"]).optional(),
    eeoJobCategory: z.string().optional(),
    department: z.string().optional(),
    customDepartment: z.string().optional(),

    // Step 5: Job Qualifications
    requiredQualifications: z.array(qualificationSchema).default([]),
    preferredQualifications: z.array(qualificationSchema).default([]),
    jobRequirements: z.array(z.string()).default([]),
    customQuestions: z.array(customQuestionSchema).default([]),

    // Step 6: Posting Schedule & Budget
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
    runIndefinitely: z.boolean().default(false),
    dailyBudget: z.number().min(0).optional(),
    monthlyBudget: z.number().min(0).optional(),
    indeedBudget: z.number().min(0).optional(),
    zipRecruiterBudget: z.number().min(0).optional(),
    customApplicationUrl: z.string().optional(),
    externalApplicationSetup: externalApplicationSetupSchema.optional(),

    // Step 7: AI Ranking & Automation
    automation: automationSchema,

    // Legacy fields (for compatibility)
    jobStatus: z.enum(["low", "medium", "high"]).optional(),
    workplaceType: z.enum(["onsite", "remote", "hybrid"]).optional(),
    educationRequirement: z.string().optional(),
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
