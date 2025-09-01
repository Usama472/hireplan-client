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
import type { StaffGridProps } from "./types";

export function StaffGrid({ staffMembers }: StaffGridProps) {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
      {staffMembers.map((staff) => {
        const statusStyles = getStatusStyles(staff.status);
        const StatusIcon = statusStyles.icon;

        return (
          <Card
            key={staff.id}
            className="bg-white border border-gray-200 hover:border-primary/20 transition-all duration-200 rounded-lg overflow-hidden"
          >
            <CardContent className="p-0">
              <div className="flex flex-col h-full">
                {/* Header with role badge */}
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <Badge className="bg-primary/10 text-primary border-none px-3 py-1">
                    {staff.role}
                  </Badge>

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

                {/* Staff info */}
                <div className="p-5 flex-grow flex flex-col">
                  <h3 className="font-medium text-lg text-gray-900 mb-1">
                    {staff.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">{staff.email}</p>

                  {/* Status indicator */}
                  <div className="mt-auto">
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusStyles.bg} ${statusStyles.text}`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium capitalize">
                        {staff.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
