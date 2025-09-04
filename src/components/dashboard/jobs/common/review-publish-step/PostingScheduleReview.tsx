import type { JobFormData } from "@/interfaces";

interface PostingScheduleReviewProps {
  formData: JobFormData;
}

export function PostingScheduleReview({
  formData,
}: PostingScheduleReviewProps) {
  const formatDate = (date: Date | string) => {
    if (!date) return "Not specified";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    if (!amount || amount === 0) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateDuration = (
    startDate: Date | string,
    endDate: Date | string
  ) => {
    if (!startDate || !endDate) return "Not specified";
    const start =
      typeof startDate === "string" ? new Date(startDate) : startDate;
    const end = typeof endDate === "string" ? new Date(endDate) : endDate;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  };

  const getTotalBudget = () => {
    const budgets = [
      formData.dailyBudget || 0,
      formData.monthlyBudget || 0,
      formData.indeedBudget || 0,
      formData.zipRecruiterBudget || 0,
    ];
    return budgets.reduce((sum, budget) => sum + budget, 0);
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Posting & Budget</h2>
        <p className="text-gray-600">
          Review posting schedule, budget allocation, and application settings.
        </p>
      </div>

      {/* Posting Schedule */}
      <div className="space-y-6">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          Posting Schedule
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Start Date
            </h4>
            <div className="text-gray-700 text-sm font-medium">
              {formatDate(formData.startDate || "")}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              End Date
            </h4>
            <div className="text-gray-700 text-sm font-medium">
              {formData.runIndefinitely
                ? "Indefinite"
                : formatDate(formData.endDate || "")}
            </div>
          </div>
        </div>

        {!formData.runIndefinitely &&
          formData.startDate &&
          formData.endDate && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Duration
              </h4>
              <div className="text-gray-700 text-sm font-medium">
                {calculateDuration(formData.startDate, formData.endDate)}
              </div>
            </div>
          )}

        {formData.runIndefinitely && (
          <div className="flex justify-end">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full shadow-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-800">
                Indefinite Posting - Active until manually deactivated
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Budget Information */}
      <div className="space-y-6">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          Budget Information
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Daily Budget
            </h4>
            <div className="text-gray-700 text-sm font-medium">
              {formatCurrency(formData.dailyBudget || 0)}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Monthly Budget
            </h4>
            <div className="text-gray-700 text-sm font-medium">
              {formatCurrency(formData.monthlyBudget || 0)}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Indeed Budget
            </h4>
            <div className="text-gray-700 text-sm font-medium">
              {formatCurrency(formData.indeedBudget || 0)}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              ZipRecruiter Budget
            </h4>
            <div className="text-gray-700 text-sm font-medium">
              {formatCurrency(formData.zipRecruiterBudget || 0)}
            </div>
          </div>
        </div>

        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-emerald-800 uppercase tracking-wide">
              Total Budget
            </span>
            <span className="text-2xl font-bold text-emerald-900">
              {formatCurrency(getTotalBudget())}
            </span>
          </div>
        </div>
      </div>

      {/* External Application Setup */}
      {formData.externalApplicationSetup && (
        <div className="space-y-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            External Application Setup
          </h3>

          {formData.externalApplicationSetup.redirectUrl && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Redirect URL
              </h4>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-700 text-sm font-medium break-all">
                  {formData.externalApplicationSetup.redirectUrl}
                </p>
              </div>
            </div>
          )}

          {formData.externalApplicationSetup.customFields &&
            formData.externalApplicationSetup.customFields.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Custom Fields
                </h4>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="space-y-2">
                    {formData.externalApplicationSetup.customFields.map(
                      (field, index) => (
                        <div
                          key={index}
                          className="text-gray-700 text-sm font-medium"
                        >
                          • {field}
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
        </div>
      )}

      {/* Custom Application URL */}
      {formData.customApplicationUrl && (
        <div className="space-y-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Custom Application URL
          </h3>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-gray-700 text-sm font-medium break-all">
              {formData.customApplicationUrl}
            </p>
          </div>
        </div>
      )}

      {/* Budget Recommendations */}
      {getTotalBudget() === 0 && (
        <div className="flex justify-end">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full shadow-sm">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            <span className="text-sm font-medium text-amber-800">
              No budget allocated - Consider setting a budget to increase job
              visibility
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
