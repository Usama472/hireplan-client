import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Shield, Users, FileText } from "lucide-react";
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
    <div className="space-y-6">
      {/* Department Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Department Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                Department
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900">
                  {formatDepartment(
                    formData.department || "",
                    formData.customDepartment || ""
                  )}
                </p>
                {formData.customDepartment && (
                  <p className="text-xs text-gray-500 mt-1">
                    Custom department specified
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                EEO Job Category
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900">
                  {formData.eeoJobCategory || "Not specified"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Compliance Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">
              Exempt Status
            </label>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-900">
                {formatExemptStatus(formData.exemptStatus || "")}
              </p>
            </div>
          </div>

          {/* Compliance Notes */}
          <div className="space-y-3">
            {formData.exemptStatus === "exempt" && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 font-medium">
                  Exempt Employee
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  This position is exempt from overtime pay requirements under
                  the Fair Labor Standards Act (FLSA).
                </p>
              </div>
            )}

            {formData.exemptStatus === "non-exempt" && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800 font-medium">
                  Non-Exempt Employee
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  This position is eligible for overtime pay under the Fair
                  Labor Standards Act (FLSA).
                </p>
              </div>
            )}

            {formData.exemptStatus === "not-applicable" && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-800 font-medium">
                  Not Applicable
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Exempt status does not apply to this position type.
                </p>
              </div>
            )}

            {formData.eeoJobCategory && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 font-medium">
                  EEO Category Set
                </p>
                <p className="text-xs text-green-600 mt-1">
                  EEO job category is specified for compliance reporting.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Additional Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {!formData.department && !formData.customDepartment && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 font-medium">
                  Department Not Specified
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Consider specifying a department for better organization and
                  reporting.
                </p>
              </div>
            )}

            {!formData.eeoJobCategory && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 font-medium">
                  EEO Category Not Set
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Consider setting an EEO job category for compliance reporting
                  requirements.
                </p>
              </div>
            )}

            {!formData.exemptStatus && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 font-medium">
                  Exempt Status Not Set
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Consider specifying exempt status for proper wage and hour
                  compliance.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
