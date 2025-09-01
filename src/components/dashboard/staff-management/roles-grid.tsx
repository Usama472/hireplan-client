import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreVertical, Shield, Trash2 } from "lucide-react";
import type { RolesGridProps } from "./types";

export function RolesGrid({ roles }: RolesGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
      {roles.map((role) => (
        <Card
          key={role.id}
          className="bg-white border border-gray-200 hover:border-primary/20 transition-all duration-200 rounded-lg overflow-hidden"
        >
          <CardContent className="p-0">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <h3 className="font-medium text-lg text-gray-900">
                    {role.name}
                  </h3>
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
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer text-red-600 flex items-center gap-2">
                      <Trash2 className="h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Role description */}
              <div className="p-5 flex-grow">
                <p className="text-gray-600 text-sm mb-5">{role.description}</p>

                {/* Permissions list */}
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Permissions
                  </h4>
                  <div className="space-y-1">
                    {role.permissions.map((permission, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm py-1 px-2 bg-gray-50 rounded"
                      >
                        <span className="w-2 h-2 rounded-full bg-primary/50"></span>
                        <span className="capitalize">
                          {permission.replace(/_/g, " ")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
