import ProfilePage from "@/components/dashboard/profile";
import {
  COMPANY_TEXT,
  CONTACT_TEXT,
  CREATE_JOB,
  DASHBOARD_TEXT,
  HOME_TEXT,
  LOGIN_TEXT,
  SIGNUP_TEXT,
} from "@/constants";
import { ROUTES } from "@/constants/routes";
import type { AppRoutesType } from "@/interfaces";
import CompanyPage from "@/pages/company";
import JobApplicationPage from "@/pages/company/apply";
import ContactPage from "@/pages/contact";
import PrivacyPage from "@/pages/privacy";
import TermsPage from "@/pages/terms";
import DashboardPage from "@/pages/dashboard/jobs";
import CreateJobPage from "@/pages/dashboard/jobs/create";
import JobDetailPage from "@/pages/dashboard/jobs/view";

// Public Pages
import Home from "@/pages/home";

// Auth Pages
import Login from "@pages/auth/Login";
import Signup from "@pages/auth/Signup";
import ForgotPassword from "@pages/auth/ForgotPassword";
import EditJobPage from "@/pages/dashboard/jobs/edit";

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
    id: DASHBOARD_TEXT,
    url: ROUTES.DASHBOARD.MAIN,
    element: <DashboardPage />,
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
];
