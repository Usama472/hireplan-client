import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle, Edit, MoreVertical, Shield, Trash2 } from "lucide-react";
import type { RolesListProps } from "./types";

export function RolesList({ roles }: RolesListProps) {
  return (
    <div className="space-y-4">
      {roles.map((role) => (
        <Card
          key={role.id}
          className="bg-white border border-gray-200 hover:border-primary/20 transition-all duration-200 rounded-lg overflow-hidden"
        >
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              {/* Role info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <h3 className="font-medium text-lg text-gray-900">
                    {role.name}
                  </h3>
                </div>

                <p className="text-gray-600 text-sm mb-4">{role.description}</p>

                {/* Permissions */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {role.permissions.map((permission, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-700 text-xs px-2 py-1 rounded"
                    >
                      <CheckCircle className="h-3 w-3 text-primary" />
                      <span className="capitalize">
                        {permission.replace(/_/g, " ")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
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
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
