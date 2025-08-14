import { get, post } from "../apiHelper";

export const getInterviewSchedule = async (token: string) => {
  return get(`/interview/schedule?token=${token}`);
};

export const confirmInterviewSchedule = async (payload: any, token: string) => {
  return post(`/interview/schedule/confirm?token=${token}`, payload);
};

export const getInterviews = async ({
  page,
  limit,
}: {
  page: number;
  limit: number;
}) => {
  return get(`/interview?page=${page}&limit=${limit}`);
};
