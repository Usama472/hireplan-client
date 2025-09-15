import { del, get, patch, post } from "../apiHelper";

export const createAutomation = async (automationData: any) => {
  return await post(`/automations`, automationData);
};

export const getAutomations = async () => {
  return await get(`/automations`);
};

export const getAutomationById = async (id: string) => {
  return await get(`/automations/${id}`);
};

export const updateAutomation = async (id: string, automationData: any) => {
  return await patch(`/automations/${id}`, automationData);
};

export const deleteAutomation = async (id: string) => {
  return await del(`/automations/${id}`);
};
