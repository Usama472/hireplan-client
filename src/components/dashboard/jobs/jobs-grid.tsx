import { ROUTES } from "@/constants";
import { JobCard } from "./job-card";
import type { Job } from "@/interfaces";
import { useNavigate } from "react-router";

interface JobsGridProps {
  jobs: Job[];
  onEdit?: (job: Job) => void;
  onDelete?: (job: Job) => void;
}

export function JobsGrid({ jobs, onEdit, onDelete }: JobsGridProps) {
  const navigate = useNavigate();
  const handleViewDetails = (id: string) => {
    navigate(`${ROUTES.DASHBOARD.VIEW_JOB}/${id}`);
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewDetails={() => handleViewDetails(job.id)}
        />
      ))}
    </div>
  );
}
