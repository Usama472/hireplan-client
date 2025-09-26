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
  Settings,
} from "lucide-react";
import type { JobFormData } from "@/interfaces";

interface AIAnalysisReviewProps {
  formData: JobFormData;
}

export function AIAnalysisReview({ formData }: AIAnalysisReviewProps) {
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

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Mobile Optimized */}
      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          AI Analysis Review
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          Review your complete AI analysis configuration including resume
          screening, pre-screening questions, and overall candidate evaluation
          settings.
        </p>
      </div>

      {/* AI Evaluation Hero Section - Mobile First */}
      <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-purple-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-purple-900">
              AI Analysis Summary
            </h3>
            <p className="text-xs sm:text-sm text-purple-700">
              Complete AI analysis and scoring configuration for this position
            </p>
          </div>
        </div>

        {/* Quick Stats - Mobile Friendly Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="text-center p-2 sm:p-3 bg-white/60 rounded-lg border border-purple-100">
            <div className="text-lg sm:text-2xl font-bold text-purple-600">
              {qualStats.total}
            </div>
            <div className="text-xs sm:text-sm text-purple-700">
              Qualifications
            </div>
          </div>
          <div className="text-center p-2 sm:p-3 bg-white/60 rounded-lg border border-purple-100">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">
              {questionStats.total}
            </div>
            <div className="text-xs sm:text-sm text-blue-700">Questions</div>
          </div>
          <div className="text-center p-2 sm:p-3 bg-white/60 rounded-lg border border-purple-100">
            <div className="text-lg sm:text-2xl font-bold text-indigo-600">
              {resumeStats.mode === "detailed"
                ? resumeStats.criteriaCount
                : "Smart"}
            </div>
            <div className="text-xs sm:text-sm text-indigo-700">Resume AI</div>
          </div>
        </div>
      </div>

      {/* Configuration Details - Mobile Stacked Layout */}
      <div className="space-y-3 sm:space-y-4">
        {/* Qualifications Section */}
        <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900">
              Qualifications ({qualStats.total})
            </h4>
          </div>

          {qualifications.length > 0 ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1 sm:gap-2">
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  {qualStats.need} Need
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                  {qualStats.should} Should
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  {qualStats.nice} Nice
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                  <span className="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                  {qualStats.required} Required
                </div>
              </div>

              {/* Qualification Details */}
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {qualifications.slice(0, 3).map((qual: any, index: number) => (
                  <div
                    key={index}
                    className="bg-white/60 rounded-lg p-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-blue-800 font-medium">
                        {qual.text}
                      </span>
                      <div className="flex gap-1 flex-shrink-0">
                        {qual.isRequired && (
                          <span className="px-1 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                            Required
                          </span>
                        )}
                        <span
                          className={`px-1 py-0.5 rounded text-xs ${
                            qual.aiCategory === "need"
                              ? "bg-red-100 text-red-600"
                              : qual.aiCategory === "should"
                              ? "bg-orange-100 text-orange-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {qual.aiCategory || "nice"}
                        </span>
                      </div>
                    </div>
                    {qual.score !== undefined && (
                      <div className="text-blue-600 mt-1">
                        Score weight: {qual.score}%
                      </div>
                    )}
                  </div>
                ))}
                {qualifications.length > 3 && (
                  <div className="text-center text-xs text-blue-600">
                    +{qualifications.length - 3} more qualifications
                  </div>
                )}
              </div>

              <div className="w-full bg-blue-200 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-1.5 rounded-full"
                  style={{ width: qualStats.total > 0 ? "100%" : "0%" }}
                ></div>
              </div>
              <p className="text-xs text-blue-700">
                Auto-reject candidates missing "Need" qualifications • Score
                remaining qualifications
              </p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-blue-600">
                No qualifications configured
              </p>
              <p className="text-xs text-blue-500 mt-1">
                Add qualifications in the Requirements step to filter candidates
              </p>
            </div>
          )}
        </div>

        {/* Custom Questions Section */}
        <div className="bg-green-50 rounded-lg p-3 sm:p-4 border border-green-100">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            <h4 className="font-semibold text-green-900">
              Custom Questions ({questionStats.total})
            </h4>
          </div>

          {customQuestions.length > 0 ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1 sm:gap-2">
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  {questionStats.required} Required
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  {questionStats.simpleMode} Simple
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                  {questionStats.advancedMode} Advanced
                </div>
                {questionStats.autoReject > 0 && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    {questionStats.autoReject} Auto-reject
                  </div>
                )}
              </div>

              {/* Question Details */}
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {customQuestions
                  .slice(0, 3)
                  .map((question: any, index: number) => (
                    <div
                      key={index}
                      className="bg-white/60 rounded-lg p-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-green-800 font-medium truncate">
                          {question.question}
                        </span>
                        <div className="flex gap-1 flex-shrink-0">
                          {question.required && (
                            <span className="px-1 py-0.5 bg-blue-100 text-blue-600 rounded text-xs">
                              Required
                            </span>
                          )}
                          {question.autoReject && (
                            <span className="px-1 py-0.5 bg-red-100 text-red-600 rounded text-xs">
                              Auto-reject
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-green-600 mt-1">
                        Type: {question.type}{" "}
                        {question.scoringMode &&
                          `• ${question.scoringMode} scoring`}
                      </div>
                    </div>
                  ))}
                {customQuestions.length > 3 && (
                  <div className="text-center text-xs text-green-600">
                    +{customQuestions.length - 3} more questions
                  </div>
                )}
              </div>

              <div className="w-full bg-green-200 rounded-full h-1.5">
                <div
                  className="bg-green-500 h-1.5 rounded-full"
                  style={{ width: questionStats.total > 0 ? "100%" : "0%" }}
                ></div>
              </div>
              <p className="text-xs text-green-700">
                Smart AI analysis based on question types and scoring
                configuration
              </p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-green-600">
                No custom questions configured
              </p>
              <p className="text-xs text-green-500 mt-1">
                Add custom questions in the AI Analysis step to screen
                candidates
              </p>
            </div>
          )}
        </div>

        {/* Resume Analysis Section */}
        <div className="bg-purple-50 rounded-lg p-3 sm:p-4 border border-purple-100">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            <h4 className="font-semibold text-purple-900">Resume Analysis</h4>
          </div>

          {resumeStats.mode === "detailed" && resumeCriteria.length > 0 ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1 sm:gap-2">
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                  Detailed Mode
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  {resumeStats.skillsCriteria} Skills
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  {resumeStats.experienceCriteria} Experience
                </div>
              </div>

              {/* Resume Criteria Details */}
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {resumeCriteria
                  .slice(0, 4)
                  .map((criterion: any, index: number) => (
                    <div
                      key={index}
                      className="bg-white/60 rounded-lg p-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-purple-800 font-medium">
                          {criterion.text}
                        </span>
                        <div className="flex gap-1 flex-shrink-0">
                          <span
                            className={`px-1 py-0.5 rounded text-xs ${
                              criterion.aiCategory === "need"
                                ? "bg-red-100 text-red-600"
                                : criterion.aiCategory === "should"
                                ? "bg-orange-100 text-orange-600"
                                : "bg-green-100 text-green-600"
                            }`}
                          >
                            {criterion.aiCategory || "nice"}
                          </span>
                        </div>
                      </div>
                      <div className="text-purple-600 mt-1">
                        {criterion.type} • Weight: {criterion.weight}/10
                      </div>
                    </div>
                  ))}
                {resumeCriteria.length > 4 && (
                  <div className="text-center text-xs text-purple-600">
                    +{resumeCriteria.length - 4} more criteria
                  </div>
                )}
              </div>

              <div className="w-full bg-purple-200 rounded-full h-1.5">
                <div
                  className="bg-purple-500 h-1.5 rounded-full"
                  style={{
                    width: `${Math.min(
                      (resumeStats.criteriaCount / 10) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-purple-700">
                {resumeStats.criteriaCount} custom criteria configured for
                detailed resume analysis
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1 sm:gap-2">
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Smart AI Mode
                </div>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-1.5">
                <div className="bg-purple-500 h-1.5 rounded-full w-full"></div>
              </div>
              <p className="text-xs text-purple-700">
                {resumeStats.mode === "simple"
                  ? "Contextual AI analysis of skills and experience using intelligent pattern matching"
                  : "No custom criteria configured - using smart AI analysis"}
              </p>
            </div>
          )}
        </div>

        {/* AI Scoring Configuration */}
        {formData.automation?.sectionWeights && (
          <div className="bg-indigo-50 rounded-lg p-3 sm:p-4 border border-indigo-100">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
              <h4 className="font-semibold text-indigo-900">
                AI Scoring Weights
              </h4>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(formData.automation.sectionWeights).map(
                  ([section, weight]) => (
                    <div key={section} className="bg-white/60 rounded-lg p-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-indigo-700 capitalize">
                          {section.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                        <span className="text-sm font-semibold text-indigo-900">
                          {weight}%
                        </span>
                      </div>
                      <div className="w-full bg-indigo-200 rounded-full h-1 mt-1">
                        <div
                          className="bg-indigo-500 h-1 rounded-full"
                          style={{ width: `${weight}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                )}
              </div>
              <p className="text-xs text-indigo-700">
                These weights determine how much each section contributes to the
                overall AI score
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Evaluation Process - Completely Redesigned for Mobile */}
      <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl p-4 sm:p-6 border border-slate-200">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-slate-600 to-gray-700 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h4 className="text-lg sm:text-xl font-semibold text-slate-900">
              How AI Evaluates Candidates
            </h4>
            <p className="text-xs sm:text-sm text-slate-600">
              3-step evaluation process
            </p>
          </div>
        </div>

        {/* Evaluation Steps - Mobile Flow Design */}
        <div className="space-y-4 sm:space-y-6">
          {/* Step 1 - Qualifications */}
          <div className="relative">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0 relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                {/* Connecting line - hidden on last item */}
                <div className="absolute top-10 sm:top-12 left-1/2 transform -translate-x-1/2 w-0.5 h-8 sm:h-12 bg-gradient-to-b from-blue-300 to-purple-300"></div>
              </div>
              <div className="flex-1 bg-white/70 rounded-lg p-3 sm:p-4 border border-blue-100 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-semibold text-blue-900 text-sm sm:text-base">
                    1. Qualifications Check
                  </h5>
                  <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    40%
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-blue-700 mb-2">
                  Auto-reject candidates missing critical "Need" qualifications,
                  then score remaining qualifications
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-blue-200 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full w-2/5"></div>
                  </div>
                  <span className="text-xs text-blue-600 font-medium">40%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 - Resume Analysis */}
          <div className="relative">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0 relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                {/* Connecting line */}
                <div className="absolute top-10 sm:top-12 left-1/2 transform -translate-x-1/2 w-0.5 h-8 sm:h-12 bg-gradient-to-b from-purple-300 to-green-300"></div>
              </div>
              <div className="flex-1 bg-white/70 rounded-lg p-3 sm:p-4 border border-purple-100 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-semibold text-purple-900 text-sm sm:text-base">
                    2. Resume Analysis
                  </h5>
                  <div className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                    30%
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-purple-700 mb-2">
                  {resumeStats.mode === "simple"
                    ? "Smart AI contextual analysis of skills, experience, and achievements"
                    : `Custom criteria matching across ${resumeStats.criteriaCount} defined requirements`}
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-purple-200 rounded-full h-1.5">
                    <div className="bg-purple-500 h-1.5 rounded-full w-3/10"></div>
                  </div>
                  <span className="text-xs text-purple-600 font-medium">
                    30%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 - Question Scoring */}
          <div className="relative">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                  <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <div className="flex-1 bg-white/70 rounded-lg p-3 sm:p-4 border border-green-100 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-semibold text-green-900 text-sm sm:text-base">
                    3. Question Scoring
                  </h5>
                  <div className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    30%
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-green-700 mb-2">
                  Intelligent analysis of custom question responses based on
                  answer quality and relevance
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-green-200 rounded-full h-1.5">
                    <div className="bg-green-500 h-1.5 rounded-full w-3/10"></div>
                  </div>
                  <span className="text-xs text-green-600 font-medium">
                    30%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Final Process Summary - Card Style */}
        <div className="mt-6 bg-white/80 rounded-lg p-4 border border-slate-200 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">→</span>
            </div>
            <h5 className="font-semibold text-slate-900 text-sm">
              Final Evaluation Process
            </h5>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <p className="text-xs text-slate-700">
                  <strong>Auto-reject:</strong> Missing "Need" qualifications →
                  immediate rejection
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <p className="text-xs text-slate-700">
                  <strong>Scoring:</strong> Each section scored independently
                  with 40/30/30 weighting
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <p className="text-xs text-slate-700">
                  <strong>Recommendation:</strong> Combined score determines AI
                  recommendation level
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <p className="text-xs text-slate-700">
                  <strong>Your review:</strong> You make final hiring decisions
                  based on AI insights
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message - Mobile Optimized */}
      {(qualStats.total > 0 ||
        questionStats.total > 0 ||
        resumeStats.mode === "detailed") && (
        <div className="bg-emerald-50 rounded-lg p-3 sm:p-4 border border-emerald-200">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-900">
                AI Configuration Complete!
              </p>
              <p className="text-xs text-emerald-700 mt-1">
                Your AI will evaluate candidates using {qualStats.total}{" "}
                qualifications
                {questionStats.total > 0 &&
                  `, ${questionStats.total} custom questions`}
                {resumeStats.mode === "detailed" &&
                  `, and ${resumeStats.criteriaCount} resume criteria`}
                {resumeStats.mode === "simple" && ", and smart resume analysis"}
                .
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
