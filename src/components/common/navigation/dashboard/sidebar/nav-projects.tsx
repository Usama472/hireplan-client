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
      <SidebarGroupLabel className="text-xs font-medium text-white/60 uppercase tracking-wider mb-4 px-3">
        {name}
      </SidebarGroupLabel>
      <SidebarMenu className="space-y-1">
        {projects.map((item) => {
          const isActive = currentPath === item.url;

          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                asChild
                onClick={() => navigate(item.url)}
                className="p-0 hover:bg-transparent focus:bg-transparent active:bg-transparent"
              >
                <div
                  className={`group cursor-pointer flex items-center gap-3 px-3 py-2 mx-1 rounded-md h-10 hover:bg-white/10 hover:text-white ${
                    isActive ? "bg-white/15 text-white" : "text-white/70"
                  }`}
                >
                  <item.icon
                    className={`w-4 h-4 ${
                      isActive
                        ? "text-white"
                        : "text-white/70 group-hover:text-white"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium flex-1 ${
                      isActive
                        ? "text-white"
                        : "text-white/70 group-hover:text-white"
                    }`}
                  >
                    {item.name}
                  </span>
                  {isActive && (
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  )}
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
