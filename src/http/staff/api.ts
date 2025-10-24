import { get, post, put, del } from "../apiHelper";

export interface CreateStaffPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  appRole: string; // Role ID
  jobCategory: string;
  companyRole: string;
}

export interface StaffResponse {
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

export interface PaginatedStaffResponse {
  status: boolean;
  users: {
    results: StaffResponse[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
  };
}

/**
 * Create a new staff member
 * @param data - Staff data containing required fields
 * @returns Promise with the created staff member
 */
export const createStaff = async (
  data: CreateStaffPayload
): Promise<StaffResponse> => {
  return await post("/users/staff", data);
};

/**
 * Get all staff members with pagination
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 20)
 * @param name - Search query for staff name (optional)
 * @returns Promise with paginated staff data
 */
export const getStaff = async (
  page: number = 1,
  limit: number = 20,
  name?: string
): Promise<PaginatedStaffResponse> => {
  const params: Record<string, any> = { page, limit };

  if (name && name.trim()) {
    params.name = name.trim();
  }

  return await get("/users/staff", { params });
};

/**
 * Update a staff member
 * @param staffId - Staff member ID
 * @param updates - Fields to update
 * @returns Promise with updated staff member
 */
export const updateStaff = async (
  staffId: string,
  updates: Partial<CreateStaffPayload>
): Promise<{ status: boolean; user: StaffResponse }> => {
  return await put(`/users/staff/${staffId}`, updates);
};

/**
 * Delete a staff member
 * @param staffId - Staff member ID
 * @returns Promise with deletion result
 */
export const deleteStaff = async (
  staffId: string
): Promise<{ status: boolean; message: string }> => {
  return await del(`/users/staff/${staffId}`);
};

/**
 * Resend invitation email to a staff member
 * @param staffId - Staff member ID
 * @param password - New temporary password (optional)
 * @returns Promise with result
 */
export const resendInvite = async (
  staffId: string,
  password?: string
): Promise<{ status: boolean; message: string }> => {
  return await post(`/users/staff/${staffId}/resend-invite`, { password });
};
