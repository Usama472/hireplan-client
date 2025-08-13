import { get } from "../apiHelper";

export const getGoogleAuth = () => get(`/google/auth/url`);

export const googleAuthCallback = (code: string) =>
  get(`/google/auth/callback?code=${code}`);
