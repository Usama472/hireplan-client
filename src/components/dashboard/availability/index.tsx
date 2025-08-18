"use client"; // This directive declares an entry point for client-side components [^2].

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import API from "@/http";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";
import { useToast } from "@/lib/hooks/use-toast";
import { CalendarClock, Settings, Users } from "lucide-react";
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
    <div className="max-w-6xl mx-auto px-4 py-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Availability</h1>
      </div>

      <Tabs
        value={activeMainTab}
        onValueChange={setActiveMainTab}
        className="w-full"
      >
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-100">
            <TabsList className="flex w-full h-12 bg-transparent border-0 p-0 m-0">
              <TabsTrigger
                value="templates"
                className="flex-1 flex items-center justify-center gap-2 h-full px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=active]:font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 relative rounded-tl-xl"
              >
                <CalendarClock className="h-4 w-4" />
                <span className="text-sm">Booking Pages</span>
              </TabsTrigger>
              <TabsTrigger
                value="booked-slots"
                className="flex-1 flex items-center justify-center gap-2 h-full px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=active]:font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 relative"
              >
                <Users className="h-4 w-4" />
                <span className="text-sm">Booked Slots</span>
                {totalBookedAppointments > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 px-2 text-xs bg-blue-50 text-blue-600 border border-blue-200"
                  >
                    {totalBookedAppointments}
                  </Badge>
                )}
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-100"></div>
              </TabsTrigger>
              <TabsTrigger
                value="calendar-settings"
                className="flex-1 flex items-center justify-center gap-2 h-full px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=active]:font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 relative rounded-tr-xl"
              >
                <Settings className="h-4 w-4" />
                <span className="text-sm">Calendar Settings</span>
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-100"></div>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="templates" className="mt-0">
              <ScheduleTemplates />
            </TabsContent>

            <TabsContent value="booked-slots" className="mt-0">
              <BookedSlots />
            </TabsContent>

            <TabsContent value="calendar-settings" className="mt-0">
              <CalendarSettings />
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
