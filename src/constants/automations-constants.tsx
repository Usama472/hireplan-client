import {
  AlertCircle,
  Brain,
  Briefcase,
  Calendar,
  CheckCircle2,
  FileCheck,
  MessageSquare,
  UserCheck,
  Phone,
  Send,
  type LucideIcon,
} from "lucide-react";

export type TriggerCategory = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
};

export const triggerCategories: TriggerCategory[] = [
  {
    id: "application",
    title: "Application Triggers",
    description: "Events based on applicant activity",
    icon: UserCheck,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    id: "job",
    title: "Job Triggers",
    description: "Events related to job postings",
    icon: Briefcase,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  // {
  //   id: "communication",
  //   title: "Communication Triggers",
  //   description: "Email and messaging events",
  //   icon: Mail,
  //   color: "text-indigo-600",
  //   bgColor: "bg-indigo-50",
  // },
  {
    id: "schedule",
    title: "Scheduled Triggers",
    description: "Time-based recurring events",
    icon: Calendar,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
];
export const allTriggers = [
  {
    type: "application_created",
    label: "New Application",
    description: "When a candidate applies to a job",
    icon: <UserCheck className="h-5 w-5" />,
    category: "application",
    color: "bg-blue-500",
    iconBg: "bg-blue-100",
  },
  {
    type: "application_status_changed",
    label: "Application Status Change",
    description: "When an application's status is updated",
    icon: <FileCheck className="h-5 w-5" />,
    category: "application",
    color: "bg-indigo-500",
    iconBg: "bg-indigo-100",
  },
  {
    type: "resume_score_updated",
    label: "Resume Score Updated",
    description: "When a candidate's resume score changes",
    icon: <CheckCircle2 className="h-5 w-5" />,
    category: "application",
    color: "bg-green-500",
    iconBg: "bg-green-100",
  },
  {
    type: "job_created",
    label: "Job Created",
    description: "When a new job is created in the system",
    icon: <Briefcase className="h-5 w-5" />,
    category: "job",
    color: "bg-amber-500",
    iconBg: "bg-amber-100",
  },
  {
    type: "job_published",
    label: "Job Published",
    description: "When a job posting goes live publicly",
    icon: <Briefcase className="h-5 w-5" />,
    category: "job",
    color: "bg-emerald-500",
    iconBg: "bg-emerald-100",
  },
  {
    type: "job_expired",
    label: "Job Expired",
    description: "When a job posting reaches its expiration date",
    icon: <AlertCircle className="h-5 w-5" />,
    category: "job",
    color: "bg-red-500",
    iconBg: "bg-red-100",
  },
  // {
  //   type: "candidate_matched",
  //   label: "Candidate Match",
  //   description: "When a candidate is matched to a job",
  //   icon: <UserCheck className="h-5 w-5" />,
  //   category: "application",
  //   color: "bg-violet-500",
  //   iconBg: "bg-violet-100",
  // },
  // {
  //   type: "email_received",
  //   label: "Email Received",
  //   description: "When an email is received in the system",
  //   icon: <Mail className="h-5 w-5" />,
  //   category: "communication",
  //   color: "bg-blue-500",
  //   iconBg: "bg-blue-100",
  // },
  {
    type: "cron",
    label: "Scheduled Time",
    description: "Recurring time-based trigger (daily, weekly, monthly)",
    icon: <Calendar className="h-5 w-5" />,
    category: "schedule",
    color: "bg-purple-500",
    iconBg: "bg-purple-100",
  },
];

export const applicantConditions = [
  {
    id: "totalScore",
    label: "Resume Score",
  },
  {
    id: "culturalFitScore",
    label: "Cultural Fit Score",
  },
  {
    id: "educationScore",
    label: "Education Score",
  },
  {
    id: "experienceScore",
    label: "Experience Score",
  },
  {
    id: "skillsMatchScore",
    label: "Skills Match Score",
  },
];

export const allActions = [
  {
    type: "send_email",
    label: "Send Email",
    description: "Send an email using a template",
    icon: <MessageSquare className="h-5 w-5" />,
    category: "communication",
    color: "bg-blue-500",
    iconBg: "bg-blue-100",
  },
  {
    type: "send_sms",
    label: "Send SMS",
    description: "Send an SMS message using a template",
    icon: <Phone className="h-5 w-5" />,
    category: "communication",
    color: "bg-green-500",
    iconBg: "bg-green-100",
  },
  {
    type: "send_chat_invite",
    label: "Send Chat Invitation",
    description: "Invite applicant to start a chat conversation via SMS",
    icon: <Send className="h-5 w-5" />,
    category: "communication",
    color: "bg-purple-500",
    iconBg: "bg-purple-100",
  },
  {
    type: "update_job_status",
    label: "Update Status",
    description: "Change the applicant's status",
    icon: <CheckCircle2 className="h-5 w-5" />,
    category: "status",
    color: "bg-emerald-500",
    iconBg: "bg-emerald-100",
  },
  {
    type: "webhook",
    label: "Webhook",
    description: "Send data to an external URL",
    icon: <AlertCircle className="h-5 w-5" />,
    category: "integration",
    color: "bg-gray-500",
    iconBg: "bg-gray-100",
  },
];
