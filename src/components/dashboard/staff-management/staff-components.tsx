import { Badge } from "@/components/ui/badge";
import { UserPlus } from "lucide-react";
import type { StaffMember } from "./types";

export function StaffGrid({ staffMembers }: { staffMembers: StaffMember[] }) {
  if (staffMembers.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <UserPlus className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No staff members
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new staff member.
        </p>
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
            <h3 className="text-lg font-medium text-gray-900">{staff.name}</h3>
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
                {staff.role}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function StaffList({ staffMembers }: { staffMembers: StaffMember[] }) {
  if (staffMembers.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <UserPlus className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No staff members
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new staff member.
        </p>
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
                {staff.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{staff.email}</p>
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
                {staff.role}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
