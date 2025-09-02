"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { DateSpecificForm } from "./date-specific-form";
import { WeeklyAvailabilityForm } from "./weekly-availability-form";

interface ScheduleTemplatesProps {
  onTemplateChange?: (template: any) => void;
}

export function ScheduleTemplates({
  onTemplateChange,
}: ScheduleTemplatesProps) {
  const [templates, setTemplates] = useState<AvailabilityTemplate[]>([]);
  const [currentTemplate, setCurrentTemplate] =
    useState<AvailabilityTemplate | null>(null);
  const [selectedEventTypeId, setSelectedEventTypeId] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] =
    useState<AvailabilityTemplate | null>(null);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [templateDuration, setTemplateDuration] = useState(30);
  const [activeTab, setActiveTab] = useState("overview");
  const [currentTimezone, setCurrentTimezone] =
    useState<string>("America/New_York");
  const [sendConfirmationEmails, setSendConfirmationEmails] = useState(false);
  const [sendReminderEmails, setSendReminderEmails] = useState(false);
  const { toast } = useToast();

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
          setCurrentTimezone(defaultTemplate.timezone);
          setSendConfirmationEmails(
            defaultTemplate.advancedRules.sendConfirmationEmail
          );
          setSendReminderEmails(
            defaultTemplate.advancedRules.sendReminderEmails
          );
          if (defaultTemplate.duration) {
            setTemplateDuration(defaultTemplate.duration);
          }
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
    // Set advanced rules from template
    if (currentTemplate?.advancedRules) {
      setSendConfirmationEmails(
        currentTemplate.advancedRules.sendConfirmationEmail
      );
      setSendReminderEmails(currentTemplate.advancedRules.sendReminderEmails);
    }
  }, [currentTemplate]);

  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim()) return;

    try {
      const response = await createAvailabilityTemplate(
        newTemplateName.trim(),
        templateDuration
      );
      if (response.status) {
        setTemplates((prev) => [...prev, response.availability]);
        setCurrentTemplate(response.availability);
        setNewTemplateName("");
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
          .filter((day: any) => day.isAvailable && day.timeSlots.length > 0)
          .map((day: any) => ({
            type: "weekDay",
            day: day.day,
            slots: day.timeSlots.map((slot: any) => ({
              from: slot.startTime,
              to: slot.endTime,
            })),
          }));

        availabilityPayload = [...availabilityPayload, ...weeklyAvailability];
      } else if (data.dates) {
        // Date-specific availability data
        const dateSpecificAvailability = data.dates
          .filter((date: any) => date.timeSlots.length > 0)
          .map((date: any) => ({
            type: "date",
            date: format(date.date, "yyyy-MM-dd"),
            slots: date.timeSlots.map((slot: any) => ({
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
    } catch {
      toast({
        title: "Error",
        description: "Failed to save availability. Please try again.",
      });
    }
  };

  const handleTimezoneChange = async (newTimezone: string) => {
    if (!currentTemplate) return;

    try {
      setCurrentTimezone(newTimezone);

      // Update the template with the new timezone
      const updatedTemplate = { ...currentTemplate, timezone: newTimezone };

      // Update the backend
      await updateAvailabilityTemplate(currentTemplate.id, updatedTemplate);

      // Update local state
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

  const handleAdvancedRulesChange = async (
    field: "sendConfirmationEmail" | "sendReminderEmails",
    value: boolean
  ) => {
    if (!currentTemplate) return;

    try {
      // Update local state immediately for UI responsiveness
      if (field === "sendConfirmationEmail") {
        setSendConfirmationEmails(value);
      } else if (field === "sendReminderEmails") {
        setSendReminderEmails(value);
      }

      // Update the template with the new advanced rules
      const updatedTemplate = {
        ...currentTemplate,
        advancedRules: {
          ...currentTemplate.advancedRules,
          [field]: value,
        },
      };

      // Update the backend
      await updateAvailabilityTemplate(currentTemplate.id, updatedTemplate);

      // Update local state
      setCurrentTemplate(updatedTemplate);
      setTemplates((prev) =>
        prev.map((t) => (t.id === currentTemplate.id ? updatedTemplate : t))
      );

      toast({
        title: "Settings Updated",
        description: "Advanced rules updated successfully",
      });
    } catch {
      // Revert local state on error
      if (field === "sendConfirmationEmail") {
        setSendConfirmationEmails(!value);
      } else if (field === "sendReminderEmails") {
        setSendReminderEmails(!value);
      }

      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Booking Pages</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage multiple schedule configurations
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              New Booking
            </Button>
          </DialogTrigger>
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
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateTemplate}>
                Create Booking Page
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Template Selection and Management */}
      <div className="space-y-4">
        {/* Template Selection */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Select
              value={currentTemplate?.id}
              onValueChange={handleTemplateChange}
            >
              <SelectTrigger className="w-80">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center gap-2">
                      <span>{template.templateName}</span>
                      {template.templateName === "default" && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                      {/* {template.isActive && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-green-100 text-green-700"
                        >
                          Active
                        </Badge>
                      )} */}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Delete Template Button - Only show for non-default templates */}
            {currentTemplate && currentTemplate.templateName !== "default" && (
              <Button
                size="sm"
                variant="outline"
                className="text-xs px-3 py-1 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                onClick={() => {
                  setTemplateToDelete(currentTemplate);
                  setIsDeleteDialogOpen(true);
                }}
              >
                <svg
                  className="w-3 h-3 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-9">
            <TabsTrigger
              value="overview"
              className="text-xs data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="weekly"
              className="text-xs data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              Weekly
            </TabsTrigger>
            <TabsTrigger
              value="date-specific"
              className="text-xs data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              Date Specific
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-8">
            {/* Timezone Section */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Timezone</h3>
              <p className="text-xs text-gray-600 mb-4">
                Set the timezone for your schedule. All times will be displayed
                and managed in this timezone.
              </p>
              <div className="flex items-center gap-3">
                <Select
                  value={currentTimezone}
                  onValueChange={handleTimezoneChange}
                >
                  <SelectTrigger className="w-80">
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
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Current: {currentTimezone || "Not set"}</span>
                </div>
              </div>
            </div>

            {/* Event Types Section - Removed */}

            {/* Meeting Platform Section */}
            <div className="mt-4">
              <h3 className="text-lg font-bold text-gray-900">
                Select Meeting Platform
              </h3>
              <p className="text-xs text-gray-600 mb-4">
                Choose your preferred video conferencing platform for
                interviews. Currently, Google Meet is fully integrated and ready
                to use.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Google Meet - Enabled */}
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-green-900 text-sm">
                        Google Meet
                      </h4>
                      <p className="text-xs text-green-700">Active</p>
                    </div>
                  </div>
                </div>

                {/* Microsoft Teams - Disabled */}
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-400 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 text-sm">
                        Microsoft Teams
                      </h4>
                      <p className="text-xs text-gray-600">Coming Soon</p>
                    </div>
                  </div>
                </div>

                {/* Zoom - Disabled */}
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-400 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 text-sm">
                        Zoom
                      </h4>
                      <p className="text-xs text-gray-600">Coming Soon</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Rules Section */}
            <div className="mt-4">
              <h3 className="text-lg font-bold text-gray-900">
                Advanced Rules
              </h3>
              <p className="text-xs text-gray-600 mb-4">
                Configure email automation rules for your interview scheduling
                process.
              </p>
              <div className="space-y-4">
                {/* Send Confirmation Emails */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">
                      Send Confirmation Emails
                    </h4>
                    <p className="text-xs text-gray-600">
                      Automatically send confirmation emails when interviews are
                      scheduled
                    </p>
                  </div>
                  <Switch
                    checked={sendConfirmationEmails}
                    onCheckedChange={(checked) =>
                      handleAdvancedRulesChange(
                        "sendConfirmationEmail",
                        checked
                      )
                    }
                  />
                </div>

                {/* Send Reminder Emails */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">
                      Send Reminder Emails
                    </h4>
                    <p className="text-xs text-gray-600">
                      Automatically send reminder emails before scheduled
                      interviews
                    </p>
                  </div>
                  <Switch
                    checked={sendReminderEmails}
                    onCheckedChange={(checked) =>
                      handleAdvancedRulesChange("sendReminderEmails", checked)
                    }
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="weekly" className="mt-4">
            <div className="space-y-3">
              <h3 className="text-base font-medium text-gray-900">
                Weekly Availability
              </h3>
              <p className="text-xs text-gray-600 mb-3">
                Set recurring weekly availability patterns
              </p>
              {currentTemplate ? (
                <WeeklyAvailabilityForm
                  initialData={
                    currentTemplate.availabilities?.find(
                      (a) => a.type === "weekly"
                    ) || {
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
                    }
                  }
                  duration={currentTemplate.duration}
                  onSave={async (data) =>
                    await handleSaveTemplate(currentTemplate.id, data)
                  }
                  onCancel={() => {}}
                  isLoading={false}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Please select a template to configure weekly availability
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="date-specific" className="mt-4">
            <div className="space-y-3">
              <h3 className="text-base font-medium text-gray-900">
                Date-Specific Availability
              </h3>
              <p className="text-xs text-gray-600 mb-3">
                Configure availability for specific calendar dates
              </p>
              {currentTemplate ? (
                <DateSpecificForm
                  initialData={
                    currentTemplate.availabilities?.find(
                      (a) => a.type === "date-specific"
                    ) || {
                      type: "date-specific",
                      dates: [],
                    }
                  }
                  onSave={async (data) =>
                    await handleSaveTemplate(currentTemplate.id, data)
                  }
                  isLoading={false}
                  duration={currentTemplate.duration}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Please select a template to configure date-specific
                  availability
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-red-600"
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
                      setCurrentTimezone(defaultTemplate.timezone);
                      setSendConfirmationEmails(
                        defaultTemplate.advancedRules.sendConfirmationEmail
                      );
                      setSendReminderEmails(
                        defaultTemplate.advancedRules.sendReminderEmails
                      );
                      if (defaultTemplate.eventTypes.length > 0) {
                        setSelectedEventTypeId(
                          defaultTemplate.eventTypes[0].id
                        );
                      }
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
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
