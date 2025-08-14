import { get, post } from "../apiHelper";

export const getInterviewSchedule = async (token: string) => {
  return get(`/interview/schedule?token=${token}`);
};

export const confirmInterviewSchedule = async (payload: any, token: string) => {
  return post(`/interview/schedule/confirm?token=${token}`, payload);
};
