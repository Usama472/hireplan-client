export const DASHBOARD_MAIN_ROUTE = '/dashboard/jobs'

export const DASHBOARD_ROUTES = {
  MAIN: DASHBOARD_MAIN_ROUTE,
  CREATE_JOB: `${DASHBOARD_MAIN_ROUTE}/create`,
  EDIT_JOB: `${DASHBOARD_MAIN_ROUTE}/edit`,
  EDIT_JOB_ID: `${DASHBOARD_MAIN_ROUTE}/edit/:id`,
  VIEW_JOB: `${DASHBOARD_MAIN_ROUTE}/view`,
  VIEW_JOB_ID: `${DASHBOARD_MAIN_ROUTE}/view/:id`,
  PROFILE: `${DASHBOARD_MAIN_ROUTE}/profile`,
  AVAILABILITY: `/dashboard/availability`,
}

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: DASHBOARD_ROUTES,
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  COMPANY: '/company/:slug',
  APPLY_JOB: '/company/:slug/job/:jobId/apply',
}
