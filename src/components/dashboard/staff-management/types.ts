// Staff member interface
export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

// Role interface
export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export interface RoleListState {
  roles: any[]; // Use any[] for generic role array
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
}

// Props for staff list component
export interface StaffListProps {
  staffMembers: StaffMember[];
}

// Props for roles grid component
export interface RolesGridProps {
  roles: Role[];
}

// Props for roles list component
export interface RolesListProps {
  roles: Role[];
}
