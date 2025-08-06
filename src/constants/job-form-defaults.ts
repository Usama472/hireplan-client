import type { JobFormSchema } from "@/lib/validations/forms/job-form-schema";

export const JOB_FORM_DEFAULT_VALUES: JobFormSchema = {
  // Step 1: Job Ad
  jobTitle: "",
  jobBoardTitle: "",
  jobDescription: "",
  backgroundScreeningDisclaimer: false,

  // Step 2: Company & Position Details
  company: "", // Assuming this might be a select or dynamic, empty string as default
  positionsToHire: 1,
  workSetting: "",
  hiringTimeline: "2-4-weeks", // Default to a common timeline
  payType: "salary", // Default pay type
  payRate: {
    type: "range", // Default to range, but could be any of the discriminated union types
    min: 0,
    max: 0,
    period: "per-year", // Default period
  },
  employmentType: "full-time", // Default employment type

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
  jobLocationWorkType: "in-person", // Default to in-person
  jobLocation: {
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US", // Default country for job location
  },
  remoteLocationRequirement: {
    required: false,
    location: "",
  },
  hasConsistentStartingLocation: false,
  operatingArea: "",

  // Step 4: Compliance & Department
  exemptStatus: "not-applicable",
  eeoJobCategory: "", // Empty string as default, assuming it's a select
  department: "", // Empty string as default, assuming it's a select
  customDepartment: "",

  // Step 5: Job Qualifications
  requiredQualifications: [],
  preferredQualifications: [],
  jobRequirements: [], // Legacy field, keeping empty
  customQuestions: [],

  // Step 6: Posting Schedule & Budget
  startDate: new Date(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default to 30 days from now
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
      skillsMatch: 25,
      experienceRelevance: 25,
      educationQualifications: 25,
      culturalJobFit: 25,
    },
    aiRankingCategories: [
      {
        name: "Skills Match",
        weight: 25,
        dataSource: {
          qualifications: true,
          screeningQuestions: true,
          resume: true,
        },
        customQuestions: [],
      },
      {
        name: "Experience Relevance",
        weight: 25,
        dataSource: {
          qualifications: false,
          screeningQuestions: false,
          resume: true,
        },
        customQuestions: [],
      },
      {
        name: "Education Qualifications",
        weight: 25,
        dataSource: {
          qualifications: true,
          screeningQuestions: true,
          resume: true,
        },
        customQuestions: [],
      },
      {
        name: "Cultural & Job Fit",
        weight: 25,
        dataSource: {
          qualifications: false,
          screeningQuestions: true,
          resume: false,
        },
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

export const JOB_FORM_TEST_DATA: JobFormSchema = {
  // Step 1: Job Ad
  jobTitle: "Senior Full Stack Developer - Remote",
  jobBoardTitle: "Senior Full Stack Developer (React/Node.js)",
  jobDescription: `<h1>Senior Full Stack Developer - Remote</h1>
<p>We're seeking an experienced Full Stack Developer to join our growing tech team. You'll work on cutting-edge web applications using React, Node.js, and modern cloud technologies.</p>

<h2>Key Responsibilities</h2>
<ul>
  <li>Develop and maintain web applications using React and Node.js</li>
  <li>Collaborate with cross-functional teams to define and implement new features</li>
  <li>Optimize applications for maximum speed and scalability</li>
  <li>Participate in code reviews and technical discussions</li>
  <li>Mentor junior developers and contribute to best practices</li>
</ul>

<h2>Requirements</h2>
<ul>
  <li>5+ years of experience in full-stack development</li>
  <li>Strong proficiency in React, Node.js, and TypeScript</li>
  <li>Experience with PostgreSQL and MongoDB</li>
  <li>Familiarity with AWS or similar cloud platforms</li>
  <li>Strong problem-solving skills and attention to detail</li>
</ul>

<h3>Technical Skills</h3>
<ol>
  <li>Frontend: React.js, TypeScript, HTML5, CSS3</li>
  <li>Backend: Node.js, Express.js, RESTful APIs</li>
  <li>Database: PostgreSQL, MongoDB, Redis</li>
  <li>DevOps: AWS, Docker, CI/CD pipelines</li>
</ol>

<p><strong>Benefits:</strong> We offer competitive compensation, comprehensive benefits, and a collaborative remote-first culture.</p>
`,
  backgroundScreeningDisclaimer: true,

  // Step 2: Company & Position Details
  company: "Acme Corp",
  positionsToHire: 2,
  workSetting: "Remote",
  hiringTimeline: "1-2-weeks",
  payType: "salary",
  payRate: {
    type: "range",
    min: 120000,
    max: 160000,
    period: "per-year",
  },
  employmentType: "full-time",

  // Step 3: Hours, Schedule & Benefits
  hoursPerWeek: {
    type: "fixed-hours",
    amount: 40,
  },
  schedule: ["Monday to Friday", "8 hour shift"],
  benefits: ["Health insurance", "Paid time off", "401(k)"],
  country: "United States",
  language: "English",
  jobLocationWorkType: "fully-remote",
  jobLocation: {
    address: "", // Not applicable for fully-remote unless specified
    city: "",
    state: "",
    zipCode: "",
    country: "US",
  },
  remoteLocationRequirement: {
    required: true,
    location: "California",
  },
  hasConsistentStartingLocation: false,
  operatingArea: "",

  // Step 4: Compliance & Department
  exemptStatus: "exempt",
  eeoJobCategory: "professionals",
  department: "engineering",
  customDepartment: "",

  // Step 5: Job Qualifications
  requiredQualifications: [
    { text: "5+ years of React.js development experience", score: 100 },
    { text: "Strong proficiency in Node.js and Express.js", score: 100 },
  ],
  preferredQualifications: [
    { text: "Experience with TypeScript", score: 75 },
    {
      text: "Familiarity with cloud platforms (AWS, Azure, or GCP)",
      score: 50,
    },
  ],
  jobRequirements: [
    "Strong problem-solving and debugging skills",
    "Excellent communication and teamwork abilities",
  ],
  customQuestions: [
    {
      id: "q_1_boolean",
      type: "boolean",
      question:
        "Are you authorized to work in the United States without sponsorship?",
      required: true,
    },
    {
      id: "q_2_select",
      type: "select",
      question: "What is your preferred work schedule?",
      required: true,
      options: [
        "Full-time (40 hours/week)",
        "Part-time (20-30 hours/week)",
        "Contract/Freelance",
      ],
    },
  ],

  // Step 6: Posting Schedule & Budget
  startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
  runIndefinitely: false,
  dailyBudget: 50,
  monthlyBudget: 1500,
  indeedBudget: 30,
  zipRecruiterBudget: 20,
  customApplicationUrl: "https://company.com/careers/apply-dev",
  externalApplicationSetup: {
    customFields: ["Portfolio URL", "GitHub Profile"],
    redirectUrl: "https://company.com/careers/external-apply",
  },

  // Step 7: AI Ranking & Automation
  automation: {
    enabledRules: ["accept-notification", "rejection-notification"],
    acceptanceThreshold: 85,
    manualReviewThreshold: 60,
    autoRejectThreshold: 30,
    scoringWeights: {
      skillsMatch: 40,
      experienceRelevance: 30,
      educationQualifications: 15,
      culturalJobFit: 15,
    },
    aiRankingCategories: [
      {
        name: "Skills Match",
        weight: 40,
        dataSource: {
          qualifications: true,
          screeningQuestions: true,
          resume: true,
        },
        customQuestions: ["Rate communication skills 1-10"],
      },
      {
        name: "Experience Relevance",
        weight: 30,
        dataSource: {
          qualifications: false,
          screeningQuestions: false,
          resume: true,
        },
        customQuestions: [],
      },
      {
        name: "Education Qualifications",
        weight: 15,
        dataSource: {
          qualifications: true,
          screeningQuestions: true,
          resume: true,
        },
        customQuestions: [],
      },
      {
        name: "Cultural & Job Fit",
        weight: 15,
        dataSource: {
          qualifications: false,
          screeningQuestions: true,
          resume: false,
        },
        customQuestions: [],
      },
    ],
    customRules: [
      {
        condition: "Score 41-75%",
        action: "send-questions",
        template: "questions-1",
      },
      {
        condition: "Score 76-85%",
        action: "schedule-phone",
        template: "interview-2",
      },
    ],
    templateId: "technical-role",
  },

  // Legacy fields
  jobStatus: "high",
  workplaceType: "remote",
  educationRequirement: "Bachelor's degree",
};
