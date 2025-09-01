import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Edit,
  Mail,
  MoreVertical,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import type { StaffListProps } from "./types";

export function StaffList({ staffMembers }: StaffListProps) {
  const getStatusStyles = (status: string) => {
    if (status === "active") {
      return {
        bg: "bg-green-50",
        text: "text-green-700",
        icon: UserCheck,
      };
    } else {
      return {
        bg: "bg-gray-100",
        text: "text-gray-700",
        icon: UserX,
      };
    }
  };

  return (
    <div className="space-y-4">
      {staffMembers.map((staff) => {
        const statusStyles = getStatusStyles(staff.status);
        const StatusIcon = statusStyles.icon;

        return (
          <Card
            key={staff.id}
            className="bg-white border border-gray-200 hover:border-primary/20 transition-all duration-200 rounded-lg overflow-hidden"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                    {staff.name.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-base text-gray-900">
                      {staff.name}
                    </h3>
                    <p className="text-sm text-gray-600">{staff.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Badge className="bg-primary/10 text-primary border-none px-3 py-1">
                    {staff.role}
                  </Badge>

                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusStyles.bg} ${statusStyles.text}`}
                  >
                    <StatusIcon className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium capitalize">
                      {staff.status}
                    </span>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
                        <Edit className="h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
                        <Mail className="h-4 w-4" /> Email
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer text-red-600 flex items-center gap-2">
                        <Trash2 className="h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
