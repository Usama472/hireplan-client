import type { EmailData, Job, TeamMember } from '@/interfaces'
import { Rocket } from 'lucide-react'

import { PlaneTakeoff } from 'lucide-react'

import { Terminal } from 'lucide-react'

export const APP_NAME = 'HirePlan'
export const clientAccessToken = 'hireme-client-token'

// Texts
export const LOGIN_TEXT = 'Login'
export const SIGNUP_TEXT = 'Signup'
export const HOME_TEXT = 'Home'
export const DASHBOARD_TEXT = 'Dashboard'
export const TEMPLATES_TEXT = 'Templates'
export const ALL_MAILS_TEXT = 'All Mails'
export const UNASSIGNED_MAILS_TEXT = 'Unassigned Mail'
export const VIEW_MAIL_TEXT = 'View Mail'
export const ALL_TEXT = 'All'
export const UNASSIGNED_TEXT = 'Unassigned'
export const PROFILE_TEXT = 'Profile'
export const COMPOSE_EMAIL_TEXT = 'Compose Email'
export const CONTACT_TEXT = 'Contact'
export const CREATE_JOB = 'Create Job'

// Constants
export const InfoSectionData = [
  {
    icon: Terminal,
    color: 'text-purple-400',
    label: 'Skills',
    content: 'Building responsive UIs with React, Next.js, and React Native.',
  },
  {
    icon: PlaneTakeoff,
    color: 'text-green-500',
    label: 'Hobbies',
    content: 'Dominating in Tekken or scoring goals in FIFA. ⚽🎮',
  },
  {
    icon: Rocket,
    color: 'text-blue-400',
    label: 'Goal',
    content: "Let's team up and create something amazing together. 🚀",
  },
]

export const teamMembers: TeamMember[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@company.com' },
  { id: '2', name: 'Bob Smith', email: 'bob@company.com' },
  { id: '3', name: 'Carol Davis', email: 'carol@company.com' },
  { id: '4', name: 'David Wilson', email: 'david@company.com' },
]

