import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Heart, Languages } from "lucide-react";
import type { JobFormData } from "@/interfaces";

interface HoursScheduleReviewProps {
  formData: JobFormData;
}

export function HoursScheduleReview({ formData }: HoursScheduleReviewProps) {
  const formatHoursPerWeek = (hours: any) => {
    if (!hours) return "Not specified";

    switch (hours.type) {
      case "fixed-hours":
        return `${hours.amount} hours per week`;
      case "range":
        return `${hours.min} - ${hours.max} hours per week`;
      case "minimum":
        return `Minimum ${hours.min} hours per week`;
      case "maximum":
        return `Maximum ${hours.max} hours per week`;
      default:
        return "Not specified";
    }
  };

  const formatSchedule = (schedule: string[]) => {
    if (!schedule || schedule.length === 0) return "Not specified";
    return schedule.join(", ");
  };

  const formatBenefits = (benefits: string[]) => {
    if (!benefits || benefits.length === 0) return "No benefits specified";
    return benefits.join(", ");
  };

  return (
    <div className="space-y-6">
      {/* Hours & Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Hours & Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                Hours Per Week
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900">
                  {formatHoursPerWeek(formData.hoursPerWeek)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                Language
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900">
                  {formData.language || "English"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">
              Work Schedule
            </label>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-900">
                {formatSchedule(formData.schedule || [])}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Benefits & Perks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">
              Benefits Offered
            </label>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-900">
                {formatBenefits(formData.benefits || [])}
              </p>
            </div>
            {(!formData.benefits || formData.benefits.length === 0) && (
              <p className="text-xs text-gray-500 mt-1">
                Consider adding benefits to attract more qualified candidates
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Work Location Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Work Location Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                Work Type
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900 capitalize">
                  {formData.jobLocationWorkType?.replace("-", " ") ||
                    "Not specified"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                Country
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900">
                  {formData.country || "United States"}
                </p>
              </div>
            </div>
          </div>

          {/* Remote Work Details */}
          {formData.jobLocationWorkType === "fully-remote" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                Remote Work Setup
              </label>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  This is a fully remote position
                </p>
                {formData.remoteLocationRequirement?.location && (
                  <p className="text-xs text-blue-600 mt-1">
                    Location requirement:{" "}
                    {formData.remoteLocationRequirement.location}
                  </p>
                )}
              </div>
            </div>
          )}

          {formData.jobLocationWorkType === "hybrid" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                Hybrid Work Setup
              </label>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  This position offers a hybrid work arrangement
                </p>
              </div>
            </div>
          )}

          {formData.jobLocationWorkType === "on-the-road" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                Travel Requirements
              </label>
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800">
                  This position requires travel
                </p>
                {formData.hasConsistentStartingLocation && (
                  <p className="text-xs text-orange-600 mt-1">
                    Has consistent starting location
                  </p>
                )}
                {formData.operatingArea && (
                  <p className="text-xs text-orange-600 mt-1">
                    Operating area: {formData.operatingArea}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Physical Location */}
          {formData.jobLocation &&
            formData.jobLocationWorkType !== "fully-remote" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Physical Location
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-900 space-y-1">
                    {formData.jobLocation.address && (
                      <p>{formData.jobLocation.address}</p>
                    )}
                    <p>
                      {[
                        formData.jobLocation.city,
                        formData.jobLocation.state,
                        formData.jobLocation.zipCode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    {formData.jobLocation.country && (
                      <p>{formData.jobLocation.country}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
