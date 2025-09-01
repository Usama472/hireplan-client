import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ROUTES } from "@/constants";
import API from "@/http";
import { mutateSession } from "@/http/auth/mutateSession";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";
import { ChevronDown, LogOut, User, Settings } from "lucide-react";
import { useNavigate } from "react-router";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const { data } = useAuthSessionContext();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="cursor-pointer rounded-lg p-3 mx-1 group w-full hover:bg-transparent"
            >
              <div className="flex items-center gap-3 w-full">
                <Avatar className="h-9 w-9 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg bg-white/20 text-white font-semibold text-sm">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {user.name}
                  </div>
                  <div className="text-xs text-white/60 truncate">
                    {user.email}
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-white/50 group-hover:text-white/80 transition-all duration-200 flex-shrink-0 group-hover:rotate-180" />
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-md border border-white/20 bg-primary shadow-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="px-4 py-4 bg-primary/90 border-b border-white/10 rounded-t-md">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg bg-white/20 text-white font-medium">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 leading-tight">
                  <span className="truncate font-semibold text-white text-sm">
                    {user.name}
                  </span>
                  <span className="truncate text-xs text-white/70">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuGroup className="p-2">
              <DropdownMenuItem
                className="px-3 py-2.5 rounded-md hover:bg-white/10 focus:bg-white/10 transition-colors cursor-pointer group"
                onClick={() => navigate(ROUTES.DASHBOARD.PROFILE)}
              >
                <User className="size-4 text-white/80 mr-3 group-hover:scale-105 transition-transform duration-200" />
                <span className="font-medium text-white group-hover:text-white/90 transition-colors">
                  Profile
                </span>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="px-3 py-2.5 rounded-md hover:bg-white/10 focus:bg-white/10 transition-colors cursor-pointer group"
                onClick={() => navigate(ROUTES.DASHBOARD.GLOBAL_SETTINGS)}
              >
                <Settings className="size-4 text-white/80 mr-3 group-hover:scale-105 transition-transform duration-200" />
                <span className="font-medium text-white/80 group-hover:text-white/90 transition-colors">
                  Settings
                </span>
              </DropdownMenuItem>

              <div className="border-t border-white/10 my-2"></div>

              <DropdownMenuItem
                className="px-3 py-3 rounded-md hover:bg-red-500/20 focus:bg-red-500/20 transition-all duration-200 cursor-pointer group border border-transparent hover:border-red-400/30"
                onClick={() => {
                  const authToken = data?.accessToken;
                  if (authToken) {
                    API.auth.logout(authToken);
                  }
                  mutateSession({ shouldBroadcast: true, accessToken: "" });
                }}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="p-1.5 rounded-md bg-red-500/20 group-hover:bg-red-500/30 transition-colors">
                    <LogOut className="size-4 text-red-300 group-hover:text-red-200 transition-colors" />
                  </div>
                  <span className="font-medium text-red-200 group-hover:text-white transition-colors">
                    Sign out
                  </span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
