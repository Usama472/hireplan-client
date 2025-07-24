import type { Job } from "@/interfaces";
import { JobListItem } from "./job-list-item";
import { ROUTES } from "@/constants";
import { useNavigate } from "react-router";

interface JobsListProps {
  jobs: Job[];
  onEdit?: (job: Job) => void;
  onDelete?: (job: Job) => void;
}

export function JobsList({ jobs, onEdit, onDelete }: JobsListProps) {
  const navigate = useNavigate();
  const handleViewDetails = (id: string) => {
    navigate(`${ROUTES.DASHBOARD.VIEW_JOB}/${id}`);
  };
  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <JobListItem
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
