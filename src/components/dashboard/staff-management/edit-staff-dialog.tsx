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
import { Save, UserCog } from "lucide-react";
import React, { useEffect, useState } from "react";
import type { StaffMember } from "./types";

interface EditStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: StaffMember | null;
  onSuccess: () => void;
}

interface RoleWithDetails {
  id: string;
  name: string;
}

export default function EditStaffDialog({
  open,
  onOpenChange,
  staff,
  onSuccess,
}: EditStaffDialogProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    appRole: "",
  });
  const [roles, setRoles] = useState<RoleWithDetails[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errors, setErrors] = useState<any>({});

  // Load staff data when dialog opens
  useEffect(() => {
    if (open && staff) {
      setFormData({
        firstName: staff.firstName,
        lastName: staff.lastName,
        email: staff.email,
        appRole: staff.appRole?.id || "",
      });
      fetchRoles();
    }
  }, [open, staff]);

  const fetchRoles = async () => {
    setIsLoadingRoles(true);
    try {
      const response = await API.role.getAllRoles();
      setRoles(response.roles || []);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      setRoles([]);
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev: any) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: any = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.appRole) newErrors.appRole = "Please select a role";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !staff) {
      return;
    }

    setIsUpdating(true);
    try {
      await API.staff.updateStaff(staff.id, formData);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update staff:", error);
      setErrors({ general: "Failed to update staff member" });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!staff) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <UserCog className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">Edit Staff Member</DialogTitle>
              <DialogDescription className="text-base text-gray-600">
                Update staff member information and role
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {errors.general}
            </div>
          )}

          <div className="space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-base font-medium">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className={errors.firstName ? "border-red-500 h-11 text-base" : "h-11 text-base"}
                  disabled={isUpdating}
                />
                {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-base font-medium">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className={errors.lastName ? "border-red-500 h-11 text-base" : "h-11 text-base"}
                  disabled={isUpdating}
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
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={errors.email ? "border-red-500 h-11 text-base" : "h-11 text-base"}
                disabled={isUpdating}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="appRole" className="text-base font-medium">Select Role *</Label>
              <Select
                value={formData.appRole}
                onValueChange={(value) => handleInputChange("appRole", value)}
                disabled={isUpdating || isLoadingRoles}
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
          </div>

          <DialogFooter className="mt-8 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
              className="h-11 text-base"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdating}
              className="h-11 text-base bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isUpdating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

