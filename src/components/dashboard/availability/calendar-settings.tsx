"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import API from "@/http";
import useCalenderSettings from "@/lib/hooks/use-calender-settings";
import { useToast } from "@/lib/hooks/use-toast";
import { CheckCircle, RefreshCw } from "lucide-react";
import { useState } from "react";

interface CalendarSettingsProps {
  className?: string;
}

export function CalendarSettings({ className }: CalendarSettingsProps) {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const { isMeetingPlatformConnected, platformSettings, isLoading, refresh } =
    useCalenderSettings();
  const isConnected = isMeetingPlatformConnected;

  const handleConnectGoogleCalendar = async () => {
    setIsConnecting(true);
    try {
      const res = await API.google.getGoogleAuth();
      const googleAuthUrl = res.authUrl;
      location.href = googleAuthUrl;
    } catch (error) {
      console.error("Failed to connect Google Calendar:", error);
      toast({
        type: "error",
        title: "Connection Failed",
        description: "Failed to connect Google Calendar. Please try again.",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRefresh = async () => {
    try {
      await refresh();
      toast({
        type: "success",
        title: "Settings Refreshed",
        description: "Calendar settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Failed to refresh settings:", error);
      toast({
        type: "error",
        title: "Refresh Failed",
        description: "Failed to refresh calendar settings. Please try again.",
      });
    }
  };

  return (
    <div className={className}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-gray-900">
            Set which calendars we use to check for busy times
          </h2>
          <Button
            onClick={handleRefresh}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          These calendars will be used to prevent double bookings.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg overflow-hidden flex items-center justify-center bg-white">
              <img
                src="/google-meet.png"
                alt="Google Meet"
                className="h-8 w-8 object-contain"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Google Calendar</h3>
              {isConnected && platformSettings && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-sm font-medium text-gray-800">
                      {platformSettings.givenName} {platformSettings.familyName}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 ml-4">
                    {platformSettings.email}
                  </p>
                </div>
              )}
              {!isConnected && (
                <p className="text-sm text-gray-600 mt-1">Gmail, G Suite</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isConnected && !isLoading && (
              <Badge
                variant="secondary"
                className="bg-green-50 text-green-700 border-green-200"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            )}

            {!isConnected && !isLoading && (
              <Button
                onClick={handleConnectGoogleCalendar}
                disabled={isConnecting}
                variant="default"
                size="sm"
              >
                {isConnecting ? (
                  <>
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent mr-2"></div>
                    Connecting...
                  </>
                ) : (
                  "Connect"
                )}
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg opacity-60">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg overflow-hidden flex items-center justify-center bg-white">
              <img
                src="/microsoft.png"
                alt="Microsoft Teams"
                className="h-8 w-8 object-contain"
              />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Outlook Calendar</h3>
              <p className="text-sm text-gray-600">
                Office 365, Outlook.com, live.com, or hotmail calendar
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            disabled
            size="sm"
            className="text-gray-400"
          >
            Coming Soon
          </Button>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg opacity-60">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg overflow-hidden flex items-center justify-center bg-white">
              <img
                src="/zoom.png"
                alt="Zoom"
                className="h-8 w-8 object-contain"
              />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Exchange Calendar</h3>
              <p className="text-sm text-gray-600">
                Exchange Server 2013, 2016, or 2019
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            disabled
            size="sm"
            className="text-gray-400"
          >
            Coming Soon
          </Button>
        </div>
      </div>
    </div>
  );
}
