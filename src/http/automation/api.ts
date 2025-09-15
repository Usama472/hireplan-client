import { del, get, post, put } from "../apiHelper";

export const createAutomation = async (automationData: any) => {
  return await post(`/automations`, automationData);
};

export const getAutomations = async () => {
  return await get(`/automations?page=1&limit=100`);
};

export const getAutomationById = async (id: string) => {
  return await get(`/automations/${id}`);
};

export const updateAutomation = async (id: string, automationData: any) => {
  return await put(`/automations/${id}`, automationData);
};

export const deleteAutomation = async (id: string) => {
  return await del(`/automations/${id}`);
};
