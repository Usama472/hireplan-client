"use client";

import { InputField } from "@/components/common/InputField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  SCHEDULE_OPTIONS,
  BENEFIT_OPTIONS,
} from "@/constants";
import { INPUT_TYPES } from "@/interfaces";
import {
  Clock,
  Globe,
  Heart,
  Search,
} from "lucide-react";
import { useFormContext } from "react-hook-form";
import { useState } from "react";

export function HoursScheduleBenefitsStep() {
  const { watch, setValue } = useFormContext();
  const [scheduleSearch, setScheduleSearch] = useState("");
  const [benefitsSearch, setBenefitsSearch] = useState("");
  
  const hoursPerWeekType = watch("hoursPerWeek.type") || "fixed-hours";
  const schedule = watch("schedule") || [];
  const benefits = watch("benefits") || [];
  const jobLocationWorkType = watch("jobLocationWorkType");
  const remoteLocationRequired = watch("remoteLocationRequirement.required") || false;

  const toggleScheduleOption = (option: string) => {
    const current = schedule || [];
    const updated = current.includes(option)
      ? current.filter((item: string) => item !== option)
      : [...current, option];
    setValue("schedule", updated);
  };

  const toggleBenefit = (benefit: string) => {
    const current = benefits || [];
    const updated = current.includes(benefit)
      ? current.filter((item: string) => item !== benefit)
      : [...current, benefit];
    setValue("benefits", updated);
  };

  // Filter functions
  const filteredScheduleOptions = SCHEDULE_OPTIONS.filter(option =>
    option.toLowerCase().includes(scheduleSearch.toLowerCase())
  );

  const filteredBenefitOptions = BENEFIT_OPTIONS.filter(benefit =>
    benefit.toLowerCase().includes(benefitsSearch.toLowerCase())
  );



  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Hours, Schedule & Benefits
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Define work schedule, hours, benefits, and location details
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3rd Card - Hours, Schedule & Benefits */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-medium text-purple-600">
              <Clock className="w-5 h-5" />
              Work Schedule & Benefits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Expected Hours Per Week */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Expected Hours Per Week</Label>
              
              <div className="space-y-2">
                <InputField
                  name="hoursPerWeek.type"
                  type={INPUT_TYPES.SELECT}
                  placeholder="Select hours type"
                  selectOptions={[
                    { value: "fixed-hours", label: "Fixed Hours (Write in Amount) Per Week" },
                    { value: "range", label: "Range (Write in Min. & Max.) Per Week" },
                    { value: "minimum", label: "Minimum (Write in Amount) Per Week" },
                    { value: "maximum", label: "Maximum (Write in Amount) Per Week" },
                  ]}
                />
              </div>

              {/* Hours Input Fields */}
              <div className="grid grid-cols-2 gap-3">
                {hoursPerWeekType === "fixed-hours" && (
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs text-gray-600">Hours Per Week</Label>
                                    <InputField
                  name="hoursPerWeek.amount"
                  type={INPUT_TYPES.NUMBER}
                  placeholder="40"
                />
                  </div>
                )}
                
                {hoursPerWeekType === "range" && (
                  <>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-600">Minimum</Label>
                                        <InputField
                    name="hoursPerWeek.min"
                    type={INPUT_TYPES.NUMBER}
                    placeholder="20"
                  />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-600">Maximum</Label>
                                        <InputField
                    name="hoursPerWeek.max"
                    type={INPUT_TYPES.NUMBER}
                    placeholder="40"
                  />
                    </div>
                  </>
                )}
                
                {hoursPerWeekType === "minimum" && (
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs text-gray-600">Minimum Hours</Label>
                                    <InputField
                  name="hoursPerWeek.min"
                  type={INPUT_TYPES.NUMBER}
                  placeholder="12"
                />
                  </div>
                )}
                
                {hoursPerWeekType === "maximum" && (
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs text-gray-600">Maximum Hours</Label>
                                    <InputField
                  name="hoursPerWeek.max"
                  type={INPUT_TYPES.NUMBER}
                  placeholder="50"
                />
                  </div>
                )}
              </div>

              {/* Example Display */}
              {hoursPerWeekType === "minimum" && (
                <div className="p-2 bg-gray-50 rounded text-xs text-gray-600">
                  Example: Minimum 12 Hours Per Week
                </div>
              )}
            </div>

            {/* Schedule Multi-select */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Schedule
              </Label>
              
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search schedule options..."
                  value={scheduleSearch}
                  onChange={(e) => setScheduleSearch(e.target.value)}
                  className="pl-9 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                {filteredScheduleOptions.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`schedule-${option}`}
                      checked={schedule.includes(option)}
                      onCheckedChange={() => toggleScheduleOption(option)}
                    />
                    <Label 
                      htmlFor={`schedule-${option}`}
                      className="text-xs font-normal cursor-pointer"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
              
              {filteredScheduleOptions.length === 0 && scheduleSearch && (
                <p className="text-xs text-gray-500 text-center py-4">
                  No schedule options found for "{scheduleSearch}"
                </p>
              )}
              
              {schedule.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {schedule.map((item: string) => (
                    <Badge key={item} variant="secondary" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Benefits Multi-select */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Benefits
              </Label>
              
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search benefits..."
                  value={benefitsSearch}
                  onChange={(e) => setBenefitsSearch(e.target.value)}
                  className="pl-9 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                {filteredBenefitOptions.map((benefit) => (
                  <div key={benefit} className="flex items-center space-x-2">
                    <Checkbox
                      id={`benefit-${benefit}`}
                      checked={benefits.includes(benefit)}
                      onCheckedChange={() => toggleBenefit(benefit)}
                    />
                    <Label 
                      htmlFor={`benefit-${benefit}`}
                      className="text-xs font-normal cursor-pointer"
                    >
                      {benefit}
                    </Label>
                  </div>
                ))}
              </div>
              
              {filteredBenefitOptions.length === 0 && benefitsSearch && (
                <p className="text-xs text-gray-500 text-center py-4">
                  No benefits found for "{benefitsSearch}"
                </p>
              )}
              
              {benefits.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {benefits.slice(0, 5).map((item: string) => (
                    <Badge key={item} variant="secondary" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                  {benefits.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{benefits.length - 5} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 4th Card - Location & Language */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-medium text-blue-600">
              <Globe className="w-5 h-5" />
              Location & Language
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Country */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Country Where Job Post Is Shown</Label>
              <InputField
                name="country"
                type={INPUT_TYPES.SELECT}
                placeholder="Select country"
                defaultValue="United States"
                selectOptions={[
                  { value: "United States", label: "United States" },
                  { value: "Canada", label: "Canada" },
                  { value: "United Kingdom", label: "United Kingdom" },
                  { value: "Australia", label: "Australia" },
                  { value: "Germany", label: "Germany" },
                  { value: "France", label: "France" },
                  { value: "Netherlands", label: "Netherlands" },
                  { value: "Spain", label: "Spain" },
                  { value: "Italy", label: "Italy" },
                  { value: "Sweden", label: "Sweden" },
                  { value: "Norway", label: "Norway" },
                  { value: "Denmark", label: "Denmark" },
                  { value: "Other", label: "Other" },
                ]}
              />
              <p className="text-xs text-gray-500">Default: United States</p>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Language of Job Post</Label>
              <InputField
                name="language"
                type={INPUT_TYPES.SELECT}
                placeholder="Select language"
                defaultValue="English"
                selectOptions={[
                  { value: "English", label: "English" },
                  { value: "Spanish", label: "Spanish" },
                  { value: "French", label: "French" },
                  { value: "German", label: "German" },
                  { value: "Portuguese", label: "Portuguese" },
                  { value: "Italian", label: "Italian" },
                  { value: "Dutch", label: "Dutch" },
                  { value: "Swedish", label: "Swedish" },
                  { value: "Norwegian", label: "Norwegian" },
                  { value: "Danish", label: "Danish" },
                  { value: "Other", label: "Other" },
                ]}
              />
              <p className="text-xs text-gray-500">Default: English</p>
            </div>

            {/* Job Location Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Job Location Type</Label>
              <InputField
                name="jobLocationWorkType"
                type={INPUT_TYPES.SELECT}
                placeholder="Select location type"
                selectOptions={[
                  { value: "in-person", label: "In person" },
                  { value: "fully-remote", label: "Fully Remote" },
                  { value: "hybrid", label: "Hybrid" },
                  { value: "on-the-road", label: "On the road" },
                ]}
              />
            </div>

            {/* Location-specific fields */}
            {jobLocationWorkType === "in-person" && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Job Location</Label>
                <p className="text-xs text-gray-500 mb-2">Must enter at least ZIP code</p>
                <div className="space-y-2">
                  <InputField
                    name="jobLocation.address"
                    placeholder="Street address"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <InputField
                      name="jobLocation.city"
                      placeholder="City"
                    />
                    <InputField
                      name="jobLocation.state"
                      placeholder="State"
                    />
                  </div>
                  <InputField
                    name="jobLocation.zipCode"
                    placeholder="ZIP Code*"
                  />
                </div>
              </div>
            )}

            {jobLocationWorkType === "fully-remote" && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Remote Work Requirements</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remote-location-required"
                    checked={remoteLocationRequired}
                    onCheckedChange={(checked) => 
                      setValue("remoteLocationRequirement.required", checked)
                    }
                  />
                  <Label htmlFor="remote-location-required" className="text-sm">
                    Employees required to reside in specific location
                  </Label>
                </div>
                {remoteLocationRequired && (
                  <InputField
                    name="remoteLocationRequirement.location"
                    placeholder="Enter required location"
                  />
                )}
              </div>
            )}

            {jobLocationWorkType === "hybrid" && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Office Address</Label>
                <p className="text-xs text-gray-500 mb-2">Must enter at least ZIP code</p>
                <div className="space-y-2">
                  <InputField
                    name="jobLocation.address"
                    placeholder="Street address"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <InputField
                      name="jobLocation.city"
                      placeholder="City"
                    />
                    <InputField
                      name="jobLocation.state"
                      placeholder="State"
                    />
                  </div>
                  <InputField
                    name="jobLocation.zipCode"
                    placeholder="ZIP Code*"
                  />
                </div>
              </div>
            )}

            {jobLocationWorkType === "on-the-road" && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Starting Location</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="consistent-starting-location"
                    checked={watch("hasConsistentStartingLocation")}
                    onCheckedChange={(checked) => 
                      setValue("hasConsistentStartingLocation", checked)
                    }
                  />
                  <Label htmlFor="consistent-starting-location" className="text-sm">
                    This job has a consistent starting location
                  </Label>
                </div>
                
                {watch("hasConsistentStartingLocation") ? (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">Must enter at least ZIP code</p>
                    <div className="space-y-2">
                      <InputField
                        name="jobLocation.address"
                        placeholder="Street address"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <InputField
                          name="jobLocation.city"
                          placeholder="City"
                        />
                        <InputField
                          name="jobLocation.state"
                          placeholder="State"
                        />
                      </div>
                      <InputField
                        name="jobLocation.zipCode"
                        placeholder="ZIP Code*"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label className="text-sm">Operating Area</Label>
                    <InputField
                      name="operatingArea"
                      placeholder="Describe the operating area for this job"
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}