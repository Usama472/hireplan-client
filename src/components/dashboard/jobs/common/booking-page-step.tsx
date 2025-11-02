"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import API from "@/http";
import type { AvailabilityTemplate } from "@/interfaces";
import {
  AlertTriangle,
  CalendarClock,
  Clock,
  Info,
  User,
  Video,
  Mail,
  Globe,
  CalendarDays,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

export function BookingPageStep() {
  const [templates, setTemplates] = useState<AvailabilityTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();
  const selectedTemplateId = watch("availabilityId");

  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch availability templates from API
        const response = await API.availability.getAvailabilityTemplates();
        if (response && response.availabilities) {
          setTemplates(response.availabilities);

          // If there's only one template, auto-select it
          if (response.availabilities.length === 1 && !selectedTemplateId) {
            setValue("availabilityId", response.availabilities[0].id);
          }
        } else {
          setTemplates([]);
        }
      } catch (error) {
        console.error("Error fetching availability templates:", error);
        setError("Failed to load booking pages. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, [setValue, selectedTemplateId]);

  const handleSelectTemplate = (templateId: string) => {
    setValue("availabilityId", templateId, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="mb-4 sm:mb-6 shadow-none border border-gray-200 rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <CalendarClock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            Booking Page Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs sm:text-sm text-gray-600 mb-4">
            Select an availability template that candidates will use to schedule
            interviews. Each template contains its own schedule, event types,
            and availability settings.
            <span className="text-red-600 ml-1 font-medium">*</span>
          </p>

          {errors.availabilityId && (
            <Alert
              variant="destructive"
              className="mb-4 bg-red-50 border-red-200"
            >
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {typeof errors.availabilityId.message === "string"
                  ? errors.availabilityId.message
                  : "Please select an availability template"}
              </AlertDescription>
            </Alert>
          )}

          {isLoading && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isLoading && templates.length === 0 && (
            <Alert className="mb-4 bg-amber-50 border-amber-200 text-amber-800">
              <Info className="h-4 w-4 text-amber-600" />
              <AlertDescription>
                No booking pages found. Please create booking page templates in
                the Availability section first.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            {templates.map((template) => {
              const defaultDuration =
                template.duration || template.eventTypes?.[0]?.duration;
              const durationText = defaultDuration
                ? `${defaultDuration} min`
                : "N/A";
              const hasEventTypes =
                template.eventTypes && template.eventTypes.length > 0;
              const totalEventTypes = template.eventTypes?.length || 0;

              return (
                <div
                  key={template.id}
                  className={`cursor-pointer transition-all duration-200 border-2 rounded-xl p-4 sm:p-5 ${
                    selectedTemplateId === template.id
                      ? "border-blue-500 bg-blue-50/50 shadow-lg ring-2 ring-blue-200"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg"
                  }`}
                  onClick={() => handleSelectTemplate(template.id)}
                >
                  {/* Header Section */}
                  <div className="flex items-start justify-between mb-4 gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div
                        className={`p-2 rounded-lg flex-shrink-0 ${
                          selectedTemplateId === template.id
                            ? "bg-blue-100"
                            : "bg-gray-100"
                        }`}
                      >
                        <CalendarClock
                          className={`h-5 w-5 ${
                            selectedTemplateId === template.id
                              ? "text-blue-600"
                              : "text-gray-600"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 mb-1">
                          {template.templateName}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant={template.isActive ? "default" : "outline"}
                            className={
                              template.isActive
                                ? "bg-green-100 text-green-700 border-green-200 text-xs"
                                : "bg-gray-100 text-gray-700 border-gray-200 text-xs"
                            }
                          >
                            {template.isActive ? (
                              <>
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Inactive
                              </>
                            )}
                          </Badge>
                          {selectedTemplateId === template.id && (
                            <Badge className="bg-blue-600 text-white text-xs">
                              Selected
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Information Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* Default Duration */}
                    <div className="flex items-center gap-2 text-sm">
                      <div className="p-1.5 bg-purple-50 rounded text-purple-600">
                        <Clock className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="text-sm font-medium text-gray-900">
                          {durationText}
                        </p>
                      </div>
                    </div>

                    {/* Timezone */}
                    <div className="flex items-center gap-2 text-sm">
                      <div className="p-1.5 bg-blue-50 rounded text-blue-600">
                        <Globe className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500">Timezone</p>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {template.timezone}
                        </p>
                      </div>
                    </div>

                    {/* Meeting Platform */}
                    {template.selectedMeetingPlatform && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="p-1.5 bg-indigo-50 rounded text-indigo-600">
                          <Video className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">Platform</p>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {template.selectedMeetingPlatform}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Booking Window */}
                    {template.bookingWindowDays && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="p-1.5 bg-emerald-50 rounded text-emerald-600">
                          <CalendarDays className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500">
                            Booking Window
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {template.bookingWindowDays} day
                            {template.bookingWindowDays !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Event Types Section */}
                  {hasEventTypes && (
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-gray-700">
                          Event Types ({totalEventTypes})
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {template.eventTypes.slice(0, 4).map((eventType) => (
                          <Badge
                            key={eventType.id}
                            variant="secondary"
                            className="text-xs font-medium px-2.5 py-1"
                            style={{
                              backgroundColor: `${eventType.color}15`,
                              color: eventType.color,
                              borderColor: `${eventType.color}40`,
                              borderWidth: "1px",
                            }}
                          >
                            {eventType.name}
                            {eventType.duration && (
                              <span className="ml-1.5 text-xs opacity-75">
                                • {eventType.duration}m
                              </span>
                            )}
                          </Badge>
                        ))}
                        {totalEventTypes > 4 && (
                          <Badge
                            variant="outline"
                            className="text-xs px-2.5 py-1 border-gray-300"
                          >
                            +{totalEventTypes - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Footer Information */}
                  <div className="space-y-2">
                    {/* Owner */}
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <User className="h-3.5 w-3.5 text-gray-400" />
                      <span className="font-medium">
                        {template.user.firstName} {template.user.lastName}
                      </span>
                    </div>

                    {/* Email Notifications */}
                    {template.advancedRules && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                        <span>
                          {template.advancedRules.sendConfirmationEmail &&
                          template.advancedRules.sendReminderEmails
                            ? "Email notifications enabled"
                            : template.advancedRules.sendConfirmationEmail
                            ? "Confirmation emails enabled"
                            : template.advancedRules.sendReminderEmails
                            ? "Reminder emails enabled"
                            : "No email notifications"}
                        </span>
                      </div>
                    )}

                    {/* Holiday Exclusions */}
                    {(template.excludeFederalHolidays ||
                      template.excludeReligiousHolidays) && (
                      <div className="flex items-center gap-2 text-xs text-amber-700">
                        <Info className="h-3.5 w-3.5 text-amber-600" />
                        <span>
                          {template.excludeFederalHolidays &&
                          template.excludeReligiousHolidays
                            ? "Excludes federal & religious holidays"
                            : template.excludeFederalHolidays
                            ? "Excludes federal holidays"
                            : "Excludes religious holidays"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
