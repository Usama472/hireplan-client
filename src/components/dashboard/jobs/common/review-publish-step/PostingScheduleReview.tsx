import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  DollarSign,
  Clock,
  ExternalLink,
  Settings,
} from "lucide-react";
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
    <div className="space-y-6">
      {/* Posting Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Posting Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                Start Date
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900">
                  {formatDate(formData.startDate || "")}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                End Date
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900">
                  {formData.runIndefinitely
                    ? "Indefinite"
                    : formatDate(formData.endDate || "")}
                </p>
              </div>
            </div>
          </div>

          {!formData.runIndefinitely &&
            formData.startDate &&
            formData.endDate && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Duration
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-900">
                    {calculateDuration(formData.startDate, formData.endDate)}
                  </p>
                </div>
              </div>
            )}

          {formData.runIndefinitely && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">
                Indefinite Posting
              </p>
              <p className="text-xs text-blue-600 mt-1">
                This job will remain active until manually deactivated.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Budget Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                Daily Budget
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900">
                  {formatCurrency(formData.dailyBudget || 0)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                Monthly Budget
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900">
                  {formatCurrency(formData.monthlyBudget || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                Indeed Budget
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900">
                  {formatCurrency(formData.indeedBudget || 0)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                ZipRecruiter Budget
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900">
                  {formatCurrency(formData.zipRecruiterBudget || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">
                Total Budget
              </span>
              <span className="text-lg font-bold text-blue-900">
                {formatCurrency(getTotalBudget())}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* External Application Setup */}
      {formData.externalApplicationSetup && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              External Application Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.externalApplicationSetup.redirectUrl && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600">
                  Redirect URL
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-900 break-all">
                    {formData.externalApplicationSetup.redirectUrl}
                  </p>
                </div>
              </div>
            )}

            {formData.externalApplicationSetup.customFields &&
              formData.externalApplicationSetup.customFields.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">
                    Custom Fields
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="space-y-1">
                      {formData.externalApplicationSetup.customFields.map(
                        (field, index) => (
                          <div key={index} className="text-sm text-gray-900">
                            • {field}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      )}

      {/* Custom Application URL */}
      {formData.customApplicationUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Custom Application URL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-900 break-all">
                {formData.customApplicationUrl}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget Recommendations */}
      {getTotalBudget() === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Budget Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 font-medium">
                No budget allocated
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Consider setting a budget to increase job visibility and reach
                more candidates.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
