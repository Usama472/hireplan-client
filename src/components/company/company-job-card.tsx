import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { JobFormDataWithId } from "@/interfaces";
import {
  Briefcase,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  Building,
  CheckCircle,
  Users,
} from "lucide-react";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface CompanyJobCardProps {
  job: JobFormDataWithId;
  onApply?: () => void;
}

const formatSalary = (payRate: JobFormDataWithId["payRate"]) => {
  if (!payRate) return "Salary not specified";
  
  if (payRate.type === "range" && payRate.min && payRate.max) {
    return `$${payRate.min.toLocaleString()} - $${payRate.max.toLocaleString()}`;
  }
  
  if (payRate.type === "exact-amount" && payRate.min) {
    return `$${payRate.min.toLocaleString()}`;
  }
  
  if (payRate.type === "starting-amount" && payRate.min) {
    return `Starting at $${payRate.min.toLocaleString()}`;
  }
  
  if (payRate.type === "maximum-amount" && payRate.max) {
    return `Up to $${payRate.max.toLocaleString()}`;
  }
  
  return "Competitive salary";
};

const CompanyJobCard: React.FC<CompanyJobCardProps> = ({ job, onApply }) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const location = job.jobLocation
    ? `${job.jobLocation.city}, ${job.jobLocation.state}`
    : "Remote";

  const formattedDate = job.endDate 
    ? new Date(job.endDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "Open";

  const handleApplyClick = () => {
    const applyUrl = `/company/${slug}/job/${job.id}/apply`;
    navigate(applyUrl);
    if (onApply) onApply();
  };

  const cleanDescription = job.jobDescription
    .replace(/<[^>]*>/g, '')
    .replace(/\n/g, ' ')
    .trim();

  const truncatedDescription = job.jobDescription.length > 200 
    ? job.jobDescription.substring(0, 200) + '...' 
    : job.jobDescription;

  return (
    <Card className="group relative bg-white border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md rounded-lg overflow-hidden">
      {/* Header Strip */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
              <Briefcase className="h-4 w-4 text-gray-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 leading-tight">
                {job.jobBoardTitle}
              </h3>
              <div className="flex items-center gap-4 text-base text-gray-600 mt-1">
                <div className="flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  <span>{job.employmentType || "Full-time"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{location}</span>
                </div>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="bg-white text-gray-700 border-gray-300 text-sm">
            {job.workplaceType || "On-site"}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Description */}
        <div className="mb-4">
          <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
            <div 
              className="text-gray-700 text-base leading-relaxed prose prose-base max-w-none
                         prose-ul:my-2 prose-li:my-1 prose-p:my-2 prose-strong:text-gray-900
                         prose-ul:pl-4 prose-li:pl-0"
              dangerouslySetInnerHTML={{
                __html: isExpanded ? job.jobDescription : truncatedDescription
              }}
            />
          </div>
          {cleanDescription.length > 200 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 hover:text-purple-600 hover:bg-blue-50 mt-3 h-8 px-3 text-sm font-medium"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </Button>
          )}
        </div>

        {/* Key Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Salary
              </span>
            </div>
            <p className="text-base font-semibold text-gray-900">
              {formatSalary(job.payRate)}
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Apply By
              </span>
            </div>
            <p className="text-base font-semibold text-gray-900">
              {formattedDate}
            </p>
          </div>
        </div>

        {/* Requirements */}
        {job.jobRequirements && job.jobRequirements.length > 0 && (
          <div className="mb-4">
            <h4 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Requirements
            </h4>
            <div className="space-y-2">
              {job.jobRequirements.slice(0, 3).map((req, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-base text-gray-600 leading-relaxed">{req}</span>
                </div>
              ))}
              {job.jobRequirements.length > 3 && (
                <p className="text-sm text-gray-500 ml-3 font-medium">
                  +{job.jobRequirements.length - 3} more requirements
                </p>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-3 w-3" />
            <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
          </div>
          <Button 
            onClick={handleApplyClick}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 text-base font-medium rounded-lg transition-all shadow-lg hover:shadow-xl"
          >
            Apply Now
          </Button>
        </div>
      </div>

      {/* Subtle hover indicator */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 group-hover:opacity-30 transition-opacity duration-200 pointer-events-none" />
    </Card>
  );
};

export default CompanyJobCard;