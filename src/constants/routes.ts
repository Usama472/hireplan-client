export const DASHBOARD_MAIN_ROUTE = '/dashboard/jobs'

export const DASHBOARD_ROUTES = {
  MAIN: DASHBOARD_MAIN_ROUTE,
  CREATE_JOB: `${DASHBOARD_MAIN_ROUTE}/create`,
  VIEW_JOB: `${DASHBOARD_MAIN_ROUTE}/view`,
  VIEW_JOB_ID: `${DASHBOARD_MAIN_ROUTE}/view/:id`,
  PROFILE: `${DASHBOARD_MAIN_ROUTE}/profile`,
}

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: DASHBOARD_ROUTES,
  CONTACT: '/contact',
  COMPANY: '/company/:slug',
  APPLY_JOB: '/company/:slug/job/:jobId/apply',
}
