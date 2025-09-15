import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  FileText,
  MessageSquare,
  Brain,
  Star,
} from "lucide-react";
import type { JobFormData } from "@/interfaces";

interface AutomationReviewProps {
  formData: JobFormData;
}

export function AutomationReview({ formData }: AutomationReviewProps) {
  // Get data from all sections (same as ai-overview-step)
  const qualifications = formData.qualifications || [];
  const customQuestions = formData.customQuestions || [];
  const resumeAnalysisMode = formData.resumeAnalysisMode || "simple";
  const resumeCriteria = formData.resumeCriteria || [];

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">AI Overview</h2>
        <p className="text-gray-600 mt-1">
          Review your AI configuration across all sections. This is how candidates will be evaluated.
        </p>
      </div>

      {/* Overall AI Configuration Summary */}
      <Card className="border border-purple-200 bg-gradient-to-br from-purple-50/50 to-blue-50/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-medium text-purple-600">
            🤖 AI Evaluation Summary
          </CardTitle>
          <p className="text-sm text-gray-600">
            Your complete AI scoring configuration for this position.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Section Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Qualifications */}
            <Card className="border border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-blue-600">
                  <CheckCircle className="w-4 h-4" />
                  Qualifications ({qualStats.total})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Need (Auto-reject if missing)</span>
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      {qualStats.need}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Should Have (High weight)</span>
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                      {qualStats.should}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Nice to Have (Bonus)</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {qualStats.nice}
                    </Badge>
                  </div>
                </div>
                <Progress value={qualStats.total > 0 ? 100 : 0} className="h-2" />
                <p className="text-xs text-gray-500">{qualStats.total} qualifications defined</p>
              </CardContent>
            </Card>

            {/* Custom Questions */}
            <Card className="border border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-green-600">
                  <MessageSquare className="w-4 h-4" />
                  Custom Questions ({questionStats.total})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Required Questions</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {questionStats.required}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Auto-reject Questions</span>
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      {questionStats.autoReject}
                    </Badge>
                  </div>
                </div>
                <Progress value={questionStats.total > 0 ? 100 : 0} className="h-2" />
                <p className="text-xs text-gray-500">{questionStats.total} questions configured</p>
              </CardContent>
            </Card>

            {/* Resume Analysis */}
            <Card className="border border-purple-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-purple-600">
                  <FileText className="w-4 h-4" />
                  Resume Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Analysis Mode</span>
                    <Badge variant="outline" className={resumeStats.mode === 'simple' ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-purple-50 text-purple-700 border-purple-200"}>
                      {resumeStats.mode === 'simple' ? 'Simple' : 'Detailed'}
                    </Badge>
                  </div>
                  {resumeStats.mode === 'detailed' && (
                    <>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Skills Criteria</span>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {resumeStats.skillsCriteria}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Experience Criteria</span>
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