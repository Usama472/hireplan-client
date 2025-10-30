"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";

import {
  CheckCircle,
  FileText,
  MessageSquare,
  Info,
  Brain,
  Star,
  Settings,
  RotateCcw,
} from "lucide-react";
import { useFormContext } from "react-hook-form";
import { useState, useEffect, useCallback } from "react";

export function AIOverviewStep() {
  const { watch, setValue } = useFormContext();
  const { subscription } = useAuthSessionContext();

  // Add smooth slider styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .slider-smooth [data-radix-slider-track] {
        transition: all 0.2s ease-out;
      }
      .slider-smooth [data-radix-slider-thumb] {
        transition: all 0.15s ease-out;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }
      .slider-smooth [data-radix-slider-thumb]:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }
      .slider-smooth [data-radix-slider-thumb]:active {
        transform: scale(1.05);
      }
      .slider-smooth [data-radix-slider-range] {
        transition: all 0.2s ease-out;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Check subscription for AI features (plan-based with custom pricing)
  const hasAIFeatures =
    subscription?.planId === "professional" ||
    subscription?.planId === "enterprise";

  // Weight adjustment state
  const [showWeightEditor, setShowWeightEditor] = useState(false);
  const [qualificationsWeight, setQualificationsWeight] = useState([40]);
  const [resumeWeight, setResumeWeight] = useState([30]);
  const [questionsWeight, setQuestionsWeight] = useState([30]);

  // Get data from all sections
  const qualifications = watch("qualifications") || [];
  const customQuestions = watch("customQuestions") || [];
  const resumeAnalysisMode = watch("resumeAnalysisMode") || "simple";
  const resumeCriteria = watch("resumeCriteria") || [];
  const automation = watch("automation") || {};

  // Check which sections are available
  const hasQualifications = qualifications.length > 0;
  const hasCustomQuestions = customQuestions.length > 0;
  const availableSections = [
    hasQualifications && 'qualifications',
    'resume', // Resume analysis is always available
    hasCustomQuestions && 'customQuestions'
  ].filter(Boolean);

  // Load existing weights from automation configuration
  useEffect(() => {
    const sectionWeights = automation?.sectionWeights || {};
    
    // Calculate default weights based on available sections
    const numSections = availableSections.length;
    
    // Set weights based on available sections
    if (availableSections.length === 1) {
      // Only resume analysis
      setQualificationsWeight([0]);
      setResumeWeight([100]);
      setQuestionsWeight([0]);
    } else if (availableSections.length === 2) {
      if (hasQualifications && hasCustomQuestions) {
        // Qualifications + Questions (no resume criteria)
        setQualificationsWeight([sectionWeights.qualifications || 50]);
        setResumeWeight([sectionWeights.resume || 0]);
        setQuestionsWeight([sectionWeights.customQuestions || 50]);
      } else if (hasQualifications) {
        // Qualifications + Resume
        setQualificationsWeight([sectionWeights.qualifications || 60]);
        setResumeWeight([sectionWeights.resume || 40]);
        setQuestionsWeight([sectionWeights.customQuestions || 0]);
      } else {
        // Resume + Questions
        setQualificationsWeight([sectionWeights.qualifications || 0]);
        setResumeWeight([sectionWeights.resume || 60]);
        setQuestionsWeight([sectionWeights.customQuestions || 40]);
      }
    } else {
      // All three sections available
      setQualificationsWeight([sectionWeights.qualifications || 40]);
      setResumeWeight([sectionWeights.resume || 30]);
      setQuestionsWeight([sectionWeights.customQuestions || 30]);
    }
  }, [automation, hasQualifications, hasCustomQuestions, availableSections.length]);

  // Smooth auto-balance weights with debouncing
  const balanceWeights = useCallback((changedSection: string, newValue: number) => {
    const remaining = 100 - newValue;
    const activeSections = availableSections.filter(section => section !== changedSection);
    
    if (activeSections.length === 0) return; // Only one section available
    
    // Use requestAnimationFrame for smoother updates
    requestAnimationFrame(() => {
      if (activeSections.length === 1) {
        // Only one other section to balance with
        const otherSection = activeSections[0];
        if (otherSection === 'qualifications') {
          setQualificationsWeight([remaining]);
        } else if (otherSection === 'resume') {
          setResumeWeight([remaining]);
        } else if (otherSection === 'customQuestions') {
          setQuestionsWeight([remaining]);
        }
      } else {
        // Two other sections to balance between
        const currentQual = changedSection === 'qualifications' ? newValue : qualificationsWeight[0];
        const currentResume = changedSection === 'resume' ? newValue : resumeWeight[0];
        const currentQuestions = changedSection === 'questions' ? newValue : questionsWeight[0];
        
        if (changedSection === 'qualifications') {
          if (hasCustomQuestions) {
            const total = currentResume + currentQuestions;
            if (total > 0) {
              const resumeRatio = currentResume / total;
              const newResumeWeight = Math.round(remaining * resumeRatio);
              const newQuestionsWeight = remaining - newResumeWeight;
              setResumeWeight([Math.max(5, newResumeWeight)]);
              setQuestionsWeight([Math.max(5, newQuestionsWeight)]);
            } else {
              setResumeWeight([Math.round(remaining / 2)]);
              setQuestionsWeight([remaining - Math.round(remaining / 2)]);
            }
          } else {
            setResumeWeight([remaining]);
          }
        } else if (changedSection === 'resume') {
          if (hasQualifications && hasCustomQuestions) {
            const total = currentQual + currentQuestions;
            if (total > 0) {
              const qualRatio = currentQual / total;
              const newQualWeight = Math.round(remaining * qualRatio);
              const newQuestionsWeight = remaining - newQualWeight;
              setQualificationsWeight([Math.max(5, newQualWeight)]);
              setQuestionsWeight([Math.max(5, newQuestionsWeight)]);
            } else {
              setQualificationsWeight([Math.round(remaining / 2)]);
              setQuestionsWeight([remaining - Math.round(remaining / 2)]);
            }
          } else if (hasQualifications) {
            setQualificationsWeight([remaining]);
          } else {
            setQuestionsWeight([remaining]);
          }
        } else if (changedSection === 'questions') {
          if (hasQualifications) {
            const total = currentQual + currentResume;
            if (total > 0) {
              const qualRatio = currentQual / total;
              const newQualWeight = Math.round(remaining * qualRatio);
              const newResumeWeight = remaining - newQualWeight;
              setQualificationsWeight([Math.max(5, newQualWeight)]);
              setResumeWeight([Math.max(5, newResumeWeight)]);
            } else {
              setQualificationsWeight([Math.round(remaining / 2)]);
              setResumeWeight([remaining - Math.round(remaining / 2)]);
            }
          } else {
            setResumeWeight([remaining]);
          }
        }
      }
    });
  }, [availableSections, hasQualifications, hasCustomQuestions, qualificationsWeight, resumeWeight, questionsWeight]);

  // Save weights to form
  const saveWeights = () => {
    setValue("automation", {
      ...automation,
      sectionWeights: {
        qualifications: qualificationsWeight[0],
        resume: resumeWeight[0],
        customQuestions: questionsWeight[0],
      }
    });
    setShowWeightEditor(false);
  };

  // Reset to default weights based on available sections
  const resetWeights = () => {
    if (availableSections.length === 1) {
      // Only resume analysis
      setQualificationsWeight([0]);
      setResumeWeight([100]);
      setQuestionsWeight([0]);
    } else if (availableSections.length === 2) {
      if (hasQualifications && hasCustomQuestions) {
        setQualificationsWeight([50]);
        setResumeWeight([0]);
        setQuestionsWeight([50]);
      } else if (hasQualifications) {
        setQualificationsWeight([60]);
        setResumeWeight([40]);
        setQuestionsWeight([0]);
      } else {
        setQualificationsWeight([0]);
        setResumeWeight([60]);
        setQuestionsWeight([40]);
      }
    } else {
      // All three sections available
      setQualificationsWeight([40]);
      setResumeWeight([30]);
      setQuestionsWeight([30]);
    }
  };

  // Calculate statistics
  const qualStats = {
    total: qualifications.length,
    required: qualifications.filter((q: any) => q.isRequired).length,
    preferred: qualifications.filter((q: any) => !q.isRequired).length,
    need: qualifications.filter((q: any) => q.aiCategory === "need").length,
    should: qualifications.filter((q: any) => q.aiCategory === "should").length,
    nice: qualifications.filter((q: any) => q.aiCategory === "nice").length,
  };

  const questionStats = {
    total: customQuestions.length,
    required: customQuestions.filter((q: any) => q.required).length,
    autoReject: customQuestions.filter((q: any) => q.autoReject).length,
    simpleMode: customQuestions.filter((q: any) => q.scoringMode === "simple")
      .length,
    advancedMode: customQuestions.filter(
      (q: any) => q.scoringMode === "advanced"
    ).length,
    withWeights: customQuestions.filter(
      (q: any) => q.scoringMode === "advanced" && q.weight
    ).length,
  };

  const resumeStats = {
    mode: resumeAnalysisMode,
    criteriaCount: resumeCriteria.length,
    skillsCriteria: resumeCriteria.filter((c: any) => c.type === "skill")
      .length,
    experienceCriteria: resumeCriteria.filter(
      (c: any) => c.type === "experience"
    ).length,
  };

  if (!hasAIFeatures) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">AI Overview</h2>
          <p className="text-sm text-gray-600 mt-1">
            AI-powered candidate evaluation is available with Professional and
            Enterprise plans.
          </p>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Upgrade to Professional to enable AI-powered candidate scoring,
            automatic qualification checking, and intelligent resume analysis.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="px-1">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
          AI Scoring Overview
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Review your AI configuration across all sections. This is how
          candidates will be evaluated.
        </p>
      </div>

      {/* Overall AI Configuration Summary */}
      <Card className="border border-blue-200 bg-gradient-to-br from-blue-50/50 to-purple-50/50 shadow-none rounded-xl">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-medium text-blue-600">
            🤖 AI Evaluation Summary
          </CardTitle>
          <p className="text-xs sm:text-sm text-gray-600">
            Your complete AI scoring configuration for this position.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 pt-0">
          {/* Three Section Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Qualifications Summary */}
            <Card className="border border-blue-200/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-blue-600">
                  <CheckCircle className="w-4 h-4" />
                  Qualifications ({qualStats.total})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-red-600">Need (Auto-reject)</span>
                    <Badge
                      variant="outline"
                      className="bg-red-50 text-red-700 border-red-200"
                    >
                      {qualStats.need}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-600">Should Have</span>
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200"
                    >
                      {qualStats.should}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-purple-600">Nice to Have</span>
                    <Badge
                      variant="outline"
                      className="bg-purple-50 text-purple-700 border-purple-200"
                    >
                      {qualStats.nice}
                    </Badge>
                  </div>
                </div>
                <Progress
                  value={(qualStats.total / Math.max(qualStats.total, 1)) * 100}
                  className="h-2"
                />
              </CardContent>
            </Card>

            {/* Custom Questions Summary */}
            <Card className="border border-purple-200/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-purple-600">
                  <MessageSquare className="w-4 h-4" />
                  Questions ({questionStats.total})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-green-600">Simple AI Mode</span>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      {questionStats.simpleMode}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-600">Advanced AI Mode</span>
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200"
                    >
                      {questionStats.advancedMode}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-purple-600">Required</span>
                    <Badge
                      variant="outline"
                      className="bg-purple-50 text-purple-700 border-purple-200"
                    >
                      {questionStats.required}
                    </Badge>
                  </div>
                  {questionStats.withWeights > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-orange-600">Custom Weights</span>
                      <Badge
                        variant="outline"
                        className="bg-orange-50 text-orange-700 border-orange-200"
                      >
                        {questionStats.withWeights}
                      </Badge>
                    </div>
                  )}
                </div>
                <Progress
                  value={(questionStats.total / 5) * 100}
                  className="h-2"
                />
                <p className="text-xs text-gray-500">
                  {questionStats.total}/5 questions
                  {questionStats.simpleMode > 0 &&
                    ` (${questionStats.simpleMode} auto)`}
                  {questionStats.advancedMode > 0 &&
                    ` (${questionStats.advancedMode} manual)`}
                </p>
              </CardContent>
            </Card>

            {/* Resume Analysis Summary */}
            <Card className="border border-green-200/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-green-600">
                  <FileText className="w-4 h-4" />
                  Resume Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-green-600">Mode</span>
                    <Badge
                      variant="outline"
                      className={`border-green-200 ${
                        resumeStats.mode === "simple"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-purple-50 text-purple-700"
                      }`}
                    >
                      {resumeStats.mode === "simple" ? "Simple" : "Detailed"}
                    </Badge>
                  </div>
                  {resumeStats.mode === "detailed" && (
                    <>
                      <div className="flex justify-between text-xs">
                        <span className="text-green-600">Skills</span>
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          {resumeStats.skillsCriteria}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-green-600">Experience</span>
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          {resumeStats.experienceCriteria}
                        </Badge>
                      </div>
                    </>
                  )}
                </div>
                <Progress
                  value={
                    resumeStats.mode === "simple"
                      ? 100
                      : (resumeStats.criteriaCount / 10) * 100
                  }
                  className="h-2"
                />
                {resumeStats.mode === "detailed" && (
                  <p className="text-xs text-gray-500">
                    {resumeStats.criteriaCount} criteria defined
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* AI Scoring Flow */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-800">
                  <Brain className="w-5 h-5" />
                  How AI Will Evaluate Candidates
                </CardTitle>
{availableSections.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowWeightEditor(!showWeightEditor)}
                    className="gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    {showWeightEditor ? "Hide Settings" : "Adjust Weights"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Weight Editor */}
              {showWeightEditor && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-blue-900">
                      Section Weight Configuration
                    </CardTitle>
                    <p className="text-xs text-blue-700">
                      {availableSections.length === 1 
                        ? "Only resume analysis is available for scoring. Add qualifications or custom questions to enable weight adjustment."
                        : "Adjust how much each section contributes to the overall candidate score. Weights must add up to 100%."
                      }
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Qualifications Weight */}
                    {hasQualifications && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium text-blue-900">Qualifications</Label>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded">
                              {qualificationsWeight[0]}%
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Slider
                            value={qualificationsWeight}
                            onValueChange={(value) => {
                              setQualificationsWeight(value);
                              balanceWeights('qualifications', value[0]);
                            }}
                            min={availableSections.length === 1 ? 100 : 5}
                            max={availableSections.length === 1 ? 100 : 90}
                            step={1}
                            className="w-full slider-smooth"
                            disabled={availableSections.length === 1}
                          />
                          <div className="flex justify-between text-xs text-blue-600">
                            <span>5%</span>
                            <span className="font-medium">Qualifications Impact</span>
                            <span>90%</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Resume Weight */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-purple-900">Resume Analysis</Label>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded">
                            {resumeWeight[0]}%
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Slider
                          value={resumeWeight}
                          onValueChange={(value) => {
                            setResumeWeight(value);
                            balanceWeights('resume', value[0]);
                          }}
                          min={availableSections.length === 1 ? 100 : 5}
                          max={availableSections.length === 1 ? 100 : 90}
                          step={1}
                          className="w-full slider-smooth"
                          disabled={availableSections.length === 1}
                        />
                        <div className="flex justify-between text-xs text-purple-600">
                          <span>5%</span>
                          <span className="font-medium">Resume Impact</span>
                          <span>90%</span>
                        </div>
                      </div>
                    </div>

                    {/* Questions Weight */}
                    {hasCustomQuestions && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium text-green-900">Custom Questions</Label>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                              {questionsWeight[0]}%
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Slider
                            value={questionsWeight}
                            onValueChange={(value) => {
                              setQuestionsWeight(value);
                              balanceWeights('questions', value[0]);
                            }}
                            min={availableSections.length === 1 ? 100 : 5}
                            max={availableSections.length === 1 ? 100 : 90}
                            step={1}
                            className="w-full slider-smooth"
                            disabled={availableSections.length === 1}
                          />
                          <div className="flex justify-between text-xs text-green-600">
                            <span>5%</span>
                            <span className="font-medium">Questions Impact</span>
                            <span>90%</span>
                          </div>
                        </div>
                      </div>
                    )}


                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-blue-200">
                      <Button
                        type="button"
                        size="sm"
                        onClick={saveWeights}
                        className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg flex-1"
                      >
                        ✓ Save Weights
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={resetWeights}
                        className="gap-1 transition-all duration-200 hover:bg-gray-50"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Reset
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className={`grid gap-4 ${
                availableSections.length === 1 ? 'grid-cols-1' : 
                availableSections.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 
                'grid-cols-1 md:grid-cols-3'
              }`}>
                {hasQualifications && (
                  <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold text-sm">1</span>
                    </div>
                    <h4 className="font-medium text-blue-900 mb-1">
                      Qualifications Check
                    </h4>
                    <p className="text-xs text-blue-700">
                      Auto-reject if missing "Need" qualifications, score "Should"
                      and "Nice" categories
                    </p>
                    <div className="text-lg font-bold text-blue-600 mt-2">
                      {qualificationsWeight[0]}%
                    </div>
                  </div>
                )}

                <div className="text-center p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold text-sm">
                      {hasQualifications ? '2' : '1'}
                    </span>
                  </div>
                  <h4 className="font-medium text-purple-900 mb-1">
                    Resume Analysis
                  </h4>
                  <p className="text-xs text-purple-700">
                    {resumeStats.mode === "simple"
                      ? "Contextual AI analysis"
                      : "Custom criteria matching"}
                  </p>
                  <div className="text-lg font-bold text-purple-600 mt-2">
                    {resumeWeight[0]}%
                  </div>
                </div>

                {hasCustomQuestions && (
                  <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold text-sm">
                        {hasQualifications ? '3' : '2'}
                      </span>
                    </div>
                    <h4 className="font-medium text-green-900 mb-1">
                      Custom Questions
                    </h4>
                    <p className="text-xs text-green-700">
                      Score based on question type and expected answers
                    </p>
                    <div className="text-lg font-bold text-green-600 mt-2">
                      {questionsWeight[0]}%
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  Final Evaluation Process:
                </h4>
                <ol className="text-xs text-gray-700 space-y-1">
                  <li>
                    1. <strong>Auto-reject check:</strong> Candidates missing
                    "Need" qualifications or failing auto-reject questions are
                    immediately rejected
                  </li>
                  <li>
                    2. <strong>Section scoring:</strong> Each section
                    (Qualifications, Resume, Questions) is scored independently
                  </li>
                  <li>
                    3. <strong>Weighted combination:</strong> Scores are
                    combined using the {qualificationsWeight[0]}/{resumeWeight[0]}/{questionsWeight[0]} weighting system
                  </li>
                  <li>
                    4. <strong>Recommendation:</strong> Final score determines
                    recommendation level (Strong No to Strong Yes)
                  </li>
                  <li>
                    5. <strong>Human review:</strong> You review AI
                    recommendations and make final hiring decisions
                  </li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Configuration Summary */}
          {(qualStats.total > 0 ||
            questionStats.total > 0 ||
            resumeStats.mode === "detailed") && (
            <Alert>
              <Star className="h-4 w-4" />
              <AlertDescription>
                <strong>Your AI is configured and ready!</strong> Candidates
                will be automatically evaluated using your qualifications (
                {qualStats.total}),
                {questionStats.total > 0 &&
                  ` custom questions (${questionStats.total}),`}
                {resumeStats.mode === "detailed" &&
                  ` and detailed resume criteria (${resumeStats.criteriaCount}).`}
                {resumeStats.mode === "simple" &&
                  " and contextual resume analysis."}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
