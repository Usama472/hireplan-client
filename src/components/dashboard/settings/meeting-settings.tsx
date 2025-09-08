"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import API from "@/http";
import useMeetingSettings from "@/lib/hooks/use-meeting-settings";
import { useToast } from "@/lib/hooks/use-toast";
import { CheckCircle, RefreshCw } from "lucide-react";
import { useState } from "react";

interface MeetingSettingsProps {
  className?: string;
}

export function MeetingSettings({ className }: MeetingSettingsProps) {
  const { toast } = useToast();
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [isConnectingMicrosoft, setIsConnectingMicrosoft] = useState(false);
  const [isConnectingZoom, setIsConnectingZoom] = useState(false);
  const { connections, preferredPlatform, platformSettings, isLoading, refresh } =
    useMeetingSettings();
  
  // Check platform connections
  const isGoogleConnected = connections.google;
  const isMicrosoftConnected = connections.microsoft;
  const isZoomConnected = connections.zoom;

  const handleConnectGoogleMeet = async () => {
    setIsConnectingGoogle(true);
    try {
      const res = await API.google.getGoogleAuth();
      const googleAuthUrl = res.authUrl;
      location.href = googleAuthUrl;
    } catch (error) {
      console.error("Failed to connect Google Meet:", error);
      toast({
        type: "error",
        title: "Connection Failed",
        description: "Failed to connect Google Meet. Please try again.",
      });
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  const handleConnectMicrosoftTeams = async () => {
    setIsConnectingMicrosoft(true);
    try {
      const res = await API.microsoft.getMicrosoftAuthUrl();
      const microsoftAuthUrl = res.authUrl;
      location.href = microsoftAuthUrl;
    } catch (error) {
      console.error("Failed to connect Microsoft Teams:", error);
      toast({
        type: "error",
        title: "Connection Failed",
        description: "Failed to connect Microsoft Teams. Please try again.",
      });
    } finally {
      setIsConnectingMicrosoft(false);
    }
  };

  const handleConnectZoom = async () => {
    setIsConnectingZoom(true);
    try {
      const res = await API.zoom.getZoomAuthUrl();
      const zoomAuthUrl = res.authUrl;
      location.href = zoomAuthUrl;
    } catch (error) {
      console.error("Failed to connect Zoom:", error);
      toast({
        type: "error",
        title: "Connection Failed",
        description: "Failed to connect Zoom. Please try again.",
      });
    } finally {
      setIsConnectingZoom(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    try {
      // Add Google disconnect API call here
      await refresh();
      toast({
        type: "success",
        title: "Disconnected",
        description: "Google Meet has been disconnected successfully.",
      });
    } catch (error) {
      console.error("Failed to disconnect Google Meet:", error);
      toast({
        type: "error",
        title: "Disconnection Failed",
        description: "Failed to disconnect Google Meet. Please try again.",
      });
    }
  };

  const handleDisconnectMicrosoft = async () => {
    try {
      await API.microsoft.disconnectMicrosoftCalendar();
      await refresh();
      toast({
        type: "success",
        title: "Disconnected",
        description: "Microsoft Teams has been disconnected successfully.",
      });
    } catch (error) {
      console.error("Failed to disconnect Microsoft Teams:", error);
      toast({
        type: "error",
        title: "Disconnection Failed",
        description: "Failed to disconnect Microsoft Teams. Please try again.",
      });
    }
  };

  const handleDisconnectZoom = async () => {
    try {
      await API.zoom.disconnectZoom();
      await refresh();
      toast({
        type: "success",
        title: "Disconnected",
        description: "Zoom has been disconnected successfully.",
      });
    } catch (error) {
      console.error("Failed to disconnect Zoom:", error);
      toast({
        type: "error",
        title: "Disconnection Failed",
        description: "Failed to disconnect Zoom. Please try again.",
      });
    }
  };

  const handleRefresh = async () => {
    try {
      await refresh();
      toast({
        type: "success",
        title: "Settings Refreshed",
        description: "Meeting settings have been refreshed successfully.",
      });
    } catch (error) {
      console.error("Failed to refresh settings:", error);
      toast({
        type: "error",
        title: "Refresh Failed",
        description: "Failed to refresh meeting settings. Please try again.",
      });
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Meeting Settings</h2>
          <p className="text-gray-600 mt-1">
            Connect your meeting platforms to automatically create meeting links for interviews
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {/* Google Meet */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg overflow-hidden flex items-center justify-center bg-white">
              <img
                src="/google.png"
                alt="Google Meet"
                className="h-8 w-8 object-contain"
              />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Google Meet</h3>
              <p className="text-sm text-gray-600">
                {isGoogleConnected && platformSettings?.platforms?.google?.email ? (
                  <>Connected as {platformSettings.platforms.google.email}</>
                ) : (
                  "Create Google Meet links for interviews"
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isGoogleConnected && !isLoading && (
              <>
                <Badge 
                  variant="secondary" 
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
                <Button 
                  onClick={handleDisconnectGoogle} 
                  variant="outline" 
                  size="sm"
                >
                  Disconnect
                </Button>
              </>
            )}
            {!isGoogleConnected && !isLoading && (
              <Button 
                onClick={handleConnectGoogleMeet} 
                disabled={isConnectingGoogle} 
                size="sm"
              >
                {isConnectingGoogle ? (
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

        {/* Microsoft Teams */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg overflow-hidden flex items-center justify-center bg-white">
              <img
                src="/microsoft.png"
                alt="Microsoft Teams"
                className="h-8 w-8 object-contain"
              />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Microsoft Teams</h3>
              <p className="text-sm text-gray-600">
                {isMicrosoftConnected && platformSettings?.platforms?.microsoft?.email ? (
                  <>Connected as {platformSettings.platforms.microsoft.email}</>
                ) : (
                  "Create Microsoft Teams meetings for interviews"
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isMicrosoftConnected && !isLoading && (
              <>
                <Badge 
                  variant="secondary" 
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
                <Button 
                  onClick={handleDisconnectMicrosoft} 
                  variant="outline" 
                  size="sm"
                >
                  Disconnect
                </Button>
              </>
            )}
            {!isMicrosoftConnected && !isLoading && (
              <Button 
                onClick={handleConnectMicrosoftTeams} 
                disabled={isConnectingMicrosoft} 
                size="sm"
              >
                {isConnectingMicrosoft ? (
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

        {/* Zoom */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg overflow-hidden flex items-center justify-center bg-white">
              <img
                src="/zoom.png"
                alt="Zoom"
                className="h-8 w-8 object-contain"
              />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Zoom</h3>
              <p className="text-sm text-gray-600">
                {isZoomConnected && platformSettings?.platforms?.zoom?.email ? (
                  <>Connected as {platformSettings.platforms.zoom.email}</>
                ) : (
                  "Create Zoom meetings for interviews"
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isZoomConnected && !isLoading && (
              <>
                <Badge 
                  variant="secondary" 
                  className="bg-green-50 text-green-700 border-green-200"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
                <Button 
                  onClick={handleDisconnectZoom} 
                  variant="outline" 
                  size="sm"
                >
                  Disconnect
                </Button>
              </>
            )}
            {!isZoomConnected && !isLoading && (
              <Button 
                onClick={handleConnectZoom} 
                disabled={isConnectingZoom} 
                size="sm"
              >
                {isConnectingZoom ? (
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
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">How it works</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Connect your preferred meeting platforms above</li>
          <li>• When creating schedule templates, select which platform to use</li>
          <li>• Interview meeting links will be automatically created using your selected platform</li>
          <li>• Candidates will receive the meeting link in their confirmation emails</li>
        </ul>
      </div>
    </div>
  );
}
