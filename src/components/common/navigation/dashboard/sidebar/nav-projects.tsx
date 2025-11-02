import { ChevronDown, type LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
    onClick?: () => void;
    items?: {
      name: string;
      url: string;
      icon?: LucideIcon;
      onClick?: () => void;
    }[];
  }[];
  currentPath: string;
}) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      {name && (
        <SidebarGroupLabel className="font-medium text-gray-600 dark:text-white/60 uppercase tracking-wider mb-4 px-3">
          {name}
        </SidebarGroupLabel>
      )}
      <SidebarMenu className="space-y-1">
        {projects.map((item) => {
          const isActive = item.url !== "#" && currentPath === item.url;
          const hasActiveSubItem =
            item.items?.some(
              (subItem) => subItem.url !== "#" && currentPath === subItem.url
            ) ?? false;
          const shouldBeOpen = hasActiveSubItem || isActive;
          const hasSubItems = item.items && item.items.length > 0;

          // If item has sub-items, use collapsible pattern
          if (hasSubItems) {
            return (
              <Collapsible key={item.name} asChild defaultOpen={shouldBeOpen}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      isActive={isActive || hasActiveSubItem}
                      className={`group ${
                        isActive || hasActiveSubItem
                          ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white [&>svg]:text-white"
                          : ""
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span
                        className={
                          isActive || hasActiveSubItem ? "text-white" : ""
                        }
                      >
                        {item.name}
                      </span>
                      <ChevronDown
                        className={`ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180 ${
                          isActive || hasActiveSubItem ? "text-white" : ""
                        }`}
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="space-y-1 mt-1">
                      {item.items!.map((subItem) => {
                        const isSubActive =
                          subItem.url !== "#" && currentPath === subItem.url;

                        return (
                          <SidebarMenuSubItem key={subItem.name}>
                            <SidebarMenuSubButton
                              asChild={!subItem.onClick}
                              isActive={isSubActive}
                              onClick={
                                subItem.onClick ? subItem.onClick : undefined
                              }
                              className={`${
                                isSubActive
                                  ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white [&>svg]:text-white [&>a]:text-white [&>div]:text-white"
                                  : ""
                              }`}
                            >
                              {subItem.onClick ? (
                                <div
                                  className="flex items-center gap-2.5 cursor-pointer py-1.5 px-2"
                                  onClick={subItem.onClick}
                                >
                                  {subItem.icon && (
                                    <subItem.icon
                                      className={`w-4 h-4 ${
                                        isSubActive ? "text-white" : ""
                                      }`}
                                    />
                                  )}
                                  <span
                                    className={
                                      isSubActive
                                        ? "text-white font-medium"
                                        : ""
                                    }
                                  >
                                    {subItem.name}
                                  </span>
                                </div>
                              ) : (
                                <Link
                                  to={subItem.url}
                                  className={`flex items-center gap-2.5 py-1.5 px-2 ${
                                    isSubActive ? "text-white" : ""
                                  }`}
                                >
                                  {subItem.icon && (
                                    <subItem.icon
                                      className={`w-4 h-4 ${
                                        isSubActive ? "text-white" : ""
                                      }`}
                                    />
                                  )}
                                  <span
                                    className={
                                      isSubActive
                                        ? "text-white font-medium"
                                        : ""
                                    }
                                  >
                                    {subItem.name}
                                  </span>
                                </Link>
                              )}
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          }

          // Regular menu item without sub-items
          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                asChild={!item.onClick}
                isActive={isActive}
                onClick={item.onClick}
                className={`${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white [&>svg]:text-white [&>a]:text-white [&>div]:text-white"
                    : ""
                }`}
              >
                {item.onClick ? (
                  <div
                    className={`flex items-center gap-3 cursor-pointer ${
                      isActive ? "text-white" : ""
                    }`}
                    onClick={item.onClick}
                  >
                    <item.icon
                      className={`w-5 h-5 ${isActive ? "text-white" : ""}`}
                    />
                    <span className={isActive ? "text-white font-medium" : ""}>
                      {item.name}
                    </span>
                  </div>
                ) : (
                  <Link
                    to={item.url}
                    className={`flex items-center gap-3 ${
                      isActive ? "text-white" : ""
                    }`}
                  >
                    <item.icon
                      className={`w-5 h-5 ${isActive ? "text-white" : ""}`}
                    />
                    <span className={isActive ? "text-white font-medium" : ""}>
                      {item.name}
                    </span>
                  </Link>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
