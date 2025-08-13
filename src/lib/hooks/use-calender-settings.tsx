import { useEffect, useState } from "react";

import API from "@/http";
import useAuthSessionContext from "../context/AuthSessionContext";

const useCalenderSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { data, updateUser } = useAuthSessionContext();
  const [isMeetingPlatformConnected, setIsMeetingPlatformConnected] =
    useState(false);
  const [meetingPlatform, setMeetingPlatform] = useState<
    "google" | "outlook" | ""
  >("");
  const [platformSettings, setPlatformSettings] = useState<{
    [key: string]: string;
  }>({});

  const fetchCalendarSettings = () => {
    setIsLoading(true);
    API.user
      .getCalenderSettings()
      .then((res) => {
        setIsMeetingPlatformConnected(res.isMeetingPlatformConnected);
        setMeetingPlatform(res.meetingPlatform);
        setPlatformSettings(res.platformSettings);

        if (updateUser) {
          const latestUser = {
            ...data?.user,
            preferredMeetingPlatform: res.meetingPlatform,
          };
          if (res.meetingPlatform === "google") {
            latestUser.googleTokens = res.platformSettings;
          }
          updateUser(latestUser);
        }
      })
      .catch(() => {
        setIsMeetingPlatformConnected(false);
        setMeetingPlatform("");
        setPlatformSettings({});
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchCalendarSettings();
  }, []);

  return {
    isMeetingPlatformConnected,
    meetingPlatform,
    platformSettings,
    isLoading,
    refresh: fetchCalendarSettings,
  };
};

export default useCalenderSettings;
