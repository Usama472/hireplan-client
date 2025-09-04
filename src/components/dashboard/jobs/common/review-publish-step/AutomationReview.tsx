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
    <div className="space-y-8">
      {/* Section Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">AI Automation</h2>
        <p className="text-gray-600">
          Review automation settings, scoring thresholds, and AI ranking
          configuration.
        </p>
      </div>

      {/* Automation Overview */}
      <div className="space-y-6">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          Automation Overview
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Enabled Rules
            </h4>
            <div className="text-gray-700 text-sm font-medium">
              {automation?.enabledRules?.length || 0} rules enabled
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Template
            </h4>
            <div className="text-gray-700 text-sm font-medium">
              {automation?.templateId || "Default template"}
            </div>
          </div>
        </div>
      </div>

      {/* Scoring Thresholds */}
      <div className="space-y-6">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          Scoring Thresholds
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Acceptance Threshold
            </h4>
            <div className="text-gray-700 text-sm font-medium">
              {formatThreshold(automation?.acceptanceThreshold || 76)}
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded-full">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span className="text-xs font-medium text-green-700">
                Auto-accept above this score
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Manual Review Threshold
            </h4>
            <div className="text-gray-700 text-sm font-medium">
              {formatThreshold(automation?.manualReviewThreshold || 41)}
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-200 rounded-full">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
              <span className="text-xs font-medium text-amber-700">
                Manual review required
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Auto Reject Threshold
            </h4>
            <div className="text-gray-700 text-sm font-medium">
              {formatThreshold(automation?.autoRejectThreshold || 40)}
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 border border-red-200 rounded-full">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
              <span className="text-xs font-medium text-red-700">
                Auto-reject below this score
              </span>
            </div>
          </div>
        </div>

        {/* Threshold Flow Visualization */}
        {automation && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Threshold Flow
            </h4>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-red-600 font-medium">Auto Reject</span>
                <span className="text-amber-600 font-medium">
                  Manual Review
                </span>
                <span className="text-green-600 font-medium">Auto Accept</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full"
                  style={{
                    background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${automation.autoRejectThreshold}%, #eab308 ${automation.autoRejectThreshold}%, #eab308 ${automation.manualReviewThreshold}%, #22c55e ${automation.manualReviewThreshold}%, #22c55e 100%)`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>0%</span>
                <span>{formatThreshold(automation.autoRejectThreshold)}</span>
                <span>{formatThreshold(automation.manualReviewThreshold)}</span>
                <span>{formatThreshold(automation.acceptanceThreshold)}</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scoring Weights */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Scoring Weights
          </h3>
          <div
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${
              getScoringWeightsTotal() === 100
                ? "bg-emerald-50 border border-emerald-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                getScoringWeightsTotal() === 100
                  ? "bg-emerald-500"
                  : "bg-red-500"
              }`}
            ></div>
            <span
              className={`text-xs font-medium ${
                getScoringWeightsTotal() === 100
                  ? "text-emerald-700"
                  : "text-red-700"
              }`}
            >
              {getScoringWeightsTotal()}%
            </span>
          </div>
        </div>

        {automation?.scoringWeights && (
          <div className="space-y-4">
            {Object.entries(automation.scoringWeights).map(([key, weight]) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </h4>
                  <span className="text-gray-700 text-sm font-medium">
                    {weight}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${weight}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {getScoringWeightsTotal() !== 100 && (
          <div className="flex justify-end">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full shadow-sm">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span className="text-sm font-medium text-amber-800">
                Scoring weights total {getScoringWeightsTotal()}% - Should equal
                100% for optimal scoring
              </span>
            </div>
          </div>
        )}
      </div>

      {/* AI Ranking Categories */}
      {automation?.aiRankingCategories &&
        automation.aiRankingCategories.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                AI Ranking Categories
              </h3>
              <div
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${
                  getCategoryWeightsTotal() === 100
                    ? "bg-emerald-50 border border-emerald-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    getCategoryWeightsTotal() === 100
                      ? "bg-emerald-500"
                      : "bg-red-500"
                  }`}
                ></div>
                <span
                  className={`text-xs font-medium ${
                    getCategoryWeightsTotal() === 100
                      ? "text-emerald-700"
                      : "text-red-700"
                  }`}
                >
                  {getCategoryWeightsTotal()}%
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {automation.aiRankingCategories.map((category, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-gray-700 text-sm font-medium">
                        {category.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Weight: {category.weight || 0}%
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded-full">
                      <span className="text-xs font-medium text-blue-700">
                        {category.weight || 0}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-xs text-gray-500 uppercase tracking-wide">
                      Data Sources:
                    </h5>
                    <p className="text-gray-700 text-sm font-medium">
                      {formatDataSource(category.dataSource)}
                    </p>
                  </div>

                  {category.customQuestions &&
                    category.customQuestions.length > 0 && (
                      <div className="mt-3">
                        <h5 className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                          Custom Questions:
                        </h5>
                        <div className="space-y-1">
                          {category.customQuestions.map((question, qIndex) => (
                            <div
                              key={qIndex}
                              className="text-xs text-gray-600 bg-white px-3 py-2 rounded border border-gray-200"
                            >
                              {question}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>

            {getCategoryWeightsTotal() !== 100 && (
              <div className="flex justify-end">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full shadow-sm">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span className="text-sm font-medium text-amber-800">
                    Category weights total {getCategoryWeightsTotal()}% - Should
                    equal 100% for optimal ranking
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

      {/* Custom Rules */}
      {automation?.customRules && automation.customRules.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Custom Rules
            </h3>
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded-full">
              <span className="text-xs font-medium text-blue-700">
                {automation.customRules.length}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {automation.customRules.map((rule, index) => (
              <div
                key={index}
                className="relative p-4 bg-gray-50 border border-gray-200 rounded-lg"
              >
                {/* Rule Number Badge */}
                <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>

                <div className="space-y-4">
                  {/* Condition Section */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                      Condition
                    </h4>
                    <div className="p-3 bg-white border border-gray-200 rounded-lg">
                      <p className="text-gray-700 text-sm font-medium">
                        {rule.condition}
                      </p>
                    </div>
                  </div>

                  {/* Action Section */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                      Action
                    </h4>
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span className="text-xs font-medium text-green-700">
                        {rule.action}
                      </span>
                    </div>
                  </div>

                  {/* Template Section */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                      Email Template
                    </h4>
                    <div className="p-3 bg-white border border-gray-200 rounded-lg">
                      <p className="text-gray-700 text-sm font-medium">
                        {rule.template}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">
                  Automation Summary
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span>• {automation.customRules.length} rules configured</span>
                <span>• Automated workflow enabled</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Automation Recommendations */}
      {(!automation || Object.keys(automation).length === 0) && (
        <div className="flex justify-end">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full shadow-sm">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            <span className="text-sm font-medium text-amber-800">
              No automation configured - Consider setting up AI automation to
              streamline your hiring process
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
