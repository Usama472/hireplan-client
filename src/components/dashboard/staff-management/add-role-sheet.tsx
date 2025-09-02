import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SHOW_PERMISSIONS } from "@/constants/permissions";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  Building2,
  Check,
  Mail,
  MessageSquare,
  Search,
  Shield,
  Tag,
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface Permission {
  name: string;
  code: string;
  type: string;
}

interface AddRoleSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isCreatingRole?: boolean;
  isEditing?: boolean;
  initialData?: {
    name: string;
    permissions: string[];
  };
  onSubmit?: (roleData: { name: string; permissions: string[] }) => void;
}

export default function AddRoleSheet({
  open,
  onOpenChange,
  onSubmit,
  isCreatingRole = false,
  isEditing = false,
  initialData,
}: AddRoleSheetProps) {
  const [roleName, setRoleName] = useState(initialData?.name || "");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    initialData?.permissions || []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      setRoleName(initialData.name);
      setSelectedPermissions(initialData.permissions);
    } else {
      // Reset form when not editing
      if (!isEditing) {
        setRoleName("");
        setSelectedPermissions([]);
      }
    }
  }, [initialData, isEditing]);

  // Group permissions by type
  const permissionsByType = SHOW_PERMISSIONS.reduce((acc, permission) => {
    if (!acc[permission.type]) {
      acc[permission.type] = [];
    }
    acc[permission.type].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  // Filter permissions by search query
  const filteredPermissions =
    searchQuery.trim() === ""
      ? SHOW_PERMISSIONS
      : SHOW_PERMISSIONS.filter((permission) =>
          permission.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

  // Check if all permissions of a type are selected
  const isAllTypeSelected = (type: string) => {
    const typePermissions = permissionsByType[type] || [];
    return typePermissions.every((p) => selectedPermissions.includes(p.code));
  };

  // Toggle a permission selection
  const togglePermission = (code: string) => {
    if (selectedPermissions.includes(code)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== code));
    } else {
      setSelectedPermissions([...selectedPermissions, code]);
    }
  };

  // Toggle all permissions of a type
  const toggleTypePermissions = (type: string) => {
    const typePermissions = permissionsByType[type] || [];
    const typePermissionCodes = typePermissions.map((p) => p.code);

    if (isAllTypeSelected(type)) {
      // Deselect all permissions of this type
      setSelectedPermissions(
        selectedPermissions.filter((p) => !typePermissionCodes.includes(p))
      );
    } else {
      // Select all permissions of this type
      const newPermissions = new Set([
        ...selectedPermissions,
        ...typePermissionCodes,
      ]);
      setSelectedPermissions(Array.from(newPermissions));
    }
  };

  // Get the icon for each permission type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "job":
        return <Briefcase className="h-4 w-4 text-blue-500" />;
      case "email":
        return <Mail className="h-4 w-4 text-amber-500" />;
      case "chat":
        return <MessageSquare className="h-4 w-4 text-violet-500" />;
      case "company":
        return <Building2 className="h-4 w-4 text-purple-500" />;
      default:
        return <Tag className="h-4 w-4 text-gray-500" />;
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (roleName.trim() === "" || isCreatingRole) {
      // Show validation error (could be improved with a form library)
      return;
    }

    setIsSubmitting(true);

    // Prepare role data
    const roleData = {
      name: roleName,
      permissions: selectedPermissions,
    };

    // Call the onSubmit callback if provided
    if (onSubmit) {
      onSubmit(roleData);
    }

    // Reset form after submission (only if not using external state)
    // The parent component should close the sheet when API call is complete
    if (!isCreatingRole) {
      setTimeout(() => {
        setIsSubmitting(false);
        setRoleName("");
        setSelectedPermissions([]);
        setSearchQuery("");
        onOpenChange(false);
      }, 500);
    }
  };

  // Calculate how many permissions are selected for each type
  const getSelectedCountByType = (type: string) => {
    const typePermissions = permissionsByType[type] || [];
    return typePermissions.filter((p) => selectedPermissions.includes(p.code))
      .length;
  };

  // Get background color for permission type headers
  const getTypeHeaderBgColor = (type: string) => {
    switch (type) {
      case "job":
        return "bg-blue-50";
      case "email":
        return "bg-amber-50";
      case "chat":
        return "bg-violet-50";
      case "company":
        return "bg-purple-50";
      default:
        return "bg-gray-50";
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl overflow-hidden border-l border-gray-100 px-3 sm:px-4 md:px-6"
        side="right"
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <SheetHeader className="space-y-2 text-left pb-4 mb-4 border-b">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 bg-primary/10 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <SheetTitle className="text-xl font-semibold">
                {isEditing ? "Edit Role" : "Create New Role"}
              </SheetTitle>
            </div>
            <SheetDescription className="text-sm text-gray-500">
              {isEditing
                ? "Modify role details and permissions"
                : "Add a new role and assign permissions for your team members"}
            </SheetDescription>
          </SheetHeader>

          <div className="flex-grow overflow-hidden flex flex-col">
            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium flex items-center"
                >
                  Role Name <span className="text-red-500 ml-1">*</span>
                  <span className="ml-auto text-xs text-gray-400">
                    {roleName.length > 0 ? roleName.length : ""}
                  </span>
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    placeholder="Enter role name"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    className="w-full pr-16 pl-3.5 border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20"
                    required
                  />
                  {roleName.length > 0 && (
                    <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2 flex items-center">
                      <Badge
                        variant="outline"
                        className="bg-primary/5 text-primary border-primary/20 text-xs h-6 flex items-center justify-center px-2"
                      >
                        Role
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3 flex-grow overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  Permissions
                  <Badge className="bg-primary/10 text-primary text-xs border-0">
                    {selectedPermissions.length} selected
                  </Badge>
                </Label>
                <div className="relative w-full sm:w-56">
                  <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search permissions"
                    className="pl-9 h-9 text-sm border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/20 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <ScrollArea className="h-[calc(100vh-300px)] md:h-[calc(100vh-270px)] pr-2 sm:pr-4 -mr-2 sm:-mr-4 pb-6 mt-2">
                <div className="space-y-4">
                  {searchQuery.trim() !== "" ? (
                    // Search results view
                    <div className="space-y-2">
                      {filteredPermissions.length > 0 ? (
                        filteredPermissions.map((permission) => (
                          <div
                            key={permission.code}
                            onClick={() => togglePermission(permission.code)}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors",
                              selectedPermissions.includes(permission.code)
                                ? "bg-primary/10 hover:bg-primary/15"
                                : "hover:bg-gray-100"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              {getTypeIcon(permission.type)}
                              <span className="text-sm font-medium">
                                {permission.name}
                              </span>
                            </div>
                            <div
                              className={cn(
                                "w-5 h-5 rounded-full flex items-center justify-center",
                                selectedPermissions.includes(permission.code)
                                  ? "bg-primary text-white"
                                  : "border border-gray-300"
                              )}
                            >
                              {selectedPermissions.includes(
                                permission.code
                              ) && <Check className="h-3.5 w-3.5" />}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          No permissions match your search
                        </div>
                      )}
                    </div>
                  ) : (
                    // Grouped permissions view
                    Object.entries(permissionsByType).map(
                      ([type, permissions]) => (
                        <div key={type} className="space-y-2 mb-4">
                          <div
                            className={cn(
                              "flex items-center justify-between px-2.5 py-2 rounded-md cursor-pointer",
                              getTypeHeaderBgColor(type)
                            )}
                            onClick={() => toggleTypePermissions(type)}
                          >
                            <div className="flex items-center gap-2">
                              {getTypeIcon(type)}
                              <span className="font-medium capitalize text-sm">
                                {type} Permissions
                              </span>
                              <div className="flex items-center gap-1.5">
                                <Badge
                                  variant="secondary"
                                  className="bg-white/80 text-gray-700 text-xs px-2 py-0 h-5 border-0"
                                >
                                  {permissions.length}
                                </Badge>
                                {getSelectedCountByType(type) > 0 && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-primary/10 text-primary border-0 text-xs px-2 py-0 h-5"
                                  >
                                    {getSelectedCountByType(type)} selected
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div
                              className={cn(
                                "w-5 h-5 rounded-full flex items-center justify-center",
                                isAllTypeSelected(type)
                                  ? "bg-primary text-white"
                                  : "border border-gray-300"
                              )}
                            >
                              {isAllTypeSelected(type) && (
                                <Check className="h-3.5 w-3.5" />
                              )}
                            </div>
                          </div>

                          <div className="pl-2 space-y-1.5">
                            {permissions.map((permission) => (
                              <div
                                key={permission.code}
                                onClick={() =>
                                  togglePermission(permission.code)
                                }
                                className={cn(
                                  "flex items-center justify-between p-2.5 rounded-md cursor-pointer transition-colors",
                                  selectedPermissions.includes(permission.code)
                                    ? "bg-primary/10 hover:bg-primary/15"
                                    : "hover:bg-gray-100"
                                )}
                              >
                                <span className="text-sm">
                                  {permission.name}
                                </span>
                                <div
                                  className={cn(
                                    "w-5 h-5 rounded-full flex items-center justify-center",
                                    selectedPermissions.includes(
                                      permission.code
                                    )
                                      ? "bg-primary text-white"
                                      : "border border-gray-300"
                                  )}
                                >
                                  {selectedPermissions.includes(
                                    permission.code
                                  ) && <Check className="h-3.5 w-3.5" />}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>

          <SheetFooter className="pt-4 border-t mt-4 flex justify-center">
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white gap-2 px-6 sm:px-8 py-2 h-11 w-full sm:w-auto"
              disabled={
                roleName.trim() === "" || isSubmitting || isCreatingRole
              }
            >
              <Shield className="h-5 w-5" />
              {isCreatingRole
                ? isEditing
                  ? "Updating..."
                  : "Creating..."
                : isEditing
                ? "Update Role"
                : "Create Role"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
