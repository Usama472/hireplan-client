import type { JobFormData } from "@/interfaces";

interface ComplianceReviewProps {
  formData: JobFormData;
}

export function ComplianceReview({ formData }: ComplianceReviewProps) {
  const formatExemptStatus = (status: string) => {
    if (!status) return "Not specified";
    return status.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatDepartment = (department: string, customDepartment: string) => {
    if (customDepartment) return customDepartment;
    if (department) return department;
    return "Not specified";
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Compliance & Department
        </h2>
        <p className="text-gray-600">
          Review department information, compliance requirements, and regulatory
          details.
        </p>
      </div>

      {/* Department Information */}
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Department
            </h3>
            <div className="text-gray-700 text-base font-medium">
              {formatDepartment(
                formData.department || "",
                formData.customDepartment || ""
              ) || <span className="text-gray-400 italic">Not specified</span>}
            </div>
            {formData.customDepartment && (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded-full">
                <span className="text-xs font-medium text-blue-700">
                  Custom
                </span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              EEO Job Category
            </h3>
            <div className="text-gray-700 text-base font-medium">
              {formData.eeoJobCategory || (
                <span className="text-gray-400 italic">Not specified</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Details */}
      <div className="space-y-8">
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Exempt Status
          </h3>
          <div className="text-gray-700 text-base font-medium">
            {formatExemptStatus(formData.exemptStatus || "") || (
              <span className="text-gray-400 italic">Not specified</span>
            )}
          </div>
        </div>

        {/* Compliance Status Badges */}
        <div className="flex flex-wrap gap-3 justify-end">
          {formData.exemptStatus === "exempt" && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full shadow-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-800">
                Exempt Employee
              </span>
            </div>
          )}

          {formData.exemptStatus === "non-exempt" && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-full shadow-sm">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm font-medium text-orange-800">
                Non-Exempt Employee
              </span>
            </div>
          )}

          {formData.exemptStatus === "not-applicable" && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full shadow-sm">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-800">
                Not Applicable
              </span>
            </div>
          )}

          {formData.eeoJobCategory && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full shadow-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-sm font-medium text-emerald-800">
                EEO Compliant
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      {(formData.department || formData.customDepartment) &&
      formData.eeoJobCategory &&
      formData.exemptStatus ? null : (
        <div className="space-y-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Recommendations
          </h3>
          <div className="flex flex-wrap gap-3 justify-end">
            {!formData.department && !formData.customDepartment && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full shadow-sm">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="text-sm font-medium text-amber-800">
                  Add Department
                </span>
              </div>
            )}

            {!formData.eeoJobCategory && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full shadow-sm">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="text-sm font-medium text-amber-800">
                  Set EEO Category
                </span>
              </div>
            )}

            {!formData.exemptStatus && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full shadow-sm">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span className="text-sm font-medium text-amber-800">
                  Set Exempt Status
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
