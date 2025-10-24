import type { JobFormDataWithId } from "@/interfaces";
import { JobListItem } from "./job-list-item";
import { ROUTES } from "@/constants";
import { useNavigate } from "react-router";

interface JobsListProps {
  jobs: JobFormDataWithId[];
  onEdit?: (job: JobFormDataWithId) => void;
  onDelete?: (job: JobFormDataWithId) => void;
  onClose?: (job: JobFormDataWithId) => void;
}

export function JobsList({ jobs, onEdit, onDelete, onClose }: JobsListProps) {
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
          onClose={onClose}
          onViewDetails={() => handleViewDetails(job.id)}
        />
      ))}
    </div>
  );
}
