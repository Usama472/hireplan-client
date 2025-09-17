import type { MDXEditorMethods } from "@mdxeditor/editor";
import type { ForwardedRef } from "react";
import type { FieldValues, Path, PathValue } from "react-hook-form";

export type InputFieldProps<TFieldValues extends FieldValues> = {
  name: Path<TFieldValues>;
  defaultValue?: PathValue<TFieldValues, Path<TFieldValues>>;
  type?: string;
  rows?: number;
  disabled?: boolean;
  label?: string;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  selectOptions?: SelectOptions[];
  showIsRequired?: boolean;
  description?: string;
  editorRef?: ForwardedRef<MDXEditorMethods> | null;
  maxTags?: number;
  tagLength?: number;
};

export interface SelectOptions {
  label: string;
  value: string | number;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  jobTitle: string;
}

export interface CompanyInfo {
  companyName: string;
  websiteDomain: string;
  industry: string;
  companySize: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface PlanSelection {
  plan: "starter" | "professional" | "enterprise";
}

export interface FormData extends PersonalInfo, CompanyInfo, PlanSelection {}

export interface StepProps {
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface CustomQuestion {
  id: string;
  type: "text" | "textarea" | "number" | "email" | "phone" | "date" | "select" | "radio";
  question: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  
  // AI Scoring properties
  aiScoringType?: "scored" | "auto-reject";
  scoringValues?: number[]; // For multiple choice questions
  yesNoScoring?: { yes: number; no: number }; // For boolean questions
  autoRejectAnswers?: string[]; // Which answers trigger auto-rejection
  
  // New scoring mode properties
  scoringMode?: "simple" | "advanced";
  weight?: number; // 1-10 scale for advanced mode
  scoringType?: "exact" | "greater_than"; // For multiple choice scoring
  
  // Advanced mode configuration
  correctAnswer?: string; // For multiple choice questions
  autoReject?: boolean; // Auto-reject wrong answers
  evaluationCriteria?: string; // For text questions - what AI should look for
  minValue?: number; // For number questions
  idealValue?: number; // For number questions
  expectedYesNo?: "yes" | "no" | "either"; // For yes/no questions
}

export interface CustomQuestionFormData {
  customQuestions: CustomQuestion[];
}
