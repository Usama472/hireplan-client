import { clientAccessToken } from "@/constants";
import { AuthBroadcastChannel } from "@/lib/AuthBroadcastChannel";
import API from "..";

interface Params {
  shouldBroadcast?: boolean;
  accessToken?: string | null;
}
export interface UserSession {
  exp: number;
  iat: number;
  email: string;
  accessToken: string;
  role: string;
  sub: string;
}

export const mutateSession = async ({
  shouldBroadcast,
  accessToken,
}: Params) => {
  if (accessToken) {
    localStorage.setItem(clientAccessToken, accessToken);
  } else {
    localStorage.removeItem(clientAccessToken);
  }
  if (shouldBroadcast) {
    AuthBroadcastChannel().postMessage({
      event: "session",
      data: { trigger: "mutateSession" },
    });
  }
};

export const getSession = async ({ shouldBroadcast }: Params) => {
  const accessToken = localStorage.getItem(clientAccessToken);
  if (!accessToken || typeof accessToken === "boolean") return null;
  let profile;
  try {
    const response = await API.user.getProfile();
    profile = response.user;
  } catch (err: unknown) {
    console.error(err);
    return null;
  }
  if (!profile) return null;
  if (profile)
    if (shouldBroadcast) {
      AuthBroadcastChannel().postMessage({
        event: "session",
        data: { trigger: "getSession" },
      });
    }
  return {
    user: profile,
    accessToken: accessToken,
  };
};
