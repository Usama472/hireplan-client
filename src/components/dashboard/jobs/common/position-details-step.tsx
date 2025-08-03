"use client";

import { InputField } from "@/components/common/InputField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  DEPARTMENTS,
  EDUCATION_REQUIREMENTS,
  EEO_JOB_CATEGORIES,
  EMPLOYMENT_TYPES,
  EXEMPT_STATUSES,
  JOB_STATUSES,
  WORKPLACE_TYPES,
} from "@/constants";
import { INPUT_TYPES } from "@/interfaces";
import { useLocationFields } from "@/lib/hooks/useLocationFields";
import {
  Plus,
  X,
  MapPin,
  Briefcase,
  DollarSign,
  Users,
  Building,
  Settings,
  Target,
} from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

export const PayType = {
  SALARY: "salary",
  HOURLY: "hourly",
};

export function PositionDetailsStep() {
  const { watch, setValue } = useFormContext();
  const [customDepartment, setCustomDepartment] = useState("");
  const [newRequirement, setNewRequirement] = useState("");

  const { stateOptions, cityOptions } = useLocationFields({
    stateFieldName: "jobLocation.state",
    cityFieldName: "jobLocation.city",
  });

  const payType = watch("payType") || PayType.SALARY;
  const payRateType = watch("payRate.type") || "fixed";
  const jobRequirements = watch("jobRequirements") || [];

  const addCustomDepartment = () => {
    if (customDepartment.trim()) {
      setValue("department", customDepartment.trim());
      setValue("customDepartment", customDepartment.trim());
      setCustomDepartment("");
    }
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setValue("jobRequirements", [...jobRequirements, newRequirement.trim()]);
      setNewRequirement("");
    }
  };

  const removeRequirement = (index: number) => {
    const updated = jobRequirements.filter((_: any, i: number) => i !== index);
    setValue("jobRequirements", updated);
  };

  const getPayRateLabel = () => {
    return payRateType === "fixed"
      ? `${payType === PayType.HOURLY ? "Hourly Rate" : "Annual Salary"}`
      : `${payType === PayType.HOURLY ? "Hourly Range" : "Salary Range"}`;
  };

  return (
    <div className="space-y-4">
      <div className="pb-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Position Details
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Define role specifics and compensation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 auto-rows-min">
        {/* Job Priority & Workplace */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-5">
            <CardTitle className="flex items-center gap-1.5 text-base font-medium text-blue-500 ">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span>Job Priority & Workplace</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            <InputField
              name="jobStatus"
              type={INPUT_TYPES.SELECT}
              label="Priority"
              selectOptions={JOB_STATUSES}
            />
            <InputField
              name="workplaceType"
              type={INPUT_TYPES.SELECT}
              label="Workplace Type"
              selectOptions={WORKPLACE_TYPES}
            />
          </CardContent>
        </Card>

        {/* Employment & Education */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-5">
            <CardTitle className="flex items-center gap-1.5 text-base font-medium text-blue-500 ">
              <Users className="w-4 h-4 text-purple-600" />
              <span>Employment & Education</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            <InputField
              name="employmentType"
              type={INPUT_TYPES.SELECT}
              label="Employment Type"
              selectOptions={EMPLOYMENT_TYPES}
            />
            <InputField
              name="educationRequirement"
              type={INPUT_TYPES.SELECT}
              label="Education"
              selectOptions={EDUCATION_REQUIREMENTS}
            />
          </CardContent>
        </Card>

        {/* Additional Details */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-5">
            <CardTitle className="flex items-center gap-1.5 text-base font-medium text-blue-500 ">
              <Settings className="w-4 h-4 text-gray-600" />
              <span>Additional Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            <InputField
              name="positionsToHire"
              type={INPUT_TYPES.NUMBER}
              label="Positions"
              placeholder="1"
            />
            <InputField
              name="exemptStatus"
              type={INPUT_TYPES.SELECT}
              label="Exempt Status"
              selectOptions={EXEMPT_STATUSES}
            />
            <InputField
              name="eeoJobCategory"
              type={INPUT_TYPES.SELECT}
              label="EEO Category"
              selectOptions={EEO_JOB_CATEGORIES.map((cat) => ({
                value: cat,
                label: cat,
              }))}
            />
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="border border-gray-200 md:col-span-2">
          <CardHeader className="pb-5">
            <CardTitle className="flex items-center gap-1.5 text-base font-medium text-blue-500 ">
              <MapPin className="w-4 h-4 text-green-600" />
              <span>Job Location</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <InputField
                name="jobLocation.address"
                label="Address"
                placeholder="123 Main St"
                className="md:col-span-2"
              />
              <InputField
                name="jobLocation.state"
                label="State"
                type={INPUT_TYPES.SELECT}
                selectOptions={stateOptions}
              />
              <InputField
                name="jobLocation.city"
                label="City"
                type={INPUT_TYPES.SELECT}
                selectOptions={cityOptions}
                disabled={!watch("jobLocation.state")}
              />
              <InputField
                name="jobLocation.zipCode"
                label="ZIP"
                placeholder="94105"
              />
            </div>
          </CardContent>
        </Card>

        {/* Department */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-5">
            <CardTitle className="flex items-center gap-1.5 text-base font-medium text-blue-500 ">
              <Building className="w-4 h-4 text-orange-600" />
              <span>Department</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            <InputField
              name="department"
              type={INPUT_TYPES.SELECT}
              label="Department"
              selectOptions={DEPARTMENTS.map((dept) => ({
                value: dept,
                label: dept,
              }))}
            />
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">
                Add Custom Department
              </Label>
              <div className="flex gap-1">
                <Input
                  placeholder="Custom department"
                  value={customDepartment}
                  onChange={(e) => setCustomDepartment(e.target.value)}
                  className="h-8 text-xs"
                />
                <Button
                  type="button"
                  onClick={addCustomDepartment}
                  variant="outline"
                  size="sm"
                  className="h-8 px-2"
                  disabled={!customDepartment.trim()}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compensation */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-5">
            <CardTitle className="flex items-center gap-1.5 text-base font-medium text-blue-500 ">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Compensation</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            <InputField
              name="payType"
              type={INPUT_TYPES.SELECT}
              label="Pay Type"
              selectOptions={[
                { value: PayType.SALARY, label: "Salary" },
                { value: PayType.HOURLY, label: "Hourly" },
              ]}
            />

            <div>
              <Label className="text-xs text-gray-600">Pay Structure</Label>
              <RadioGroup
                value={payRateType}
                onValueChange={(value) => setValue("payRate.type", value)}
                className="flex gap-2 mt-1"
              >
                <div className="flex items-center space-x-1">
                  <RadioGroupItem
                    value="fixed"
                    id="fixed"
                    className="w-4 h-4"
                  />
                  <Label htmlFor="fixed" className="text-xs">
                    Fixed
                  </Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem
                    value="range"
                    id="range"
                    className="w-4 h-4"
                  />
                  <Label htmlFor="range" className="text-xs">
                    Range
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-xs text-gray-600">
                {getPayRateLabel() + " ($)"}
              </Label>
              {payRateType === "fixed" ? (
                <InputField
                  name="payRate.amount"
                  type={INPUT_TYPES.NUMBER}
                  placeholder={payType === PayType.HOURLY ? "25.00" : "75000"}
                  className="mt-1"
                />
              ) : (
                <div className="flex gap-2 mt-1">
                  <InputField
                    name="payRate.min"
                    type={INPUT_TYPES.NUMBER}
                    placeholder="Min"
                    className="flex-1"
                  />
                  <InputField
                    name="payRate.max"
                    type={INPUT_TYPES.NUMBER}
                    placeholder="Max"
                    className="flex-1"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Job Requirements */}
        <Card className="border border-gray-200 md:col-span-2">
          <CardHeader className="pb-5">
            <CardTitle className="flex items-center gap-1.5 text-base font-medium text-blue-500 ">
              <Target className="w-4 h-4 text-red-600" />
              <span>Job Requirements</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-1">
              <Input
                placeholder="Add requirement..."
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addRequirement()}
                className="h-8 text-xs flex-1"
              />
              <Button
                type="button"
                onClick={addRequirement}
                variant="outline"
                size="sm"
                className="h-8 px-2"
                disabled={!newRequirement.trim()}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>

            {jobRequirements.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {jobRequirements.map((req: string, index: number) => (
                  <div
                    key={index}
                    className="inline-flex items-center py-0.5 pl-2 pr-1 bg-gray-50 rounded text-xs border border-gray-200"
                  >
                    <span className="mr-1">{req}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRequirement(index)}
                      className="h-5 w-5 text-gray-400 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
