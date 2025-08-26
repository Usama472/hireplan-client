import {
  Briefcase,
  Calendar,
  LifeBuoy,
  MessageCircle,
  PlusCircle,
  Send,
  Settings,
  FileText,
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
      name: "Templates",
      url: ROUTES.DASHBOARD.JOB_TEMPLATES,
      icon: FileText,
    },
    {
      name: "Chats",
      url: ROUTES.DASHBOARD.CHATS,
      icon: MessageCircle,
    },
    {
      name: "Scheduler",
      url: ROUTES.DASHBOARD.SCHEDULER,
      icon: Calendar,
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
  const { data: authData, subscription } = useAuthSessionContext();
  const location = useLocation();

  const user = {
    name:
      authData?.user?.firstName && authData?.user?.lastName
        ? `${authData.user.firstName} ${authData.user.lastName}`
        : authData?.user?.email?.split("@")[0] || "User",
    email: authData?.user?.email || "user@example.com",
    avatar: authData?.user?.avatar || "/avatars/default.jpg",
  };

  // Filter navigation items based on subscription
  const filteredProjects = staticData.projects.filter(project => {
    // Scheduler requires Professional+ plan
    if (project.name === "Scheduler") {
      return subscription?.planId === 'professional' || subscription?.planId === 'enterprise';
    }
    return true;
  });

  return (
    <Sidebar
      variant="inset"
      {...props}
      collapsible="icon"
      className="bg-white border-r border-gray-200"
    >
      <SidebarHeader className="bg-white border-b border-gray-100 px-6 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div onClick={() => navigate("/")} className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">H</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight ml-3">
                  <span className="truncate font-bold text-gray-900 text-base">{APP_NAME}</span>
                  <span className="text-xs text-gray-500">Recruitment Platform</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="bg-white px-3 py-4">
        <NavProjects
          name="Navigation"
          projects={filteredProjects}
          currentPath={location.pathname}
        />
      </SidebarContent>
      <SidebarFooter className="bg-white border-t border-gray-100 p-3">
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
};
