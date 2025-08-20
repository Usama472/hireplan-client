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

// These schemas are now part of the section-based automation system
// Old AI ranking and custom rule schemas have been replaced

// Pay rate schemas for different types
const rangePaySchema = z.object({
  type: z.literal("range"),
  min: z.number().min(0, "Minimum salary must be greater than 0"),
  max: z.number().min(0, "Maximum salary must be greater than 0"),
  amount: z.number().optional(),
  period: z
    .enum(["per-hour", "per-day", "per-week", "per-month", "per-year"])
    .optional(),
});

const startingAmountPaySchema = z.object({
  type: z.literal("starting-amount"),
  amount: z.number().min(0, "Amount must be greater than 0"),
  min: z.number().optional(),
  max: z.number().optional(),
  period: z
    .enum(["per-hour", "per-day", "per-week", "per-month", "per-year"])
    .optional(),
});

const maximumAmountPaySchema = z.object({
  type: z.literal("maximum-amount"),
  amount: z.number().min(0, "Amount must be greater than 0"),
  min: z.number().optional(),
  max: z.number().optional(),
  period: z
    .enum(["per-hour", "per-day", "per-week", "per-month", "per-year"])
    .optional(),
});

const exactAmountPaySchema = z.object({
  type: z.literal("exact-amount"),
  amount: z.number().min(0, "Amount must be greater than 0"),
  min: z.number().optional(),
  max: z.number().optional(),
  period: z
    .enum(["per-hour", "per-day", "per-week", "per-month", "per-year"])
    .optional(),
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

// Section threshold schema
const sectionThresholdSchema = z.object({
  autoReject: z.number().min(0).max(100).default(40),
  manualReview: z.number().min(0).max(100).default(75),
});

// Job rule schema for section-based logic
const jobRuleSchema = z.object({
  sectionCount: z.string().min(1, "Section count is required"),
  sectionsCondition: z.string().optional(), // For display purposes
  status: z.enum(["Pass", "Manual Review", "Fail"]),
  action: z.enum(["schedule-interview", "send-template", "reject-candidate"]),
  template: z.string().optional(),
});

// Section-based automation schema
const automationSchema = z
  .object({
    enabledRules: z.array(z.string()).default([]),

    // Section weights (must total 100%)
    sectionWeights: z
      .object({
        requiredQualifications: z.number().min(0).max(100).default(0),
        preferredQualifications: z.number().min(0).max(100).default(0),
        preScreeningQuestions: z.number().min(0).max(100).default(0),
        resume: z.number().min(0).max(100).default(0),
      })
      .default({}),

    // Thresholds for each section
    sectionThresholds: z
      .object({
        requiredQualifications: sectionThresholdSchema.default({}),
        preferredQualifications: sectionThresholdSchema.default({}),
        preScreeningQuestions: sectionThresholdSchema.default({}),
        resume: sectionThresholdSchema.default({}),
      })
      .default({}),

    // Preferred qualifications scoring (individual weights must total 100%)
    preferredQualScoring: z
      .record(z.string(), z.number().min(0).max(100))
      .default({}),

    // Resume items and their scoring
    resumeItems: z.array(z.string()).default([]),
    resumeItemScoring: z
      .record(z.string(), z.number().min(0).max(100))
      .default({}),

    // Pre-screening question auto-fail settings
    questionAutoFail: z.record(z.string(), z.boolean()).default({}),

    // Pre-screening question answer criteria
    questionCriteria: z
      .record(
        z.string(),
        z.object({
          correctAnswer: z.string().optional(),
          incorrectAnswer: z.string().optional(),
          instructions: z.string().optional(),
        })
      )
      .default({}),

    // Job rules for conditional logic
    jobRules: z.array(jobRuleSchema).default([]),

    // Legacy fields for backward compatibility
    acceptanceThreshold: z.number().min(0).max(100).default(76),
    manualReviewThreshold: z.number().min(0).max(100).default(41),
    autoRejectThreshold: z.number().min(0).max(100).default(40),
    templateId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Validate that section weights don't exceed 100% total
    const totalSectionWeight = Object.values(data.sectionWeights).reduce(
      (sum, weight) => sum + weight,
      0
    );
    if (totalSectionWeight > 100) {
      ctx.addIssue({
        path: ["sectionWeights"],
        code: z.ZodIssueCode.custom,
        message: "Total section weights cannot exceed 100%",
      });
    }

    // Validate preferred qualifications scoring totals 100%
    const preferredQualTotal = Object.values(data.preferredQualScoring).reduce(
      (sum, score) => sum + score,
      0
    );
    if (preferredQualTotal > 0 && preferredQualTotal !== 100) {
      ctx.addIssue({
        path: ["preferredQualScoring"],
        code: z.ZodIssueCode.custom,
        message: "Preferred qualifications scoring must total 100%",
      });
    }

    // Validate resume item scoring totals 100%
    const resumeItemTotal = Object.values(data.resumeItemScoring).reduce(
      (sum, score) => sum + score,
      0
    );
    if (resumeItemTotal > 0 && resumeItemTotal !== 100) {
      ctx.addIssue({
        path: ["resumeItemScoring"],
        code: z.ZodIssueCode.custom,
        message: "Resume item scoring must total 100%",
      });
    }

    // Validate section thresholds ordering
    Object.entries(data.sectionThresholds).forEach(
      ([sectionName, thresholds]) => {
        if (thresholds.autoReject >= thresholds.manualReview) {
          ctx.addIssue({
            path: ["sectionThresholds", sectionName, "manualReview"],
            code: z.ZodIssueCode.custom,
            message: `${sectionName}: Manual review threshold must be higher than auto reject threshold`,
          });
        }
      }
    );
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
      .max(3500, "Description should be no more than 3500 characters"),
    backgroundScreeningDisclaimer: z.boolean().optional(),

    // Step 2: Company & Position Details
    company: z.string().optional(),
    positionsToHire: z
      .number()
      .min(1, "At least 1 position is required")
      .max(10, "Maximum 10 positions allowed"),
    workSetting: z.string().optional(),
    hiringTimeline: z
      .enum([
        "1-3-days",
        "3-7-days",
        "1-2-weeks",
        "2-4-weeks",
        "more-than-4-weeks",
      ])
      .optional(),
    payType: z.enum(["salary", "hourly", "commission"]).optional(),
    payRate: payRateSchema,
    employmentType: z
      .enum(["full-time", "part-time", "contract", "temporary", "internship"])
      .optional(),

    // Step 3: Hours, Schedule & Benefits
    hoursPerWeek: hoursPerWeekSchema.optional(),
    schedule: z.array(z.string()).default([]),
    benefits: z.array(z.string()).default([]),
    country: z.string().default("United States"),
    language: z.string().default("English"),
    jobLocationWorkType: z
      .enum(["in-person", "fully-remote", "hybrid", "on-the-road"])
      .optional(),
    jobLocation: jobLocationSchema.optional(),
    remoteLocationRequirement: remoteLocationRequirementSchema.optional(),
    hasConsistentStartingLocation: z.boolean().optional(), // Added for 'on-the-road' type
    operatingArea: z.string().optional(), // Added for 'on-the-road' type when no consistent location

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

    // Step 8: Email Templates
    emailTemplates: z
      .object({
        interviewSchedule: z
          .object({
            id: z.string().nullable().optional(),
            label: z.string().nullable().optional(),
          })
          .nullable()
          .optional(),
        interviewConfirmation: z
          .object({
            id: z.string().nullable().optional(),
            label: z.string().nullable().optional(),
          })
          .nullable()
          .optional(),
        interviewRejection: z
          .object({
            id: z.string().nullable().optional(),
            label: z.string().nullable().optional(),
          })
          .nullable()
          .optional(),
      })
      .optional(),

    // Step 9: Booking Page Selection - renamed to availabilityId and made required
    availabilityId: z
      .string({
        required_error:
          "Please select an availability template for interview scheduling",
      })
      .min(1, "Availability template is required for interview scheduling"),

    // Legacy fields (for compatibility)
    jobStatus: z.enum(["low", "medium", "high"]).optional(),
    workplaceType: z.enum(["onsite", "remote", "hybrid"]).optional(),
    educationRequirement: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Validate date range
    if (data.endDate && data.startDate && data.endDate <= data.startDate) {
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
export const sectionWeightsValidationSchema = z
  .object({
    requiredQualifications: z.number().min(0).max(100).default(0),
    preferredQualifications: z.number().min(0).max(100).default(0),
    preScreeningQuestions: z.number().min(0).max(100).default(0),
    resume: z.number().min(0).max(100).default(0),
  })
  .superRefine((data, ctx) => {
    const totalWeight = Object.values(data).reduce(
      (sum: number, weight: number) => sum + weight,
      0
    );
    if (totalWeight > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Total section weights (${totalWeight}%) cannot exceed 100%`,
      });
    }
  });

export const acceptanceThresholdSchema = z
  .number()
  .min(0, "Acceptance threshold cannot be negative")
  .max(100, "Acceptance threshold cannot exceed 100%");

// Type inference
export type JobFormSchema = z.infer<typeof jobFormSchema>;
export type SectionWeights = z.infer<typeof sectionWeightsValidationSchema>;
export type AutomationSchema = z.infer<typeof automationSchema>;

// Helper validation functions
export const validateSectionWeights = (weights: SectionWeights) => {
  const result = sectionWeightsValidationSchema.safeParse(weights);
  return {
    isValid: result.success,
    errors: result.success ? [] : result.error.issues,
    totalWeight: Object.values(weights).reduce(
      (sum: number, weight: number) => sum + weight,
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
