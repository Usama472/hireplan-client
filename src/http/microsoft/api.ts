import { get, post, del } from "../apiHelper";

export const getMicrosoftAuthUrl = async () => {
  return get("/microsoft/auth-url");
};

export const connectMicrosoftCalendar = async (code: string) => {
  return post("/microsoft/callback", { code });
};

export const disconnectMicrosoftCalendar = async () => {
  return del("/microsoft/disconnect");
};
