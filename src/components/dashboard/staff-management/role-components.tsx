import { Badge } from "@/components/ui/badge";
import { SHOW_PERMISSIONS } from "@/constants/permissions";
import type { RoleResponse } from "@/http/role/api";
import { Check, Edit, Shield, Trash2 } from "lucide-react";

// Interface for permission item in SHOW_PERMISSIONS
interface PermissionItem {
  name: string;
  code: string;
  type: string;
}

// Function to get permission name from code
function getPermissionName(code: string): string {
  const permission = SHOW_PERMISSIONS.find(
    (p: PermissionItem) => p.code === code
  );
  return permission ? permission.name.replace("Allow user to ", "") : code;
}

// Group permissions by type
function groupPermissionsByType(
  permissions: string[]
): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};

  permissions.forEach((code) => {
    const permission = SHOW_PERMISSIONS.find(
      (p: PermissionItem) => p.code === code
    );
    if (permission) {
      if (!grouped[permission.type]) {
        grouped[permission.type] = [];
      }
      grouped[permission.type].push(code);
    }
  });

  return grouped;
}

// Roles Grid Component for displaying roles with edit/delete functionality
export function RolesGrid({
  roles,
  onEdit,
  onDelete,
  isLoading,
  searchQuery = "",
}: {
  roles: RoleResponse[];
  onEdit: (role: RoleResponse) => void;
  onDelete: (role: RoleResponse) => void;
  isLoading?: boolean;
  searchQuery?: string;
}) {
  if (isLoading) {
    return (
      <>
        {/* Mobile: Loading Cards */}
        <div className="block sm:hidden space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="flex gap-2">
                  <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="space-y-3">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="h-3 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="flex gap-2">
                    <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                    <div className="h-5 bg-gray-200 rounded-full w-20"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: Loading Grid */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 p-5 rounded-lg h-52 animate-pulse"
            >
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
              <div className="flex flex-wrap gap-2 mt-4">
                {[1, 2, 3].map((j) => (
                  <div
                    key={j}
                    className="h-6 bg-gray-200 rounded-full w-20"
                  ></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (roles.length === 0) {
    return (
      <div className="text-center p-6 sm:p-8 bg-gray-50 rounded-xl sm:rounded-lg border border-dashed border-gray-300">
        <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
          <Shield className="h-8 w-8 sm:h-12 sm:w-12 text-blue-500" />
        </div>
        <h3 className="text-base sm:text-sm font-medium text-gray-900">
          {searchQuery ? "No matching roles found" : "No roles defined yet"}
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          {searchQuery
            ? "Try adjusting your search term or clear the search"
            : "Get started by creating your first role."}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: Flowing Role Cards */}
      <div className="block sm:hidden space-y-4">
        {roles.map((role) => {
          // Group permissions by type
          const grouped = groupPermissionsByType(role.permissions);

          return (
            <div
              key={role.id}
              className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
            >
              {/* Gradient accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-purple-500" />

              <div className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-base">
                        {role.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        by {role.user.firstName} {role.user.lastName}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(role)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(role)}
                      className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Permission sections */}
                <div className="space-y-3">
                  {Object.entries(grouped).map(([type, permissions], idx) => (
                    <div key={idx} className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-xs font-semibold text-gray-600 capitalize">
                          {type}
                        </div>
                        <div className="px-2 py-0.5 bg-gray-200 rounded-full text-xs text-gray-600">
                          {permissions.length}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {permissions.slice(0, 3).map((code, i) => (
                          <div
                            key={i}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium"
                          >
                            {getPermissionName(code)}
                          </div>
                        ))}
                        {permissions.length > 3 && (
                          <div className="px-2 py-1 bg-gray-200 text-gray-600 rounded-lg text-xs">
                            +{permissions.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: Traditional Grid */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {roles.map((role) => {
          // Group permissions by type
          const grouped = groupPermissionsByType(role.permissions);

          return (
            <div
              key={role.id}
              className="bg-white border border-gray-200 p-5 rounded-lg hover:border-primary/20 transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-medium text-gray-900">
                  {role.name}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(role)}
                    className="p-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(role)}
                    className="p-1.5 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-500 mb-4">
                <span>
                  Created by {role.user.firstName} {role.user.lastName}
                </span>
              </div>

              {/* Permission Types */}
              <div className="space-y-2 mt-4">
                {Object.entries(grouped).map(([type, permissions], idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-2">
                    <div className="text-xs font-semibold text-gray-600 capitalize mb-1.5">
                      {type}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {permissions.slice(0, 2).map((code, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="bg-primary/5 text-xs text-primary flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>{getPermissionName(code)}</span>
                        </Badge>
                      ))}
                      {permissions.length > 2 && (
                        <Badge
                          variant="outline"
                          className="bg-gray-100 text-xs text-gray-700"
                        >
                          +{permissions.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// Roles List Component for displaying roles in list view
export function RolesList({
  roles,
  onEdit,
  onDelete,
  isLoading,
  searchQuery = "",
}: {
  roles: RoleResponse[];
  onEdit: (role: RoleResponse) => void;
  onDelete: (role: RoleResponse) => void;
  isLoading?: boolean;
  searchQuery?: string;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3 sm:space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 p-4 sm:p-5 rounded-xl sm:rounded-lg animate-pulse"
          >
            <div className="flex justify-between">
              <div className="flex-1">
                <div className="h-5 sm:h-6 bg-gray-200 rounded w-1/3 mb-2 sm:mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3 sm:mb-4"></div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((j) => (
                    <div
                      key={j}
                      className="h-6 bg-gray-200 rounded-full w-16"
                    ></div>
                  ))}
                </div>
              </div>
              <div className="w-16 sm:w-20 flex gap-2">
                <div className="h-8 w-8 bg-gray-200 rounded-lg sm:rounded-md"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-lg sm:rounded-md"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className="text-center p-6 sm:p-8 bg-gray-50 rounded-xl sm:rounded-lg border border-dashed border-gray-300">
        <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
          <Shield className="h-8 w-8 sm:h-12 sm:w-12 text-blue-500" />
        </div>
        <h3 className="text-base sm:text-sm font-medium text-gray-900">
          {searchQuery ? "No matching roles found" : "No roles defined yet"}
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          {searchQuery
            ? "Try adjusting your search term or clear the search"
            : "Get started by creating your first role."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {roles.map((role) => {
        // Group permissions by type
        const grouped = groupPermissionsByType(role.permissions);

        return (
          <div
            key={role.id}
            className="bg-white border border-gray-200 p-5 rounded-lg hover:border-primary/20 transition-all duration-200"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    {role.name}
                  </h3>
                  {role.isDefault && (
                    <Badge className="bg-blue-100 text-blue-800 border-0">
                      Default
                    </Badge>
                  )}
                </div>

                <div className="text-sm text-gray-500 mt-1 mb-3">
                  Created by {role.user.firstName} {role.user.lastName} •
                  {new Date(role.createdAt).toLocaleDateString()}
                </div>

                {/* Permission Types */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                  {Object.entries(grouped).map(([type, permissions], idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-2.5">
                      <div className="text-xs font-semibold text-gray-600 capitalize mb-2">
                        {type}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {permissions.map((code, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="bg-primary/5 text-xs text-primary flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>{getPermissionName(code)}</span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(role)}
                  className="p-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(role)}
                  className="p-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
