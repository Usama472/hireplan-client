import { del, get, post, put } from "../apiHelper";

export const createJobDraft = async (draftData: any) => {
  return post("/job-drafts", draftData);
};

export const getJobDrafts = async () => {
  return get("/job-drafts");
};

export const getJobDraft = async (draftId: string) => {
  return get(`/job-drafts/${draftId}`);
};

export const updateJobDraft = async (draftId: string, draftData: any) => {
  return put(`/job-drafts/${draftId}`, draftData);
};

export const deleteJobDraft = async (draftId: string) => {
  return del(`/job-drafts/${draftId}`);
};

export const getDraftStats = async () => {
  return get("/job-drafts/stats");
};
