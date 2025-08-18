import { Card, CardContent } from "@/components/ui/card";

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
    <div className="space-y-6">
      {/* Company & Position Overview */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">
                  Company
                </label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900 font-medium">
                    {formData.company || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">
                  Positions to Hire
                </label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900 font-medium">
                    {formData.positionsToHire || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">
                  Work Setting
                </label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900 font-medium">
                    {formData.workSetting || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">
                  Hiring Timeline
                </label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900 font-medium">
                    {formatHiringTimeline(formData.hiringTimeline || "")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employment Details */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">
                  Employment Type
                </label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900 font-medium">
                    {formatEmploymentType(formData.employmentType || "")}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">
                  Pay Type
                </label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900 font-medium capitalize">
                    {formData.payType || "Not specified"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compensation */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="p-6 bg-emerald-50 rounded-lg border border-emerald-200">
            <p className="text-lg font-semibold text-emerald-900">
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
        </CardContent>
      </Card>

      {/* Location Information */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">
                  Work Type
                </label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900 font-medium capitalize">
                    {formData.jobLocationWorkType?.replace("-", " ") ||
                      "Not specified"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">
                  Country
                </label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900 font-medium">
                    {formData.country || "United States"}
                  </p>
                </div>
              </div>
            </div>

            {formData.jobLocation && (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">
                  Physical Location
                </label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-gray-900 space-y-1">
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

            {formData.remoteLocationRequirement?.required && (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">
                  Remote Location Requirement
                </label>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-blue-900 font-medium">
                    {formData.remoteLocationRequirement.location ||
                      "Any location"}
                  </p>
                </div>
              </div>
            )}

            {formData.jobLocationWorkType === "on-the-road" && (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">
                  Operating Area
                </label>
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-orange-900 font-medium">
                    {formData.operatingArea || "Not specified"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
