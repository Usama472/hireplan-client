"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { CustomQuestionsBuilder } from "./custom-questions-builder";
import {
  Plus,
  X,
  CheckCircle,
  Star,
  Info,
  Target,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

export function JobQualificationsStep() {
  const { watch, setValue } = useFormContext();
  const [newRequiredQual, setNewRequiredQual] = useState("");
  const [newPreferredQual, setNewPreferredQual] = useState("");
  
  const requiredQualifications = watch("requiredQualifications") || [];
  const preferredQualifications = watch("preferredQualifications") || [];

  const addRequiredQualification = () => {
    if (newRequiredQual.trim()) {
      const newQual = {
        text: newRequiredQual.trim(),
        score: 100, // Required qualifications default to 100%
      };
      setValue("requiredQualifications", [...requiredQualifications, newQual]);
      setNewRequiredQual("");
    }
  };

  const addPreferredQualification = () => {
    if (newPreferredQual.trim()) {
      const newQual = {
        text: newPreferredQual.trim(),
        score: 50, // Preferred qualifications default to 50%
      };
      setValue("preferredQualifications", [...preferredQualifications, newQual]);
      setNewPreferredQual("");
    }
  };

  const removeRequiredQualification = (index: number) => {
    const updated = requiredQualifications.filter((_: any, i: number) => i !== index);
    setValue("requiredQualifications", updated);
  };

  const removePreferredQualification = (index: number) => {
    const updated = preferredQualifications.filter((_: any, i: number) => i !== index);
    setValue("preferredQualifications", updated);
  };

  const updateQualificationScore = (type: string, index: number, score: number[]) => {
    const qualifications = watch(type) || [];
    const updated = [...qualifications];
    updated[index] = { ...updated[index], score: score[0] };
    setValue(type, updated);
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

  const addFromTemplate = (template: string, type: string) => {
    const currentQuals = watch(type) || [];
    const newQual = {
      text: template,
      score: type === "requiredQualifications" ? 100 : 50,
    };
    setValue(type, [...currentQuals, newQual]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Job Qualifications
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Define required and preferred qualifications with scoring for auto-rejection rules
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Required Qualifications */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-medium text-red-600">
              <CheckCircle className="w-5 h-5" />
              Required Qualifications
            </CardTitle>
            <p className="text-sm text-gray-500">
              Must-have qualifications (default 100% score)
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add New Required Qualification */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Add Requirement</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Driver's License, Working with Children"
                  value={newRequiredQual}
                  onChange={(e) => setNewRequiredQual(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addRequiredQualification();
                    }
                  }}
                  className="text-sm"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addRequiredQualification}
                  disabled={!newRequiredQual.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Template Options */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Quick Add Templates</Label>
              <div className="flex flex-wrap gap-1">
                {qualificationTemplates.map((template) => (
                  <Button
                    key={template}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 px-2 text-gray-600 hover:text-red-600"
                    onClick={() => addFromTemplate(template, "requiredQualifications")}
                  >
                    + {template}
                  </Button>
                ))}
              </div>
            </div>

            {/* Required Qualifications List */}
            {requiredQualifications.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm text-gray-600">Current Requirements</Label>
                {requiredQualifications.map((qual: any, index: number) => (
                  <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-md space-y-3">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium text-red-900 flex-1">{qual.text}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRequiredQualification(index)}
                        className="h-6 w-6 p-0 text-red-400 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    {/* Scoring */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-gray-600">Auto-rejection score</Label>
                        <div className="flex items-center gap-2">
                          <Target className="w-3 h-3 text-red-500" />
                          <span className="text-xs font-semibold text-red-600">
                            {qual.score || 100}%
                          </span>
                        </div>
                      </div>
                      <Slider
                        value={[qual.score || 100]}
                        onValueChange={(value) => 
                          updateQualificationScore("requiredQualifications", index, value)
                        }
                        max={100}
                        min={0}
                        step={5}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500">
                        Candidates scoring below {qual.score || 100}% will be auto-rejected
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {requiredQualifications.length === 0 && (
              <div className="p-4 text-center text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded-md">
                No required qualifications added yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preferred Qualifications */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-medium text-green-600">
              <Star className="w-5 h-5" />
              Preferred Qualifications
            </CardTitle>
            <p className="text-sm text-gray-500">
              Nice-to-have qualifications (default 50% score)
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add New Preferred Qualification */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Add Preference</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., RBT Certification, Bilingual"
                  value={newPreferredQual}
                  onChange={(e) => setNewPreferredQual(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addPreferredQualification();
                    }
                  }}
                  className="text-sm"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addPreferredQualification}
                  disabled={!newPreferredQual.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Template Options */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Quick Add Templates</Label>
              <div className="flex flex-wrap gap-1">
                {qualificationTemplates.map((template) => (
                  <Button
                    key={template}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 px-2 text-gray-600 hover:text-green-600"
                    onClick={() => addFromTemplate(template, "preferredQualifications")}
                  >
                    + {template}
                  </Button>
                ))}
              </div>
            </div>

            {/* Preferred Qualifications List */}
            {preferredQualifications.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm text-gray-600">Current Preferences</Label>
                {preferredQualifications.map((qual: any, index: number) => (
                  <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-md space-y-3">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium text-green-900 flex-1">{qual.text}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePreferredQualification(index)}
                        className="h-6 w-6 p-0 text-green-400 hover:text-green-600"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    {/* Scoring */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-gray-600">Bonus score weight</Label>
                        <div className="flex items-center gap-2">
                          <Star className="w-3 h-3 text-green-500" />
                          <span className="text-xs font-semibold text-green-600">
                            {qual.score || 50}%
                          </span>
                        </div>
                      </div>
                      <Slider
                        value={[qual.score || 50]}
                        onValueChange={(value) => 
                          updateQualificationScore("preferredQualifications", index, value)
                        }
                        max={100}
                        min={0}
                        step={5}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500">
                        Candidates meeting this preference get +{qual.score || 50}% bonus
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {preferredQualifications.length === 0 && (
              <div className="p-4 text-center text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded-md">
                No preferred qualifications added yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Custom Pre-Screening Questions */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-medium text-purple-600">
            <MessageSquare className="w-5 h-5" />
            Custom Pre-Screening Questions
          </CardTitle>
          <p className="text-sm text-gray-500">
            Add up to 5 custom questions with scoring for auto-rejection (moved from old job requirements)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-purple-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-purple-900">
                  Smart Auto-Rejection Example
                </p>
                <p className="text-xs text-purple-700">
                  <strong>Education Requirement:</strong> High School (25%), Associates (35%), Bachelors (45%), Masters (100%), Doctoral (50%)
                  <br />
                  <strong>Rule:</strong> Under 35% = Auto-rejection (saves AI costs)
                </p>
              </div>
            </div>
          </div>

          <CustomQuestionsBuilder
            name="customQuestions"
            label="Custom Screening Questions (Max 5)"
            description="Add up to 5 custom questions to screen applicants and gather specific information during the application process. Import from templates to avoid recreating common questions."
          />

          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-yellow-900">
                  Custom Questions Tips
                </p>
                <ul className="text-xs text-yellow-800 space-y-1">
                  <li>• <strong>Limit to 5 questions:</strong> Keep applications short and focused</li>
                  <li>• <strong>Use templates:</strong> Import common questions from your settings</li>
                  <li>• <strong>Score answers:</strong> Set percentage values for auto-rejection rules</li>
                  <li>• <strong>Examples:</strong> "Driver's License?", "Work with children?", "Available weekends?"</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 mt-0.5" />
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-blue-900">
              How Qualification Scoring Works
            </h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• <strong>Required qualifications:</strong> Candidates must meet the minimum score to avoid auto-rejection</li>
              <li>• <strong>Preferred qualifications:</strong> Add bonus points to candidate's overall score</li>
              <li>• <strong>Auto-rejection rules:</strong> Save AI costs by filtering out unqualified candidates early</li>
              <li>• <strong>Custom questions:</strong> Each answer gets a score - combine with qualifications for smart filtering</li>
              <li>• <strong>Example:</strong> "Bachelor's Degree (75%)" means candidates without one score 0%, causing auto-rejection if threshold is above 0%</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}