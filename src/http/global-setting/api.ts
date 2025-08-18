import { del, get, post, put } from "../apiHelper";

// Create a new global setting
export const createGlobalSetting = async (data: any) =>
  post("/global-settings", data);

// Update an existing global setting by ID
export const updateGlobalSetting = async (data: any) =>
  put(`/global-settings`, data);

// Get a list of global settings (optionally paginated)
export const getGlobalSettings = async ({
  page,
  limit,
  searchQuery,
}: {
  page?: number;
  limit?: number;
  searchQuery?: string;
} = {}) => get("/global-settings", { page, limit, searchQuery });

// Get a single global setting by ID
export const getGlobalSetting = async (id: string) =>
  get(`/global-settings/${id}`);

// Delete a global setting by ID
export const deleteGlobalSetting = async (id: string) =>
  del(`/global-settings/${id}`);
