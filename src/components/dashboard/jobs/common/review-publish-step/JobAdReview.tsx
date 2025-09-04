import { Button } from "@/components/ui/button";
import type { JobFormData } from "@/interfaces";
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";

interface JobAdReviewProps {
  formData: JobFormData;
}

export function JobAdReview({ formData }: JobAdReviewProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const getDescriptionPreview = (description: string) => {
    if (!description) return "No description provided";
    return description;
  };

  const description = getDescriptionPreview(formData.jobDescription || "");
  const shouldShowReadMore = description.length > 300;
  const displayText = isDescriptionExpanded
    ? description
    : description.substring(0, 300) + (shouldShowReadMore ? "..." : "");

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Job Overview</h2>
        <p className="text-gray-600">
          Review your job posting details including titles, description, and
          screening requirements.
        </p>
      </div>

      {/* Job Titles */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Internal Title
            </h3>
            <div className="text-gray-600 text-lg font-medium">
              {formData.jobTitle || (
                <span className="text-gray-400 italic">Not provided</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Job Board Title
            </h3>
            <div className="text-gray-600 text-lg font-medium">
              {formData.jobBoardTitle || (
                <span className="text-gray-400 italic">Not provided</span>
              )}
            </div>
            {formData.jobBoardTitle && (
              <span className="text-sm text-gray-500">
                {formData.jobBoardTitle.length}/60 characters
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Job Description */}
      <div className="space-y-4">
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="prose prose-sm max-w-none">
            <div
              className="text-gray-700 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: displayText }}
            />
          </div>

          {shouldShowReadMore && (
            <div className="flex justify-end mt-4">
              <Button
                type="button"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDescriptionExpanded(!isDescriptionExpanded);
                }}
                className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 hover:text-gray-900 transition-none shadow-none border border-gray-200"
              >
                {isDescriptionExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Read More
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {formData.jobDescription && formData.jobDescription.length < 100 && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                Consider adding more detail
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Longer job descriptions (100+ characters) typically receive
                better candidate engagement and more qualified applications.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Background Screening */}
      {formData.backgroundScreeningDisclaimer && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-800">
                Background screening disclaimer enabled
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
