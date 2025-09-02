"use client"; // This directive declares an entry point for client-side components [^2].

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import API from "@/http";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";
import { useToast } from "@/lib/hooks/use-toast";
import { CalendarClock, CalendarDays, Settings, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { BookedSlots } from "./booked-slots";
import { CalendarSettings } from "./calendar-settings";
import { ScheduleTemplates } from "./schedule-templates";

export default function AvailabilityManager() {
  const { toast } = useToast();
  const { updateUser } = useAuthSessionContext();
  const [searchParams] = useSearchParams();

  const [activeMainTab, setActiveMainTab] = useState<string>("templates");
  const [totalBookedAppointments, setTotalBookedAppointments] = useState(0);

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
    <div className="min-h-full">
      <div className="space-y-0">
        {/* Enhanced Header - Matching Jobs/Staff Management Style */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 px-6 py-4 relative overflow-hidden max-h-[80px]">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <CalendarDays className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-2xl font-bold text-black">Availability</h1>
                  <p className="text-black flex items-center gap-2">
                    Manage your booking pages and calendar availability
                    {totalBookedAppointments > 0 && (
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-700 text-xs"
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

        {/* Simplified Compact Tab Navigation */}
        <div className="bg-white border-b border-gray-200">
          <Tabs
            value={activeMainTab}
            onValueChange={setActiveMainTab}
            className="w-full"
          >
            <div className="px-6 relative">
              {/* Compact Navigation Bar */}
              <div className="flex items-center">
                {/* Active Tab Indicator */}
                <div
                  className="absolute bottom-0 h-0.5 bg-primary transition-all duration-300 ease-out"
                  style={{
                    left:
                      activeMainTab === "templates"
                        ? "0%"
                        : activeMainTab === "booked-slots"
                        ? "33.33%"
                        : "66.66%",
                    width: "33.33%",
                  }}
                ></div>

                <TabsList className="flex w-full bg-transparent p-0 gap-0">
                  <TabsTrigger
                    value="templates"
                    className="flex-1 flex items-center justify-center py-2.5 text-sm font-medium text-gray-500 transition-colors duration-200 hover:text-gray-900 data-[state=active]:text-gray-900"
                  >
                    <div className="flex items-center gap-1.5">
                      <CalendarClock className="h-3.5 w-3.5" />
                      <span>Booking Pages</span>
                    </div>
                  </TabsTrigger>

                  <TabsTrigger
                    value="booked-slots"
                    className="flex-1 flex items-center justify-center py-2.5 text-sm font-medium text-gray-500 transition-colors duration-200 hover:text-gray-900 data-[state=active]:text-gray-900"
                  >
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      <span>Booked Slots</span>
                      {totalBookedAppointments > 0 && (
                        <Badge
                          variant="secondary"
                          className="ml-1 h-4 px-1.5 text-[10px] bg-gray-100 text-gray-700 border-0"
                        >
                          {totalBookedAppointments}
                        </Badge>
                      )}
                    </div>
                  </TabsTrigger>

                  <TabsTrigger
                    value="calendar-settings"
                    className="flex-1 flex items-center justify-center py-2.5 text-sm font-medium text-gray-500 transition-colors duration-200 hover:text-gray-900 data-[state=active]:text-gray-900"
                  >
                    <div className="flex items-center gap-1.5">
                      <Settings className="h-3.5 w-3.5" />
                      <span>Calendar Settings</span>
                    </div>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <div className="py-6 px-6">
              <TabsContent
                value="templates"
                className="mt-0 focus-visible:outline-none focus-visible:ring-0"
              >
                <ScheduleTemplates />
              </TabsContent>

              <TabsContent
                value="booked-slots"
                className="mt-0 focus-visible:outline-none focus-visible:ring-0"
              >
                <BookedSlots />
              </TabsContent>

              <TabsContent
                value="calendar-settings"
                className="mt-0 focus-visible:outline-none focus-visible:ring-0"
              >
                <CalendarSettings />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
