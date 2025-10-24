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
    localStorage.removeItem('cachedUserProfile'); // Clear cached profile on logout
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
  
  // Try to get cached profile for instant render
  const cachedProfile = localStorage.getItem('cachedUserProfile');
  let profile;
  
  try {
    const response = await API.user.getProfile();
    profile = response.user;
    // Cache the profile for next time
    localStorage.setItem('cachedUserProfile', JSON.stringify(profile));
  } catch (err: unknown) {
    console.error(err);
    // If API call fails but we have cached data, use it
    if (cachedProfile) {
      try {
        profile = JSON.parse(cachedProfile);
      } catch {
        return null;
      }
    } else {
      return null;
    }
  }
  
  if (!profile) return null;
  if (profile) {
    if (shouldBroadcast) {
      AuthBroadcastChannel().postMessage({
        event: "session",
        data: { trigger: "getSession" },
      });
    }
  }
  return {
    user: profile,
    accessToken: accessToken,
  };
};
