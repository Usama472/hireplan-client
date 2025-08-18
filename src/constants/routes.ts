export const DASHBOARD_MAIN_ROUTE = "/dashboard/jobs";

export const DASHBOARD_ROUTES = {
  MAIN: DASHBOARD_MAIN_ROUTE,
  CREATE_JOB: `${DASHBOARD_MAIN_ROUTE}/create`,
  EDIT_JOB: `${DASHBOARD_MAIN_ROUTE}/edit`,
  EDIT_JOB_ID: `${DASHBOARD_MAIN_ROUTE}/edit/:id`,
  VIEW_JOB: `${DASHBOARD_MAIN_ROUTE}/view`,
  VIEW_JOB_ID: `${DASHBOARD_MAIN_ROUTE}/view/:id`,
  PROFILE: `${DASHBOARD_MAIN_ROUTE}/profile`,
  AVAILABILITY: `/dashboard/availability`,
  EMAIL_TEMPLATES: `/dashboard/email-templates`,
  CREATE_EMAIL_TEMPLATE: `/dashboard/email-templates/create`,
  EDIT_EMAIL_TEMPLATE: `/dashboard/email-templates/edit`,
  EDIT_EMAIL_TEMPLATE_ID: `/dashboard/email-templates/edit/:id`,
  GLOBAL_SETTINGS: `/dashboard/global-settings`,
};

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  // RESET_PASSWORD_QUERY: "/reset-password",
  DASHBOARD: DASHBOARD_ROUTES,
  CONTACT: "/contact",
  PRIVACY: "/privacy",
  TERMS: "/terms",
  COMPANY: "/company/:slug",
  APPLY_JOB: "/company/:slug/job/:jobId/apply",
  INTERVIEW_SCHEDULE: "/interview/schedule/:token",
};
