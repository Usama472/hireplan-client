export const DASHBOARD_MAIN_ROUTE = "/dashboard/jobs";

export const DASHBOARD_ROUTES = {
  MAIN: DASHBOARD_MAIN_ROUTE,
  CREATE_JOB: `${DASHBOARD_MAIN_ROUTE}/create`,
  PROFILE: `${DASHBOARD_MAIN_ROUTE}/profile`,
};

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: DASHBOARD_ROUTES,
  CONTACT: "/contact",
};
