"use client";

import { InputField } from "@/components/common/InputField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  EXEMPT_STATUSES,
} from "@/constants";
import { INPUT_TYPES } from "@/interfaces";
import {
  Shield,
  Building,
  Plus,
  Info,
} from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

export function ComplianceDepartmentStep() {
  const { watch, setValue } = useFormContext();
  const [newDepartment, setNewDepartment] = useState("");
  
  const department = watch("department");
  const customDepartment = watch("customDepartment");

  const departmentOptions = [
    { value: "engineering", label: "🔧 TODO: Pull from Settings - Engineering" },
    { value: "sales", label: "🔧 TODO: Pull from Settings - Sales" },
    { value: "marketing", label: "🔧 TODO: Pull from Settings - Marketing" },
    { value: "hr", label: "🔧 TODO: Pull from Settings - Human Resources" },
    { value: "finance", label: "🔧 TODO: Pull from Settings - Finance" },
    { value: "operations", label: "🔧 TODO: Pull from Settings - Operations" },
    { value: "customer-success", label: "🔧 TODO: Pull from Settings - Customer Success" },
    { value: "product", label: "🔧 TODO: Pull from Settings - Product" },
    { value: "design", label: "🔧 TODO: Pull from Settings - Design" },
    { value: "custom", label: "Add Custom Department" },
  ];

  const addCustomDepartment = () => {
    if (newDepartment.trim()) {
      setValue("department", newDepartment.trim());
      setValue("customDepartment", newDepartment.trim());
      setNewDepartment("");
    }
  };



  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Compliance & Department
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Define exempt status, EEO category, and department information
        </p>
      </div>

      {/* Single Card - Compliance & Department */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-medium text-indigo-600">
            <Shield className="w-5 h-5" />
            Compliance & Department Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Exempt Status */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Exempt Status</Label>
            <InputField
              name="exemptStatus"
              type={INPUT_TYPES.SELECT}
              placeholder="Select exempt status"
              selectOptions={EXEMPT_STATUSES.map(status => ({
                value: status.value,
                label: status.label
              }))}
            />
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex items-start gap-2">
                <Info className="w-3 h-3 mt-0.5 text-gray-400" />
                <div>
                  <p><strong>Exempt:</strong> Not eligible for overtime pay</p>
                  <p><strong>Non-Exempt:</strong> Eligible for overtime pay</p>
                  <p><strong>Not Applicable:</strong> For contractors or special cases</p>
                </div>
              </div>
            </div>
          </div>

          {/* EEO Category */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">EEO Job Category</Label>
            <InputField
              name="eeoJobCategory"
              type={INPUT_TYPES.SELECT}
              placeholder="Select EEO category"
              selectOptions={[
                { value: "administrative-support-workers", label: "Administrative Support Workers" },
                { value: "craft-workers", label: "Craft Workers" },
                { value: "executive-senior-level-officials-and-managers", label: "Executive/Senior Level Officials And Managers" },
                { value: "first-mid-level-officials-and-managers", label: "First/Mid Level Officials And Managers" },
                { value: "laborers-and-helpers", label: "Laborers And Helpers" },
                { value: "operatives", label: "Operatives" },
                { value: "professionals", label: "Professionals" },
                { value: "sales-workers", label: "Sales Workers" },
                { value: "service-workers", label: "Service Workers" },
                { value: "technicians", label: "Technicians" },
              ]}
            />
            <p className="text-xs text-gray-500">
              Required for Equal Employment Opportunity reporting compliance
            </p>
          </div>

          {/* Department */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Department 
              <span className="text-gray-500 font-normal ml-1">
                (Internal use - does not appear on job boards)
              </span>
            </Label>
            
            <InputField
              name="department"
              type={INPUT_TYPES.SELECT}
              placeholder="Select department"
              selectOptions={departmentOptions}
            />

            {/* Custom Department Input */}
            {(department === "custom" || customDepartment) && (
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Custom Department</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter custom department name"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomDepartment();
                      }
                    }}
                    className="text-sm"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addCustomDepartment}
                    disabled={!newDepartment.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Display current department */}
            {department && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Department: {department}
                  </span>
                </div>
                {customDepartment && (
                  <p className="text-xs text-blue-600 mt-1">
                    Custom department added to your organization
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Information Box */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900">
                  Important Information
                </h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Department information is for internal organization only</li>
                  <li>• EEO category is required for federal reporting compliance</li>
                  <li>• Exempt status affects overtime pay eligibility</li>
                  <li>• Custom departments will be saved for future job postings</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}