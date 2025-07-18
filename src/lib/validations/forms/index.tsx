import { z } from 'zod'

export const personalInfoSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(
      /[^a-zA-Z0-9]/,
      'Password must contain at least one special character'
    ),
  jobTitle: z.string().min(2, 'Job title must be at least 2 characters'),
})

export const companyInfoSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  websiteDomain: z
    .string()
    .url('Please enter a valid website URL')
    .optional()
    .or(z.literal('')),
  industry: z.string().min(1, 'Please select an industry'),
  companySize: z.string().min(1, 'Please select company size'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  zipCode: z.string().min(5, 'ZIP code must be at least 5 characters'),
})

export const planSelectionSchema = z.object({
  plan: z.enum(['starter', 'professional', 'enterprise'], {
    required_error: 'Please select a plan',
  }),
})

export const aiPreferencesSchema = z.object({
  minimumMatchScore: z.number().min(0).max(100),
  autoRejectThreshold: z.number().min(0).max(100),
  experienceWeight: z.number().min(0).max(100),
  educationWeight: z.number().min(0).max(100),
  certificationsWeight: z.number().min(0).max(100),
  keywordsWeight: z.number().min(0).max(100),
})

export const fullFormSchema = personalInfoSchema
  .merge(companyInfoSchema)
  .merge(planSelectionSchema)
  .merge(aiPreferencesSchema)
