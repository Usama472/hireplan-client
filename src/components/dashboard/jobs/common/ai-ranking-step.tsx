"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Brain,
  Plus,
  X,
  Target,
  Settings,
  MessageSquare,
  FileText,
  GraduationCap,
  AlertTriangle,
  Info,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

export function AIRankingStep() {
  const { watch, setValue } = useFormContext();
  const [newCustomRule, setNewCustomRule] = useState({ condition: "", action: "", template: "" });
  const [selectedTemplate, setSelectedTemplate] = useState("");
  
  const automation = watch("automation") || {};
  const acceptanceThreshold = automation.acceptanceThreshold || 76;
  const manualReviewThreshold = automation.manualReviewThreshold || 41;
  const autoRejectThreshold = automation.autoRejectThreshold || 40;
  const aiRankingCategories = automation.aiRankingCategories || [];
  const customRules = automation.customRules || [];
  const templateId = automation.templateId || "";

  // Default AI ranking categories
  const defaultCategories = [
    {
      name: "Skills Match",
      weight: 25,
      dataSource: { qualifications: true, screeningQuestions: true, resume: true },
      customQuestions: [],
    },
    {
      name: "Experience Relevance", 
      weight: 25,
      dataSource: { qualifications: false, screeningQuestions: false, resume: true },
      customQuestions: [],
    },
    {
      name: "Education Qualifications",
      weight: 25,
      dataSource: { qualifications: true, screeningQuestions: true, resume: true },
      customQuestions: [],
    },
    {
      name: "Cultural & Job Fit",
      weight: 25,
      dataSource: { qualifications: false, screeningQuestions: true, resume: false },
      customQuestions: [],
    },
  ];

  const categories = aiRankingCategories.length > 0 ? aiRankingCategories : defaultCategories;
  const totalWeight = categories.reduce((sum: number, cat: any) => sum + (cat.weight || 0), 0);
  const isValidWeight = totalWeight <= 100;

  const aiTemplates = [
    { value: "technical-role", label: "Technical Role (Software, Engineering)" },
    { value: "sales-role", label: "Sales & Business Development" },
    { value: "marketing-role", label: "Marketing & Communications" },
    { value: "healthcare-role", label: "Healthcare & Medical" },
    { value: "customer-service", label: "Customer Service & Support" },
    { value: "management-role", label: "Management & Leadership" },
    { value: "administrative", label: "Administrative & Operations" },
    { value: "education-role", label: "Education & Training" },
    { value: "custom", label: "Custom Setup" },
  ];

  const emailTemplates = [
    { value: "rejection-1", label: "Standard Rejection Email" },
    { value: "rejection-2", label: "Polite Rejection with Feedback" },
    { value: "interview-1", label: "Standard Interview Invitation" },
    { value: "interview-2", label: "Phone Screen Invitation" },
    { value: "questions-1", label: "Additional Questions Request" },
  ];

  const updateCategoryWeight = (index: number, weight: number[]) => {
    const updated = [...categories];
    updated[index] = { ...updated[index], weight: weight[0] };
    setValue("automation.aiRankingCategories", updated);
  };

  const updateDataSource = (index: number, source: string, checked: boolean) => {
    const updated = [...categories];
    updated[index] = {
      ...updated[index],
      dataSource: { ...updated[index].dataSource, [source]: checked }
    };
    setValue("automation.aiRankingCategories", updated);
  };

  const addCustomQuestion = (categoryIndex: number, question: string) => {
    if (!question.trim()) return;
    const updated = [...categories];
    const currentQuestions = updated[categoryIndex].customQuestions || [];
    if (currentQuestions.length >= 5) return; // Max 5 per category
    
    updated[categoryIndex] = {
      ...updated[categoryIndex],
      customQuestions: [...currentQuestions, question.trim()]
    };
    setValue("automation.aiRankingCategories", updated);
  };

  const removeCustomQuestion = (categoryIndex: number, questionIndex: number) => {
    const updated = [...categories];
    updated[categoryIndex] = {
      ...updated[categoryIndex],
      customQuestions: updated[categoryIndex].customQuestions.filter((_: any, i: number) => i !== questionIndex)
    };
    setValue("automation.aiRankingCategories", updated);
  };

  const updateThresholds = (type: string, value: number[]) => {
    setValue(`automation.${type}`, value[0]);
  };

  const addCustomRule = () => {
    if (newCustomRule.condition && newCustomRule.action && newCustomRule.template) {
      setValue("automation.customRules", [...customRules, { ...newCustomRule }]);
      setNewCustomRule({ condition: "", action: "", template: "" });
    }
  };

  const removeCustomRule = (index: number) => {
    setValue("automation.customRules", customRules.filter((_: any, i: number) => i !== index));
  };

  const loadTemplate = () => {
    if (!selectedTemplate) return;
    
    // Template presets based on role type
    const templateData = {
      "technical-role": {
        categories: [
          { name: "Skills Match", weight: 45, dataSource: { qualifications: true, screeningQuestions: true, resume: true } },
          { name: "Experience Relevance", weight: 35, dataSource: { qualifications: false, screeningQuestions: false, resume: true } },
          { name: "Education Qualifications", weight: 10, dataSource: { qualifications: true, screeningQuestions: true, resume: true } },
          { name: "Cultural & Job Fit", weight: 10, dataSource: { qualifications: false, screeningQuestions: true, resume: false } },
        ],
        thresholds: { acceptance: 80, manualReview: 60, autoReject: 59 }
      },
      "sales-role": {
        categories: [
          { name: "Skills Match", weight: 25, dataSource: { qualifications: true, screeningQuestions: true, resume: true } },
          { name: "Experience Relevance", weight: 45, dataSource: { qualifications: false, screeningQuestions: false, resume: true } },
          { name: "Education Qualifications", weight: 5, dataSource: { qualifications: true, screeningQuestions: true, resume: true } },
          { name: "Cultural & Job Fit", weight: 25, dataSource: { qualifications: false, screeningQuestions: true, resume: false } },
        ],
        thresholds: { acceptance: 75, manualReview: 50, autoReject: 49 }
      },
      // Add more templates as needed
    };

    const template = templateData[selectedTemplate as keyof typeof templateData];
    if (template) {
      setValue("automation.aiRankingCategories", template.categories);
      setValue("automation.acceptanceThreshold", template.thresholds.acceptance);
      setValue("automation.manualReviewThreshold", template.thresholds.manualReview);
      setValue("automation.autoRejectThreshold", template.thresholds.autoReject);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          AI Ranking & Custom Rules
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Configure advanced AI scoring with templates, custom questions, and acceptance thresholds
        </p>
      </div>

      {/* Template Selection */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-medium text-blue-600">
            <Brain className="w-5 h-5" />
            AI Template Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Choose AI Template</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template for your role type" />
                </SelectTrigger>
                <SelectContent>
                  {aiTemplates.map((template) => (
                    <SelectItem key={template.value} value={template.value}>
                      {template.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={loadTemplate} 
                disabled={!selectedTemplate}
                className="w-full"
              >
                <Zap className="w-4 h-4 mr-2" />
                Load Template
              </Button>
            </div>
          </div>
          
          {templateId && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Current Template:</strong> {aiTemplates.find(t => t.value === templateId)?.label || "Custom"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Ranking Categories */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-medium text-purple-600">
            <Target className="w-5 h-5" />
            AI Ranking Categories
          </CardTitle>
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-gray-500">Configure scoring weights and data sources</p>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${isValidWeight ? "text-green-600" : "text-red-600"}`}>
                {totalWeight}%
              </span>
              <Progress value={Math.min(totalWeight, 100)} className="w-20 h-2" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isValidWeight && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Total weight cannot exceed 100%. Currently at {totalWeight}%
              </AlertDescription>
            </Alert>
          )}

          {categories.map((category: any, index: number) => (
            <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-md space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-medium text-gray-900">{category.name}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-purple-600">
                    {category.weight || 0}%
                  </span>
                </div>
              </div>

              {/* Weight Slider */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">Weight</Label>
                <Slider
                  value={[category.weight || 0]}
                  onValueChange={(value) => updateCategoryWeight(index, value)}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* Data Sources */}
              <div className="space-y-3">
                <Label className="text-sm text-gray-600">Data Sources (AI will gather data from checked sources)</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`${index}-qualifications`}
                      checked={category.dataSource?.qualifications || false}
                      onCheckedChange={(checked) => updateDataSource(index, "qualifications", checked as boolean)}
                    />
                    <Label htmlFor={`${index}-qualifications`} className="text-sm flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" />
                      Job Qualifications
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`${index}-screening`}
                      checked={category.dataSource?.screeningQuestions || false}
                      onCheckedChange={(checked) => updateDataSource(index, "screeningQuestions", checked as boolean)}
                    />
                    <Label htmlFor={`${index}-screening`} className="text-sm flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      Screening Questions
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`${index}-resume`}
                      checked={category.dataSource?.resume || false}
                      onCheckedChange={(checked) => updateDataSource(index, "resume", checked as boolean)}
                    />
                    <Label htmlFor={`${index}-resume`} className="text-sm flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      Resume
                    </Label>
                  </div>
                </div>
              </div>

              {/* Custom Questions (up to 5 per category) */}
              <div className="space-y-3">
                <Label className="text-sm text-gray-600">
                  Custom Questions for {category.name} ({(category.customQuestions || []).length}/5)
                </Label>
                
                <CustomQuestionInput 
                  categoryIndex={index}
                  onAdd={addCustomQuestion}
                  maxReached={(category.customQuestions || []).length >= 5}
                />

                {category.customQuestions && category.customQuestions.length > 0 && (
                  <div className="space-y-2">
                    {category.customQuestions.map((question: string, qIndex: number) => (
                      <div key={qIndex} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded text-sm">
                        <span>{question}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCustomQuestion(index, qIndex)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Acceptance Thresholds */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-medium text-green-600">
            <Settings className="w-5 h-5" />
            Acceptance Thresholds
          </CardTitle>
          <p className="text-sm text-gray-500">
            Configure three-tier system: Auto Reject, Manual Review, Auto Schedule
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Auto Reject */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <Label className="text-sm font-medium">Auto Reject</Label>
              </div>
              <div className="space-y-2">
                <div className="text-center">
                  <span className="text-2xl font-bold text-red-600">0-{autoRejectThreshold}%</span>
                </div>
                <Slider
                  value={[autoRejectThreshold]}
                  onValueChange={(value) => updateThresholds("autoRejectThreshold", value)}
                  max={100}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-gray-600 text-center">
                  Candidates scoring {autoRejectThreshold}% or below will be automatically rejected
                </p>
              </div>
            </div>

            {/* Manual Review */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <Label className="text-sm font-medium">Manual Review</Label>
              </div>
              <div className="space-y-2">
                <div className="text-center">
                  <span className="text-2xl font-bold text-yellow-600">
                    {autoRejectThreshold + 1}-{manualReviewThreshold}%
                  </span>
                </div>
                <Slider
                  value={[manualReviewThreshold]}
                  onValueChange={(value) => updateThresholds("manualReviewThreshold", value)}
                  max={100}
                  min={autoRejectThreshold + 1}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-gray-600 text-center">
                  Candidates in this range require manual review
                </p>
              </div>
            </div>

            {/* Auto Schedule */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <Label className="text-sm font-medium">Auto Schedule</Label>
              </div>
              <div className="space-y-2">
                <div className="text-center">
                  <span className="text-2xl font-bold text-green-600">
                    {manualReviewThreshold + 1}-100%
                  </span>
                </div>
                <Slider
                  value={[acceptanceThreshold]}
                  onValueChange={(value) => updateThresholds("acceptanceThreshold", value)}
                  max={100}
                  min={manualReviewThreshold + 1}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-gray-600 text-center">
                  Candidates scoring {acceptanceThreshold}% or higher will be auto-scheduled
                </p>
              </div>
            </div>
          </div>

          {/* Threshold Visualization */}
          <div className="space-y-2">
            <Label className="text-sm text-gray-600">Threshold Visualization</Label>
            <div className="relative w-full h-8 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-md">
              <div 
                className="absolute top-0 h-full w-px bg-white" 
                style={{ left: `${autoRejectThreshold}%` }}
              />
              <div 
                className="absolute top-0 h-full w-px bg-white" 
                style={{ left: `${manualReviewThreshold}%` }}
              />
              <div className="absolute -bottom-6 left-0 text-xs text-gray-600">0%</div>
              <div 
                className="absolute -bottom-6 text-xs text-gray-600" 
                style={{ left: `${autoRejectThreshold}%`, transform: 'translateX(-50%)' }}
              >
                {autoRejectThreshold}%
              </div>
              <div 
                className="absolute -bottom-6 text-xs text-gray-600" 
                style={{ left: `${manualReviewThreshold}%`, transform: 'translateX(-50%)' }}
              >
                {manualReviewThreshold}%
              </div>
              <div className="absolute -bottom-6 right-0 text-xs text-gray-600">100%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Rules */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-medium text-orange-600">
            <Settings className="w-5 h-5" />
            Custom Rules & Templates
          </CardTitle>
          <p className="text-sm text-gray-500">
            Define custom actions based on score ranges
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Rule */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label className="text-sm">Condition</Label>
              <Input
                placeholder="e.g., Score 41-75%"
                value={newCustomRule.condition}
                onChange={(e) => setNewCustomRule({ ...newCustomRule, condition: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Action</Label>
              <Select 
                value={newCustomRule.action} 
                onValueChange={(value) => setNewCustomRule({ ...newCustomRule, action: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="send-questions">Send Additional Questions</SelectItem>
                  <SelectItem value="schedule-phone">Schedule Phone Screen</SelectItem>
                  <SelectItem value="auto-reject">Auto Reject</SelectItem>
                  <SelectItem value="manual-review">Manual Review</SelectItem>
                  <SelectItem value="auto-schedule">Auto Schedule Interview</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Email Template</Label>
              <Select 
                value={newCustomRule.template} 
                onValueChange={(value) => setNewCustomRule({ ...newCustomRule, template: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {emailTemplates.map((template) => (
                    <SelectItem key={template.value} value={template.value}>
                      {template.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={addCustomRule} disabled={!newCustomRule.condition || !newCustomRule.action || !newCustomRule.template}>
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Rule
          </Button>

          {/* Existing Rules */}
          {customRules.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm text-gray-600">Current Custom Rules</Label>
              {customRules.map((rule: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-md">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-orange-900">
                      {rule.condition} → {rule.action}
                    </p>
                    <p className="text-xs text-orange-700">
                      Email Template: {emailTemplates.find(t => t.value === rule.template)?.label}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCustomRule(index)}
                    className="text-orange-400 hover:text-orange-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Rule Examples */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Example Rules</h4>
            <div className="space-y-1 text-xs text-gray-600">
              <p>• <strong>Score 41-75%:</strong> Send Additional Questions → Use "Questions Request" template</p>
              <p>• <strong>Score 76-85%:</strong> Schedule Phone Screen → Use "Phone Interview" template</p>
              <p>• <strong>Score 86-100%:</strong> Auto Schedule Interview → Use "Interview Invitation" template</p>
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
              AI Ranking System Overview
            </h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• <strong>Templates:</strong> Pre-configured settings for different role types</li>
              <li>• <strong>Categories:</strong> Up to 5 custom questions per category for company-specific criteria</li>
              <li>• <strong>Data Sources:</strong> AI gathers data from selected sources (qualifications, screening, resume)</li>
              <li>• <strong>Three-tier system:</strong> Automatically sort candidates into reject, review, or schedule buckets</li>
              <li>• <strong>Custom rules:</strong> Define specific actions and email templates for score ranges</li>
              <li>• <strong>Cost savings:</strong> Auto-rejection prevents unnecessary AI processing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for custom question input
function CustomQuestionInput({ 
  categoryIndex, 
  onAdd, 
  maxReached 
}: { 
  categoryIndex: number; 
  onAdd: (categoryIndex: number, question: string) => void; 
  maxReached: boolean;
}) {
  const [question, setQuestion] = useState("");

  const handleAdd = () => {
    if (question.trim()) {
      onAdd(categoryIndex, question);
      setQuestion("");
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        placeholder={maxReached ? "Maximum 5 questions reached" : "e.g., Rate communication skills 1-10"}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleAdd();
          }
        }}
        disabled={maxReached}
        className="text-sm"
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={handleAdd}
        disabled={!question.trim() || maxReached}
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}