import { type LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";

export function NavProjects({
  projects,
  name,
  currentPath,
}: {
  name: string;
  projects: {
    name: string;
    url: string;
    icon: LucideIcon;
  }[];
  currentPath: string;
}) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className=" font-medium text-gray-600 dark:text-white/60 uppercase tracking-wider mb-4 px-3">
        {name}
      </SidebarGroupLabel>
      <SidebarMenu className="space-y-1">
        {projects.map((item) => {
          const isActive = currentPath === item.url;

          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                asChild
                className="p-0 hover:bg-transparent focus:bg-transparent active:bg-transparent"
              >
                <Link
                  to={item.url}
                  className={`group flex items-center gap-3 px-4 py-5 mx-2 rounded-md transition-all duration-200 font-normal ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white"
                      : "hover:bg-gray-100 text-gray-700 dark:hover:bg-white/10 dark:text-white/70"
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-muted-foreground group-hover:text-primary dark:text-white/70 dark:group-hover:text-white"
                    }`}
                  />
                  <span
                    className={`font-medium transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-gray-700 group-hover:text-gray-900 dark:text-white/70 dark:group-hover:text-white"
                    }`}
                  >
                    {item.name}
                  </span>
                  {isActive && (
                    <div className="w-2 h-2 bg-white rounded-full opacity-80 ml-auto"></div>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
