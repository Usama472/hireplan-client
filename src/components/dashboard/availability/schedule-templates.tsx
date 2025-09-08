"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type DateSpecificFormData } from "@/constants/date-specific-constants";
import {
  createAvailabilityTemplate,
  deleteAvailabilityTemplate,
  getAvailabilityTemplates,
  saveAvailability,
  updateAvailabilityTemplate,
} from "@/http/availability/api";
import type { AvailabilityTemplate } from "@/interfaces";
import { useToast } from "@/lib/hooks/use-toast";
import { format } from "date-fns";
import { Calendar, Clock, Edit, Plus, Trash2, Video } from "lucide-react";
import { useEffect, useState } from "react";

// Timezone conversion utilities
const convertTimeToTimezone = (time: string, fromTimezone: string, toTimezone: string): string => {
  // Create a date object for today with the given time
  const today = new Date();
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
  
  // Convert from source timezone to UTC
  const utcTime = new Date(date.toLocaleString("en-US", { timeZone: fromTimezone }));
  
  // Convert from UTC to target timezone
  const targetTime = new Date(utcTime.toLocaleString("en-US", { timeZone: toTimezone }));
  
  return format(targetTime, 'HH:mm');
};

const getTimezoneDisplayName = (timezone: string): string => {
  const date = new Date();
  const offset = date.toLocaleString("en-US", { timeZone: timezone, timeZoneName: "short" }).split(' ').pop() || '';
  const city = timezone.split('/').pop()?.replace('_', ' ') || timezone;
  return `${city} (${offset})`;
};
import { DateSpecificForm } from "./date-specific-form";

// Add interface for TimeSlot and Day to fix type errors
interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  eventTypeId?: string;
  eventType?: any;
}

interface DayAvailability {
  id: string;
  day: string;
  isAvailable: boolean;
  timeSlots: TimeSlot[];
}

interface DateSpecificSettings {
  id: string; // Changed from 'id' to 'id' to match original
  date: Date;
  isAvailable: boolean;
  timeSlots: TimeSlot[];
}

interface ScheduleTemplatesProps {
  onTemplateChange?: (template: any) => void;
}

