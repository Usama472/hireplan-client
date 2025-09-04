import type { JobFormData } from "@/interfaces";

interface PositionDetailsReviewProps {
  formData: JobFormData;
}

export function PositionDetailsReview({
  formData,
}: PositionDetailsReviewProps) {
  const formatPayRate = (payRate: any) => {
    if (!payRate) return "Not specified";

    const formatAmount = (amount: number) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    const formatPeriod = (period: string) => {
      const periodMap: Record<string, string> = {
        "per-hour": "per hour",
        "per-day": "per day",
        "per-week": "per week",
        "per-month": "per month",
        "per-year": "per year",
      };
      return periodMap[period] || period;
    };

    switch (payRate.type) {
      case "range":
        return `${formatAmount(payRate.min)} - ${formatAmount(
          payRate.max
        )} ${formatPeriod(payRate.period || "per-year")}`;
      case "starting-amount":
        return `Starting at ${formatAmount(payRate.amount)} ${formatPeriod(
          payRate.period || "per-year"
        )}`;
      case "maximum-amount":
        return `Up to ${formatAmount(payRate.amount)} ${formatPeriod(
          payRate.period || "per-year"
        )}`;
      case "exact-amount":
        return `${formatAmount(payRate.amount)} ${formatPeriod(
          payRate.period || "per-year"
        )}`;
      default:
        return "Not specified";
    }
  };

  const formatEmploymentType = (type: string) => {
    return (
      type?.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase()) ||
      "Not specified"
    );
  };

  const formatHiringTimeline = (timeline: string) => {
    const timelineMap: Record<string, string> = {
      "1-3-days": "1-3 days",
      "3-7-days": "3-7 days",
      "1-2-weeks": "1-2 weeks",
      "2-4-weeks": "2-4 weeks",
      "more-than-4-weeks": "More than 4 weeks",
    };
    return timelineMap[timeline] || timeline;
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Position Details</h2>
        <p className="text-gray-600">
          Review your position requirements, compensation, and location details.
        </p>
      </div>

      {/* Company & Position Overview */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Company
            </h3>
            <div className="text-gray-600 text-sm font-medium">
              {formData.company || (
                <span className="text-gray-400 italic">Not specified</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Positions to Hire
            </h3>
            <div className="text-gray-600 text-sm font-medium">
              {formData.positionsToHire || (
                <span className="text-gray-400 italic">Not specified</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Work Setting
            </h3>
            <div className="text-gray-600 text-sm font-medium">
              {formData.workSetting || (
                <span className="text-gray-400 italic">Not specified</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Hiring Timeline
            </h3>
            <div className="text-gray-600 text-sm font-medium">
              {formatHiringTimeline(formData.hiringTimeline || "") || (
                <span className="text-gray-400 italic">Not specified</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Employment Details */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Employment Type
            </h3>
            <div className="text-gray-600 text-sm font-medium">
              {formatEmploymentType(formData.employmentType || "") || (
                <span className="text-gray-400 italic">Not specified</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Pay Type
            </h3>
            <div className="text-gray-600 text-sm font-medium capitalize">
              {formData.payType || (
                <span className="text-gray-400 italic">Not specified</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Compensation */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          Compensation
        </h3>
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="text-xl font-semibold text-emerald-900">
            {formatPayRate(formData.payRate)}
          </p>
          {formData.payRate && (
            <p className="text-sm text-emerald-700 mt-2">
              Pay structure:{" "}
              {formData.payRate.type
                .replace("-", " ")
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </p>
          )}
        </div>
      </div>

      {/* Location Information */}
      <div className="space-y-6">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          Location Details
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

        {formData.jobLocation && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Physical Location
            </h4>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-gray-700 space-y-1">
                {formData.jobLocation.address && (
                  <p className="font-medium">{formData.jobLocation.address}</p>
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

        {formData.remoteLocationRequirement?.required && (
          <div className="flex justify-end">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
              <span className="text-sm font-medium text-blue-800">
                Remote:{" "}
                {formData.remoteLocationRequirement.location || "Any location"}
              </span>
            </div>
          </div>
        )}

        {formData.jobLocationWorkType === "on-the-road" && (
          <div className="flex justify-end">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-full">
              <span className="text-sm font-medium text-orange-800">
                Operating Area: {formData.operatingArea || "Not specified"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
