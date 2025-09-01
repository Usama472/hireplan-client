import { del, get, post, put } from "../apiHelper";

// Type for creating a new role
export interface CreateRolePayload {
  name: string;
  permissions: string[];
}

// Types for user in role response
export interface RoleUser {
  firstName: string;
  lastName: string;
  email: string;
  id: string;
}

// Type for role response from API
export interface RoleResponse {
  id: string;
  name: string;
  permissions: string[];
  user: RoleUser;
  company: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Paginated roles response
export interface PaginatedRolesResponse {
  status: boolean;
  roles: {
    results: RoleResponse[];
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
  };
}

/**
 * Create a new role
 * @param data - Role data containing name and permissions
 * @returns Promise with the created role
 */
export const createRole = async (
  data: CreateRolePayload
): Promise<RoleResponse> => {
  return await post("/roles", data);
};

/**
 * Get paginated roles
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 * @param name - Search query for role name (optional)
 * @returns Promise with paginated roles data
 */
export const getRoles = async (
  page: number = 1,
  limit: number = 10,
  name?: string
): Promise<PaginatedRolesResponse> => {
  const params: Record<string, any> = { page, limit };
  if (name && name.trim()) {
    params.name = name.trim();
  }
  return await get("/roles", { params });
};

/**
 * Get a specific role by ID
 * @param id - Role ID
 * @returns Promise with the role details
 */
export const getRole = async (id: string): Promise<RoleResponse> => {
  const response = await get(`/roles/${id}`);
  return response.data;
};

/**
 * Update an existing role
 * @param id - Role ID to update
 * @param data - Updated role data
 * @returns Promise with the updated role
 */
export const updateRole = async (
  id: string,
  data: Partial<CreateRolePayload>
): Promise<RoleResponse> => {
  return await put(`/roles/${id}`, data);
};

/**
 * Delete a role
 * @param id - Role ID to delete
 * @returns Promise with deletion status
 */
export const deleteRole = async (id: string): Promise<{ success: boolean }> => {
  return await del(`/roles/${id}`);
};

/**
 * Get all roles without pagination
 * @returns Promise with all roles
 */
export const getAllRoles = async (): Promise<{ roles: RoleResponse[] }> => {
  return await get("/roles/all");
};
