import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { JobFormDataWithId } from "@/interfaces";
import { Briefcase, Calendar, DollarSign, MapPin } from "lucide-react";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";

interface CompanyJobCardProps {
  job: JobFormDataWithId;
  onApply?: () => void;
}

const formatSalary = (payRate: JobFormDataWithId["payRate"]) => {
  if (payRate.type === "fixed" && payRate.amount) {
    return `$${payRate.amount.toLocaleString()}`;
  } else if (payRate.type === "range" && payRate.min && payRate.max) {
    return `$${payRate.min.toLocaleString()} - $${payRate.max.toLocaleString()}`;
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
      style={{
        overflow: "hidden",
        border: "1px solid #e5e7eb",
        borderRadius: "0.75rem",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        transition: "all 0.3s ease",
        backgroundColor: "#ffffff",
        marginTop: "2rem",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.boxShadow =
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.boxShadow =
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ padding: "2.5rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "1.5rem",
          }}
        >
          <h3
            style={{
              fontSize: "2.125rem",
              fontWeight: "bold",
              color: "#111827",
              lineHeight: "1.2",
              letterSpacing: "-0.025em",
            }}
          >
            {job.jobBoardTitle}
          </h3>
          <Badge
            style={{
              background: priorityStyle.background,
              color: priorityStyle.color,
              textTransform: "capitalize",
              fontSize: "1.125rem",
              padding: "0.625rem 1rem",
              borderRadius: "9999px",
              fontWeight: "600",
            }}
          >
            {job.jobStatus}
          </Badge>
        </div>

        {job.company && (
          <div
            style={{
              marginBottom: "1.5rem",
              color: "#374151",
              fontWeight: "500",
              fontSize: "1.5rem",
            }}
          >
            {job.company}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "1.5rem",
            marginBottom: "1.75rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "#4b5563",
              fontSize: "1.375rem",
            }}
          >
            <MapPin
              style={{
                height: "1.75rem",
                width: "1.75rem",
                marginRight: "0.875rem",
                color: "#6b7280",
              }}
            />
            <span>{location}</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "#4b5563",
              fontSize: "1.375rem",
            }}
          >
            <Briefcase
              style={{
                height: "1.75rem",
                width: "1.75rem",
                marginRight: "0.875rem",
                color: "#6b7280",
              }}
            />
            <span style={{ textTransform: "capitalize" }}>
              {job.employmentType.replace("-", " ")}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "#4b5563",
              fontSize: "1.375rem",
            }}
          >
            <span style={{ marginRight: "0.875rem", fontSize: "1.75rem" }}>
              {getWorkplaceTypeIcon(job.workplaceType)}
            </span>
            <span style={{ textTransform: "capitalize" }}>
              {job.workplaceType}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "#4b5563",
              fontSize: "1.375rem",
            }}
          >
            <DollarSign
              style={{
                height: "1.75rem",
                width: "1.75rem",
                marginRight: "0.875rem",
                color: "#6b7280",
              }}
            />
            <span>
              {formatSalary(job.payRate)} {formatPayType(job.payType)}
            </span>
          </div>
        </div>

        <div style={{ marginBottom: "1.75rem" }}>
          <p
            style={{
              color: "#4b5563",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              fontSize: "1.375rem",
              lineHeight: "1.7",
            }}
          >
            {job.jobDescription.replace(/<[^>]*>?/gm, "")}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "1.75rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid #f3f4f6",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "#6b7280",
              fontSize: "1.25rem",
            }}
          >
            <Calendar
              style={{
                height: "1.5rem",
                width: "1.5rem",
                marginRight: "0.625rem",
              }}
            />
            <span>Apply by {formattedDate}</span>
          </div>

          <Button
            onClick={handleApplyClick}
            style={{
              backgroundColor: "#2563eb",
              color: "white",
              paddingLeft: "2rem",
              paddingRight: "2rem",
              paddingTop: "0.875rem",
              paddingBottom: "0.875rem",
              borderRadius: "0.5rem",
              fontSize: "1.375rem",
              fontWeight: "600",
              boxShadow:
                "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#1d4ed8";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#2563eb";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)";
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
