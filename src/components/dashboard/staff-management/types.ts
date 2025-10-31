// Staff member interface
export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyRole: string;
  jobCategory: string;
  role: string;
  status: string;
  appRole: {
    id: string;
    name: string;
  };
}

// Role interface
export interface Role {
  id: string;
  name: string;
  permissions: string[];
  description?: string;
}

export interface StaffListState {
  staff: StaffMember[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
  isLoading: boolean;
}

export interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  roleName?: string;
  isDeleting: boolean;
}

// Props for staff grid component
export interface StaffGridProps {
  staffMembers: StaffMember[];
  isLoading?: boolean;
  searchQuery?: string;
  onEdit?: (staff: StaffMember) => void;
  onDelete?: (staffId: string) => void;
  onResendInvite?: (staffId: string, staffName: string) => void;
}

// Props for staff list component
export interface StaffListProps {
  staffMembers: StaffMember[];
  isLoading?: boolean;
  searchQuery?: string;
  onEdit?: (staff: StaffMember) => void;
  onDelete?: (staffId: string) => void;
  onResendInvite?: (staffId: string, staffName: string) => void;
}

// Props for roles grid component
export interface RolesGridProps {
  roles: Role[];
}

// Props for roles list component
export interface RolesListProps {
  roles: Role[];
}
