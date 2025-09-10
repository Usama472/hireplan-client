"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useAuthSessionContext from "@/lib/context/AuthSessionContext";

import {
  CheckCircle,
  FileText,
  MessageSquare,
  Target,
  Info,
  Brain,
  Star,
} from "lucide-react";
import { useFormContext } from "react-hook-form";

export function AIOverviewStep() {
  const { watch } = useFormContext();
  const { subscription } = useAuthSessionContext();
  
  // Check subscription for AI features
  const hasAIFeatures = subscription?.planId === 'professional' || subscription?.planId === 'enterprise';
  
  // Get data from all sections
  const qualifications = watch("qualifications") || [];
  const customQuestions = watch("customQuestions") || [];
  const resumeAnalysisMode = watch("resumeAnalysisMode") || "simple";
  const resumeCriteria = watch("resumeCriteria") || [];

  // Calculate statistics
  const qualStats = {
    total: qualifications.length,
    required: qualifications.filter((q: any) => q.isRequired).length,
    preferred: qualifications.filter((q: any) => !q.isRequired).length,
    need: qualifications.filter((q: any) => q.aiCategory === 'need').length,
    should: qualifications.filter((q: any) => q.aiCategory === 'should').length,
    nice: qualifications.filter((q: any) => q.aiCategory === 'nice').length,
  };

  const questionStats = {
    total: customQuestions.length,
    required: customQuestions.filter((q: any) => q.required).length,
    autoReject: customQuestions.filter((q: any) => q.autoReject).length,
  };

  const resumeStats = {
    mode: resumeAnalysisMode,
    criteriaCount: resumeCriteria.length,
    skillsCriteria: resumeCriteria.filter((c: any) => c.type === 'skill').length,
    experienceCriteria: resumeCriteria.filter((c: any) => c.type === 'experience').length,
  };

  if (!hasAIFeatures) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            AI Overview
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            AI-powered candidate evaluation is available with Professional and Enterprise plans.
          </p>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Upgrade to Professional to enable AI-powered candidate scoring, automatic qualification checking, and intelligent resume analysis.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          AI Scoring Overview
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Review your AI configuration across all sections. This is how candidates will be evaluated.
        </p>
      </div>

      {/* Overall AI Configuration Summary */}
      <Card className="border border-blue-200 bg-gradient-to-br from-blue-50/50 to-purple-50/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-medium text-blue-600">
            🤖 AI Evaluation Summary
          </CardTitle>
          <p className="text-sm text-gray-600">
            Your complete AI scoring configuration for this position.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
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
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      {qualStats.need}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-600">Should Have</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {qualStats.should}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-purple-600">Nice to Have</span>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      {qualStats.nice}
                    </Badge>
                  </div>
                </div>
                <Progress value={(qualStats.total / Math.max(qualStats.total, 1)) * 100} className="h-2" />
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
                    <span className="text-red-600">Auto-reject</span>
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      {questionStats.autoReject}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-purple-600">Required</span>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      {questionStats.required}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Optional</span>
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                      {questionStats.total - questionStats.required}
                    </Badge>
                  </div>
                </div>
                <Progress value={(questionStats.total / 5) * 100} className="h-2" />
                <p className="text-xs text-gray-500">{questionStats.total}/5 questions</p>
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
                    <Badge variant="outline" className={`border-green-200 ${
                      resumeStats.mode === 'simple' 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'bg-purple-50 text-purple-700'
                    }`}>
                      {resumeStats.mode === 'simple' ? 'Simple' : 'Detailed'}
                    </Badge>
                  </div>
                  {resumeStats.mode === 'detailed' && (
                    <>
                      <div className="flex justify-between text-xs">
                        <span className="text-green-600">Skills</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {resumeStats.skillsCriteria}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-green-600">Experience</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {resumeStats.experienceCriteria}
                        </Badge>
                      </div>
                    </>
                  )}
                </div>
                <Progress value={resumeStats.mode === 'simple' ? 100 : (resumeStats.criteriaCount / 10) * 100} className="h-2" />
                {resumeStats.mode === 'detailed' && (
                  <p className="text-xs text-gray-500">{resumeStats.criteriaCount} criteria defined</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* AI Scoring Flow */}
          <Card className="border border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-800">
                <Brain className="w-5 h-5" />
                How AI Will Evaluate Candidates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <h4 className="font-medium text-blue-900 mb-1">Qualifications Check</h4>
                  <p className="text-xs text-blue-700">
                    Auto-reject if missing "Need" qualifications, score "Should" and "Nice" categories
                  </p>
                  <div className="text-lg font-bold text-blue-600 mt-2">40%</div>
                </div>

                <div className="text-center p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <h4 className="font-medium text-purple-900 mb-1">Resume Analysis</h4>
                  <p className="text-xs text-purple-700">
                    {resumeStats.mode === 'simple' ? 'Contextual AI analysis' : 'Custom criteria matching'}
                  </p>
                  <div className="text-lg font-bold text-purple-600 mt-2">30%</div>
                </div>

                <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <h4 className="font-medium text-green-900 mb-1">Custom Questions</h4>
                  <p className="text-xs text-green-700">
                    Score based on question type and expected answers
                  </p>
                  <div className="text-lg font-bold text-green-600 mt-2">30%</div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Final Evaluation Process:</h4>
                <ol className="text-xs text-gray-700 space-y-1">
                  <li>1. <strong>Auto-reject check:</strong> Candidates missing "Need" qualifications or failing auto-reject questions are immediately rejected</li>
                  <li>2. <strong>Section scoring:</strong> Each section (Qualifications, Resume, Questions) is scored independently</li>
                  <li>3. <strong>Weighted combination:</strong> Scores are combined using the 40/30/30 weighting system</li>
                  <li>4. <strong>Recommendation:</strong> Final score determines recommendation level (Strong No to Strong Yes)</li>
                  <li>5. <strong>Human review:</strong> You review AI recommendations and make final hiring decisions</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Configuration Summary */}
          {(qualStats.total > 0 || questionStats.total > 0 || resumeStats.mode === 'detailed') && (
            <Alert>
              <Star className="h-4 w-4" />
              <AlertDescription>
                <strong>Your AI is configured and ready!</strong> Candidates will be automatically evaluated using your qualifications ({qualStats.total}), 
                {questionStats.total > 0 && ` custom questions (${questionStats.total}),`}
                {resumeStats.mode === 'detailed' && ` and detailed resume criteria (${resumeStats.criteriaCount}).`}
                {resumeStats.mode === 'simple' && ' and contextual resume analysis.'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
