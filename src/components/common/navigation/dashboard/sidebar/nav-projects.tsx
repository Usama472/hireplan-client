import { type LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useNavigate } from "react-router";

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
  const navigate = useNavigate();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{name}</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => {
          const isActive = currentPath === item.url;

          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                asChild
                onClick={() => navigate(item.url)}
                className={isActive ? "bg-blue-100 hover:bg-blue-400" : ""}
              >
                <div
                  className={`group cursor-pointer flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <item.icon
                    className={`w-4 h-4 transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-gray-600 group-hover:text-blue-600"
                    }`}
                  />
                  <span
                    className={`font-medium transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-gray-700 group-hover:text-blue-600"
                    }`}
                  >
                    {item.name}
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
