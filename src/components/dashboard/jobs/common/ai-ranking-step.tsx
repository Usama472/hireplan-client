"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";

import {
  Plus,
  X,
  Target,
  CheckCircle,
  AlertTriangle,
  Info,
  MessageSquare,
  FileText,
  Star,
  Users,
  Calendar,
  Mail,
  ArrowRight,
  Lightbulb,
} from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

export function AIRankingStep() {
  const { watch, setValue } = useFormContext();
  
  // Section-based scoring system - get actual qualification data
  const requiredQualifications = watch("requiredQualifications") || [];
  const preferredQualifications = watch("preferredQualifications") || [];
  const customQuestions = watch("customQuestions") || [];
  
  // Determine which sections actually exist based on form data
  const availableSections = {
    requiredQualifications: requiredQualifications.length > 0,
    preferredQualifications: preferredQualifications.length > 0,
    preScreeningQuestions: customQuestions.length > 0,
    resume: true, // Resume section is always available
  };

  // Only track weights for sections that exist
  const sectionWeights = watch("automation.sectionWeights") || {};
  const sectionThresholds = watch("automation.sectionThresholds") || {};
  
  // Preferred qualifications scoring
  const preferredQualScoring = watch("automation.preferredQualScoring") || {};
  
  // Resume items and scoring
  const resumeItems = watch("automation.resumeItems") || [];
  const resumeItemScoring = watch("automation.resumeItemScoring") || {};
  
  // Job rules
  const jobRules = watch("automation.jobRules") || [];
  
  // Auto-fail toggles for pre-screening questions
  const questionAutoFail = watch("automation.questionAutoFail") || {};
  
  // Correct answer criteria for pre-screening questions
  const questionCriteria = watch("automation.questionCriteria") || {};
  
  const [newResumeItem, setNewResumeItem] = useState("");
  const [newJobRule, setNewJobRule] = useState({
    sectionCount: "",
    status: "",
    action: "",
    template: "",
  });

  // Calculate total only for available sections
  const totalSectionWeight = Object.entries(availableSections)
    .filter(([_, exists]) => exists)
    .reduce((sum: number, [sectionName]) => {
      return sum + (Number(sectionWeights[sectionName]) || 0);
    }, 0);
  const isValidSectionWeight = totalSectionWeight <= 100;

  // Get list of available section names for display
  const availableSectionNames = Object.entries(availableSections)
    .filter(([_, exists]) => exists)
    .map(([name]) => name);

  const updateSectionWeight = (section: string, weight: number[]) => {
    setValue(`automation.sectionWeights.${section}`, weight[0]);
  };

  const updateSectionThreshold = (section: string, type: string, value: number[]) => {
    setValue(`automation.sectionThresholds.${section}.${type}`, value[0]);
  };

  const updatePreferredQualScore = (index: number, score: number[]) => {
    const newScore = score[0];
    
    // Calculate what the total would be with this new score
    const otherScoresTotal = Object.entries(preferredQualScoring)
      .filter(([key, _]) => parseInt(key) !== index)
      .reduce((sum, [_, value]) => sum + (Number(value) || 0), 0);
    
    const newTotal = otherScoresTotal + newScore;
    
    // Only update if it doesn't exceed 100%
    if (newTotal <= 100) {
      setValue(`automation.preferredQualScoring.${index}`, newScore);
    }
    // If it would exceed 100%, don't update (slider won't move)
  };

  const updateQuestionAutoFail = (index: number, checked: boolean) => {
    setValue(`automation.questionAutoFail.${index}`, checked);
  };

  const updateQuestionCriteria = (index: number, field: string, value: string) => {
    const current = questionCriteria[index] || {};
    setValue(`automation.questionCriteria.${index}`, { ...current, [field]: value });
  };

  const addResumeItem = () => {
    if (newResumeItem.trim()) {
      setValue("automation.resumeItems", [...resumeItems, newResumeItem.trim()]);
      setNewResumeItem("");
    }
  };

  const removeResumeItem = (index: number) => {
    const updated = resumeItems.filter((_: any, i: number) => i !== index);
    setValue("automation.resumeItems", updated);
    // Remove associated scoring
    const updatedScoring = { ...resumeItemScoring };
    delete updatedScoring[index];
    setValue("automation.resumeItemScoring", updatedScoring);
  };

  const updateResumeItemScore = (index: number, score: number[]) => {
    const newScore = score[0];
    
    // Calculate what the total would be with this new score
    const otherScoresTotal = Object.entries(resumeItemScoring)
      .filter(([key, _]) => parseInt(key) !== index)
      .reduce((sum, [_, value]) => sum + (Number(value) || 0), 0);
    
    const newTotal = otherScoresTotal + newScore;
    
    // Only update if it doesn't exceed 100%
    if (newTotal <= 100) {
      setValue(`automation.resumeItemScoring.${index}`, newScore);
    }
    // If it would exceed 100%, don't update (slider won't move)
  };

  const addJobRule = () => {
    if (newJobRule.sectionCount && newJobRule.status && newJobRule.action) {
      // Build the display text for the condition
      const conditionText = newJobRule.sectionCount === "all" 
        ? `All ${availableSectionNames.length} sections`
        : `${newJobRule.sectionCount}/${availableSectionNames.length} sections`;
      
      const ruleWithCondition = {
        ...newJobRule,
        sectionsCondition: conditionText, // Keep this for display
      };
      
      setValue("automation.jobRules", [...jobRules, ruleWithCondition]);
      setNewJobRule({
        sectionCount: "",
        status: "",
        action: "",
        template: "",
      });
    }
  };

  const removeJobRule = (index: number) => {
    setValue("automation.jobRules", jobRules.filter((_: any, i: number) => i !== index));
  };

  // Calculate totals for preferred qualifications
  const preferredQualTotal = Object.values(preferredQualScoring).reduce((sum: number, score: any) => sum + (Number(score) || 0), 0);
  const isValidPreferredTotal = preferredQualTotal <= 100;

  // Calculate totals for resume items
  const resumeItemTotal = Object.values(resumeItemScoring).reduce((sum: number, score: any) => sum + (Number(score) || 0), 0);
  const isValidResumeTotal = resumeItemTotal <= 100;

  const ruleTemplates = [
    { value: "interview-invitation", label: "Interview Invitation" },
    { value: "phone-screen", label: "Phone Screen Invitation" },
    { value: "additional-questions", label: "Additional Questions" },
    { value: "rejection-polite", label: "Polite Rejection" },
    { value: "rejection-standard", label: "Standard Rejection" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Candidate Scoring System
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Configure scoring for each section with Auto Reject, Manual Review, and Pass thresholds.
        </p>
      </div>

      {/* Section Weights Overview - Only show if we have available sections */}
      {availableSectionNames.length > 0 && (
        <Card className="border border-blue-200 bg-blue-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-medium text-blue-600">
              <Target className="w-5 h-5" />
              Section Weight Distribution
          </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-blue-700">
                Total Section Weights ({availableSectionNames.length} active sections)
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${isValidSectionWeight ? "text-green-600" : "text-red-600"}`}>
                  {totalSectionWeight}%
                </span>
                <Progress value={Math.min(totalSectionWeight, 100)} className="w-24 h-2" />
              </div>
            </div>
            
            {/* Show available sections */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {availableSectionNames.map((sectionName) => (
                <div key={sectionName} className="text-xs text-blue-600 bg-white px-2 py-1 rounded">
                  {sectionName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: {sectionWeights[sectionName] || 0}%
                </div>
              ))}
            </div>
            
            {!isValidSectionWeight && (
              <Alert variant="destructive" className="py-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Total section weights cannot exceed 100%. Currently at {totalSectionWeight}%
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* No sections available warning */}
      {availableSectionNames.length === 0 && (
        <Card className="border border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">No Scoring Sections Available</h3>
                <p className="text-xs text-yellow-700 mt-1">
                  Add qualifications or custom questions in previous steps to enable candidate scoring.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Required Qualifications - Only show if there are required qualifications */}
      {availableSections.requiredQualifications && (
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-medium text-green-600">
            <CheckCircle className="w-5 h-5" />
            Required Qualifications
          </CardTitle>
          <p className="text-sm text-gray-500">
            Section-level scoring for all required qualifications
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Section Weight */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Section Weight</Label>
              <span className="text-sm font-semibold text-green-600">
                {sectionWeights.requiredQualifications || 0}%
              </span>
            </div>
            <Slider
              value={[sectionWeights.requiredQualifications || 0]}
              onValueChange={(value) => updateSectionWeight("requiredQualifications", value)}
              max={100}
              min={0}
              step={1}
              className="w-full"
            />
          </div>

          {/* Thresholds */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-red-600">Auto Reject Below</Label>
              <div className="text-center">
                <span className="text-lg font-bold text-red-600">
                  {sectionThresholds.requiredQualifications?.autoReject || 40}%
                </span>
            </div>
              <Slider
                value={[sectionThresholds.requiredQualifications?.autoReject || 40]}
                onValueChange={(value) => updateSectionThreshold("requiredQualifications", "autoReject", value)}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-green-600">Auto Pass Above</Label>
              <div className="text-center">
                <span className="text-lg font-bold text-green-600">
                  {sectionThresholds.requiredQualifications?.manualReview || 75}%
                </span>
              </div>
              <Slider
                value={[sectionThresholds.requiredQualifications?.manualReview || 75]}
                onValueChange={(value) => updateSectionThreshold("requiredQualifications", "manualReview", value)}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
          </div>
          
                    {/* Required Qualifications Info */}
          {requiredQualifications.length > 0 ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700">
                <strong>{requiredQualifications.length} required qualifications</strong> are defined. Candidates must meet all requirements.
              </p>
              <p className="text-xs text-green-600 mt-1">
                Configure section weight and thresholds above. Individual requirements are managed in the Job Qualifications step.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700">
                <strong>No required qualifications defined.</strong> Add required qualifications in the Job Qualifications step to enable this section.
              </p>
            </div>
          )}

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">How Required Qualifications Work</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Each qualification uses a simple <strong>toggle: Yes (100%) or No (0%)</strong></li>
                  <li>• No partial scoring - just flip the toggle for each requirement</li>
                  <li>• Section score = percentage of requirements met</li>
                  <li>• Example: 3 out of 4 requirements met = 75% section score</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Preferred Qualifications - Only show if there are preferred qualifications */}
      {availableSections.preferredQualifications && (
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-medium text-purple-600">
            <Star className="w-5 h-5" />
            Preferred Qualifications
          </CardTitle>
          <p className="text-sm text-gray-500">
            Custom scoring per qualification (must total 100%)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Section Weight */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Section Weight</Label>
              <span className="text-sm font-semibold text-purple-600">
                {sectionWeights.preferredQualifications || 0}%
              </span>
            </div>
            <Slider
              value={[sectionWeights.preferredQualifications || 0]}
              onValueChange={(value) => updateSectionWeight("preferredQualifications", value)}
              max={100}
              min={0}
              step={1}
              className="w-full"
            />
          </div>

          {/* Individual Qualification Scoring */}
          {preferredQualifications.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Individual Qualification Weights</Label>
            <div className="flex items-center gap-2">
                                      <span className={`text-sm font-medium transition-all duration-200 ease-in-out ${isValidPreferredTotal ? "text-green-600" : "text-red-600"}`}>
                      {preferredQualTotal}%
              </span>
                    <Progress value={Math.min(preferredQualTotal, 100)} className="w-16 h-2 transition-all duration-200 ease-in-out" />
            </div>
          </div>

              {!isValidPreferredTotal && (
                <Alert variant="destructive" className="py-2">
              <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Individual qualification weights must total 100%. Currently at {preferredQualTotal}%
              </AlertDescription>
            </Alert>
          )}

              {preferredQualifications.map((qual: any, index: number) => (
                <div key={index} className="p-3 bg-gray-50 rounded-md space-y-2">
              <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {qual.text || qual.title || qual.qualification || qual.description || `Preferred Qualification ${index + 1}`}
                    </span>
                  <span className="text-sm font-semibold text-purple-600 transition-all duration-200 ease-in-out">
                      {preferredQualScoring[index] || 0}%
                  </span>
                </div>
                  <Slider
                    value={[preferredQualScoring[index] || 0]}
                    onValueChange={(value) => updatePreferredQualScore(index, value)}
                    max={100}
                    min={0}
                    step={1}
                    className="w-full transition-all duration-200 ease-in-out"
                  />
              </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-md">
              <p className="text-sm text-purple-700">
                <strong>No preferred qualifications defined.</strong> Add preferred qualifications in the Job Qualifications step to configure individual scoring here.
              </p>
            </div>
          )}

          {/* Thresholds */}
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
              <Label className="text-sm text-red-600">Auto Reject Below</Label>
              <div className="text-center">
                <span className="text-lg font-bold text-red-600">
                  {sectionThresholds.preferredQualifications?.autoReject || 30}%
                </span>
              </div>
                <Slider
                value={[sectionThresholds.preferredQualifications?.autoReject || 30]}
                onValueChange={(value) => updateSectionThreshold("preferredQualifications", "autoReject", value)}
                  max={100}
                  min={0}
                step={1}
                  className="w-full"
                />
              </div>
            <div className="space-y-2">
              <Label className="text-sm text-green-600">Auto Pass Above</Label>
              <div className="text-center">
                <span className="text-lg font-bold text-green-600">
                  {sectionThresholds.preferredQualifications?.manualReview || 70}%
                </span>
              </div>
              <Slider
                value={[sectionThresholds.preferredQualifications?.manualReview || 70]}
                onValueChange={(value) => updateSectionThreshold("preferredQualifications", "manualReview", value)}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
        </Card>
      )}

      {/* Pre-Screening Questions - Only show if there are custom questions */}
      {availableSections.preScreeningQuestions && (
        <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-medium text-blue-600">
            <MessageSquare className="w-5 h-5" />
            Pre-Screening Questions
          </CardTitle>
          <p className="text-sm text-gray-500">
            AI reviews text answers to determine Pass/Fail for each question
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Section Weight */}
              <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Section Weight</Label>
              <span className="text-sm font-semibold text-blue-600">
                {sectionWeights.preScreeningQuestions || 0}%
              </span>
                  </div>
            <Slider
              value={[sectionWeights.preScreeningQuestions || 0]}
              onValueChange={(value) => updateSectionWeight("preScreeningQuestions", value)}
              max={100}
              min={0}
              step={1}
              className="w-full"
            />
                  </div>

          {/* Thresholds */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-red-600">Auto Reject Below</Label>
              <div className="text-center">
                <span className="text-lg font-bold text-red-600">
                  {sectionThresholds.preScreeningQuestions?.autoReject || 35}%
                </span>
                  </div>
              <Slider
                value={[sectionThresholds.preScreeningQuestions?.autoReject || 35]}
                onValueChange={(value) => updateSectionThreshold("preScreeningQuestions", "autoReject", value)}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
                  </div>
            <div className="space-y-2">
              <Label className="text-sm text-green-600">Auto Pass Above</Label>
              <div className="text-center">
                <span className="text-lg font-bold text-green-600">
                  {sectionThresholds.preScreeningQuestions?.manualReview || 75}%
                </span>
                  </div>
              <Slider
                value={[sectionThresholds.preScreeningQuestions?.manualReview || 75]}
                onValueChange={(value) => updateSectionThreshold("preScreeningQuestions", "manualReview", value)}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
                </div>
              </div>

          {/* Show current custom questions with auto-fail toggles */}
          {customQuestions.length > 0 ? (
              <div className="space-y-3">
              <Label className="text-sm font-medium">Pre-Screening Questions - Auto-Fail Settings</Label>
                            <div className="space-y-4">
                {customQuestions.map((question: any, index: number) => (
                  <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                    {/* Question Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex-1 mr-4">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {question.text || question.question || question.title || `Question ${index + 1}`}
                        </p>
                        <div className="flex items-center gap-4 text-xs">
                          <span className={`font-medium ${questionAutoFail[index] ? "text-red-700" : "text-blue-700"}`}>
                            {questionAutoFail[index] ? "⚠️ Auto-Fail if answered incorrectly" : "📝 Standard scoring"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <span className={`font-medium ${questionAutoFail[index] ? "text-gray-500" : "text-blue-700"}`}>
                            Standard
                          </span>
                          <Switch
                            checked={questionAutoFail[index] || false}
                            onCheckedChange={(checked) => updateQuestionAutoFail(index, checked)}
                            className="data-[state=checked]:bg-red-600"
                          />
                          <span className={`font-medium ${questionAutoFail[index] ? "text-red-700" : "text-gray-500"}`}>
                            Auto-Fail
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Answer Criteria */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-blue-200">
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-700">What makes a CORRECT answer?</Label>
                        <Input
                          placeholder="e.g., Yes, I am authorized to work in the US"
                          value={questionCriteria[index]?.correctAnswer || ""}
                          onChange={(e) => updateQuestionCriteria(index, "correctAnswer", e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-700">What makes an INCORRECT answer?</Label>
                        <Input
                          placeholder="e.g., No, I am not authorized to work"
                          value={questionCriteria[index]?.incorrectAnswer || ""}
                          onChange={(e) => updateQuestionCriteria(index, "incorrectAnswer", e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    </div>

                    {/* Additional Instructions */}
                  <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-700">Additional instructions for AI (optional)</Label>
                      <Input
                        placeholder="e.g., Look for legal work authorization, accept variations like 'yes', 'I can work legally', etc."
                        value={questionCriteria[index]?.instructions || ""}
                        onChange={(e) => updateQuestionCriteria(index, "instructions", e.target.value)}
                        className="text-sm"
                      />
                    </div>
                      </div>
                    ))}
                  </div>
              
              {/* Auto-fail summary */}
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-yellow-900">Auto-Fail Questions</span>
                  <span className="text-lg font-bold text-yellow-600">
                    {Object.values(questionAutoFail).filter(Boolean).length} of {customQuestions.length}
                  </span>
              </div>
                <p className="text-xs text-yellow-700 mt-1">
                  Questions marked as "Auto-Fail" will immediately reject candidates if answered incorrectly
                </p>
            </div>
            </div>
          ) : (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>No pre-screening questions defined.</strong> Add custom questions in the Job Qualifications step to enable AI text analysis.
              </p>
                  </div>
                )}

          <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-gray-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">How Pre-Screening Questions Work</h4>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>• <strong>AI Processing:</strong> AI analyzes each text answer using your defined criteria and assigns Pass (100%) or Fail (0%)</li>
                  <li>• <strong>Answer Criteria:</strong> Define what constitutes correct vs incorrect answers for each question</li>
                  <li>• <strong>Auto-Fail Questions:</strong> If marked as auto-fail, a wrong answer immediately rejects the candidate</li>
                  <li>• <strong>Standard Questions:</strong> Contribute to overall section score (percentage of questions passed)</li>
                  <li>• <strong>AI Instructions:</strong> Provide additional context to help AI understand variations and edge cases</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Resume Scoring - Always show this section */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-medium text-orange-600">
            <FileText className="w-5 h-5" />
            Resume Scoring
          </CardTitle>
          <p className="text-sm text-gray-500">
            Define items for AI to look for and score each item (must total 100%)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Section Weight */}
            <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Section Weight</Label>
              <span className="text-sm font-semibold text-orange-600">
                {sectionWeights.resume || 0}%
              </span>
                </div>
                <Slider
              value={[sectionWeights.resume || 0]}
              onValueChange={(value) => updateSectionWeight("resume", value)}
                  max={100}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>

          {/* Resume Items */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Items for AI to Look For</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., RBT Certification, Driver's License"
                value={newResumeItem}
                onChange={(e) => setNewResumeItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addResumeItem();
                  }
                }}
                className="text-sm"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addResumeItem}
                disabled={!newResumeItem.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {resumeItems.length > 0 && (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Individual Item Weights</Label>
              <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium transition-all duration-200 ease-in-out ${isValidResumeTotal ? "text-green-600" : "text-red-600"}`}>
                      {resumeItemTotal}%
                    </span>
                    <Progress value={Math.min(resumeItemTotal, 100)} className="w-16 h-2 transition-all duration-200 ease-in-out" />
              </div>
                </div>
                
                {!isValidResumeTotal && (
                  <Alert variant="destructive" className="py-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      Resume item weights must total 100%. Currently at {resumeItemTotal}%
                    </AlertDescription>
                  </Alert>
                )}

                {resumeItems.map((item: string, index: number) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-md space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-orange-600 transition-all duration-200 ease-in-out">
                          {resumeItemScoring[index] || 0}%
                  </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeResumeItem(index)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                </div>
                <Slider
                      value={[resumeItemScoring[index] || 0]}
                      onValueChange={(value) => updateResumeItemScore(index, value)}
                  max={100}
                  min={0}
                  step={1}
                  className="w-full transition-all duration-200 ease-in-out"
                />
              </div>
                ))}
            </div>
            )}
              </div>

          {/* Thresholds */}
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
              <Label className="text-sm text-red-600">Auto Reject Below</Label>
                <div className="text-center">
                <span className="text-lg font-bold text-red-600">
                  {sectionThresholds.resume?.autoReject || 25}%
                  </span>
                </div>
                <Slider
                value={[sectionThresholds.resume?.autoReject || 25]}
                onValueChange={(value) => updateSectionThreshold("resume", "autoReject", value)}
                  max={100}
                min={0}
                  step={1}
                  className="w-full"
                />
              </div>
          <div className="space-y-2">
              <Label className="text-sm text-green-600">Auto Pass Above</Label>
                <div className="text-center">
                <span className="text-lg font-bold text-green-600">
                  {sectionThresholds.resume?.manualReview || 65}%
                  </span>
                </div>
                <Slider
                value={[sectionThresholds.resume?.manualReview || 65]}
                onValueChange={(value) => updateSectionThreshold("resume", "manualReview", value)}
                  max={100}
                min={0}
                  step={1}
                  className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Rules */}
      <Card className="border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-xl font-semibold text-indigo-700">
            <Users className="w-6 h-6" />
            Automated Job Rules
          </CardTitle>
          <p className="text-sm text-gray-600 leading-relaxed">
            Create smart rules that automatically take actions based on how candidates perform across sections. 
            Build your hiring workflow with if-then logic.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Rule Builder */}
          <div className="bg-white border border-indigo-200 rounded-lg p-6 shadow-sm">
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" />
              Create New Rule
            </h4>
            
            {/* Rule Builder - Better Layout */}
            <div className="space-y-4">
              {/* Step 1: Condition */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full text-xs font-bold">1</span>
                    When this condition is met
                  </Label>
                  <div className="bg-gray-50 p-3 rounded-md border">
                    <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
                        <Label className="text-xs text-gray-600">How many sections</Label>
                        <Select 
                          value={newJobRule.sectionCount} 
                          onValueChange={(value) => setNewJobRule({ ...newJobRule, sectionCount: value })}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Choose count" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: availableSectionNames.length }, (_, i) => i + 1).map((count) => (
                              <SelectItem key={count} value={count.toString()}>
                                {count}/{availableSectionNames.length} sections
                              </SelectItem>
                            ))}
                            <SelectItem value="all">All {availableSectionNames.length} sections</SelectItem>
                          </SelectContent>
                        </Select>
            </div>
            <div className="space-y-2">
                        <Label className="text-xs text-gray-600">Have this result</Label>
              <Select 
                          value={newJobRule.status} 
                          onValueChange={(value) => setNewJobRule({ ...newJobRule, status: value })}
              >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Choose result" />
                </SelectTrigger>
                <SelectContent>
                            <SelectItem value="Pass">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                Pass
                              </div>
                            </SelectItem>
                            <SelectItem value="Manual Review">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                Manual Review
                              </div>
                            </SelectItem>
                            <SelectItem value="Fail">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                Fail
                              </div>
                            </SelectItem>
                </SelectContent>
              </Select>
            </div>
                    </div>
                  </div>
                </div>

                {/* Step 2: Action */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full text-xs font-bold">2</span>
                    Then take this action
                  </Label>
                  <div className="bg-gray-50 p-3 rounded-md border">
                    <div className="space-y-3">
            <div className="space-y-2">
                        <Label className="text-xs text-gray-600">Choose action</Label>
              <Select 
                          value={newJobRule.action} 
                          onValueChange={(value) => setNewJobRule({ ...newJobRule, action: value, template: value !== "send-template" ? "" : newJobRule.template })}
              >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="What should happen?" />
                </SelectTrigger>
                <SelectContent>
                            <SelectItem value="schedule-interview">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-blue-500" />
                                Schedule Interview
                              </div>
                            </SelectItem>
                            <SelectItem value="send-template">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-purple-500" />
                                Send Email Template
                              </div>
                            </SelectItem>
                            <SelectItem value="reject-candidate">
                              <div className="flex items-center gap-2">
                                <X className="w-4 h-4 text-red-500" />
                                Reject Candidate
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Template Selection - Only show when needed */}
                      {newJobRule.action === "send-template" && (
                        <div className="space-y-2">
                          <Label className="text-xs text-gray-600">Email template</Label>
                          <Select 
                            value={newJobRule.template} 
                            onValueChange={(value) => setNewJobRule({ ...newJobRule, template: value })}
                          >
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Choose template" />
                            </SelectTrigger>
                            <SelectContent>
                              {ruleTemplates.map((template) => (
                    <SelectItem key={template.value} value={template.value}>
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-3 h-3 text-gray-400" />
                      {template.label}
                                  </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
                        </div>
                      )}
                    </div>
                  </div>
            </div>
          </div>

              {/* Rule Preview */}
              {(newJobRule.sectionCount || newJobRule.status || newJobRule.action) && (
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-md">
                  <Label className="text-xs font-medium text-indigo-700 mb-2 block">Rule Preview</Label>
                  <p className="text-sm text-indigo-900">
                    <strong>If</strong> {newJobRule.sectionCount ? (
                      newJobRule.sectionCount === "all" 
                        ? `all ${availableSectionNames.length} sections` 
                        : `${newJobRule.sectionCount}/${availableSectionNames.length} sections`
                    ) : "..."} {newJobRule.status ? `are ${newJobRule.status.toLowerCase()}` : "..."}, <strong>then</strong> {
                      newJobRule.action ? (
                        newJobRule.action === "schedule-interview" ? "schedule an interview" :
                        newJobRule.action === "send-template" ? `send "${newJobRule.template ? ruleTemplates.find(t => t.value === newJobRule.template)?.label : "..."}" template` :
                        newJobRule.action === "reject-candidate" ? "reject the candidate" : "..."
                      ) : "..."
                    }
                  </p>
                </div>
              )}

              {/* Add Rule Button */}
              <div className="flex justify-end">
                <Button 
                  onClick={addJobRule} 
                  disabled={!newJobRule.sectionCount || !newJobRule.status || !newJobRule.action || (newJobRule.action === "send-template" && !newJobRule.template)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2"
                >
            <Plus className="w-4 h-4 mr-2" />
                  Add This Rule
          </Button>
              </div>
            </div>
          </div>



          {/* Active Rules */}
          {jobRules.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Active Rules ({jobRules.length})
                </h4>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Rules are processed in order
                </div>
              </div>
              
            <div className="space-y-3">
                {jobRules.map((rule: any, index: number) => (
                  <div key={index} className="group relative bg-white border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        {/* Rule Number */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="flex items-center justify-center w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full text-xs font-bold">
                            {index + 1}
                          </span>
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Automation Rule</span>
                        </div>
                        
                        {/* Rule Logic */}
                  <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-600">When</span>
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                              {rule.sectionsCondition || `${rule.sectionCount}/${availableSectionNames.length} sections`}
                            </span>
                            <span className="text-gray-600">are</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              rule.status === 'Pass' ? 'bg-green-100 text-green-800' :
                              rule.status === 'Manual Review' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {rule.status}
                            </span>
                  </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-600">Then</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${
                              rule.action === 'schedule-interview' ? 'bg-blue-100 text-blue-800' :
                              rule.action === 'send-template' ? 'bg-purple-100 text-purple-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {rule.action === 'schedule-interview' && <Calendar className="w-3 h-3" />}
                              {rule.action === 'send-template' && <Mail className="w-3 h-3" />}
                              {rule.action === 'reject-candidate' && <X className="w-3 h-3" />}
                              {rule.action.replace('-', ' ')}
                            </span>
                            {rule.template && (
                              <>
                                <span className="text-gray-400">•</span>
                                <span className="text-xs text-gray-600">
                                  "{ruleTemplates.find(t => t.value === rule.template)?.label}"
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Remove Button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                        onClick={() => removeJobRule(index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                    </div>
                    
                    {/* Rule Flow Visual */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span>Condition Check</span>
                        </div>
                        <ArrowRight className="w-3 h-3 mx-2" />
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${
                            rule.action === 'schedule-interview' ? 'bg-blue-400' :
                            rule.action === 'send-template' ? 'bg-purple-400' :
                            'bg-red-400'
                          }`}></div>
                          <span>Automatic Action</span>
                        </div>
                      </div>
                    </div>
                </div>
              ))}
              </div>
            </div>
          )}

          {/* Smart Examples & Tips */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              Smart Rule Examples
            </h4>
            
            {availableSectionNames.length > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* High Performers */}
                  <div className="bg-white p-3 rounded border border-green-200">
                    <div className="font-medium text-green-800 mb-2 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Auto-Interview
            </div>
                    <p className="text-gray-600 mb-1">
                      <strong>All {availableSectionNames.length} sections Pass</strong> → Schedule Interview
                    </p>
                    <p className="text-green-700 text-xs">Perfect candidates get instant interviews</p>
                  </div>

                  {/* Strong Candidates */}
                  <div className="bg-white p-3 rounded border border-blue-200">
                    <div className="font-medium text-blue-800 mb-2 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      Phone Screen
                    </div>
                    <p className="text-gray-600 mb-1">
                      <strong>{Math.max(2, availableSectionNames.length - 1)}/{availableSectionNames.length} sections Pass</strong> → Send Phone Screen Template
                    </p>
                    <p className="text-blue-700 text-xs">Strong candidates get phone screening</p>
                  </div>

                  {/* Need More Info */}
                  <div className="bg-white p-3 rounded border border-yellow-200">
                    <div className="font-medium text-yellow-800 mb-2 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      Additional Info
                    </div>
                    <p className="text-gray-600 mb-1">
                      <strong>1/{availableSectionNames.length} sections Manual Review</strong> → Send Additional Questions
                    </p>
                    <p className="text-yellow-700 text-xs">Get more details before deciding</p>
                  </div>

                  {/* Auto Reject */}
                  <div className="bg-white p-3 rounded border border-red-200">
                    <div className="font-medium text-red-800 mb-2 flex items-center gap-1">
                      <X className="w-3 h-3" />
                      Auto-Reject
                    </div>
                    <p className="text-gray-600 mb-1">
                      <strong>2/{availableSectionNames.length} sections Fail</strong> → Reject Candidate
                    </p>
                    <p className="text-red-700 text-xs">Multiple failures = automatic rejection</p>
                  </div>
                </div>

                <div className="bg-indigo-50 p-3 rounded border border-indigo-200">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-indigo-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-indigo-800 mb-1">Available Sections for Rules</p>
                      <div className="flex flex-wrap gap-1">
                        {availableSectionNames.map(name => (
                          <span key={name} className="bg-white text-indigo-700 px-2 py-1 rounded text-xs border border-indigo-200">
                            {name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Add job requirements to enable automation rules</p>
                <p className="text-xs text-gray-500">
                  Go to the Job Qualifications step to add required qualifications, preferred qualifications, or custom questions
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Information Box - Dynamic based on available sections */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-gray-500 mt-0.5" />
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">
              {availableSectionNames.length > 0 ? 'Active Scoring System' : 'Scoring System Setup'}
            </h4>
            <ul className="text-xs text-gray-700 space-y-1">
              {availableSectionNames.length > 0 ? (
                <>
                  <li>• <strong>{availableSectionNames.length} sections</strong> are configured for scoring</li>
                  <li>• Each section has a weight that contributes to the overall candidate score</li>
                  <li>• Within each section, define Auto Reject and Auto Pass thresholds</li>
                  <li>• Candidates between thresholds require Manual Review</li>
                  <li>• Job Rules determine final actions based on section performance combinations</li>
                  {availableSections.preScreeningQuestions && (
                    <li>• AI processes text answers from pre-screening questions</li>
                  )}
                  <li>• AI analyzes resume content for specified items</li>
                </>
              ) : (
                <>
                  <li>• Add <strong>Required Qualifications</strong> in the Job Qualifications step</li>
                  <li>• Add <strong>Preferred Qualifications</strong> to enable custom scoring</li>
                  <li>• Add <strong>Custom Questions</strong> for AI text analysis</li>
                  <li>• <strong>Resume Scoring</strong> is always available</li>
                  <li>• Return here after adding content to configure scoring</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}