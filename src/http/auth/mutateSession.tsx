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
  const { mobileSessionManager } = await import('@/utils/mobile-session-manager');
  
  try {
    if (accessToken) {
      // Use enhanced mobile session manager
      const user = await getUserProfile(accessToken);
      const success = await mobileSessionManager.setSession({ accessToken, user });
      
      if (!success) {
        throw new Error('Failed to store session data');
      }
      
      // Legacy storage for compatibility
      localStorage.setItem(clientAccessToken, accessToken);
      localStorage.setItem('cachedUserProfile', JSON.stringify(user));
      
    } else {
      // Clear session using mobile manager
      mobileSessionManager.clearSession();
      
      // Legacy cleanup
      localStorage.removeItem(clientAccessToken);
      localStorage.removeItem('cachedUserProfile');
    }
    
    if (shouldBroadcast) {
      AuthBroadcastChannel().postMessage({
        event: "session",
        data: { trigger: "mutateSession" },
      });
    }
  } catch (error) {
    console.error('⚠️ Session mutation error:', error);
    
    // Fallback to legacy method
    if (accessToken) {
      localStorage.setItem(clientAccessToken, accessToken);
    } else {
      localStorage.removeItem(clientAccessToken);
      localStorage.removeItem('cachedUserProfile');
    }
    
    // Still broadcast the change
    if (shouldBroadcast) {
      AuthBroadcastChannel().postMessage({
        event: "session",
        data: { trigger: "mutateSession" },
      });
    }
  }
};

// Helper to get user profile
async function getUserProfile(accessToken: string): Promise<any> {
  try {
    const response = await API.user.getProfile();
    return response.user;
  } catch (error) {
    console.warn('Failed to fetch user profile, using cached data');
    const cached = localStorage.getItem('cachedUserProfile');
    return cached ? JSON.parse(cached) : null;
  }
}

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
