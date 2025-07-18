import { JobCard } from './job-card'
import type { Job } from '@/interfaces'

interface JobsGridProps {
  jobs: Job[]
  onEdit?: (job: Job) => void
  onDuplicate?: (job: Job) => void
  onArchive?: (job: Job) => void
  onDelete?: (job: Job) => void
}

export function JobsGrid({
  jobs,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
}: JobsGridProps) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onArchive={onArchive}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
