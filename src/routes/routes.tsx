import ProfilePage from "@/components/dashboard/profile";
import {
  COMPANY_TEXT,
  CONTACT_TEXT,
  CREATE_JOB,
  DASHBOARD_TEXT,
  HOME_TEXT,
  LOGIN_TEXT,
  SCHEDULER_TEXT,
  SIGNUP_TEXT,
} from "@/constants";
import { ROUTES } from "@/constants/routes";
import type { AppRoutesType } from "@/interfaces";
import CompanyPage from "@/pages/company";
import JobApplicationPage from "@/pages/company/apply";
import ContactPage from "@/pages/contact";
import DashboardPage from "@/pages/dashboard/jobs";
import CreateJobPage from "@/pages/dashboard/jobs/create";
import JobDraftsPage from "@/pages/dashboard/jobs/drafts";
import JobDetailPage from "@/pages/dashboard/jobs/view";
import SchedulerPage from "@/pages/dashboard/scheduler";
import StaffManagementPage from "@/pages/dashboard/staff-management";
import PrivacyPage from "@/pages/privacy";
import TermsPage from "@/pages/terms";

// Public Pages
import Home from "@/pages/home";

// Auth Pages
import CheckoutPage from "@/pages/checkout";
import AIFollowupPage from "@/pages/dashboard/ai-followup";
import AutomationsDashboard from "@/pages/dashboard/automations";
import CreateAutomationPage from "@/pages/dashboard/automations/create";
import EditAutomationPage from "@/pages/dashboard/automations/edit";
import TriggersPage from "@/pages/dashboard/automations/triggers";
import ChatsPage from "@/pages/dashboard/chats";
import ConversationPage from "@/pages/dashboard/chats/conversation";
import SimpleUnifiedChat from "@/pages/dashboard/chats/simple-unified-chat";
import EmailTemplatesPage from "@/pages/dashboard/email-template";
import SMSPage from "@/pages/dashboard/sms";
import CreateSMSTemplatePage from "@/pages/dashboard/sms/create";
import CreateEmailTemplatePage from "@/pages/dashboard/email-template/create";
import EditEmailTemplatePage from "@/pages/dashboard/email-template/edit";
import GlobalSettingPage from "@/pages/dashboard/global-setting";
import JobTemplatesPage from "@/pages/dashboard/job-templates";
import EditJobPage from "@/pages/dashboard/jobs/edit";
import InterviewSchedulePage from "@/pages/interview/schedule";
import OutlookAuthPage from "@/pages/outlook/auth";
import ZoomAuthPage from "@/pages/zoom/auth";
import ForgotPassword from "@pages/auth/ForgotPassword";
import Login from "@pages/auth/Login";
import ResetPassword from "@pages/auth/ResetPassword";
import Signup from "@pages/auth/Signup";

// Applicant Pages
import ApplicantLogin from "@/pages/applicant/login";
import ApplicantDashboard from "@/pages/applicant/dashboard";
import ApplicantPortal from "@/pages/applicant/portal";
import ShortUrlRedirect from "@/components/common/ShortUrlRedirect";
import ApplicantsPage from "@/pages/dashboard/applicants";

// Owner Pages
import OwnerLogin from "@/pages/owner/login";
import OwnerDashboard from "@/pages/owner/dashboard/index"; 
import OwnerCompanies from "@/pages/owner/companies/index";
import OwnerUsers from "@/pages/owner/users/index";
import OwnerSubscriptions from "@/pages/owner/subscriptions/index";
import OwnerSupport from "@/pages/owner/support/index";
import OwnerAnalytics from "@/pages/owner/analytics/index";

