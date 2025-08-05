import type { JobFormData } from "@/interfaces";

export const JOB_FORM_DEFAULT_VALUES: JobFormData = {
  // Step 1: Job Ad
  jobTitle: "",
  jobBoardTitle: "",
  jobDescription: "",
  backgroundScreeningDisclaimer: false,

  // Step 2: Company & Position Details
  company: "company-1",
  positionsToHire: 1,
  workSetting: "",
  hiringTimeline: "2-4-weeks",
  payType: "salary",
  payRate: {
    type: "range",
    amount: 0,
    min: 0,
    max: 0,
    period: "per-hour",
  },
  employmentType: "full-time",

  // Step 3: Hours, Schedule & Benefits
  hoursPerWeek: {
    type: "fixed-hours",
    amount: 40,
    min: 0,
    max: 0,
  },
  schedule: [],
  benefits: [],
  country: "United States",
  language: "English",
  jobLocationWorkType: "in-person",
  jobLocation: {
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
  },
  remoteLocationRequirement: {
    required: false,
    location: "",
  },

  // Step 4: Compliance & Department
  exemptStatus: "not-applicable",
  eeoJobCategory: "administrative-support-workers",
  department: "engineering",
  customDepartment: "",

  // Step 5: Job Qualifications
  requiredQualifications: [],
  preferredQualifications: [],
  jobRequirements: [],
  customQuestions: [],

  // Step 6: Posting Schedule & Budget
  startDate: new Date(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  runIndefinitely: false,
  dailyBudget: 0,
  monthlyBudget: 0,
  indeedBudget: 0,
  zipRecruiterBudget: 0,
  customApplicationUrl: "",
  externalApplicationSetup: {
    customFields: [],
    redirectUrl: "",
  },

  // Step 7: AI Ranking & Automation
  automation: {
    enabledRules: [],
    acceptanceThreshold: 76,
    manualReviewThreshold: 41,
    autoRejectThreshold: 40,
    scoringWeights: {
      skillsMatch: 0,
      experienceRelevance: 0,
      educationQualifications: 0,
      culturalJobFit: 0,
    },
    aiRankingCategories: [
      {
        name: "Skills Match",
        weight: 25,
        dataSource: { qualifications: true, screeningQuestions: true, resume: true },
        customQuestions: [],
      },
      {
        name: "Experience Relevance", 
        weight: 25,
        dataSource: { qualifications: false, screeningQuestions: false, resume: true },
        customQuestions: [],
      },
      {
        name: "Education Qualifications",
        weight: 25,
        dataSource: { qualifications: true, screeningQuestions: true, resume: true },
        customQuestions: [],
      },
      {
        name: "Cultural & Job Fit",
        weight: 25,
        dataSource: { qualifications: false, screeningQuestions: true, resume: false },
        customQuestions: [],
      },
    ],
    customRules: [],
    templateId: "",
  },

  // Legacy fields
  jobStatus: "medium",
  workplaceType: "onsite",
  educationRequirement: "",
};

export const JOB_FORM_TEST_DATA: JobFormData = {
  // Step 1: Job Ad
  jobTitle: "Senior Full Stack Developer - Remote",
  jobBoardTitle: "Senior Full Stack Developer (React/Node.js)",
  jobDescription: `We're seeking an experienced Full Stack Developer to join our growing tech team. You'll work on cutting-edge web applications using React, Node.js, and modern cloud technologies.

Key Responsibilities:
• Develop and maintain web applications using React and Node.js
• Collaborate with cross-functional teams to define and implement new features
• Optimize applications for maximum speed and scalability
• Participate in code reviews and technical discussions
• Mentor junior developers and contribute to best practices

Requirements:
• 5+ years of experience in full-stack development
• Strong proficiency in React, Node.js, and TypeScript
• Experience with PostgreSQL and MongoDB
• Familiarity with AWS or similar cloud platforms
• Strong problem-solving skills and attention to detail

We offer competitive compensation, comprehensive benefits, and a collaborative remote-first culture.`,
  backgroundScreeningDisclaimer: true,

  // Step 2: Position Details
  jobStatus: "high",
  workplaceType: "remote",
  jobLocation: {
    address: "123 Tech Street",
    city: "San Francisco",
    state: "CA",
    zipCode: "94105",
  },
  employmentType: "full-time",
  educationRequirement: "Bachelor's degree",
  department: "Engineering",
  customDepartment: "",
  payType: "salary",
  payRate: {
    type: "range",
    amount: 0,
    min: 120000,
    max: 160000,
  },
  positionsToHire: 2,
  jobRequirements: [
    "5+ years of React.js development experience",
    "Strong proficiency in Node.js and Express.js",
    "Experience with TypeScript and modern JavaScript",
    "Knowledge of database design (PostgreSQL, MongoDB)",
    "Familiarity with cloud platforms (AWS, Azure, or GCP)",
    "Experience with version control systems (Git)",
    "Strong problem-solving and debugging skills",
    "Excellent communication and teamwork abilities",
  ],
  exemptStatus: "exempt",
  eeoJobCategory: "professionals",

  // Custom Questions - Sample questions for testing
  customQuestions: [
    {
      id: "q_1704067200000_boolean",
      type: "boolean",
      question:
        "Are you authorized to work in the United States without sponsorship?",
      required: true,
    },
    {
      id: "q_1704067200001_select",
      type: "select",
      question: "What is your preferred work schedule?",
      required: true,
      options: [
        "Full-time (40 hours/week)",
        "Part-time (20-30 hours/week)",
        "Contract/Freelance",
        "Flexible hours",
      ],
    },
    {
      id: "q_1704067200002_string",
      type: "string",
      question:
        "Please describe your experience with React.js and any notable projects you've worked on.",
      required: true,
      placeholder:
        "Include specific projects, technologies used, and your role in the development process...",
    },
  ],

  // Step 3: Settings & Automation
  startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
  customApplicationUrl: "",
  externalApplicationSetup: {
    customFields: ["Portfolio URL", "GitHub Profile", "LinkedIn Profile"],
    redirectUrl: "https://company.com/careers/apply",
  },
  automation: {
    enabledRules: [
      "accept-notification",
      "rejection-notification",
      "interview-notification",
    ],
    acceptanceThreshold: 85,
    scoringWeights: {
      skillsMatch: 40,
      experienceRelevance: 30,
      educationQualifications: 15,
      culturalJobFit: 15,
    },
  },
};

// Additional test data with different question types for various scenarios
export const JOB_FORM_MARKETING_TEST_DATA: JobFormData = {
  ...JOB_FORM_DEFAULT_VALUES,
  jobTitle: "Digital Marketing Manager",
  jobBoardTitle: "Digital Marketing Manager - Growth Focused",
  jobDescription:
    "Join our marketing team to drive digital growth and brand awareness...",
  department: "Marketing",
  automation: {
    enabledRules: ["accept-notification"],
    acceptanceThreshold: 75,
    scoringWeights: {
      skillsMatch: 35,
      experienceRelevance: 35,
      educationQualifications: 10,
      culturalJobFit: 20,
    },
  },
  customQuestions: [
    {
      id: "q_marketing_1",
      type: "boolean",
      question:
        "Do you have experience with Google Ads and Facebook Ads management?",
      required: true,
    },
    {
      id: "q_marketing_2",
      type: "select",
      question:
        "Which marketing automation platform are you most familiar with?",
      required: true,
      options: [
        "HubSpot",
        "Marketo",
        "Pardot",
        "Mailchimp",
        "ActiveCampaign",
        "Other",
        "None",
      ],
    },
    {
      id: "q_marketing_3",
      type: "string",
      question:
        "Describe a successful digital marketing campaign you've managed and its results.",
      required: true,
      placeholder:
        "Include campaign objectives, strategies used, metrics, and outcomes...",
    },
  ],
};

export const JOB_FORM_SALES_TEST_DATA: JobFormData = {
  ...JOB_FORM_DEFAULT_VALUES,
  jobTitle: "Senior Sales Representative",
  jobBoardTitle: "Senior Sales Rep - SaaS Solutions",
  jobDescription:
    "Drive revenue growth by selling our innovative SaaS solutions to enterprise clients...",
  department: "Sales",
  automation: {
    enabledRules: ["accept-notification", "interview-notification"],
    acceptanceThreshold: 80,
    scoringWeights: {
      skillsMatch: 25,
      experienceRelevance: 45,
      educationQualifications: 5,
      culturalJobFit: 25,
    },
  },
  customQuestions: [
    {
      id: "q_sales_1",
      type: "boolean",
      question: "Do you have experience selling B2B SaaS products?",
      required: true,
    },
    {
      id: "q_sales_2",
      type: "select",
      question: "What is your typical sales cycle length?",
      required: true,
      options: [
        "Less than 1 month",
        "1-3 months",
        "3-6 months",
        "6-12 months",
        "More than 12 months",
      ],
    },
    {
      id: "q_sales_3",
      type: "string",
      question: "What CRM systems have you used, and which do you prefer?",
      required: false,
      placeholder: "List CRM platforms and explain your preference...",
    },
    {
      id: "q_sales_4",
      type: "string",
      question: "Please provide your LinkedIn profile URL.",
      required: false,
      placeholder: "https://linkedin.com/in/your-profile",
    },
  ],
};

// Question templates for common job roles
export const COMMON_QUESTION_TEMPLATES = {
  WORK_AUTHORIZATION: {
    id: "template_work_auth",
    type: "boolean" as const,
    question:
      "Are you authorized to work in the United States without sponsorship?",
    required: true,
  },
  REMOTE_EXPERIENCE: {
    id: "template_remote_exp",
    type: "boolean" as const,
    question:
      "Do you have experience working remotely or in distributed teams?",
    required: false,
  },
  AVAILABILITY: {
    id: "template_availability",
    type: "select" as const,
    question: "When would you be available to start?",
    required: true,
    options: [
      "Immediately",
      "Within 2 weeks",
      "Within 1 month",
      "More than 1 month",
    ],
  },
  SALARY_EXPECTATIONS: {
    id: "template_salary",
    type: "string" as const,
    question: "What are your salary expectations for this role?",
    required: false,
    placeholder: "e.g., $80,000 - $100,000 annually",
  },
  PORTFOLIO_URL: {
    id: "template_portfolio",
    type: "string" as const,
    question:
      "Please provide a link to your portfolio or relevant work samples.",
    required: false,
    placeholder: "https://your-portfolio.com",
  },
  EXPERIENCE_SUMMARY: {
    id: "template_experience",
    type: "string" as const,
    question: "Please summarize your relevant experience for this position.",
    required: true,
    placeholder:
      "Describe your background, key skills, and notable achievements...",
  },
  PREFERRED_LOCATION: {
    id: "template_location",
    type: "select" as const,
    question: "What is your preferred work location?",
    required: true,
    options: [
      "On-site only",
      "Remote only",
      "Hybrid (2-3 days in office)",
      "Flexible",
    ],
  },
  CONTACT_EMAIL: {
    id: "template_email",
    type: "string" as const,
    question: "Please provide your preferred contact email address.",
    required: true,
    placeholder: "your.email@example.com",
  },
  PHONE_NUMBER: {
    id: "template_phone",
    type: "string" as const,
    question: "Please provide your phone number for follow-up contact.",
    required: false,
    placeholder: "(555) 123-4567",
  },
  NOTICE_PERIOD: {
    id: "template_notice",
    type: "select" as const,
    question: "What is your current notice period?",
    required: true,
    options: [
      "Available immediately",
      "1 week",
      "2 weeks",
      "1 month",
      "2 months",
      "3+ months",
    ],
  },
} as const;

// Predefined scoring weight presets for different job types
export const SCORING_WEIGHT_PRESETS = {
  TECHNICAL_ROLE: {
    skillsMatch: 45,
    experienceRelevance: 35,
    educationQualifications: 10,
    culturalJobFit: 10,
  },
  SALES_ROLE: {
    skillsMatch: 25,
    experienceRelevance: 45,
    educationQualifications: 5,
    culturalJobFit: 25,
  },
  MARKETING_ROLE: {
    skillsMatch: 35,
    experienceRelevance: 30,
    educationQualifications: 15,
    culturalJobFit: 20,
  },
  MANAGEMENT_ROLE: {
    skillsMatch: 20,
    experienceRelevance: 40,
    educationQualifications: 15,
    culturalJobFit: 25,
  },
  ENTRY_LEVEL: {
    skillsMatch: 30,
    experienceRelevance: 20,
    educationQualifications: 25,
    culturalJobFit: 25,
  },
  BALANCED: {
    skillsMatch: 25,
    experienceRelevance: 25,
    educationQualifications: 25,
    culturalJobFit: 25,
  },
} as const;

// Helper function to generate unique IDs for questions
export const generateQuestionId = (type: string): string => {
  return `q_${Date.now()}_${type}_${Math.random().toString(36).substr(2, 9)}`;
};

// Helper function to create a question from template
export const createQuestionFromTemplate = (
  template: (typeof COMMON_QUESTION_TEMPLATES)[keyof typeof COMMON_QUESTION_TEMPLATES]
) => {
  return {
    ...template,
    id: generateQuestionId(template.type),
  };
};

// Helper function to apply scoring weight preset
export const applyScoringWeightPreset = (
  presetName: keyof typeof SCORING_WEIGHT_PRESETS
) => {
  return { ...SCORING_WEIGHT_PRESETS[presetName] };
};

// Helper function to get recommended acceptance threshold by job level
export const getRecommendedAcceptanceThreshold = (jobLevel: string): number => {
  const thresholds = {
    entry: 60,
    mid: 70,
    senior: 80,
    lead: 85,
    executive: 90,
  };

  return thresholds[jobLevel as keyof typeof thresholds] || 70;
};
