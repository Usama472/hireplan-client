"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

import { Plus, X, CheckCircle, Star, Info } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";

export function JobQualificationsStep() {
  const { watch, setValue } = useFormContext();
  const { subscription } = useAuthSessionContext();
  const [newQualification, setNewQualification] = useState("");

  // Check if user has AI features (Professional/Enterprise)
  const hasAIFeatures =
    subscription?.planId === "professional" ||
    subscription?.planId === "enterprise";

  // AI Weighting Controls
  const [shouldVsNiceRatio, setShouldVsNiceRatio] = useState([70]); // 70% should, 30% nice
  const [passThreshold, setPassThreshold] = useState([50]); // Must hit 50% to pass

  // Unified qualifications list
  const allQualifications = watch("qualifications") || [];

  const addQualification = () => {
    if (newQualification.trim()) {
      const newQual = {
        text: newQualification.trim(),
        title: newQualification.trim(), // For backward compatibility
        isRequired: false, // Default to preferred
        aiCategory: hasAIFeatures ? "should" : undefined, // Default AI category
      };
      setValue("qualifications", [...allQualifications, newQual]);
      setNewQualification("");
    }
  };

  const removeQualification = (index: number) => {
    const updated = allQualifications.filter(
      (_: any, i: number) => i !== index
    );
    setValue("qualifications", updated);
  };

  const updateRequiredToggle = (index: number, isRequired: boolean) => {
    const updated = allQualifications.map((qual: any, i: number) => {
      if (i === index) {
        // If AI category is "need", force it to stay Required
        if (qual.aiCategory === "need" && !isRequired) {
          return qual; // Don't change - keep it Required
        }
        return { ...qual, isRequired };
      }
      return qual;
    });
    setValue("qualifications", updated);
  };

  const updateAICategory = (index: number, aiCategory: string) => {
    const updated = allQualifications.map((qual: any, i: number) =>
      i === index
        ? {
            ...qual,
            aiCategory,
            // If "Need" category, set to Required. Otherwise, set to Preferred
            isRequired: aiCategory === "need",
          }
        : qual
    );
    setValue("qualifications", updated);
  };

  const qualificationTemplates = [
    "Driver's License",
    "Working with Children Certification",
    "RBT Certification",
    "CPR/First Aid Certification",
    "Bachelor's Degree",
    "Master's Degree",
    "2+ years experience",
    "Bilingual (English/Spanish)",
    "Security Clearance",
    "Professional License",
  ];

  const addFromTemplate = (template: string) => {
    const newQual = {
      text: template,
      title: template, // For backward compatibility
      isRequired: false, // Default to preferred
      aiCategory: hasAIFeatures ? "should" : undefined,
    };
    setValue("qualifications", [...allQualifications, newQual]);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="px-1">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
          Job Qualifications
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Add qualifications and toggle between required/preferred. Configure AI
          scoring for intelligent candidate evaluation.
        </p>
      </div>

      {/* Unified Qualifications Section */}
      <Card className="border border-gray-200 shadow-none rounded-xl">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-medium text-blue-600">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            Qualifications
          </CardTitle>
          <p className="text-xs sm:text-sm text-gray-500">
            Add qualifications and toggle between required/preferred. Configure
            AI scoring settings.
          </p>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 pt-0">
          {/* Add New Qualification */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs sm:text-sm font-medium">
              Add Qualification
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Driver's License, Bachelor's Degree, 2+ years experience"
                value={newQualification}
                onChange={(e) => setNewQualification(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addQualification();
                  }
                }}
                className="text-sm"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addQualification}
                disabled={!newQualification.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Template Options */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs sm:text-sm text-gray-600">
              Quick Add Templates
            </Label>
            <div className="flex flex-wrap gap-1">
              {qualificationTemplates.map((template) => (
                <Button
                  key={template}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 px-2 text-gray-600 hover:text-blue-600"
                  onClick={() => addFromTemplate(template)}
                >
                  + {template}
                </Button>
              ))}
            </div>
          </div>

          {/* Qualifications List */}
          {allQualifications.length > 0 && (
            <div className="space-y-2 sm:space-y-3">
              <Label className="text-xs sm:text-sm text-gray-600">
                Current Qualifications
              </Label>
              {allQualifications.map((qual: any, index: number) => (
                <div
                  key={index}
                  className="p-2 sm:p-3 bg-white border border-gray-200 rounded-lg"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0 w-full sm:w-auto">
                      <span className="text-xs sm:text-sm font-medium text-gray-900">
                        {qual.text || qual.title}
                      </span>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${
                          qual.isRequired
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {qual.isRequired ? "Required" : "Preferred"}
                      </span>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                      {/* Required/Preferred Toggle */}
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {qual.isRequired ? "Required" : "Preferred"}
                        </span>
                        <Switch
                          checked={qual.isRequired === true}
                          onCheckedChange={(checked) =>
                            updateRequiredToggle(index, checked)
                          }
                          disabled={qual.aiCategory === "need"}
                        />
                      </div>

                      {/* AI Category Dropdown */}
                      {hasAIFeatures && (
                        <Select
                          value={qual.aiCategory || "should"}
                          onValueChange={(value) =>
                            updateAICategory(index, value)
                          }
                        >
                          <SelectTrigger className="h-7 w-20 sm:w-28 text-xs border-gray-300 bg-white hover:bg-gray-50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent align="end" className="min-w-32">
                            <SelectItem
                              value="need"
                              className="text-xs hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex-shrink-0 shadow-sm"></div>
                                <span>Need</span>
                              </div>
                            </SelectItem>
                            <SelectItem
                              value="should"
                              className="text-xs hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex-shrink-0 shadow-sm"></div>
                                <span>Should</span>
                              </div>
                            </SelectItem>
                            <SelectItem
                              value="nice"
                              className="text-xs hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex-shrink-0 shadow-sm"></div>
                                <span>Nice</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQualification(index)}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {allQualifications.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded-md">
              No qualifications added yet. Add your first qualification above.
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Weighting Controls - Only for Professional/Enterprise */}
      {hasAIFeatures && allQualifications.length > 0 && (
        <Card className="border border-blue-200 bg-blue-50/30 shadow-none rounded-xl">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-medium text-blue-600">
              🤖 AI Scoring Configuration
            </CardTitle>
            <p className="text-xs sm:text-sm text-gray-600">
              Configure how AI evaluates candidates against these qualifications
            </p>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 pt-0">
            {/* Category Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-red-50 to-pink-50 border border-red-200/50 rounded-xl shadow-sm">
                <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  {
                    allQualifications.filter(
                      (q: any) => q.aiCategory === "need"
                    ).length
                  }
                </div>
                <div className="text-xs font-medium text-red-700/80">
                  Need (Auto-reject)
                </div>
              </div>

              <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200/50 rounded-xl shadow-sm">
                <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                  {
                    allQualifications.filter(
                      (q: any) => q.aiCategory === "should"
                    ).length
                  }
                </div>
                <div className="text-xs font-medium text-blue-700/80">
                  Should Have
                </div>
              </div>

              <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200/50 rounded-xl shadow-sm">
                <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent">
                  {
                    allQualifications.filter(
                      (q: any) => q.aiCategory === "nice"
                    ).length
                  }
                </div>
                <div className="text-xs font-medium text-purple-700/80">
                  Nice to Have
                </div>
              </div>
            </div>

            {/* Interactive Scoring Bar */}
            <div className="bg-white border rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
              <div className="space-y-2 sm:space-y-3">
                <Label className="text-xs sm:text-sm font-medium block">
                  AI Scoring Configuration
                </Label>
                <div className="text-xs text-gray-600 space-y-2">
                  <p>
                    <span className="font-medium text-gray-700">Approval Threshold:</span> When qualifications reach <span className="font-semibold text-blue-600">{passThreshold[0]}%</span>, candidates advance to the next screening round.
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">Weight Distribution:</span> Should have <span className="font-semibold text-blue-600">{shouldVsNiceRatio[0]}%</span> vs Nice to have <span className="font-semibold text-purple-600">{100 - shouldVsNiceRatio[0]}%</span>.
                  </p>
                  <p>
                    <span className="font-medium text-red-600">Auto-Reject:</span> Candidates missing any "Need To Have" qualifications are automatically rejected.
                  </p>
                </div>
              </div>

              {/* Interactive Combined Visual Bar */}
              <div
                className="relative h-12 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full shadow-inner cursor-pointer mb-8"
                onMouseDown={(e) => {
                  // Don't handle if it's on the approval threshold slider
                  if ((e.target as HTMLElement).closest('.approval-threshold-slider')) {
                    return;
                  }
                  
                  e.preventDefault();
                  const bar = e.currentTarget;
                  
                  const handleMouseMove = (moveEvent: MouseEvent) => {
                    const rect = bar.getBoundingClientRect();
                    const x = moveEvent.clientX - rect.left;
                    const percentage = Math.round((x / rect.width) * 100);
                    setShouldVsNiceRatio([
                      Math.max(0, Math.min(100, percentage)),
                    ]);
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener("mousemove", handleMouseMove);
                    document.removeEventListener("mouseup", handleMouseUp);
                    document.body.style.userSelect = "";
                  };
                  
                  // Initial position set
                  handleMouseMove(e.nativeEvent);
                  
                  document.body.style.userSelect = "none";
                  document.addEventListener("mousemove", handleMouseMove);
                  document.addEventListener("mouseup", handleMouseUp);
                }}
              >
                {/* Should Have Section - Blue */}
                <div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
                  style={{ width: `${shouldVsNiceRatio[0]}%` }}
                  title="Should Have"
                ></div>

                {/* Nice to Have Section - Purple */}
                <div
                  className="absolute top-0 h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500 ease-out"
                  style={{
                    left: `${shouldVsNiceRatio[0]}%`,
                    width: `${100 - shouldVsNiceRatio[0]}%`,
                  }}
                  title="Nice to Have"
                ></div>

                {/* Approval Threshold Slider */}
                <div
                  className="approval-threshold-slider absolute -top-1 h-14 w-4 z-50 cursor-grab active:cursor-grabbing"
                  style={{ left: `calc(${passThreshold[0]}% - 8px)` }}
                  title={`Drag to adjust approval threshold: ${passThreshold[0]}%`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const bar = e.currentTarget.parentElement;
                    if (!bar) return;

                    let isDragging = false;

                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      isDragging = true;
                      moveEvent.preventDefault();
                      moveEvent.stopPropagation();
                      
                      const rect = bar.getBoundingClientRect();
                      const x = moveEvent.clientX - rect.left;
                      const percentage = Math.round((x / rect.width) * 100);
                      setPassThreshold([
                        Math.max(0, Math.min(100, percentage)),
                      ]);
                    };

                    const handleMouseUp = (upEvent: MouseEvent) => {
                      upEvent.preventDefault();
                      upEvent.stopPropagation();
                      
                      document.removeEventListener("mousemove", handleMouseMove);
                      document.removeEventListener("mouseup", handleMouseUp);
                      document.body.style.userSelect = "";
                      document.body.style.pointerEvents = "";
                      
                      // Prevent the parent click handler from firing
                      if (isDragging) {
                        setTimeout(() => {
                          isDragging = false;
                        }, 10);
                      }
                    };

                    document.body.style.userSelect = "none";
                    document.body.style.pointerEvents = "none";
                    document.addEventListener("mousemove", handleMouseMove);
                    document.addEventListener("mouseup", handleMouseUp);
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  {/* Visible Line Through Bar */}
                  <div className="absolute top-1 left-1/2 w-0.5 h-12 bg-white shadow-lg transform -translate-x-1/2"></div>

                  {/* Draggable Handle */}
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-blue-500 rounded-full shadow-xl flex items-center justify-center hover:bg-blue-600 transition-all duration-200 border-2 border-white">
                    <div className="flex gap-0.5">
                      <div className="w-0.5 h-2 bg-white rounded-full"></div>
                      <div className="w-0.5 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>

                  {/* Threshold Value Display */}
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded-md shadow-lg font-medium whitespace-nowrap">
                    Approval Rate: {passThreshold[0]}%
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex justify-between text-xs font-medium">
                <span className="text-blue-600">
                  🔵 Should Have: {shouldVsNiceRatio[0]}%
                </span>
                <span className="text-purple-600">
                  🟣 Nice to Have: {100 - shouldVsNiceRatio[0]}%
                </span>
                <span className="text-gray-700">
                  📏 Approval: {passThreshold[0]}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}


      {/* Information Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 mt-0.5" />
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-blue-900">
              How Qualification Controls Work
            </h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>
                • <strong>Required/Preferred Toggle:</strong> Switch between
                must-have and nice-to-have qualifications
              </li>
              <li>
                • <strong>AI Category:</strong> Set how strictly AI evaluates
                each qualification (Need/Should/Nice)
              </li>
              <li>
                • <strong>Auto-Lock:</strong> "Need" category automatically
                locks qualification to Required
              </li>
              <li>
                • <strong>Scoring Weight:</strong> Required qualifications carry
                more weight in AI evaluation
              </li>
              <li>
                • <strong>Example:</strong> "Bachelor's Degree" - toggle to
                Required and set AI category to "Need" for auto-rejection
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
