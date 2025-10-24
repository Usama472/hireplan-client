"use client"; // This directive declares an entry point for client-side components [^2].

import { ProfileTabs } from "@/components/common/tabs";
import { Badge } from "@/components/ui/badge";
import API from "@/http";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";
import { useToast } from "@/lib/hooks/use-toast";
import {
  CalendarClock,
  CalendarDays,
  Settings,
  Users,
  Video,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { BookedSlots } from "./booked-slots";
import { CalendarSettings } from "./calendar-settings";
import { ScheduleTemplates } from "./schedule-templates";
import { MeetingSettings } from "../settings/meeting-settings";

export default function AvailabilityManager() {
  const { toast } = useToast();
  const { updateUser } = useAuthSessionContext();
  const [searchParams] = useSearchParams();

  const [activeMainTab, setActiveMainTab] = useState<string>("templates");
  const [totalBookedAppointments, setTotalBookedAppointments] = useState(0);

  const availabilityTabs = [
    {
      id: "templates",
      label: "Booking Pages",
      icon: CalendarClock,
    },
    {
      id: "booked-slots",
      label: "Booked Slots",
      icon: Users,
    },
    {
      id: "calendar-settings",
      label: "Calendar Settings",
      icon: Settings,
    },
    {
      id: "meeting-settings",
      label: "Meeting Settings",
      icon: Video,
    },
  ];

  const loadInterviewsData = async () => {
    try {
      const response = await API.interview.getInterviews({
        page: 1,
        limit: 1, // We only need the count, not the actual interviews
      });

      if (response.success) {
        setTotalBookedAppointments(response.interviews.totalResults);
      }
    } catch (error) {
      console.error("Error loading interviews data:", error);
      setTotalBookedAppointments(0);
    }
  };

  useEffect(() => {
    loadInterviewsData();
  }, []);

  useEffect(() => {
    const code = searchParams.get("code");
    const scope = searchParams.get("scope");
    if (code && scope && scope.includes("calendar")) {
      API.google
        .googleAuthCallback(code)
        .then((response) => {
          if (response.user && updateUser) {
            updateUser(response.user as any);
            toast({
              type: "success",
              title: "Google Calendar Connected",
              description:
                "Your Google Calendar has been connected successfully",
            });
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete("code");
            newUrl.searchParams.delete("scope");
            window.history.replaceState({}, document.title, newUrl.toString());
          }
        })
        .catch((err) => {
          console.error("Error updating user", err);
        });
    }
  }, [searchParams, toast, updateUser]);

  return (
    <div className="min-h-full bg-gray-50">
      <div className="space-y-0">
        {/* Mobile-First Enhanced Header */}
        <div className="bg-white border-b border-gray-200 px-2.5 sm:px-4 py-2.5 relative overflow-hidden">
          {/* Mobile Layout */}
          <div className="block sm:hidden">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gray-100 rounded-lg flex-shrink-0">
                <CalendarDays className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <h1 className="text-base font-bold text-gray-900 truncate">
                  Availability
                </h1>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs text-gray-600 truncate">
                    Manage booking & calendar
                  </p>
                  {totalBookedAppointments > 0 && (
                    <Badge
                      variant="secondary"
                      className="bg-gray-100 text-gray-700 text-xs flex-shrink-0"
                    >
                      {totalBookedAppointments} booked
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:block relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <CalendarDays className="h-4.5 w-4.5 text-gray-600" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-lg font-bold text-gray-900">
                    Availability
                  </h1>
                  <p className="text-gray-600 flex items-center gap-1.5 text-xs">
                    Manage your booking pages and calendar availability
                    {totalBookedAppointments > 0 && (
                      <Badge
                        variant="secondary"
                        className="bg-gray-100 text-gray-700 text-xs py-0 px-1.5"
                      >
                        {totalBookedAppointments} booked
                      </Badge>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-Optimized Content */}
        <div className="py-2.5 sm:py-3 px-2.5 sm:px-4 max-w-7xl mx-auto">
          <ProfileTabs
            activeTab={activeMainTab}
            onTabChange={setActiveMainTab}
            tabs={availabilityTabs}
          >
            {activeMainTab === "templates" && (
              <div className="space-y-2.5 sm:space-y-3">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-2.5 sm:p-3">
                  <ScheduleTemplates />
                </div>
              </div>
            )}

            {activeMainTab === "booked-slots" && (
              <div className="space-y-2.5 sm:space-y-3">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-2.5 sm:p-3">
                  <BookedSlots />
                </div>
              </div>
            )}

            {activeMainTab === "calendar-settings" && (
              <div className="space-y-2.5 sm:space-y-3">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-2.5 sm:p-3">
                  <CalendarSettings />
                </div>
              </div>
            )}

            {activeMainTab === "meeting-settings" && (
              <div className="space-y-2.5 sm:space-y-3">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-2.5 sm:p-3">
                  <MeetingSettings />
                </div>
              </div>
            )}
          </ProfileTabs>
        </div>
      </div>
    </div>
  );
}
