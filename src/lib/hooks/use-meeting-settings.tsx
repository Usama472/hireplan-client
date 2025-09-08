import { useEffect, useState } from "react";

import API from "@/http";
import useAuthSessionContext from "../context/AuthSessionContext";

interface MeetingConnections {
  google: boolean;
  microsoft: boolean;
  zoom: boolean;
}

const useMeetingSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { data, updateUser } = useAuthSessionContext();
  const [connections, setConnections] = useState<MeetingConnections>({
    google: false,
    microsoft: false,
    zoom: false,
  });
  const [preferredPlatform, setPreferredPlatform] = useState<string>("");
  const [platformSettings, setPlatformSettings] = useState<any>(null);

  const fetchMeetingSettings = () => {
    setIsLoading(true);
    API.meeting
      .getMeetingSettings()
      .then((res) => {
        setConnections(res.connections || {
          google: false,
          microsoft: false,
          zoom: false,
        });
        setPreferredPlatform(res.preferredMeetingPlatform || "");
        setPlatformSettings(res);

        if (updateUser) {
          const latestUser = {
            ...data?.user,
            preferredMeetingPlatform: res.preferredMeetingPlatform,
            googleTokens: res.platforms?.google || data?.user?.googleTokens,
            microsoftTokens: res.platforms?.microsoft || data?.user?.microsoftTokens,
            zoomTokens: res.platforms?.zoom || data?.user?.zoomTokens,
          };
          
          updateUser(latestUser);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch meeting settings:", error);
        setConnections({
          google: false,
          microsoft: false,
          zoom: false,
        });
        setPreferredPlatform("");
        setPlatformSettings(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchMeetingSettings();
  }, []);

  return {
    connections,
    preferredPlatform,
    platformSettings,
    isLoading,
    refresh: fetchMeetingSettings,
  };
};

export default useMeetingSettings;
