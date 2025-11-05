export const DASHBOARD_MAIN_ROUTE = "/dashboard/jobs";

export const DASHBOARD_ROUTES = {
  MAIN: DASHBOARD_MAIN_ROUTE,
  CREATE_JOB: `${DASHBOARD_MAIN_ROUTE}/create`,
  DRAFTS: `${DASHBOARD_MAIN_ROUTE}/drafts`,
  EDIT_JOB: `${DASHBOARD_MAIN_ROUTE}/edit`,
  EDIT_JOB_ID: `${DASHBOARD_MAIN_ROUTE}/edit/:id`,
  VIEW_JOB: `${DASHBOARD_MAIN_ROUTE}/view`,
  VIEW_JOB_ID: `${DASHBOARD_MAIN_ROUTE}/view/:id`,
  APPLICANTS: `/dashboard/applicants`,
  PROFILE: `/dashboard/profile`,
  SCHEDULER: `/dashboard/scheduler`,
  CHATS: `/dashboard/chats`,
  CHAT_CONVERSATION: `/dashboard/chats/:conversationId`,
  TEMPLATES: `/dashboard/templates`, // Unified templates page
  SMS: `/dashboard/sms`,
  CREATE_SMS_TEMPLATE: `/dashboard/sms/create`,
  EDIT_SMS_TEMPLATE: `/dashboard/sms/edit`,
  EDIT_SMS_TEMPLATE_ID: `/dashboard/sms/edit/:id`,
  EMAIL_TEMPLATES: `/dashboard/email-templates`,
  CREATE_EMAIL_TEMPLATE: `/dashboard/email-templates/create`,
  EDIT_EMAIL_TEMPLATE: `/dashboard/email-templates/edit`,
  EDIT_EMAIL_TEMPLATE_ID: `/dashboard/email-templates/edit/:id`,
  JOB_TEMPLATES: `/dashboard/job-templates`,
  GLOBAL_SETTINGS: `/dashboard/global-settings`,
  STAFF_MANAGEMENT: `/dashboard/staff-management`,
  AUTOMATIONS: `/dashboard/automations`,
  CREATE_AUTOMATION: `/dashboard/automations/create`,
  TRIGGER_CREATED: `/dashboard/automations/create/:triggerId`,
  EDIT_AUTOMATION: `/dashboard/automations/edit/:id`,
  AUTOMATION_LOGS: `/dashboard/automations/logs`,
  AI_FOLLOWUP: `/dashboard/ai-followup`,
  AVAILABILITY: `/dashboard/availability`,
  MEETING_SETTINGS: `/dashboard/meeting-settings`,
};

export const APPLICANT_ROUTES = {
  LOGIN: `/applicant/login`,
  DASHBOARD: `/applicant/dashboard`,
  PORTAL: `/applicant/portal/:token`,
};

export const SHORT_URL_ROUTES = {
  REDIRECT: `/s/:shortCode`,
};

export const ROUTES = {
  HOME: "/",
  ATS: "/ats",
  LOGIN: "/login",
  SIGNUP: "/signup",
  COMPANY_SIGNUP: "/company-signup",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  // RESET_PASSWORD_QUERY: "/reset-password",
  CHECKOUT: "/checkout",
  DASHBOARD: DASHBOARD_ROUTES,
  CONTACT: "/contact",
  FAQ: "/faq",
  PRIVACY: "/privacy",
  TERMS: "/terms",
  COMPANY: "/company/:slug",
  APPLY_JOB: "/company/:slug/job/:jobId/apply",
  INTERVIEW_SCHEDULE: "/interview/schedule/:token",
  APPLICANT: APPLICANT_ROUTES,
  SHORT_URL: SHORT_URL_ROUTES,
};