export function ScheduleTemplates({
  onTemplateChange,
}: ScheduleTemplatesProps) {
  const [templates, setTemplates] = useState<AvailabilityTemplate[]>([]);
  const [currentTemplate, setCurrentTemplate] =
    useState<AvailabilityTemplate | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddHoursDialogOpen, setIsAddHoursDialogOpen] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] =
    useState<AvailabilityTemplate | null>(null);
  const [templateToEdit, setTemplateToEdit] = 
    useState<AvailabilityTemplate | null>(null);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [templateDuration, setTemplateDuration] = useState(30);
  const [selectedMeetingPlatform, setSelectedMeetingPlatform] = useState("google");
  const [editTemplateName, setEditTemplateName] = useState("");
  const [editTemplateDuration, setEditTemplateDuration] = useState(30);
  const [editMeetingPlatform, setEditMeetingPlatform] = useState("google");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [currentTimezone, setCurrentTimezone] =
    useState<string>("America/New_York");
  const [candidateTimezone, setCandidateTimezone] = useState<string>("America/New_York");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Filter templates based on search query
  const filteredTemplates = templates.filter(template =>
    template.templateName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (template.templateName === "default" && "default".includes(searchQuery.toLowerCase()))
  );

  // Add handleTimezoneChange function
  const handleTimezoneChange = async (newTimezone: string) => {
    if (!currentTemplate) return;

    try {
      // Update the template with the new timezone
      const updatedTemplate = { ...currentTemplate, timezone: newTimezone };

      // Update the backend
      await updateAvailabilityTemplate(currentTemplate.id, updatedTemplate);

      // Update local state
      setCurrentTimezone(newTimezone);
      setCurrentTemplate(updatedTemplate);
      setTemplates((prev) =>
        prev.map((t) => (t.id === currentTemplate.id ? updatedTemplate : t))
      );

      toast({
        title: "Timezone Updated",
        description: `Timezone changed to ${newTimezone}`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update timezone. Please try again.",
      });
    }
  };


  // Load templates from backend
  const loadTemplates = async () => {
    try {
      const response = await getAvailabilityTemplates();
      if (response.status) {
        // Transform the server data to match form format
        const transformedTemplates = response.availabilities.map((template) => {
          // Transform weekly availability
          const weeklyAvailability = {
            type: "weekly",
            daysAvailability: [
              {
                id: "monday",
                day: "monday",
                isAvailable: false,
                timeSlots: [],
              },
              {
                id: "tuesday",
                day: "tuesday",
                isAvailable: false,
                timeSlots: [],
              },
              {
                id: "wednesday",
                day: "wednesday",
                isAvailable: false,
                timeSlots: [],
              },
              {
                id: "thursday",
                day: "thursday",
                isAvailable: false,
                timeSlots: [],
              },
              {
                id: "friday",
                day: "friday",
                isAvailable: false,
                timeSlots: [],
              },
              {
                id: "saturday",
                day: "saturday",
                isAvailable: false,
                timeSlots: [],
              },
              {
                id: "sunday",
                day: "sunday",
                isAvailable: false,
                timeSlots: [],
              },
            ],
          };

          // Transform date-specific availability
          const dateSpecificAvailability: any = {
            type: "date-specific",
            dates: [],
          };

          // Process server availabilities and transform them
          if (template.availabilities) {
            template.availabilities.forEach((availability: any) => {
              if (availability.type === "weekDay") {
                // Find the day in weekly availability
                const dayIndex = weeklyAvailability.daysAvailability.findIndex(
                  (day) => day.day === availability.day
                );
                if (dayIndex !== -1) {
                  weeklyAvailability.daysAvailability[dayIndex].isAvailable =
                    true;
                  weeklyAvailability.daysAvailability[dayIndex].timeSlots =
                    availability.slots.map((slot: any) => ({
                      id: `${availability.day}-${slot.from}-${slot.to}`,
                      startTime: slot.from,
                      endTime: slot.to,
                      duration: template.duration,
                    }));
                }
              } else if (availability.type === "date") {
                // Add to date-specific availability
                dateSpecificAvailability.dates.push({
                  id: availability.date,
                  date: new Date(availability.date),
                  isAvailable: true,
                  timeSlots: availability.slots.map((slot: any) => ({
                    id: `${availability.date}-${slot.from}-${slot.to}`,
                    startTime: slot.from,
                    endTime: slot.to,
                    duration: template.duration,
                  })),
                });
              }
            });
          }

          // Create transformed template
          return {
            ...template,
            availabilities: [weeklyAvailability, dateSpecificAvailability],
          };
        });

        setTemplates(transformedTemplates);
        if (transformedTemplates.length > 0) {
          const defaultTemplate =
            transformedTemplates.find((t) => t.templateName === "default") ||
            transformedTemplates[0];
          setCurrentTemplate(defaultTemplate);
        }
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to load templates. Please try again.",
      });
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    if (currentTemplate?.duration) {
      setTemplateDuration(currentTemplate.duration);
    }

    // Set timezone from template if available
    if (currentTemplate?.timezone) {
      setCurrentTimezone(currentTemplate.timezone);
    }
  }, [currentTemplate]);

  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim()) return;

    try {
      const response = await createAvailabilityTemplate(
        newTemplateName.trim(),
        templateDuration,
        selectedMeetingPlatform
      );
      if (response.status) {
        setTemplates((prev) => [...prev, response.availability]);
        setCurrentTemplate(response.availability);
        setNewTemplateName("");
        setSelectedMeetingPlatform("google");
        setIsCreateDialogOpen(false);

        toast({
          title: "Success",
          description: "Template created successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create template. Please try again.",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to create template. Please try again.",
      });
    }
  };

  const handleEditTemplate = async () => {
    if (!templateToEdit || !editTemplateName.trim()) return;

    try {
      const updatedTemplate = {
        templateName: editTemplateName.trim(),
        duration: editTemplateDuration,
        selectedMeetingPlatform: editMeetingPlatform,
      };

      const response = await updateAvailabilityTemplate(templateToEdit.id, updatedTemplate);
      if (response.status) {
        setTemplates((prev) => 
          prev.map(template => 
            template.id === templateToEdit.id 
              ? { ...template, ...updatedTemplate }
              : template
          )
        );
        
        if (currentTemplate?.id === templateToEdit.id) {
          setCurrentTemplate({ ...currentTemplate, ...updatedTemplate });
        }

        setIsEditDialogOpen(false);
        setTemplateToEdit(null);

        toast({
          title: "Success",
          description: "Template updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update template. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update template",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (template: AvailabilityTemplate) => {
    setTemplateToEdit(template);
    setEditTemplateName(template.templateName || "");
    setEditTemplateDuration(template.duration || 30);
    setEditMeetingPlatform(template.selectedMeetingPlatform || "google");
    setIsEditDialogOpen(true);
  };

  const handleTemplateChange = (templateId: string) => {
    const newTemplate = templates.find((t) => t.id === templateId);
    if (newTemplate) {
      setCurrentTemplate(newTemplate);
      onTemplateChange?.(newTemplate);
    }
  };

  const handleSaveTemplate = async (templateId: string, data: any) => {
    try {
      if (!currentTemplate) return;

      // Transform the data to match the expected API payload format
      let availabilityPayload: Array<{
        type: "weekDay" | "date";
        day?: string;
        date?: string;
        slots: Array<{
          from: string;
          to: string;
        }>;
      }> = [];

      if (data.daysAvailability) {
        // Weekly availability data
        const weeklyAvailability = data.daysAvailability
          .filter(
            (day: DayAvailability) =>
              day.isAvailable && day.timeSlots.length > 0
          )
          .map((day: DayAvailability) => ({
            type: "weekDay",
            day: day.day,
            slots: day.timeSlots.map((slot: TimeSlot) => ({
              from: slot.startTime,
              to: slot.endTime,
            })),
          }));

        availabilityPayload = [...availabilityPayload, ...weeklyAvailability];
      } else if (data.dates) {
        // Date-specific availability data
        const dateSpecificAvailability = data.dates
          .filter((date: DateSpecificSettings) => date.timeSlots.length > 0)
          .map((date: DateSpecificSettings) => ({
            type: "date",
            date: format(date.date, "yyyy-MM-dd"),
            slots: date.timeSlots.map((slot: TimeSlot) => ({
              from: slot.startTime,
              to: slot.endTime,
            })),
          }));

        availabilityPayload = [
          ...availabilityPayload,
          ...dateSpecificAvailability,
        ];
      }

      // Only save if there are available slots
      if (availabilityPayload.length > 0) {
        // Use saveAvailability API for saving slots
        await saveAvailability(templateId, availabilityPayload);

        // Update the template with the new availability data
        const updatedTemplate = { ...currentTemplate };

        if (data.daysAvailability) {
          // Update weekly availability
          const weeklyAvailability = { ...data, type: "weekly" };
          const existingWeeklyIndex =
            updatedTemplate.availabilities?.findIndex(
              (a) => a.type === "weekly"
            ) || -1;

          if (existingWeeklyIndex >= 0 && updatedTemplate.availabilities) {
            updatedTemplate.availabilities[existingWeeklyIndex] =
              weeklyAvailability;
          } else {
            updatedTemplate.availabilities = [
              ...(updatedTemplate.availabilities || []),
              weeklyAvailability,
            ];
          }
        } else if (data.dates) {
          // Update date-specific availability
          const dateSpecificAvailability = { ...data, type: "date-specific" };
          const existingDateSpecificIndex =
            updatedTemplate.availabilities?.findIndex(
              (a) => a.type === "date-specific"
            ) || -1;

          if (
            existingDateSpecificIndex >= 0 &&
            updatedTemplate.availabilities
          ) {
            updatedTemplate.availabilities[existingDateSpecificIndex] =
              dateSpecificAvailability;
          } else {
            updatedTemplate.availabilities = [
              ...(updatedTemplate.availabilities || []),
              dateSpecificAvailability,
            ];
          }
        }

        // Update local state
        setCurrentTemplate(updatedTemplate);
        setTemplates((prev) =>
          prev.map((t) => (t.id === templateId ? updatedTemplate : t))
        );
      }

      toast({
        title: "Success",
        description: "Availability saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save availability. Please try again.",
      });
      throw error; // Re-throw to be caught by the calling functions
    }
  };

  // Helper function to format time for display
  const formatTime = (time: string) => {
    const [hour, minute] = time.split(":");
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? "pm" : "am";
    const hour12 = hourNum % 12 || 12;
    return `${hour12}:${minute}${ampm}`;
  };

  const getWeeklyAvailabilityData = () => {
    if (!currentTemplate?.availabilities) return null;
    return currentTemplate.availabilities.find((a) => a.type === "weekly");
  };

  const getDateSpecificAvailabilityData = () => {
    if (!currentTemplate?.availabilities) return null;
    return currentTemplate.availabilities.find(
      (a) => a.type === "date-specific"
    );
  };

  const getDayLabel = (day: string) => {
    // Convert 'monday' to 'M', etc.
    return day.charAt(0).toUpperCase();
  };

  const getDayFullLabel = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  // Helper function to convert time string to minutes since midnight
  const timeStringToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Function to check if two time slots overlap
  const checkOverlap = (slot1: TimeSlot, slot2: TimeSlot): boolean => {
    // Convert times to minutes for accurate comparison
    const start1 = timeStringToMinutes(slot1.startTime);
    const end1 = timeStringToMinutes(slot1.endTime);
    const start2 = timeStringToMinutes(slot2.startTime);
    const end2 = timeStringToMinutes(slot2.endTime);

    // Check for overlap: if one slot starts before the other ends and ends after the other starts
    return start1 < end2 && end1 > start2;
  };

  // Function to check if a time slot has any overlaps
  const hasOverlaps = (slot: TimeSlot, timeSlots: TimeSlot[]): boolean => {
    return timeSlots.some(
      (otherSlot) => slot.id !== otherSlot.id && checkOverlap(slot, otherSlot)
    );
  };

  // Add a new time slot to a day
  const addTimeSlot = async (day: string) => {
    if (!currentTemplate) return;

    const weeklyData = getWeeklyAvailabilityData();
    if (!weeklyData) return;

    // Find the day
    const dayIndex = weeklyData.daysAvailability.findIndex(
      (d: DayAvailability) => d.day === day
    );
    if (dayIndex === -1) return;

    const currentDay = weeklyData.daysAvailability[dayIndex];
    const lastSlot = currentDay.timeSlots[currentDay.timeSlots.length - 1];

    // Default start and end times
    let startTime = "09:00";
    let endTime = "10:00";

    if (lastSlot) {
      // Set the new slot to start 30 minutes after the last one ends
      const [lastEndHour, lastEndMinute] = lastSlot.endTime
        .split(":")
        .map(Number);
      let newStartHour = lastEndHour;
      let newStartMinute = lastEndMinute + 30;

      if (newStartMinute >= 60) {
        newStartHour += 1;
        newStartMinute -= 60;
      }

      if (newStartHour > 23) {
        newStartHour = 23;
        newStartMinute = 30;
      }

      startTime = `${newStartHour.toString().padStart(2, "0")}:${newStartMinute
        .toString()
        .padStart(2, "0")}`;

      // Set the end time based on template duration
      let newEndHour = newStartHour;
      let newEndMinute = newStartMinute + (currentTemplate.duration || 60);

      if (newEndMinute >= 60) {
        newEndHour += Math.floor(newEndMinute / 60);
        newEndMinute = newEndMinute % 60;
      }

      if (newEndHour > 23) {
        newEndHour = 23;
        newEndMinute = 59;
      }

      endTime = `${newEndHour.toString().padStart(2, "0")}:${newEndMinute
        .toString()
        .padStart(2, "0")}`;
    }

    // Create a new slot with unique ID
    const newSlot: TimeSlot = {
      id: `${day}-${Date.now()}`,
      startTime,
      endTime,
      eventTypeId: "",
    };

    // Update the day with the new slot
    const updatedDaysAvailability = [...weeklyData.daysAvailability];
    updatedDaysAvailability[dayIndex] = {
      ...updatedDaysAvailability[dayIndex],
      timeSlots: [...updatedDaysAvailability[dayIndex].timeSlots, newSlot],
    };

    // Create updated data
    const updatedData = {
      ...weeklyData,
      daysAvailability: updatedDaysAvailability,
    };

    // Save changes
    try {
      await handleSaveTemplate(currentTemplate.id, updatedData);

      // Update local state directly after successful API call
      const updatedTemplate = { ...currentTemplate };
      const availabilityIndex = updatedTemplate.availabilities.findIndex(
        (a) => a.type === "weekly"
      );
      if (availabilityIndex !== -1) {
        updatedTemplate.availabilities[availabilityIndex] = updatedData;
        setCurrentTemplate(updatedTemplate);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to add time slot. Please try again.",
      });
    }
  };

  // Toggle day availability
  const toggleDayAvailability = async (day: string, isAvailable: boolean) => {
    if (!currentTemplate) return;

    const weeklyData = getWeeklyAvailabilityData();
    if (!weeklyData) return;

    // Find the day
    const dayIndex = weeklyData.daysAvailability.findIndex(
      (d: DayAvailability) => d.day === day
    );
    if (dayIndex === -1) return;

    // Update the day's availability
    const updatedDaysAvailability = [...weeklyData.daysAvailability];
    updatedDaysAvailability[dayIndex] = {
      ...updatedDaysAvailability[dayIndex],
      isAvailable,
    };

    // Create updated data
    const updatedData = {
      ...weeklyData,
      daysAvailability: updatedDaysAvailability,
    };

    // Save changes
    try {
      await handleSaveTemplate(currentTemplate.id, updatedData);

      // Update local state directly after successful API call
      const updatedTemplate = { ...currentTemplate };
      const availabilityIndex = updatedTemplate.availabilities.findIndex(
        (a) => a.type === "weekly"
      );
      if (availabilityIndex !== -1) {
        updatedTemplate.availabilities[availabilityIndex] = updatedData;
        setCurrentTemplate(updatedTemplate);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update availability. Please try again.",
      });
    }
  };


  const handleDeleteTimeSlot = async (day: string, slotId: string) => {
    if (!currentTemplate) return;

    const weeklyData = getWeeklyAvailabilityData();
    if (!weeklyData) return;

    // Find the day
    const dayIndex = weeklyData.daysAvailability.findIndex(
      (d: DayAvailability) => d.day === day
    );
    if (dayIndex === -1) return;

    // Remove the time slot
    const updatedDaysAvailability = [...weeklyData.daysAvailability];
    updatedDaysAvailability[dayIndex] = {
      ...updatedDaysAvailability[dayIndex],
      timeSlots: updatedDaysAvailability[dayIndex].timeSlots.filter(
        (slot: TimeSlot) => slot.id !== slotId
      ),
    };

    // Create updated data
    const updatedData = {
      ...weeklyData,
      daysAvailability: updatedDaysAvailability,
    };

    // Save changes
    try {
      await handleSaveTemplate(currentTemplate.id, updatedData);

      // Update local state directly after successful API call
      const updatedTemplate = { ...currentTemplate };
      const availabilityIndex = updatedTemplate.availabilities.findIndex(
        (a) => a.type === "weekly"
      );
      if (availabilityIndex !== -1) {
        updatedTemplate.availabilities[availabilityIndex] = updatedData;
        setCurrentTemplate(updatedTemplate);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete time slot. Please try again.",
      });
    }
  };

  const handleDeleteDateSlot = async (dateId: string, slotId: string) => {
    if (!currentTemplate) return;

    const dateSpecificData = getDateSpecificAvailabilityData();
    if (!dateSpecificData) return;

    // Find the date
    const dateIndex = dateSpecificData.dates.findIndex(
      (d: DateSpecificSettings) => d.id === dateId
    );
    if (dateIndex === -1) return;

    // Remove the time slot
    const updatedDates = [...dateSpecificData.dates];
    updatedDates[dateIndex] = {
      ...updatedDates[dateIndex],
      timeSlots: updatedDates[dateIndex].timeSlots.filter(
        (slot: TimeSlot) => slot.id !== slotId
      ),
    };

    // If no more time slots, remove the date entirely
    if (updatedDates[dateIndex].timeSlots.length === 0) {
      updatedDates.splice(dateIndex, 1);
    }

    // Create updated data
    const updatedData = {
      ...dateSpecificData,
      dates: updatedDates,
    };

    // Save changes
    try {
      await handleSaveTemplate(currentTemplate.id, updatedData);

      // Update local state directly after successful API call
      const updatedTemplate = { ...currentTemplate };
      const availabilityIndex = updatedTemplate.availabilities.findIndex(
        (a) => a.type === "date-specific"
      );
      if (availabilityIndex !== -1) {
        updatedTemplate.availabilities[availabilityIndex] = updatedData;
        setCurrentTemplate(updatedTemplate);
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete time slot. Please try again.",
      });
    }
  };

  // Function to check if a date already exists in date-specific availability data
  const getExistingDateEntry = (date: Date) => {
    const dateSpecificData = getDateSpecificAvailabilityData();
    if (!dateSpecificData?.dates) return null;

    // Format the date to YYYY-MM-DD for comparison
    const dateStr = format(date, "yyyy-MM-dd");

    // Find if this date already exists in our data
    return dateSpecificData.dates.find((d: DateSpecificSettings) => {
      const existingDateStr = format(d.date, "yyyy-MM-dd");
      return existingDateStr === dateStr;
    });
  };

  // Function to prepare date-specific form data based on selected date
  const prepareDateSpecificFormData = (): DateSpecificFormData | undefined => {
    if (!selectedDate) return undefined;

    // Check if the date already exists
    const existingDate = getExistingDateEntry(selectedDate);

    // Prepare initial data for the form
    const initialData: DateSpecificFormData = {
      dates: existingDate
        ? // If the date exists, use its data
          [existingDate]
        : // Otherwise create a new entry
          [
            {
              date: selectedDate,
              isAvailable: true,
              timeSlots: [],
            },
          ],
    };

    return initialData;
  };

  // Function to merge updated date slots with existing dates
  const mergeDateSpecificData = (updatedData: DateSpecificFormData) => {
    if (!currentTemplate || !selectedDate) return updatedData;

    const dateSpecificData = getDateSpecificAvailabilityData();
    if (!dateSpecificData?.dates?.length) return updatedData;

    // Format the selected date to YYYY-MM-DD for comparison
    const selectedDateStr = format(selectedDate, "yyyy-MM-dd");

    // Get all dates except the one being updated
    const otherDates = dateSpecificData.dates.filter(
      (d: DateSpecificSettings) => {
        const existingDateStr = format(d.date, "yyyy-MM-dd");
        return existingDateStr !== selectedDateStr;
      }
    );

    // Combine other dates with the updated date
    return {
      ...dateSpecificData,
      dates: [...otherDates, ...updatedData.dates],
    };
  };

  return (
    <div className="space-y-6">
      {/* Header with template selection */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Schedule Templates
          </h2>
          <p className="text-sm text-gray-600">
            Create and manage your availability templates
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      {/* Template Cards Grid */}
      {templates.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <Calendar className="h-12 w-12 text-gray-400" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No templates yet
              </h3>
              <p className="text-gray-600 mb-4">
                Create your first schedule template to get started
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>
          </div>
        </Card>
      ) : filteredTemplates.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <Calendar className="h-12 w-12 text-gray-400" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No templates found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms
              </p>
              <Button 
                variant="outline"
                onClick={() => setSearchQuery("")}
              >
                Clear Search
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div>
          {searchQuery && (
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredTemplates.length} of {templates.length} templates
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredTemplates.map((template) => (
            <Card 
              key={template.id} 
              className={`hover:shadow-md transition-all duration-200 cursor-pointer border-l-4 ${
                currentTemplate?.id === template.id 
                  ? 'border-l-blue-500 bg-blue-50/50 shadow-md' 
                  : 'border-l-gray-300 hover:border-l-blue-400'
              }`}
              onClick={() => handleTemplateChange(template.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-semibold text-gray-900 mb-1 truncate">
                      {template.templateName || "Untitled Template"}
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-600">
                      {template.templateName === "default" ? "Default template" : "Custom template"}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={template.templateName === "default" ? "default" : "secondary"} 
                    className="shrink-0 text-xs"
                  >
                    {template.templateName === "default" ? "Default" : "Custom"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-xs font-medium text-blue-600">
                    <Clock className="h-3 w-3" />
                    <span>{template.duration || 30} min</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {template.availabilities?.[0]?.daysAvailability?.filter((d: any) => d.isAvailable).length || 0} days
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Video className="h-3 w-3" />
                    <span>
                      {template.selectedMeetingPlatform === 'google' && 'Google Meet'}
                      {template.selectedMeetingPlatform === 'teams' && 'Microsoft Teams'}
                      {template.selectedMeetingPlatform === 'zoom' && 'Zoom'}
                      {!template.selectedMeetingPlatform && 'Google Meet'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTemplateChange(template.id);
                      }}
                      className="flex-1 h-7 text-xs"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      {currentTemplate?.id === template.id ? 'Selected' : 'Select'}
                    </Button>
                    {template.templateName !== "default" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDialog(template);
                          }}
                          className="h-7 w-7 p-0 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                          title="Edit Template"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTemplateToDelete(template);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="h-7 w-7 p-0 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        </div>
      )}

      {/* Timezone selector */}
      <Card className="mt-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Timezone</h3>
                <p className="text-xs text-gray-500">Set your local timezone for scheduling</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-80">
              <Select
                value={currentTimezone}
                onValueChange={handleTimezoneChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">
                    Eastern Time (ET) - America/New_York
                  </SelectItem>
                  <SelectItem value="America/Chicago">
                    Central Time (CT) - America/Chicago
                  </SelectItem>
                  <SelectItem value="America/Denver">
                    Mountain Time (MT) - America/Denver
                  </SelectItem>
                  <SelectItem value="America/Los_Angeles">
                    Pacific Time (PT) - America/Los_Angeles
                  </SelectItem>
                  <SelectItem value="Europe/London">
                    Greenwich Mean Time (GMT) - Europe/London
                  </SelectItem>
                  <SelectItem value="Europe/Paris">
                    Central European Time (CET) - Europe/Paris
                  </SelectItem>
                  <SelectItem value="Asia/Dubai">
                    Gulf Standard Time (GST) - Asia/Dubai
                  </SelectItem>
                  <SelectItem value="Asia/Kolkata">
                    India Standard Time (IST) - Asia/Kolkata
                  </SelectItem>
                  <SelectItem value="Asia/Shanghai">
                    China Standard Time (CST) - Asia/Shanghai
                  </SelectItem>
                  <SelectItem value="Asia/Tokyo">
                    Japan Standard Time (JST) - Asia/Tokyo
                  </SelectItem>
                  <SelectItem value="Australia/Sydney">
                    Australian Eastern Time (AET) - Australia/Sydney
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Main layout - side by side Weekly and Date-specific */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        {/* Weekly hours - left side */}
        <Card className="p-3">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-md">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-gray-900">
                  Weekly Availability
                </CardTitle>
                <CardDescription className="text-xs text-gray-600">
                  Set when you are typically available for meetings
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Ultra-compact horizontal layout */}
            <div className="space-y-1">
              {getWeeklyAvailabilityData()?.daysAvailability.map(
                (day: DayAvailability) => (
                  <div key={day.day} className="flex items-center gap-2 p-1.5 border border-gray-200 rounded-md hover:border-gray-300 transition-colors">
                    {/* Day indicator */}
                    <div
                      className={`w-6 h-6 rounded-full ${
                        day.isAvailable 
                          ? "bg-gradient-to-r from-blue-500 to-purple-600" 
                          : "bg-gray-200"
                      } text-white flex items-center justify-center text-xs font-semibold flex-shrink-0`}
                    >
                      {getDayLabel(day.day)}
                    </div>
                    
                    {/* Day name */}
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-900">
                        {getDayFullLabel(day.day)}
                      </span>
                      {day.isAvailable && (
                        <div className="text-xs text-gray-500">
                          {day.timeSlots.length} slot{day.timeSlots.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>

                    {/* Time slots display - horizontal */}
                    {day.isAvailable && day.timeSlots.length > 0 && (
                      <div className="flex flex-wrap gap-1 flex-1">
                        {day.timeSlots.map((slot: TimeSlot) => {
                          const hasSlotOverlap = hasOverlaps(slot, day.timeSlots);
                          return (
                            <div
                              key={slot.id}
                              className={`flex items-center gap-1 px-1.5 py-0.5 text-xs rounded border ${
                                hasSlotOverlap
                                  ? "border-red-200 bg-red-50 text-red-700"
                                  : "border-gray-200 bg-gray-50 text-gray-700"
                              }`}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {formatTime(slot.startTime)}-{formatTime(slot.endTime)}
                                </span>
                              </div>
                              <button
                                onClick={() => handleDeleteTimeSlot(day.day, slot.id)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Action button */}
                    <div className="flex-shrink-0">
                      {day.isAvailable ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addTimeSlot(day.day)}
                          className="h-6 text-xs px-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => toggleDayAvailability(day.day, true)}
                          className="h-6 text-xs px-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          Enable
                        </Button>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Date specific hours - right side */}
        <Card className="p-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Date-Specific Hours
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    Adjust hours for specific days
                  </CardDescription>
                </div>
              </div>
              <Button
                size="sm"
                className="h-9 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-sm"
                onClick={() => setIsAddHoursDialogOpen(true)}
                title="Add Date-Specific Hours"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Hours
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">

          <div className="space-y-3">
            {getDateSpecificAvailabilityData()?.dates?.map(
              (date: DateSpecificSettings) => (
                <div key={date.id} className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                        {format(date.date, "d")}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {format(date.date, "MMM d, yyyy")}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(date.date, "EEEE")}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {date.timeSlots.length} time slot{date.timeSlots.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  <div className="space-y-1">
                    {date.timeSlots.map((slot: TimeSlot) => (
                      <div key={slot.id} className="flex items-center gap-2">
                        <div className="bg-white border border-gray-200 rounded-lg px-2 py-1 flex items-center justify-between gap-2 flex-1 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900">
                                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              handleDeleteDateSlot(
                                date.id || date.date.toISOString(),
                                slot.id
                              )
                            }
                            className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                            title="Remove time slot"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}

            {(!getDateSpecificAvailabilityData()?.dates ||
              getDateSpecificAvailabilityData()?.dates.length === 0) && (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-base font-medium text-gray-900 mb-1">
                  No date-specific hours set
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  Add availability for specific dates to override your weekly schedule
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsAddHoursDialogOpen(true)}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Date
                </Button>
              </div>
            )}
          </div>
          </CardContent>
        </Card>
      </div>


      {/* Add Hours Dialog */}
      <Dialog
        open={isAddHoursDialogOpen}
        onOpenChange={setIsAddHoursDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Date-Specific Hours</DialogTitle>
            <DialogDescription>
              Select a date and set available hours for that specific day.
            </DialogDescription>
          </DialogHeader>

          {currentTemplate && (
            <div className="space-y-4 py-4">
              <div className="flex justify-center pb-4">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  className="rounded-md border"
                />
              </div>

              {selectedDate && (
                <DateSpecificForm
                  key={format(selectedDate, "yyyy-MM-dd")} // Add key prop to force re-render when date changes
                  initialData={prepareDateSpecificFormData()}
                  duration={currentTemplate.duration}
                  onSave={async (data) => {
                    // Merge the updated date with existing dates
                    const mergedData = mergeDateSpecificData(data);
                    await handleSaveTemplate(currentTemplate.id, mergedData);
                    setIsAddHoursDialogOpen(false);
                    setSelectedDate(undefined);
                  }}
                  onCancel={() => {
                    setIsAddHoursDialogOpen(false);
                    setSelectedDate(undefined);
                  }}
                  isInModal={true}
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Template Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Booking Page</DialogTitle>
            <DialogDescription>
              Create a new schedule template with a custom name
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="e.g., Interview Schedule, Client Meetings"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="interview-duration">Interview Duration</Label>
              <Select
                onValueChange={(value) => {
                  setTemplateDuration(parseInt(value));
                }}
                defaultValue="30"
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">Quick Interview (30 min)</SelectItem>
                  <SelectItem value="45">
                    Standard Interview (45 min)
                  </SelectItem>
                  <SelectItem value="60">Full Interview (60 min)</SelectItem>
                  <SelectItem value="90">Panel Interview (90 min)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="meeting-platform">Meeting Platform</Label>
              <Select
                onValueChange={(value) => {
                  setSelectedMeetingPlatform(value);
                }}
                defaultValue="google"
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select meeting platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">Google Meet</SelectItem>
                  <SelectItem value="teams">Microsoft Teams</SelectItem>
                  <SelectItem value="zoom">Zoom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setNewTemplateName("");
                setSelectedMeetingPlatform("google");
                setIsCreateDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateTemplate}>Create Booking Page</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Update the template name, duration, and meeting platform
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-template-name">Template Name</Label>
              <Input
                id="edit-template-name"
                value={editTemplateName}
                onChange={(e) => setEditTemplateName(e.target.value)}
                placeholder="e.g., Interview Schedule, Client Meetings"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="edit-interview-duration">Interview Duration</Label>
              <Select
                onValueChange={(value) => {
                  setEditTemplateDuration(parseInt(value));
                }}
                value={editTemplateDuration.toString()}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">Quick Interview (30 min)</SelectItem>
                  <SelectItem value="45">
                    Standard Interview (45 min)
                  </SelectItem>
                  <SelectItem value="60">Full Interview (60 min)</SelectItem>
                  <SelectItem value="90">Panel Interview (90 min)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-meeting-platform">Meeting Platform</Label>
              <Select
                onValueChange={(value) => {
                  setEditMeetingPlatform(value);
                }}
                value={editMeetingPlatform}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select meeting platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">Google Meet</SelectItem>
                  <SelectItem value="teams">Microsoft Teams</SelectItem>
                  <SelectItem value="zoom">Zoom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setTemplateToEdit(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditTemplate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              Delete Template
            </DialogTitle>
            <DialogDescription className="text-left">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">
                "{templateToDelete?.templateName}"
              </span>
              ? This action cannot be undone and will permanently remove all
              associated settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <div className="text-sm text-red-800">
                  <p className="font-medium">This will permanently delete:</p>
                  <ul className="mt-1 space-y-1 text-xs">
                    <li>• All event types and configurations</li>
                    <li>• Weekly and date-specific availability settings</li>
                    <li>• Advanced rules and email automation</li>
                    <li>• All associated scheduling data</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!templateToDelete) return;

                try {
                  // Call the backend API to delete the template
                  const response = await deleteAvailabilityTemplate(
                    templateToDelete.id
                  );

                  if (response.status) {
                    // Remove the deleted template from the templates list
                    const updatedTemplates = templates.filter(
                      (t) => t.id !== templateToDelete.id
                    );
                    setTemplates(updatedTemplates);

                    // Switch to the default template or first available template
                    if (updatedTemplates.length > 0) {
                      const defaultTemplate =
                        updatedTemplates.find(
                          (t) => t.templateName === "default"
                        ) || updatedTemplates[0];
                      setCurrentTemplate(defaultTemplate);
                    }

                    // Close modal and reset state
                    setIsDeleteDialogOpen(false);
                    setTemplateToDelete(null);

                    toast({
                      title: "Success",
                      description: `Template "${templateToDelete.templateName}" deleted successfully.`,
                    });
                  } else {
                    toast({
                      title: "Error",
                      description:
                        "Failed to delete template. Please try again.",
                    });
                  }
                } catch {
                  toast({
                    title: "Error",
                    description: "Failed to delete template. Please try again.",
                  });
                }
              }}
              className="flex-1"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