export const dummyEmails: EmailData[] = [
  {
    id: '1',
    sender: 'GitHub',
    senderEmail: 'noreply@github.com',
    recipients: ['you@example.com'],
    subject: 'Your pull request has been merged',
    preview:
      'Congratulations! Your pull request #1234 has been successfully merged into the main branch.',
    body: `<div>
      <p>Hello,</p>
      <p>Congratulations! Your pull request <strong>#1234</strong> has been successfully merged into the main branch.</p>
      <p>The changes will be deployed in the next release cycle. Thank you for your contribution!</p>
      <p>You can view the merged pull request here: <a href="https://github.com/org/repo/pull/1234">https://github.com/org/repo/pull/1234</a></p>
      <p>Best regards,<br>GitHub Team</p>
    </div>`,
    time: '2:30 PM',
    date: 'May 29, 2025',
    isRead: false,
    isStarred: true,
    hasAttachment: false,
    labels: ['work'],
    isAssigned: true,
    assignedTo: 'Alice Johnson',
    isFollowing: false,
  },
  {
    id: '2',
    sender: 'Sarah Johnson',
    senderEmail: 'sarah.johnson@company.com',
    recipients: ['you@example.com', 'team@company.com'],
    subject: 'Meeting tomorrow at 3 PM',
    preview:
      "Hi! Just wanted to confirm our meeting tomorrow at 3 PM. I'll send the Zoom link shortly.",
    body: `<div>
      <p>Hi team,</p>
      <p>Just wanted to confirm our meeting tomorrow at 3 PM. I'll send the Zoom link shortly.</p>
      <p>Please come prepared with your quarterly reports and any questions you might have about the new project timeline.</p>
      <p>I've attached the agenda for your reference.</p>
      <p>Looking forward to our discussion!</p>
      <p>Best,<br>Sarah</p>
    </div>`,
    time: '1:45 PM',
    date: 'May 29, 2025',
    isRead: true,
    isStarred: false,
    hasAttachment: true,
    attachments: [
      {
        name: 'Meeting_Agenda.pdf',
        size: '245 KB',
        type: 'pdf',
      },
    ],
    labels: ['important'],
    isAssigned: false,
    isFollowing: true,
    followUpDate: 'May 30, 2025',
  },
  {
    id: '3',
    sender: 'Netflix',
    senderEmail: 'info@netflix.com',
    recipients: ['you@example.com'],
    subject: 'New shows added this week',
    preview:
      'Check out the latest additions to Netflix including exclusive series and movies.',
    body: `<div>
      <p>Hello,</p>
      <p>We've just added some exciting new titles to Netflix that we think you'll love!</p>
      <h3>New This Week:</h3>
      <ul>
        <li>Stranger Things: Season 5</li>
        <li>The Crown: Final Season</li>
        <li>Inception (2010)</li>
        <li>The Witcher: Blood Origin</li>
      </ul>
      <p>Start watching now on any device. As always, we're here to help if you need it.</p>
      <p>Enjoy!<br>Your friends at Netflix</p>
    </div>`,
    time: '12:15 PM',
    date: 'May 29, 2025',
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    labels: ['entertainment'],
    isAssigned: false,
    isFollowing: false,
  },
  {
    id: '4',
    sender: 'John Doe',
    senderEmail: 'john.doe@example.com',
    recipients: ['you@example.com', 'manager@company.com'],
    subject: 'Project update and next steps',
    preview:
      "Here's the latest update on our project. We've completed phase 1 and are ready to move to phase 2.",
    body: `<div>
      <p>Hi team,</p>
      <p>I wanted to provide an update on our current project status:</p>
      <h3>Completed (Phase 1):</h3>
      <ul>
        <li>Initial research and planning</li>
        <li>Stakeholder interviews</li>
        <li>Prototype development</li>
        <li>User testing round 1</li>
      </ul>
      <h3>Next Steps (Phase 2):</h3>
      <ul>
        <li>Implement feedback from testing</li>
        <li>Develop MVP</li>
        <li>Prepare marketing materials</li>
        <li>Schedule launch date</li>
      </ul>
      <p>I've attached the detailed project timeline and budget report for your review.</p>
      <p>Please let me know if you have any questions or concerns.</p>
      <p>Best regards,<br>John</p>
    </div>`,
    time: '11:30 AM',
    date: 'May 29, 2025',
    isRead: false,
    isStarred: true,
    hasAttachment: true,
    attachments: [
      {
        name: 'Project_Timeline.xlsx',
        size: '1.2 MB',
        type: 'xlsx',
      },
      {
        name: 'Budget_Report.pdf',
        size: '890 KB',
        type: 'pdf',
      },
    ],
    labels: ['work', 'urgent'],
    isAssigned: true,
    assignedTo: 'Bob Smith',
    isFollowing: true,
    followUpDate: 'June 1, 2025',
  },
  {
    id: '5',
    sender: 'LinkedIn',
    senderEmail: 'messages-noreply@linkedin.com',
    recipients: ['you@example.com'],
    subject: 'You have 3 new connection requests',
    preview:
      'People are trying to connect with you on LinkedIn. See who wants to add you to their network.',
    body: `<div>
      <p>Hello,</p>
      <p>You have <strong>3 new connection requests</strong> waiting for your response on LinkedIn.</p>
      <ul>
        <li>Alex Morgan - CTO at Tech Innovations</li>
        <li>Jamie Smith - Product Manager at Global Solutions</li>
        <li>Taylor Wilson - Frontend Developer at Creative Agency</li>
      </ul>
      <p>Grow your network to discover new opportunities and stay updated with industry trends.</p>
      <p>Visit LinkedIn to respond to these requests.</p>
      <p>The LinkedIn Team</p>
    </div>`,
    time: '10:20 AM',
    date: 'May 29, 2025',
    isRead: true,
    isStarred: false,
    hasAttachment: false,
    labels: ['social'],
    isAssigned: false,
    isFollowing: false,
  },
  {
    id: '6',
    sender: 'Amazon',
    senderEmail: 'auto-confirm@amazon.com',
    recipients: ['you@example.com'],
    subject: 'Your order has been shipped',
    preview:
      'Great news! Your order #123-4567890-1234567 has been shipped and is on its way.',
    body: `<div>
      <p>Hello,</p>
      <p>Great news! Your order <strong>#123-4567890-1234567</strong> has been shipped and is on its way.</p>
      <h3>Order Details:</h3>
      <ul>
        <li>1x Wireless Headphones - $129.99</li>
        <li>2x USB-C Cables - $19.98</li>
        <li>1x Portable Charger - $45.99</li>
      </ul>
      <p><strong>Total: $195.96</strong></p>
      <p>Expected delivery date: June 1, 2025</p>
      <p>You can track your package here: <a href="#">Track Package</a></p>
      <p>Thank you for shopping with Amazon!</p>
    </div>`,
    time: '9:15 AM',
    date: 'May 29, 2025',
    isRead: false,
    isStarred: false,
    hasAttachment: false,
    labels: ['shopping'],
    isAssigned: false,
    isFollowing: false,
  },
  {
    id: '7',
    sender: 'Spotify',
    senderEmail: 'no-reply@spotify.com',
    recipients: ['you@example.com'],
    subject: 'Your weekly music mix is ready',
    preview:
      "We've created a personalized playlist based on your listening habits. Check it out now!",
    body: `<div>
      <p>Hi there,</p>
      <p>Your weekly personalized playlist is ready! We've curated a selection of tracks based on your recent listening activity.</p>
      <p>This week's mix includes new releases from your favorite artists and some tracks we think you might enjoy.</p>
      <p>Top artists in your mix:</p>
      <ul>
        <li>The Weeknd</li>
        <li>Dua Lipa</li>
        <li>Kendrick Lamar</li>
        <li>Billie Eilish</li>
      </ul>
      <p>Open Spotify to start listening!</p>
      <p>Enjoy the music,<br>The Spotify Team</p>
    </div>`,
    time: '8:30 AM',
    date: 'May 29, 2025',
    isRead: true,
    isStarred: true,
    hasAttachment: false,
    labels: ['entertainment'],
    isAssigned: false,
    isFollowing: false,
  },
  {
    id: '8',
    sender: 'Bank of America',
    senderEmail: 'alerts@bankofamerica.com',
    recipients: ['you@example.com'],
    subject: 'Your monthly statement is available',
    preview:
      'Your monthly statement for account ending in 4567 is now available to view online.',
    body: `<div>
      <p>Dear Valued Customer,</p>
      <p>Your monthly statement for account ending in <strong>4567</strong> is now available to view online.</p>
      <p>Statement Period: April 29, 2025 - May 28, 2025</p>
      <p>Summary:</p>
      <ul>
        <li>Previous Balance: $3,245.67</li>
        <li>Deposits/Credits: +$2,500.00</li>
        <li>Withdrawals/Debits: -$1,876.43</li>
        <li>Current Balance: $3,869.24</li>
      </ul>
      <p>Please log in to your online banking portal to view the full statement.</p>
      <p>Thank you for banking with Bank of America.</p>
      <p>This is an automated message. Please do not reply.</p>
    </div>`,
    time: '7:45 AM',
    date: 'May 29, 2025',
    isRead: false,
    isStarred: false,
    hasAttachment: true,
    attachments: [
      {
        name: 'May_Statement.pdf',
        size: '1.5 MB',
        type: 'pdf',
      },
    ],
    labels: ['finance', 'important'],
    isAssigned: false,
    isFollowing: false,
  },
]

