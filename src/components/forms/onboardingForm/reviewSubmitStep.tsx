import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COMPANY_SIZES, INDUSTRIES, PLANS } from "@/constants/form-constants";
import type { FormData } from "@/interfaces";
import { useFormContext } from "react-hook-form";

export function ReviewSubmitStep() {
  const { watch } = useFormContext<FormData>();
  const formData = watch();

  const selectedPlan = PLANS.find((plan) => plan.id === formData.plan);
  const selectedCompanySize = COMPANY_SIZES.find(
    (size) => size.value === formData.companySize
  );
  const selectedIndustry = INDUSTRIES.find(
    (industry) => industry.value === formData.industry
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Name:</span>
              <p className="text-sm">
                {formData.firstName} {formData.lastName}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Email:</span>
              <p className="text-sm">{formData.email}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">
                Job Title:
              </span>
              <p className="text-sm">{formData.jobTitle}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">
                Company:
              </span>
              <p className="text-sm">{formData.companyName}</p>
            </div>
            {formData.websiteDomain && (
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Website:
                </span>
                <p className="text-sm">{formData.websiteDomain}</p>
              </div>
            )}
            <div>
              <span className="text-sm font-medium text-gray-500">
                Industry:
              </span>
              <p className="text-sm">{selectedIndustry?.label}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">
                Company Size:
              </span>
              <p className="text-sm">{selectedCompanySize?.label}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">
                Address:
              </span>
              <p className="text-sm">
                {formData.address}
                <br />
                {formData.city}, {formData.state} {formData.zipCode}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Selected Plan</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedPlan && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{selectedPlan.name}</h3>
                  {selectedPlan.popular && (
                    <Badge variant="secondary">Most Popular</Badge>
                  )}
                </div>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold">
                    {selectedPlan.price}
                  </span>
                  <span className="text-gray-500 ml-1">
                    {selectedPlan.period}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {selectedPlan.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
