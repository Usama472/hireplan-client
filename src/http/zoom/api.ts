import { get, post, del } from "../apiHelper";

export const getZoomAuthUrl = async () => {
  return get("/zoom/auth-url");
};

export const zoomAuthCallback = (code: string) =>
  post("/zoom/oauth/callback", { code });

export const disconnectZoom = () => del("/zoom/disconnect");

export const getZoomConnectionStatus = () => get("/zoom/status");
