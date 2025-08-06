import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Zap,
  Target,
  Settings,
  Brain,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  Info,
} from "lucide-react";
import type { JobFormData } from "@/interfaces";

interface AutomationReviewProps {
  formData: JobFormData;
}

export function AutomationReview({ formData }: AutomationReviewProps) {
  const automation = formData.automation;

  const formatThreshold = (threshold: number) => {
    return `${threshold}%`;
  };

  const getScoringWeightsTotal = () => {
    if (!automation?.scoringWeights) return 0;
    return Object.values(automation.scoringWeights).reduce(
      (sum, weight) => sum + weight,
      0
    );
  };

  const getCategoryWeightsTotal = () => {
    if (!automation?.aiRankingCategories) return 0;
    return automation.aiRankingCategories.reduce(
      (sum, category) => sum + (category.weight || 0),
      0
    );
  };

  const formatDataSource = (dataSource: any) => {
    const sources = [];
    if (dataSource.qualifications) sources.push("Qualifications");
    if (dataSource.screeningQuestions) sources.push("Screening Questions");
    if (dataSource.resume) sources.push("Resume");
    return sources.length > 0 ? sources.join(", ") : "None";
  };

  return (
    <div className="space-y-6">
      {/* Automation Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Automation Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                Enabled Rules
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900">
                  {automation?.enabledRules?.length || 0} rules enabled
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                Template
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900">
                  {automation?.templateId || "Default template"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scoring Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Scoring Thresholds
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                Acceptance Threshold
              </label>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 font-medium">
                  {formatThreshold(automation?.acceptanceThreshold || 76)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Candidates above this score are auto-accepted
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                Manual Review Threshold
              </label>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 font-medium">
                  {formatThreshold(automation?.manualReviewThreshold || 41)}
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Candidates in this range need manual review
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                Auto Reject Threshold
              </label>
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-medium">
                  {formatThreshold(automation?.autoRejectThreshold || 40)}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Candidates below this score are auto-rejected
                </p>
              </div>
            </div>
          </div>

          {/* Threshold Validation */}
          {automation && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                Threshold Flow
              </label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-600">Auto Reject</span>
                  <span className="text-yellow-600">Manual Review</span>
                  <span className="text-green-600">Auto Accept</span>
                </div>
                <Progress
                  value={100}
                  className="h-2 mt-2"
                  style={{
                    background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${automation.autoRejectThreshold}%, #eab308 ${automation.autoRejectThreshold}%, #eab308 ${automation.manualReviewThreshold}%, #22c55e ${automation.manualReviewThreshold}%, #22c55e 100%)`,
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>{formatThreshold(automation.autoRejectThreshold)}</span>
                  <span>
                    {formatThreshold(automation.manualReviewThreshold)}
                  </span>
                  <span>{formatThreshold(automation.acceptanceThreshold)}</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scoring Weights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Scoring Weights
            <Badge
              variant={
                getScoringWeightsTotal() === 100 ? "default" : "destructive"
              }
            >
              {getScoringWeightsTotal()}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {automation?.scoringWeights && (
            <div className="space-y-3">
              {Object.entries(automation.scoringWeights).map(
                ([key, weight]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </label>
                      <span className="text-sm text-gray-900">{weight}%</span>
                    </div>
                    <Progress value={weight} className="h-2" />
                  </div>
                )
              )}
            </div>
          )}

          {getScoringWeightsTotal() !== 100 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 font-medium">
                Scoring weights total {getScoringWeightsTotal()}%
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Total should equal 100% for optimal scoring
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Ranking Categories */}
      {automation?.aiRankingCategories &&
        automation.aiRankingCategories.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                AI Ranking Categories
                <Badge
                  variant={
                    getCategoryWeightsTotal() === 100
                      ? "default"
                      : "destructive"
                  }
                >
                  {getCategoryWeightsTotal()}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automation.aiRankingCategories.map((category, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {category.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Weight: {category.weight || 0}%
                        </p>
                      </div>
                      <Badge variant="outline">{category.weight || 0}%</Badge>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-gray-600">Data Sources:</p>
                      <p className="text-sm text-gray-900">
                        {formatDataSource(category.dataSource)}
                      </p>
                    </div>

                    {category.customQuestions &&
                      category.customQuestions.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-600 mb-2">
                            Custom Questions:
                          </p>
                          <div className="space-y-1">
                            {category.customQuestions.map(
                              (question, qIndex) => (
                                <div
                                  key={qIndex}
                                  className="text-xs text-gray-700 bg-white px-2 py-1 rounded"
                                >
                                  {question}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                ))}
              </div>

              {getCategoryWeightsTotal() !== 100 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mt-4">
                  <p className="text-sm text-yellow-800 font-medium">
                    Category weights total {getCategoryWeightsTotal()}%
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Total should equal 100% for optimal ranking
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

      {/* Custom Rules */}
      {automation?.customRules && automation.customRules.length > 0 && (
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              Custom Rules
              <Badge
                variant="secondary"
                className="ml-2 bg-blue-100 text-blue-700 border-blue-200"
              >
                {automation.customRules.length}
              </Badge>
            </CardTitle>
            <p className="text-sm text-gray-500">
              Automated actions based on candidate scores and conditions
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {automation.customRules.map((rule, index) => (
                <div
                  key={index}
                  className="relative p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:shadow-sm transition-all duration-200"
                >
                  {/* Rule Number Badge */}
                  <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>

                  <div className="space-y-4">
                    {/* Condition Section */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Target className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 mb-1">
                          Condition
                        </p>
                        <p className="text-sm text-gray-700 bg-white px-3 py-2 rounded-md border border-gray-200">
                          {rule.condition}
                        </p>
                      </div>
                    </div>

                    {/* Action Section */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Zap className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 mb-1">
                          Action
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="bg-green-50 border-green-200 text-green-700"
                          >
                            {rule.action}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Template Section */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 mb-1">
                          Email Template
                        </p>
                        <p className="text-sm text-gray-700 bg-white px-3 py-2 rounded-md border border-gray-200">
                          {rule.template}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Stats */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Automation Summary
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span>
                    • {automation.customRules.length} rules configured
                  </span>
                  <span>• Automated workflow enabled</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Automation Recommendations */}
      {(!automation || Object.keys(automation).length === 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Automation Setup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 font-medium">
                No automation configured
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Consider setting up AI automation to streamline your hiring
                process and improve candidate screening.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
