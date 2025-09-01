import { Badge } from "@/components/ui/badge";
import { Search, UserPlus } from "lucide-react";
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
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
    );
  }

  if (staffMembers.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        {searchQuery ? (
          <>
            <Search className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No matching staff members
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search term or clear the search
            </p>
          </>
        ) : (
          <>
            <UserPlus className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No staff members
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new staff member.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
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
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 p-5 rounded-lg animate-pulse"
          >
            <div className="flex justify-between">
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
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
      <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        {searchQuery ? (
          <>
            <Search className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No matching staff members
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search term or clear the search
            </p>
          </>
        ) : (
          <>
            <UserPlus className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No staff members
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new staff member.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {staffMembers.map((staff) => (
        <div
          key={staff.id}
          className="bg-white border border-gray-200 p-5 rounded-lg hover:border-primary/20 transition-all duration-200"
        >
          <div className="flex justify-between items-center">
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
