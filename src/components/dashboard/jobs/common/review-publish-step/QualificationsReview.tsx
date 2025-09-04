import type { JobFormData } from "@/interfaces";

interface QualificationsReviewProps {
  formData: JobFormData;
}

export function QualificationsReview({ formData }: QualificationsReviewProps) {
  const formatQualificationScore = (score: number) => {
    if (score >= 80)
      return { label: "Critical", color: "destructive" as const };
    if (score >= 60) return { label: "Important", color: "secondary" as const };
    if (score >= 40) return { label: "Preferred", color: "outline" as const };
    return { label: "Nice to have", color: "outline" as const };
  };

  const formatQuestionType = (type: string) => {
    const typeMap: Record<string, string> = {
      boolean: "Yes/No",
      string: "Text",
      select: "Multiple Choice",
    };
    return typeMap[type] || type;
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Qualifications & Requirements
        </h2>
        <p className="text-gray-600">
          Review required qualifications, preferred skills, and custom screening
          questions.
        </p>
      </div>

      {/* Required Qualifications */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Required Qualifications
          </h3>
          <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 border border-red-200 rounded-full">
            <span className="text-xs font-medium text-red-700">
              {formData.requiredQualifications?.length || 0}
            </span>
          </div>
        </div>

        {!formData.requiredQualifications ||
        formData.requiredQualifications.length === 0 ? (
          <div className="flex justify-end">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full shadow-sm">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span className="text-sm font-medium text-amber-800">
                Consider adding essential requirements for the role
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {formData.requiredQualifications.map((qual, index) => {
              const scoreInfo = formatQualificationScore(qual.score || 0);
              return (
                <div
                  key={index}
                  className="p-4 bg-gray-50 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <p className="text-gray-700 text-sm font-medium flex-1">
                      {qual.text}
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-200 rounded-full">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      <span className="text-xs font-medium text-red-700">
                        {scoreInfo.label}
                      </span>
                    </div>
                  </div>
                  {qual.score !== undefined && (
                    <p className="text-xs text-gray-500 mt-2">
                      Score: {qual.score}/100
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Preferred Qualifications */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Preferred Qualifications
          </h3>
          <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded-full">
            <span className="text-xs font-medium text-blue-700">
              {formData.preferredQualifications?.length || 0}
            </span>
          </div>
        </div>

        {!formData.preferredQualifications ||
        formData.preferredQualifications.length === 0 ? (
          <div className="text-gray-400 italic text-sm">
            No preferred qualifications specified.
          </div>
        ) : (
          <div className="space-y-3">
            {formData.preferredQualifications.map((qual, index) => {
              const scoreInfo = formatQualificationScore(qual.score || 0);
              return (
                <div
                  key={index}
                  className="p-4 bg-gray-50 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <p className="text-gray-700 text-sm font-medium flex-1">
                      {qual.text}
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span className="text-xs font-medium text-blue-700">
                        {scoreInfo.label}
                      </span>
                    </div>
                  </div>
                  {qual.score !== undefined && (
                    <p className="text-xs text-gray-500 mt-2">
                      Score: {qual.score}/100
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Job Requirements */}
      {formData.jobRequirements && formData.jobRequirements.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Job Requirements
            </h3>
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
              <span className="text-xs font-medium text-emerald-700">
                {formData.jobRequirements.length}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            {formData.jobRequirements.map((req, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <p className="text-gray-700 text-sm font-medium">{req}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Screening Questions */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            Custom Screening Questions
          </h3>
          <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 border border-purple-200 rounded-full">
            <span className="text-xs font-medium text-purple-700">
              {formData.customQuestions?.length || 0}
            </span>
          </div>
        </div>

        {!formData.customQuestions || formData.customQuestions.length === 0 ? (
          <div className="text-gray-400 italic text-sm">
            No custom screening questions added.
          </div>
        ) : (
          <div className="space-y-4">
            {formData.customQuestions.map((question, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 border border-gray-200 rounded-lg"
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="text-gray-700 text-sm font-medium flex-1">
                    {question.question}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 border border-gray-200 rounded-full">
                      <span className="text-xs font-medium text-gray-700">
                        {formatQuestionType(question.type)}
                      </span>
                    </div>
                    {question.required && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 border border-red-200 rounded-full">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                        <span className="text-xs font-medium text-red-700">
                          Required
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {question.type === "select" && question.options && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">Options:</p>
                    <div className="space-y-1">
                      {question.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className="text-xs text-gray-600 bg-white px-3 py-2 rounded border border-gray-200"
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {question.placeholder && (
                  <p className="text-xs text-gray-500 mt-2">
                    Placeholder: {question.placeholder}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Validation Warnings */}
      {formData.customQuestions &&
        formData.customQuestions.some(
          (q) => q.type === "select" && (!q.options || q.options.length < 2)
        ) && (
          <div className="flex justify-end">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full shadow-sm">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span className="text-sm font-medium text-amber-800">
                Multiple choice questions need at least 2 options
              </span>
            </div>
          </div>
        )}
    </div>
  );
}
