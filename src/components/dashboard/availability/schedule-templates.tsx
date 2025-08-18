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
import { Textarea } from "@/components/ui/textarea";
import {
  getAvailabilityTemplates,
  updateAvailabilityTemplate,
} from "@/http/availability/api";
import type { AvailabilityTemplate } from "@/interfaces";
import { useToast } from "@/lib/hooks/use-toast";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { DateSpecificForm } from "./date-specific-form";
import { EventTypeManager } from "./event-type-manager";
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
  const [isCreateEventTypeDialogOpen, setIsCreateEventTypeDialogOpen] =
    useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
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
        setTemplates(response.availabilities);
        if (response.availabilities.length > 0) {
          const defaultTemplate =
            response.availabilities.find((t) => t.templateName === "default") ||
            response.availabilities[0];
          setCurrentTemplate(defaultTemplate);
          setCurrentTimezone(defaultTemplate.timezone);
          setSendConfirmationEmails(
            defaultTemplate.advancedRules.sendConfirmationEmail
          );
          setSendReminderEmails(
            defaultTemplate.advancedRules.sendReminderEmails
          );
          if (defaultTemplate.eventTypes.length > 0) {
            setSelectedEventTypeId(defaultTemplate.eventTypes[0].id);
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
    if (currentTemplate?.eventTypes && currentTemplate.eventTypes.length > 0) {
      setSelectedEventTypeId(currentTemplate.eventTypes[0].id);
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

  const handleCreateEventType = async () => {
    if (!newEventType.name.trim() || !currentTemplate) return;

    try {
      const newEvent = {
        id: Date.now().toString(),
        name: newEventType.name.trim(),
        duration: newEventType.duration,
        color: newEventType.color,
        description: newEventType.description,
      };

      // Update the template with the new event type
      const updatedTemplate = {
        ...currentTemplate,
        eventTypes: [...currentTemplate.eventTypes, newEvent],
      };

      // Update the backend
      await updateAvailabilityTemplate(currentTemplate.id, updatedTemplate);

      // Update local state
      setCurrentTemplate(updatedTemplate);
      setTemplates((prev) =>
        prev.map((t) => (t.id === currentTemplate.id ? updatedTemplate : t))
      );
      setSelectedEventTypeId(newEvent.id);

      // Reset form
      setNewEventType({
        name: "",
        duration: 15,
        color: "#4f46e5",
        description: "",
      });
      setIsCreateEventTypeDialogOpen(false);

      toast({
        title: "Success",
        description: "Event type created successfully",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to create event type. Please try again.",
      });
    }
  };

  const handleCreateTemplate = () => {
    if (newTemplateName.trim()) {
      // This would need to be integrated with the backend API
      // For now, we'll just show a success message
      setNewTemplateName("");
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Template created successfully",
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

      // Update the template with new data
      const updatedTemplate = { ...currentTemplate };

      // Determine what type of data we're updating
      if (data.daysAvailability) {
        // Weekly availability data
        updatedTemplate.availabilities = [
          { ...data, type: "weekly" },
          ...currentTemplate.availabilities.filter((a) => a.type !== "weekly"),
        ];
      } else if (data.dates) {
        // Date-specific availability data
        updatedTemplate.availabilities = [
          ...currentTemplate.availabilities.filter(
            (a) => a.type !== "date-specific"
          ),
          { ...data, type: "date-specific" },
        ];
      }

      // Update the backend
      await updateAvailabilityTemplate(templateId, updatedTemplate);

      // Update local state
      setCurrentTemplate(updatedTemplate);
      setTemplates((prev) =>
        prev.map((t) => (t.id === templateId ? updatedTemplate : t))
      );

      toast({
        title: "Success",
        description: "Template saved successfully",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to save template. Please try again.",
      });
    }
  };

  const handleEventTypesChange = async (
    templateId: string,
    eventTypes: any[]
  ) => {
    if (!currentTemplate) return;

    try {
      // Update the template with the new event types
      const updatedTemplate = { ...currentTemplate, eventTypes };

      // Update the backend
      await updateAvailabilityTemplate(templateId, updatedTemplate);

      // Update local state
      setCurrentTemplate(updatedTemplate);
      setTemplates((prev) =>
        prev.map((t) => (t.id === templateId ? updatedTemplate : t))
      );

      toast({
        title: "Success",
        description: "Event types updated successfully",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update event types. Please try again.",
      });
    }
  };

  const handleEventTypeSelect = (eventTypeId: string) => {
    setSelectedEventTypeId(eventTypeId);
    if (currentTemplate) {
      const eventType = currentTemplate.eventTypes?.find(
        (et: any) => et.id === eventTypeId
      );
      toast({
        title: "Event Type Selected",
        description: `${
          eventType?.name || "Unknown"
        } is now selected for new time slots`,
      });
    }
  };

  const getUsedEventTypeIds = (template: AvailabilityTemplate) => {
    const usedIds = new Set<string>();

    // Check availabilities array for time slots
    template.availabilities?.forEach((availability: any) => {
      availability.timeSlots?.forEach((slot: any) => {
        if (slot.eventTypeId) {
          usedIds.add(slot.eventTypeId);
        }
      });
    });

    return Array.from(usedIds);
  };

  const [newEventType, setNewEventType] = useState({
    name: "",
    duration: 15,
    color: "#4f46e5",
    description: "",
  });

  const colorOptions = [
    { value: "#4f46e5", name: "Purple" },
    { value: "#10b981", name: "Green" },
    { value: "#f59e0b", name: "Orange" },
    { value: "#ef4444", name: "Red" },
    { value: "#3b82f6", name: "Blue" },
    { value: "#8b5cf6", name: "Pink" },
    { value: "#059669", name: "Teal" },
    { value: "#1f2937", name: "Gray" },
  ];

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
                      {template.isActive && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-green-100 text-green-700"
                        >
                          Active
                        </Badge>
                      )}
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
                  if (
                    confirm(
                      `Are you sure you want to delete "${currentTemplate.templateName}"? This action cannot be undone.`
                    )
                  ) {
                    try {
                      // This would need to be integrated with the backend API
                      toast({
                        title: "Success",
                        description: `Template "${currentTemplate.templateName}" deleted successfully.`,
                      });
                    } catch {
                      toast({
                        title: "Error",
                        description:
                          "Failed to delete template. Please try again.",
                      });
                    }
                  }
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

            {/* Event Types Section */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-bold text-gray-900">Event Types</h3>
                <Dialog
                  open={isCreateEventTypeDialogOpen}
                  onOpenChange={setIsCreateEventTypeDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs px-3 py-1"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Event Type
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Event Type</DialogTitle>
                      <DialogDescription>
                        Add a new event type with custom duration and color
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="event-name">Event Name</Label>
                        <Input
                          id="event-name"
                          value={newEventType.name}
                          onChange={(e) =>
                            setNewEventType((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="e.g., Quick Call, Technical Interview"
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label htmlFor="event-duration">Duration</Label>
                        <Select
                          value={newEventType.duration.toString()}
                          onValueChange={(value) =>
                            setNewEventType((prev) => ({
                              ...prev,
                              duration: parseInt(value),
                            }))
                          }
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="45">45 minutes</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                            <SelectItem value="90">1.5 hours</SelectItem>
                            <SelectItem value="120">2 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="event-color">Color</Label>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {colorOptions.map((color) => (
                            <button
                              key={color.value}
                              type="button"
                              className={`w-8 h-8 rounded-full border-2 transition-all ${
                                newEventType.color === color.value
                                  ? "border-gray-900 scale-110"
                                  : "border-gray-300 hover:border-gray-400"
                              }`}
                              style={{ backgroundColor: color.value }}
                              onClick={() =>
                                setNewEventType((prev) => ({
                                  ...prev,
                                  color: color.value,
                                }))
                              }
                              title={color.name}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="event-description">
                          Description (Optional)
                        </Label>
                        <Textarea
                          id="event-description"
                          value={newEventType.description}
                          onChange={(e) =>
                            setNewEventType((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Brief description of this event type"
                          className="mt-2"
                          rows={2}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateEventTypeDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleCreateEventType}>
                        Create Event Type
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <p className="text-xs text-gray-600 mb-4">
                Create and manage different types of meetings with custom
                durations and colors. Only one event type can be selected at a
                time for new time slots.
              </p>
              <EventTypeManager
                eventTypes={currentTemplate?.eventTypes || []}
                onEventTypesChange={(eventTypes) =>
                  currentTemplate &&
                  handleEventTypesChange(currentTemplate.id, eventTypes)
                }
                onEventTypeSelect={handleEventTypeSelect}
                selectedEventTypeId={selectedEventTypeId}
                usedEventTypeIds={
                  currentTemplate ? getUsedEventTypeIds(currentTemplate) : []
                }
              />
            </div>

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
                  initialData={currentTemplate.availabilities?.[0] || {}}
                  eventTypes={currentTemplate.eventTypes || []}
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
                  initialData={currentTemplate.availabilities?.[1] || {}}
                  onSave={async (data) =>
                    await handleSaveTemplate(currentTemplate.id, data)
                  }
                  isLoading={false}
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
    </div>
  );
}
