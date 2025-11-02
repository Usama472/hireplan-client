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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { Plus, X, CheckCircle, Info, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";

export function JobQualificationsStep() {
  const { watch, setValue } = useFormContext();
  const { subscription } = useAuthSessionContext();
  const [newQualification, setNewQualification] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  // Check if user has AI features (plan-based with custom pricing)
  const hasAIFeatures =
    subscription?.planId === "professional" ||
    subscription?.planId === "enterprise";

  // AI Weighting Controls
  const [shouldVsNiceRatio, setShouldVsNiceRatio] = useState([70]); // 70% should, 30% nice
  const [passThreshold, setPassThreshold] = useState([50]); // Must hit 50% to pass
  const [showAdvancedAI, setShowAdvancedAI] = useState(false); // Hide complex AI config by default

  // Unified qualifications list
  const allQualifications = watch("qualifications") || [];
  const storedAiSuggestions = watch("aiSuggestedQualifications");

  // Load AI suggestions from form (generated during job description enhancement)
  useEffect(() => {
    if (Array.isArray(storedAiSuggestions) && storedAiSuggestions.length > 0) {
      console.log(
        "✅ Found AI-suggested qualifications from enhancement:",
        storedAiSuggestions
      );
      setAiSuggestions(storedAiSuggestions);
    }
  }, [storedAiSuggestions]);

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
        if (hasAIFeatures) {
          // Expert logic: Bidirectional sync between Required toggle and AI category
          if (isRequired) {
            // Required ON: Always set AI category to "need" (critical requirement)
            return {
              ...qual,
              isRequired: true,
              aiCategory: "need",
            };
          } else {
            // Required OFF (Preferred): Convert "need" to "should", preserve other categories
            const newCategory =
              qual.aiCategory === "need"
                ? "should"
                : qual.aiCategory || "should";
            return {
              ...qual,
              isRequired: false,
              aiCategory: newCategory,
            };
          }
        } else {
          // No AI features: Just update the required status
          return {
            ...qual,
            isRequired,
          };
        }
      }
      return qual;
    });
    setValue("qualifications", updated);
  };

  const updateAICategory = (index: number, aiCategory: string) => {
    const updated = allQualifications.map((qual: any, i: number) => {
      if (i === index) {
        // Expert logic: Bidirectional sync between AI category and Required toggle
        // "Need" category always means Required (critical)
        // "Should" or "Nice" categories mean Preferred (not critical)
        const newIsRequired = aiCategory === "need";
        return {
          ...qual,
          aiCategory,
          isRequired: newIsRequired,
        };
      }
      return qual;
    });
    setValue("qualifications", updated);
  };

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

          {/* AI Suggested Qualifications */}
          {hasAIFeatures && aiSuggestions.length > 0 && (
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <Label className="text-xs sm:text-sm font-semibold text-purple-600">
                  AI Suggested Qualifications
                </Label>
              </div>
              <div className="bg-purple-50/50 border border-purple-200 rounded-lg p-3">
                <div className="flex flex-wrap gap-1.5">
                  {aiSuggestions.map((suggestion, idx) => (
                    <Button
                      key={`ai-${idx}`}
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 px-2.5 bg-white text-purple-700 hover:bg-purple-100 hover:text-purple-800 border border-purple-200"
                      onClick={() => addFromTemplate(suggestion)}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

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
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {qual.isRequired ? "Required" : "Preferred"}
                            </span>
                            <Switch
                              checked={qual.isRequired === true}
                              onCheckedChange={(checked) =>
                                updateRequiredToggle(index, checked)
                              }
                              // disabled={qual.aiCategory === "need"}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="text-xs">
                            {qual.isRequired
                              ? "Required: Candidates must meet this qualification to be considered for the position."
                              : "Preferred: This is a bonus qualification that candidates may have, but it's not mandatory."}
                          </p>
                        </TooltipContent>
                      </Tooltip>

                      {/* AI Category Dropdown */}
                      {hasAIFeatures && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
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
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <div className="space-y-1.5 text-xs">
                              <p className="font-medium mb-1">
                                AI Scoring Priority:
                              </p>
                              <p>
                                <span className="font-medium text-red-600">
                                  Need:
                                </span>{" "}
                                Critical qualification - candidates without this
                                are unlikely to pass
                              </p>
                              <p>
                                <span className="font-medium text-blue-600">
                                  Should:
                                </span>{" "}
                                Important qualification - significantly impacts
                                candidate ranking
                              </p>
                              <p>
                                <span className="font-medium text-purple-600">
                                  Nice:
                                </span>{" "}
                                Bonus qualification - nice to have but not
                                essential
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      )}

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQualification(index)}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p className="text-xs">Remove this qualification</p>
                        </TooltipContent>
                      </Tooltip>
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
      {/* AI Weighting Controls - Only for Professional/Enterprise */}
      {hasAIFeatures && allQualifications.length > 0 && (
        <Card className="border border-blue-200 bg-blue-50/30 shadow-none rounded-xl">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-medium text-blue-600">
                  🤖 AI Scoring Configuration
                </CardTitle>
                <p className="text-xs sm:text-sm text-gray-600">
                  {showAdvancedAI
                    ? "Configure detailed AI evaluation settings"
                    : "AI will automatically score candidates using smart defaults"}
                </p>
              </div>
              <ToggleGroup
                type="single"
                value={showAdvancedAI ? "advanced" : "simple"}
                onValueChange={(value) => {
                  if (value) {
                    setShowAdvancedAI(value === "advanced");
                  }
                }}
                variant="outline"
                size="sm"
                className="h-8"
              >
                <ToggleGroupItem
                  value="simple"
                  aria-label="Simple mode"
                  className="text-xs px-3"
                >
                  <span className="mr-1.5">🎯</span>
                  Simple
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="advanced"
                  aria-label="Advanced mode"
                  className="text-xs px-3"
                >
                  <span className="mr-1.5">🔧</span>
                  Advanced
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 pt-0">
            {/* Simple Mode - Just show that AI is enabled */}
            {!showAdvancedAI && (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  ✅ AI Qualification Scoring Enabled
                </h3>
                <p className="text-sm text-blue-700 max-w-md mx-auto">
                  AI will automatically evaluate candidates against your
                  qualifications using intelligent defaults. No manual
                  configuration needed!
                </p>
              </div>
            )}

            {/* Advanced Mode - Show detailed configuration */}
            {showAdvancedAI && (
              <>
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

                {/* AI Scoring Configuration */}
                <div className="bg-white border rounded-lg p-4 sm:p-6 space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      AI Scoring Configuration
                    </h3>
                    <p className="text-xs text-gray-600">
                      Configure how AI evaluates and scores candidates based on
                      your qualifications
                    </p>
                  </div>

                  {/* Weight Distribution Slider */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-gray-900">
                        Weight Distribution
                      </Label>
                      <div className="flex items-center gap-3 text-xs font-semibold">
                        <span className="text-blue-600">
                          Should: {shouldVsNiceRatio[0]}%
                        </span>
                        <span className="text-gray-400">|</span>
                        <span className="text-purple-600">
                          Nice: {100 - shouldVsNiceRatio[0]}%
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {/* Visual Distribution Bar */}
                      <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                        <div
                          className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out"
                          style={{ width: `${shouldVsNiceRatio[0]}%` }}
                        />
                        <div
                          className="absolute top-0 h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300 ease-out"
                          style={{
                            left: `${shouldVsNiceRatio[0]}%`,
                            width: `${100 - shouldVsNiceRatio[0]}%`,
                          }}
                        />
                      </div>
                      {/* Slider Control */}
                      <Slider
                        value={shouldVsNiceRatio}
                        onValueChange={setShouldVsNiceRatio}
                        min={0}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>More weight on "Nice to Have"</span>
                        <span>More weight on "Should Have"</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      Adjust the relative importance between "Should Have" and
                      "Nice to Have" qualifications in candidate scoring.
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200"></div>

                  {/* Approval Threshold Slider */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-gray-900">
                        Approval Threshold
                      </Label>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-blue-600">
                          {passThreshold[0]}%
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {/* Visual Threshold Bar */}
                      <div className="relative h-8 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-full overflow-hidden shadow-inner">
                        {/* Threshold Indicator Line */}
                        <div
                          className="absolute top-0 bottom-0 w-1 bg-blue-600 shadow-lg z-10 transition-all duration-300"
                          style={{ left: `${passThreshold[0]}%` }}
                        >
                          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-md"></div>
                        </div>
                        {/* Threshold Fill */}
                        <div
                          className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-300"
                          style={{ width: `${passThreshold[0]}%` }}
                        />
                      </div>
                      {/* Slider Control */}
                      <Slider
                        value={passThreshold}
                        onValueChange={setPassThreshold}
                        min={0}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0% - Very strict</span>
                        <span>100% - Very lenient</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      Candidates must reach this threshold to advance to the
                      next screening round.
                    </p>
                  </div>

                  {/* Info Box */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-800">
                        <span className="font-semibold">Auto-Reject:</span>{" "}
                        Candidates missing any "Need To Have" qualifications are
                        automatically rejected, regardless of their score.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
