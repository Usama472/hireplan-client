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
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

import {
  Plus,
  X,
  FileText,
  Brain,
  Info,
  Target,
  Award,
  Briefcase,
  MessageSquare,
} from "lucide-react";
import { CustomQuestionsBuilder } from "./custom-questions-builder";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";

export function ResumeAnalysisStep() {
  const { watch, setValue } = useFormContext();
  const { subscription } = useAuthSessionContext();
  const [newCriterion, setNewCriterion] = useState("");

  // Check if user has AI features (Professional/Enterprise)
  const hasAIFeatures =
    subscription?.planId === "professional" ||
    subscription?.planId === "enterprise";

  // Resume analysis criteria
  const resumeCriteria = watch("resumeCriteria") || [];
  const resumeAnalysisMode = watch("resumeAnalysisMode") || "simple";

  // AI Weighting Controls
  const [resumeWeight, setResumeWeight] = useState([30]); // 30% weight for resume analysis
  
  // Pre-screening threshold controls
  const [preScreeningThreshold, setPreScreeningThreshold] = useState([50]); // Approval threshold for pre-screening

  const addCriterion = () => {
    if (newCriterion.trim()) {
      const newCrit = {
        text: newCriterion.trim(),
        type: "skill", // Default type
        aiCategory: hasAIFeatures ? "should" : undefined,
        weight: 1, // Default weight
      };
      setValue("resumeCriteria", [...resumeCriteria, newCrit]);
      setNewCriterion("");
    }
  };

  const removeCriterion = (index: number) => {
    const updated = resumeCriteria.filter((_: any, i: number) => i !== index);
    setValue("resumeCriteria", updated);
  };

  const updateCriterionType = (index: number, type: string) => {
    const updated = resumeCriteria.map((crit: any, i: number) =>
      i === index ? { ...crit, type } : crit
    );
    setValue("resumeCriteria", updated);
  };

  const updateCriterionCategory = (index: number, aiCategory: string) => {
    const updated = resumeCriteria.map((crit: any, i: number) =>
      i === index ? { ...crit, aiCategory } : crit
    );
    setValue("resumeCriteria", updated);
  };

  const criteriaTemplates = [
    { text: "React.js", type: "skill" },
    { text: "Node.js", type: "skill" },
    { text: "TypeScript", type: "skill" },
    { text: "Project Management", type: "skill" },
    { text: "Team Leadership", type: "experience" },
    { text: "Healthcare Experience", type: "experience" },
    { text: "ABA Therapy", type: "experience" },
    { text: "Bachelor's Degree", type: "education" },
    { text: "Master's Degree", type: "education" },
    { text: "Professional Certification", type: "certification" },
  ];

  const addFromTemplate = (template: any) => {
    const newCrit = {
      text: template.text,
      type: template.type,
      aiCategory: hasAIFeatures ? "should" : undefined,
      weight: 1,
    };
    setValue("resumeCriteria", [...resumeCriteria, newCrit]);
  };

  const getTypeInfo = (type: string) => {
    const types = {
      skill: {
        label: "Skill",
        icon: Target,
        color: "bg-blue-100 text-blue-700",
      },
      experience: {
        label: "Experience",
        icon: Briefcase,
        color: "bg-green-100 text-green-700",
      },
      education: {
        label: "Education",
        icon: Award,
        color: "bg-purple-100 text-purple-700",
      },
      certification: {
        label: "Certification",
        icon: Award,
        color: "bg-orange-100 text-orange-700",
      },
    };
    return types[type as keyof typeof types] || types.skill;
  };

  if (!hasAIFeatures) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Resume Analysis
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            AI-powered resume analysis is available with Professional and
            Enterprise plans.
          </p>
        </div>

        <Card className="border border-blue-200 bg-blue-50/30">
          <CardContent className="p-8 text-center">
            <Brain className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              AI Resume Analysis
            </h3>
            <p className="text-sm text-blue-700 mb-6 max-w-md mx-auto">
              Automatically analyze candidate resumes for skills, experience,
              and qualifications. Set criteria and let AI score candidates based
              on their background.
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Upgrade to Professional
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="px-1">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
          Resume Analysis
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Choose how AI should analyze candidate resumes for this position.
        </p>
      </div>

      {/* Mode Selection */}
      <Card className="border border-gray-200 shadow-none rounded-xl">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-medium text-blue-600">
            <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
            Analysis Mode
          </CardTitle>
          <p className="text-xs sm:text-sm text-gray-500">
            Select how detailed you want the resume analysis to be.
          </p>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {/* Simple Mode */}
            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                resumeAnalysisMode === "simple"
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => {
                setValue("resumeAnalysisMode", "simple");
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`p-2 rounded-lg ${
                    resumeAnalysisMode === "simple"
                      ? "bg-blue-500"
                      : "bg-gray-400"
                  }`}
                >
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">🎯 Smart & Simple</h3>
                  <p className="text-xs text-gray-600">
                    AI handles everything automatically
                  </p>
                </div>
              </div>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• ✨ Zero setup required</li>
                <li>• 🧠 AI reads your job description</li>
                <li>• 🎯 Finds the best matching candidates</li>
                <li>• ⚡ Ready to use immediately</li>
              </ul>
            </div>

            {/* Detailed Mode */}
            <div
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                resumeAnalysisMode === "detailed"
                  ? "border-purple-500 bg-purple-50 shadow-md"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => {
                setValue("resumeAnalysisMode", "detailed");
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`p-2 rounded-lg ${
                    resumeAnalysisMode === "detailed"
                      ? "bg-purple-500"
                      : "bg-gray-400"
                  }`}
                >
                  <Target className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    🔧 Advanced Control
                  </h3>
                  <p className="text-xs text-gray-600">
                    Customize every detail
                  </p>
                </div>
              </div>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• 📝 Define specific skills to look for</li>
                <li>• ⚖️ Set custom scoring weights</li>
                <li>• 🎛️ Fine-tune AI evaluation</li>
                <li>• 🔬 Advanced configuration options</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Simple Mode Content */}
      {resumeAnalysisMode === "simple" && (
        <Card className="border border-green-200 bg-green-50/30">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-green-900 mb-2">
              ✅ AI Resume Analysis Enabled
            </h3>
            <p className="text-sm text-green-700 mb-4 max-w-md mx-auto">
              AI will automatically analyze candidate resumes and score them based on your job requirements. No additional setup needed!
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-800">Auto-configured</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Mode Content */}
      {resumeAnalysisMode === "detailed" && (
        <>
          <Card className="border border-purple-200 bg-purple-50/30">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-medium text-purple-600">
                <Target className="w-5 h-5" />
                Custom Resume Criteria
              </CardTitle>
              <p className="text-sm text-gray-600">
                Define specific skills, experience, and qualifications to look
                for in resumes.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Criterion */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Add Criterion</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., React.js, Project Management, Healthcare Experience"
                    value={newCriterion}
                    onChange={(e) => setNewCriterion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCriterion();
                      }
                    }}
                    className="text-sm"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addCriterion}
                    disabled={!newCriterion.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Template Options */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">
                  Quick Add Templates
                </Label>
                <div className="flex flex-wrap gap-1">
                  {criteriaTemplates.map((template, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 px-2 text-gray-600 hover:text-purple-600"
                      onClick={() => addFromTemplate(template)}
                    >
                      + {template.text}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Resume Criteria List */}
              {resumeCriteria.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm text-gray-600">
                    Current Criteria
                  </Label>
                  {resumeCriteria.map((criterion: any, index: number) => {
                    const typeInfo = getTypeInfo(criterion.type);
                    return (
                      <div
                        key={index}
                        className="p-3 bg-white border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <typeInfo.icon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-900">
                              {criterion.text}
                            </span>
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${typeInfo.color}`}
                            >
                              {typeInfo.label}
                            </span>
                          </div>

                          {/* Controls */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Type Selector */}
                            <Select
                              value={criterion.type || "skill"}
                              onValueChange={(value) =>
                                updateCriterionType(index, value)
                              }
                            >
                              <SelectTrigger className="h-7 w-24 text-xs border-gray-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent align="end" className="min-w-32">
                                <SelectItem value="skill" className="text-xs">
                                  <div className="flex items-center gap-2">
                                    <Target className="w-3 h-3" />
                                    Skill
                                  </div>
                                </SelectItem>
                                <SelectItem
                                  value="experience"
                                  className="text-xs"
                                >
                                  <div className="flex items-center gap-2">
                                    <Briefcase className="w-3 h-3" />
                                    Experience
                                  </div>
                                </SelectItem>
                                <SelectItem
                                  value="education"
                                  className="text-xs"
                                >
                                  <div className="flex items-center gap-2">
                                    <Award className="w-3 h-3" />
                                    Education
                                  </div>
                                </SelectItem>
                                <SelectItem
                                  value="certification"
                                  className="text-xs"
                                >
                                  <div className="flex items-center gap-2">
                                    <Award className="w-3 h-3" />
                                    Certification
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>

                            {/* AI Category Dropdown */}
                            <Select
                              value={criterion.aiCategory || "should"}
                              onValueChange={(value) =>
                                updateCriterionCategory(index, value)
                              }
                            >
                              <SelectTrigger className="h-7 w-28 text-xs border-gray-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent align="end" className="min-w-36">
                                <SelectItem value="need" className="text-xs">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex-shrink-0"></div>
                                    <span>Need</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="should" className="text-xs">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex-shrink-0"></div>
                                    <span>Should</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="nice" className="text-xs">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex-shrink-0"></div>
                                    <span>Nice</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCriterion(index)}
                              className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {resumeCriteria.length === 0 && (
                <div className="p-4 text-center text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded-md">
                  No resume criteria added yet. Add criteria above to analyze
                  candidate resumes.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detailed Mode AI Configuration */}
          {resumeCriteria.length > 0 && (
            <Card className="border border-purple-200 bg-purple-50/30">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-medium text-purple-600">
                  🤖 Resume AI Configuration
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Configure how AI analyzes and scores candidate resumes
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Category Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gradient-to-br from-red-50 to-pink-50 border border-red-200/50 rounded-xl">
                    <div className="text-xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                      {
                        resumeCriteria.filter(
                          (c: any) => c.aiCategory === "need"
                        ).length
                      }
                    </div>
                    <div className="text-xs font-medium text-red-700/80">
                      Need
                    </div>
                  </div>

                  <div className="text-center p-3 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 rounded-xl">
                    <div className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      {
                        resumeCriteria.filter(
                          (c: any) => c.aiCategory === "should"
                        ).length
                      }
                    </div>
                    <div className="text-xs font-medium text-amber-700/80">
                      Should Have
                    </div>
                  </div>

                  <div className="text-center p-3 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/50 rounded-xl">
                    <div className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      {
                        resumeCriteria.filter(
                          (c: any) => c.aiCategory === "nice"
                        ).length
                      }
                    </div>
                    <div className="text-xs font-medium text-emerald-700/80">
                      Nice to Have
                    </div>
                  </div>
                </div>

                {/* Resume Weight Slider */}
                <div className="p-4 bg-white border rounded-lg">
                  <Label className="text-sm font-medium mb-3 block">
                    Resume Analysis Weight
                  </Label>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-800">
                        Impact on Overall Score
                      </span>
                      <span className="font-medium text-purple-900">
                        {resumeWeight[0]}%
                      </span>
                    </div>
                    <Slider
                      value={resumeWeight}
                      onValueChange={setResumeWeight}
                      max={60}
                      min={10}
                      step={5}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-xs text-purple-600">
                      <span>10% (Low Impact)</span>
                      <span>60% (High Impact)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Custom Pre-Screening Questions */}
      <Card className="border border-green-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-medium text-green-600">
            <MessageSquare className="w-5 h-5" />
            Custom Pre-Screening Questions
          </CardTitle>
          <p className="text-sm text-gray-500">
            Add up to 5 custom questions for pre-screening applicants alongside resume analysis. These questions help gather specific information not found in resumes.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <CustomQuestionsBuilder
            name="customQuestions"
            label="Custom Screening Questions (Max 5)"
            description="Add up to 5 custom questions to screen applicants and gather specific information during the application process. Import from templates to avoid recreating common questions."
          />

          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-green-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-green-900">
                  Custom Questions Tips
                </p>
                <ul className="text-xs text-green-800 space-y-1">
                  <li>
                    • <strong>Complement Resume:</strong> Ask what resumes don't show (availability, certifications, preferences)
                  </li>
                  <li>
                    • <strong>Keep Focused:</strong> Limit to 5 questions to maintain good candidate experience
                  </li>
                  <li>
                    • <strong>Use Scoring:</strong> Questions with scoring help AI rank candidates alongside resume analysis
                  </li>
                  <li>
                    • <strong>Examples:</strong> "Do you have a driver's license?", "Available weekends?", "Years of experience with X?"
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pre-Screening Questions Threshold Configuration - Only show if there are custom questions AND in detailed mode */}
      {watch("customQuestions")?.length > 0 && resumeAnalysisMode === "detailed" && (
        <Card className="border border-blue-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-medium text-blue-600">
              <Target className="w-5 h-5" />
              Pre-Screening Questions Scoring Thresholds
            </CardTitle>
            <p className="text-sm text-gray-500">
              Configure how AI handles candidates based on their pre-screening question scores.
            </p>
          </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 pt-0">
          {/* Interactive Threshold Configuration */}
          <div className="bg-white border rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4">
            <div className="space-y-2 sm:space-y-3">
              <Label className="text-xs sm:text-sm font-medium block">
                Pre-Screening Questions Threshold Configuration
              </Label>
              <div className="text-xs text-gray-600 space-y-2">
                <p>
                  <span className="font-medium text-gray-700">Approval Threshold:</span> When pre-screening questions reach <span className="font-semibold text-blue-600">{preScreeningThreshold[0]}%</span>, candidates advance to the next screening round.
                </p>
                <p>
                  <span className="font-medium text-red-600">Auto-Reject:</span> Candidates with poor pre-screening question responses are automatically rejected.
                </p>
              </div>
            </div>

            {/* Interactive Combined Visual Bar */}
            <div
              className="relative h-12 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full shadow-inner cursor-pointer mb-8"
              onClick={(e) => {
                // Don't handle click if it's on the approval threshold slider
                if ((e.target as HTMLElement).closest('.approval-threshold-slider')) {
                  return;
                }
                
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const percentage = Math.round((x / rect.width) * 100);
                setPreScreeningThreshold([
                  Math.max(0, Math.min(100, percentage)),
                ]);
                setValue("automation.sectionThresholds.preScreeningQuestions.manualReview", percentage);
              }}
            >

              {/* Approval Threshold Slider */}
              <div
                className="approval-threshold-slider absolute -top-1 h-14 w-4 z-50 cursor-grab active:cursor-grabbing"
                style={{ left: `calc(${preScreeningThreshold[0]}% - 8px)` }}
                title={`Drag to adjust approval threshold: ${preScreeningThreshold[0]}%`}
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
                    setPreScreeningThreshold([
                      Math.max(0, Math.min(100, percentage)),
                    ]);
                    setValue("automation.sectionThresholds.preScreeningQuestions.manualReview", percentage);
                  };

                  const handleMouseUp = (upEvent: MouseEvent) => {
                    upEvent.preventDefault();
                    upEvent.stopPropagation();
                    
                    document.removeEventListener("mousemove", handleMouseMove);
                    document.removeEventListener("mouseup", handleMouseUp);
                    document.body.style.userSelect = "";
                    document.body.style.pointerEvents = "";
                    
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
                  Approval Rate: {preScreeningThreshold[0]}%
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex justify-center text-xs font-medium">
              <span className="text-gray-700">
                📏 Pre-Screening Approval: {preScreeningThreshold[0]}%
              </span>
            </div>
          </div>

          {/* Explanation */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900">
                  How Pre-Screening Thresholds Work
                </p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>
                    • <strong>Approval Threshold:</strong> Candidates scoring above {preScreeningThreshold[0]}% advance to the next round
                  </li>
                  <li>
                    • <strong>Manual Review:</strong> Candidates below the threshold require human review
                  </li>
                  <li>
                    • <strong>Combined Scoring:</strong> This threshold works with resume analysis and qualifications for final decisions
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Information Box */}
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-md">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-purple-500 mt-0.5" />
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-purple-900">
              How Resume Analysis & Pre-Screening Works
            </h4>
            <ul className="text-xs text-purple-700 space-y-1">
              <li>
                • <strong>Resume Analysis:</strong> AI analyzes resumes for skills, experience, and qualifications
              </li>
              <li>
                • <strong>Pre-Screening Questions:</strong> Gather specific information not found in resumes
              </li>
              <li>
                • <strong>Combined Scoring:</strong> Both resume and question answers contribute to overall candidate score
              </li>
              <li>
                • <strong>Contextual Matching:</strong> AI understands synonyms and related terms in both resumes and answers
              </li>
              <li>
                • <strong>Qualification Integration:</strong> Results combine with job qualifications for final ranking
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
