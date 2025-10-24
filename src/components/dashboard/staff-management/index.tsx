"use client";

import { Button } from "@/components/ui/button";
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
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SearchBar } from "../jobs/search-bar";
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery("");
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
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-none">
        {/* Mobile Header */}
        <div className="block lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    Staff Management
                  </h1>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Manage staff & roles
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold text-gray-900 mb-1">
              Staff Management
            </h1>
            <p className="text-gray-600 text-sm">
              Manage your staff members and role permissions
            </p>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="block lg:hidden px-4 py-3 bg-white border-b border-gray-100">
          {/* Tab Pills */}
          <div className="flex items-center gap-2 mb-3 overflow-x-auto scrollbar-hide">
            <button
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === "staff"
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
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
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === "roles"
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
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

          {/* Mobile Actions */}
          <div className="flex flex-col space-y-3">
            {/* Search Bar */}
            <div className="w-full">
              <SearchBar
                searchQuery={searchQuery}
                onSearch={handleSearch}
                placeholder={`Search ${activeTab}...`}
                onClear={clearSearch}
              />
            </div>

            {/* View Mode & Add Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={`${
                    viewMode === "grid"
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : ""
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={`${
                    viewMode === "list"
                      ? "bg-blue-50 border-blue-200 text-blue-700"
                      : ""
                  }`}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <Button
                onClick={handleCreateNew}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl px-4 py-2 font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add {activeTab === "staff" ? "Staff" : "Role"}
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:block px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="border-b border-gray-200 flex space-x-8">
                <button
                  className={`pb-3 transition-colors ${
                    activeTab === "staff"
                      ? "border-b-2 border-blue-600 text-blue-600 font-medium"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("staff")}
                >
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="text-base">Staff</span>
                  </span>
                </button>
                <button
                  className={`pb-3 transition-colors ${
                    activeTab === "roles"
                      ? "border-b-2 border-blue-600 text-blue-600 font-medium"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("roles")}
                >
                  <span className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span className="text-base">Roles</span>
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-gray-100" : ""}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-gray-100" : ""}
              >
                <List className="h-4 w-4" />
              </Button>
              <SearchBar
                searchQuery={searchQuery}
                onSearch={handleSearch}
                placeholder={`Search ${activeTab}...`}
                onClear={clearSearch}
              />
              <Button
                onClick={handleCreateNew}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-lg hover:shadow-xl hover:shadow-blue-600/25 transition-all duration-300"
              >
                <Plus className="h-4 w-4" />
                <span>Add {activeTab === "staff" ? "Staff" : "Role"}</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="px-4 lg:px-6 py-4 lg:py-6">
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
                        toast.success('Staff member deleted successfully');
                        fetchStaff(staffState.page);
                      } catch (error) {
                        console.error('Failed to delete staff:', error);
                        toast.error('Failed to delete staff member');
                      }
                    }}
                    onResendInvite={async (staffId: string, staffName: string) => {
                      try {
                        // Generate new password
                        const newPassword = Math.random().toString(36).slice(-12) + 'Aa1!';
                        await API.staff.resendInvite(staffId, newPassword);
                        toast.success(`Invitation email resent to ${staffName}`);
                      } catch (error) {
                        console.error('Failed to resend invite:', error);
                        toast.error('Failed to resend invitation');
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
                        toast.success('Staff member deleted successfully');
                        fetchStaff(staffState.page);
                      } catch (error) {
                        console.error('Failed to delete staff:', error);
                        toast.error('Failed to delete staff member');
                      }
                    }}
                    onResendInvite={async (staffId: string, staffName: string) => {
                      try {
                        // Generate new password
                        const newPassword = Math.random().toString(36).slice(-12) + 'Aa1!';
                        await API.staff.resendInvite(staffId, newPassword);
                        toast.success(`Invitation email resent to ${staffName}`);
                      } catch (error) {
                        console.error('Failed to resend invite:', error);
                        toast.error('Failed to resend invitation');
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
                          disabled={
                            staffState.page === 1 || staffState.isLoading
                          }
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
                              Math.min(
                                staffState.totalPages,
                                staffState.page + 1
                              )
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
                          disabled={
                            staffState.page === 1 || staffState.isLoading
                          }
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
                              Math.min(
                                staffState.totalPages,
                                staffState.page + 1
                              )
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
                                pageNum === roleState.page
                                  ? "default"
                                  : "outline"
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
      </div>

      {/* Add/Edit Role Sheet */}
      <AddRoleSheet
        open={isAddRoleSheetOpen}
        onOpenChange={setIsAddRoleSheetOpen}
        onSubmit={isEditingRole ? handleUpdateRole : handleAddRole}
        isCreatingRole={isCreatingRole}
        initialData={
          editingRole
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
          toast.success('Staff member updated successfully');
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
