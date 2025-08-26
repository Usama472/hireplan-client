import { get, post, put, del } from "../apiHelper";
import type { JobTemplate, CreateJobTemplateData, JobTemplateFilters } from "@/types/job-template";

// Re-export types for convenience
export type { JobTemplate, CreateJobTemplateData, JobTemplateFilters };

// Get all job templates
export const getJobTemplates = async (filters?: JobTemplateFilters) => {
  return get("/job-templates", filters || {});
};

// Get a single job template
export const getJobTemplate = async (templateId: string) => {
  return get(`/job-templates/${templateId}`);
};

// Create a job template
export const createJobTemplate = async (templateData: CreateJobTemplateData) => {
  return post("/job-templates", templateData);
};

// Update a job template
export const updateJobTemplate = async (templateId: string, updateData: Partial<CreateJobTemplateData>) => {
  return put(`/job-templates/${templateId}`, updateData);
};

// Delete a job template
export const deleteJobTemplate = async (templateId: string) => {
  return del(`/job-templates/${templateId}`);
};

// Duplicate a job template
export const duplicateJobTemplate = async (templateId: string, newName?: string) => {
  return post(`/job-templates/${templateId}/duplicate`, { name: newName });
};

// Get popular job templates
export const getPopularJobTemplates = async (limit?: number) => {
  const params = limit ? { limit } : {};
  return get("/job-templates/popular", params);
};

// Increment template usage
export const incrementTemplateUsage = async (templateId: string) => {
  return post(`/job-templates/${templateId}/use`, {});
};