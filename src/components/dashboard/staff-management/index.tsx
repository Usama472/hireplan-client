"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import API from "@/http";
import type { RoleResponse } from "@/http/role/api";
import type { CreateStaffPayload, StaffResponse } from "@/http/staff/api";
import {
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  Plus,
  Shield,
  Users,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import AddRoleSheet from "./add-role-sheet";
import AddStaffSheet from "./add-staff-sheet";
import EditStaffDialog from "./edit-staff-dialog";
import { DeleteRoleDialog } from "./delete-role-dialog";
import { RolesGrid, RolesList } from "./role-components";
import { StaffGrid } from "./staff-grid";
import { StaffList } from "./staff-list";
import type { StaffMember } from "./types";

export default function StaffManagement() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState<"staff" | "roles">("staff");
  const [searchQuery, setSearchQuery] = useState("");

  // Staff state
  const [isAddStaffSheetOpen, setIsAddStaffSheetOpen] = useState(false);
  const [isCreatingStaff, setIsCreatingStaff] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [isEditStaffDialogOpen, setIsEditStaffDialogOpen] = useState(false);
  const [staffState, setStaffState] = useState<{
    staff: StaffResponse[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
    isLoading: boolean;
  }>({
    staff: [],
    page: 1,
    limit: 20,
    totalPages: 0,
    totalResults: 0,
    isLoading: false,
  });

  // Role state
  const [isAddRoleSheetOpen, setIsAddRoleSheetOpen] = useState(false);
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleResponse | null>(null);
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<RoleResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [roleState, setRoleState] = useState<{
    roles: RoleResponse[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
    isLoading: boolean;
  }>({
    roles: [],
    page: 1,
    limit: 10,
    totalPages: 0,
    totalResults: 0,
    isLoading: false,
  });

  // Fetch roles when page changes or after create/update/delete operations
  useEffect(() => {
    if (activeTab === "roles") {
      fetchRoles(roleState.page);
    } else {
      fetchStaff(staffState.page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, roleState.page, staffState.page]);

  // Also fetch roles when search query changes, with a debounce
  useEffect(() => {
    if (activeTab === "roles") {
      const handler = setTimeout(() => {
        fetchRoles(1); // Reset to first page when searching
      }, 300); // 300ms debounce

      return () => clearTimeout(handler);
    } else {
      const handler = setTimeout(() => {
        fetchStaff(1); // Reset to first page when searching
      }, 300); // 300ms debounce

      return () => clearTimeout(handler);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, activeTab]);

  // Fetch staff from API
  const fetchStaff = async (page: number = 1) => {
    setStaffState((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await API.staff.getStaff(
        page,
        staffState.limit,
        searchQuery
      );
      setStaffState({
        staff: response.users.results,
        page: response.users.page,
        limit: response.users.limit,
        totalPages: response.users.totalPages,
        totalResults: response.users.totalResults,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to fetch staff:", error);
      toast.error("Failed to load staff members. Please try again.");
      setStaffState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Fetch roles from API
  const fetchRoles = async (page: number = 1) => {
    setRoleState((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await API.role.getRoles(
        page,
        roleState.limit,
        searchQuery
      );
      setRoleState({
        roles: response.roles.results,
        page: response.roles.page,
        limit: response.roles.limit,
        totalPages: response.roles.totalPages,
        totalResults: response.roles.totalResults,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      toast.error("Failed to load roles. Please try again.");
      setRoleState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleCreateNew = () => {
    if (activeTab === "staff") {
      setIsAddStaffSheetOpen(true);
    } else {
      // Clear editing state when creating a new role
      setEditingRole(null);
      setIsEditingRole(false);
      setIsAddRoleSheetOpen(true);
    }
  };

  const handleAddStaff = async (staffData: CreateStaffPayload) => {
    setIsCreatingStaff(true);

    try {
      const response = await API.staff.createStaff(staffData);

      toast.success(
        `Staff member ${response.firstName} ${response.lastName} created successfully`,
        {
          description: "New staff member has been added to your organization",
        }
      );

      setIsAddStaffSheetOpen(false);

      // Refresh staff list
      fetchStaff(1);
    } catch (error) {
      console.error("Failed to create staff member:", error);
      toast.error("Failed to create staff member. Please try again.");
    } finally {
      setIsCreatingStaff(false);
    }
  };

  const handleAddRole = async (roleData: {
    name: string;
    permissions: string[];
  }) => {
    setIsCreatingRole(true);
    try {
      await API.role.createRole({
        name: roleData.name,
        permissions: roleData.permissions,
      });

      toast.success(`Role "${roleData.name}" created successfully`, {
        description: "New role has been added to your organization",
      });
      setIsAddRoleSheetOpen(false);

      // Refresh roles list
      fetchRoles(1);
    } catch (error) {
      console.error("Failed to create role:", error);
      toast.error("Failed to create role. Please try again.");
    } finally {
      setIsCreatingRole(false);
    }
  };

  // Handle editing a role
  const handleEditRole = (role: RoleResponse) => {
    setEditingRole(role);
    setIsEditingRole(true);
    setIsAddRoleSheetOpen(true);
  };

  // Handle updating a role
  const handleUpdateRole = async (roleData: {
    name: string;
    permissions: string[];
  }) => {
    if (!editingRole) return;

    setIsCreatingRole(true);
    try {
      await API.role.updateRole(editingRole.id, {
        name: roleData.name,
        permissions: roleData.permissions,
      });

      toast.success(`Role "${roleData.name}" updated successfully`);
      setIsAddRoleSheetOpen(false);
      setEditingRole(null);

      // Refresh roles list
      fetchRoles(roleState.page);
    } catch (error) {
      console.error("Failed to update role:", error);
      toast.error("Failed to update role. Please try again.");
    } finally {
      setIsCreatingRole(false);
      setIsEditingRole(false);
    }
  };

  // Handle deleting a role
  const handleDeleteRole = (role: RoleResponse) => {
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  // Confirm role deletion
  const confirmDeleteRole = async () => {
    if (!roleToDelete) return;

    setIsDeleting(true);

    try {
      await API.role.deleteRole(roleToDelete.id);
      toast.success(`Role "${roleToDelete.name}" deleted successfully`);

      // Refresh roles list
      fetchRoles(roleState.page);
    } catch (error) {
      console.error("Failed to delete role:", error);
      toast.error("Failed to delete role. Please try again.");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
    }
  };

  // Handle page change for role pagination
  const handlePageChange = (newPage: number) => {
    setRoleState((prev) => ({ ...prev, page: newPage }));
  };

  // Handle page change for staff pagination
  const handleStaffPageChange = (newPage: number) => {
    setStaffState((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Tabs and Controls */}
        <div className="bg-white rounded-md border border-gray-200 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Tabs */}
            <div className="flex items-center gap-2">
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === "staff"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("staff")}
              >
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Staff
                </span>
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === "roles"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab("roles")}
              >
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Roles
                </span>
              </button>
            </div>

            {/* Search and Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="inline-flex bg-gray-100 rounded-md p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`inline-flex items-center justify-center px-3 py-2 rounded text-sm font-medium transition-all ${
                    viewMode === "grid"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`inline-flex items-center justify-center px-3 py-2 rounded text-sm font-medium transition-all ${
                    viewMode === "list"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Add Button */}
              <Button onClick={handleCreateNew} size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Add {activeTab === "staff" ? "Staff" : "Role"}
              </Button>
            </div>
          </div>
        </div>
        {/* Content Section */}
        <div className="space-y-4">
          {activeTab === "staff" ? (
            <div className="space-y-6">
              {viewMode === "grid" ? (
                <StaffGrid
                  staffMembers={staffState.staff}
                  isLoading={staffState.isLoading}
                  searchQuery={searchQuery}
                  onEdit={(staff: StaffMember) => {
                    setEditingStaff(staff);
                    setIsEditStaffDialogOpen(true);
                  }}
                  onDelete={async (staffId: string) => {
                    try {
                      await API.staff.deleteStaff(staffId);
                      toast.success("Staff member deleted successfully");
                      fetchStaff(staffState.page);
                    } catch (error) {
                      console.error("Failed to delete staff:", error);
                      toast.error("Failed to delete staff member");
                    }
                  }}
                  onResendInvite={async (
                    staffId: string,
                    staffName: string
                  ) => {
                    try {
                      // Generate new password
                      const newPassword =
                        Math.random().toString(36).slice(-12) + "Aa1!";
                      await API.staff.resendInvite(staffId, newPassword);
                      toast.success(`Invitation email resent to ${staffName}`);
                    } catch (error) {
                      console.error("Failed to resend invite:", error);
                      toast.error("Failed to resend invitation");
                    }
                  }}
                />
              ) : (
                <StaffList
                  staffMembers={staffState.staff}
                  isLoading={staffState.isLoading}
                  searchQuery={searchQuery}
                  onEdit={(staff: StaffMember) => {
                    setEditingStaff(staff);
                    setIsEditStaffDialogOpen(true);
                  }}
                  onDelete={async (staffId: string) => {
                    try {
                      await API.staff.deleteStaff(staffId);
                      toast.success("Staff member deleted successfully");
                      fetchStaff(staffState.page);
                    } catch (error) {
                      console.error("Failed to delete staff:", error);
                      toast.error("Failed to delete staff member");
                    }
                  }}
                  onResendInvite={async (
                    staffId: string,
                    staffName: string
                  ) => {
                    try {
                      // Generate new password
                      const newPassword =
                        Math.random().toString(36).slice(-12) + "Aa1!";
                      await API.staff.resendInvite(staffId, newPassword);
                      toast.success(`Invitation email resent to ${staffName}`);
                    } catch (error) {
                      console.error("Failed to resend invite:", error);
                      toast.error("Failed to resend invitation");
                    }
                  }}
                />
              )}

              {/* Mobile Pagination */}
              {staffState.totalPages > 1 && (
                <div className="mt-6">
                  {/* Mobile: Full width pagination */}
                  <div className="block sm:hidden">
                    <div className="flex items-center justify-between mb-3">
                      <Button
                        variant="outline"
                        onClick={() =>
                          handleStaffPageChange(
                            Math.max(1, staffState.page - 1)
                          )
                        }
                        disabled={staffState.page === 1 || staffState.isLoading}
                        className="flex-1 mr-2 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>

                      <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
                        {staffState.page} of {staffState.totalPages}
                      </div>

                      <Button
                        variant="outline"
                        onClick={() =>
                          handleStaffPageChange(
                            Math.min(staffState.totalPages, staffState.page + 1)
                          )
                        }
                        disabled={
                          staffState.page === staffState.totalPages ||
                          staffState.isLoading
                        }
                        className="flex-1 ml-2 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>

                  {/* Desktop: Traditional pagination */}
                  <div className="hidden sm:flex justify-center">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleStaffPageChange(
                            Math.max(1, staffState.page - 1)
                          )
                        }
                        disabled={staffState.page === 1 || staffState.isLoading}
                        className="flex items-center gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>

                      <div className="flex items-center space-x-1">
                        {Array.from(
                          { length: staffState.totalPages },
                          (_, i) => i + 1
                        ).map((pageNum) => (
                          <Button
                            key={pageNum}
                            variant={
                              pageNum === staffState.page
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => handleStaffPageChange(pageNum)}
                            disabled={staffState.isLoading}
                            className={
                              pageNum === staffState.page
                                ? "bg-primary text-white"
                                : ""
                            }
                          >
                            {pageNum}
                          </Button>
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleStaffPageChange(
                            Math.min(staffState.totalPages, staffState.page + 1)
                          )
                        }
                        disabled={
                          staffState.page === staffState.totalPages ||
                          staffState.isLoading
                        }
                        className="flex items-center gap-1"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {viewMode === "grid" ? (
                <RolesGrid
                  roles={roleState.roles}
                  onEdit={handleEditRole}
                  onDelete={handleDeleteRole}
                  isLoading={roleState.isLoading}
                  searchQuery={searchQuery}
                />
              ) : (
                <RolesList
                  roles={roleState.roles}
                  onEdit={handleEditRole}
                  onDelete={handleDeleteRole}
                  isLoading={roleState.isLoading}
                  searchQuery={searchQuery}
                />
              )}

              {/* Mobile Pagination */}
              {roleState.totalPages > 1 && (
                <div className="mt-6">
                  {/* Mobile: Full width pagination */}
                  <div className="block sm:hidden">
                    <div className="flex items-center justify-between mb-3">
                      <Button
                        variant="outline"
                        onClick={() =>
                          handlePageChange(Math.max(1, roleState.page - 1))
                        }
                        disabled={roleState.page === 1 || roleState.isLoading}
                        className="flex-1 mr-2 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>

                      <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
                        {roleState.page} of {roleState.totalPages}
                      </div>

                      <Button
                        variant="outline"
                        onClick={() =>
                          handlePageChange(
                            Math.min(roleState.totalPages, roleState.page + 1)
                          )
                        }
                        disabled={
                          roleState.page === roleState.totalPages ||
                          roleState.isLoading
                        }
                        className="flex-1 ml-2 bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>

                  {/* Desktop: Traditional pagination */}
                  <div className="hidden sm:flex justify-center">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handlePageChange(Math.max(1, roleState.page - 1))
                        }
                        disabled={roleState.page === 1 || roleState.isLoading}
                        className="flex items-center gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>

                      <div className="flex items-center space-x-1">
                        {Array.from(
                          { length: roleState.totalPages },
                          (_, i) => i + 1
                        ).map((pageNum) => (
                          <Button
                            key={pageNum}
                            variant={
                              pageNum === roleState.page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            disabled={roleState.isLoading}
                            className={
                              pageNum === roleState.page
                                ? "bg-primary text-white"
                                : ""
                            }
                          >
                            {pageNum}
                          </Button>
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handlePageChange(
                            Math.min(roleState.totalPages, roleState.page + 1)
                          )
                        }
                        disabled={
                          roleState.page === roleState.totalPages ||
                          roleState.isLoading
                        }
                        className="flex items-center gap-1"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Role Sheet */}
      <AddRoleSheet
        open={isAddRoleSheetOpen}
        onOpenChange={setIsAddRoleSheetOpen}
        onSubmit={isEditingRole ? handleUpdateRole : handleAddRole}
        isCreatingRole={isCreatingRole}
        initialData={
          editingRole && editingRole.name && editingRole.permissions
            ? {
                name: editingRole.name,
                permissions: editingRole.permissions,
              }
            : undefined
        }
        isEditing={isEditingRole}
      />

      {/* Add Staff Sheet */}
      <AddStaffSheet
        open={isAddStaffSheetOpen}
        onOpenChange={setIsAddStaffSheetOpen}
        onSubmit={handleAddStaff}
        isCreatingStaff={isCreatingStaff}
      />

      {/* Edit Staff Dialog */}
      <EditStaffDialog
        open={isEditStaffDialogOpen}
        onOpenChange={setIsEditStaffDialogOpen}
        staff={editingStaff}
        onSuccess={() => {
          toast.success("Staff member updated successfully");
          fetchStaff(staffState.page);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteRoleDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeleteRole}
        roleName={roleToDelete?.name}
        isDeleting={isDeleting}
      />
    </div>
  );
}
