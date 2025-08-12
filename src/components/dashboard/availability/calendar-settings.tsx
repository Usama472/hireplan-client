"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/use-toast";
import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface CalendarSettingsProps {
  className?: string;
}

export function CalendarSettings({ className }: CalendarSettingsProps) {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const savedConnection = localStorage.getItem("google-calendar-connected");
    if (savedConnection === "true") {
      setIsConnected(true);
    }
  }, []);

  const handleConnectGoogleCalendar = async () => {
    setIsConnecting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsConnected(true);
      localStorage.setItem("google-calendar-connected", "true");

      toast({
        type: "success",
        title: "Google Calendar Connected",
        description: "Your Google Calendar has been successfully connected.",
      });
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

  const handleDisconnectGoogleCalendar = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsConnected(false);
      localStorage.removeItem("google-calendar-connected");

      toast({
        type: "success",
        title: "Google Calendar Disconnected",
        description: "Your Google Calendar has been successfully disconnected.",
      });
    } catch (error) {
      console.error("Failed to disconnect Google Calendar:", error);
      toast({
        type: "error",
        title: "Disconnection Failed",
        description: "Failed to disconnect Google Calendar. Please try again.",
      });
    }
  };

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Set which calendars we use to check for busy times
        </h2>
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
            <div>
              <h3 className="font-medium text-gray-900">Google Calendar</h3>
              <p className="text-sm text-gray-600">Gmail, G Suite</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isConnected && (
              <Badge
                variant="secondary"
                className="bg-green-50 text-green-700 border-green-200"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            )}
            <Button
              onClick={
                isConnected
                  ? handleDisconnectGoogleCalendar
                  : handleConnectGoogleCalendar
              }
              disabled={isConnecting}
              variant={isConnected ? "outline" : "default"}
              size="sm"
              className={
                isConnected ? "text-red-600 border-red-200 hover:bg-red-50" : ""
              }
            >
              {isConnecting ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent mr-2"></div>
                  Connecting...
                </>
              ) : isConnected ? (
                "Disconnect"
              ) : (
                "Connect"
              )}
            </Button>
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
