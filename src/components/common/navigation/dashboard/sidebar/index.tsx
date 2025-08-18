import {
  Briefcase,
  Calendar,
  LifeBuoy,
  Mail,
  PlusCircle,
  Send,
  Settings,
} from "lucide-react";
import type * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { APP_NAME, ROUTES } from "@/constants";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";
import { useLocation, useNavigate } from "react-router-dom";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";

const staticData = {
  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "Jobs",
      url: ROUTES.DASHBOARD.MAIN,
      icon: Briefcase,
    },
    {
      name: "Create Job",
      url: ROUTES.DASHBOARD.CREATE_JOB,
      icon: PlusCircle,
    },
    {
      name: "Availability",
      url: ROUTES.DASHBOARD.AVAILABILITY,
      icon: Calendar,
    },
    {
      name: "Email Templates",
      url: ROUTES.DASHBOARD.EMAIL_TEMPLATES,
      icon: Mail,
    },
    {
      name: "Settings",
      url: ROUTES.DASHBOARD.GLOBAL_SETTINGS,
      icon: Settings,
    },
  ],
};

export const DashboardSidebar = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
  const navigate = useNavigate();
  const { data: authData } = useAuthSessionContext();
  const location = useLocation();

  const user = {
    name:
      authData?.user?.firstName && authData?.user?.lastName
        ? `${authData.user.firstName} ${authData.user.lastName}`
        : authData?.user?.email?.split("@")[0] || "User",
    email: authData?.user?.email || "user@example.com",
    avatar: authData?.user?.avatar || "/avatars/default.jpg",
  };

  return (
    <Sidebar
      variant="inset"
      {...props}
      collapsible="icon"
      className="bg-gray-200"
    >
      <SidebarHeader className="bg-gray-200">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div onClick={() => navigate("/")} className="cursor-pointer">
                <img src="../../../../../public/logo.png" className="w-8" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{APP_NAME}</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="bg-gray-200">
        <NavProjects
          name="Jobs"
          projects={staticData.projects}
          currentPath={location.pathname}
        />
      </SidebarContent>
      <SidebarFooter className="bg-primary rounded-lg">
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
};
