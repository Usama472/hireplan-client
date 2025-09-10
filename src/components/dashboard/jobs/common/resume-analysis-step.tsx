"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
} from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";

export function ResumeAnalysisStep() {
  const { watch, setValue } = useFormContext();
  const { subscription } = useAuthSessionContext();
  const [newCriterion, setNewCriterion] = useState("");
  
  // Check if user has AI features (Professional/Enterprise)
  const hasAIFeatures = subscription?.planId === 'professional' || subscription?.planId === 'enterprise';
  
  // Resume analysis criteria
  const resumeCriteria = watch("resumeCriteria") || [];
  const resumeAnalysisMode = watch("resumeAnalysisMode") || "simple";
  
  // AI Weighting Controls
  const [resumeWeight, setResumeWeight] = useState([30]); // 30% weight for resume analysis

  const addCriterion = () => {
    if (newCriterion.trim()) {
      const newCrit = {
        text: newCriterion.trim(),
        type: 'skill', // Default type
        aiCategory: hasAIFeatures ? 'should' : undefined,
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
      aiCategory: hasAIFeatures ? 'should' : undefined,
      weight: 1,
    };
    setValue("resumeCriteria", [...resumeCriteria, newCrit]);
  };

  const getTypeInfo = (type: string) => {
    const types = {
      skill: { label: "Skill", icon: Target, color: "bg-blue-100 text-blue-700" },
      experience: { label: "Experience", icon: Briefcase, color: "bg-green-100 text-green-700" },
      education: { label: "Education", icon: Award, color: "bg-purple-100 text-purple-700" },
      certification: { label: "Certification", icon: Award, color: "bg-orange-100 text-orange-700" },
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
            AI-powered resume analysis is available with Professional and Enterprise plans.
          </p>
        </div>

        <Card className="border border-blue-200 bg-blue-50/30">
          <CardContent className="p-8 text-center">
            <Brain className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              AI Resume Analysis
            </h3>
            <p className="text-sm text-blue-700 mb-6 max-w-md mx-auto">
              Automatically analyze candidate resumes for skills, experience, and qualifications. 
              Set criteria and let AI score candidates based on their background.
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
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Resume Analysis
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Choose how AI should analyze candidate resumes for this position.
        </p>
      </div>

      {/* Mode Selection */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-medium text-blue-600">
            <Brain className="w-5 h-5" />
            Analysis Mode
          </CardTitle>
          <p className="text-sm text-gray-500">
            Select how detailed you want the resume analysis to be.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Simple Mode */}
            <div 
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                resumeAnalysisMode === 'simple' 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => {
                setValue("resumeAnalysisMode", "simple");
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${
                  resumeAnalysisMode === 'simple' ? 'bg-blue-500' : 'bg-gray-400'
                }`}>
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Simple Analysis</h3>
                  <p className="text-xs text-gray-600">AI decides automatically</p>
                </div>
              </div>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• AI analyzes based on job title and description</li>
                <li>• Automatically identifies relevant skills</li>
                <li>• Contextual matching of experience</li>
                <li>• No manual configuration needed</li>
              </ul>
            </div>

            {/* Detailed Mode */}
            <div 
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                resumeAnalysisMode === 'detailed' 
                  ? 'border-purple-500 bg-purple-50 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => {
                setValue("resumeAnalysisMode", "detailed");
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${
                  resumeAnalysisMode === 'detailed' ? 'bg-purple-500' : 'bg-gray-400'
                }`}>
                  <Target className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Detailed Analysis</h3>
                  <p className="text-xs text-gray-600">Define specific criteria</p>
                </div>
              </div>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Manually define skills and experience</li>
                <li>• Set custom scoring weights</li>
                <li>• Precise control over evaluation</li>
                <li>• Advanced AI configuration</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Simple Mode Content */}
      {resumeAnalysisMode === 'simple' && (
        <Card className="border border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-medium text-blue-600">
              🤖 AI Contextual Analysis
            </CardTitle>
            <p className="text-sm text-gray-600">
              AI will automatically analyze resumes based on your job description and requirements.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-white border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">What AI Will Look For:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Relevant Skills:</strong> Technical and soft skills matching the job requirements</li>
                <li>• <strong>Experience Level:</strong> Years of experience in similar roles or industries</li>
                <li>• <strong>Education Background:</strong> Degrees and certifications relevant to the position</li>
                <li>• <strong>Career Progression:</strong> Growth and advancement in previous roles</li>
                <li>• <strong>Industry Experience:</strong> Work history in related fields or companies</li>
              </ul>
            </div>
            
            {/* Simple Mode Scoring */}
            <div className="p-4 bg-blue-100 border border-blue-300 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-blue-600" />
                <Label className="text-sm font-medium text-blue-900">AI Scoring Weight</Label>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-800">Resume Analysis Impact</span>
                  <span className="font-medium text-blue-900">{resumeWeight[0]}%</span>
                </div>
                <Slider
                  value={resumeWeight}
                  onValueChange={setResumeWeight}
                  max={50}
                  min={10}
                  step={5}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-blue-600">
                  <span>10% (Minimal Impact)</span>
                  <span>50% (High Impact)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Mode Content */}
      {resumeAnalysisMode === 'detailed' && (
        <>
          <Card className="border border-purple-200 bg-purple-50/30">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-medium text-purple-600">
                <Target className="w-5 h-5" />
                Custom Resume Criteria
              </CardTitle>
              <p className="text-sm text-gray-600">
                Define specific skills, experience, and qualifications to look for in resumes.
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
                <Label className="text-sm text-gray-600">Quick Add Templates</Label>
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
                  <Label className="text-sm text-gray-600">Current Criteria</Label>
                  {resumeCriteria.map((criterion: any, index: number) => {
                    const typeInfo = getTypeInfo(criterion.type);
                    return (
                      <div key={index} className="p-3 bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <typeInfo.icon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-900">{criterion.text}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${typeInfo.color}`}>
                              {typeInfo.label}
                            </span>
                          </div>
                          
                          {/* Controls */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Type Selector */}
                            <Select
                              value={criterion.type || 'skill'}
                              onValueChange={(value) => updateCriterionType(index, value)}
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
                                <SelectItem value="experience" className="text-xs">
                                  <div className="flex items-center gap-2">
                                    <Briefcase className="w-3 h-3" />
                                    Experience
                                  </div>
                                </SelectItem>
                                <SelectItem value="education" className="text-xs">
                                  <div className="flex items-center gap-2">
                                    <Award className="w-3 h-3" />
                                    Education
                                  </div>
                                </SelectItem>
                                <SelectItem value="certification" className="text-xs">
                                  <div className="flex items-center gap-2">
                                    <Award className="w-3 h-3" />
                                    Certification
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>

                            {/* AI Category Dropdown */}
                            <Select
                              value={criterion.aiCategory || 'should'}
                              onValueChange={(value) => updateCriterionCategory(index, value)}
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
                  No resume criteria added yet. Add criteria above to analyze candidate resumes.
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
                      {resumeCriteria.filter((c: any) => c.aiCategory === 'need').length}
                    </div>
                    <div className="text-xs font-medium text-red-700/80">Need</div>
                  </div>
                  
                  <div className="text-center p-3 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 rounded-xl">
                    <div className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      {resumeCriteria.filter((c: any) => c.aiCategory === 'should').length}
                    </div>
                    <div className="text-xs font-medium text-amber-700/80">Should Have</div>
                  </div>
                  
                  <div className="text-center p-3 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/50 rounded-xl">
                    <div className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      {resumeCriteria.filter((c: any) => c.aiCategory === 'nice').length}
                    </div>
                    <div className="text-xs font-medium text-emerald-700/80">Nice to Have</div>
                  </div>
                </div>

                {/* Resume Weight Slider */}
                <div className="p-4 bg-white border rounded-lg">
                  <Label className="text-sm font-medium mb-3 block">Resume Analysis Weight</Label>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-800">Impact on Overall Score</span>
                      <span className="font-medium text-purple-900">{resumeWeight[0]}%</span>
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

      {/* Information Box */}
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-md">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-purple-500 mt-0.5" />
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-purple-900">
              How Resume Analysis Works
            </h4>
            <ul className="text-xs text-purple-700 space-y-1">
              <li>• <strong>Simple Mode:</strong> AI automatically determines what to look for based on job context</li>
              <li>• <strong>Detailed Mode:</strong> You define specific criteria and weights for precise control</li>
              <li>• <strong>Contextual Matching:</strong> AI understands synonyms and related terms</li>
              <li>• <strong>Experience Analysis:</strong> Evaluates relevant work history and project experience</li>
              <li>• <strong>Combined Scoring:</strong> Resume analysis combines with qualifications and pre-screening</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}