export const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level', color: 'gray' },
  { value: 'mid', label: 'Mid Level', color: 'blue' },
  { value: 'senior', label: 'Senior Level', color: 'purple' },
  { value: 'executive', label: 'Executive', color: 'red' },
]

export const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'gray' },
  { value: 'medium', label: 'Medium', color: 'blue' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'urgent', label: 'Urgent', color: 'red' },
]

export const EMPLOYMENT_TYPES = [
  { value: 'full-time', label: 'Full-Time' },
  { value: 'part-time', label: 'Part-Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'seasonal', label: 'Seasonal' },
]

export const JOB_STATUSES = [
  { value: 'low', label: 'Low Priority', color: 'gray' },
  { value: 'medium', label: 'Medium Priority', color: 'blue' },
  { value: 'high', label: 'High Priority', color: 'orange' },
  { value: 'urgent', label: 'Urgent', color: 'red' },
]

export const EDUCATION_REQUIREMENTS = [
  { value: 'none', label: 'No formal education required' },
  { value: 'high-school', label: 'High School Diploma or equivalent' },
  { value: 'associate', label: "Associate's Degree" },
  { value: 'bachelor', label: "Bachelor's Degree" },
  { value: 'master', label: "Master's Degree" },
  { value: 'doctorate', label: 'Doctorate/PhD' },
  { value: 'trade-school', label: 'Trade School Certificate' },
  { value: 'professional', label: 'Professional Certification' },
]

export const DEPARTMENTS = [
  'Engineering',
  'Sales',
  'Marketing',
  'Human Resources',
  'Finance',
  'Operations',
  'Customer Success',
  'Product',
  'Design',
  'Legal',
  'IT',
  'Administration',
]

export const EXEMPT_STATUSES = [
  { value: 'exempt', label: 'Exempt' },
  { value: 'non-exempt', label: 'Non-Exempt' },
  { value: 'not-applicable', label: 'Not Applicable' },
]

export const EEO_JOB_CATEGORIES = [
  'Executive/Senior Level Officials and Managers',
  'First/Mid Level Officials and Managers',
  'Professionals',
  'Technicians',
  'Sales Workers',
  'Administrative Support Workers',
  'Craft Workers',
  'Operatives',
  'Laborers and Helpers',
  'Service Workers',
]

export const JOB_CREATION_STEPS = [
  {
    id: 1,
    title: 'Job Advertisement',
    description: 'Create your job posting content',
  },
  {
    id: 2,
    title: 'Position Details',
    description: 'Define job requirements and compensation',
  },
  {
    id: 3,
    title: 'Settings & Notifications',
    description: 'Configure posting settings and alerts',
  },
  {
    id: 4,
    title: 'Review & Publish',
    description: 'Review and publish your job posting',
  },
]

export const JOB_TYPES = [
  { value: 'full-time', label: 'Full Time', color: 'blue' },
  { value: 'part-time', label: 'Part Time', color: 'green' },
  { value: 'contract', label: 'Contract', color: 'purple' },
  { value: 'seasonal', label: 'Seasonal', color: 'orange' },
]

export const WORKPLACE_TYPES = [
  { value: 'onsite', label: 'On-site', color: 'gray' },
  { value: 'remote', label: 'Remote', color: 'blue' },
  { value: 'hybrid', label: 'Hybrid', color: 'purple' },
]

export const JOB_STATUS = [
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'paused', label: 'Paused', color: 'yellow' },
  { value: 'closed', label: 'Closed', color: 'gray' },
  { value: 'draft', label: 'Draft', color: 'blue' },
]

