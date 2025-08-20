"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import API from "@/http";
import type { AvailabilityTemplate } from "@/interfaces";
import {
  AlertTriangle,
  Calendar,
  CalendarClock,
  Clock,
  Info,
  User,
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
    <div>
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-blue-600" />
            Booking Page Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`cursor-pointer transition-all duration-200 border rounded-lg p-4 hover:shadow-md ${
                  selectedTemplateId === template.id
                    ? "border-blue-500 bg-blue-50 shadow"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
                onClick={() => handleSelectTemplate(template.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <h3 className="text-sm font-medium">
                      {template.templateName}
                    </h3>
                  </div>
                  <Badge
                    variant={template.isActive ? "default" : "outline"}
                    className={
                      template.isActive
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-gray-100 text-gray-700 border-gray-200"
                    }
                  >
                    {template.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Clock className="h-3 w-3" />
                    <span>Timezone: {template.timezone}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <User className="h-3 w-3" />
                    <span>
                      {template.user.firstName} {template.user.lastName}
                    </span>
                  </div>

                  {template.eventTypes && template.eventTypes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.eventTypes.slice(0, 3).map((eventType) => (
                        <Badge
                          key={eventType.id}
                          variant="secondary"
                          className="text-xs"
                          style={{
                            backgroundColor: `${eventType.color}20`,
                            color: eventType.color,
                          }}
                        >
                          {eventType.name}
                        </Badge>
                      ))}
                      {template.eventTypes.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.eventTypes.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
