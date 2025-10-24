import {
  Briefcase,
  Calendar,
  FileText,
  Filter,
  LifeBuoy,
  Mail,
  MessageCircle,
  Phone,
  PlusCircle,
  Send,
  Settings,
  UserCheck,
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
import { useLocation, Link } from "react-router-dom";
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
        url: "/dashboard/support",
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
    staticData.projects.push({
      name: "Applicants",
      url: ROUTES.DASHBOARD.APPLICANTS,
      icon: UserCheck,
    });
  }
  if (userPermissions.includes(PERMISSIONS.JOB_CREATE)) {
    staticData.projects.push({
      name: "Create Job",
      url: ROUTES.DASHBOARD.CREATE_JOB,
      icon: PlusCircle,
    });
    staticData.projects.push({
      name: "Drafts",
      url: ROUTES.DASHBOARD.DRAFTS,
      icon: FileText,
    });
  }
  if (userPermissions.includes(PERMISSIONS.CHAT_ACCESS)) {
    staticData.projects.push({
      name: "Chats",
      url: ROUTES.DASHBOARD.CHATS,
      icon: MessageCircle,
    });
    staticData.projects.push({
      name: "SMS",
      url: ROUTES.DASHBOARD.SMS,
      icon: Phone,
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

  // if (userPermissions.includes(PERMISSIONS.EMAIL_TEMPLATE_CREATE)) {
  //   staticData.projects.push({
  //     name: "Email Templates",
  //     url: ROUTES.DASHBOARD.EMAIL_TEMPLATES,
  //     icon: Mail,
  //   });
  // }

  // Add Automations menu item
  // if (userPermissions.includes(PERMISSIONS.AUTOMATION_ACCESS)) {
  staticData.projects.push({
    name: "Automations",
    url: ROUTES.DASHBOARD.AUTOMATIONS,
    icon: Filter,
  });
  //}

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
      className="bg-white border-r border-gray-200 relative overflow-hidden p-0"
    >
      <SidebarHeader className="bg-white border-b border-gray-100 px-6 py-4 relative overflow-hidden max-h-[80px] h-full flex flex-col justify-center">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link
                to={ROUTES.DASHBOARD.MAIN}
                className="hover:bg-gray-50 rounded-xl p-3 transition-all duration-300 group relative z-10"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={LogoImage}
                    alt="Logo"
                    className="h-9 w-9 object-contain"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-extrabold text-3xl leading-tight tracking-tight transition-colors truncate drop-shadow-sm bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                      {APP_NAME}
                    </span>
                  </div>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="bg-white px-4 py-6 relative z-10">
        <NavProjects
          name=""
          projects={filteredProjects}
          currentPath={location.pathname}
        />
      </SidebarContent>

      <SidebarFooter className="bg-white border-t border-gray-100 p-3 relative overflow-hidden">
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
