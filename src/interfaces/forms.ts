import type { MDXEditorMethods } from '@mdxeditor/editor'
import type { ForwardedRef } from 'react'
import type { FieldValues, Path, PathValue } from 'react-hook-form'

export type InputFieldProps<TFieldValues extends FieldValues> = {
  name: Path<TFieldValues>
  defaultValue?: PathValue<TFieldValues, Path<TFieldValues>>
  type?: string
  rows?: number
  disabled?: boolean
  label?: string
  multiline?: boolean
  placeholder?: string
  className?: string
  selectOptions?: SelectOptions[]
  showIsRequired?: boolean
  description?: string
  editorRef?: ForwardedRef<MDXEditorMethods> | null
  maxTags?: number
  tagLength?: number
}

export interface SelectOptions {
  label: string
  value: string | number
}

export interface PersonalInfo {
  firstName: string
  lastName: string
  email: string
  password: string
  jobTitle: string
}

export interface CompanyInfo {
  companyName: string
  websiteDomain: string
  industry: string
  companySize: string
  address: string
  city: string
  state: string
  zipCode: string
}

export interface PlanSelection {
  plan: 'starter' | 'professional' | 'enterprise'
}

export interface FormData
  extends PersonalInfo,
    CompanyInfo,
    PlanSelection {}

export interface StepProps {
  onNext: () => void
  onPrevious: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

export interface SelectOption {
  value: string | number
  label: string
}
