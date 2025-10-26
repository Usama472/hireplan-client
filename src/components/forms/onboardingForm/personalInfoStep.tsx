import { InputField } from "@/components/common/InputField";
import { INPUT_TYPES } from "@/interfaces";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

const JOB_CATEGORIES = {
  "Leadership / Decision-Makers": [
    "CEO / Founder / Owner",
    "COO (Chief Operating Officer)",
    "CHRO (Chief Human Resources Officer)",
    "Chief People Officer",
    "VP of Human Resources / Talent Acquisition",
    "Director of Operations",
  ],
  "HR & Talent Acquisition": [
    "HR Director",
    "HR Manager",
    "Talent Acquisition Manager",
    "Recruiting Manager",
    "Recruitment Coordinator",
    "People Operations Manager",
    "HR Business Partner",
  ],
  "Recruiters & Hiring Staff": [
    "Corporate Recruiter",
    "Technical Recruiter",
    "Healthcare Recruiter",
    "Recruitment Specialist",
    "Staffing Coordinator",
    "Onboarding Specialist",
  ],
  "Operations & Compliance": [
    "Compliance Manager",
    "Office Manager",
    "Practice Manager",
    "Program Manager",
    "Administrative Director",
  ],
};

// Define type for job category keys
type JobCategoryKey = keyof typeof JOB_CATEGORIES;

// Type guard to check if string is a valid JobCategoryKey
function isJobCategoryKey(key: string | undefined): key is JobCategoryKey {
  if (!key) return false;
  return key in JOB_CATEGORIES;
}

export function PersonalInfoStep() {
  const [selectedCategory] = useState<JobCategoryKey | "">("");
  const { watch } = useFormContext();
  const jobCategory = watch("jobCategory");

  const categoryOptions = Object.keys(JOB_CATEGORIES).map((category) => ({
    value: category,
    label: category,
  }));

  // Get titles safely using type guard
  const getTitleOptions = () => {
    const categoryKey = jobCategory;
    if (isJobCategoryKey(categoryKey)) {
      return JOB_CATEGORIES[categoryKey].map((title) => ({
        value: title,
        label: title,
      }));
    }
    return [];
  };

  const titleOptions = getTitleOptions();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField name="firstName" placeholder="First Name *" />
        <InputField name="lastName" placeholder="Last Name *" />
      </div>

      <InputField
        name="email"
        type={INPUT_TYPES.EMAIL}
        placeholder="Email Address *"
      />

      <InputField
        name="password"
        type={INPUT_TYPES.PASSWORD}
        placeholder="Password *"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          name="jobCategory"
          type={INPUT_TYPES.SELECT}
          placeholder="Role Category *"
          selectOptions={categoryOptions}
        />
        <InputField
          name="jobTitle"
          type={INPUT_TYPES.SELECT}
          placeholder={
            jobCategory ? "Specific Role *" : "Select category first *"
          }
          selectOptions={titleOptions}
          disabled={!selectedCategory && !jobCategory}
        />
      </div>
    </div>
  );
}
