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
    <div className="space-y-8">
      {/* Section Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Hours & Schedule</h2>
        <p className="text-gray-600">
          Review work hours, schedule, benefits, and location requirements.
        </p>
      </div>

      {/* Hours & Schedule */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Hours Per Week
            </h3>
            <div className="text-gray-600 text-sm font-medium">
              {formatHoursPerWeek(formData.hoursPerWeek) || (
                <span className="text-gray-400 italic">Not specified</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Language
            </h3>
            <div className="text-gray-600 text-sm font-medium">
              {formData.language || "English"}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Work Schedule
          </h3>
          <div className="text-gray-600 text-sm font-medium">
            {formatSchedule(formData.schedule || []) || (
              <span className="text-gray-400 italic">Not specified</span>
            )}
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          Benefits & Perks
        </h3>
        <div className="text-gray-600 text-sm font-medium">
          {formatBenefits(formData.benefits || []) || (
            <span className="text-gray-400 italic">No benefits specified</span>
          )}
        </div>
        {(!formData.benefits || formData.benefits.length === 0) && (
          <div className="flex justify-end">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full">
              <span className="text-sm font-medium text-amber-800">
                Consider adding benefits to attract more qualified candidates
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Work Location Details */}
      <div className="space-y-6">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          Work Location Details
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Work Type
            </h4>
            <div className="text-gray-600 text-sm font-medium capitalize">
              {formData.jobLocationWorkType?.replace("-", " ") || (
                <span className="text-gray-400 italic">Not specified</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Country
            </h4>
            <div className="text-gray-600 text-sm font-medium">
              {formData.country || "United States"}
            </div>
          </div>
        </div>

        {/* Physical Location */}
        {formData.jobLocation &&
          formData.jobLocationWorkType !== "fully-remote" && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Physical Location
              </h4>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="text-gray-700 space-y-1">
                  {formData.jobLocation.address && (
                    <p className="font-medium">
                      {formData.jobLocation.address}
                    </p>
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

        {/* Work Type Badges */}
        {formData.jobLocationWorkType === "fully-remote" && (
          <div className="flex justify-end">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
              <span className="text-sm font-medium text-blue-800">
                Remote:{" "}
                {formData.remoteLocationRequirement?.location || "Any location"}
              </span>
            </div>
          </div>
        )}

        {formData.jobLocationWorkType === "hybrid" && (
          <div className="flex justify-end">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
              <span className="text-sm font-medium text-green-800">
                Hybrid work arrangement
              </span>
            </div>
          </div>
        )}

        {formData.jobLocationWorkType === "on-the-road" && (
          <div className="flex justify-end">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-full">
              <span className="text-sm font-medium text-orange-800">
                Travel required: {formData.operatingArea || "Various locations"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
