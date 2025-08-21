"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import API from "@/http";
import type { AvailabilityTemplate, JobFormData } from "@/interfaces";
import {
  Calendar,
  CalendarClock,
  CalendarDays,
  Clock,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";

interface AvailabilityReviewProps {
  formData: JobFormData;
}

export function AvailabilityReview({ formData }: AvailabilityReviewProps) {
  const [template, setTemplate] = useState<AvailabilityTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setValue } = useFormContext();

  const { availabilityId } = formData;

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch all available templates
        const response = await API.availability.getAvailabilityTemplates();

        if (
          !response ||
          !response.availabilities ||
          response.availabilities.length === 0
        ) {
          setError("No availability templates found in the system.");
          setIsLoading(false);
          return;
        }

        // If no template ID is selected, select the first available one
        if (!availabilityId) {
          const firstTemplate = response.availabilities[0];
          setValue("availabilityId", firstTemplate.id);
          setTemplate(firstTemplate);
          toast.success("Default availability template selected automatically");
        } else {
          // Look for the template with the selected ID
          const foundTemplate = response.availabilities.find(
            (t) => t.id === availabilityId
          );

          if (foundTemplate) {
            setTemplate(foundTemplate);
          } else {
            // If selected template doesn't exist, select the first one
            const firstTemplate = response.availabilities[0];
            setValue("availabilityId", firstTemplate.id);
            setTemplate(firstTemplate);
            toast.success(
              "Selected template not found. Default template selected automatically"
            );
          }
        }
      } catch (err) {
        console.error("Error fetching availability template:", err);
        setError("Failed to load availability template details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplate();
  }, [availabilityId, setValue]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!template) {
    return (
      <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
        <AlertDescription>
          Loading availability template... Please wait or go back to the Booking
          Page step to select a template.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Booking Page</h2>
      </div>

      <Card className="overflow-hidden border-blue-200 bg-blue-50/50">
        <CardHeader className="bg-blue-100/50 border-b border-blue-200 pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
            <CalendarClock className="h-5 w-5 text-blue-600" />
            Selected Availability Template
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 pb-4">
          <div className="bg-white rounded-lg border border-blue-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>Timezone: {template.timezone}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>
                    Owner: {template.user.firstName} {template.user.lastName}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>
                    Meeting Platform:{" "}
                    {template.selectedMeetingPlatform || "Not specified"}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Available Event Types:
                </p>
                {template.eventTypes && template.eventTypes.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {template.eventTypes.map((eventType) => (
                      <Badge
                        key={eventType.id}
                        variant="secondary"
                        className="text-xs"
                        style={{
                          backgroundColor: `${eventType.color}20`,
                          color: eventType.color,
                        }}
                      >
                        {eventType.name} ({eventType.duration} min)
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No event types defined
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-500">
              <p>
                Last updated:{" "}
                {new Date(template.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
