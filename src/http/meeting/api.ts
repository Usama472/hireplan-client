import { get } from "../apiHelper";

export const getMeetingSettings = () => get("/users/meeting-settings");
