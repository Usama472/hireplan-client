import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Target,
  HelpCircle,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
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
    <div className="space-y-6">
      {/* Required Qualifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Required Qualifications
            <Badge variant="destructive" className="ml-2 text-white">
              {formData.requiredQualifications?.length || 0}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!formData.requiredQualifications ||
          formData.requiredQualifications.length === 0 ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                No required qualifications specified. Consider adding essential
                requirements for the role.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {formData.requiredQualifications.map((qual, index) => {
                const scoreInfo = formatQualificationScore(qual.score || 0);
                return (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <p className="text-sm text-gray-900 flex-1">
                        {qual.text}
                      </p>
                      <Badge
                        variant={scoreInfo.color}
                        className="ml-2 text-white"
                      >
                        {scoreInfo.label}
                      </Badge>
                    </div>
                    {qual.score !== undefined && (
                      <p className="text-xs text-gray-500 mt-1">
                        Score: {qual.score}/100
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preferred Qualifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Preferred Qualifications
            <Badge variant="outline" className="ml-2">
              {formData.preferredQualifications?.length || 0}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!formData.preferredQualifications ||
          formData.preferredQualifications.length === 0 ? (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600">
                No preferred qualifications specified.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {formData.preferredQualifications.map((qual, index) => {
                const scoreInfo = formatQualificationScore(qual.score || 0);
                return (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <p className="text-sm text-gray-900 flex-1">
                        {qual.text}
                      </p>
                      <Badge variant={scoreInfo.color} className="ml-2">
                        {scoreInfo.label}
                      </Badge>
                    </div>
                    {qual.score !== undefined && (
                      <p className="text-xs text-gray-500 mt-1">
                        Score: {qual.score}/100
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Requirements */}
      {formData.jobRequirements && formData.jobRequirements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Job Requirements
              <Badge variant="default" className="ml-2">
                {formData.jobRequirements.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {formData.jobRequirements.map((req, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-900">{req}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Custom Screening Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Custom Screening Questions
            <Badge variant="secondary" className="ml-2">
              {formData.customQuestions?.length || 0}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!formData.customQuestions ||
          formData.customQuestions.length === 0 ? (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600">
                No custom screening questions added.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.customQuestions.map((question, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-medium text-gray-900">
                      {question.question}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {formatQuestionType(question.type)}
                      </Badge>
                      {question.required && (
                        <Badge variant="destructive" className="text-white">
                          Required
                        </Badge>
                      )}
                    </div>
                  </div>

                  {question.type === "select" && question.options && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-600 mb-2">Options:</p>
                      <div className="space-y-1">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className="text-xs text-gray-700 bg-white px-2 py-1 rounded"
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
        </CardContent>
      </Card>

      {/* Validation Warnings */}
      {formData.customQuestions &&
        formData.customQuestions.some(
          (q) => q.type === "select" && (!q.options || q.options.length < 2)
        ) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Validation Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 font-medium">
                  Multiple choice questions need at least 2 options
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Please review and update your custom questions before
                  publishing.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
