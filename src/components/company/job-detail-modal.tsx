import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import type { JobFormDataWithId } from "@/interfaces";
import {
  Briefcase,
  Calendar,
  DollarSign,
  MapPin,
  X,
  Building,
  Clock,
  CheckCircle,
  Star,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef } from "react";

interface JobDetailModalProps {
  job: JobFormDataWithId | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatSalary = (payRate: JobFormDataWithId["payRate"]) => {
  if (payRate.type === "exact-amount" && "amount" in payRate) {
    return `$${payRate.amount.toLocaleString()}`;
  } else if (payRate.type === "range" && "min" in payRate && "max" in payRate) {
    return `$${payRate.min.toLocaleString()} - $${payRate.max.toLocaleString()}`;
  } else if (payRate.type === "starting-amount" && "amount" in payRate) {
    return `Starting at $${payRate.amount.toLocaleString()}`;
  } else if (payRate.type === "maximum-amount" && "amount" in payRate) {
    return `Up to $${payRate.amount.toLocaleString()}`;
  }
  return "Competitive";
};

const formatPayType = (payType?: JobFormDataWithId["payType"]) => {
  if (!payType) return "";
  const payTypeMap: Record<string, string> = {
    hourly: "per hour",
    salary: "per year",
    "base-commission": "base + commission",
    "base-tips": "base + tips",
    "base-bonus": "base + bonus",
    "commission-only": "commission only",
    other: "",
  };
  return payTypeMap[payType] || "";
};

export default function JobDetailModal({
  job,
  open,
  onOpenChange,
}: JobDetailModalProps) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reset scroll to top when modal opens
  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [open]);

  if (!job) return null;

  const location = job.jobLocation
    ? `${job.jobLocation.city}, ${job.jobLocation.state}`
    : "Remote";

  const handleApplyClick = () => {
    const applyUrl = `/company/${slug}/job/${job.id}/apply`;
    navigate(applyUrl);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <style>
        {`
          [data-radix-dialog-overlay] {
            z-index: 9998 !important;
          }
          [data-radix-dialog-content] {
            z-index: 9999 !important;
          }
        `}
      </style>
      <DialogContent 
        className="!max-w-7xl w-[90vw] h-[80vh] p-0 gap-0 border-none sm:!max-w-7xl !z-[9999] !fixed" 
        style={{ zIndex: 9999 }}
        showCloseButton={false}
      >
        {/* Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-6 right-6 z-[10000] p-3 bg-white hover:bg-gray-100 rounded-full shadow-xl transition-all"
          style={{ zIndex: 10000 }}
        >
          <X className="h-7 w-7 text-gray-700" />
        </button>

        {/* Full Scrollable Content */}
        <div ref={scrollRef} className="h-full overflow-y-auto">
          {/* Header Section */}
          <div className="px-8 py-8 bg-gray-50">
            <h1 className="text-4xl font-bold text-gray-900 mb-6 pr-16">{job.jobBoardTitle}</h1>

            <div className="flex flex-wrap gap-4">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-gray-300 rounded-lg text-lg font-semibold text-gray-800">
                <Briefcase className="h-6 w-6" />
                <span className="capitalize">{job.employmentType?.replace("-", " ")}</span>
              </div>

              <div className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-gray-300 rounded-lg text-lg font-semibold text-gray-800">
                <Building className="h-6 w-6" />
                <span className="capitalize">{job.workplaceType}</span>
              </div>

              {job.workplaceType !== "remote" && (
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-gray-300 rounded-lg text-lg font-semibold text-gray-800">
                  <MapPin className="h-6 w-6" />
                  <span>{location}</span>
                </div>
              )}

              <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-100 border border-green-300 rounded-lg text-lg font-bold text-green-800">
                <DollarSign className="h-6 w-6" />
                {formatSalary(job.payRate)} {formatPayType(job.payType)}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-8 py-8 space-y-8">
            {/* Job Description */}
            <div className="pb-8 border-b border-gray-200">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">About This Role</h3>
              <div
                className="text-xl text-gray-800 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: job.jobDescription.replace(/\n/g, "<br>"),
                }}
              />
            </div>

            {/* Required Qualifications */}
            {job.requiredQualifications && job.requiredQualifications.length > 0 && (
              <div className="pb-8 border-b border-gray-200">
                <h3 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                  Required Qualifications
                </h3>
                <div className="space-y-4">
                  {job.requiredQualifications.map((qual, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-6 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                      <div className="w-4 h-4 bg-blue-600 rounded-full mt-1 flex-shrink-0"></div>
                      <span className="text-xl text-gray-800 leading-relaxed">
                        {qual.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preferred Qualifications */}
            {job.preferredQualifications && job.preferredQualifications.length > 0 && (
              <div className="pb-8 border-b border-gray-200">
                <h3 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Star className="h-8 w-8 text-amber-600" />
                  Preferred Qualifications
                </h3>
                <div className="flex flex-wrap gap-4">
                  {job.preferredQualifications.map((qual, index) => (
                    <div
                      key={index}
                      className="px-6 py-3 bg-amber-50 border border-amber-200 rounded-lg text-lg font-semibold text-amber-800"
                    >
                      {qual.text}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Job Requirements */}
            {job.jobRequirements && job.jobRequirements.length > 0 && (
              <div className="pb-8 border-b border-gray-200">
                <h3 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Clock className="h-8 w-8 text-gray-600" />
                  Additional Requirements
                </h3>
                <div className="flex flex-wrap gap-4">
                  {job.jobRequirements.map((req, index) => (
                    <div
                      key={index}
                      className="px-6 py-3 bg-gray-50 border border-gray-200 rounded-lg text-lg font-semibold text-gray-800"
                    >
                      {req}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Application Deadline */}
            {job.endDate && (
              <div className="pb-8 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-lg font-medium text-gray-600">Application Deadline</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {new Date(job.endDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Apply Button at Bottom of Scroll */}
            <div className="pt-6 sticky bottom-0 bg-white">
              <Button
                onClick={handleApplyClick}
                className="w-full h-16 text-2xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              >
                Apply Now →
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

