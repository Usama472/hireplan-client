import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { COMPANY_SIZES, INDUSTRIES } from "@/constants/form-constants";
import type { FormData } from "@/interfaces";
import { useFormContext } from "react-hook-form";
import { useState } from "react";
import { PrivacyPolicyContent } from "./PrivacyPolicyContent";
import { TermsOfServiceContent } from "./TermsOfServiceContent";

export function ReviewSubmitStep() {
  const { watch, setValue, formState: { errors } } = useFormContext<FormData>();
  const formData = watch();
  const privacyPolicyAccepted = watch("privacyPolicyAccepted");
  const termsOfServiceAccepted = watch("termsOfServiceAccepted");
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);

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

      {/* Privacy Policy and Terms of Service Consent */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Legal Agreements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="privacyPolicyAccepted"
                checked={privacyPolicyAccepted || false}
                onCheckedChange={(checked) => setValue("privacyPolicyAccepted", checked)}
                className="mt-1"
              />
              <div className="space-y-1">
                <Label 
                  htmlFor="privacyPolicyAccepted" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I have read and agree to the{" "}
                  <Dialog open={privacyDialogOpen} onOpenChange={setPrivacyDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-blue-600 hover:text-blue-800 underline"
                      >
                        Privacy Policy
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle>Privacy Policy</DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="h-[60vh] pr-4">
                        <PrivacyPolicyContent />
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                {errors.privacyPolicyAccepted && (
                  <p className="text-sm text-red-500">
                    {errors.privacyPolicyAccepted.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="termsOfServiceAccepted"
                checked={termsOfServiceAccepted || false}
                onCheckedChange={(checked) => setValue("termsOfServiceAccepted", checked)}
                className="mt-1"
              />
              <div className="space-y-1">
                <Label 
                  htmlFor="termsOfServiceAccepted" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I have read and agree to the{" "}
                  <Dialog open={termsDialogOpen} onOpenChange={setTermsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-blue-600 hover:text-blue-800 underline"
                      >
                        Terms of Service
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle>Terms of Service</DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="h-[60vh] pr-4">
                        <TermsOfServiceContent />
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                {errors.termsOfServiceAccepted && (
                  <p className="text-sm text-red-500">
                    {errors.termsOfServiceAccepted.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              By creating an account, you acknowledge that you have read and understood our privacy practices and agree to be bound by our terms of service.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
