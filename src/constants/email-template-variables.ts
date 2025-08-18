// Comprehensive job-related email template variables
export const JOB_VARIABLES: Array<{
  key: string;
  title: string;
  category: string;
}> = [
  {
    key: "{{job_title}}",
    title: "The title of the job position",
    category: "Job Details",
  },
  {
    key: "{{job_description}}",
    title: "The full job description",
    category: "Job Details",
  },
  {
    key: "{{job_location}}",
    title: "The location of the job position",
    category: "Job Details",
  },
  {
    key: "{{job_city}}",
    title: "The city where the job is located",
    category: "Job Details",
  },
  {
    key: "{{job_state}}",
    title: "The state where the job is located",
    category: "Job Details",
  },
  {
    key: "{{job_country}}",
    title: "The country where the job is located",
    category: "Job Details",
  },
  {
    key: "{{job_zip_code}}",
    title: "The ZIP/postal code of the job location",
    category: "Job Details",
  },
  {
    key: "{{workplace_type}}",
    title: "Workplace type (in-person, remote, hybrid, on-the-road)",
    category: "Job Details",
  },
  {
    key: "{{employment_type}}",
    title:
      "Employment type (full-time, part-time, contract, temporary, internship)",
    category: "Job Details",
  },
  {
    key: "{{positions_to_hire}}",
    title: "Number of positions available to hire",
    category: "Job Details",
  },
  {
    key: "{{hiring_timeline}}",
    title: "Expected hiring timeline",
    category: "Job Details",
  },
  {
    key: "{{work_setting}}",
    title: "Work setting description",
    category: "Job Details",
  },

  // Compensation & Benefits
  {
    key: "{{pay_type}}",
    title: "Pay type (salary, hourly, commission)",
    category: "Compensation",
  },
  {
    key: "{{pay_rate}}",
    title: "The pay rate amount",
    category: "Compensation",
  },
  {
    key: "{{pay_range_min}}",
    title: "Minimum pay rate in range",
    category: "Compensation",
  },
  {
    key: "{{pay_range_max}}",
    title: "Maximum pay rate in range",
    category: "Compensation",
  },
  {
    key: "{{pay_period}}",
    title: "Pay period (per-hour, per-day, per-week, per-month, per-year)",
    category: "Compensation",
  },
  {
    key: "{{salary_range}}",
    title: "Formatted salary range display",
    category: "Compensation",
  },
  {
    key: "{{benefits}}",
    title: "List of benefits offered",
    category: "Compensation",
  },

  // Schedule & Hours
  {
    key: "{{hours_per_week}}",
    title: "Hours required per week",
    category: "Schedule",
  },
  {
    key: "{{schedule}}",
    title: "Work schedule details",
    category: "Schedule",
  },
  {
    key: "{{start_date}}",
    title: "Job posting start date",
    category: "Schedule",
  },
  {
    key: "{{end_date}}",
    title: "Job posting end date",
    category: "Schedule",
  },

  // Company & Department
  {
    key: "{{company_name}}",
    title: "Your company name",
    category: "Company",
  },
  {
    key: "{{department}}",
    title: "Department where the position is located",
    category: "Company",
  },
  {
    key: "{{eeo_job_category}}",
    title: "EEO job category",
    category: "Company",
  },
  {
    key: "{{exempt_status}}",
    title: "Exempt status (exempt, non-exempt, not-applicable)",
    category: "Company",
  },

  // Qualifications & Requirements
  {
    key: "{{required_qualifications}}",
    title: "Required qualifications for the position",
    category: "Requirements",
  },
  {
    key: "{{preferred_qualifications}}",
    title: "Preferred qualifications for the position",
    category: "Requirements",
  },
  {
    key: "{{education_requirement}}",
    title: "Education requirements",
    category: "Requirements",
  },
  {
    key: "{{custom_questions}}",
    title: "Custom application questions",
    category: "Requirements",
  },

  // Interview & Next Steps
  {
    key: "{{interview_date}}",
    title: "The scheduled interview date",
    category: "Interview",
  },
  {
    key: "{{interview_time}}",
    title: "The scheduled interview time",
    category: "Interview",
  },
  {
    key: "{{interviewer_name}}",
    title: "The name of the interviewer",
    category: "Interview",
  },
  {
    key: "{{next_steps}}",
    title: "Next steps in the hiring process",
    category: "Interview",
  },

  // Candidate Information
  {
    key: "{{candidate_name}}",
    title: "The name of the candidate/applicant",
    category: "Candidate",
  },
  {
    key: "{{candidate_email}}",
    title: "The candidate's email address",
    category: "Candidate",
  },
  {
    key: "{{candidate_phone}}",
    title: "The candidate's phone number",
    category: "Candidate",
  },

  // Budget & Posting
  {
    key: "{{daily_budget}}",
    title: "Daily budget for job posting",
    category: "Budget",
  },
  {
    key: "{{monthly_budget}}",
    title: "Monthly budget for job posting",
    category: "Budget",
  },
  {
    key: "{{indeed_budget}}",
    title: "Indeed-specific budget allocation",
    category: "Budget",
  },
  {
    key: "{{ziprecruiter_budget}}",
    title: "ZipRecruiter-specific budget allocation",
    category: "Budget",
  },
];

// Category order for display
export const VARIABLE_CATEGORY_ORDER = [
  "Job Details",
  "Compensation",
  "Schedule",
  "Company",
  "Requirements",
  "Application",
  "Interview",
  "Candidate",
  "Budget",
];
