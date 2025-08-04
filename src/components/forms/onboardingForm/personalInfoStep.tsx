import { InputField } from "@/components/common/InputField";
import { SelectField } from "@/components/common/SelectField";
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
  const [selectedCategory, setSelectedCategory] = useState<JobCategoryKey | "">(
    ""
  );
  const { setValue, watch } = useFormContext();
  const jobCategory = watch("jobCategory");

  const handleCategoryChange = (category: string) => {
    // Only set if category is valid key
    if (isJobCategoryKey(category)) {
      setSelectedCategory(category);
      setValue("jobCategory", category);
      setValue("jobTitle", ""); // Reset job title when category changes
    } else {
      // Handle invalid category (reset values)
      setSelectedCategory("");
      setValue("jobCategory", "");
      setValue("jobTitle", "");
    }
  };

  const categoryOptions = Object.keys(JOB_CATEGORIES).map((category) => ({
    value: category,
    label: category,
  }));

  // Get titles safely using type guard
  const getTitleOptions = () => {
    const categoryKey = selectedCategory || jobCategory;
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
    <div className="space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6">
        <InputField
          name="firstName"
          label="First Name"
          placeholder="Enter your first name"
          showIsRequired
        />
        <InputField
          name="lastName"
          label="Last Name"
          placeholder="Enter your last name"
          showIsRequired
        />
      </div>

      <InputField
        name="email"
        type={INPUT_TYPES.EMAIL}
        label="Email Address"
        placeholder="Enter your email address"
        showIsRequired
      />

      <InputField
        name="password"
        type={INPUT_TYPES.PASSWORD}
        label="Password"
        placeholder="Create a secure password"
        showIsRequired
      />

      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6">
        <SelectField
          name="jobCategory"
          label="Role Category"
          placeholder="Select your role category"
          options={categoryOptions}
          onChange={handleCategoryChange}
          showIsRequired
        />
        <SelectField
          name="jobTitle"
          label="Job Title"
          placeholder={
            selectedCategory || jobCategory
              ? "Select your specific role"
              : "Select category first"
          }
          options={titleOptions}
          disabled={!selectedCategory && !jobCategory}
          showIsRequired
        />
      </div>
    </div>
  );
}
