"use client";

import { InputField } from "@/components/common/InputField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { INPUT_TYPES } from "@/interfaces";
import {
  Calendar,
  DollarSign,
  Clock,
  Target,
  TrendingUp,
  AlertCircle,
  Info,
} from "lucide-react";
import { useFormContext } from "react-hook-form";

export function PostingScheduleBudgetStep() {
  const { watch, setValue } = useFormContext();
  
  const runIndefinitely = watch("runIndefinitely") || false;
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const dailyBudget = watch("dailyBudget") || 0;
  const monthlyBudget = watch("monthlyBudget") || 0;
  const indeedBudget = watch("indeedBudget") || 0;
  const zipRecruiterBudget = watch("zipRecruiterBudget") || 0;

  const totalBudget = dailyBudget + monthlyBudget + indeedBudget + zipRecruiterBudget;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Posting Schedule & Ad Budget
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Configure when your job posting runs and set advertising budgets
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Posting Schedule */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-medium text-blue-600">
              <Calendar className="w-5 h-5" />
              Posting Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Run Indefinitely Toggle */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Run Indefinitely</Label>
                  <p className="text-xs text-gray-500">
                    Keep posting active until manually stopped
                  </p>
                </div>
                <Switch
                  checked={runIndefinitely}
                  onCheckedChange={(checked) => setValue("runIndefinitely", checked)}
                />
              </div>

              {runIndefinitely && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Continuous Posting Enabled
                    </span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Your job will remain active until you manually pause or close it
                  </p>
                </div>
              )}
            </div>

            {/* Date Range (only show if not running indefinitely) */}
            {!runIndefinitely && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Start Date</Label>
                  <InputField
                    name="startDate"
                    type={INPUT_TYPES.DATE}
                    placeholder="Select start date"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">End Date</Label>
                  <InputField
                    name="endDate"
                    type={INPUT_TYPES.DATE}
                    placeholder="Select end date"
                  />
                </div>

                {startDate && endDate && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        Posting Duration
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      Your job will be active from {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Current Posting Settings */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md space-y-2">
              <h4 className="text-sm font-medium text-gray-900">Current Settings</h4>
              <div className="space-y-1 text-xs text-gray-600">
                <p>• Schedule: {runIndefinitely ? "Indefinite" : "Fixed Duration"}</p>
                <p>• Status: Will be set to "Active" upon publishing</p>
                <p>• Auto-renewal: {runIndefinitely ? "Yes" : "No"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ad Budget */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-medium text-green-600">
              <DollarSign className="w-5 h-5" />
              Advertising Budget
            </CardTitle>
            <p className="text-sm text-gray-500">
              Set budgets for job board promotions (optional)
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* General Budgets */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Daily Budget</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    $
                  </span>
                  <InputField
                    name="dailyBudget"
                    type={INPUT_TYPES.NUMBER}
                    placeholder="0.00"
                    step="0.01"
                    min={0}
                    className="pl-8"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Maximum amount to spend per day across all platforms
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Monthly Budget</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    $
                  </span>
                  <InputField
                    name="monthlyBudget"
                    type={INPUT_TYPES.NUMBER}
                    placeholder="0.00"
                    step="0.01"
                    min={0}
                    className="pl-8"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Total monthly advertising budget limit
                </p>
              </div>
            </div>

            {/* Platform-Specific Budgets */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gray-600" />
                <Label className="text-sm font-medium text-gray-900">Platform Budgets</Label>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-sm text-gray-700">Indeed Budget</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      $
                    </span>
                    <InputField
                      name="indeedBudget"
                      type={INPUT_TYPES.NUMBER}
                      placeholder="0.00"
                      step="0.01"
                      min={0}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-gray-700">ZipRecruiter Budget</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      $
                    </span>
                    <InputField
                      name="zipRecruiterBudget"
                      type={INPUT_TYPES.NUMBER}
                      placeholder="0.00"
                      step="0.01"
                      min={0}
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Budget Summary */}
            {totalBudget > 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Budget Summary
                  </span>
                </div>
                <div className="space-y-1 text-xs text-green-700">
                  {dailyBudget > 0 && <p>Daily: ${dailyBudget}</p>}
                  {monthlyBudget > 0 && <p>Monthly: ${monthlyBudget}</p>}
                  {indeedBudget > 0 && <p>Indeed: ${indeedBudget}</p>}
                  {zipRecruiterBudget > 0 && <p>ZipRecruiter: ${zipRecruiterBudget}</p>}
                  <hr className="border-green-300 my-1" />
                  <p className="font-semibold">Total Allocated: ${totalBudget}</p>
                </div>
              </div>
            )}

            {totalBudget === 0 && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    No budget set - posting will use default promotion
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Information Box */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-yellow-900">
              Budget Information
            </h4>
            <ul className="text-xs text-yellow-800 space-y-1">
              <li>• <strong>Budgets are optional:</strong> Jobs will post for free on your career page regardless</li>
              <li>• <strong>Platform budgets:</strong> Used for paid promotions on job boards like Indeed and ZipRecruiter</li>
              <li>• <strong>Daily vs Monthly:</strong> Daily budgets provide more control, monthly budgets offer flexibility</li>
              <li>• <strong>Budget tracking:</strong> Monitor spending and performance in your dashboard analytics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}