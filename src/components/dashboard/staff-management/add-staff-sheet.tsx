import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import API from "@/http";
import {
  Briefcase,
  Building2,
  Lock,
  Mail,
  Shield,
  UserPlus,
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface StaffFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  appRole: string;
  jobCategory: string;
  companyRole: string;
}

interface Role {
  id: string;
  name: string;
}

interface AddStaffSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isCreatingStaff?: boolean;
  onSubmit?: (staffData: StaffFormData) => void;
}

export default function AddStaffSheet({
  open,
  onOpenChange,
  onSubmit,
  isCreatingStaff = false,
}: AddStaffSheetProps) {
  const [staffData, setStaffData] = useState<StaffFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    appRole: "",
    jobCategory: "",
    companyRole: "",
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [errors, setErrors] = useState<Partial<StaffFormData>>({});

  // Fetch all roles when the sheet opens
  useEffect(() => {
    if (open) {
      fetchRoles();
    }
  }, [open]);

  const fetchRoles = async () => {
    setIsLoadingRoles(true);
    try {
      const response = await API.role.getAllRoles();
      setRoles(response.roles);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const handleInputChange = (field: keyof StaffFormData, value: string) => {
    setStaffData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when field is updated
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<StaffFormData> = {};

    if (!staffData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!staffData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!staffData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(staffData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!staffData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (staffData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!staffData.appRole) {
      newErrors.appRole = "Role is required";
    }

    if (!staffData.jobCategory) {
      newErrors.jobCategory = "Job category is required";
    }

    if (!staffData.companyRole) {
      newErrors.companyRole = "Company role is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (onSubmit) {
      onSubmit(staffData);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg overflow-y-auto border-l border-gray-100 px-4 sm:px-6">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <SheetHeader className="space-y-2 text-left pb-4 mb-4 border-b">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 bg-primary/10 rounded-lg flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
              <SheetTitle className="text-xl font-semibold">
                Add New Staff Member
              </SheetTitle>
            </div>
            <SheetDescription className="text-sm text-gray-500">
              Create a new staff member and assign them a role in your
              organization.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-6 overflow-y-auto pr-1">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">
                Personal Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="firstName"
                      value={staffData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      className={`${
                        errors.firstName
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-200"
                      }`}
                      placeholder="Enter first name"
                      disabled={isCreatingStaff}
                    />
                    {errors.firstName && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={staffData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    className={`${
                      errors.lastName
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-200"
                    }`}
                    placeholder="Enter last name"
                    disabled={isCreatingStaff}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Account Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">
                Account Information
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm flex items-center gap-1"
                  >
                    <Mail className="h-3.5 w-3.5 text-gray-500" />
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={staffData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`${
                      errors.email
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-200"
                    }`}
                    placeholder="name@example.com"
                    disabled={isCreatingStaff}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm flex items-center gap-1"
                  >
                    <Lock className="h-3.5 w-3.5 text-gray-500" />
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={staffData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className={`${
                      errors.password
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-200"
                    }`}
                    placeholder="Create a password"
                    disabled={isCreatingStaff}
                  />
                  {errors.password && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.password}
                    </p>
                  )}
                  {!errors.password && staffData.password && (
                    <p className="text-xs text-gray-500 mt-1">
                      Password should be at least 8 characters
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Role & Position Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">
                Role & Position
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="appRole"
                    className="text-sm flex items-center gap-1"
                  >
                    <Shield className="h-3.5 w-3.5 text-gray-500" />
                    Application Role <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={staffData.appRole}
                    onValueChange={(value) =>
                      handleInputChange("appRole", value)
                    }
                    disabled={isCreatingStaff || isLoadingRoles}
                  >
                    <SelectTrigger
                      className={`${
                        errors.appRole
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-200"
                      }`}
                    >
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingRoles ? (
                        <SelectItem value="loading" disabled>
                          Loading roles...
                        </SelectItem>
                      ) : roles.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No roles available
                        </SelectItem>
                      ) : (
                        roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {errors.appRole && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.appRole}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="jobCategory"
                    className="text-sm flex items-center gap-1"
                  >
                    <Briefcase className="h-3.5 w-3.5 text-gray-500" />
                    Job Category <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="jobCategory"
                      value={staffData.jobCategory}
                      onChange={(e) =>
                        handleInputChange("jobCategory", e.target.value)
                      }
                      className={`pl-10 ${
                        errors.jobCategory
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-200"
                      }`}
                      placeholder="Enter job category"
                      disabled={isCreatingStaff}
                    />
                    {errors.jobCategory && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.jobCategory}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="companyRole"
                    className="text-sm flex items-center gap-1"
                  >
                    <Building2 className="h-3.5 w-3.5 text-gray-500" />
                    Company Role <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="companyRole"
                      value={staffData.companyRole}
                      onChange={(e) =>
                        handleInputChange("companyRole", e.target.value)
                      }
                      className={`pl-10 ${
                        errors.companyRole
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-200"
                      }`}
                      placeholder="Enter company role"
                      disabled={isCreatingStaff}
                    />
                    {errors.companyRole && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.companyRole}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <SheetFooter className="pt-4 border-t mt-6 flex justify-end">
            <Button
              type="submit"
              variant="secondary"
              disabled={isCreatingStaff}
            >
              <UserPlus className="h-4 w-4" />
              {isCreatingStaff ? "Creating Staff..." : "Create Staff Member"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