export const appRoutes: AppRoutesType[] = [
  {
    id: HOME_TEXT,
    url: ROUTES.HOME,
    element: <Home />,
    isPrivate: false,
  },
  {
    id: LOGIN_TEXT,
    url: ROUTES.LOGIN,
    element: <Login />,
    isPrivate: false,
  },

  {
    id: SIGNUP_TEXT,
    url: ROUTES.SIGNUP,
    element: <Signup />,
    isPrivate: false,
  },
  {
    id: "forgot-password",
    url: ROUTES.FORGOT_PASSWORD,
    element: <ForgotPassword />,
    isPrivate: false,
  },
  {
    id: "reset-password",
    url: ROUTES.RESET_PASSWORD,
    element: <ResetPassword />,
    isPrivate: false,
  },
  // {
  //   id: "reset-password",
  //   url: ROUTES.RESET_PASSWORD_QUERY,
  //   element: <ResetPassword />,
  //   isPrivate: false,
  // },
  {
    id: "interview-schedule",
    url: ROUTES.INTERVIEW_SCHEDULE,
    element: <InterviewSchedulePage />,
    isPrivate: false,
  },
  {
    id: "outlook-auth",
    url: "/outlook/auth",
    element: <OutlookAuthPage />,
    isPrivate: false,
  },
  {
    id: "zoom-auth",
    url: "/zoom/auth",
    element: <ZoomAuthPage />,
    isPrivate: false,
  },
  {
    id: "checkout",
    url: ROUTES.CHECKOUT,
    element: <CheckoutPage />,
    isPrivate: true,
  },
  {
    id: DASHBOARD_TEXT,
    url: ROUTES.DASHBOARD.MAIN,
    element: <DashboardPage />,
    isPrivate: true,
  },
  {
    id: "applicants",
    url: ROUTES.DASHBOARD.APPLICANTS,
    element: <ApplicantsPage />,
    isPrivate: true,
  },
  {
    id: CONTACT_TEXT,
    url: ROUTES.CONTACT,
    element: <ContactPage />,
    isPrivate: false,
  },
  {
    id: "privacy",
    url: ROUTES.PRIVACY,
    element: <PrivacyPage />,
    isPrivate: false,
  },
  {
    id: "terms",
    url: ROUTES.TERMS,
    element: <TermsPage />,
    isPrivate: false,
  },
  {
    id: CREATE_JOB,
    url: ROUTES.DASHBOARD.CREATE_JOB,
    element: <CreateJobPage />,
    isPrivate: true,
  },
  {
    id: "job-drafts",
    url: ROUTES.DASHBOARD.DRAFTS,
    element: <JobDraftsPage />,
    isPrivate: true,
  },
  {
    id: CREATE_JOB,
    url: ROUTES.DASHBOARD.PROFILE,
    element: <ProfilePage />,
    isPrivate: true,
  },
  {
    id: CREATE_JOB,
    url: ROUTES.DASHBOARD.VIEW_JOB_ID,
    element: <JobDetailPage />,
    isPrivate: true,
  },
  {
    id: SCHEDULER_TEXT,
    url: ROUTES.DASHBOARD.SCHEDULER,
    element: <SchedulerPage />,
    isPrivate: true,
  },
  {
    id: COMPANY_TEXT,
    url: ROUTES.COMPANY,
    element: <CompanyPage />,
    isPrivate: false,
  },
  {
    id: "apply-job",
    url: ROUTES.APPLY_JOB,
    element: <JobApplicationPage />,
    isPrivate: false,
  },
  {
    id: "edit-job",
    url: ROUTES.DASHBOARD.EDIT_JOB_ID,
    element: <EditJobPage />,
    isPrivate: true,
  },
  {
    id: "email-templates",
    url: ROUTES.DASHBOARD.EMAIL_TEMPLATES,
    element: <EmailTemplatesPage />,
    isPrivate: true,
  },
  {
    id: "create-email-template",
    url: ROUTES.DASHBOARD.CREATE_EMAIL_TEMPLATE,
    element: <CreateEmailTemplatePage />,
    isPrivate: true,
  },
  {
    id: "edit-email-template-id",
    url: ROUTES.DASHBOARD.EDIT_EMAIL_TEMPLATE_ID,
    element: <EditEmailTemplatePage />,
    isPrivate: true,
  },
  {
    id: "global-settings",
    url: ROUTES.DASHBOARD.GLOBAL_SETTINGS,
    element: <GlobalSettingPage />,
    isPrivate: true,
  },
  {
    id: "chats",
    url: ROUTES.DASHBOARD.CHATS,
    element: <SimpleUnifiedChat />,
    isPrivate: true,
  },
  {
    id: "sms",
    url: ROUTES.DASHBOARD.SMS,
    element: <SMSPage />,
    isPrivate: true,
  },
  {
    id: "create-sms-template",
    url: ROUTES.DASHBOARD.CREATE_SMS_TEMPLATE,
    element: <CreateSMSTemplatePage />,
    isPrivate: true,
  },
  {
    id: "chat-conversation",
    url: ROUTES.DASHBOARD.CHAT_CONVERSATION,
    element: <SimpleUnifiedChat />,
    isPrivate: true,
  },
  {
    id: "job-templates",
    url: ROUTES.DASHBOARD.JOB_TEMPLATES,
    element: <JobTemplatesPage />,
    isPrivate: true,
  },
  {
    id: "staff-management",
    url: ROUTES.DASHBOARD.STAFF_MANAGEMENT,
    element: <StaffManagementPage />,
    isPrivate: true,
  },
  {
    id: "automations",
    url: ROUTES.DASHBOARD.AUTOMATIONS,
    element: <AutomationsDashboard />,
    isPrivate: true,
  },
  {
    id: "create-automation",
    url: ROUTES.DASHBOARD.CREATE_AUTOMATION,
    element: <CreateAutomationPage />,
    isPrivate: true,
  },
  {
    id: "edit-automation",
    url: ROUTES.DASHBOARD.EDIT_AUTOMATION,
    element: <EditAutomationPage />,
    isPrivate: true,
  },
  {
    id: "create-trigger",
    url: ROUTES.DASHBOARD.TRIGGER_CREATED,
    element: <TriggersPage />,
    isPrivate: true,
  },
  {
    id: "ai-followup",
    url: ROUTES.DASHBOARD.AI_FOLLOWUP,
    element: <AIFollowupPage />,
    isPrivate: true,
  },
  // Applicant routes
  {
    id: "applicant-login",
    url: ROUTES.APPLICANT.LOGIN,
    element: <ApplicantLogin />,
    isPrivate: false,
  },
  {
    id: "applicant-dashboard",
    url: ROUTES.APPLICANT.DASHBOARD,
    element: <ApplicantDashboard />,
    isPrivate: false, // We'll handle auth inside the component
  },
  {
    id: "applicant-portal",
    url: ROUTES.APPLICANT.PORTAL,
    element: <ApplicantPortal />,
    isPrivate: false,
  },
  {
    id: "short-url-redirect",
    url: ROUTES.SHORT_URL.REDIRECT,
    element: <ShortUrlRedirect />,
    isPrivate: false,
  },
  // Owner routes - Note: These will use OwnerRoute wrapper in index.tsx
  {
    id: "owner-login",
    url: "/owner/login",
    element: <OwnerLogin />,
    isPrivate: false,
  },
  {
    id: "owner-dashboard",
    url: "/owner/dashboard",
    element: <OwnerDashboard />,
    isPrivate: false,
    isOwner: true, // Special flag for owner routes
  },
  {
    id: "owner-companies",
    url: "/owner/companies",
    element: <OwnerCompanies />,
    isPrivate: false,
    isOwner: true,
  },
  {
    id: "owner-users",
    url: "/owner/users",
    element: <OwnerUsers />,
    isPrivate: false,
    isOwner: true,
  },
  {
    id: "owner-subscriptions",
    url: "/owner/subscriptions",
    element: <OwnerSubscriptions />,
    isPrivate: false,
    isOwner: true,
  },
  {
    id: "owner-support",
    url: "/owner/support",
    element: <OwnerSupport />,
    isPrivate: false,
    isOwner: true,
  },
  {
    id: "owner-analytics",
    url: "/owner/analytics",
    element: <OwnerAnalytics />,
    isPrivate: false,
    isOwner: true,
  },
];
