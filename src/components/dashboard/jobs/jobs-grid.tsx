import { ROUTES } from "@/constants";
import { JobCard } from "./job-card";
import type { JobFormDataWithId } from "@/interfaces";
import { useNavigate } from "react-router";
import React from "react";

interface JobsGridProps {
  jobs: JobFormDataWithId[];
  onEdit?: (job: JobFormDataWithId) => void;
  onDelete?: (job: JobFormDataWithId) => void;
  onClose?: (job: JobFormDataWithId) => void;
}

export const JobsGrid = React.memo(function JobsGrid({ jobs, onEdit, onDelete, onClose }: JobsGridProps) {
  const navigate = useNavigate();
  const handleViewDetails = (id: string) => {
    navigate(`${ROUTES.DASHBOARD.VIEW_JOB}/${id}`);
  };

  // Memoize each job object to prevent reference changes
  const memoizedJobs = React.useMemo(() => 
    jobs.map(job => ({
      ...job,
      // Ensure stable references for nested objects
      payRate: job.payRate ? { ...job.payRate } : null,
      jobLocation: job.jobLocation ? { ...job.jobLocation } : null,
    })), 
    [jobs.map(j => j.id).join(','), jobs.map(j => j.applicantsCount).join(',')]
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {memoizedJobs.map((job, index) => (
            <JobCard
              key={`job-${job.id}-stable`} 
              job={job}
              onEdit={onEdit}
              onDelete={onDelete}
              onClose={onClose}
              onViewDetails={() => handleViewDetails(job.id)}
            />
          ))}
    </div>
  );
});
