import { Badge } from "@/components/ui/badge";
import { Briefcase, Search, Shield, UserPlus } from "lucide-react";
import type { StaffMember } from "./types";

interface StaffGridProps {
  staffMembers: StaffMember[];
  isLoading?: boolean;
  searchQuery?: string;
}

export function StaffGrid({
  staffMembers,
  isLoading,
  searchQuery = "",
}: StaffGridProps) {
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
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="flex gap-2 mt-4">
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: Loading Grid */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 p-5 rounded-lg h-44 animate-pulse"
            >
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
              <div className="flex gap-2 mt-4">
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                <div className="h-6 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (staffMembers.length === 0) {
    return (
      <div className="text-center p-6 sm:p-8 bg-gray-50 rounded-xl sm:rounded-lg border border-dashed border-gray-300">
        {searchQuery ? (
          <>
            <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto mb-4">
              <Search className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-sm font-medium text-gray-900">
              No matching staff members
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Try adjusting your search term or clear the search
            </p>
          </>
        ) : (
          <>
            <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
              <UserPlus className="h-8 w-8 sm:h-12 sm:w-12 text-blue-500" />
            </div>
            <h3 className="text-base sm:text-sm font-medium text-gray-900">
              No staff members yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Get started by adding your first staff member.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Mobile: Flowing Staff Cards */}
      <div className="block sm:hidden space-y-4">
        {staffMembers.map((staff) => (
          <div
            key={staff.id}
            className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300"
          >
            {/* Status accent bar */}
            <div
              className={`absolute top-0 left-0 right-0 h-1 ${
                staff.status === "active"
                  ? "bg-gradient-to-r from-green-400 to-green-600"
                  : "bg-gradient-to-r from-gray-400 to-gray-600"
              }`}
            />

            <div className="p-4">
              {/* Header with avatar */}
              <div className="flex items-center space-x-3 mb-4">
                <div
                  className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold ${
                    staff.status === "active"
                      ? "bg-gradient-to-br from-green-400 to-green-600"
                      : "bg-gradient-to-br from-gray-400 to-gray-600"
                  }`}
                >
                  {staff.firstName.charAt(0)}
                  {staff.lastName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate text-base">
                    {staff.firstName} {staff.lastName}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {staff.email}
                  </p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <Shield className="h-4 w-4" />
                    <span className="font-medium">Role</span>
                  </div>
                  <p className="text-sm font-semibold text-blue-900 mt-1 truncate">
                    {staff.appRole.name}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-sm text-purple-700">
                    <Briefcase className="h-4 w-4" />
                    <span className="font-medium">Category</span>
                  </div>
                  <p className="text-sm font-semibold text-purple-900 mt-1 truncate">
                    {staff.jobCategory || "Not set"}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    staff.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {staff.status.charAt(0).toUpperCase() + staff.status.slice(1)}
                </div>
                <div className="text-xs text-gray-500 truncate ml-2">
                  {staff.companyRole || "No position"}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Traditional Grid */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {staffMembers.map((staff) => (
          <div
            key={staff.id}
            className="bg-white border border-gray-200 p-5 rounded-lg hover:border-primary/20 transition-all duration-200"
          >
            <div className="flex flex-col">
              <h3 className="text-lg font-medium text-gray-900">
                {staff.firstName} {staff.lastName}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{staff.email}</p>

              <div className="flex items-center justify-between mt-4">
                <Badge
                  className={`
                  ${
                    staff.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  } 
                  border-0 text-xs
                `}
                >
                  {staff.status}
                </Badge>
                <span className="text-sm font-medium text-primary">
                  {staff.appRole.name}
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 flex justify-between items-center">
                <span>{staff.jobCategory || "—"}</span>
                <span>{staff.companyRole || "—"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

interface StaffListProps {
  staffMembers: StaffMember[];
  isLoading?: boolean;
  searchQuery?: string;
}

export function StaffList({
  staffMembers,
  isLoading,
  searchQuery = "",
}: StaffListProps) {
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
                  <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (staffMembers.length === 0) {
    return (
      <div className="text-center p-6 sm:p-8 bg-gray-50 rounded-xl sm:rounded-lg border border-dashed border-gray-300">
        {searchQuery ? (
          <>
            <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto mb-4">
              <Search className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-sm font-medium text-gray-900">
              No matching staff members
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Try adjusting your search term or clear the search
            </p>
          </>
        ) : (
          <>
            <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
              <UserPlus className="h-8 w-8 sm:h-12 sm:w-12 text-blue-500" />
            </div>
            <h3 className="text-base sm:text-sm font-medium text-gray-900">
              No staff members yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Get started by adding your first staff member.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {staffMembers.map((staff) => (
        <div
          key={staff.id}
          className="bg-white border border-gray-200 p-4 sm:p-5 rounded-xl sm:rounded-lg hover:border-primary/20 transition-all duration-200"
        >
          {/* Mobile Layout */}
          <div className="block sm:hidden">
            <div className="flex items-center space-x-3 mb-3">
              <div
                className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold ${
                  staff.status === "active"
                    ? "bg-gradient-to-br from-green-400 to-green-600"
                    : "bg-gradient-to-br from-gray-400 to-gray-600"
                }`}
              >
                {staff.firstName.charAt(0)}
                {staff.lastName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 truncate">
                  {staff.firstName} {staff.lastName}
                </h3>
                <p className="text-sm text-gray-500 truncate">{staff.email}</p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  staff.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {staff.status.charAt(0).toUpperCase() + staff.status.slice(1)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-lg p-2.5">
                <p className="text-xs text-blue-600 font-medium mb-1">
                  App Role
                </p>
                <p className="text-sm font-semibold text-blue-900 truncate">
                  {staff.appRole.name}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-2.5">
                <p className="text-xs text-purple-600 font-medium mb-1">
                  Job Category
                </p>
                <p className="text-sm font-semibold text-purple-900 truncate">
                  {staff.jobCategory || "Not set"}
                </p>
              </div>
            </div>

            {staff.companyRole && (
              <div className="mt-3 pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500">Company Role</p>
                <p className="text-sm font-medium text-gray-700 truncate">
                  {staff.companyRole}
                </p>
              </div>
            )}
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {staff.firstName} {staff.lastName}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{staff.email}</p>

              <div className="flex items-center gap-3 mt-2 text-sm">
                <div className="text-gray-600">
                  <span className="font-medium">Job:</span>{" "}
                  {staff.jobCategory || "—"}
                </div>
                <div className="text-gray-600">
                  <span className="font-medium">Role:</span>{" "}
                  {staff.companyRole || "—"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Badge
                className={`
                ${
                  staff.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                } 
                border-0
              `}
              >
                {staff.status}
              </Badge>
              <span className="text-sm font-medium text-primary border-l pl-4 border-gray-200">
                {staff.appRole.name}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
