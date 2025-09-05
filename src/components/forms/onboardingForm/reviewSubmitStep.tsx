import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COMPANY_SIZES, INDUSTRIES } from "@/constants/form-constants";
import type { FormData } from "@/interfaces";
import { useFormContext } from "react-hook-form";

export function ReviewSubmitStep() {
  const { watch } = useFormContext<FormData>();
  const formData = watch();

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
              <span className="text-sm font-medium text-muted-foreground">Name:</span>
              <p className="text-sm text-foreground">
                {formData.firstName} {formData.lastName}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Email:</span>
              <p className="text-sm text-foreground">{formData.email}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Job Title:
              </span>
              <p className="text-sm text-foreground">{formData.jobTitle}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Company:
              </span>
              <p className="text-sm text-foreground">{formData.companyName}</p>
            </div>
            {formData.websiteDomain && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  Website:
                </span>
                <p className="text-sm text-foreground">{formData.websiteDomain}</p>
              </div>
            )}
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Industry:
              </span>
              <p className="text-sm text-foreground">{selectedIndustry?.label}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Company Size:
              </span>
              <p className="text-sm text-foreground">{selectedCompanySize?.label}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">
                Address:
              </span>
              <p className="text-sm text-foreground">
                {formData.address}
                <br />
                {formData.city}, {formData.state} {formData.zipCode}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
