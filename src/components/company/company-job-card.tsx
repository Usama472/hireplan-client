import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { JobFormDataWithId } from "@/interfaces";
import {
  Briefcase,
  Calendar,
  DollarSign,
  MapPin,
  CheckCircle,
  Star,
} from "lucide-react";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";

interface CompanyJobCardProps {
  job: JobFormDataWithId;
  onApply?: () => void;
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

const formatPayType = (payType: JobFormDataWithId["payType"]) => {
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

const getPriorityColor = (status: JobFormDataWithId["jobStatus"]) => {
  const statusColors: Record<string, { background: string; color: string }> = {
    low: { background: "#dbeafe", color: "#1e40af" },
    medium: { background: "#fef3c7", color: "#92400e" },
    high: { background: "#ffedd5", color: "#9a3412" },
    urgent: { background: "#fee2e2", color: "#991b1b" },
  };

  return statusColors[status] || { background: "#f3f4f6", color: "#1f2937" };
};

const getWorkplaceTypeIcon = (type: JobFormDataWithId["workplaceType"]) => {
  switch (type) {
    case "remote":
      return "🌐";
    case "hybrid":
      return "🏠/🏢";
    case "onsite":
      return "🏢";
    default:
      return "🏢";
  }
};

const CompanyJobCard: React.FC<CompanyJobCardProps> = ({ job, onApply }) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const location = job.jobLocation
    ? `${job.jobLocation.city}, ${job.jobLocation.state}`
    : "Location not specified";

  const formattedDate = new Date(job.endDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const priorityStyle = getPriorityColor(job.jobStatus);

  const handleApplyClick = () => {
    const applyUrl = `/company/${slug}/job/${job.id}/apply`;
    navigate(applyUrl);

    if (onApply) onApply();
  };

  return (
    <Card
      className="rounded-md shadow-none"
      style={{
        overflow: "hidden",
        border: "1px solid #e2e8f0",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        backgroundColor: "#ffffff",
        marginBottom: "1.5rem",
        position: "relative",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "#cbd5e1";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "#e2e8f0";
      }}
    >
      {/* Header Section */}
      <div
        style={{
          backgroundColor: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
          padding: "2rem",
        }}
      >
        <h3
          style={{
            fontSize: "1.75rem",
            fontWeight: "700",
            color: "#0f172a",
            lineHeight: "1.3",
            margin: "0",
            marginBottom: "1.5rem",
          }}
        >
          {job.jobBoardTitle}
        </h3>

        {/* Quick Info Tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              padding: "0.5rem 0.875rem",
              borderRadius: "0.75rem",
              fontSize: "0.875rem",
              fontWeight: "600",
              color: "#374151",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            }}
          >
            <Briefcase
              style={{ height: "1rem", width: "1rem", color: "#6b7280" }}
            />
            <span style={{ textTransform: "capitalize" }}>
              {job.employmentType.replace("-", " ")}
            </span>
          </div>

          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              padding: "0.5rem 0.875rem",
              borderRadius: "0.75rem",
              fontSize: "0.875rem",
              fontWeight: "600",
              color: "#374151",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            }}
          >
            <span style={{ fontSize: "1rem" }}>
              {getWorkplaceTypeIcon(job.workplaceType)}
            </span>
            <span style={{ textTransform: "capitalize" }}>
              {job.workplaceType}
            </span>
          </div>

          {job.workplaceType !== "remote" && (
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                padding: "0.5rem 0.875rem",
                borderRadius: "0.75rem",
                fontSize: "0.875rem",
                fontWeight: "600",
                color: "#374151",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
              }}
            >
              <MapPin
                style={{ height: "1rem", width: "1rem", color: "#6b7280" }}
              />
              <span>{location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div style={{ padding: "2rem" }}>
        {/* Salary Information */}
        <div
          style={{
            marginBottom: "1.5rem",
            padding: "1rem 1.25rem",
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "0.75rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <DollarSign
            style={{ height: "1.25rem", width: "1.25rem", color: "#10b981" }}
          />
          <div>
            <div
              style={{ fontSize: "1rem", fontWeight: "700", color: "#065f46" }}
            >
              {formatSalary(job.payRate)} {formatPayType(job.payType)}
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div style={{ marginBottom: "2rem" }}>
          <h4
            style={{
              fontSize: "1.25rem",
              fontWeight: "700",
              color: "#0f172a",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <div
              style={{
                width: "0.25rem",
                height: "1.5rem",
                backgroundColor: "#3b82f6",
                borderRadius: "0.125rem",
              }}
            ></div>
            About this role
          </h4>
          <div
            style={{
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "0.75rem",
              padding: "1.25rem",
              maxHeight: "16rem",
              overflowY: "auto",
              fontSize: "1rem",
              lineHeight: "1.7",
              color: "#374151",
            }}
          >
            <div
              style={{
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
              dangerouslySetInnerHTML={{
                __html: job.jobDescription
                  .replace(/<[^>]*>?/gm, "")
                  .replace(/\n/g, "<br>"),
              }}
            />
          </div>
        </div>

        {/* Required Qualifications */}
        {job.requiredQualifications &&
          job.requiredQualifications.length > 0 && (
            <div style={{ marginBottom: "2rem" }}>
              <h4
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "700",
                  color: "#0f172a",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <CheckCircle
                  style={{
                    height: "1.25rem",
                    width: "1.25rem",
                    color: "#10b981",
                  }}
                />
                Required Qualifications
              </h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.875rem",
                }}
              >
                {job.requiredQualifications.slice(0, 4).map((qual, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "1rem",
                      padding: "1rem",
                      backgroundColor: "#f8fafc",
                      borderRadius: "0.75rem",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        width: "0.5rem",
                        height: "0.5rem",
                        backgroundColor: "#10b981",
                        borderRadius: "50%",
                        marginTop: "0.625rem",
                        flexShrink: 0,
                      }}
                    ></div>
                    <span
                      style={{
                        fontSize: "1rem",
                        color: "#374151",
                        lineHeight: "1.6",
                        fontWeight: "500",
                      }}
                    >
                      {qual.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Preferred Qualifications */}
        {job.preferredQualifications &&
          job.preferredQualifications.length > 0 && (
            <div style={{ marginBottom: "2rem" }}>
              <h4
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "700",
                  color: "#0f172a",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <Star
                  style={{
                    height: "1.25rem",
                    width: "1.25rem",
                    color: "#f59e0b",
                  }}
                />
                Preferred Qualifications
              </h4>
              <div
                style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}
              >
                {job.preferredQualifications.slice(0, 6).map((qual, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "0.75rem 1rem",
                      backgroundColor: "#fef3c7",
                      color: "#92400e",
                      fontSize: "0.95rem",
                      fontWeight: "600",
                      borderRadius: "0.75rem",
                      border: "1px solid #fcd34d",
                    }}
                  >
                    {qual.text}
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "2rem",
            borderTop: "1px solid #e2e8f0",
            marginTop: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "#64748b",
              fontSize: "0.875rem",
              fontWeight: "500",
            }}
          >
            <Calendar
              style={{
                height: "1rem",
                width: "1rem",
                marginRight: "0.5rem",
                color: "#94a3b8",
              }}
            />
            <span>Apply by {formattedDate}</span>
          </div>

          <Button
            onClick={handleApplyClick}
            className="rounded-md shadow-none"
            style={{
              backgroundColor: "#1f2937",
              color: "white",
              paddingLeft: "2rem",
              paddingRight: "2rem",
              paddingTop: "1rem",
              paddingBottom: "1rem",
              fontSize: "1rem",
              fontWeight: "600",
              border: "none",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              cursor: "pointer",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#111827";
              e.currentTarget.style.boxShadow = "none";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#1f2937";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Apply Now
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CompanyJobCard;
