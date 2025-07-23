"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InputField } from "@/components/common/InputField";
import { INPUT_TYPES } from "@/interfaces";
import { Building2 } from "lucide-react";

const industryOptions = [
  { value: "technology", label: "Technology" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance" },
  { value: "education", label: "Education" },
  { value: "retail", label: "Retail" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "other", label: "Other" },
];

const companySizeOptions = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "501-1000", label: "501-1000 employees" },
  { value: "1000+", label: "1000+ employees" },
];

const countryOptions = [
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "UK", label: "United Kingdom" },
  { value: "AU", label: "Australia" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "PK", label: "Pakistan" },
];

export function CompanyInfoForm() {
  return (
    <Card className="border-0 shadow-lg shadow-gray-100/50">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-2 text-xl">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          Company Information
        </CardTitle>
        <CardDescription className="text-base">
          Manage your company details and business information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            name="company.companyName"
            type={INPUT_TYPES.TEXT}
            placeholder="Enter company name"
            label="Company Name"
          />
          <InputField
            name="company.websiteUrl"
            type={INPUT_TYPES.TEXT}
            placeholder="https://example.com"
            label="Website URL"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            type={INPUT_TYPES.SELECT}
            name="company.industry"
            label="Industry"
            placeholder="Select industry"
            selectOptions={industryOptions}
          />
          <InputField
            type={INPUT_TYPES.SELECT}
            name="company.companySize"
            label="Company Size"
            placeholder="Select company size"
            selectOptions={companySizeOptions}
          />
        </div>

        <InputField
          name="company.address"
          type={INPUT_TYPES.TEXT}
          placeholder="Enter street address"
          label="Address"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputField
            name="company.city"
            type={INPUT_TYPES.TEXT}
            placeholder="Enter city"
            label="City"
          />
          <InputField
            name="company.state"
            type={INPUT_TYPES.TEXT}
            placeholder="Enter state"
            label="State/Province"
          />
          <InputField
            name="company.zipCode"
            type={INPUT_TYPES.TEXT}
            placeholder="Enter zip code"
            label="Zip Code"
          />
        </div>

        <InputField
          name="company.country"
          label="Country"
          placeholder="Select country"
          selectOptions={countryOptions}
        />
      </CardContent>
    </Card>
  );
}
