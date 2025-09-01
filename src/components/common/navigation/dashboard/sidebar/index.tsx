import {
  Briefcase,
  Calendar,
  LifeBuoy,
  Mail,
  MessageCircle,
  PlusCircle,
  Send,
  Settings,
  Users,
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
import { PERMISSIONS } from "@/constants/permissions";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";
import { useLocation, useNavigate } from "react-router-dom";
import LogoImage from "../../../../../../public/logo.png";
import { NavProjects } from "./nav-projects";
import { NavUser } from "./nav-user";

export const DashboardSidebar = ({
  ...props
}: React.ComponentProps<typeof Sidebar>) => {
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
    projects: [],
  } as any;
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

  const userPermissions = authData?.user?.appRole?.permissions || [];

  if (userPermissions.includes(PERMISSIONS.JOB_GET)) {
    staticData.projects.push({
      name: "Jobs",
      url: ROUTES.DASHBOARD.MAIN,
      icon: Briefcase,
    });
  }
  if (userPermissions.includes(PERMISSIONS.JOB_CREATE)) {
    staticData.projects.push({
      name: "Create Job",
      url: ROUTES.DASHBOARD.CREATE_JOB,
      icon: PlusCircle,
    });
  }
  if (userPermissions.includes(PERMISSIONS.CHAT_ACCESS)) {
    staticData.projects.push({
      name: "Chats",
      url: ROUTES.DASHBOARD.CHATS,
      icon: MessageCircle,
    });
  }
  if (userPermissions.includes(PERMISSIONS.STAFF_CREATE)) {
    staticData.projects.push({
      name: "Staff",
      url: ROUTES.DASHBOARD.STAFF_MANAGEMENT,
      icon: Users,
    });
  }
  if (userPermissions.includes(PERMISSIONS.SCHEDULING_ACCESS)) {
    staticData.projects.push({
      name: "Scheduling",
      url: ROUTES.DASHBOARD.SCHEDULER,
      icon: Calendar,
    });
  }

  if (userPermissions.includes(PERMISSIONS.EMAIL_TEMPLATE_CREATE)) {
    staticData.projects.push({
      name: "Email Templates",
      url: ROUTES.DASHBOARD.EMAIL_TEMPLATES,
      icon: Mail,
    });
  }
  if (userPermissions.includes(PERMISSIONS.GLOBAL_SETTINGS)) {
    staticData.projects.push({
      name: "Settings",
      url: ROUTES.DASHBOARD.GLOBAL_SETTINGS,
      icon: Settings,
    });
  }

  // Filter navigation items based on subscription
  const filteredProjects = staticData.projects.filter((project) => {
    // Scheduler requires Professional+ plan
    if (project.name === "Scheduler") {
      return (
        subscription?.planId === "professional" ||
        subscription?.planId === "enterprise"
      );
    }
    return true;
  });

  return (
    <Sidebar
      variant="inset"
      {...props}
      collapsible="icon"
      className="bg-primary border-r border-primary/20 relative overflow-hidden p-0"
    >
      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.03)_1px,transparent_0)] bg-[length:20px_20px] opacity-40"></div>

      <SidebarHeader className="bg-primary border-b border-white/10 px-6 py-4 relative overflow-hidden max-h-[80px] h-full flex flex-col justify-center">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-40"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div
                onClick={() => navigate("/")}
                className="cursor-pointer hover:bg-white/15 rounded-xl p-3 transition-all duration-300 group relative z-10"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={LogoImage}
                    alt="Logo"
                    className="h-9 w-9 object-contain"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-extrabold text-white/70 text-[1.65rem] leading-tight tracking-tight group-hover:text-blue-100 transition-colors truncate drop-shadow-sm">
                      {APP_NAME}
                    </span>
                  </div>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="bg-primary px-4 py-6 relative z-10">
        <NavProjects
          name="Navigation"
          projects={filteredProjects}
          currentPath={location.pathname}
        />
      </SidebarContent>

      <SidebarFooter className="bg-gradient-to-t from-primary/95 to-primary/90 border-t border-white/10 p-3 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-tl from-white/5 via-transparent to-white/5 opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>

        <div className="relative z-10">
          <NavUser user={user} />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
