import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { BadgeCheck, Bell, ChevronDown, LogOut, User } from "lucide-react";
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
              className="cursor-pointer hover:bg-primary/10 transition-colors rounded-lg"
            >
              <div className="flex items-center gap-3 w-full">
                <Avatar className="h-9 w-9 rounded-lg border-2 border-white">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg bg-blue-100 text-blue-800 font-medium">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-medium text-white">
                    {user.name}
                  </span>
                  <span className="truncate text-xs text-gray-200">
                    {user.email}
                  </span>
                </div>
                <ChevronDown className="size-4 text-gray-100" />
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl shadow-lg border border-gray-200"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 rounded-lg border-2 border-white">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg bg-blue-100 text-blue-800 font-medium">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 leading-tight">
                  <span className="truncate font-medium text-gray-900">
                    {user.name}
                  </span>
                  <span className="truncate text-xs text-gray-500">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuGroup className="p-2">
              <DropdownMenuItem
                className="px-3 py-2.5 rounded-lg hover:bg-blue-50 focus:bg-blue-50 transition-colors cursor-pointer"
                onClick={() => navigate(ROUTES.DASHBOARD.PROFILE)}
              >
                <User className="size-4 text-blue-700 mr-3" />
                <span className="font-medium text-blue-700">My Profile</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="px-3 py-2.5 rounded-lg hover:bg-red-50 focus:bg-red-50 transition-colors cursor-pointer text-red-600 font-medium"
                onClick={() => {
                  const authToken = data?.accessToken;
                  if (authToken) {
                    API.auth.logout(authToken);
                  }
                  mutateSession({ shouldBroadcast: true, accessToken: "" });
                }}
              >
                <LogOut className="size-4 mr-3 text-red-500" />
                <span className="text-red-600">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
