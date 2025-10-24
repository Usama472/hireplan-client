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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import API from "@/http";
import { UserPlus } from "lucide-react";
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

interface RoleWithDetails {
  id: string;
  name: string;
  permissions?: string[];
  isDefault?: boolean;
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
  const [roles, setRoles] = useState<RoleWithDetails[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [errors, setErrors] = useState<Partial<StaffFormData>>({});

  // Fetch all roles when the sheet opens
  useEffect(() => {
    if (open) {
      fetchRoles();
      // Auto-generate password
      setStaffData(prev => ({
        ...prev,
        password: generatePassword(),
      }));
    }
  }, [open]);

  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const fetchRoles = async () => {
    setIsLoadingRoles(true);
    try {
      const response = await API.role.getAllRoles();
      setRoles(response.roles || []);
      console.log('Fetched roles:', response.roles);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      setRoles([]);
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

    if (!staffData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!staffData.lastName.trim()) newErrors.lastName = "Last name is required";
    
    if (!staffData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(staffData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!staffData.appRole) newErrors.appRole = "Please select a role";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (onSubmit) {
      // Auto-fill required backend fields
      onSubmit({
        ...staffData,
        jobCategory: staffData.jobCategory || 'Staff Member',
        companyRole: staffData.companyRole || 'Team Member',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">Invite Staff Member</DialogTitle>
                <DialogDescription className="text-base text-gray-600">
                  Send an invitation email with login credentials
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Simplified Form - Only Essential Fields */}
          <div className="space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-base font-medium">First Name *</Label>
                <Input
                  id="firstName"
                  value={staffData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className={errors.firstName ? "border-red-500 h-11 text-base" : "h-11 text-base"}
                  placeholder="John"
                  disabled={isCreatingStaff}
                />
                {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-base font-medium">Last Name *</Label>
                <Input
                  id="lastName"
                  value={staffData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className={errors.lastName ? "border-red-500 h-11 text-base" : "h-11 text-base"}
                  placeholder="Doe"
                  disabled={isCreatingStaff}
                />
                {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-medium">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={staffData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={errors.email ? "border-red-500 h-11 text-base" : "h-11 text-base"}
                placeholder="john.doe@company.com"
                disabled={isCreatingStaff}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="appRole" className="text-base font-medium">Select Role *</Label>
              <Select
                value={staffData.appRole}
                onValueChange={(value) => handleInputChange("appRole", value)}
                disabled={isCreatingStaff || isLoadingRoles}
              >
                <SelectTrigger className={errors.appRole ? "border-red-500 h-11 text-base" : "h-11 text-base"}>
                  <SelectValue placeholder="Choose a role..." />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingRoles ? (
                    <SelectItem value="loading" disabled>Loading roles...</SelectItem>
                  ) : roles.length === 0 ? (
                    <SelectItem value="none" disabled>No roles found</SelectItem>
                  ) : (
                    roles.map((role) => (
                      <SelectItem key={role.id} value={role.id} className="text-base">
                        {role.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.appRole && <p className="text-xs text-red-500">{errors.appRole}</p>}
            </div>

            {/* Password Display */}
            <div className="space-y-2">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-base font-semibold text-gray-900">Temporary Password</Label>
                  <button
                    type="button"
                    onClick={() => setStaffData(prev => ({ ...prev, password: generatePassword() }))}
                    className="text-sm text-blue-600 hover:text-blue-700 font-semibold underline"
                  >
                    Regenerate
                  </button>
                </div>
                <code className="text-base bg-white px-4 py-3 rounded-lg border border-blue-300 block font-mono font-bold">
                  {staffData.password}
                </code>
                <p className="text-sm text-gray-700 mt-3">
                  ✉️ This will be emailed to the staff member
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-8 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreatingStaff}
              className="h-11 text-base"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreatingStaff}
              className="h-11 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isCreatingStaff ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Sending Invitation...
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
