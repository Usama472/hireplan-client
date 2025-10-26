import { InputField } from "@/components/common/InputField";
import { COMPANY_SIZES, INDUSTRIES } from "@/constants/form-constants";
import { INPUT_TYPES } from "@/interfaces";

export function CompanyInfoStep() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField name="companyName" placeholder="Company Name *" />
        <InputField
          name="websiteDomain"
          placeholder="Website (e.g., yourcompany.com) *"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          name="industry"
          type={INPUT_TYPES.SELECT}
          placeholder="Industry *"
          selectOptions={INDUSTRIES}
        />
        <InputField
          name="companySize"
          type={INPUT_TYPES.SELECT}
          placeholder="Company Size *"
          selectOptions={COMPANY_SIZES}
        />
      </div>

      <InputField name="address" placeholder="Company Address *" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InputField name="city" placeholder="City *" />
        <InputField name="state" placeholder="State *" />
        <InputField name="zipCode" placeholder="ZIP Code *" />
      </div>
    </div>
  );
}