export const JOB_STATUS_PRIORITY = [
  { value: 'low', label: 'Low Priority', color: 'gray' },
  { value: 'medium', label: 'Medium Priority', color: 'blue' },
  { value: 'high', label: 'High Priority', color: 'orange' },
  { value: 'urgent', label: 'Urgent', color: 'red' },
]

export const PAY_TYPES = [
  { value: 'hourly', label: 'Hourly', color: 'green' },
  { value: 'salary', label: 'Salary', color: 'blue' },
  { value: 'base-commission', label: 'Base + Commission', color: 'purple' },
  { value: 'base-tips', label: 'Base + Tips', color: 'orange' },
  { value: 'base-bonus', label: 'Base + Bonus', color: 'indigo' },
  { value: 'commission-only', label: 'Commission Only', color: 'red' },
  { value: 'other', label: 'Other', color: 'gray' },
]

export const MOCK_JOBS: Job[] = [
  {
    id: '1',
    jobTitle: 'Senior Frontend Developer - SF Office',
    jobBoardTitle: 'Senior Frontend Developer',
    jobDescription:
      "We're looking for a Senior Frontend Developer to join our growing team. You'll work on cutting-edge web applications using React, TypeScript, and modern development tools. Our culture emphasizes collaboration, innovation, and continuous learning. We offer competitive benefits, flexible PTO, and opportunities for professional growth. The hiring process includes a technical interview and team meet-and-greet.",
    backgroundScreeningDisclaimer: true,
    jobStatus: 'high',
    workplaceType: 'hybrid',
    jobLocation: {
      address: '123 Tech Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
    },
    employmentType: 'full-time',
    educationRequirement: 'bachelor',
    department: 'Engineering',
    payType: 'salary',
    payRate: {
      type: 'range',
      min: 120000,
      max: 160000,
    },
    positionsToHire: 2,
    exemptStatus: 'exempt',
    eeoJobCategory: 'Professionals',
    jobRequirements: [
      '5+ years of React experience',
      'TypeScript proficiency',
      'Experience with modern build tools',
      'Strong CSS/SCSS skills',
    ],
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    notifyOnApplication: {
      enabled: true,
      recipients: ['hiring@techcorp.com'],
    },
    dailyRoundup: {
      enabled: true,
      recipients: ['manager@techcorp.com'],
      time: '09:00',
    },

    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    type: 'full-time',
    experience: 'senior',
    salary: { min: 120000, max: 160000, currency: 'USD' },
    requirements: [
      '5+ years of React experience',
      'TypeScript proficiency',
      'Experience with modern build tools',
      'Strong CSS/SCSS skills',
    ],
    benefits: [
      'Health Insurance',
      '401k Matching',
      'Flexible PTO',
      'Remote Work Options',
    ],
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'GraphQL'],
    status: 'active',
    applicants: 47,
    views: 234,
    matches: 12,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    deadline: '2024-02-15T23:59:59Z',
    priority: 'high',
    remote: false,
    featured: true,
  },
]

export * from './icons'
export * from './routes'
