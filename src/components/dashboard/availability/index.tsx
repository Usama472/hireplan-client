"use client"; // This directive declares an entry point for client-side components [^2].

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  defaultAvailabilitySettings,
  defaultDaysAvailability,
  timeZones,
} from "@/constants/availability-constants";
import API from "@/http";
import type { AvailabilitySettings } from "@/interfaces";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";
import { useToast } from "@/lib/hooks/use-toast";
import { errorResolver } from "@/lib/utils";
import { Calendar, CalendarClock, Settings, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { AvailabilityOverview } from "./availability-overview";
import { BookedSlots } from "./booked-slots";
import { CalendarSettings } from "./calendar-settings";
import { DateSpecificContainer } from "./date-specific-container";
import { WeeklyAvailabilityContainer } from "./weekly-availability-container";

export default function AvailabilityManager() {
  const { toast } = useToast();
  const { data, updateUser } = useAuthSessionContext();
  const [searchParams] = useSearchParams();

  const [activeMainTab, setActiveMainTab] = useState<string>("schedule");
  const [activeScheduleTab, setActiveScheduleTab] = useState<string>("weekly");
  const [settings, setSettings] = useState<AvailabilitySettings>(() => {
    const defaultSettings: AvailabilitySettings = {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      daysAvailability: defaultDaysAvailability,
    };
    const savedSettings =
      typeof window !== "undefined"
        ? localStorage.getItem("availability-settings")
        : null;
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingTimezone, setIsUpdatingTimezone] = useState(false);
  const [totalBookedAppointments, setTotalBookedAppointments] = useState(0);

  const loadAvailabilityData = async () => {
    setIsLoading(true);
    try {
      const response = await API.availability.getAvailability();

      if (response.status && response.availability) {
        const weekDayItems = response.availability.availabilities.filter(
          (item: any) => item.type === "weekDay"
        );

        const updatedDaysAvailability =
          defaultAvailabilitySettings.daysAvailability.map((day) => {
            const backendDay = weekDayItems.find(
              (item: any) => item.day === day.day
            );
            if (backendDay) {
              return {
                ...day,
                isAvailable: true,
                timeSlots: backendDay.slots.map((slot: any) => ({
                  id: crypto.randomUUID(),
                  startTime: slot.from,
                  endTime: slot.to,
                })),
              };
            }
            return {
              ...day,
              isAvailable: false,
              timeSlots: [],
            };
          });

        const transformedData = {
          timezone:
            response.availability.timezone ||
            defaultAvailabilitySettings.timezone,
          daysAvailability: updatedDaysAvailability,
        };

        setSettings(transformedData);
      } else {
        setSettings({ ...defaultAvailabilitySettings });
      }
    } catch (error) {
      console.error("Error loading availability data:", error);
      setSettings({ ...defaultAvailabilitySettings });
      toast({
        type: "error",
        title: "Error loading data",
        description:
          "Failed to load availability data. Using default settings.",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
    loadAvailabilityData();
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

  const handleTimezoneChange = async (timezone: string) => {
    setIsUpdatingTimezone(true);
    setSettings((prev) => ({
      ...prev,
      timezone,
    }));
    try {
      await API.user.updateProfile({
        defaultTimezone: timezone,
      });
      if (updateUser) {
        updateUser({
          ...data?.user,
          defaultTimezone: timezone,
        });
      }
      toast({
        type: "success",
        title: "Timezone updated",
        description: "Your timezone has been updated successfully",
      });
    } catch (err) {
      toast({
        type: "error",
        title: "Error updating timezone",
        description: errorResolver(err),
      });
    } finally {
      setIsUpdatingTimezone(false);
    }
  };

  const totalAvailableDays = settings.daysAvailability.filter(
    (day) => day.isAvailable
  ).length;
  const totalTimeSlots = settings.daysAvailability.reduce(
    (total, day) => total + day.timeSlots.length,
    0
  );
  const totalAvailableHours = settings.daysAvailability.reduce((total, day) => {
    return (
      total +
      day.timeSlots.reduce((dayTotal, slot) => {
        const startHour = Number.parseInt(slot.startTime.split(":")[0]);
        const startMinute = Number.parseInt(slot.startTime.split(":")[1]);
        const endHour = Number.parseInt(slot.endTime.split(":")[0]);
        const endMinute = Number.parseInt(slot.endTime.split(":")[1]);
        const hoursDiff = endHour - startHour;
        const minutesDiff = endMinute - startMinute;
        return dayTotal + hoursDiff + minutesDiff / 60;
      }, 0)
    );
  }, 0);

  useEffect(() => {
    if (data?.user?.defaultTimezone) {
      setSettings((prev) => ({
        ...prev,
        timezone: data.user.defaultTimezone,
      }));
    }
  }, [data?.user?.defaultTimezone]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-4">
      <AvailabilityOverview
        title="Availability"
        description="Manage your interview and meeting schedules"
        totalAvailableDays={totalAvailableDays}
        totalTimeSlots={totalTimeSlots}
        totalAvailableHours={totalAvailableHours}
        totalBookedAppointments={totalBookedAppointments}
        currentTimezone={settings.timezone}
        onTimezoneChange={handleTimezoneChange}
        timeZones={timeZones}
        isLoading={isLoading}
        isUpdatingTimezone={isUpdatingTimezone}
        onRefresh={loadAvailabilityData}
      />

      <Tabs
        value={activeMainTab}
        onValueChange={setActiveMainTab}
        className="w-full"
      >
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-100">
            <TabsList className="flex w-full h-12 bg-transparent border-0 p-0 m-0">
              <TabsTrigger
                value="schedule"
                className="flex-1 flex items-center justify-center gap-2 h-full px-4 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=active]:font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200 relative rounded-tl-xl"
              >
                <CalendarClock className="h-4 w-4" />
                <span className="text-sm">Schedule</span>
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-100"></div>
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
            <TabsContent value="schedule" className="mt-0">
              <Tabs
                value={activeScheduleTab}
                onValueChange={setActiveScheduleTab}
                className="w-full"
              >
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex justify-center">
                      <TabsList className="inline-flex bg-gray-100 p-1 rounded-lg">
                        <TabsTrigger
                          value="weekly"
                          className="relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900"
                        >
                          <CalendarClock className="h-4 w-4 mr-2" />
                          Weekly
                        </TabsTrigger>
                        <TabsTrigger
                          value="date-specific"
                          className="relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Date Specific
                        </TabsTrigger>
                      </TabsList>
                    </div>
                  </div>

                  <div className="p-4">
                    <TabsContent value="weekly" className="mt-0">
                      <WeeklyAvailabilityContainer />
                    </TabsContent>
                    <TabsContent value="date-specific" className="mt-0">
                      <DateSpecificContainer />
                    </TabsContent>
                  </div>
                </div>
              </Tabs>
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
