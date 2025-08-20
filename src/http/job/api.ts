import type { JobFormData } from "@/interfaces";
import { del, get, post, put } from "../apiHelper";

// Helper function to sanitize job data before sending to backend
const sanitizeJobData = (job: JobFormData): Partial<JobFormData> => {
  // Create a copy of the job data
  const sanitizedJob = { ...job };

  // Remove fields not supported by the backend
  // Using delete operator to remove properties
  delete sanitizedJob.hasConsistentStartingLocation;
  delete sanitizedJob.operatingArea;

  // Remove legacy fields that might be present in older forms
  // Using type assertion to handle potential fields
  const jobAny = sanitizedJob as any;
  if ("bookingPageId" in jobAny) {
    delete jobAny.bookingPageId;
  }

  return sanitizedJob;
};

export const createJob = async (job: JobFormData) => {
  const sanitizedData = sanitizeJobData(job);
  return post("/jobs", sanitizedData);
};

export const updateJob = async (jobId: string, job: JobFormData) => {
  const sanitizedData = sanitizeJobData(job);
  return put(`/jobs/${jobId}`, sanitizedData);
};

export const getJobs = async ({
  page,
  limit,
  searchQuery,
}: {
  page: number;
  limit: number;
  searchQuery?: string;
}) => get("/jobs", { page, limit, searchQuery });

export const getJobDetails = async (jobId: string) => get(`/jobs/${jobId}`);
export const getPublicJobDetails = async (jobId: string) =>
  get(`/jobs/p/${jobId}`);

export const deleteJob = async (jobId: string) => del(`/jobs/${jobId}`);
