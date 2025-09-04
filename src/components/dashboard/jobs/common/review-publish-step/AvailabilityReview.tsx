"use client";

import API from "@/http";
import type { AvailabilityTemplate, JobFormData } from "@/interfaces";
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
      <div className="flex justify-end">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-full shadow-sm">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span className="text-sm font-medium text-red-800">{error}</span>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex justify-end">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full shadow-sm">
          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
          <span className="text-sm font-medium text-amber-800">
            Loading availability template... Please wait or go back to the
            Booking Page step to select a template.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Booking Page</h2>
        <p className="text-gray-600">
          Review the selected availability template and scheduling
          configuration.
        </p>
      </div>

      {/* Selected Availability Template */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Selected Availability Template
          </h3>
          <div
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${
              template.isActive
                ? "bg-emerald-50 border border-emerald-200"
                : "bg-gray-50 border border-gray-200"
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                template.isActive ? "bg-emerald-500" : "bg-gray-500"
              }`}
            ></div>
            <span
              className={`text-xs font-medium ${
                template.isActive ? "text-emerald-700" : "text-gray-700"
              }`}
            >
              {template.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="space-y-6">
            {/* Template Name */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Template Name
              </h4>
              <div className="text-gray-700 text-lg font-medium">
                {template.templateName}
              </div>
            </div>

            {/* Template Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Timezone
                  </h4>
                  <div className="text-gray-700 text-sm font-medium">
                    {template.timezone}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Owner
                  </h4>
                  <div className="text-gray-700 text-sm font-medium">
                    {template.user.firstName} {template.user.lastName}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Meeting Platform
                  </h4>
                  <div className="text-gray-700 text-sm font-medium">
                    {template.selectedMeetingPlatform || "Not specified"}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                    Available Event Types
                  </h4>
                  {template.eventTypes && template.eventTypes.length > 0 ? (
                    <div className="space-y-2">
                      {template.eventTypes.map((eventType) => (
                        <div
                          key={eventType.id}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg"
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: eventType.color }}
                          ></div>
                          <span className="text-gray-700 text-sm font-medium">
                            {eventType.name} ({eventType.duration} min)
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-400 italic text-sm">
                      No event types defined
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Last Updated */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Last Updated
              </h4>
              <div className="text-gray-700 text-sm font-medium">
                {new Date(template.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
