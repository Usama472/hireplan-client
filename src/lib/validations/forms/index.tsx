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
  jobCategory: z.string().min(1, 'Please select a role category'),
  jobTitle: z.string().min(1, 'Please select a job title'),
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

export const fullFormSchema = personalInfoSchema
  .merge(companyInfoSchema)
  .merge(planSelectionSchema)

export const profileFormSchema = z.object({
  // Personal Information
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  profileImg: z.string().optional(),
  companyRole: z.string().min(1, { message: 'Company role is required' }),

  // Company Information
  company: z.object({
    companyName: z.string().min(1, { message: 'Company name is required' }),
    websiteUrl: z
      .string()
      .url({ message: 'Invalid website URL' })
      .optional()
      .or(z.literal('')),
    industry: z.string().min(1, { message: 'Industry is required' }),
    companySize: z.string().min(1, { message: 'Company size is required' }),
    address: z.string().min(1, { message: 'Address is required' }),
    city: z.string().min(1, { message: 'City is required' }),
    state: z.string().min(1, { message: 'State is required' }),
    zipCode: z.string().min(1, { message: 'Zip code is required' }),
    country: z.string().min(1, { message: 'Country is required' }),
  }),

  paymentPlan: z.enum(['starter', 'professional', 'enterprise']),
  allowNotify: z.boolean(),
})
